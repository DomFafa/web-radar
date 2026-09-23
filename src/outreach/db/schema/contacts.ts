import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users } from "./users";

// 联系人分组
export const contactGroups = sqliteTable("edm_contact_groups", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6366f1"), // 分组颜色标识
  contactCount: integer("contact_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// 联系人 — 支持手动导入 + 未来采集模块自动写入
export const contacts = sqliteTable(
  "edm_contacts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    groupId: text("group_id").references(() => contactGroups.id, {
      onDelete: "set null",
    }),
    email: text("email").notNull(),
    name: text("name"),
    company: text("company"),
    website: text("website"),
    industry: text("industry"),
    region: text("region"),
    title: text("title"), // 职位
    phone: text("phone"),
    tags: text("tags"), // JSON 数组: ["tag1", "tag2"]
    // 来源追踪
    source: text("source", {
      enum: ["manual", "csv_import", "serp_crawler", "api"],
    })
      .notNull()
      .default("manual"),
    sourceDetail: text("source_detail"), // 比如 keyword_id 或文件名
    // 邮箱验证状态 (预留给邮箱验证模块)
    verificationStatus: text("verification_status", {
      enum: ["unverified", "valid", "invalid", "catch_all", "risky"],
    })
      .notNull()
      .default("unverified"),
    bounceRisk: text("bounce_risk", {
      enum: ["unknown", "low", "medium", "high"],
    })
      .notNull()
      .default("unknown"),
    // 订阅状态 (GDPR/CAN-SPAM 合规)
    subscriptionStatus: text("subscription_status", {
      enum: ["subscribed", "unsubscribed", "bounced", "complained"],
    })
      .notNull()
      .default("subscribed"),
    unsubscribedAt: integer("unsubscribed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("idx_contacts_email").on(table.email),
    index("idx_contacts_user").on(table.userId),
    index("idx_contacts_group").on(table.groupId),
    index("idx_contacts_subscription").on(table.subscriptionStatus),
  ]
);
