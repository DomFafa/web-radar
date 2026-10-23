const parts = ['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml',
  'xl/_rels/workbook.xml.rels', 'xl/worksheets/sheet1.xml',
  'xl/worksheets/sheet2.xml', 'xl/worksheets/sheet3.xml'];

// ZIP directory and local header check; Python/openpyxl separately verifies the cells.
export function looksLikeXlsx(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 22) return false;
  const view = new DataView(buffer);
  const u16 = (at: number) => view.getUint16(at, true);
  const u32 = (at: number) => view.getUint32(at, true);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (u32(i) === 0x06054b50 && i + 22 + u16(i + 20) === bytes.length) { end = i; break; }
  if (end < 0 || u16(end + 4) || u16(end + 6) ||
      u16(end + 8) !== u16(end + 10) || u16(end + 10) < parts.length) return false;
  const directoryEnd = u32(end + 16) + u32(end + 12);
  if (directoryEnd > end) return false;
  let cursor = u32(end + 16);
  const names = new Set<string>();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  try {
    for (let i = 0; i < u16(end + 10); i++) {
      if (cursor + 46 > directoryEnd || u32(cursor) !== 0x02014b50) return false;
      const flags = u16(cursor + 8), compression = u16(cursor + 10);
      if ((flags & 1) || ![0, 8].includes(compression)) return false;
      const length = u16(cursor + 28);
      const next = cursor + 46 + length + u16(cursor + 30) + u16(cursor + 32);
      if (next > directoryEnd) return false;
      const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + length));
      const offset = u32(cursor + 42);
      if (!name || name.includes('\\') || name.startsWith('/') || name.split('/').includes('..') || names.has(name) ||
        offset + 30 > cursor || u32(offset) !== 0x04034b50 ||
        u16(offset + 8) !== compression || u16(offset + 26) !== length ||
        offset + 30 + length + u16(offset + 28) > cursor ||
        decoder.decode(bytes.subarray(offset + 30, offset + 30 + length)) !== name) return false;
      names.add(name);
      cursor = next;
    }
  } catch { return false; }
  return cursor === directoryEnd && parts.every(name => names.has(name));
}
