import { z } from "zod";
export const productIdentityFamilies = ["general", "toy", "plush", "apparel", "footwear", "bags", "jewelry", "home", "furniture", "kitchen", "drinkware", "beauty", "electronics", "tools", "outdoor", "pet", "stationery", "flat", "food"] as const;

/** Internal design facts. The owning product ID and image revision identify the snapshot. */
export const ProductIdentitySchema = z.object({
  version: z.literal(1),
  family: z.enum(productIdentityFamilies),
  composition: z.enum(["single", "set", "accessories", "unknown"]),
  packCount: z.number().int().min(1).max(9999).nullable(),
  packagingBox: z.enum(["present", "absent", "unknown"]),
  subjectVisible: z.boolean(),
  geometry: z.enum(["visible", "concept"]),
  parts: z.array(z.object({ name: z.string().trim().min(1).max(48), count: z.number().int().min(1).max(9999).nullable(), kind: z.enum(["integral", "included"]) }).strict()).max(6),
  shape: z.string().trim().max(120),
  colors: z.array(z.string().trim().min(1).max(32)).max(6),
  features: z.array(z.string().trim().min(1).max(80)).max(4),
}).strict().refine(value => value.composition !== "single" || value.packCount === null || value.packCount === 1,
  "Multiple sold units must use set composition; packaging artwork is not an extra unit")
  .refine(value => JSON.stringify(value).length <= 1800 && new TextEncoder().encode(JSON.stringify(value)).length <= 4096,
    "Product identity exceeds the 1800-character or 4096-byte storage budget");
export type ProductIdentity = z.infer<typeof ProductIdentitySchema>;
// OpenAI structured output uses the same field definitions; refinements run locally.
export const productIdentityJsonSchema = z.toJSONSchema(ProductIdentitySchema, { unrepresentable: "any" });
export const PRODUCT_IDENTITY_INSTRUCTIONS = `Include internal productIdentity in this SAME planning response: version=1; family one of ${productIdentityFamilies.join(",")}; composition single/set/accessories/unknown; exact packCount or null (single cannot have count >1); packagingBox present/absent/unknown describes the designed outer retail package, not an integral bottle; subjectVisible says whether the complete product is shown outside the package; geometry concept only for a simple sculptural toy/plush whose unshown shape is part of this design, otherwise visible. parts <=6 explicit integral components/included accessories with name <=48, exact count or null, kind integral/included; do not list environmental props. shape <=120 characters, colors <=6 short names (32 each), features <=4 concise visible defining features (80 each). Use empty strings/arrays or unknown for unsupported facts. Keep unchanged identity fields when editing or making a series variant, change every affected field alongside the image and copy. Never count a boxed and loose depiction of the same unit twice. These internal facts are not customer copy or proof of successful rendering.`;

export function compactProductIdentity(value: ProductIdentity): string {
  const facts = ProductIdentitySchema.parse(value);
  const prompt = `Product identity: ${JSON.stringify(facts)}`;
  if (prompt.length > 2000) throw new Error("Product identity exceeds its prompt budget");
  return prompt;
}

export function identityFromProvenance(json: string | null | undefined): ProductIdentity | undefined {
  if (!json) return undefined;
  const value = (JSON.parse(json) as { productIdentity?: unknown }).productIdentity;
  return value == null ? undefined : ProductIdentitySchema.parse(value);
}

/** Preferred families rank options; requirements alone can exclude an option. */
export const TemplateProductApplicabilitySchema = z.object({
  version: z.literal(1), preferredFamilies: z.array(z.enum(productIdentityFamilies)).max(19),
  requiresPackaging: z.boolean(),
}).strict();
export type TemplateProductApplicability = z.infer<typeof TemplateProductApplicabilitySchema>;
