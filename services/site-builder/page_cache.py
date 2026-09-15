"""Private cache of reviewed page candidates; callers revalidate every cache hit."""
import hashlib
import json
import os
import re
import stat
import tempfile
from pathlib import Path
from typing import Any

from assembler import OutputValidationError
from generated_assets import IMAGE_MODEL

CACHE_VERSION = 1
MAX_HTML_BYTES = 2 * 1024 * 1024
MAX_PLAN_BYTES = 256_000
MAX_CACHE_BYTES = 3_000_000


class PageCacheError(OutputValidationError):
    """Cache errors never authorize automatic paid page regeneration."""


def _json_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()


def _html_bytes(html: Any) -> bytes:
    if not isinstance(html, str):
        raise ValueError
    raw = html.encode()
    if not 1 <= len(raw) <= MAX_HTML_BYTES:
        raise ValueError
    return raw


def _plan_bytes(plan: Any) -> bytes:
    if plan is not None and not isinstance(plan, dict):
        raise ValueError
    raw = _json_bytes(plan)
    if len(raw) > MAX_PLAN_BYTES:
        raise ValueError
    return raw


def _cache_identity(payload: dict[str, Any], page: str, home_html: str | None) -> tuple[str, Path]:
    try:
        if not isinstance(page, str) or not re.fullmatch(r'[a-z][a-z0-9-]{0,99}', page):
            raise ValueError
        draft = {key: value for key, value in payload['draft'].items() if key != 'siteDesign'}
        text_model = os.environ.get('SITE_BUILDER_MODEL', 'gpt-5.5').strip()
        text_model = {'gpt-5.5': 'gpt-5.5 (low thinking)', 'gpt-5.4': 'gpt-5.4-2026-03-05 (low thinking)'}.get(text_model, text_model)
        inputs = {
            'version': CACHE_VERSION, 'page': page, 'draft': draft,
            'designImages': payload['designImages'], 'referenceAssets': payload.get('referenceAssets', {}),
            'textModel': text_model,
            'textBase': (os.environ.get('OPENAI_BASE_URL', '').strip() or 'https://api.openai.com/v1').rstrip('/'),
            'imageModel': os.environ.get('IMAGE_MODEL', IMAGE_MODEL).strip(),
            'imageBase': os.environ.get('IMAGE_API_BASE_URL', '').strip().rstrip('/'),
            'homeHtmlSha256': None if page == 'home' or home_html is None else hashlib.sha256(_html_bytes(home_html)).hexdigest(),
        }
        key = hashlib.sha256(_json_bytes(inputs)).hexdigest()
        directory = Path(os.environ.get('SITE_BUILDER_DB', './data/builds.sqlite3')).parent / 'page-cache'
        return key, directory / (key + '.json')
    except (KeyError, TypeError, ValueError, AttributeError, RecursionError):
        raise PageCacheError('Page cache inputs are invalid; no page regeneration was authorized.') from None


def _validate_record(record: Any, key: str, page: str) -> dict[str, Any]:
    try:
        if not isinstance(record, dict) or set(record) != {'version', 'key', 'page', 'sourceJobId', 'html', 'htmlSha256', 'plan', 'planSha256'}:
            raise ValueError
        if type(record['version']) is not int or record['version'] != CACHE_VERSION or record['key'] != key or record['page'] != page:
            raise ValueError
        if not isinstance(record['sourceJobId'], str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,99}', record['sourceJobId']):
            raise ValueError
        if record['htmlSha256'] != hashlib.sha256(_html_bytes(record['html'])).hexdigest():
            raise ValueError
        if record['planSha256'] != hashlib.sha256(_plan_bytes(record['plan'])).hexdigest():
            raise ValueError
        return record
    except (KeyError, TypeError, ValueError, RecursionError):
        raise PageCacheError('Page cache is invalid or corrupt; inspect the reviewed evidence before any regeneration.') from None


def load_page_cache(payload: dict[str, Any], page: str, home_html: str | None = None) -> dict[str, Any] | None:
    """Only an absent cache file is a miss; loaded HTML still requires live checks."""
    key, path = _cache_identity(payload, page, home_html)
    try:
        metadata = path.lstat()
    except FileNotFoundError:
        return None
    except OSError:
        raise PageCacheError('Page cache could not be read; no page regeneration was authorized.') from None
    try:
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_size > MAX_CACHE_BYTES:
            raise ValueError
        with path.open('rb') as saved:
            raw = saved.read(MAX_CACHE_BYTES + 1)
        if len(raw) > MAX_CACHE_BYTES:
            raise ValueError
        return _validate_record(json.loads(raw), key, page)
    except (OSError, ValueError, RecursionError):
        raise PageCacheError('Page cache is invalid or corrupt; inspect the reviewed evidence before any regeneration.') from None


def save_page_cache(payload: dict[str, Any], page: str, html: str, plan: dict[str, Any] | None, home_html: str | None = None) -> None:
    """Save only the selected candidate after one review and every acceptance check."""
    key, path = _cache_identity(payload, page, home_html)
    try:
        record = {'version': CACHE_VERSION, 'key': key, 'page': page, 'sourceJobId': payload['id'],
                  'html': html, 'htmlSha256': hashlib.sha256(_html_bytes(html)).hexdigest(),
                  'plan': plan, 'planSha256': hashlib.sha256(_plan_bytes(plan)).hexdigest()}
        _validate_record(record, key, page)
        encoded = _json_bytes(record)
        if len(encoded) > MAX_CACHE_BYTES:
            raise ValueError
    except (KeyError, TypeError, ValueError, RecursionError):
        raise PageCacheError('Page cache requires valid HTML and plan JSON within its byte budgets.') from None
    if load_page_cache(payload, page, home_html) is not None:
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
            os.link(temporary, path)  # Atomic first-writer publication without overwrite.
        except FileExistsError:
            load_page_cache(payload, page, home_html)
        directory_fd = os.open(path.parent, os.O_RDONLY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
    except OSError:
        raise PageCacheError('Page cache could not be saved; reviewed evidence remains with its source build.') from None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
