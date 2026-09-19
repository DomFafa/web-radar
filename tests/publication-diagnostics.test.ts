import { describe, expect, it } from 'vitest';
import type { AppEnv } from '../src/worker/env';
import { publicationErrorDetails } from '../src/worker/publication-diagnostics';
import { ApiError } from '../src/worker/http';

describe('publication error diagnostics', () => {
  it('retains the infrastructure error, cause and call sites without credentials or request data', () => {
    const secret = 'private-builder-credential';
    const cause = new Error(`D1_ERROR: connection lost token=private-token https://example.com/?key=private-query ${secret}`);
    const error = Object.assign(new Error('D1_ERROR: checkpoint failed', { cause }), {
      body: 'private-body', headers: { Authorization: 'private-header' },
    });
    const result = publicationErrorDetails(error, { SITE_BUILDER_KEY: secret } as AppEnv);
    expect(result.errorMessage).toBe('D1_ERROR: checkpoint failed');
    expect(result.errorStack).toContain('publication-diagnostics.test.ts');
    expect(result.errorCauses?.[0].message).toContain('D1_ERROR: connection lost');
    expect(JSON.stringify(result)).not.toContain('private-');
  });

  it('does not expose arbitrary messages of classified errors and bounds cyclic causes', () => {
    const error = Object.assign(new ApiError(503, 'pr_context_failed', 'secret-message'), { cause: new Error('secret-cause') });
    expect(publicationErrorDetails(error, {} as AppEnv)).toEqual({});
    const cyclic = new Error('x'.repeat(3000));
    cyclic.cause = cyclic;
    const result = publicationErrorDetails(cyclic, {} as AppEnv);
    expect(result.errorMessage?.length).toBeLessThanOrEqual(600);
    expect(result.errorCauses?.length).toBeLessThanOrEqual(3);
  });
});
