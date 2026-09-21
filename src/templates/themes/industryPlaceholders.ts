export type IndustryPlaceholderKey = 'toys' | 'footwear' | 'apparel' | 'plush' | 'universal';

export function getIndustryPlaceholder(industry: IndustryPlaceholderKey, index: number): string {
  const itemIndex = (Math.abs(index) % 8) + 1;
  return `/templates/placeholders/${industry}-${itemIndex}.svg`;
}
