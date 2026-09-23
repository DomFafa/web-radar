import { Hono } from "hono";

type Bindings = {
  STORAGE: R2Bucket;
};

export const imagesRoutes = new Hono<{ Bindings: Bindings }>();

imagesRoutes.get("/:key", async (c) => {
  const key = c.req.param("key");
  
  // 仅允许访问 uploads/ 目录
  const object = await c.env.STORAGE.get(`outreach/uploads/${key}`);

  if (!object) {
    return c.notFound();
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  // Cache control: 强缓存 1 年
  headers.set("Cache-Control", "public, max-age=31536000");

  return new Response(object.body, {
    headers,
  });
});
