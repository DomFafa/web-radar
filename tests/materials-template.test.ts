import { describe, expect, it } from 'vitest';
import { getMaterialsTemplate, prepareMaterialsReference } from '../src/templates/materials';
import { readFileSync } from 'node:fs';

describe('Juno materials inventory',()=>{
  it('keeps the published contract and text slot numbering unchanged',()=>{
    const published=JSON.parse(readFileSync(new URL('../docs/materials-requirements/juno-toys.json',import.meta.url),'utf8'));
    expect(getMaterialsTemplate('juno-toys','2026-09-17.juno-materials.2')).toEqual(published);
  });
  it('describes the actual hero and product positions, including positions absent from the old guide',()=>{
    const p=getMaterialsTemplate('juno-toys','2026-09-17.juno-materials.2')!;
    expect(p.materialsReady).toBe(true);
    expect(p.imageSlots.filter(s=>s.id.startsWith('hero-slide-'))).toHaveLength(3);
    expect(p.imageSlots.filter(s=>s.id.startsWith('home-image-'))).toHaveLength(17);
    expect(p.imageSlots.find(s=>s.id==='product-main')?.repeat).toBe('per-product');
    expect(p.textSlots.every(s=>s.binding==='supported')).toBe(true);
  });
  it('retains carousel and layout while removing unsupported commercial claims and example reviews from the new branch',()=>{
    const html=prepareMaterialsReference('juno-toys');
    expect(html).toContain('data-wr-slider');
    expect(html).toContain('elementor-');
    expect(html).not.toContain('Mandy Mathers');
    expect(html).not.toContain('320.00');
    expect(html).not.toContain('Guide to working at summer camps');
    expect(html).toContain('__WR_MATERIAL_TEXT_');
  });
});
