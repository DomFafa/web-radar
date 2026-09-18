import { describe, it } from 'vitest';
import { renderSite } from '../src/templates/index';
import type { Draft, Language } from '../src/shared/model';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

describe('generate previews', () => {
  it('captures senseng-candy and senseng-wonder preview screenshots', async () => {
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
      products: [
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
      ],
      primaryProductId: 'p-1',
      category: 'toys',
      country: 'CN',
      languages: ['en'],
      template,
      brandColor: template === 'senseng-candy' ? '#ff6b8b' : '#2a9d8f',
      copy: {
        en: {
          headline: template === 'senseng-candy' 
            ? 'Pop the Stress Away, Squeeze Pure Magic!' 
            : 'Warm Tactile Companions Crafted for Pure Joy',
          subtitle: template === 'senseng-candy'
            ? 'Original Sensory Squishies & Kawaii Pocket Friends'
            : 'Timeless Nordic Design Meets Playful Imagination',
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

    const candyHtml = renderSite(draft('senseng-candy'), opts);
    const wonderHtml = renderSite(draft('senseng-wonder'), opts);

    // Start a temporary HTTP server serving public/ and the html pages
    const publicDir = path.resolve('public');
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      if (url.pathname === '/candy') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(candyHtml);
        return;
      }
      if (url.pathname === '/wonder') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(wonderHtml);
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

      // Capture candy preview
      await page.goto(`${baseUrl}/candy`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const candyPath = path.resolve('public/templates/previews/senseng-candy.jpg');
      await page.screenshot({
        path: candyPath,
        type: 'jpeg',
        quality: 90,
        clip: { x: 0, y: 0, width: 1440, height: 1000 },
      });

      // Capture wonder preview
      await page.goto(`${baseUrl}/wonder`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const wonderPath = path.resolve('public/templates/previews/senseng-wonder.jpg');
      await page.screenshot({
        path: wonderPath,
        type: 'jpeg',
        quality: 90,
        clip: { x: 0, y: 0, width: 1440, height: 1000 },
      });

      console.log('Screenshots saved successfully!');
    } finally {
      await browser.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }, 30000);
});
