"""Deterministic private previews; no model calls or persistent build jobs."""
import io

from PIL import Image, ImageOps


RESPONSIVE_WIDTHS = {320, 640, 1280, 1600}


def make_preview(raw: bytes, width: int | None = None, *, source_dimensions: dict[str, int] | None = None) -> bytes:
    if width is not None and width not in RESPONSIVE_WIDTHS:
        raise ValueError("Unsupported preview width")
    with Image.open(io.BytesIO(raw)) as source:
        if source.format not in {'PNG', 'JPEG', 'WEBP'} or source.width * source.height > 20_000_000:
            raise ValueError('Unsupported preview image')
        image = ImageOps.exif_transpose(source)
        if source_dimensions is not None:
            source_dimensions.update(width=image.width, height=image.height)
        image.thumbnail((1000, 1000) if width is None else (width, image.height), Image.Resampling.LANCZOS)
        image = image.convert('RGBA' if 'A' in image.getbands() or 'transparency' in image.info else 'RGB')
        output = io.BytesIO()
        image.save(output, format='WEBP', quality=82, method=4)
        return output.getvalue()
