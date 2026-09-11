import type { Asset, Inquiry, Job, Project, Quota, Release } from '../shared/model';
import { DomainError } from './domain';

type Table = 'projects' | 'assets' | 'jobs' | 'releases' | 'inquiries';
type Entity = Project | Asset | Job | Release | Inquiry;
export class DomainStore {
  constructor(readonly db: D1Database) {}
  async one<T extends Entity>(table: Table, id: string): Promise<T | undefined> {
    const row = await this.db
      .prepare(`SELECT data FROM ${table} WHERE id=?`)
      .bind(id)
      .first<{ data: string }>();
    return row ? (JSON.parse(row.data) as T) : undefined;
  }
  async list<T extends Entity>(
    table: Table,
    where = '',
    values: unknown[] = [],
    order = '',
  ): Promise<T[]> {
    const rows = await this.db
      .prepare(
        `SELECT data FROM ${table}${where ? ` WHERE ${where}` : ''}${order ? ` ORDER BY ${order}` : ''}`,
      )
      .bind(...values)
      .all<{ data: string }>();
    return rows.results.map((r) => JSON.parse(r.data) as T);
  }
  insert(table: Table, value: Entity): D1PreparedStatement {
    if (table === 'projects') {
      const p = value as Project;
      return this.db
        .prepare('INSERT INTO projects(id,owner_id,workspace_id,version,data) VALUES(?,?,?,?,?)')
        .bind(p.id, p.ownerId, p.workspaceId, p.version, JSON.stringify(p));
    }
    if (table === 'jobs') {
      const j = value as Job;
      return this.db
        .prepare(
          'INSERT INTO jobs(id,project_id,user_id,kind,status,created_at,data) VALUES(?,?,?,?,?,?,?)',
        )
        .bind(j.id, j.projectId, j.userId, j.kind, j.status, j.createdAt, JSON.stringify(j));
    }
    if (table === 'inquiries') {
      const i = value as Inquiry;
      return this.db
        .prepare(
          'INSERT INTO inquiries(id,project_id,request_id,created_at,data) VALUES(?,?,?,?,?)',
        )
        .bind(i.id, i.projectId, i.requestId, i.createdAt, JSON.stringify(i));
    }
    if (table === 'releases') {
      const r = value as Release;
      return this.db
        .prepare('INSERT INTO releases(id,project_id,created_at,data) VALUES(?,?,?,?)')
        .bind(r.id, r.projectId, r.createdAt, JSON.stringify(r));
    }
    const a = value as Asset;
    return this.db
      .prepare('INSERT INTO assets(id,project_id,data) VALUES(?,?,?)')
      .bind(a.id, a.projectId, JSON.stringify(a));
  }
  update(table: Table, value: Entity): D1PreparedStatement {
    if (table === 'projects') {
      const p = value as Project;
      return this.db
        .prepare('UPDATE projects SET version=?, data=? WHERE id=?')
        .bind(p.version, JSON.stringify(p), p.id);
    }
    if (table === 'jobs') {
      const j = value as Job;
      return this.db
        .prepare('UPDATE jobs SET status=?,data=? WHERE id=?')
        .bind(j.status, JSON.stringify(j), j.id);
    }
    return this.db
      .prepare(`UPDATE ${table} SET data=? WHERE id=?`)
      .bind(JSON.stringify(value), value.id);
  }
  async quota(userId: string): Promise<Quota> {
    const q = await this.db
      .prepare('SELECT * FROM quotas WHERE user_id=?')
      .bind(userId)
      .first<{
        user_id: string;
        image_limit: number;
        video_limit: number;
        image_used: number;
        video_used: number;
        image_reserved: number;
        video_reserved: number;
      }>();
    return q
      ? {
          userId: q.user_id,
          imageLimit: q.image_limit,
          videoLimit: q.video_limit,
          imageUsed: q.image_used,
          videoUsed: q.video_used,
          imageReserved: q.image_reserved,
          videoReserved: q.video_reserved,
        }
      : {
          userId,
          imageLimit: 0,
          videoLimit: 0,
          imageUsed: 0,
          videoUsed: 0,
          imageReserved: 0,
          videoReserved: 0,
        };
  }
  async quotas(): Promise<Quota[]> {
    const result = await this.db
      .prepare('SELECT user_id FROM quotas ORDER BY user_id')
      .all<{ user_id: string }>();
    return Promise.all(result.results.map((q) => this.quota(q.user_id)));
  }
  async idempotent<T>(
    scope: string,
    requestId: string,
    fingerprint: string,
  ): Promise<T | undefined> {
    const row = await this.db
      .prepare('SELECT fingerprint,result FROM idempotency WHERE scope=? AND request_id=?')
      .bind(scope, requestId)
      .first<{ fingerprint: string; result: string }>();
    if (!row) return undefined;
    if (row.fingerprint !== fingerprint)
      throw new DomainError(409, 'request_conflict', '相同请求标识不能用于不同内容。');
    return JSON.parse(row.result) as T;
  }
  remember(
    scope: string,
    requestId: string,
    fingerprint: string,
    result: unknown,
  ): D1PreparedStatement {
    return this.db
      .prepare('INSERT INTO idempotency(scope,request_id,fingerprint,result) VALUES(?,?,?,?)')
      .bind(scope, requestId, fingerprint, JSON.stringify(result));
  }
  async settlement(job: Job, success: boolean): Promise<D1PreparedStatement[]> {
    if (job.kind !== 'image' && job.kind !== 'video') return [];
    const ledger = await this.db
      .prepare('SELECT state FROM quota_ledger WHERE job_id=?')
      .bind(job.id)
      .first<{ state: string }>();
    if (ledger?.state !== 'reserved') return [];
    const kind = job.kind;
    return [
      this.db
        .prepare(
          `UPDATE quotas SET ${kind}_reserved=${kind}_reserved-1,${kind}_used=${kind}_used+? WHERE user_id=?`,
        )
        .bind(success ? 1 : 0, job.userId),
      this.db
        .prepare('UPDATE quota_ledger SET state=?,updated_at=? WHERE job_id=? AND state=?')
        .bind(success ? 'committed' : 'released', new Date().toISOString(), job.id, 'reserved'),
    ];
  }
  async batch(statements: D1PreparedStatement[]): Promise<void> {
    if (statements.length) await this.db.batch(statements);
  }
}
