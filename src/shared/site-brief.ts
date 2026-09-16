import { z } from 'zod';
import type { DesignPage, Draft, SiteBrief } from './model';

export const basePages = ['home', 'catalog', 'detail', 'about', 'contact'] as const;
export const designPageSchema = z.union([
  z.enum(basePages),
  z
    .string()
    .regex(/^extra-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/)
    .max(50),
]) as z.ZodType<DesignPage>;
const line = z.string().trim().min(1).max(300);
const paragraph = z.string().trim().min(1).max(4000);
const lang = z.enum(['en', 'de', 'fr', 'es', 'pt', 'it']);
export const siteBriefSchema = z.object({
  summary: paragraph,
  audience: paragraph,
  goal: paragraph,
  visualDirection: paragraph,
  layout: paragraph,
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  keep: z.array(paragraph).max(15),
  avoid: z.array(paragraph).max(15),
  pages: z
    .array(
      z.object({
        id: designPageSchema,
        label: line,
        purpose: paragraph,
        content: z.partialRecord(
          lang,
          z.object({
            title: line,
            sections: z.array(z.object({ heading: line, body: paragraph })).max(8),
          }),
        ),
      }),
    )
    .min(5)
    .max(8),
  copy: z.partialRecord(
    lang,
    z.object({
      headline: line,
      subtitle: paragraph,
      about: z.string().max(10000),
      cta: line,
    }),
  ),
  productTranslations: z.record(
    z.string().max(200),
    z.partialRecord(
      lang,
      z.object({
        name: line,
        description: z.string().max(10000),
      }),
    ),
  ),
});
export const consultationSchema = z.object({
  revision: z.number().int().nonnegative(),
  answers: z.array(z.object({ questionId: line, question: paragraph, answer: paragraph })).max(10),
  question: z
    .object({
      id: line,
      prompt: paragraph,
      reason: paragraph,
      options: z
        .array(line)
        .length(4)
        .refine(
          (options) => new Set(options).size === 4 && !options.includes('都不是，我要自定义'),
        ),
    })
    .optional(),
  brief: siteBriefSchema.optional(),
  revisionContext: z.object({ brief: siteBriefSchema, instructions: paragraph }).optional(),
  confirmed: z.boolean().optional(),
  jobId: line.optional(),
});
export function parseSiteBrief(input: unknown, draft: Draft): SiteBrief {
  const result = siteBriefSchema.parse(input);
  const ids = result.pages.map((p) => p.id);
  if (new Set(ids).size !== ids.length || basePages.some((id) => !ids.includes(id)))
    throw new Error('The five base page types are required exactly once');
  for (const page of result.pages) {
    if (
      new Set(draft.languages.map((language) => page.content[language]?.sections.length)).size > 1
    )
      throw new Error('Page sections must correspond across languages');
  }
  for (const language of draft.languages) {
    if (!result.copy[language]) throw new Error('Missing website language copy');
    for (const page of result.pages) {
      const content = page.content[language];
      if (!content || (page.id.startsWith('extra-') && !content.sections.length))
        throw new Error('Missing approved page content');
    }
    for (const product of draft.products) {
      const translation = result.productTranslations[product.id]?.[language];
      if (!translation || (product.description.trim() && !translation.description.trim()))
        throw new Error('Missing product translation');
    }
  }
  if (
    Object.keys(result.productTranslations).some((id) => !draft.products.some((p) => p.id === id))
  )
    throw new Error('Unknown product translation');
  // Consistent base order keeps homepage approval and navigation predictable.
  result.pages.sort((a, b) => {
    const rank = (id: DesignPage) =>
      basePages.includes(id as (typeof basePages)[number])
        ? basePages.indexOf(id as (typeof basePages)[number])
        : 5;
    return rank(a.id) - rank(b.id);
  });
  return result;
}
export function plannedPages(draft: Draft): DesignPage[] {
  if (draft.buildBranch === 'template') return [...basePages];
  return draft.consultation?.brief?.pages.map((p) => p.id) ?? [...basePages];
}
export function pageLabel(draft: Draft, page: DesignPage): string {
  return (
    draft.consultation?.brief?.pages.find((p) => p.id === page)?.label ??
    (
      {
        home: '首页',
        catalog: '产品页',
        detail: '产品详情页',
        about: '关于页',
        contact: '联系页',
      } as Record<string, string>
    )[page] ??
    page
  );
}
export function briefConfirmed(draft: Draft): boolean {
  return !!draft.consultation?.confirmed && !!draft.consultation.brief && !draft.consultation.jobId;
}
export function consultationInputKey(draft: Draft): string {
  return JSON.stringify({
    company: draft.company,
    products: draft.products.map(({ translations: _translations, ...product }) => product),
    primaryProductId: draft.primaryProductId,
    category: draft.category,
    country: draft.country,
    languages: draft.languages,
  });
}
export function resetConsultationForEdit(previous: Draft, next: Draft): void {
  next.consultation =
    previous.consultation && consultationInputKey(previous) === consultationInputKey(next)
      ? structuredClone(previous.consultation)
      : undefined;
  if (
    next.consultation &&
    JSON.stringify([
      previous.copy,
      previous.brandColor,
      previous.direction,
      previous.template,
      previous.products.map((p) => p.translations),
    ]) !==
      JSON.stringify([
        next.copy,
        next.brandColor,
        next.direction,
        next.template,
        next.products.map((p) => p.translations),
      ])
  )
    next.consultation.confirmed = false;
}
