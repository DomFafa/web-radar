import type { AppEnv } from './env';
import { testMode } from './env';
import type { CloneConfig, CloneScrapedData, Draft, Project } from '../shared/model';
import { ApiError } from './http';

export async function scrapeTargetUrl(targetUrl: string): Promise<CloneScrapedData> {
  let urlObj: URL;
  try {
    urlObj = new URL(targetUrl);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
  } catch {
    throw new ApiError(400, 'invalid_url', '请输入有效的 HTTP 或 HTTPS 网址。');
  }

  try {
    const response = await fetch(urlObj.href, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch =
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    const headings = [...html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi)]
      .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
      .filter((text) => text.length > 0 && text.length < 80)
      .slice(0, 15);

    const navLinks = [...html.matchAll(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)]
      .map((m) => ({
        href: m[1],
        text: m[2].replace(/<[^>]+>/g, '').trim(),
      }))
      .filter((x) => x.text && x.text.length > 1 && x.text.length < 30 && !/^(#|javascript:)/i.test(x.href))
      .slice(0, 12);

    const sampleText = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 2500);

    return {
      title,
      description,
      headings,
      navLinks,
      sampleText,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ApiError(502, 'scrape_failed', `无法抓取目标网站内容 (${msg})，您可以直接上传设计稿进行还原。`);
  }
}

export function syncDraftDataIntoHtml(
  html: string,
  draft: Draft,
  projectId?: string,
): string {
  if (!html) return html;
  let result = html;
  const { company, products } = draft;

  // 1. 同步 <title> 标签
  if (company.name) {
    const titleText = `${company.name}${company.slogan ? ` | ${company.slogan}` : ''}`;
    if (/<title[^>]*>[\s\S]*?<\/title>/i.test(result)) {
      result = result.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${titleText}</title>`);
    } else if (/<head[^>]*>/i.test(result)) {
      result = result.replace(/<head[^>]*>/i, `<head>\n  <title>${titleText}</title>`);
    }
  }

  // 2. 同步 Meta Description
  if (company.description || company.slogan) {
    const desc = (company.description || company.slogan || '').replace(/"/g, '&quot;');
    if (/<meta\s+name=["']description["'][^>]*>/i.test(result)) {
      result = result.replace(
        /<meta\s+name=["']description["'][^>]*>/i,
        `<meta name="description" content="${desc}">`,
      );
    }
  }

  // 3. 同步官方联系邮箱 mailto: 链接
  if (company.email) {
    result = result.replace(/href=["']mailto:[^"']*["']/gi, `href="mailto:${company.email}"`);
  }

  // 4. 同步 WhatsApp 链接
  if (company.whatsapp) {
    const digits = company.whatsapp.replace(/[^0-9]/g, '');
    if (digits) {
      result = result.replace(
        /href=["']https?:\/\/(wa\.me|api\.whatsapp\.com\/send)[^"']*["']/gi,
        `href="https://wa.me/${digits}"`,
      );
    }
  }

  // 5. 同步联系电话 tel: 链接
  if (company.phone) {
    result = result.replace(/href=["']tel:[^"']*["']/gi, `href="tel:${company.phone}"`);
  }

  // 6. 同步社交媒体主页链接
  if (company.facebook) {
    result = result.replace(
      /href=["']https?:\/\/(www\.)?facebook\.com\/[^"']*["']/gi,
      `href="${company.facebook}"`,
    );
  }
  if (company.instagram) {
    result = result.replace(
      /href=["']https?:\/\/(www\.)?instagram\.com\/[^"']*["']/gi,
      `href="${company.instagram}"`,
    );
  }
  if (company.linkedin) {
    result = result.replace(
      /href=["']https?:\/\/(www\.)?linkedin\.com\/[^"']*["']/gi,
      `href="${company.linkedin}"`,
    );
  }
  if (company.x) {
    result = result.replace(
      /href=["']https?:\/\/(www\.)?(x|twitter)\.com\/[^"']*["']/gi,
      `href="${company.x}"`,
    );
  }

  // 7. 同步 Logo 图片资产链接 (若上传过)
  if (company.logoAssetId && projectId) {
    result = result.replace(
      /<img([^>]*class=["'][^"']*logo[^"']*["'][^>]*)src=["'][^"']*["']/gi,
      `<img$1src="/api/projects/${projectId}/assets/${company.logoAssetId}"`,
    );
  }

  return result;
}

export function buildClonePrompt(
  projectName: string,
  cloneConfig: CloneConfig,
  draftOrCompanyName: Draft | string,
  projectId?: string,
): string {
  const { targetUrl, scrapedData, instructions, uiImages } = cloneConfig;
  const isDraft = typeof draftOrCompanyName === 'object' && draftOrCompanyName !== null;
  const draft = isDraft ? (draftOrCompanyName as Draft) : null;
  const company = draft?.company || {
    name: typeof draftOrCompanyName === 'string' ? draftOrCompanyName : projectName,
    email: '',
    contactName: '',
    type: 'trader' as const,
    description: '',
    facebook: '',
    instagram: '',
    x: '',
  };
  const products = draft?.products || [];
  const primaryProductId = draft?.primaryProductId;
  const brandColor = draft?.brandColor || '#4F46E5';
  const category = draft?.category || '';
  const country = draft?.country || '';

  const companyTypeDesc =
    company.type === 'factory'
      ? '实体制造工厂 / Manufacturing Factory'
      : '工贸一体/专业进出口商 / Trading & Export';

  let prompt = `请作为世界顶尖的前端架构师与 100% 像素级高保真克隆专家，根据用户提供的参考网站或多页面设计稿，输出 100% 像素级高保真还原的完整独立 index.html 代码。

【最高克隆还原与数据同步铁律（极其关键，严禁违背）】
1. 100% 真实数据灌注：用户在建站流程中填写的企业名称、产品数据、联系邮箱、WhatsApp、电话、地址与 Slogan，必须 100% 注入替换到网站所有对应位置！严禁保留参考网站的旧公司名、电话或虚假占位文本（例如严禁使用 Lorem Ipsum、Acme、Jane Doe 等）！
2. 忠实还原设计结构与视觉系统：1:1 还原目标设计稿或参考网站上的色彩体系、排版层级、Header 导航、Hero 展台、产品网格、规格参数卡片与交互动效。
3. 结构化多页面体验：若存在多页面内容（首页 Home、产品目录 Products/Catalog、产品详情 Product Detail、关于我们 About Us、联系我们 Contact），须采用纯前端平滑无刷新切换架构（通过 data-page="home|catalog|detail|about|contact" 平滑切换），让用户点击导航无缝浏览各区域。

【用户填写的真实企业信息（必须 100% 呈现在页面对应模块）】
- 公司/品牌英文全称: ${company.name || projectName} (顶部 Header Logo 处、页头标题、关于我们、页脚版权声明处必须统一呈现！)
- 品牌标语 / Slogan: ${company.slogan || 'Your Trusted Global Partner'} (首页首屏 Hero 吸睛主标题/副标题)
- 业务性质定位: ${companyTypeDesc}
- 成立年份 / 行业资质: ${company.establishedYear || 'Established Manufacturer'}
- 官方联系邮箱: ${company.email || ''} (顶部工具栏、联系我们表单/卡片、页脚 Footer 必须使用此邮箱，用于海外采购商即时联系)
- 业务联系人: ${company.contactName || 'Sales Department'}
- 官方联系电话: ${company.phone || ''} (页面展示为 ${company.phone || ''}，并在点击时触发 tel:${company.phone || ''})
- WhatsApp 即时沟通: ${company.whatsapp || ''} (必须在 Header 右侧显著位置、Hero 区域和浮动联系栏设置快捷联系按钮，链接为：https://wa.me/${(company.whatsapp || '').replace(/[^0-9]/g, '')})
- 公司实体地址: ${company.address || ''} (在 Contact 页面与 Footer 详细呈现)
- 公司深度简介 / 外贸实力: ${company.description || ''} (完整展现在 About Us 区域及首页工厂/实力介绍模块)
- 权威认证资质 (Certifications): ${company.certifications || 'ISO9001, CE, RoHS'}
- 制造与定制能力 (Capabilities): ${company.capabilities || 'OEM / ODM Available, Flexible MOQ, Global Logistics'}
- 品牌主色调: ${brandColor || '#3b82f6'} (整站强调色、主行动按钮、悬停高亮、导航激活下划线等均以此为基准色)
- 目标海外市场: ${country || 'Global Market'}
- 行业领域: ${category || 'B2B Trade & Manufacturing'}
- 官方社交媒体主页:
  * LinkedIn: ${company.linkedin || '#'}
  * Facebook: ${company.facebook || '#'}
  * Instagram: ${company.instagram || '#'}
  * X (Twitter): ${company.x || '#'}
`;

  if (products && products.length > 0) {
    prompt += `\n【用户录入的真实产品矩阵（必须 100% 呈现在首页推荐与产品列表页，绝不使用编造产品）】\n`;
    products.forEach((p, idx) => {
      const isPrimary = p.id === primaryProductId ? '【★首页首屏核心主推产品】' : '';
      const imgTag = p.imageAssetId && projectId
        ? `图片源请优先指定: /api/projects/${projectId}/assets/${p.imageAssetId}`
        : `请使用与产品名 "${p.name}" 贴切的高品质实物图`;
      prompt += `${idx + 1}. ${isPrimary} 产品名称: ${p.name}
   - 核心卖点与描述: ${p.description || 'Premium high quality product'}
   - 材质规格: ${p.material || 'Standard Export Grade'}
   - 规格尺寸: ${p.dimensions || 'Customizable'}
   - 产品配图要求: ${imgTag}\n`;
    });
  } else {
    prompt += `\n【产品矩阵】用户尚未单独录入产品明细，请根据行业定位（${category || company.name}）与参考网站内容生成 4~8 款高度符合该行业出口标准的高保真产品卡片。\n`;
  }

  prompt += `\n【四大核心视觉解析与防畸变铁律（极其关键）】
1. 导航菜单栏必须 100% 完整常驻显示且下划线精确居中（Header & Nav Underline Guarantee）：
   - 顶部必须生成结构完备的 <header class="site-header sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-sm">。
   - 导航菜单项直接声明为具有精美悬浮与激活样式的按钮：例如 <button type="button" data-nav="home" class="nav-link active relative py-4 px-3 font-semibold text-slate-900 transition-colors">Home</button>。
   - 下划线居中无偏移：激活状态的下划线须严格数学居中，绝不偏左偏右！
2. Hero 展台必须为一体化完整场景大图，严禁散装碎拼（Hero Showcase & Composition）：
   - 绝对禁止在 Hero 区域右侧用绝对定位将多张小商品图零碎散落拼贴；
   - Hero 右侧必须作为一体化视觉展台大图呈现（展示完整的展台陈列全貌），保持与背景色调、光影的自然融合。
3. 首页商品卡片严禁硬塞规格文字，保持紧凑纯净卡片网格（Clean Product Cards）：
   - 首页精选推荐区必须采用规整横排紧凑网格（grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 或更高）。
   - 首页卡片核心要素：白底圆角容器内的产品包装及实物图、产品标题（加粗深色紧凑居中或靠左）、操作按钮（如 View Details → 或 了解详情）。
   - 详细规格参数属于商品详情页，严禁在首页卡片硬塞大段冗余规格造成卡片变形拉长！
4. 按钮形态与图标几何防畸变（Pills vs Circles 严防按钮变巨球）：
   - 胶囊药丸按钮（如顶栏和 Hero 区的 "Contact Us / Inquiry"、Filter 药丸、详情入口按钮）：必须是标准长条胶囊形状（两头半圆），如 px-6 py-2.5 rounded-full inline-flex items-center gap-2 font-semibold shadow-sm。
   - 特性小图标底座（如首页核心卖点图标）：必须是小巧精致的正圆（直径约 44px~52px），设置 w-12 h-12 flex-shrink-0 aspect-square rounded-full flex items-center justify-center，严禁被文字纵向拉伸成椭圆！
`;

  if (scrapedData) {
    prompt += `\n【目标参考网站真实抓取数据】\n`;
    if (targetUrl) prompt += `- 目标站点 URL: ${targetUrl}\n`;
    if (scrapedData.title) prompt += `- 网页标题参考: ${scrapedData.title}\n`;
    if (scrapedData.description) prompt += `- Meta 描述参考: ${scrapedData.description}\n`;
    if (scrapedData.headings && scrapedData.headings.length) {
      prompt += `- 参考栏目标题: ${scrapedData.headings.join(' | ')}\n`;
    }
    if (scrapedData.navLinks && scrapedData.navLinks.length) {
      prompt += `- 导航架构参考: ${scrapedData.navLinks.map((n) => n.text).join(' / ')}\n`;
    }
    if (scrapedData.sampleText) {
      prompt += `- 目标站点核心文本片段:\n${scrapedData.sampleText}\n`;
    }
    prompt += `请借鉴参考站点的布局和导航结构，但所有企业名称、联系方式与产品必须完全替换为上述用户真实资料！\n`;
  }

  if (uiImages && uiImages.length > 0) {
    prompt += `\n【用户上传的多页面设计稿与商品素材清单】\n`;
    uiImages.forEach((img) => {
      prompt += `- [页面角色: ${img.role || '素材'}] ${img.name}\n`;
    });
    prompt += `\n我已经通过 Vision 视觉多模态为您附带了上述高保真设计稿图片。
你必须仔细观察图片，通过 Tailwind CSS 极其严谨地 1:1 还原图片中的界面视觉细节：
1. 色彩搭配（背景色、主品牌色、卡片边框、按钮渐变、文字对比度）
2. 排版布局（间距留白、字号层级、两列/四列卡片网格比例、对齐关系）
3. 质感细节（圆角半径、阴影层次、毛玻璃磨砂效果）
4. 请利用你的 Vision 视觉分析能力，确保最终生成的 HTML 代码在视觉上与设计稿高度吻合！\n`;
  }

  if (instructions && instructions.trim()) {
    prompt += `\n【用户的专属定制需求与微调指令】\n${instructions.trim()}\n`;
  }

  prompt += `\n【技术与结构实现要求】:
1. 采用 HTML5 + Tailwind CSS CDN (<script src="https://cdn.tailwindcss.com"></script>)，可以在 <style> 中微调细节。
2. 内部嵌入完整的交互 JavaScript，实现多页面平滑无刷新切换（例如点击导航栏 Home、Products、About、Contact 等，展示对应的页面区块，并平滑回到顶部）。
3. 保证在桌面端 (>= 1280px) 和移动端 (< 768px) 均具备完美的响应式体验（移动端含汉堡菜单抽屉导航）。
4. 包含功能完备的表单（如联系我们/询盘弹窗或表单），具备友好的前端校验与成功反馈状态。
5. 必须只输出纯 HTML 代码，不要用 Markdown 代码块包裹，不要任何前后解释文字。`;

  return prompt;
}

export function resolveCloneModel(requestedModel?: string): string {
  const m = (requestedModel || '').toLowerCase().trim();
  if (m === 'gpt-6' || m === 'gpt-6-astra' || m === 'astra') return 'gpt-6-astra';
  if (m === 'gpt-5.6' || m === 'gpt-5.6-sol' || m === 'sol') return 'gpt-5.6-sol';
  if (m === 'gpt-5.5' || m === 'gpt-5.5-2026-04-23') return 'gpt-5.5';
  if (m === 'gpt-5.5-pro' || m === 'gpt-5.5-pro-2026-04-23') return 'gpt-5.5-pro';
  if (m === 'gpt-4o') return 'gpt-4o';
  return requestedModel?.trim() || 'gpt-6-astra';
}

export async function generateCloneSite(
  env: AppEnv,
  project: Project,
  cloneConfig: CloneConfig,
  getImageAssetBase64?: (assetId: string) => Promise<string | null>,
): Promise<string> {
  const apiKey = env.OPENAI_API_KEY || env.TEXT_API_KEY;
  const { company, products } = project.draft;
  const companyName = company.name || project.name;
  const slogan = company.slogan || 'Your Trusted Global Manufacturing Partner';
  const email = company.email || 'sales@example.com';
  const whatsapp = company.whatsapp || '';
  const phone = company.phone || '';
  const address = company.address || '';
  const description = company.description || 'Professional global exporter dedicated to high-quality products and customer satisfaction.';
  const brandColor = project.draft.brandColor || '#4F46E5';

  if (!apiKey || testMode(env)) {
    const productsHtml = products.length > 0
      ? products.map((p, i) => `
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div class="aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center text-slate-400">
            ${p.imageAssetId ? `<img src="/api/projects/${project.id}/assets/${p.imageAssetId}" alt="${p.name}" class="w-full h-full object-cover" />` : `<span class="text-3xl">📦</span>`}
          </div>
          <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">ITEM 0${i + 1}</span>
          <h3 class="text-base font-bold text-slate-900 mt-2">${p.name}</h3>
          <p class="text-xs text-slate-500 mt-1 line-clamp-2">${p.description || 'Premium export grade quality'}</p>
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>${p.material || 'Standard Material'}</span>
            <span>${p.dimensions || 'Standard Size'}</span>
          </div>
        </div>
      `).join('')
      : `
        <div class="col-span-full py-8 text-center text-slate-400">
          暂无产品明细，已就绪标准推荐展示位。
        </div>
      `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${companyName}${slogan ? ` | ${slogan}` : ''}</title>
  <meta name="description" content="${description.replace(/"/g, '&quot;')}">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 antialiased font-sans">
  <header class="site-header sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-sm">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-lg shadow-sm">
          ${companyName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <span class="font-black text-lg tracking-tight text-slate-900">${companyName}</span>
          ${company.establishedYear ? `<span class="block text-[10px] text-slate-400 leading-none">EST. ${company.establishedYear}</span>` : ''}
        </div>
      </div>
      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold">
        <button class="text-indigo-600 border-b-2 border-indigo-600 py-5">Home</button>
        <button class="text-slate-600 hover:text-slate-900 py-5">Products</button>
        <button class="text-slate-600 hover:text-slate-900 py-5">About Us</button>
        <button class="text-slate-600 hover:text-slate-900 py-5">Contact</button>
      </nav>
      <div class="flex items-center gap-3">
        ${whatsapp ? `
          <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" target="_blank" rel="noreferrer" class="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
            <span>WhatsApp</span>
          </a>
        ` : ''}
        <a href="mailto:${email}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors">
          Inquire Now
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-12">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-14 text-white overflow-hidden shadow-xl mb-12">
      <div class="relative z-10 max-w-2xl">
        <span class="px-3.5 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider text-indigo-200 inline-block mb-4">
          ${company.type === 'factory' ? 'Direct Factory Exporter' : 'Premium Global Trader'}
        </span>
        <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
          ${slogan}
        </h1>
        <p class="text-base sm:text-lg text-indigo-100/90 mb-8 leading-relaxed">
          ${description}
        </p>
        <div class="flex flex-wrap gap-4 items-center">
          <a href="mailto:${email}" class="px-7 py-3 rounded-full bg-white text-indigo-950 font-bold text-sm hover:bg-indigo-50 shadow-md transition-colors">
            Get Instant Quote
          </a>
          ${phone ? `
            <a href="tel:${phone}" class="px-6 py-3 rounded-full bg-white/10 backdrop-blur text-white font-semibold text-sm hover:bg-white/20 transition-colors">
              Call: ${phone}
            </a>
          ` : ''}
        </div>
      </div>
    </section>

    <!-- Product Showcase Grid -->
    <section class="mb-14">
      <div class="flex items-end justify-between mb-8">
        <div>
          <span class="text-xs font-bold tracking-wider uppercase text-indigo-600">Product Lineup</span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Featured Export Products</h2>
        </div>
        <span class="text-xs font-medium text-slate-500">${products.length} Items Synchronized</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${productsHtml}
      </div>
    </section>

    <!-- Company Strength & Contact -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
      <div class="md:col-span-2 space-y-4">
        <span class="text-xs font-bold uppercase text-indigo-600 tracking-wider">About ${companyName}</span>
        <h2 class="text-2xl font-bold text-slate-900">Global Trade Excellence & Quality Assurance</h2>
        <p class="text-sm text-slate-600 leading-relaxed">${description}</p>
        ${company.certifications ? `
          <div class="pt-2">
            <span class="text-xs font-bold text-slate-400 block mb-1">CERTIFICATIONS</span>
            <div class="inline-flex px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
              ${company.certifications}
            </div>
          </div>
        ` : ''}
      </div>
      <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
        <div>
          <h3 class="font-bold text-slate-900 text-sm mb-3">Contact Information</h3>
          <div class="space-y-2 text-xs text-slate-600">
            <p><strong>Email:</strong> <a href="mailto:${email}" class="text-indigo-600 hover:underline">${email}</a></p>
            ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}" class="hover:underline">${phone}</a></p>` : ''}
            ${whatsapp ? `<p><strong>WhatsApp:</strong> ${whatsapp}</p>` : ''}
            ${address ? `<p><strong>Address:</strong> ${address}</p>` : ''}
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-200/60">
          <a href="mailto:${email}" class="w-full text-center block px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors">
            Send Message
          </a>
        </div>
      </div>
    </section>
  </main>

  <footer class="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
    <div class="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
      <p>100% 像素级克隆与还原模式 · Powered by 100% Pixel-Perfect AI Engine</p>
    </div>
  </footer>
</body>
</html>`;
  }

  const prompt = buildClonePrompt(
    project.name,
    cloneConfig,
    project.draft,
    project.id,
  );

  const userContent: Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string; detail: 'high' | 'auto' } }
  > = [{ type: 'text', text: prompt }];

  if (cloneConfig.uiImages && cloneConfig.uiImages.length > 0 && getImageAssetBase64) {
    const rolePriority: Record<string, number> = {
      home: 1,
      catalog: 2,
      detail: 3,
      about: 4,
      contact: 5,
      asset: 6,
    };
    const sortedImages = [...cloneConfig.uiImages].sort(
      (a, b) => (rolePriority[a.role || 'asset'] || 99) - (rolePriority[b.role || 'asset'] || 99),
    );

    for (let idx = 0; idx < Math.min(sortedImages.length, 12); idx++) {
      const img = sortedImages[idx];
      try {
        const base64 = await getImageAssetBase64(img.assetId);
        if (base64) {
          userContent.push({
            type: 'text',
            text: `【设计图参考 ${idx + 1}/${sortedImages.length}】指定页面角色: [${img.role || '素材'}]，文件名: ${img.name}。请仔细观察本图的色彩、排版比例、卡片阴影与圆角，务必 100% 像素级对齐！`,
          });
          userContent.push({
            type: 'image_url',
            image_url: {
              url: base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`,
              detail: 'high',
            },
          });
        }
      } catch {
        // Skip unreadable image
      }
    }
  }

  const primaryModel = resolveCloneModel(cloneConfig.model || env.TEXT_MODEL || 'gpt-6-astra');
  const candidateModels = Array.from(
    new Set([primaryModel, 'gpt-6-astra', 'gpt-5.6-sol', 'gpt-5.5', 'gpt-4o']),
  );

  const endpointCandidates = [
    'http://127.0.0.1:7005/v1/chat/completions',
    'https://api.openai.com/v1/chat/completions',
  ];

  let response: Response | null = null;
  let lastError: Error | null = null;

  modelLoop: for (const modelToTry of candidateModels) {
    const requestBody = {
      model: modelToTry,
      messages: [
        {
          role: 'system',
          content:
            'You are a world-class principal frontend engineer and pixel-perfect clone expert. Output ONLY the raw, complete, self-contained, responsive HTML file. Do NOT wrap in markdown code blocks like ```html. No explanations.',
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
      temperature: 0.2,
      max_tokens: 16384,
    };

    for (const url of endpointCandidates) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(url.includes('127.0.0.1') ? 180000 : 30000),
        });
        if (res.ok) {
          response = res;
          break modelLoop;
        }
        if (res.status === 404 || res.status === 400) {
          const errBody = await res.clone().text().catch(() => '');
          if (errBody.includes('model') || res.status === 404) {
            response = res;
            break;
          }
        }
        response = res;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  if (!response || !response.ok) {
    const errText = response
      ? await response.text()
      : lastError?.message || '网络连接超时';
    throw new ApiError(
      502,
      'openai_api_error',
      `OpenAI API 调用失败 (${response?.status || 'network_error'}): ${errText.slice(0, 300)}`,
    );
  }

  const jsonResult = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  let outputHtml = jsonResult.choices?.[0]?.message?.content ?? '';
  outputHtml = outputHtml
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!outputHtml || outputHtml.length < 100) {
    throw new ApiError(500, 'generation_failed', '生成代码过短或为空，请重试。');
  }

  // 100% 数据同步后置保障：将用户填写的真实信息强制二次同步校准
  outputHtml = syncDraftDataIntoHtml(outputHtml, project.draft, project.id);

  return outputHtml;
}

