import type { Language } from '../../shared/model';
import type { MaterialsTemplateContract, AppliedMaterials } from '../../shared/materials';
import { defaultDraft } from '../domain';

/** Public demonstration data only; never inserted into a customer's draft. */
export function pawfectDemoDraft(profile: MaterialsTemplateContract, lang: Language) {
  const draft = defaultDraft();
  draft.template = 'pawfect-groom';
  draft.buildBranch = 'template';
  draft.templateConfirmed = true;
  draft.languages = lang === 'en' ? ['en'] : ['en', lang];
  draft.company = {
    ...draft.company,
    name: 'Pawfect Groom',
    email: 'demo@example.invalid',
    contactName: '',
    description:
      'Explore this illustrative grooming salon. Services and imagery are examples, not verified customer information.',
  };
  const base = '/templates/pawfect-groom/';
  const photos = [
    'hero.jpg',
    'salon-illustration.png',
    'poodle.jpg',
    'grooming.jpg',
    'care.jpg',
    'friends.jpg',
  ];
  const names = [
    'The Bath & Dry',
    'Full Groom',
    'Puppy’s First Groom',
    'De-Shedding Treatment',
    'Nail Trim',
    'Teeth Brushing',
  ];
  draft.products = names.map((name, i) => ({
    id: `service-${i}`,
    name,
    description:
      'Example grooming service. Contact the salon to confirm availability, suitability and pricing.',
    material: '',
    dimensions: '',
    imageAssetId: base + photos[i],
    gallery: [],
  }));
  draft.primaryProductId = draft.products[0].id;
  const copy = {
    headline: 'Your dog deserves the best groom.',
    subtitle: 'A little refresh, a fresh new look, and a happier grooming day.',
    about: draft.company.description,
    cta: 'Request a groom',
  };
  for (const locale of draft.languages) draft.copy[locale] = { ...copy };
  const core: Record<string, string> = {
    'hero-headline': copy.headline,
    'hero-subtitle': copy.subtitle,
    'primary-cta': copy.cta,
    'company-about': copy.about,
    'about-headline': 'Big hearts. Little details.',
    'about-story': copy.about,
    'about-highlights': '✓ | Individual care | Discuss what your dog needs.',
  };
  const imageBindings: AppliedMaterials['imageBindings'] = profile.imageSlots.flatMap((slot) => {
    const products =
      slot.repeat === 'per-product' || slot.repeat === 'per-product-gallery'
        ? draft.products
        : [undefined];
    return products.map((product, i) => ({
      slotId: slot.id,
      ...(product ? { productId: product.id } : {}),
      ...(slot.repeat === 'per-product-gallery' ? { itemIndex: 1 } : {}),
      assetId: product
        ? base + photos[i]
        : base +
          (slot.id === 'hero-portrait'
            ? 'hero.jpg'
            : slot.id.includes('secondary')
              ? 'grooming.jpg'
              : 'salon-illustration.png'),
      fit: slot.fit,
      focalPoint: { x: 0.5, y: 0.5 },
      alt: Object.fromEntries(draft.languages.map((l) => [l, 'Illustrative dog-care photography'])),
      ...(slot.role ? { role: slot.role, depictedProductIds: product ? [product.id] : [] } : {}),
    }));
  });
  draft.materials = {
    templateId: profile.templateId,
    contractRevision: profile.contractRevision,
    visual: {
      palette: {
        primary: '#38929a',
        secondary: '#c9833a',
        background: '#faf8f3',
        surface: '#f0eee6',
        text: '#203337',
        mutedText: '#617071',
      },
      backgroundStyle: 'plain',
      imageTreatment: 'natural',
      compositionSummary: 'Warm editorial dog grooming salon, teal and amber accents.',
    },
    imageBindings,
    textBindings: profile.textSlots.flatMap((slot) =>
      draft.languages.map((locale) => ({
        slotId: slot.id,
        locale,
        text: [
          ...(core[slot.id] ||
            (slot.id.endsWith('seo-title')
              ? 'Pawfect Groom | Dog grooming'
              : slot.id.endsWith('seo-description')
                ? copy.subtitle
                : slot.exampleText || 'Ask the salon for details')),
        ]
          .slice(0, slot.maxCodePoints)
          .join('')
          .replace(/__WR_COMPANY__/g, 'Pawfect Groom')
          .replace(/__WR_[A-Z_0-9]+__/g, ''),
        factReferences: [],
      })),
    ),
    omittedSectionIds: profile.optionalSections.map((s) => s.id),
  };
  draft.brandColor = '#38929a';
  return draft;
}
