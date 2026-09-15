"""Authenticated, durable, single-consumer build queue. Run one ASGI worker."""
import asyncio
import base64
import hashlib
import hmac
import io
import json
import os
import re
import sqlite3
from contextlib import asynccontextmanager, suppress
from pathlib import Path
from typing import Any, Awaitable, Callable

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from PIL import Image

from assembler import OutputValidationError, planned_pages, validate_draft

MAX_BODY = 70 * 1024 * 1024
MAX_OUTPUT = 8 * 1024 * 1024
BUILD_TIMEOUT = 1200
Build = Callable[[dict[str, Any]], Awaitable[dict[str, str]]]


def validate_request(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict) or not {"id", "draft", "designImages"} <= set(value) or set(value) - {"id", "draft", "designImages", "referenceAssets"}:
        raise ValueError("Invalid build request")
    if not isinstance(value["id"], str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,99}", value["id"]):
        raise ValueError("Invalid build ID")
    validate_draft(value["draft"])
    images = value["designImages"]
    if not isinstance(images, dict) or set(images) != set(planned_pages(value["draft"])):
        raise ValueError("Design images must exactly match the approved page plan")
    references = value.get("referenceAssets", {})
    allowed_references = {product.get('imageAssetId') for product in value['draft']['products']} | {value['draft']['company'].get('logoAssetId')}
    allowed_references.discard(None)
    if not isinstance(references, dict) or not set(references) <= allowed_references:
        raise ValueError("Only approved product and logo reference assets are accepted")
    for data_url in [*images.values(), *references.values()]:
        if not isinstance(data_url, str):
            raise ValueError("Invalid design image")
        match = re.fullmatch(r"data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)", data_url)
        if not match:
            raise ValueError("Design images must be base64 PNG, JPEG or WebP data URLs")
        try:
            raw = base64.b64decode(match[2], validate=True)
            with Image.open(io.BytesIO(raw)) as image:
                if image.format != {"png": "PNG", "jpeg": "JPEG", "webp": "WEBP"}[match[1]]:
                    raise ValueError("Image format mismatch")
                if image.width * image.height > 40_000_000:
                    raise ValueError("Image dimensions exceed limit")
                image.verify()
        except Exception:
            raise ValueError("Invalid design image") from None
    return value


class JobStore:
    def __init__(self, path: str | Path):
        self.path = str(path)
        Path(path).parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        fd = os.open(path, os.O_CREAT | os.O_WRONLY, 0o600)
        os.close(fd)
        with self.connect() as db:
            db.execute("PRAGMA journal_mode=WAL")
            db.execute("CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, digest TEXT NOT NULL, input TEXT NOT NULL, state TEXT NOT NULL, files TEXT, message TEXT)")
        os.chmod(path, 0o600)

    def connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.path, timeout=30)

    def accept(self, payload: dict[str, Any]) -> None:
        source = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)
        digest = hashlib.sha256(source.encode()).hexdigest()
        with self.connect() as db:
            db.execute("INSERT OR IGNORE INTO jobs (id,digest,input,state) VALUES (?,?,?,'queued')", (payload["id"], digest, source))
            row = db.execute("SELECT digest FROM jobs WHERE id=?", (payload["id"],)).fetchone()
            if row[0] != digest:
                raise ValueError("Build ID already has different input")

    def recover(self) -> None:
        with self.connect() as db:
            db.execute("UPDATE jobs SET state='failed', message='Build interrupted by service restart; create a new build to retry.' WHERE state='running'")

    def next(self) -> dict[str, Any] | None:
        with self.connect() as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT id,input FROM jobs WHERE state='queued' ORDER BY rowid LIMIT 1").fetchone()
            if not row:
                return None
            db.execute("UPDATE jobs SET state='running' WHERE id=?", (row[0],))
            return json.loads(row[1])

    def finish(self, job_id: str, files: dict[str, str] | None, message: str | None = None) -> None:
        with self.connect() as db:
            db.execute("UPDATE jobs SET state=?,files=?,message=? WHERE id=? AND state='running'", ("succeeded" if files is not None else "failed", json.dumps(files) if files is not None else None, message, job_id))

    def get(self, job_id: str) -> dict[str, Any] | None:
        with self.connect() as db:
            row = db.execute("SELECT state,files,message FROM jobs WHERE id=?", (job_id,)).fetchone()
        if not row:
            return None
        state = row[0]
        result: dict[str, Any] = {"state": "pending" if state in ("queued", "running") else state}
        if row[1] is not None:
            result["files"] = json.loads(row[1])
        if row[2]:
            result["message"] = row[2]
        if state in ("queued", "running"):
            result["progress"] = "Waiting for builder" if state == "queued" else "Converting approved designs"
        return result


