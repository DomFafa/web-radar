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
    bannerSize: '2560 × 800（3.2:1 宽幅展台，适合 2K/大屏通栏）',
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
    bannerSize: '2560 × 1440（16:9 全屏画卷，适配 2K/4K/Retina 大屏）',
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
  'senseng-candy': {
    productCount: 8,
    productSize: '1200 × 1200（1:1）',
    bannerSize: '2560 × 930（8:3 宽幅甜美画卷，适配萌宠主图排版）',
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
    bannerSize: '2560 × 1070（12:5 北欧治愈插画与自然光画卷）',
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
  'senseng-arcade': {
    productCount: 8,
    productSize: '1200 × 1200（1:1）',
    bannerSize: '2560 × 1000（16:6 赛博霓虹机能全景背景）',
    bannerNote: '赛博机能 HUD 仪表台与极光电光特写已内置。',
    videos: 0,
    slots: [
      {
        count: 8,
        width: 1200,
        height: 1200,
      },
    ],
  },
  'senseng-nature': {
    productCount: 8,
    productSize: '1200 × 1200（1:1）',
    bannerSize: '2560 × 960（8:3 森林原木与自然光晨雾背景）',
    bannerNote: '原野森林生态画卷与晨雾自然光影已内置。',
    videos: 0,
    slots: [
      {
        count: 8,
        width: 1200,
        height: 1200,
      },
    ],
  },
  'senseng-minimal': {
    productCount: 8,
    productSize: '1200 × 1200（1:1）',
    bannerSize: '2560 × 830（3:1 极简现代艺术画廊宽幅背景）',
    bannerNote: '瑞士国际主义极简雕塑展台与纯净留白已内置。',
    videos: 0,
    slots: [
      {
        count: 8,
        width: 1200,
        height: 1200,
      },
    ],
  },
  'saas-automation': {
    productCount: 12,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1140（9:4 现代科技软件大屏通栏）',
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
  'corpox-ai-agency': {
    productCount: 12,
    productSize: '1200 × 1200（1:1），主体四周留白',
    bannerSize: '2560 × 1100（7:3 智能算力网格全景背景）',
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
};

