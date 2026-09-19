import io
import sqlite3

from fastapi.testclient import TestClient
from PIL import Image

from app import create_app


def test_private_thumbnail_is_small_preserves_aspect_and_does_not_enqueue(tmp_path):
    async def never_build(_):
        raise AssertionError('Thumbnail must not generate a website')

    raw = io.BytesIO()
    Image.new('RGBA', (1536, 1024), (30, 100, 200, 180)).save(raw, format='PNG')
    db = tmp_path / 'jobs.db'
    with TestClient(create_app(db_path=db, key='private-key', build=never_build)) as client:
        assert client.post('/v1/media/preview', content=raw.getvalue()).status_code == 401
        auth = {'Authorization': 'Bearer private-key', 'Content-Type': 'image/png'}
        response = client.post('/v1/media/preview', content=raw.getvalue(), headers=auth)
        assert response.status_code == 200
        assert response.headers['content-type'] == 'image/webp'
        assert response.headers['cache-control'] == 'no-store'
        with Image.open(io.BytesIO(response.content)) as image:
            assert image.size == (1000, 667)
            assert image.getpixel((0, 0))[3] == 180
        assert len(response.content) < 100_000
        assert client.post('/v1/media/preview', content=b'invalid', headers=auth).status_code == 422
        assert client.post('/v1/media/preview', content=b'x', headers={**auth, 'Content-Length': str(20 * 1024 * 1024 + 1)}).status_code == 413
    with sqlite3.connect(db) as connection:
        assert connection.execute('SELECT count(*) FROM jobs').fetchone()[0] == 0


def test_fixed_responsive_widths_preserve_default_and_reject_arbitrary_sizes(tmp_path):
    raw = io.BytesIO()
    Image.new('RGBA', (2560, 930), (30, 100, 200, 180)).save(raw, format='PNG')
    with TestClient(create_app(db_path=tmp_path / 'jobs.db', key='key')) as client:
        auth = {'Authorization': 'Bearer key', 'Content-Type': 'image/png'}
        for width in (320, 640, 1280, 1600):
            response = client.post(f'/v1/media/preview?width={width}', content=raw.getvalue(), headers=auth)
            assert response.status_code == 200
            assert response.headers['x-source-width'] == '2560'
            assert response.headers['x-source-height'] == '930'
            with Image.open(io.BytesIO(response.content)) as image:
                assert image.width == width
                assert abs(image.height - width * 930 / 2560) <= 1
                assert image.getpixel((0, 0))[3] == 180
        for width in ('1000', '1', '99999', 'abc', '-320', '320.0'):
            assert client.post(f'/v1/media/preview?width={width}', content=raw.getvalue(), headers=auth).status_code == 422
        # Invalid requests do not exhaust either preview slot.
        assert client.post('/v1/media/preview?width=320', content=b'invalid', headers=auth).status_code == 422
        assert client.post('/v1/media/preview?width=320', content=raw.getvalue(), headers=auth).status_code == 200


def test_responsive_preview_does_not_upscale_and_applies_exif():
    from thumbnails import make_preview
    raw = io.BytesIO()
    exif = Image.Exif()
    exif[274] = 6
    Image.new('RGB', (120, 80)).save(raw, format='JPEG', exif=exif)
    dimensions = {}
    result = make_preview(raw.getvalue(), width=320, source_dimensions=dimensions)
    assert dimensions == {'width': 80, 'height': 120}
    with Image.open(io.BytesIO(result)) as image:
        assert image.size == (80, 120)