def create_app(db_path: str | Path | None = None, key: str | None = None, build: Build | None = None) -> FastAPI:
    secret = key if key is not None else os.environ.get("SITE_BUILDER_KEY", "")
    path = db_path or os.environ.get("SITE_BUILDER_DB", "./data/builds.sqlite3")
    wake = asyncio.Event()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        if not secret:
            raise RuntimeError("SITE_BUILDER_KEY is required")
        store = JobStore(path)
        store.recover()
        application.state.store = store
        generate = build
        if generate is None:
            from builder import build_site, initialize_vendor
            await initialize_vendor()
            generate = build_site

        async def consume():
            while True:
                wake.clear()
                payload = store.next()
                if payload is None:
                    await wake.wait()
                    continue
                try:
                    files = await asyncio.wait_for(generate(payload), timeout=BUILD_TIMEOUT)
                    if not isinstance(files, dict) or not files or any(not isinstance(k, str) or not isinstance(v, str) for k, v in files.items()):
                        raise ValueError("Invalid output")
                    if sum(len(k.encode()) + len(v.encode()) for k, v in files.items()) > MAX_OUTPUT:
                        store.finish(payload["id"], None, "Build output exceeds the 8 MB limit.")
                    else:
                        store.finish(payload["id"], files)
                except asyncio.CancelledError:
                    store.finish(payload["id"], None, "Build interrupted by service shutdown; create a new build to retry.")
                    raise
                except TimeoutError:
                    store.finish(payload["id"], None, "Build timed out; create a new build to retry.")
                except OutputValidationError as error:
                    store.finish(payload["id"], None, str(error))
                except Exception:
                    # Provider exceptions may include credentials, request images or private data.
                    store.finish(payload["id"], None, "Design conversion failed validation or provider execution; create a new build to retry.")

        worker = asyncio.create_task(consume())
        try:
            yield
        finally:
            worker.cancel()
            with suppress(asyncio.CancelledError):
                await worker

    application = FastAPI(lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
    preview_slots = asyncio.Semaphore(2)

    @application.middleware("http")
    async def authenticate(request: Request, call_next):
        candidate = request.headers.get("authorization", "")
        if not secret or not hmac.compare_digest(candidate.encode(), f"Bearer {secret}".encode()):
            return JSONResponse({"message": "Unauthorized"}, status_code=401)
        try:
            if int(request.headers.get("content-length", "0")) > MAX_BODY:
                return JSONResponse({"message": "Request exceeds 70 MB limit"}, status_code=413)
        except ValueError:
            return JSONResponse({"message": "Invalid content length"}, status_code=400)
        return await call_next(request)

    @application.post("/v1/media/preview")
    async def preview(request: Request):
        from thumbnails import make_preview
        limit = 20 * 1024 * 1024
        if int(request.headers.get('content-length', '0')) > limit:
            raise HTTPException(413, 'Preview input exceeds limit')
        try:
            await asyncio.wait_for(preview_slots.acquire(), timeout=2)
        except TimeoutError:
            raise HTTPException(503, 'Preview service busy; retry shortly') from None
        try:
            body = bytearray()
            async for chunk in request.stream():
                if len(body) + len(chunk) > limit:
                    raise HTTPException(413, 'Preview input exceeds limit')
                body.extend(chunk)
            try:
                result = await asyncio.to_thread(make_preview, bytes(body))
            except (ValueError, OSError, Image.DecompressionBombError):
                raise HTTPException(422, 'Invalid preview image') from None
            return Response(result, media_type='image/webp', headers={'Cache-Control': 'no-store'})
        finally:
            preview_slots.release()

    @application.post("/v1/builds", status_code=202)
    async def submit(request: Request):
        body = bytearray()
        async for chunk in request.stream():
            body.extend(chunk)
            if len(body) > MAX_BODY:
                raise HTTPException(413, "Request exceeds 70 MB limit")
        try:
            payload = validate_request(json.loads(body))
        except (ValueError, TypeError, KeyError):
            raise HTTPException(422, "Invalid build request or design images") from None
        try:
            application.state.store.accept(payload)
        except ValueError:
            raise HTTPException(409, "Build ID already has different input") from None
        wake.set()
        return {"id": payload["id"], **application.state.store.get(payload["id"])}

    @application.get("/v1/builds/{job_id}")
    async def status(job_id: str):
        result = application.state.store.get(job_id)
        if result is None:
            raise HTTPException(404, "Build not found")
        return result

    return application


app = create_app()
