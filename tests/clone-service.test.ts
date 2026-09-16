import { describe, expect, it } from 'vitest';
import { defaultDraft } from '../src/worker/domain';
import { cloneWorkflowSteps, getWorkflowSteps, draftChecklist } from '../src/client/workflow';
import {
  buildClonePrompt,
  generateCloneSite,
  resolveCloneModel,
  syncDraftDataIntoHtml,
} from '../src/worker/clone-service';
import type { CloneConfig, Project } from '../src/shared/model';
import type { AppEnv } from '../src/worker/env';

describe('100% 像素级克隆与还原模式 (Clone Workflow)', () => {
  it('returns clone workflow steps when draft.buildBranch is clone', () => {
    const draft = defaultDraft();
    draft.buildBranch = 'clone';
    const steps = getWorkflowSteps(draft);
    expect(steps).toEqual(cloneWorkflowSteps);
    expect(steps.map((s) => s[0])).toEqual(['basics', 'clone-generate', 'publish']);
  });

  it('correctly tracks checklist readiness for clone mode', () => {
    const draft = defaultDraft();
    draft.buildBranch = 'clone';
    draft.cloneConfig = {
      targetUrl: 'https://squishytoys.store',
      status: 'ready',
      generatedHtml: '<html><body>Hello</body></html>',
    };

    const checklist = draftChecklist(draft);
    expect(checklist.length).toBe(3);
    expect(checklist.every((c) => c.ready)).toBe(true);
    expect(checklist[0].id).toBe('clone-source');
    expect(checklist[1].id).toBe('clone-generate');
    expect(checklist[2].id).toBe('build');
  });

  it('buildClonePrompt includes 4 core anti-distortion rules and vision guidance', () => {
    const config: CloneConfig = {
      targetUrl: 'https://squishytoys.store',
      scrapedData: {
        title: 'Senseng Squishy Toys',
        description: 'Quality squishy toys',
        headings: ['Explore Our Squishy Toy Lines', 'Kids and gift-facing styles'],
        navLinks: [
          { href: '/', text: 'Home' },
          { href: '/products', text: 'Products' },
        ],
      },
      instructions: '保持原站清新天蓝色调与两列/四列卡片网格比例',
      uiImages: [
        { id: '1', assetId: 'ast-1', name: 'index.jpg', role: 'home' },
        { id: '2', assetId: 'ast-2', name: 'catalog.jpg', role: 'catalog' },
      ],
    };

    const prompt = buildClonePrompt('Senseng Toy Store', config, 'Senseng Industrial');

    expect(prompt).toContain('100% 像素级高保真克隆专家');
    expect(prompt).toContain('四大核心视觉解析与防畸变铁律');
    expect(prompt).toContain('导航菜单栏必须 100% 完整常驻显示且下划线精确居中');
    expect(prompt).toContain('Hero 展台必须为一体化完整场景大图，严禁散装碎拼');
    expect(prompt).toContain('首页商品卡片严禁硬塞规格文字');
    expect(prompt).toContain('按钮形态与图标几何防畸变');
    expect(prompt).toContain('https://squishytoys.store');
    expect(prompt).toContain('Senseng Squishy Toys');
    expect(prompt).toContain('index.jpg');
    expect(prompt).toContain('保持原站清新天蓝色调');
  });

  it('generateCloneSite returns valid mock HTML in test mode when no API key is provided', async () => {
    const draft = defaultDraft();
    draft.buildBranch = 'clone';
    const project: Project = {
      id: 'proj-clone-test',
      ownerId: 'user-1',
      workspaceId: 'ws-1',
      name: 'Clone Test Site',
      version: 1,
      draft,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      offline: true,
    };

    const env: AppEnv = {
      ENVIRONMENT: 'test',
      TEST_PROVIDERS: 'true',
    } as unknown as AppEnv;

    const html = await generateCloneSite(env, project, {
      targetUrl: 'https://example.com',
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Clone Test Site');
    expect(html).toContain('100% 像素级克隆与还原模式');
  });

  it('syncDraftDataIntoHtml strictly synchronizes company details, contacts and products into HTML', () => {
    const draft = defaultDraft();
    draft.company = {
      ...draft.company,
      name: 'Global Export Tech Ltd',
      slogan: 'Leading Innovator in Smart Automation',
      email: 'alex@globalexport.com',
      whatsapp: '+86 18822345688',
      phone: '+86 21 88889999',
      facebook: 'https://facebook.com/globalexport',
      instagram: 'https://instagram.com/globalexport',
      linkedin: 'https://linkedin.com/company/globalexport',
      x: 'https://x.com/globalexport',
    };

    const rawHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Old Company - Old Slogan</title>
  <meta name="description" content="Old Description">
</head>
<body>
  <a href="mailto:old@example.com">Email Us</a>
  <a href="https://wa.me/12345678">WhatsApp Chat</a>
  <a href="tel:00000000">Call Us</a>
  <a href="https://facebook.com/oldpage">Facebook</a>
  <a href="https://instagram.com/oldpage">Instagram</a>
</body>
</html>`;

    const synced = syncDraftDataIntoHtml(rawHtml, draft);

    expect(synced).toContain('<title>Global Export Tech Ltd | Leading Innovator in Smart Automation</title>');
    expect(synced).toContain('href="mailto:alex@globalexport.com"');
    expect(synced).toContain('href="https://wa.me/8618822345688"');
    expect(synced).toContain('href="tel:+86 21 88889999"');
    expect(synced).toContain('href="https://facebook.com/globalexport"');
    expect(synced).toContain('href="https://instagram.com/globalexport"');
  });

  it('buildClonePrompt with Draft object injects all company and product fields', () => {
    const draft = defaultDraft();
    draft.company = {
      ...draft.company,
      name: 'Shenzhen Alpha Trading',
      slogan: 'Custom Electronics OEM ODM',
      email: 'sales@alphatrading.cn',
      whatsapp: '8613999999999',
      phone: '0755-12345678',
      address: 'High-Tech Park, Nanshan, Shenzhen',
      establishedYear: '2015',
    };
    draft.products = [
      {
        id: 'prod-1',
        name: 'Wireless Ergonomic Keyboard',
        description: 'Multi-device Bluetooth 5.0 mechanical keyboard',
        material: 'Anodized Aluminum + PBT',
        dimensions: '350 x 130 x 25 mm',
      },
    ];

    const prompt = buildClonePrompt('Alpha Site', {}, draft);

    expect(prompt).toContain('Shenzhen Alpha Trading');
    expect(prompt).toContain('Custom Electronics OEM ODM');
    expect(prompt).toContain('sales@alphatrading.cn');
    expect(prompt).toContain('8613999999999');
    expect(prompt).toContain('High-Tech Park, Nanshan, Shenzhen');
    expect(prompt).toContain('Wireless Ergonomic Keyboard');
    expect(prompt).toContain('Multi-device Bluetooth 5.0 mechanical keyboard');
    expect(prompt).toContain('Anodized Aluminum + PBT');
  });

  it('resolveCloneModel correctly maps gpt-6, gpt-5.6, gpt-5.5 and defaults to gpt-6-astra', () => {
    expect(resolveCloneModel('gpt-6')).toBe('gpt-6-astra');
    expect(resolveCloneModel('gpt-6-astra')).toBe('gpt-6-astra');
    expect(resolveCloneModel('gpt-5.6')).toBe('gpt-5.6-sol');
    expect(resolveCloneModel('gpt-5.6-sol')).toBe('gpt-5.6-sol');
    expect(resolveCloneModel('gpt-5.5')).toBe('gpt-5.5');
    expect(resolveCloneModel('gpt-5.5-pro')).toBe('gpt-5.5-pro');
    expect(resolveCloneModel('gpt-4o')).toBe('gpt-4o');
    expect(resolveCloneModel(undefined)).toBe('gpt-6-astra');
    expect(resolveCloneModel('')).toBe('gpt-6-astra');
  });
});

