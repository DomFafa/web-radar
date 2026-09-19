import type { Company } from '../../shared/model';
import type { ThemeContext } from './types';

export interface StatItem {
  value: string;
  num: number;
  prefix?: string;
  suffix?: string;
  label: string;
  desc?: string;
}

export interface StatInput {
  value: string;
  num?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  desc?: string;
}

/**
 * Parses numeric string, prefix, and suffix from a raw stat value like "$18.4B+", "99.99%", "10,000+ m²", "<18ms".
 */
export function parseStatToken(token: string): { num: number; prefix: string; suffix: string; display: string } {
  const trimmed = token.trim();
  const match = trimmed.match(/^([^0-9.-]*)([-+]?[0-9]*\.?[0-9]+)(.*)$/);
  if (!match) {
    return { num: 0, prefix: '', suffix: '', display: trimmed };
  }
  const prefix = match[1] ?? '';
  const num = parseFloat(match[2] ?? '0');
  const suffix = match[3] ?? '';
  return { num, prefix, suffix, display: trimmed };
}

/**
 * Parses about highlights entered by user (e.g. "10,000+ m² | 生产制造基地 | 说明"),
 * falling back to curated template default stats if empty.
 */
export function parseAboutHighlights(
  rawHighlights: string | undefined,
  defaultStats: StatInput[] = [],
): StatItem[] {
  const normalizedDefaults: StatItem[] = defaultStats.map((s) => {
    if (typeof s.num === 'number') {
      return {
        value: s.value,
        num: s.num,
        prefix: s.prefix ?? '',
        suffix: s.suffix ?? '',
        label: s.label,
        desc: s.desc,
      };
    }
    const token = parseStatToken(s.value);
    return {
      value: token.display,
      num: token.num,
      prefix: s.prefix || token.prefix,
      suffix: s.suffix || token.suffix,
      label: s.label,
      desc: s.desc,
    };
  });

  if (!rawHighlights || !rawHighlights.trim()) {
    return normalizedDefaults;
  }
  const lines = rawHighlights
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return normalizedDefaults;

  const parsed: StatItem[] = [];
  for (const line of lines) {
    const parts = line.split(/[|丨]/).map((p) => p.trim());
    if (parts.length >= 2) {
      const { num, prefix, suffix, display } = parseStatToken(parts[0]!);
      parsed.push({
        value: display,
        num,
        prefix,
        suffix,
        label: parts[1]!,
        desc: parts[2] || '',
      });
    } else if (parts.length === 1 && parts[0]) {
      const { num, prefix, suffix, display } = parseStatToken(parts[0]!);
      if (num > 0 || suffix) {
        parsed.push({
          value: display,
          num,
          prefix,
          suffix,
          label: parts[0]!,
        });
      } else {
        parsed.push({
          value: '✓',
          num: 100,
          label: parts[0]!,
        });
      }
    }
  }

  return parsed.length > 0 ? parsed : normalizedDefaults;
}

/**
 * Returns formatted paragraphs from aboutStory or fallback.
 */
export function getAboutStoryParagraphs(
  company: Company,
  fallbackText?: string | string[],
): string[] {
  const story = company.aboutStory?.trim();
  if (story) {
    const paras = story
      .split(/\n\s*\n|\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (paras.length > 0) return paras;
  }
  if (Array.isArray(fallbackText)) {
    const valid = fallbackText.map((p) => p.trim()).filter(Boolean);
    if (valid.length > 0) return valid;
  }
  const fallback = (company.description || (typeof fallbackText === 'string' ? fallbackText : '') || '').trim();
  if (fallback) {
    return fallback
      .split(/\n\s*\n|\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Resolves headline for about page with sensible fallbacks.
 */
export function getAboutHeadline(company: Company, fallback: string): string {
  return company.aboutHeadline?.trim() || company.slogan?.trim() || fallback;
}

/**
 * Resolves primary and secondary images for About page.
 */
export function getAboutImages(
  ctx: ThemeContext,
  fallbackPrimary = '',
  fallbackSecondary = '',
): { primary: string; secondary: string } {
  const primary = ctx.asset(ctx.draft.company.aboutImageAssetId) || fallbackPrimary;
  const secondary = ctx.asset(ctx.draft.company.aboutSecondaryImageAssetId) || fallbackSecondary;
  return { primary, secondary };
}
