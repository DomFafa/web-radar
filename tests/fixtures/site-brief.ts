import type { Draft, SiteBrief } from '../../src/shared/model';
import { basePages } from '../../src/shared/site-brief';
export function testBrief(draft: Draft, extra = false): SiteBrief {
  return {
    summary: '已提供产品的静态展示站',
    audience: '进口商',
    goal: '产品询盘',
    visualDirection: '留白、清晰字体、保留产品原色',
    layout: '清晰导航，产品主图与介绍，联系按钮',
    brandColor: '#416851',
    keep: ['产品外形与品牌'],
    avoid: ['未经提供的认证和设施'],
    pages: [...basePages, ...(extra ? ['extra-wholesale' as const] : [])].map((id) => ({
      id,
      label: id,
      purpose: '展示已提供的资料',
      content: Object.fromEntries(
        draft.languages.map((language) => [
          language,
          {
            title: id,
            sections: id.startsWith('extra-')
              ? [
                  {
                    heading: 'Wholesale inquiry',
                    body: 'Contact us to discuss your product requirements.',
                  },
                ]
              : [],
          },
        ]),
      ),
    })),
    copy: Object.fromEntries(
      draft.languages.map((language) => [
        language,
        { headline: 'Objects', subtitle: 'Made for everyday', about: 'Our studio', cta: 'Contact' },
      ]),
    ),
    productTranslations: Object.fromEntries(
      draft.products.map((p) => [
        p.id,
        Object.fromEntries(
          draft.languages.map((language) => [
            language,
            { name: p.name, description: p.description },
          ]),
        ),
      ]),
    ),
  };
}
