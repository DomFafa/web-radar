import { DomainError } from './domain';
import { ApiError } from './http';
import { ProviderError } from './provider-contract';

/** Preserve the domain boundary's status and body for both dispatch paths. */
export function domainErrorResponse(error: unknown): Response {
  const json = (message: string, code: string, status: number) => Response.json({ message, code }, { status, headers: { 'Cache-Control': 'no-store' } });
  if (error instanceof DomainError || error instanceof ApiError) return json(error.message, error.code, error.status);
  if (error instanceof ProviderError) return json(error.message, error.code, 503);
  if (error instanceof Error && 'status' in error && typeof error.status === 'number')
    return json(error.message, 'upstream_unavailable', error.status);
  console.error('Domain-service unhandled error:', error);
  return json('操作暂时失败，请稍后重试。', 'internal_error', 500);
}
