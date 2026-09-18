import { z } from 'zod';
const id = z.string().min(1).max(200);
export const productImageKind = z.enum([
  'original',
  'angle',
  'detail',
  'accessory',
  'group',
  'scene',
  'packaging',
  'function',
]);
const websiteCopy = z.object({
  name: z.string().min(1).max(100),
  tagline: z.string().min(1).max(160),
  description: z.string().min(1).max(700),
  sellingPoints: z.array(z.string().min(1).max(180)).min(3).max(5),
  applications: z.array(z.string().min(1).max(180)).min(1).max(5),
});
// Legacy snapshots remain valid in already saved projects; new imports require a product set.
export const productSnapshotSchema = z
  .object({
    source: z.literal('product-radar'),
    id,
    sourceProjectId: id.nullable(),
    workflow: z.enum(['create', 'build', 'upload']),
    version: id,
    name: z.string().max(500),
    description: z.string().max(10000),
    material: z.string().max(2000),
    dimensions: z.string().max(2000),
    seriesName: z.string().max(1000),
    designDirection: z.string().max(10000),
    conditions: z.record(z.string(), z.unknown()),
    image: z.object({ sourceProductId: id, contentType: z.string().nullable() }),
    factsOrigin: z.enum(['generated-concept', 'product-set']),
    websiteCopy: websiteCopy.optional(),
    images: z
      .array(
        z.object({
          id,
          kind: productImageKind,
          caption: z.string().max(1000),
          contentType: z.string().nullable(),
        }),
      )
      .min(1)
      .max(11)
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.factsOrigin !== 'product-set') return;
    if (
      !value.websiteCopy ||
      !value.images ||
      value.images[0]?.id !== 'original' ||
      value.images[0]?.kind !== 'original' ||
      value.images.slice(1).some((image) => image.kind === 'original') ||
      new Set(value.images.map((image) => image.id)).size !== value.images.length ||
      value.image.sourceProductId !== value.id
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Product sets require website copy and unique original-first gallery images',
      });
  });
export const importProductSnapshotSchema = productSnapshotSchema.refine(
  (value) => value.factsOrigin === 'product-set',
  'Import a saved product set',
);
