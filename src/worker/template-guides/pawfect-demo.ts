import type { Language } from '../../shared/model';
import type { MaterialsTemplateContract, AppliedMaterials } from '../../shared/materials';
import { defaultDraft } from '../domain';
import { pawfectLegacyMaterialsRevision, pawfectMaterialsRevision } from '../../templates/themes/pawfect/materials';

/** Public demonstration data only; never inserted into a customer's draft. */
export function pawfectDemoDraft(profile: MaterialsTemplateContract, lang: Language) {
  if ([pawfectLegacyMaterialsRevision, pawfectMaterialsRevision].includes(profile.contractRevision)) return nativePawfectDemoDraft(profile, lang);
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

/** New semantic bindings use public illustrative photos; historical demos above stay frozen. */
function nativePawfectDemoDraft(profile: MaterialsTemplateContract, lang: Language) {
  const draft = defaultDraft(), base = '/templates/pawfect-groom/';
  draft.template = 'pawfect-groom';
  draft.buildBranch = 'template';
  draft.templateConfirmed = true;
  draft.languages = lang === 'en' ? ['en'] : ['en', lang];
  draft.company = {...draft.company, name:'Pawfect Groom', email:'demo@example.invalid', contactName:'',
    description:'Pawfect Groom is an illustrative template example. The services and photographs demonstrate the layout; they do not describe a verified business.'};
  draft.products = [
    {id:'demo-bath', name:'The Bath & Dry', description:'An illustrative bath and dry service. Discuss your dog’s coat and care requirements with a groomer.', material:'', dimensions:'', imageAssetId:base+'care.jpg', gallery:[]},
    {id:'demo-groom', name:'The Full Groom', description:'An illustrative grooming service. Ask a groomer about the suitable service and finish for your dog.', material:'', dimensions:'', imageAssetId:base+'poodle.jpg', gallery:[]},
  ];
  draft.primaryProductId = draft.products[0].id;
  const copy:Record<string,string> = {
    'hero-eyebrow':'A little care. A lot of love.',
    'hero-headline':'Good hair days.', 'hero-emphasis':'Happy little tails.',
    'hero-subtitle':'Explore a warm, welcoming approach to dog grooming, with care shaped around each little personality.',
    'primary-cta':'Explore the collection', 'hero-secondary-cta':'See the gallery',
    'hero-trust-lines':'Bath & dry\nFull groom\nCare conversations', 'hero-orbit':'LOOK GOOD\nFEEL GOOD',
    'hero-photo-tag':'A fresh look, a happy little face.',
    'catalog-eyebrow':'A little refresh', 'catalog-headline':'Care for every character.',
    'catalog-description':'Two illustrative grooming options. Discuss the right approach for your dog before making a booking.',
    'gallery-eyebrow':'The gallery', 'gallery-headline':'Little moments. Lovely details.',
    'gallery-description':'An illustrative look at the calm moments and happy faces around a grooming day.',
    'categories-eyebrow':'Find your fit', 'categories-headline':'Start with a little conversation.',
    'categories-description':'Explore the options and share what your dog needs.',
    'feature-eyebrow':'It’s in the details', 'feature-headline':'A little attention goes a long way.',
    'feature-points':'Talk through your dog’s coat and care needs.\nDiscuss the finish you have in mind.\nAsk about preparation before the visit.',
    'feature-link':'Our approach', 'faq-eyebrow':'Good to know', 'faq-headline':'A few little questions.',
    'faq-description':'Start with a conversation about your dog and the care you have in mind.',
    'faq-question-1':'Which service should I choose?', 'faq-answer-1':'Discuss your dog’s coat, age and care requirements with a groomer to choose a suitable option.',
    'faq-question-2':'What should I share before a visit?', 'faq-answer-2':'Share your dog’s coat type, previous grooming experience and any care instructions the groomer should know.',
    'faq-question-3':'How do I ask about a booking?', 'faq-answer-3':'Use the contact section to see how an enquiry would work. This template example does not accept real bookings.',
    'faq-question-4':'Are these real service listings?', 'faq-answer-4':'These services and photographs are illustrative examples showing how the template can present a collection.',
    'about-eyebrow':'Our approach', 'about-headline':'Big hearts.', 'about-emphasis':'Little details.',
    'about-description':'A welcoming example of a dog-care collection, brought together with warm photography and a little personality.',
    'about-story-headline':'Care begins with a conversation.',
    'about-story':'Every dog has its own personality and care needs. This illustrative collection shows how a business can introduce its approach, present options and invite a useful conversation before a visit.',
    'company-section-title':'About this example', 'company-about':draft.company.description,
    'contact-eyebrow':'Let’s talk', 'contact-headline':'Tell us about', 'contact-emphasis':'your little friend.',
    'contact-description':'Share the care you have in mind and the questions you would like to discuss.',
    'contact-form-headline':'Start a conversation.', 'contact-form-description':'This is an illustrative enquiry form. No real booking is made through the template preview.',
    'cta-eyebrow':'A little refresh', 'cta-headline':'Ready for a happy little change?',
    'cta-description':'Explore the collection and see how a thoughtful enquiry begins.', 'cta-button':'Get in touch',
  };
  for (const page of profile.pages) {
    copy[`${page}-seo-title`] = `${page === 'home' ? 'Pawfect Groom' : page[0].toUpperCase()+page.slice(1)+' | Pawfect Groom'} — Template example`;
    copy[`${page}-seo-description`] = 'An illustrative dog-grooming collection demonstrating this website template. Services and photographs are examples.';
  }
  const sceneAssets:Record<string,string> = {'hero-portrait':'hero.jpg', 'feature-scene':'grooming.jpg', 'about-primary-image':'salon.jpg', 'about-secondary-image':'salon-illustration.png', 'contact-scene':'friends.jpg'};
  const sceneProductIds = draft.products.map(product=>product.id);
  draft.materials = {
    templateId:profile.templateId, contractRevision:profile.contractRevision,
    displaySelection:{sceneProductIds, featuredProductIds:[...sceneProductIds]},
    visual:{palette:profile.websitePalette!, backgroundStyle:'plain', imageTreatment:'natural', compositionSummary:'Illustrative dog-care photographs with warm light, teal and amber accents.'},
    imageBindings:profile.imageSlots.flatMap((slot,index)=>{
      const targets = slot.repeat === 'per-product' || slot.repeat === 'per-selection' ? draft.products : [draft.products[index % draft.products.length]];
      return targets.map((product,i)=>({slotId:slot.id, productId:product.id, assetId:slot.materialSource === 'product-primary' ? product.imageAssetId! : base+(slot.id === 'gallery-scene' ? ['poodle.jpg','care.jpg'][i] : sceneAssets[slot.id]), fit:slot.fit, focalPoint:{x:.5,y:.5},
        alt:Object.fromEntries(draft.languages.map(locale=>[locale,`Illustrative dog-care photograph: ${product.name}`])), ...(slot.role ? {role:slot.role, depictedProductIds:[product.id]} : {})}));
    }),
    textBindings:profile.textSlots.flatMap(slot=>draft.languages.map(locale=>{
      const text = copy[slot.id];
      if (!text || [...text].length > slot.maxCodePoints || text.split('\n').length > slot.maxLines) throw Error(`Invalid Pawfect demo copy: ${slot.id}`);
      return {slotId:slot.id, locale, text, factReferences:[]};
    })),
    omittedSectionIds:profile.optionalSections.map(section=>section.id),
  };
  for (const locale of draft.languages) draft.copy[locale] = {headline:copy['hero-headline']+' '+copy['hero-emphasis'], subtitle:copy['hero-subtitle'], cta:copy['primary-cta'], about:draft.company.description};
  draft.brandColor = draft.materials.visual.palette.primary;
  return draft;
}
