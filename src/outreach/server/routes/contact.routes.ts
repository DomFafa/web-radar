import { Hono } from "hono";
import { eq, like, and, desc, sql, count, isNull, getTableColumns } from "drizzle-orm";
import { createDb } from "../../db";
import { contacts, contactGroups } from "../../db/schema";
import type { Bindings, Variables } from "../../shared/types";
import { requireAuth, requirePermission } from "../middleware/auth";
import { importContactsBatch } from "../lib/contact-import";
import { contactImportRoutes } from "./contact-import.routes";
import { bulkContacts, deletableContact, refreshContactCounts, type ContactSelection } from "../lib/contact-bulk";

type Env = { Bindings: Bindings; Variables: Variables };

export const contactRoutes = new Hono<Env>();

// 所有联系人路由需要登录
contactRoutes.use("/*", requireAuth);
contactRoutes.use('/*',async(c,next)=>{
  if(['POST','PUT','PATCH'].includes(c.req.method)) {
    const body=await c.req.json().catch(()=>({}));
    if(body.groupId) {
      const group=await createDb(c.env.DB).select().from(contactGroups).where(and(eq(contactGroups.id,body.groupId),eq(contactGroups.userId,c.get('user')!.id))).get();
      if(!group)return c.json({error:'联系人分组不存在'},404);
    }
  }
  await next();
});

contactRoutes.route("/imports", contactImportRoutes);

// ====== 联系人分组 ======

// 获取分组列表
contactRoutes.get("/groups", requirePermission("contacts:read"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;

  const groups = await db
    .select({ ...getTableColumns(contactGroups), contactCount: sql<number>`(SELECT COUNT(*) FROM edm_contacts c WHERE c.group_id = edm_contact_groups.id AND c.user_id = ${user.id})` })
    .from(contactGroups)
    .where(eq(contactGroups.userId, user.id))
    .orderBy(desc(contactGroups.createdAt));

  const [defaultGroup] = await db
    .select({ contactCount: count() })
    .from(contacts)
    .where(and(
      eq(contacts.userId, user.id),
      isNull(contacts.groupId),
      eq(contacts.subscriptionStatus, "subscribed")
    ));

  return c.json({
    success: true,
    data: groups,
    meta: { defaultContactCount: defaultGroup?.contactCount || 0 },
  });
});

// 创建分组
contactRoutes.post("/groups", requirePermission("contacts:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const body = await c.req.json<{ name: string; description?: string; color?: string }>();

  if (!body.name?.trim()) {
    return c.json({ success: false, error: "分组名称不能为空" }, 400);
  }

  const id = crypto.randomUUID();
  await db.insert(contactGroups).values({
    id,
    userId: user.id,
    name: body.name.trim(),
    description: body.description?.trim() || null,
    color: body.color || "#6366f1",
  });

  const [group] = await db.select().from(contactGroups).where(eq(contactGroups.id, id));
  return c.json({ success: true, data: group }, 201);
});

// 更新分组
contactRoutes.put("/groups/:id", requirePermission("contacts:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const groupId = c.req.param("id");
  const body = await c.req.json<{ name?: string; description?: string; color?: string }>();

  const [existing] = await db
    .select()
    .from(contactGroups)
    .where(and(eq(contactGroups.id, groupId), eq(contactGroups.userId, user.id)));

  if (!existing) {
    return c.json({ success: false, error: "分组不存在" }, 404);
  }

  await db
    .update(contactGroups)
    .set({
      ...(body.name && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.color && { color: body.color }),
      updatedAt: new Date(),
    })
    .where(eq(contactGroups.id, groupId));

  const [updated] = await db.select().from(contactGroups).where(eq(contactGroups.id, groupId));
  return c.json({ success: true, data: updated });
});

// 删除分组
contactRoutes.delete("/groups/:id", requirePermission("contacts:delete"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const groupId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(contactGroups)
    .where(and(eq(contactGroups.id, groupId), eq(contactGroups.userId, user.id)));

  if (!existing) {
    return c.json({ success: false, error: "分组不存在" }, 404);
  }

  const deleteContacts = c.req.query("deleteContacts") === "true";
  const statements: D1PreparedStatement[] = [];
  if (deleteContacts) {
    statements.push(c.env.DB.prepare(`DELETE FROM edm_contacts WHERE user_id = ? AND group_id = ? AND ${deletableContact}`)
      .bind(user.id, groupId));
  }
  // If protected contacts remain, keep the group as well.
  statements.push(c.env.DB.prepare(`DELETE FROM edm_contact_groups WHERE id = ? AND user_id = ?
    ${deleteContacts ? "AND NOT EXISTS(SELECT 1 FROM edm_contacts WHERE group_id = ? AND user_id = ?)" : ""}`)
    .bind(groupId, user.id, ...(deleteContacts ? [groupId, user.id] : [])));
  statements.push(refreshContactCounts(c.env.DB, user.id));
  const results = await c.env.DB.batch(statements);
  return c.json({ success: true, data: { deleted: results[deleteContacts ? 1 : 0].meta.changes > 0,
    deletedContacts: deleteContacts ? results[0].meta.changes : 0 } });
});

