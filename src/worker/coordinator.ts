import { DurableObject } from 'cloudflare:workers';
import type { AppEnv } from './env';
import { DomainService } from './domain-service';

/** One global object coordinates the single Agnes account and quota mutations. */
export class Coordinator extends DurableObject<AppEnv> {
  private readonly domain: DomainService;
  constructor(ctx: DurableObjectState, env: AppEnv) {
    super(ctx, env);
    this.domain = new DomainService(env, {
      schedule: async (time) => {
        const current = await ctx.storage.getAlarm();
        if (current === null || current > time) await ctx.storage.setAlarm(time);
      },
    });
  }
  async fetch(request: Request): Promise<Response> {
    const response = await this.domain.fetch(request);
    if (request.method !== 'GET' && request.method !== 'HEAD' && response.ok) this.ctx.waitUntil(this.domain.tick());
    return response;
  }
  async alarm(): Promise<void> {
    await this.domain.tick();
  }
}
