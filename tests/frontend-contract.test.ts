import { describe, expect, it } from 'vitest';
import { HandoffAttempts, PendingOperations, parentOrigin, validHandoff } from '../src/client/api';
import { mergeVersions } from '../src/client/merge';
import { privateAssetId } from '../src/client/Preview';

describe('embedded authorization boundary', () => {
  it('accepts only an exact secure origin or loopback development origin', () => {
    expect(parentOrigin('https://product.example')).toBe('https://product.example');
    expect(parentOrigin('http://127.0.0.1:8788')).toBe('http://127.0.0.1:8788');
    for (const value of [
      'https://product.example/',
      'https://user@product.example',
      'http://product.example',
      'https://product.example/path',
      'null',
      'javascript:alert(1)',
      null,
    ])
      expect(parentOrigin(value)).toBeNull();
  });
  it('rejects a correctly shaped grant from a different origin or window', () => {
    const parent = {} as Window,
      other = {} as Window;
    const grant = {
      type: 'product-radar:handoff',
      protocolVersion: 1,
      requestId: 'operation-1',
      code: 'one-time-code',
    };
    expect(
      validHandoff(
        { origin: 'https://pr.example', source: parent, data: grant },
        'https://pr.example',
        parent,
      ),
    ).toBe(true);
    expect(
      validHandoff(
        { origin: 'https://pr.example.evil.test', source: parent, data: grant },
        'https://pr.example',
        parent,
      ),
    ).toBe(false);
    expect(
      validHandoff(
        { origin: 'https://pr.example', source: other, data: grant },
        'https://pr.example',
        parent,
      ),
    ).toBe(false);
    expect(
      validHandoff(
        { origin: 'https://pr.example', source: parent, data: { ...grant, protocolVersion: 2 } },
        'https://pr.example',
        parent,
      ),
    ).toBe(false);
  });
  it('does not duplicate an active or successful exchange; permits a failed or rotated grant', () => {
    const attempts = new HandoffAttempts();
    expect(attempts.begin('same-operation', 'first-code')).toBe(true);
    expect(attempts.begin('same-operation', 'first-code')).toBe(false);
    attempts.failed('same-operation', 'first-code');
    expect(attempts.begin('same-operation', 'first-code')).toBe(true);
    expect(attempts.begin('same-operation', 'rotated-code')).toBe(true);
    expect(attempts.begin('same-operation', 'rotated-code')).toBe(false);
  });
});

describe('concurrent draft editing', () => {
  const base = {
    name: 'Original',
    draft: {
      company: { name: 'Company', email: 'a@example.com' },
      products: [{ id: '1', name: 'Chair' }],
      copy: { en: { headline: 'Hello' } },
    },
  };
  it('combines independent edits from the two entrances', () => {
    const mine = structuredClone(base);
    mine.draft.company.email = 'sales@example.com';
    const theirs = structuredClone(base);
    theirs.draft.copy.en.headline = 'Welcome';
    const result = mergeVersions(base, mine, theirs);
    expect(result.conflicts).toEqual([]);
    expect(result.value.draft.company.email).toBe('sales@example.com');
    expect(result.value.draft.copy.en.headline).toBe('Welcome');
    expect(base.draft.company.email).toBe('a@example.com');
  });
  it('requires an explicit choice for different changes to the same field', () => {
    const mine = structuredClone(base);
    mine.draft.company.name = 'My company';
    const theirs = structuredClone(base);
    theirs.draft.company.name = 'Remote company';
    expect(mergeVersions(base, mine, theirs).conflicts).toEqual([
      { path: 'draft.company.name', mine: 'My company', theirs: 'Remote company' },
    ]);
    const result = mergeVersions(base, mine, theirs, { 'draft.company.name': 'theirs' });
    expect(result.conflicts).toEqual([]);
    expect(result.value.draft.company.name).toBe('Remote company');
  });
  it('does not silently merge concurrent changes to product ordering and contents', () => {
    const mine = structuredClone(base);
    mine.draft.products.push({ id: '2', name: 'Table' });
    const theirs = structuredClone(base);
    theirs.draft.products[0].name = 'Armchair';
    const result = mergeVersions(base, mine, theirs);
    expect(result.conflicts.map((conflict) => conflict.path)).toEqual(['draft.products']);
    expect(result.value.draft.products).toEqual(mine.draft.products);
  });
});

describe('uncertain operation transport outcomes', () => {
  it('retries the same payload and request ID rather than submitting new edited inputs', () => {
    const requests = new PendingOperations();
    const first = requests.body('video', { expectedVersion: 5, kind: 'video' });
    expect(requests.body('video', { expectedVersion: 6, kind: 'video' })).toEqual(first);
    requests.complete('video');
    const next = requests.body('video', { expectedVersion: 6, kind: 'video' });
    expect(next.requestId).not.toBe(first.requestId);
    expect(next.expectedVersion).toBe(6);
  });
});

describe('private preview asset references', () => {
  it('extracts the same-project private asset only and never accepts another project', () => {
    expect(privateAssetId('/api/projects/project-1/assets/asset-1', 'project-1')).toBe('asset-1');
    expect(privateAssetId('/api/projects/project-2/assets/asset-1', 'project-1')).toBeNull();
    expect(privateAssetId('/public/sites/project-1/assets/asset-1', 'project-1')).toBeNull();
    expect(privateAssetId('data:image/png;base64,x', 'project-1')).toBeNull();
  });
});
