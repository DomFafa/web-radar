import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getMaterialsTemplate } from '../src/templates/materials';
import { availableMaterialsTemplateReleases } from '../src/templates/materials-releases';
import { templateGuides } from '../src/worker/template-guides/catalog';
import { templateCovers } from '../src/worker/template-guides/covers';

function jpegDimensions(bytes: Buffer): { width: number; height: number } {
  if (bytes.readUInt16BE(0) !== 0xffd8) throw Error('Cover is not a JPEG');
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) throw Error('Invalid JPEG marker');
    const marker = bytes[offset + 1];
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  throw Error('Cover has no JPEG frame');
}

describe('versioned template covers', () => {
  it('has a cover for every currently registered catalog template', () => {
    const ids = [...new Set([
      ...templateGuides.map(guide => guide.templateId),
      ...availableMaterialsTemplateReleases().map(release => release.contract.templateId),
    ])].sort();
    expect(Object.keys(templateCovers).sort()).toEqual(ids);
  });

  it('ships JPEGs matching their content hash, dimensions and current contract', () => {
    for (const [id, cover] of Object.entries(templateCovers)) {
      expect(cover.contractRevision, id).toBe(getMaterialsTemplate(id)?.contractRevision);
      expect(cover.url, id).toBe(`/templates/previews/${id}.${cover.sha256.slice(0, 16)}.jpg`);
      const bytes = readFileSync(resolve('public', `.${cover.url}`));
      expect(createHash('sha256').update(bytes).digest('hex'), id).toBe(cover.sha256);
      expect(jpegDimensions(bytes), id).toEqual({ width: cover.width, height: cover.height });
      expect(cover.width, id).toBe(1440);
      expect(cover.height, id).toBe(1000);
      expect(bytes.length, id).toBeGreaterThan(10_000);
    }
  });

  it('rejects a successful HTML fallback masquerading as an image', () => {
    expect(() => jpegDimensions(Buffer.from('<!DOCTYPE html><html>SPA fallback</html>'))).toThrow('not a JPEG');
  });
});
