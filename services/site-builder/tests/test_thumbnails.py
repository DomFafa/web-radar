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