// 获取当前用户的联系人标签及有效订阅联系人数量
contactRoutes.get("/tags", requirePermission("contacts:read"), async (c) => {
  const user = c.get("user")!;
  const result = await c.env.DB.prepare(`
    SELECT CAST(tag.value AS TEXT) AS name, COUNT(DISTINCT contact.id) AS contactCount
    FROM edm_contacts AS contact,
      json_each(CASE WHEN json_valid(contact.tags) THEN contact.tags ELSE '[]' END) AS tag
    WHERE contact.user_id = ?
      AND contact.subscription_status = 'subscribed'
      AND TRIM(CAST(tag.value AS TEXT)) <> ''
    GROUP BY CAST(tag.value AS TEXT)
    ORDER BY contactCount DESC, name ASC
  `).bind(user.id).all<{ name: string; contactCount: number }>();

  return c.json({ success: true, data: result.results || [] });
});

// ====== 联系人 CRUD ======

// 获取联系人列表（分页 + 筛选）
contactRoutes.get("/", requirePermission("contacts:read"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;

  const page = parseInt(c.req.query("page") || "1");
  const pageSize = Math.min(parseInt(c.req.query("pageSize") || "20"), 100);
  const search = c.req.query("search");
  const groupId = c.req.query("groupId");
  const tag = c.req.query("tag");
  const status = c.req.query("subscriptionStatus");

  const conditions = [eq(contacts.userId, user.id)];
  if (search) {
    conditions.push(
      like(contacts.email, `%${search}%`)
    );
  }
  if (groupId) {
    if (groupId === "null") {
      conditions.push(isNull(contacts.groupId));
    } else {
      conditions.push(eq(contacts.groupId, groupId));
    }
  }
  if (tag) {
    conditions.push(sql`EXISTS (
      SELECT 1
      FROM json_each(CASE WHEN json_valid(${contacts.tags}) THEN ${contacts.tags} ELSE '[]' END)
      WHERE CAST(value AS TEXT) = ${tag}
    )`);
  }
  if (status) {
    conditions.push(eq(contacts.subscriptionStatus, status as any));
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(contacts)
    .where(whereClause);

  const total = totalResult?.count || 0;

  const data = await db
    .select()
    .from(contacts)
    .where(whereClause)
    .orderBy(desc(contacts.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return c.json({
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// 获取单个联系人
contactRoutes.get("/:id", requirePermission("contacts:read"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const contactId = c.req.param("id");

  const [contact] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.userId, user.id)));

  if (!contact) {
    return c.json({ success: false, error: "联系人不存在" }, 404);
  }

  return c.json({ success: true, data: contact });
});

// 创建联系人
contactRoutes.post("/", requirePermission("contacts:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const body = await c.req.json<{
    email: string;
    name?: string;
    company?: string;
    website?: string;
    industry?: string;
    region?: string;
    title?: string;
    phone?: string;
    groupId?: string;
    tags?: string[];
  }>();

  if (!body.email?.trim()) {
    return c.json({ success: false, error: "邮箱地址不能为空" }, 400);
  }

  // 检查邮箱是否已存在
  const [existing] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.email, body.email.trim().toLowerCase()), eq(contacts.userId, user.id)));

  if (existing) {
    return c.json({ success: false, error: "该邮箱已存在" }, 409);
  }

  const id = crypto.randomUUID();
  await db.insert(contacts).values({
    id,
    userId: user.id,
    email: body.email.trim().toLowerCase(),
    name: body.name?.trim() || null,
    company: body.company?.trim() || null,
    website: body.website?.trim() || null,
    industry: body.industry?.trim() || null,
    region: body.region?.trim() || null,
    title: body.title?.trim() || null,
    phone: body.phone?.trim() || null,
    groupId: body.groupId || null,
    tags: body.tags?.length
      ? JSON.stringify([...new Set(body.tags.map((tag) => String(tag).trim()).filter(Boolean))])
      : null,
    source: "manual",
  });

  // 更新分组联系人数量
  if (body.groupId) {
    await db.run(
      sql`UPDATE edm_contact_groups SET contact_count = contact_count + 1 WHERE id = ${body.groupId}`
    );
  }

  const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
  return c.json({ success: true, data: contact }, 201);
});

