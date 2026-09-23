import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { users } from "./users";

// 第三方服务商配置
export const providers = sqliteTable(
  "edm_providers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider", {
      enum: ["amazon_ses", "sendgrid", "mailchimp", "mailgun", "brevo", "smtp", "openai", "anthropic", "deepseek"],
    }).notNull(),
    name: text("name").notNull(), // 用户可自定义配置名称
    apiKey: text("api_key").notNull(),
    config: text("config"), // JSON 格式的附加配置（如 region, port 等）
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
    status: text("status", { enum: ["active", "error"] })
      .notNull()
      .default("active"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("idx_providers_user").on(table.userId),
  ]
);
