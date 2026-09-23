import { Hono } from "hono";
import type { Bindings, Variables } from "../../shared/types";
import { requirePermission } from "../middleware/auth";
import { csvCell } from "../lib/campaign-report";
import { importContactsBatch } from "../lib/contact-import";

export const contactImportRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

contactImportRoutes.get("/", requirePermission("contacts:read"), async (c) => {
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const result = await c.env.DB.prepare("SELECT * FROM edm_contact_import_jobs WHERE user_id = ? ORDER BY created_at DESC, id LIMIT 20 OFFSET ?")
    .bind(c.get("user")!.id, (page - 1) * 20).all();
  return c.json({ data: result.results });
});

contactImportRoutes.post("/", requirePermission("contacts:write"), async (c) => {
  const userId = c.get("user")!.id;
  const body = await c.req.json();
  if (!Number.isInteger(body.total) || body.total < 1 || body.total > 100000) {
    return c.json({ error: "每次导入支持 1 至 100000 行" }, 400);
  }
  const group = body.groupId ? await c.env.DB.prepare("SELECT name FROM edm_contact_groups WHERE id = ? AND user_id = ?")
    .bind(body.groupId, userId).first<{ name: string }>() : null;
  if (body.groupId && !group) return c.json({ error: "分组不存在" }, 400);
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await c.env.DB.prepare(`INSERT INTO edm_contact_import_jobs
    (id, user_id, name, group_id, group_name, overwrite, total, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, userId,
      String(body.name || "粘贴导入").slice(0, 200), body.groupId || null,
      group?.name || "默认分组", body.overwrite === true ? 1 : 0, body.total, now, now).run();
  return c.json({ data: { id } }, 201);
});

contactImportRoutes.use("/:id/*", async (c, next) => {
  const job = await c.env.DB.prepare("SELECT id FROM edm_contact_import_jobs WHERE id = ? AND user_id = ?")
    .bind(c.req.param("id"), c.get("user")!.id).first();
  if (!job) return c.json({ error: "导入记录不存在" }, 404);
  await next();
});

contactImportRoutes.post("/:id/batches", requirePermission("contacts:write"), async (c) => {
  const id = c.req.param("id");
  const userId = c.get("user")!.id;
  const job = await c.env.DB.prepare("SELECT * FROM edm_contact_import_jobs WHERE id = ? AND user_id = ?")
    .bind(id, userId).first<any>();
  if (!job) return c.json({ error: "导入记录不存在" }, 404);
  const body = await c.req.json();
  if (!Number.isInteger(body.batchIndex) || body.batchIndex < 0 || !Array.isArray(body.contacts)
    || body.contacts.length !== Math.min(500, job.total - body.batchIndex * 500) || !body.contacts.length) {
    return c.json({ error: "导入批次或行数无效" }, 400);
  }
  const cached = async () => {
    const existing = await c.env.DB.prepare("SELECT batch_index FROM edm_contact_import_batches WHERE job_id = ? AND batch_index = ?")
      .bind(id, body.batchIndex).first();
    if (!existing) return null;
    const rows = await c.env.DB.prepare(`SELECT status, COUNT(*) AS n FROM edm_contact_import_rows
      WHERE job_id = ? AND row_number > ? AND row_number <= ? GROUP BY status`)
      .bind(id, body.batchIndex * 500, (body.batchIndex + 1) * 500).all<{ status: string; n: number }>();
    return { imported: 0, updated: 0, skipped: 0, failed: 0, total: body.contacts.length,
      ...Object.fromEntries(rows.results.map((row) => [row.status, row.n])) };
  };
  const prior = await cached();
  if (prior) return c.json({ data: prior });
  if (body.batchIndex * 500 !== job.processed) return c.json({ error: "请按顺序提交导入批次" }, 409);
  if (job.group_id) {
    const group = await c.env.DB.prepare("SELECT id FROM edm_contact_groups WHERE id = ? AND user_id = ?")
      .bind(job.group_id, userId).first();
    if (!group) return c.json({ error: "目标分组已删除，请重新选择分组导入" }, 409);
  }
  try {
    const data = await importContactsBatch(c.env.DB, userId, body.contacts, job.group_id || undefined,
      Boolean(job.overwrite), { id, batchIndex: body.batchIndex });
    return c.json({ data });
  } catch (error) {
    const completed = await cached();
    if (completed) return c.json({ data: completed });
    console.error("Contact import batch failed", id, body.batchIndex, error);
    await c.env.DB.prepare("UPDATE edm_contact_import_jobs SET error = ?, updated_at = ? WHERE id = ? AND user_id = ?")
      .bind(`第 ${body.batchIndex + 1} 批写入失败，已回滚；请重试该批次`, Math.floor(Date.now() / 1000), id, userId).run();
    return c.json({ error: "本批写入失败，未提交数据；可重试" }, 500);
  }
});

contactImportRoutes.get("/:id/rows", requirePermission("contacts:read"), async (c) => {
  const page = Math.max(1, Number(c.req.query("page")) || 1);
  const id = c.req.param("id");
  const job = await c.env.DB.prepare("SELECT * FROM edm_contact_import_jobs WHERE id = ? AND user_id = ?")
    .bind(id, c.get("user")!.id).first();
  if (!job) return c.json({ error: "导入记录不存在" }, 404);
  const status = c.req.query("status") || "";
  if (status && !["imported", "updated", "skipped", "failed"].includes(status)) return c.json({ error: "结果筛选无效" }, 400);
  const where = `job_id = ?${status ? " AND status = ?" : ""}`;
  const params = status ? [id, status] : [id];
  const result = await c.env.DB.prepare(`SELECT * FROM edm_contact_import_rows WHERE ${where} ORDER BY row_number LIMIT 100 OFFSET ?`)
    .bind(...params, (page - 1) * 100).all();
  const total = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM edm_contact_import_rows WHERE ${where}`).bind(...params).first<{ n: number }>();
  return c.json({ data: result.results, job, meta: { total: total?.n || 0 } });
});

contactImportRoutes.get("/:id/export", requirePermission("contacts:read"), async (c) => {
  const job = await c.env.DB.prepare("SELECT * FROM edm_contact_import_jobs WHERE id = ? AND user_id = ?")
    .bind(c.req.param("id"), c.get("user")!.id).first<any>();
  if (!job) return c.json({ error: "导入记录不存在" }, 404);
  const result = await c.env.DB.prepare("SELECT * FROM edm_contact_import_rows WHERE job_id = ? ORDER BY row_number")
    .bind(job.id).all<any>();
  const byNumber = new Map(result.results.map((row) => [row.row_number, row]));
  const labels: Record<string, string> = { imported: "成功（新增）", updated: "成功（覆盖）", skipped: "跳过", failed: "失败" };
  const lines = [["导入任务", "目标分组", "数据行号", "邮箱", "结果", "原因"].map(csvCell).join(",")];
  for (let index = 1; index <= job.total; index++) {
    const row = byNumber.get(index);
    lines.push([job.name, job.group_name, index, row?.email || "", row ? labels[row.status] : "未处理",
      row?.reason || (row ? "" : job.error || "尚未提交或导入中断，未收到该行数据")].map(csvCell).join(","));
  }
  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", 'attachment; filename="contact-import-report.csv"');
  c.header("Cache-Control", "no-store");
  return c.body("\uFEFF" + lines.join("\r\n") + "\r\n");
});
