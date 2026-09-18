import type { TemplateId } from './model';

export interface TemplateMediaRequirements {
  productCount: number;
  productSize: string;
  bannerSize: string;
  bannerNote: string;
  videos: number;
  slots: { count: number; width: number; height: number }[];
}

// Original slot geometry mirrors referenceLayouts; keep the large HTML bundle out of the editor.
// Product counts are recommendations for avoiding repeated images, never upload minimums.
export const templateMediaRequirements: Partial<Record<TemplateId, TemplateMediaRequirements>> = {
  'senseng-clean': {
    productCount: 8,
    productSize: '1536 × 1024（3:2）',
    bannerSize: '2560 × 850 及以上（3:1 宽幅，适配 27–32 寸大屏）',
    bannerNote: '经典展台与天空背景已内置。',
    videos: 0,
    slots: [
      {
        count: 8,
        width: 1536,
        height: 1024,
      },
    ],
  },
  'senseng-video': {
    productCount: 8,
    productSize: '1536 × 1024（3:2）',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '保留默认背景时无需上传。',
    videos: 1,
    slots: [
      {
        count: 8,
        width: 1536,
        height: 1024,
      },
    ],
  },
  'saas-automation': {
    productCount: 12,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '保留默认背景时无需上传。',
    videos: 1,
    slots: [
      {
        count: 1,
        width: 2580,
        height: 1594,
      },
      {
        count: 1,
        width: 660,
        height: 1040,
      },
      {
        count: 1,
        width: 842,
        height: 576,
      },
      {
        count: 1,
        width: 680,
        height: 354,
      },
      {
        count: 1,
        width: 585,
        height: 285,
      },
      {
        count: 1,
        width: 585,
        height: 368,
      },
      {
        count: 4,
        width: 1186,
        height: 928,
      },
      {
        count: 1,
        width: 1090,
        height: 336,
      },
      {
        count: 1,
        width: 456,
        height: 352,
      },
    ],
  },
  'fintech-platform': {
    productCount: 8,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '保留默认背景时无需上传。',
    videos: 0,
    slots: [
      {
        count: 1,
        width: 1724,
        height: 1639,
      },
      {
        count: 1,
        width: 1290,
        height: 1248,
      },
      {
        count: 1,
        width: 2564,
        height: 1207,
      },
      {
        count: 1,
        width: 641,
        height: 816,
      },
      {
        count: 1,
        width: 629,
        height: 404,
      },
      {
        count: 1,
        width: 1254,
        height: 520,
      },
      {
        count: 2,
        width: 597,
        height: 520,
      },
    ],
  },
  'digital-marketing': {
    productCount: 12,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '保留默认背景时无需上传。',
    videos: 0,
    slots: [
      {
        count: 1,
        width: 1366,
        height: 962,
      },
      {
        count: 1,
        width: 1252,
        height: 1252,
      },
      {
        count: 1,
        width: 960,
        height: 1344,
      },
      {
        count: 9,
        width: 625,
        height: 626,
      },
    ],
  },
  'porto-accounting': {
    productCount: 3,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '保留默认背景时无需上传。',
    videos: 0,
    slots: [
      {
        count: 1,
        width: 641,
        height: 641,
      },
      {
        count: 2,
        width: 511,
        height: 600,
      },
    ],
  },
  'crafto-corporate': {
    productCount: 6,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '保留默认背景时无需上传。',
    videos: 0,
    slots: [
      {
        count: 2,
        width: 595,
        height: 595,
      },
      {
        count: 1,
        width: 675,
        height: 560,
      },
      {
        count: 3,
        width: 600,
        height: 430,
      },
    ],
  },
  'juno-toys': {
    productCount: 12,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '保留默认背景时无需上传。',
    videos: 0,
    slots: [
      {
        count: 4,
        width: 650,
        height: 572,
      },
      {
        count: 6,
        width: 630,
        height: 630,
      },
      {
        count: 1,
        width: 520,
        height: 599,
      },
      {
        count: 1,
        width: 630,
        height: 482,
      },
    ],
  },
  'corpox-ai-agency': {
    productCount: 12,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '保留默认背景时无需上传。',
    videos: 0,
    slots: [
      {
        count: 3,
        width: 842,
        height: 730,
      },
      {
        count: 6,
        width: 494,
        height: 494,
      },
      {
        count: 1,
        width: 980,
        height: 1100,
      },
      {
        count: 2,
        width: 1068,
        height: 1215,
      },
    ],
  },
  'corpox-consulting': {
    productCount: 12,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '保留默认背景时无需上传。',
    videos: 1,
    slots: [
      {
        count: 1,
        width: 531,
        height: 685,
      },
      {
        count: 6,
        width: 1010,
        height: 756,
      },
      {
        count: 3,
        width: 918,
        height: 928,
      },
      {
        count: 2,
        width: 494,
        height: 494,
      },
    ],
  },
  'senseng-candy': {
    productCount: 8,
    productSize: '1200 × 1200（1:1）',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '马卡龙糖果粉彩背景与悬浮萌宠特写已内置。',
    videos: 0,
    slots: [
      {
        count: 8,
        width: 1200,
        height: 1200,
      },
    ],
  },
  'senseng-wonder': {
    productCount: 8,
    productSize: '1200 × 1200（1:1）',
    bannerSize: '2560 × 1440 及以上（16:9，适配 27–32 寸大屏及 4K）',
    bannerNote: '北欧温暖画卷与波浪曲线沉浸背景已内置。',
    videos: 0,
    slots: [
      {
        count: 8,
        width: 1200,
        height: 1200,
      },
    ],
  },
};
