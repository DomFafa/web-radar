import type { Draft, HostingTarget, Language, SiteBrief, SiteCopy } from '../../shared/model';
import type { Secrets } from '../env';
import type { ProviderSet } from '../provider-contract';
import { ProviderError } from '../provider-contract';
import { labels } from '../../templates/labels';
import { bytesFromBase64 } from './http';
import { testImageBase64, testVideoBase64 } from './fixture-data';
import { pagesProjectName } from './pages';
import { siteFilePath } from '../static-site';
import { parseSiteBrief, plannedPages } from '../../shared/site-brief';

const fixtureLanguage: Record<
  Language,
  {
    subtitle: string;
    cta: string;
    details: string;
    inquiry: string;
    pages: Record<'catalog' | 'detail' | 'about' | 'contact' | 'wholesale', string>;
  }
> = {
  en: {
    subtitle: 'Supplied products for buyer review',
    cta: 'Send an inquiry',
    details: 'Product details',
    inquiry: 'Contact us for available details.',
    pages: {
      catalog: 'Products',
      detail: 'Product details',
      about: 'About',
      contact: 'Contact',
      wholesale: 'Wholesale inquiries',
    },
  },
  de: {
    subtitle: 'Bereitgestellte Produkte zur Prüfung',
    cta: 'Anfrage senden',
    details: 'Produktdetails',
    inquiry: 'Kontaktieren Sie uns für verfügbare Details.',
    pages: {
      catalog: 'Produkte',
      detail: 'Produktdetails',
      about: 'Über uns',
      contact: 'Kontakt',
      wholesale: 'Großhandelsanfragen',
    },
  },
  fr: {
    subtitle: 'Produits fournis à examiner',
    cta: 'Envoyer une demande',
    details: 'Détails du produit',
    inquiry: 'Contactez-nous pour les informations disponibles.',
    pages: {
      catalog: 'Produits',
      detail: 'Détails du produit',
      about: 'À propos',
      contact: 'Contact',
      wholesale: 'Demandes de vente en gros',
    },
  },
  es: {
    subtitle: 'Productos proporcionados para revisar',
    cta: 'Enviar una consulta',
    details: 'Detalles del producto',
    inquiry: 'Contáctenos para conocer los detalles disponibles.',
    pages: {
      catalog: 'Productos',
      detail: 'Detalles del producto',
      about: 'Nosotros',
      contact: 'Contacto',
      wholesale: 'Consultas mayoristas',
    },
  },
  pt: {
    subtitle: 'Produtos fornecidos para análise',
    cta: 'Enviar uma consulta',
    details: 'Detalhes do produto',
    inquiry: 'Contacte-nos para obter os detalhes disponíveis.',
    pages: {
      catalog: 'Produtos',
      detail: 'Detalhes do produto',
      about: 'Sobre',
      contact: 'Contacto',
      wholesale: 'Consultas de atacado',
    },
  },
  it: {
    subtitle: 'Prodotti forniti da esaminare',
    cta: 'Invia una richiesta',
    details: 'Dettagli del prodotto',
    inquiry: 'Contattateci per i dettagli disponibili.',
    pages: {
      catalog: 'Prodotti',
      detail: 'Dettagli del prodotto',
      about: 'Chi siamo',
      contact: 'Contatti',
      wholesale: "Richieste all'ingrosso",
    },
  },
};

function fixturePageTitle(language: Language, id: SiteBrief['pages'][number]['id']): string {
  if (id === 'extra-wholesale') return fixtureLanguage[language].pages.wholesale;
  if (id === 'catalog' || id === 'detail' || id === 'about' || id === 'contact')
    return fixtureLanguage[language].pages[id];
  return id;
}

