import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";

type Bindings = {
  DB: D1Database;
  STORAGE: R2Bucket;
};

export const uploadRoutes = new Hono<{ Bindings: Bindings }>();

// 必须登录才能上传图片
uploadRoutes.use("/*", requireAuth);

uploadRoutes.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["image"] as File;

  if (!file) {
    return c.json({ error: "No image file provided" }, 400);
  }

  // 检查文件类型
  if (!(file instanceof File) || file.size>8*1024*1024 || !["image/png","image/jpeg","image/webp","image/gif"].includes(file.type)) {
    return c.json({ error: "Uploaded file is not an image" }, 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const extension = ({'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'} as Record<string,string>)[file.type];
  const key = `outreach/uploads/${crypto.randomUUID()}.${extension}`;

  await c.env.STORAGE.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  });

  // Email recipients use the existing public outreach image route.
  const url = new URL(c.req.url);
  const imageUrl = `${url.origin}/api/outreach/images/${key.replace("outreach/uploads/", "")}`;

  return c.json({ success: true, url: imageUrl });
});
