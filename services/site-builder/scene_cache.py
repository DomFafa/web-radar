"""Reuse accepted photographic scenes across builds with identical source inputs."""
import copy
import hashlib
import json
import os
import re
import stat
import tempfile
from pathlib import Path
from typing import Any

from assembler import OutputValidationError
from generated_assets import IMAGE_MODEL, MAX_ASSET_BYTES, GeneratedAssetError, _inline_image

CACHE_VERSION = 1
MAX_CACHE_BYTES = 4_000_000


class SceneCacheError(OutputValidationError):
    """A damaged accepted cache must never silently trigger another paid image."""


def _cache_identity(payload: dict[str, Any], page: str) -> tuple[str, Path]:
    try:
        if not isinstance(page, str) or not re.fullmatch(r'[a-z][a-z0-9-]{0,99}', page):
            raise ValueError
        draft = {key: value for key, value in payload['draft'].items() if key != 'siteDesign'}
        inputs = {
            'version': CACHE_VERSION, 'page': page,
            'designImage': payload['designImages'][page],
            'referenceAssets': payload.get('referenceAssets', {}), 'draft': draft,
            'model': os.environ.get('IMAGE_MODEL', IMAGE_MODEL).strip(),
            'base': os.environ.get('IMAGE_API_BASE_URL', '').strip().rstrip('/'),
        }
        encoded = json.dumps(inputs, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()
        key = hashlib.sha256(encoded).hexdigest()
        directory = Path(os.environ.get('SITE_BUILDER_DB', './data/builds.sqlite3')).parent / 'scene-cache'
        return key, directory / (key + '.json')
    except (KeyError, TypeError, ValueError, AttributeError):
        raise SceneCacheError('Scene cache inputs are invalid; no image regeneration was authorized.') from None


def _validate_record(record: Any, *, key: str | None = None, page: str | None = None) -> dict[str, Any]:
    try:
        if not isinstance(record, dict) or set(record) != {'version', 'key', 'page', 'sourceJobId', 'scenes'}:
            raise ValueError
        if type(record['version']) is not int or record['version'] != CACHE_VERSION:
            raise ValueError
        if not isinstance(record['key'], str) or not re.fullmatch(r'[0-9a-f]{64}', record['key']) or (key is not None and record['key'] != key):
            raise ValueError
        if not isinstance(record['page'], str) or not re.fullmatch(r'[a-z][a-z0-9-]{0,99}', record['page']) or (page is not None and record['page'] != page):
            raise ValueError
        if not isinstance(record['sourceJobId'], str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,99}', record['sourceJobId']):
            raise ValueError
        scenes = record['scenes']
        if not isinstance(scenes, list) or not 1 <= len(scenes) <= 12:
            raise ValueError
        boxes = set()
        for scene in scenes:
            if not isinstance(scene, dict) or set(scene) != {'box', 'dataUrl', 'sha256'}:
                raise ValueError
            box = scene['box']
            if not isinstance(box, list) or len(box) != 4 or any(type(n) is not int for n in box):
                raise ValueError
            x, y, width, height = box
            if min(x, y) < 0 or min(width, height) <= 0 or x + width > 1000 or y + height > 1000 or width * height > 450_000:
                raise ValueError
            boxes.add(tuple(box))
            if not isinstance(scene['dataUrl'], str) or len(scene['dataUrl']) > 4 * ((MAX_ASSET_BYTES + 2) // 3) + 40:
                raise ValueError
            raw, mime, _ = _inline_image(scene['dataUrl'])
            if mime != 'webp' or len(raw) > MAX_ASSET_BYTES or scene['sha256'] != hashlib.sha256(raw).hexdigest():
                raise ValueError
        if sum(width * height for _, _, width, height in boxes) > 650_000:
            raise ValueError
        return record
    except (KeyError, TypeError, ValueError, GeneratedAssetError):
        raise SceneCacheError('Scene cache is invalid or corrupt; inspect the accepted evidence before any regeneration.') from None


def load_scene_cache(payload: dict[str, Any], page: str) -> dict[str, Any] | None:
    """Return a verified whole-page scene record; only an absent file is a miss."""
    key, path = _cache_identity(payload, page)
    try:
        metadata = path.lstat()
    except FileNotFoundError:
        return None
    except OSError:
        raise SceneCacheError('Scene cache could not be read; no image regeneration was authorized.') from None
    try:
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_size > MAX_CACHE_BYTES:
            raise ValueError
        with path.open('rb') as saved:
            raw = saved.read(MAX_CACHE_BYTES + 1)
        if len(raw) > MAX_CACHE_BYTES:
            raise ValueError
        return _validate_record(json.loads(raw), key=key, page=page)
    except (OSError, ValueError):
        raise SceneCacheError('Scene cache is invalid or corrupt; inspect the accepted evidence before any regeneration.') from None


def save_scene_cache(payload: dict[str, Any], page: str, plan: dict[str, Any], generated: dict[str, str]) -> None:
    """Call only after generate_scene_assets successfully returns the entire page."""
    key, path = _cache_identity(payload, page)
    try:
        crops = plan['crops']
        if not isinstance(crops, list) or len(crops) > 12:
            raise ValueError
        expected = {f'{page}-{index}': crop for index, crop in enumerate(crops) if crop['kind'] == 'scene'}
        if set(generated) != set(expected):
            raise ValueError
        if not expected:
            return
        scenes = []
        for identity, crop in expected.items():
            raw, _, _ = _inline_image(generated[identity])
            scenes.append({'box': copy.deepcopy(crop['box']), 'dataUrl': generated[identity], 'sha256': hashlib.sha256(raw).hexdigest()})
        record = _validate_record({'version': CACHE_VERSION, 'key': key, 'page': page, 'sourceJobId': payload['id'], 'scenes': scenes}, key=key, page=page)
        encoded = json.dumps(record, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()
        if len(encoded) > MAX_CACHE_BYTES:
            raise ValueError
    except (KeyError, TypeError, ValueError, GeneratedAssetError):
        raise SceneCacheError('Scene cache requires complete valid scene assets within the cache budget.') from None
    if load_scene_cache(payload, page) is not None:
        return
    temporary = None
    try:
        path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        os.chmod(path.parent, 0o700)
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as saved:
            temporary = Path(saved.name)
            os.chmod(temporary, 0o600)
            saved.write(encoded)
            saved.flush()
            os.fsync(saved.fileno())
        try:
            os.link(temporary, path)  # Atomic publish; another successful build wins without overwrite.
        except FileExistsError:
            load_scene_cache(payload, page)  # A corrupt concurrent winner is never a miss.
        directory_fd = os.open(path.parent, os.O_RDONLY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
    except OSError:
        raise SceneCacheError('Scene cache could not be saved; accepted scene evidence remains with its source build.') from None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def merge_cached_scenes(plan: dict[str, Any], record: dict[str, Any]) -> tuple[dict[str, Any], dict[str, str]]:
    """Keep the new text/layout plan, replacing only its photographic scene crops."""
    record = _validate_record(record)
    merged = copy.deepcopy(plan)
    merged['crops'] = [{'kind': 'scene', 'box': copy.deepcopy(scene['box'])} for scene in record['scenes']] + [crop for crop in merged['crops'] if crop['kind'] != 'scene']
    if len(merged['crops']) > 12:
        raise SceneCacheError('Scene cache and the current non-scene crops exceed the page crop budget.')
    boxes = {tuple(crop['box']) for crop in merged['crops']}
    if sum(width * height for _, _, width, height in boxes) > 650_000:
        raise SceneCacheError('Scene cache and the current non-scene crops exceed the page area budget.')
    assets = {f'{record["page"]}-{index}': scene['dataUrl'] for index, scene in enumerate(record['scenes'])}
    return merged, assets