// 批量导入联系人 (CSV 解析)
contactRoutes.post("/import", requirePermission("contacts:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const body = await c.req.json<{
    contacts: Array<{
      email: string;
      name?: string;
      company?: string;
      website?: string;
      industry?: string;
      region?: string;
      tags?: string[];
    }>;
    groupId?: string;
    overwrite?: boolean;
  }>();

  if (!body.contacts?.length) {
    return c.json({ success: false, error: "联系人列表不能为空" }, 400);
  }

  if (body.contacts.length > 500) return c.json({ success: false, error: "每批最多 500 位联系人" }, 400);
  if (body.groupId) {
    const [group] = await db.select({ id: contactGroups.id }).from(contactGroups)
      .where(and(eq(contactGroups.id, body.groupId), eq(contactGroups.userId, user.id)));
    if (!group) return c.json({ success: false, error: "分组不存在" }, 400);
  }
  const data = await importContactsBatch(c.env.DB, user.id, body.contacts, body.groupId, body.overwrite === true);
  return c.json({ success: true, data });
});

// 更新联系人
contactRoutes.put("/:id", requirePermission("contacts:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const contactId = c.req.param("id");
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.userId, user.id)));

  if (!existing) {
    return c.json({ success: false, error: "联系人不存在" }, 404);
  }

  const updateData: Record<string, any> = { updatedAt: new Date() };
  const allowedFields = [
    "name", "company", "website", "industry", "region",
    "title", "phone", "groupId",
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }
  if (body.tags !== undefined) {
    const normalizedTags = Array.isArray(body.tags)
      ? [...new Set(body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean))]
      : [];
    updateData.tags = normalizedTags.length ? JSON.stringify(normalizedTags) : null;
  }

  if (body.groupId !== undefined) {
    const previousGroupId = existing.groupId || null;
    const nextGroupId = body.groupId || null;
    if (previousGroupId !== nextGroupId) {
      if (previousGroupId) {
        await db.run(sql`UPDATE edm_contact_groups SET contact_count = MAX(0, contact_count - 1) WHERE id = ${previousGroupId}`);
      }
      if (nextGroupId) {
        await db.run(sql`UPDATE edm_contact_groups SET contact_count = contact_count + 1 WHERE id = ${nextGroupId}`);
      }
      updateData.groupId = nextGroupId;
    }
  }

  await db.update(contacts).set(updateData).where(eq(contacts.id, contactId));

  const [updated] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  return c.json({ success: true, data: updated });
});

// 删除联系人
contactRoutes.delete("/:id", requirePermission("contacts:delete"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const contactId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, contactId), eq(contacts.userId, user.id)));

  if (!existing) {
    return c.json({ success: false, error: "联系人不存在" }, 404);
  }

  const result = await bulkContacts(c.env.DB, user.id, { ids: [contactId] }, "delete");
  if (result.protected) return c.json({ error: "该联系人关联未结束的营销活动，暂不能删除" }, 409);
  return c.json({ success: true, data: { deleted: true } });
});

// 批量删除联系人
contactRoutes.post("/batch-delete", requirePermission("contacts:delete"), async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json<ContactSelection>();
  try {
    const result = await bulkContacts(c.env.DB, user.id, body, "delete");
    return c.json({ success: true, data: { deleted: result.changed, protected: result.protected } });
  } catch (error: any) {
    if (error.message === "请选择联系人") return c.json({ error: error.message }, 400);
    throw error;
  }
});

contactRoutes.post("/batch-move", requirePermission("contacts:write"), async (c) => {
  const userId = c.get("user")!.id;
  const body = await c.req.json<ContactSelection & { groupId?: string | null }>();
  if (body.groupId) {
    const group = await c.env.DB.prepare("SELECT id FROM edm_contact_groups WHERE id = ? AND user_id = ?")
      .bind(body.groupId, userId).first();
    if (!group) return c.json({ error: "目标分组不存在" }, 400);
  }
  try {
    const result = await bulkContacts(c.env.DB, userId, body, "move", body.groupId);
    return c.json({ data: { moved: result.changed } });
  } catch (error: any) {
    if (error.message === "请选择联系人") return c.json({ error: error.message }, 400);
    throw error;
  }
});
