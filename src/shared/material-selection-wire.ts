import { z } from "zod";

// Selection UI transport shared with Web Radar. Credentials and private source fields never cross it.
export const MATERIAL_SELECTION_PROTOCOL = 1;
const id = z.string().min(1).max(200);
const ids = z.array(id).max(24).refine(values => new Set(values).size === values.length);
export const materialSelectionCardSchema = z.object({ id, name: z.string().max(500), version: id }).strict();
const cards = z.array(materialSelectionCardSchema).max(24).refine(values => new Set(values.map(item => item.id)).size === values.length);
export const materialSelectionRequestSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("choose"), ids }).strict(),
  z.object({ kind: z.literal("load"), page: z.number().int().min(1).max(100000), pageSize: z.number().int().min(1).max(24), q: z.string().max(200) }).strict(),
  z.object({ kind: z.literal("resolve"), products: cards }).strict(),
  z.object({ kind: z.literal("thumbnail"), id, version: id }).strict(),
]);
const webp = z.custom<ArrayBuffer>(value => value instanceof ArrayBuffer && value.byteLength >= 12 && value.byteLength <= 1024 * 1024 && new TextDecoder().decode(new Uint8Array(value, 0, 4)) === "RIFF" && new TextDecoder().decode(new Uint8Array(value, 8, 4)) === "WEBP");
export const materialSelectionResultSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("choose") }).strict(),
  z.object({ kind: z.literal("load"), products: cards, total: z.number().int().min(0) }).strict(),
  z.object({ kind: z.literal("resolve"), products: cards }).strict(),
  z.object({ kind: z.literal("thumbnail"), bytes: webp }).strict(),
]);
const header = { protocolVersion: z.literal(MATERIAL_SELECTION_PROTOCOL), requestId: z.string().uuid() };
export const frameMessageSchema = z.discriminatedUnion("type", [
  z.object({ ...header, type: z.literal("ready") }).strict(),
  z.object({ ...header, type: z.literal("cancel") }).strict(),
  z.object({ ...header, type: z.literal("request"), operationId: z.string().uuid(), request: materialSelectionRequestSchema }).strict(),
]);
export const hostMessageSchema = z.discriminatedUnion("type", [
  z.object({ ...header, type: z.literal("init"), limit: z.number().int().min(1).max(24), excludedIds: ids }).strict(),
  z.object({ ...header, type: z.literal("response"), operationId: z.string().uuid(), result: materialSelectionResultSchema }).strict(),
  z.object({ ...header, type: z.literal("error"), operationId: z.string().uuid(), message: z.string().min(1).max(500) }).strict(),
]);
export type MaterialSelectionCard = z.infer<typeof materialSelectionCardSchema>;
export type MaterialSelectionRequest = z.infer<typeof materialSelectionRequestSchema>;
export type MaterialSelectionResult = z.infer<typeof materialSelectionResultSchema>;
export type FrameMessage = z.infer<typeof frameMessageSchema>;
export type HostMessage = z.infer<typeof hostMessageSchema>;
