"""Deterministic private previews; no model calls or persistent build jobs."""
import io

from PIL import Image, ImageOps


def make_preview(raw: bytes) -> bytes:
    with Image.open(io.BytesIO(raw)) as source:
        if source.format not in {'PNG', 'JPEG', 'WEBP'} or source.width * source.height > 20_000_000:
            raise ValueError('Unsupported preview image')
        image = ImageOps.exif_transpose(source)
        image.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
        image = image.convert('RGBA' if 'A' in image.getbands() or 'transparency' in image.info else 'RGB')
        output = io.BytesIO()
        image.save(output, format='WEBP', quality=82, method=4)
        return output.getvalue()
