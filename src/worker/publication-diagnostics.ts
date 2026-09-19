import type { AppEnv } from './env';
import { ApiError } from './http';
import { DomainError } from './domain';
import { ProviderError } from './provider-contract';

/** Unclassified runtime failures need their message and call sites, never request objects. */
export function publicationErrorDetails(error: unknown, env: AppEnv): {
  errorMessage?: string;
  errorStack?: string;
  errorCauses?: { message: string; stack: string }[];
} {
  if (!(error instanceof Error)) return {};
  // Classified application/provider failures already have a safe code and status.
  if (error instanceof ApiError || error instanceof DomainError || error instanceof ProviderError) return {};
  const secrets = Object.entries(env)
    .filter(([key, value]) => /secret|token|password|key/i.test(key) && typeof value === 'string' && value.length >= 4)
    .map(([, value]) => String(value));
  const redact = (value: string, limit: number) => {
    let text = value;
    for (const secret of secrets) text = text.replaceAll(secret, '[redacted]').replaceAll(encodeURIComponent(secret), '[redacted]');
    return text
      .replace(/https?:\/\/[^\s<>"']+/gi, '[url]')
      .replace(/\b(?:Bearer|Basic)\s+[^\s,;]+/gi, '[redacted]')
      .replace(/\bsk-[a-zA-Z0-9_-]+/g, '[redacted]')
      .replace(/(["']?(?:api[_-]?key|token|secret|password|authorization|cookie)["']?\s*[:=]\s*)["']?[^\s,;"']+["']?/gi, '$1[redacted]')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .slice(0, limit);
  };
  const stack = (value: Error) => redact((value.stack ?? '').split('\n').filter(line => /^\s*at\s/.test(line)).slice(0, 8).join('\n'), 1600);
  const errorCauses: { message: string; stack: string }[] = [];
  const seen = new Set<Error>([error]);
  let cause = error.cause;
  while (cause instanceof Error && !seen.has(cause) && errorCauses.length < 3) {
    seen.add(cause);
    errorCauses.push({ message: redact(cause.message, 600), stack: stack(cause) });
    cause = cause.cause;
  }
  return { errorMessage: redact(error.message, 600), errorStack: stack(error), errorCauses };
}