function fixtureBrief(draft: Draft): SiteBrief {
  const wholesale = draft.consultation?.answers.some((answer) =>
    /批发|wholesale|distribut/i.test(answer.answer),
  );
  const pageDefinitions: Array<[SiteBrief['pages'][number]['id'], string, string]> = [
    ['home', '首页', '介绍已提供的公司与重点产品。'],
    ['catalog', '产品页', '展示全部已提供产品。'],
    ['detail', '产品详情页', '呈现已提供的产品信息并提供询盘入口。'],
    ['about', '关于页', '呈现已提供的公司介绍。'],
    ['contact', '联系页', '使用已提供的联系方式和询盘表单。'],
    ...(wholesale
      ? ([
          ['extra-wholesale', '批发合作', '为已确认的批发采购受众提供产品浏览与询盘路径。'],
        ] as Array<[SiteBrief['pages'][number]['id'], string, string]>)
      : []),
  ];
  const companyName = draft.company.name || 'Company';
  const pages = pageDefinitions.map(([id, label, purpose]) => ({
    id,
    label,
    purpose,
    content: Object.fromEntries(
      draft.languages.map((language) => [
        language,
        {
          title: id === 'home' ? companyName : `${companyName} · ${fixturePageTitle(language, id)}`,
          sections: [
            {
              heading: fixtureLanguage[language].details,
              body:
                id === 'about'
                  ? draft.company.description || fixtureLanguage[language].inquiry
                  : id === 'contact'
                    ? fixtureLanguage[language].inquiry
                    : draft.products
                        .map((product) => product.name)
                        .filter(Boolean)
                        .join(', ') || fixtureLanguage[language].inquiry,
            },
          ],
        },
      ]),
    ),
  }));
  const copy = Object.fromEntries(
    draft.languages.map((language) => [
      language,
      {
        headline: companyName,
        subtitle: fixtureLanguage[language].subtitle,
        about: draft.company.description,
        cta: fixtureLanguage[language].cta,
      },
    ]),
  );
  const productTranslations = Object.fromEntries(
    draft.products.map((product) => [
      product.id,
      Object.fromEntries(
        draft.languages.map((language) => [
          language,
          {
            name: product.name,
            description: product.description || fixtureLanguage[language].inquiry,
          },
        ]),
      ),
    ]),
  );
  return parseSiteBrief(
    {
      summary: '本地测试方案仅使用已提供的公司与产品资料。',
      audience: wholesale ? '批发采购商与分销商。' : '企业采购与合作访客。',
      goal: '帮助访客查看已提供产品并提交询盘。',
      visualDirection: '以原始产品图片为主的克制编辑风格。',
      layout: '清晰导航、产品主视觉、产品列表、事实内容与询盘入口。',
      brandColor: draft.brandColor,
      keep: ['保留原始产品外形、材质与可见品牌元素。'],
      avoid: ['不添加未提供的资质、工厂、销量、客户或产品属性。'],
      pages,
      copy,
      productTranslations,
    },
    draft,
  );
}
export function fixtureProviders(env: Secrets): ProviderSet {
  const resolveTarget = async (
    projectId: string,
    current?: HostingTarget,
  ): Promise<HostingTarget> => {
    if (current && current.accountId !== 'LOCAL_TEST')
      throw new ProviderError(
        'pages_hosting_account_missing',
        '本地测试服务不能接管真实账户的站点',
      );
    return {
      accountId: 'LOCAL_TEST',
      pagesProjectName: current?.pagesProjectName ?? (await pagesProjectName(projectId)),
    };
  };
  return {
    status: () =>
      ['text', 'image', 'agnes', 'site-builder', 'pages', 'email'].map((name) => ({
        name,
        configured: true,
        mode: 'test',
        detail: '明确的本地测试替身；未调用真实服务',
      })),
    async consult(draft) {
      if (!draft.consultation?.answers.length)
        return {
          question: {
            prompt: '这次网站最优先服务哪类访客？',
            reason: '受众会直接决定首页信息层级、产品展示方式和询盘入口。',
            options: [
              '批发采购商与分销商',
              '品牌与零售合作方',
              '企业采购客户',
              '行业媒体与合作伙伴',
            ],
          },
        };
      return { brief: fixtureBrief(draft) };
    },
    async script(draft) {
      const count = draft.duration === 12 ? 4 : 3;
      return {
        script: `[LOCAL TEST SCRIPT] ${draft.duration}s · ${draft.company.name} · ${draft.direction}. This is a local workflow fixture, not AI output.`,
        scenes: Array.from({ length: count }, (_, i) => ({
          id: `scene-${i + 1}`,
          description: `[LOCAL TEST STORYBOARD ${i + 1}] ${draft.products.find((p) => p.id === draft.primaryProductId)?.name ?? ''} · ${['Front view', 'Material detail', 'Side view', 'Closing view'][i]}`,
          revision: 1,
        })),
      };
    },
    async copy(draft) {
      const copy: Draft['copy'] = {};
      const subtitles = {
        en: 'Local test copy · review before publishing',
        de: 'Lokaler Texttest · vor Veröffentlichung prüfen',
        fr: 'Texte de test local · à vérifier avant publication',
        es: 'Texto de prueba local · revisar antes de publicar',
        pt: 'Texto de teste local · rever antes de publicar',
        it: 'Testo di prova locale · verificare prima di pubblicare',
      };
      const productTranslations: Record<string, unknown> = {};
      for (const lang of draft.languages) {
        copy[lang] = {
          headline: draft.company.name,
          subtitle: subtitles[lang],
          about: draft.company.description,
          cta: labels[lang].discover,
        } satisfies SiteCopy;
      }
      for (const p of draft.products)
        productTranslations[p.id] = Object.fromEntries(
          draft.languages.map((lang) => [
            lang,
            { name: p.name, description: lang === 'en' ? p.description : subtitles[lang] },
          ]),
        );
      return { ...copy, productTranslations };
    },
    async image() {
      const body = bytesFromBase64(testImageBase64);
      return {
        body,
        contentType: 'image/png',
        filename: 'LOCAL-TEST-storyboard.png',
        size: body.length,
        testMode: true,
      };
    },
    async designImage() {
      const body = bytesFromBase64(testImageBase64);
      return {
        body,
        contentType: 'image/png',
        filename: 'LOCAL-TEST-page.png',
        size: body.length,
        testMode: true,
      };
    },
    async siteBuild(_id, input) {
      if (!input) throw new ProviderError('fixture_build_missing', '测试构建缺少输入');
      const files: Record<string, string> = {};
      const esc = (s: string) =>
        s
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll("'", '&#39;');
      const pages = plannedPages(input.draft);
      const brief = input.draft.consultation?.brief;
      const pagePlans = new Map(brief?.pages.map((page) => [page.id, page]) ?? []);
      for (const lang of input.draft.languages) {
        const copy = input.draft.copy[lang] ?? brief?.copy[lang];
        const nav = pages
          .filter((page) => page !== 'detail')
          .map((page) => {
            const title = pagePlans.get(page)?.content[lang]?.title ?? page;
            return `<a data-wr-page="${page}" href="/${siteFilePath(lang, page)}">${esc(title)}</a>`;
          })
          .join('');
        const localizedProduct = (product: Draft['products'][number]) =>
          product.translations?.[lang] ??
          brief?.productTranslations[product.id]?.[lang] ?? {
            name: product.name,
            description: product.description,
          };
        const productCard = (product: Draft['products'][number]) => {
          const translated = localizedProduct(product);
          return `<article data-wr-product-id="${esc(product.id)}"><h2 data-wr-product-name>${esc(translated.name)}</h2><p data-wr-product-description>${esc(translated.description)}</p>${product.imageAssetId ? `<img src="__WR_ASSET_${product.imageAssetId}__" alt="${esc(translated.name)}">` : ''}<a data-wr-page="detail" data-wr-product-id="${esc(product.id)}" href="/${siteFilePath(lang, 'detail', product.id)}">${esc(translated.name)}</a></article>`;
        };
        const render = (page: (typeof pages)[number], product?: Draft['products'][number]) => {
          const content = pagePlans.get(page)?.content[lang];
          const title = content?.title ?? `${input.draft.company.name} · ${page}`;
          const sections = (content?.sections ?? [])
            .map(
              (section) =>
                `<section><h2>${esc(section.heading)}</h2><p>${esc(section.body)}</p></section>`,
            )
            .join('');
          const visibleProducts = product
            ? [product]
            : page === 'catalog'
              ? input.draft.products
              : [
                  input.draft.products.find(
                    (candidate) => candidate.id === input.draft.primaryProductId,
                  ) ?? input.draft.products[0],
                ].filter((candidate): candidate is Draft['products'][number] => !!candidate);
          return `<!doctype html><html lang="${lang}"><head><title>${esc(input.draft.company.name)}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui;max-width:1000px;margin:40px auto;padding:20px}img{max-width:100%;width:320px}nav{display:flex;gap:24px}</style></head><body><p>LOCAL TEST — workflow fixture, not AI output</p><nav>${nav}</nav>${copy ? `<header><p data-wr-headline>${esc(copy.headline)}</p><p data-wr-subtitle>${esc(copy.subtitle)}</p></header>` : ''}<main><h1>${esc(title)}</h1>${sections}${visibleProducts.map(productCard).join('')}${copy?.about ? `<p data-wr-about>${esc(copy.about)}</p>` : ''}<form id="inquiry" action="__WR_INQUIRY__" method="post"><button type="submit">${esc(copy?.cta ?? fixtureLanguage[lang].cta)}</button></form></main></body></html>`;
        };
        for (const page of pages) {
          if (page === 'detail')
            for (const product of input.draft.products)
              files[siteFilePath(lang, page, product.id)] = render(page, product);
          else files[siteFilePath(lang, page)] = render(page);
        }
      }
      return { state: 'succeeded', files };
    },
    async submitVideo(draft, refs, idempotencyKey) {
      if (refs.length < (draft.duration === 12 ? 4 : 3))
        throw new ProviderError('video_references', '测试视频也要求完整分镜');
      return { videoId: `test-video-${draft.duration}-${idempotencyKey}` };
    },
    async pollVideo(videoId) {
      const duration = videoId.startsWith('test-video-12-') ? 12 : 8;
      if (!videoId.startsWith(`test-video-${duration}-`))
        throw new ProviderError('test_video_missing', '未知测试视频任务');
      const body = bytesFromBase64(testVideoBase64[duration]);
      return {
        state: 'succeeded',
        media: {
          body,
          contentType: 'video/webm',
          filename: `LOCAL-TEST-${duration}s.webm`,
          size: body.length,
          testMode: true,
        },
      };
    },
    resolveHostingTarget: resolveTarget,
    async publish(projectId, releaseId, _files, _previousId, hostingTarget) {
      if (!hostingTarget)
        throw new ProviderError(
          'pages_hosting_target_required',
          '发布前必须保存明确的本地测试托管绑定',
        );
      await resolveTarget(projectId, hostingTarget);
      return {
        deploymentId: `test-deployment-${releaseId}`,
        url: `${env.APP_ORIGIN || 'http://127.0.0.1:8788'}/public/sites/${encodeURIComponent(projectId)}`,
        testMode: true,
      };
    },
    async email(inquiry) {
      return { id: `test-email-${inquiry.id}`, testMode: true };
    },
  };
}
