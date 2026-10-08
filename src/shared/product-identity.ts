import { z } from "zod";
export const productIdentityFamilies = ["general", "toy", "plush", "apparel", "footwear", "bags", "jewelry", "home", "furniture", "kitchen", "drinkware", "beauty", "electronics", "tools", "outdoor", "pet", "stationery", "flat", "food"] as const;
export const MAX_PRODUCT_IDENTITY_JSON_LENGTH = 6_000;
export const MAX_PRODUCT_IDENTITY_JSON_BYTES = 16_384;
const PRODUCT_IDENTITY_PROMPT_PREFIX = "Product identity: ";
export const MAX_PRODUCT_IDENTITY_PROMPT_LENGTH = PRODUCT_IDENTITY_PROMPT_PREFIX.length + MAX_PRODUCT_IDENTITY_JSON_LENGTH;

/** A complete list only when distinctCount is known; quantities describe the sales pack, not a shot. */
export const ProductAssortmentSchema = z.object({
  distinctCount: z.number().int().min(1).max(8).nullable(),
  variants: z.array(z.object({
    name: z.string().trim().min(1).max(32),
    quantity: z.number().int().min(1).max(9999).nullable(),
    shape: z.string().trim().max(80),
    colors: z.array(z.string().trim().min(1).max(32)).max(4),
    features: z.array(z.string().trim().min(1).max(48)).max(3),
  }).strict()).min(1).max(8),
}).strict().refine(value => value.distinctCount === null || value.distinctCount === value.variants.length,
  "A known distinct count requires one entry per distinct design")
  .refine(value => new Set(value.variants.map(variant => variant.name.toLocaleLowerCase())).size === value.variants.length,
    "Assortment design names must be unique");
export type ProductAssortment = z.infer<typeof ProductAssortmentSchema>;

/** Internal design facts. The owning product ID and image revision identify the snapshot. */
export const ProductIdentitySchema = z.object({
  version: z.literal(1),
  family: z.enum(productIdentityFamilies),
  composition: z.enum(["single", "set", "accessories", "unknown"]),
  packCount: z.number().int().min(1).max(9999).nullable(),
  assortment: ProductAssortmentSchema.nullable().optional(),
  packagingBox: z.enum(["present", "absent", "unknown"]),
  subjectVisible: z.boolean(),
  geometry: z.enum(["visible", "concept"]),
  parts: z.array(z.object({ name: z.string().trim().min(1).max(48), count: z.number().int().min(1).max(9999).nullable(), kind: z.enum(["integral", "included"]) }).strict()).max(6),
  shape: z.string().trim().max(120),
  colors: z.array(z.string().trim().min(1).max(32)).max(6),
  features: z.array(z.string().trim().min(1).max(80)).max(4),
}).strict().refine(value => value.composition !== "single" || value.packCount === null || value.packCount === 1,
  "Multiple sold units must use set composition; packaging artwork is not an extra unit")
  .refine(value => !value.assortment || value.composition !== "single" ||
    value.assortment.variants.length === 1 && (value.assortment.variants[0].quantity ?? 1) === 1,
    "Multiple sold designs or units cannot use single composition")
  .refine(value => {
    if (!value.assortment || value.packCount === null) return true;
    const { distinctCount, variants } = value.assortment;
    if ((distinctCount ?? variants.length) > value.packCount) return false;
    const knownTotal = variants.reduce((sum, variant) => sum + (variant.quantity ?? 0), 0);
    return distinctCount !== null && variants.every(variant => variant.quantity !== null)
      ? knownTotal === value.packCount : knownTotal + variants.filter(variant => variant.quantity === null).length <= value.packCount;
  }, "Assortment quantities must match the total pack count when complete and never exceed it")
  .refine(value => {
    const serialized = JSON.stringify(value);
    return serialized.length <= MAX_PRODUCT_IDENTITY_JSON_LENGTH && new TextEncoder().encode(serialized).length <= MAX_PRODUCT_IDENTITY_JSON_BYTES;
  }, `Product identity exceeds the ${MAX_PRODUCT_IDENTITY_JSON_LENGTH}-character or ${MAX_PRODUCT_IDENTITY_JSON_BYTES}-byte budget`);
export type ProductIdentity = z.infer<typeof ProductIdentitySchema>;
// OpenAI structured output uses the same field definitions; refinements run locally.
export const productIdentityJsonSchema = z.toJSONSchema(ProductIdentitySchema.safeExtend({ assortment: ProductAssortmentSchema.nullable() }), { unrepresentable: "any" });
export const PRODUCT_IDENTITY_INSTRUCTIONS = `Include internal productIdentity in this SAME planning response: version=1; family one of ${productIdentityFamilies.join(",")}; composition single/set/accessories/unknown; exact packCount TOTAL sold pieces or null (single cannot have count >1); assortment is null when unknown, otherwise {distinctCount,variants:[{name,quantity,shape,colors,features}]}. distinctCount counts different designs, NEVER total pieces; use null if the distinct list is incomplete. variants <=8, one per distinct design: name <=32, quantity exact per-design sold pieces or null, shape <=80, colors <=4 short names, features <=3 concise visible attributes <=48 each. A known distinctCount requires a complete list and exact quantities must sum to packCount; never infer equal splits, designs or counts from a pack total. Preserve every supported distinct design when there are at most eight. Only when the source contains more than eight designs, leave distinctCount null and preserve supported representative entries. Gather these facts in this same planning response, without another visual verification call. Keep all identity JSON within ${MAX_PRODUCT_IDENTITY_JSON_LENGTH} characters and ${MAX_PRODUCT_IDENTITY_JSON_BYTES} bytes. Use concise descriptions without omitting known counts, designs or defining facts to satisfy the budget; packagingBox present/absent/unknown describes the designed outer retail package, not an integral bottle; subjectVisible says whether the complete product is shown outside the package; geometry concept only for a simple sculptural toy/plush whose unshown shape is part of this design, otherwise visible. parts <=6 explicit integral components/included accessories with name <=48, exact count or null, kind integral/included; do not list environmental props. shape <=120 characters, colors <=6 short names (32 each), features <=4 concise visible defining features (80 each). Use empty strings/arrays or unknown for unsupported facts. Keep unchanged identity fields when editing or making a series variant, change every affected field alongside the image and copy. Never count a boxed and loose depiction of the same unit twice. These internal facts are not customer copy or proof of successful rendering.`;

export function compactProductIdentity(value: ProductIdentity): string {
  const facts = ProductIdentitySchema.parse(value);
  const prompt = `${PRODUCT_IDENTITY_PROMPT_PREFIX}${JSON.stringify(facts)}`;
  if (prompt.length > MAX_PRODUCT_IDENTITY_PROMPT_LENGTH) throw new Error("Product identity exceeds its prompt budget");
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
