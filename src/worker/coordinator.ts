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
    return this.domain.fetch(request);
  }
  async alarm(): Promise<void> {
    await this.domain.tick();
  }
}
