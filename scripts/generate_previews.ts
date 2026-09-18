import { describe, it } from 'vitest';
import { renderSite } from '../src/templates/index';
import type { Draft, Language } from '../src/shared/model';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

describe('generate previews', () => {
  it('captures senseng templates preview screenshots', async () => {
    const products = [
      {
        id: 'p-1',
        name: 'Shiba Inu Pop Bead Squeeze',
        description: 'Bursting sensory beads with slow-rebound soft touch. Instant stress relief companion.',
        material: 'Food-Grade TPR Silicone',
        dimensions: '8.5 × 6.5 cm',
        imageAssetId: 'p1',
      },
      {
        id: 'p-2',
        name: 'Sweet Cat Playmate Pouch',
        description: 'Ultra-soft squishy kitten with bell collar & cozy carrying pouch.',
        material: 'High-Elastic Memory Gel',
        dimensions: '9.0 × 7.0 cm',
        imageAssetId: 'p2',
      },
      {
        id: 'p-3',
        name: 'Penguin Desk Anti-Stress Buddy',
        description: 'Weighted soothing squishy companion designed for focused work and quiet study.',
        material: 'BPA-Free Elastic Silicone',
        dimensions: '7.8 × 5.2 cm',
        imageAssetId: 'p3',
      },
      {
        id: 'p-4',
        name: 'Aurora Thermal Narwhal Plush-Gel',
        description: 'Magical color-shifting horn with soothing tactile squish response.',
        material: 'Eco Thermo-Sensing PU',
        dimensions: '10.5 × 6.0 cm',
        imageAssetId: 'p4',
      },
      {
        id: 'p-5',
        name: 'Rainbow Cloud Jelly Switcher',
        description: 'Bioluminescent soothing squishy cloud with gentle chromatic diffusion.',
        material: 'Optic Elastic Polymer',
        dimensions: '9.5 × 6.0 cm',
        imageAssetId: 'p5',
      },
      {
        id: 'p-6',
        name: 'Stellar Cosmic Galaxy Orb',
        description: 'Swirling celestial glitter encased in ultra-durable shock-absorbing gel.',
        material: 'High-Purity Silicone Gel',
        dimensions: '7.0 × 7.0 cm',
        imageAssetId: 'p6',
      },
      {
        id: 'p-7',
        name: 'Kawaii Strawberry Matcha Bunny',
        description: 'Slow-rise velvety texture infused with natural soothing aromatics.',
        material: 'Botanical Memory Foam',
        dimensions: '11.0 × 6.5 cm',
        imageAssetId: 'p7',
      },
      {
        id: 'p-8',
        name: 'Zen Forest Tactile Acorn Trio',
        description: 'Organic hand-turned beechwood cap paired with ultra-tactile acoustic core.',
        material: 'FSC Beech & Organic Silicone',
        dimensions: '6.0 × 5.0 cm',
        imageAssetId: 'p8',
      },
    ];

    const brandColors: Record<string, string> = {
      'senseng-candy': '#ff6b8b',
      'senseng-wonder': '#2a9d8f',
      'senseng-arcade': '#00f5d4',
      'senseng-nature': '#2d4a22',
      'senseng-minimal': '#111827',
    };

    const headlines: Record<string, string> = {
      'senseng-candy': 'Pop the Stress Away, Squeeze Pure Magic!',
      'senseng-wonder': 'Warm Tactile Companions Crafted for Pure Joy',
      'senseng-arcade': 'Next-Gen Cyber Toybox & Sonic Tactile Playground',
      'senseng-nature': 'Earth-Crafted Wooden Companions & Botanical Wonders',
      'senseng-minimal': 'The Pure Architecture of Tactile Form',
    };

    const subtitles: Record<string, string> = {
      'senseng-candy': 'Original Sensory Squishies & Kawaii Pocket Friends',
      'senseng-wonder': 'Timeless Nordic Design Meets Playful Imagination',
      'senseng-arcade': 'Ultra-Reactive Sensory Machines Engineered for Future Play',
      'senseng-nature': 'Gentle Organic Textures Nurturing Childhood Curiosity & Earth Harmony',
      'senseng-minimal': 'Sculptural Play Objects for the Design-Discerning Modern Nursery',
    };

    const draft = (template: Draft['template']): Draft => ({
      company: {
        name: 'SENSENG TOYS',
        email: 'sales@sensengtoys.com',
        contactName: 'Chloe Lin',
        type: 'manufacturer',
        description: 'Sensory Wonder & Kawaii Squishy Worlds. Certified BPA-free, high-elastic food-grade sensory squeeze toys.',
        facebook: 'https://facebook.com/sensengtoys',
        instagram: 'https://instagram.com/sensengtoys',
        x: '',
      },
      products,
      primaryProductId: 'p-1',
      category: 'toys',
      country: 'CN',
      languages: ['en'],
      template,
      brandColor: brandColors[template] || '#ff6b8b',
      copy: {
        en: {
          headline: headlines[template] || 'Sensory Play Crafted for Pure Joy',
          subtitle: subtitles[template] || 'Certified BPA-Free Tactile Worlds',
          about: 'Senseng Crafts premium sensory squishy toys certified to EN71, ASTM F963 and CPSIA standards.',
          cta: 'Explore Sensory Toys',
        },
      },
      duration: 8,
      direction: 'Playful and bright',
      script: '',
      scriptRevision: 1,
      scenes: [],
      storyboardRevision: 1,
      heroAssetId: '',
      posterAssetId: '',
      heroAccepted: true,
    });

    const opts = {
      projectId: 'preview-project',
      lang: 'en' as Language,
      page: 'home',
      assetUrl: (id: string) => {
        const num = id.replace('p', '');
        return `/templates/senseng/products-${num}.jpg`;
      },
      inquiryUrl: '/api/inquiries',
      preview: true,
    };

    const templatesToRender: Draft['template'][] = [
      'senseng-candy',
      'senseng-wonder',
      'senseng-arcade',
      'senseng-nature',
      'senseng-minimal',
    ];

    const renderedPages = new Map<string, string>();
    for (const t of templatesToRender) {
      renderedPages.set(t, renderSite(draft(t), opts));
    }

    // Start a temporary HTTP server serving public/ and the html pages
    const publicDir = path.resolve('public');
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      const route = url.pathname.replace(/^\//, '');
      if (renderedPages.has(route)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(renderedPages.get(route));
        return;
      }

      // Serve static files from public
      const filePath = path.join(publicDir, decodeURIComponent(url.pathname));
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
          '.css': 'text/css',
          '.js': 'application/javascript',
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const port = (server.address() as any).port;
    const baseUrl = `http://127.0.0.1:${port}`;

    const browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
    });

    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        deviceScaleFactor: 1,
      });

      for (const t of templatesToRender) {
        await page.goto(`${baseUrl}/${t}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(600);
        const screenshotPath = path.resolve(`public/templates/previews/${t}.jpg`);
        await page.screenshot({
          path: screenshotPath,
          type: 'jpeg',
          quality: 90,
          clip: { x: 0, y: 0, width: 1440, height: 1000 },
        });
        console.log(`Saved screenshot for ${t} -> ${screenshotPath}`);
      }

      console.log('All screenshots saved successfully!');
    } finally {
      await browser.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }, 60000);
});
