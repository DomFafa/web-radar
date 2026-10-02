import type { Draft } from '../shared/model';
import { templateBrandColor } from '../shared/template-brand-color';
import { templateBrandColorRules } from './brand-color-rules';

const validColor = (value?: string) => value && /^#[\da-f]{6}$/i.test(value) ? value.toLowerCase() : undefined;
const rgb = (hex: string) => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
const hex = (channels: number[]) => '#' + channels.map(value => Math.round(value).toString(16).padStart(2, '0')).join('');
const luminance = (channels: number[]) => channels.map(value => {
  const channel = value / 255;
  return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
}).reduce((value, channel, index) => value + channel * [.2126, .7152, .0722][index], 0);

/** Accent surfaces keep the exact customer color; text uses a contrasting ink. */
export function brandColorPalette(primary: string) {
  const channels = rgb(primary);
  const lightness = luminance(channels);
  const ink = 1.05 / (lightness + .05) >= (lightness + .05) / .05 ? '#ffffff' : '#000000';
  // Links appear on the templates' light surfaces. Bright yellow/cyan need a darker
  // companion, rather than white/yellow text becoming unreadable on cream cards.
  let link = channels;
  while (1.05 / (luminance(link) + .05) < 5) link = link.map(channel => channel * .92);
  const mixWithWhite = (amount: number) => hex(channels.map(channel => channel * amount + 255 * (1 - amount)));
  return { primary, ink, link: hex(link), soft: mixWithWhite(.09), line: mixWithWhite(.45) };
}

/** Final output boundary covers native and versioned materials renderers alike.
 * Only interactive accents are themed; reference geometry, motion and media stay intact.
 */
export function withTemplateBrandColor(html: string, draft: Draft): string {
  const rules = templateBrandColorRules[draft.template];
  const primary = validColor(draft.brandColor) || validColor(draft.materials?.visual.palette.primary);
  if (!rules || !primary || (!draft.materials && primary === templateBrandColor(draft.template)?.toLowerCase())) return html;
  const palette = brandColorPalette(primary);
  const style = `<style id="wr-template-brand-color">body.wr-brand-color{--wr-brand:${palette.primary};--wr-brand-ink:${palette.ink};--wr-brand-link:${palette.link};--wr-brand-soft:${palette.soft};--wr-brand-line:${palette.line};--brand:${palette.primary}!important;--brand-ink:${palette.ink}!important;--wr-accent:${palette.primary}!important}
body.wr-brand-color :is(a,button,input,select,textarea,[tabindex]):focus-visible{outline-color:var(--wr-brand)}
${rules}</style>`;
  return html.replace('</head>', `${style}</head>`).replace(/<body\b([^>]*)>/i, (_, attrs: string) => {
    const branded = /\bclass="/.test(attrs)
      ? attrs.replace(/\bclass="([^"]*)"/, (_: string, classes: string) => `class="${classes} wr-brand-color"`)
      : `${attrs} class="wr-brand-color"`;
    return `<body${branded} data-wr-brand-color="${primary}">`;
  });
}
