import type { Principal, Project } from '../shared/model';
import type { AppEnv } from './env';
import { testMode } from './env';
import { ApiError } from './http';
import { integrationConfig } from './product-radar';
import { DomainStore } from './domain-store';

type State = 'new' | 'pending' | 'reserved' | 'commit' | 'release' | 'charged' | 'released';
export interface WebsiteCreation {
  sourceScope: string;
  requestId: string;
  projectId: string;
  userId: string;
  workspaceId: string;
  reservationId?: string;
  state: State;
}
type Receipt = { projectId: string; reservationId: string; status: 'reserved' | 'charged' | 'released' };
const prefix = 'website-quota:';

/** PR owns counters; this journal only makes cross-service creation recoverable. */
export class WebsiteQuota {
  constructor(readonly env: AppEnv, readonly store: DomainStore, readonly schedule: (time: number) => Promise<void>) {}
  async find(scope: string, id: string): Promise<WebsiteCreation | undefined> {
    const row = await this.env.DB.prepare('SELECT result FROM idempotency WHERE scope=? AND request_id=?').bind(prefix + scope, id).first<{ result: string }>();
    return row ? JSON.parse(row.result) : undefined;
  }
  async intent(principal: Principal, scope: string, id: string, fingerprint: string): Promise<WebsiteCreation> {
    const existing = await this.store.idempotent<WebsiteCreation>(prefix + scope, id, fingerprint);
    if (existing) return existing;
    const claim: WebsiteCreation = { sourceScope: scope, requestId: id, projectId: crypto.randomUUID(), userId: principal.userId, workspaceId: principal.workspaceId, state: 'new' };
    try { await this.store.remember(prefix + scope, id, fingerprint, claim).run(); }
    catch (error) {
      const durable = await this.store.idempotent<WebsiteCreation>(prefix + scope, id, fingerprint);
      if (durable) return durable; // Includes a successful insert with a lost response.
      throw error;
    }
    return claim;
  }
  statement(claim: WebsiteCreation, state: State = claim.state): D1PreparedStatement {
    return this.env.DB.prepare('UPDATE idempotency SET result=? WHERE scope=? AND request_id=?')
      .bind(JSON.stringify({ ...claim, state, checkedAt: Date.now() }), prefix + claim.sourceScope, claim.requestId);
  }
  private async save(claim: WebsiteCreation, state: State) {
    await this.statement(claim, state).run(); claim.state = state;
  }
  private async api(action: 'reserve' | 'commit' | 'release' | 'status', claim: WebsiteCreation): Promise<Receipt | undefined> {
    // Match the repository's explicit, loopback-only fixture environment.
    if (testMode(this.env)) return { projectId: claim.projectId, reservationId: claim.reservationId || crypto.randomUUID(), status: action === 'commit' ? 'charged' : action === 'release' ? 'released' : claim.state === 'charged' ? 'charged' : 'reserved' };
    const { origin, secret } = integrationConfig(this.env);
    let response: Response;
    try {
      response = await fetch(origin + '/api/web-radar/service/website-quota/' + action, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Web-Radar-Secret': secret },
        body: JSON.stringify({ userId: claim.userId, workspaceId: claim.workspaceId, projectId: claim.projectId,
          ...(['commit', 'release'].includes(action) ? { reservationId: claim.reservationId } : {}) }),
        redirect: 'manual', signal: AbortSignal.timeout(15000),
      });
    } catch { throw new ApiError(503, 'website_quota_unavailable', '网站额度服务暂时不可用，请重试原创建请求。'); }
    if (action === 'status' && response.status === 404) { await response.body?.cancel(); return; }
    if (!response.ok) {
      await response.body?.cancel();
      const status = [403, 409, 429, 503].includes(response.status) ? response.status : 503;
      const message = status === 429 ? '本月网站创建额度已用完，请联系管理员调整账号或工作区额度。'
        : status === 403 ? '当前账号尚未开通网站创建权限，请联系管理员。'
        : status === 409 ? '网站创建状态已变化，请重试原创建请求；若仍失败，请联系管理员。'
        : '网站额度服务暂时不可用，请稍后重试原创建请求。';
      throw new ApiError(status, 'website_quota_rejected', message);
    }
    const data = await response.json().catch(() => null) as Receipt | null;
    if (!data || data.projectId !== claim.projectId || !/^[0-9a-f-]{36}$/i.test(data.reservationId) || !['reserved', 'charged', 'released'].includes(data.status))
      throw new ApiError(503, 'website_quota_invalid', '网站额度服务返回无效，请重试原创建请求。');
    return data;
  }
  async reserve(claim: WebsiteCreation): Promise<void> {
    if (claim.state === 'charged' || (claim.state === 'reserved' && claim.reservationId)) return;
    // Do not allow a delayed release to cancel a new token for the same project.
    if (claim.state === 'release') await this.release(claim);
    if ((claim.state as State) === 'charged') return;
    await this.schedule(Date.now() + 1000);
    const uncertain = claim.state === 'pending';
    await this.save(claim, 'pending');
    let receipt: Receipt | undefined;
    try {
      if (uncertain) receipt = await this.api('status', claim);
      if (!receipt || receipt.status === 'released') receipt = await this.api('reserve', claim);
    } catch (error) {
      if (!uncertain && !claim.reservationId && error instanceof ApiError && [403, 409, 429].includes(error.status)) await this.save(claim, 'new');
      throw error;
    }
    if (!receipt || receipt.status === 'released') throw new ApiError(503, 'website_quota_unavailable', '网站额度预留尚未完成，请重试原请求。');
    claim.reservationId = receipt.reservationId;
    await this.save(claim, receipt.status);
  }
  async commit(claim: WebsiteCreation): Promise<void> {
    if (claim.state === 'charged') return;
    // The atomic commit marker proves creation even if the user has since deleted the website.
    if (claim.state !== 'commit' && !await this.store.one<Project>('projects', claim.projectId)) throw new ApiError(503, 'website_creation_pending', '网站创建尚未完成，请重试原请求。');
    await this.schedule(Date.now() + 1000);
    await this.save(claim, 'commit');
    if (!claim.reservationId) {
      const found = await this.api('status', claim);
      if (!found) throw new ApiError(503, 'website_quota_pending', '网站额度确认尚未完成，请重试原请求。');
      claim.reservationId = found.reservationId;
    }
    const receipt = await this.api('commit', claim);
    if (receipt?.status !== 'charged') throw new ApiError(503, 'website_quota_pending', '网站额度确认尚未完成，请重试原请求。');
    await this.save(claim, 'charged');
  }
  async release(claim: WebsiteCreation): Promise<void> {
    if (claim.state === 'charged' || claim.state === 'released' || claim.state === 'new') return;
    // Never compensate a successful D1 commit or refund an already-created website.
    if (claim.state === 'commit' || await this.store.one<Project>('projects', claim.projectId)) return this.commit(claim);
    await this.schedule(Date.now() + 1000);
    if (!claim.reservationId) {
      const receipt = await this.api('status', claim);
      // Absence cannot prove that a timed-out reserve will never arrive.
      if (!receipt) return;
      claim.reservationId = receipt.reservationId;
      if (receipt.status !== 'reserved') { await this.save(claim, receipt.status); return; }
    }
    await this.save(claim, 'release');
    const receipt = await this.api('release', claim);
    if (!receipt || receipt.status === 'reserved') throw new ApiError(503, 'website_quota_pending', '网站额度释放尚未完成。');
    await this.save(claim, receipt.status);
  }
  async reconcile(lock: <T>(fn: () => Promise<T>) => Promise<T>): Promise<void> {
    const rows = await this.env.DB.prepare("SELECT result FROM idempotency WHERE scope LIKE 'website-quota:%' AND json_extract(result,'$.state') IN ('pending','reserved','commit','release') ORDER BY CASE json_extract(result,'$.state') WHEN 'commit' THEN 0 WHEN 'release' THEN 1 ELSE 2 END, coalesce(json_extract(result,'$.checkedAt'),0) LIMIT 20").all<{ result: string }>();
    let retry = rows.results.length === 20;
    for (const row of rows.results) {
      await lock(async () => {
        const saved = JSON.parse(row.result) as WebsiteCreation;
        const claim = await this.find(saved.sourceScope, saved.requestId);
        if (!claim || ['new', 'charged', 'released'].includes(claim.state)) return;
        try {
          if (claim.state === 'commit' || await this.store.one<Project>('projects', claim.projectId)) await this.commit(claim);
          else {
            if (claim.sourceScope.startsWith('materials:') && !['commit', 'release'].includes(claim.state)) {
              const receipt = await this.env.DB.prepare('SELECT result FROM idempotency WHERE scope=? AND request_id=?').bind(claim.sourceScope, claim.requestId).first<{ result: string }>();
              if (receipt && !JSON.parse(receipt.result).cleaned) return; // Receiver owns retry/expiry.
            }
            await this.release(claim);
          }
          if (['pending', 'reserved', 'commit', 'release'].includes(claim.state)) retry = true;
        } catch { retry = true; } // Keep the durable intent; never invent a successful settlement.
        finally { await this.statement(claim).run(); }
      });
    }
    if (retry) await this.schedule(Date.now() + 30000);
  }
}
