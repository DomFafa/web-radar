import { packedReferenceModulesEqual } from '../scripts/packed-reference-check.mjs';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { lazyReferenceText } from '../src/templates/compressed-reference';
import { lumiSnapshots } from '../src/templates/themes/lumi/snapshots';
import { lumiReferenceStyles } from '../src/templates/themes/lumi/styles';
import { referenceLayouts } from '../src/templates/themes/referenceLayouts';
import { auravellSnapshots, getAuravellNavigation, getAuravellFooter } from '../src/templates/themes/auravell/snapshots';
import { careflowSnapshots } from '../src/templates/themes/careflow/snapshots';
import { getCareflowReferenceStyles } from '../src/templates/themes/careflow/styles';

describe('compressed reference data', () => {
  it('checks text and wrapper integrity independently of gzip implementation', () => {
    const module = (value: string, level: 1 | 9) => 'const packed = ' + JSON.stringify(gzipSync(value, { level }).toString('base64')) + ';';
    const source = 'Reference HTML · 字体 '.repeat(100);
    expect(packedReferenceModulesEqual(module(source, 1), module(source, 9))).toBe(true);
    expect(packedReferenceModulesEqual(module(source + ' changed', 1), module(source, 9))).toBe(false);
    expect(packedReferenceModulesEqual(module(source, 1).replace('const', 'let'), module(source, 9))).toBe(false);
  });
  it('does not decompress entries until the selected page is accessed', () => {
    const references = lazyReferenceText({ valid: gzipSync('Exact HTML · 字体').toString('base64'), unused: 'not-gzip' });
    expect(Object.keys(references)).toEqual(['valid', 'unused']);
    expect(references.valid).toBe('Exact HTML · 字体');
    expect(() => references.unused).toThrow();
  });

  it('preserves every Lumi page, responsive variant and stylesheet byte for byte', () => {
    const snapshots = JSON.parse(readFileSync('src/templates/themes/lumi/snapshots.reference.json', 'utf8'));
    const styles = JSON.parse(readFileSync('src/templates/themes/lumi/styles.reference.json', 'utf8'));
    expect(Object.keys(lumiSnapshots)).toEqual(Object.keys(snapshots));
    expect(Object.keys(lumiReferenceStyles)).toEqual(Object.keys(styles));
    for (const [page, variants] of Object.entries(snapshots) as [string, Record<string, string>][]) {
      expect(Object.keys(lumiSnapshots[page])).toEqual(Object.keys(variants));
      for (const [variant, html] of Object.entries(variants)) expect(lumiSnapshots[page][variant]).toBe(html);
      expect(lumiReferenceStyles[page]).toBe(styles[page]);
    }
    execFileSync(process.execPath, ['scripts/pack-lumi-reference.mjs', '--check']);
  });

  it('preserves every Reference Layout markup and metadata byte for byte', () => {
    const refData = JSON.parse(readFileSync('src/templates/themes/referenceLayouts.reference.json', 'utf8'));
    expect(Object.keys(referenceLayouts)).toEqual(Object.keys(refData));
    for (const [id, expected] of Object.entries(refData) as [string, any][]) {
      const layout = referenceLayouts[id as keyof typeof referenceLayouts];
      expect(layout.source).toBe(expected.source);
      expect(layout.bodyClass).toBe(expected.bodyClass);
      expect(layout.htmlClass).toBe(expected.htmlClass);
      expect(layout.css).toEqual(expected.css);
      expect(layout.slots).toEqual(expected.slots);
      expect(layout.html).toBe(expected.html);
    }
  });

  it('preserves Auravell and Careflow snapshots and styles byte for byte', () => {
    const auravellData = JSON.parse(readFileSync('src/templates/themes/auravell/snapshots.reference.json', 'utf8'));
    expect(Object.keys(auravellSnapshots)).toEqual(Object.keys(auravellData.snapshots));
    for (const [page, html] of Object.entries(auravellData.snapshots)) {
      expect(auravellSnapshots[page]).toBe(html);
    }
    expect(getAuravellNavigation()).toBe(auravellData.navigation);
    expect(getAuravellFooter()).toBe(auravellData.footer);

    const careflowData = JSON.parse(readFileSync('src/templates/themes/careflow/snapshots.reference.json', 'utf8'));
    expect(Object.keys(careflowSnapshots)).toEqual(Object.keys(careflowData));
    for (const [page, html] of Object.entries(careflowData)) {
      expect(careflowSnapshots[page]).toBe(html);
    }

    const careflowStyleData = JSON.parse(readFileSync('src/templates/themes/careflow/styles.reference.json', 'utf8'));
    expect(getCareflowReferenceStyles()).toBe(careflowStyleData.styles);

    execFileSync(process.execPath, ['scripts/pack-theme-reference.mjs', '--check']);
  });
});
