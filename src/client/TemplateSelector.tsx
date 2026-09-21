import React, { useState } from 'react';
import type { Draft, TemplateId } from '../shared/model';
import { Button, Icon } from './components';
import { templateMediaRequirements } from '../shared/template-media';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  englishName: string;
  tagline: string;
  category: 'consumer' | 'tech' | 'enterprise' | 'creative';
  industries: string[];
  features: string[];
  accentColor: string;
  badge: string;
  hasVideo?: boolean;
  previewImg: string;
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'senseng-clean',
    name: '经典工贸',
    englishName: 'Clean Trade',
    tagline: '参考 webimg 原案；高雅明亮排版，强化货架视觉与批发询盘',
    category: 'consumer',
    industries: ['跨境工贸', '消费玩具', '日用百货', '家居收纳', '快消品'],
    features: ['按设计图重建', '左文右图 Hero 展位', '8宫格品类橱窗', '快速询盘表单'],
    accentColor: '#089ced',
    badge: '参考设计图 · 首选模版',
    previewImg: '/templates/previews/senseng-clean.jpg',
  },
  {
    id: 'senseng-video',
    name: '全屏视频版',
    englishName: 'Immersive Video',
    tagline: '模版 1 动感升级：首屏 100vh 全屏视频背景铺满，带呼吸感大标题与平滑下滚',
    category: 'consumer',
    industries: ['品牌出海', '精品独立站', '潮流消费品', '生态家居', '外贸工厂'],
    features: ['100vh 动态视频全屏铺满', '半透明磨砂质感浮层', '平滑下滚引导箭头', '声画动效控制'],
    accentColor: '#0284c7',
    badge: '首屏动态视频 · 沉浸震撼',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'senseng-candy',
    name: '缤纷糖果乐园',
    englishName: 'Candy Pop & Play',
    tagline: '专为儿童萌趣玩具与触感解压公仔定制；马卡龙粉彩体系、立体圆角泡泡与感官触觉矩阵',
    category: 'consumer',
    industries: ['儿童玩具', '萌宠解压', '感官潮玩', '亲子母婴', '外贸出口'],
    features: ['马卡龙糖果配色', '左右分栏萌趣舞台', '4大感官魔力标签', '立体糖果展台网格'],
    accentColor: '#ff6b8b',
    badge: '童趣感官玩具 · 爆款首选',
    previewImg: '/templates/previews/senseng-candy.jpg',
  },
  {
    id: 'senseng-wonder',
    name: '北欧温润工坊',
    englishName: 'Nordic Wonder Studio',
    tagline: '专为品质玩具独立站与全龄桌面疗愈设计；温暖奶油大地色、北欧便当盒画廊与波浪有机曲线',
    category: 'consumer',
    industries: ['益智玩具', '治愈解压', '精品独立站', '生活美学潮玩', '品牌代工'],
    features: ['全屏画卷轮播', '北欧便当盒画廊', '波浪有机曲线分割', '材质工艺与FAQ'],
    accentColor: '#f77f00',
    badge: '北欧温润绘本 · 精品独立站',
    previewImg: '/templates/previews/senseng-wonder.jpg',
  },
  {
    id: 'senseng-arcade',
    name: '霓虹赛博潮玩',
    englishName: 'Cyber Arcade & Pop',
    tagline: '机能潮玩机甲 HUD 与电光霓虹；物理触感动态进度条、实时跑数与赛博盲盒展台',
    category: 'consumer',
    industries: ['潮流盲盒', '机能玩具', '极客解压', '电竞桌面潮玩', '外贸直采'],
    features: ['赛博HUD仪表台', '物理参数动态进度条', '实时跑数计数器', '街机芯片卡片'],
    accentColor: '#00f5d4',
    badge: '机能赛博潮玩 · 动态跑数',
    previewImg: '/templates/previews/senseng-arcade.jpg',
  },
  {
    id: 'senseng-nature',
    name: '森林原野工坊',
    englishName: 'Botanical & Forest',
    tagline: '零塑环保自然主义；晨露鼠尾草绿、生态减碳动态进度条、波浪曲线与植物画册瀑布流',
    category: 'consumer',
    industries: ['母婴玩具', '环保可降解', '自然生活美学', '绿色供应链', '亲子早教'],
    features: ['柔和波浪弧线', '生态减碳进度条', '晨雾滑入动效', '植物标本瀑布流'],
    accentColor: '#4a7c59',
    badge: '零塑环保自然 · 动态减碳条',
    previewImg: '/templates/previews/senseng-nature.jpg',
  },
  {
    id: 'senseng-minimal',
    name: '瑞士极简生活馆',
    englishName: 'Swiss Minimal Gallery',
    tagline: '瑞士现代主义大留白与艺术品展台；精密阻尼刻度条、典藏编号序列与奢品解构详情',
    category: 'creative',
    industries: ['艺术潮玩', '设计师买手店', '奢品感官生活', '现代家居', '高端礼品'],
    features: ['艺术馆聚光灯展台', '精密材料学阻尼刻度', '编号典藏展签', '奢品级单品解构'],
    accentColor: '#c59b27',
    badge: '瑞士极简画廊 · 奢品级解构',
    previewImg: '/templates/previews/senseng-minimal.jpg',
  },
  {
    id: 'saas-automation',
    name: 'SaaS 智能自动化',
    englishName: 'Automation SaaS Tailwind',
    tagline: '参考 automation-saas-tailwind；浅色视频首屏、悬浮胶囊导航与玻璃面板',
    category: 'tech',
    industries: ['SaaS 软件', '云计算', '开发者工具', '自动化平台', '出海软件'],
    features: ['参考站原版视频', '悬浮圆角导航', '玻璃展示面板', '自动绑定产品图片'],
    accentColor: '#bef264',
    badge: '原版动态视频 · 清透浅色',
    hasVideo: true,
    previewImg: '/templates/previews/saas-automation.jpg',
  },
  {
    id: 'corpox-ai-agency',
    name: 'Corpox AI 智能工坊',
    englishName: 'Corpox Next-Gen AI Studio',
    tagline: '参考 Corpox AI Agency；浅粉同心拱形背景、珊瑚红按钮与居中大字',
    category: 'tech',
    industries: ['AI 大模型', '具身智能 / 机器人', '机器视觉', '算法实验室', '硬核前沿科技'],
    features: ['浅粉同心拱形', '珊瑚红强调色', '居中大字排版', '自动绑定产品图片'],
    accentColor: '#ef6464',
    badge: '浅粉珊瑚 · AI 创意',
    previewImg: '/templates/previews/corpox-ai-agency.jpg',
  },
  {
    id: 'universal-trade-banner',
    name: '全品类精选展台',
    englishName: 'Universal Trade Banner',
    tagline: '通用商品旗舰展台；多层次悬浮微晶白底、Apple 液态玻璃胶囊导航与动态品类筛选魔盒',
    category: 'enterprise',
    industries: ['通用商品', '外贸出口', '日用消费品', '综合商贸', '多品类供应链'],
    features: ['全品类旗舰展台', 'Apple 液态玻璃', '动态品类筛选魔盒', '全套多语言富内页'],
    accentColor: '#1e3a8a',
    badge: '通用商品 · 旗舰展台',
    previewImg: '/templates/previews/senseng-clean.jpg',
  },
  {
    id: 'universal-showcase-video',
    name: '全景商贸视界',
    englishName: 'Universal Showcase Video',
    tagline: '100vh 动态出海商贸与智能制造视界视频；流体毛玻璃音画控制器与实时跑数商贸指标',
    category: 'enterprise',
    industries: ['跨境商贸', '通用制造', '综合工贸', '大宗采购', '出海品牌'],
    features: ['100vh 沉浸视频背景', '流体毛玻璃控制器', '商贸出海动态跑数', '多语言内页矩阵'],
    accentColor: '#0284c7',
    badge: '通用商品 · 沉浸视频',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'toys-figure-banner',
    name: '潮玩手办殿堂',
    englishName: 'Toys & Figure Banner',
    tagline: '赛博机能与潮玩艺术展馆；霓虹微光亚克力展台、3D 景深悬浮盲盒展签与材质解构',
    category: 'creative',
    industries: ['玩具与公仔', '潮流手办', '机甲模型', 'IP 授权衍生', '盲盒收藏'],
    features: ['赛博亚克力展台', '盲盒编号展签', '模具精度解构', '全套手办定制内页'],
    accentColor: '#8b5cf6',
    badge: '玩具公仔 · 潮玩展台',
    previewImg: '/templates/previews/senseng-arcade.jpg',
  },
  {
    id: 'toys-interactive-video',
    name: '机动潮玩动感视界',
    englishName: 'Toys Interactive Video',
    tagline: '可动机甲与互动公仔动态演示全屏视频；悬浮磨砂玻璃 HUD 仪表与光效粒子动效',
    category: 'consumer',
    industries: ['玩具与公仔', '机动潮玩', '可动机甲', '益智模型', '遥控与声光玩具'],
    features: ['100vh 可动机甲视频', '磨砂玻璃 HUD 仪表', '动态参数进度条', '全套机甲规格内页'],
    accentColor: '#f59e0b',
    badge: '玩具公仔 · 动感视界',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'plush-cushion-banner',
    name: '云朵云绒治愈馆',
    englishName: 'Plush & Cushion Banner',
    tagline: '奶油风超柔治愈美学；云朵轻柔波浪分割、亲肤触感微交互与婴儿级环保材质印章',
    category: 'consumer',
    industries: ['毛绒与靠垫', '毛绒玩偶', '慢回弹靠垫', '治愈抱枕', '家居软饰'],
    features: ['奶油风云朵美学', '亲肤触感微交互', '母婴级环保认证', '全套治愈系内页'],
    accentColor: '#e07a5f',
    badge: '毛绒靠垫 · 云绒治愈',
    previewImg: '/templates/previews/senseng-candy.jpg',
  },
  {
    id: 'plush-living-video',
    name: '慢调软包时光',
    englishName: 'Plush Living Video',
    tagline: '慢镜头生活场景短片；晨光微风拂动织绒与慢回弹靠垫解压受压恢复动效，清透晨雾液态毛玻璃',
    category: 'consumer',
    industries: ['毛绒与靠垫', '慢调生活', '精品软装', '治愈解压公仔', '舒适靠枕'],
    features: ['100vh 慢镜头织绒视频', '慢回弹受压恢复评测', '晨雾液态毛玻璃', '温馨家居全套内页'],
    accentColor: '#797d62',
    badge: '毛绒靠垫 · 慢调视界',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-nature.jpg',
  },
  {
    id: 'apparel-fabric-banner',
    name: '奢品织造工坊',
    englishName: 'Apparel & Fabric Banner',
    tagline: '国际时装杂志 Editorial 画册留白排版；高定面料经纬微距光影与典雅英文字体',
    category: 'creative',
    industries: ['服装与纺织品', '高端成衣', '时装定制', '经纬织物', '设计师买手女装'],
    features: ['时装画册留白排版', '经纬面料微距光影', '液态玻璃质感挂牌', 'CLO 3D 快速出样内页'],
    accentColor: '#27272a',
    badge: '服装纺织 · 奢品工坊',
    previewImg: '/templates/previews/senseng-minimal.jpg',
  },
  {
    id: 'apparel-runway-video',
    name: '动态时装风尚视界',
    englishName: 'Apparel Runway Video',
    tagline: 'Runway 走秀模特与高定面料飘逸动态视频；悬浮极简透明玻璃导航栏与光影折射',
    category: 'creative',
    industries: ['服装与纺织品', 'T台秀场风尚', '先锋时装品牌', '功能性运动服装', '外贸针织成衣'],
    features: ['100vh Runway 走秀视频', '悬浮透明玻璃导航', '面料垂坠动态质感', '时装季刊全套内页'],
    accentColor: '#b45309',
    badge: '服装纺织 · 秀场风尚',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'footwear-craft-banner',
    name: '先锋工匠鞋履台',
    englishName: 'Footwear Craft Banner',
    tagline: '工程级鞋底气垫透视；手工缝线与工匠皮革展台、材质分层解构悬浮标牌',
    category: 'consumer',
    industries: ['鞋靴制造', '户外徒步靴', '碳板竞速跑鞋', '固特异正装皮鞋', '潮牌运动鞋'],
    features: ['鞋底气垫工程透视', '分层解构悬浮标牌', '力学生物工效学', '全套鞋履定制内页'],
    accentColor: '#d97706',
    badge: '鞋靴制造 · 先锋工匠',
    previewImg: '/templates/previews/senseng-arcade.jpg',
  },
  {
    id: 'footwear-kinetic-video',
    name: '破风运动鞋履动效',
    englishName: 'Footwear Kinetic Video',
    tagline: '户外越野冲刺、抓地爆发与动力回弹全屏动态短片；流光破风线条与物理抗扭刻度',
    category: 'tech',
    industries: ['鞋靴制造', '专业越野跑鞋', '轻量化马拉松竞速', '机能运动装备', '智能穿戴鞋履'],
    features: ['100vh 越野爆发冲刺视频', '物理抗扭动态刻度', '超临界发泡参数分析', '生物力学全套内页'],
    accentColor: '#10b981',
    badge: '鞋靴制造 · 破风动效',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'luggage-leather-banner',
    name: '意式典藏皮具箱包',
    englishName: 'Luggage Leather Banner',
    tagline: '意式工匠手工植鞣皮革与高定旅行箱包；复古光影留白展台、微距五金解构与奢品旅行箱体',
    category: 'consumer',
    industries: ['箱包皮具', '高定旅行箱', '手工植鞣皮具', '商务公文包', '登机箱配件'],
    features: ['工匠黄铜五金微距', '手工缝线皮具展台', '防刮耐磨参数矩阵', '全套箱包定制内页'],
    accentColor: '#854d0e',
    badge: '箱包皮具 · 意式典藏',
    previewImg: '/templates/previews/senseng-minimal.jpg',
  },
  {
    id: 'luggage-voyage-video',
    name: '环球探索极境箱包',
    englishName: 'Luggage Voyage Video',
    tagline: '国际机场登机与世界漫游全屏视频；万向轮静音滑行、跌落冲击测试与磨砂金属悬浮控制器',
    category: 'consumer',
    industries: ['箱包皮具', '航空拉杆箱', '户外探险背包', '防爆旅行装备', '轻量化登机箱'],
    features: ['100vh 机场环球视频', '万向轮静音阻尼测试', '航天铝框抗压解构', '全套极境漫游内页'],
    accentColor: '#0369a1',
    badge: '箱包皮具 · 环球探索',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'jewelry-luxury-banner',
    name: '瑰丽高珠典藏',
    englishName: 'Jewelry Luxury Banner',
    tagline: '黑曜石殿堂高定珠宝与高级微距火彩；深邃暗黑丝绒、多棱角微距聚光灯与液态金光晕',
    category: 'creative',
    industries: ['珠宝腕表', '高级珠宝', '钻石首饰', '典藏彩宝', '贵金属定制'],
    features: ['黑曜石微距展台', '钻石火彩全反射', '4C 权威评级卡片', '高定珠宝全套内页'],
    accentColor: '#d4af37',
    badge: '珠宝腕表 · 瑰丽典藏',
    previewImg: '/templates/previews/senseng-minimal.jpg',
  },
  {
    id: 'jewelry-timeless-video',
    name: '永恒精密时计',
    englishName: 'Jewelry Timeless Video',
    tagline: '瑞士高级制表机械机芯陀飞轮微距运转视频；悬浮液态玻璃 HUD 刻度盘与光影折射动效',
    category: 'creative',
    industries: ['珠宝腕表', '机械腕表', '独立制表', '奢华名表', '精密陀飞轮'],
    features: ['100vh 陀飞轮运转视频', '液态玻璃 HUD 刻度盘', '天文台认证振频解析', '精密腕表全套内页'],
    accentColor: '#eab308',
    badge: '珠宝腕表 · 永恒精密',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'homedecor-aesthetic-banner',
    name: '雅致美学居所',
    englishName: 'Home Decor Aesthetic Banner',
    tagline: '东方侘寂美学与自然光影意境；素烧陶艺、光影流转与日式插花雅致空间留白画卷',
    category: 'creative',
    industries: ['家居装饰', '艺术摆件', '原创花器', '香薰美学', '侘寂软饰'],
    features: ['素烧陶艺留白画卷', '东方光影流转动效', '天然矿物材质标签', '美学生活全套内页'],
    accentColor: '#84754e',
    badge: '家居装饰 · 雅致美学',
    previewImg: '/templates/previews/senseng-nature.jpg',
  },
  {
    id: 'homedecor-living-video',
    name: '光影灵动空间',
    englishName: 'Home Decor Living Video',
    tagline: '晨光穿透百叶窗与微尘慢舞的治愈家居生活视频；晨雾液态毛玻璃卡片与慢调生活格调',
    category: 'consumer',
    industries: ['家居装饰', '氛围灯光', '软装陈设', '艺术挂画', '治愈家居'],
    features: ['100vh 晨光微尘生活视频', '晨雾液态毛玻璃', '慢调生活美学品鉴', '居所灵感全套内页'],
    accentColor: '#059669',
    badge: '家居装饰 · 光影灵动',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'furniture-minimal-banner',
    name: '几何极简实木工坊',
    englishName: 'Furniture Minimal Banner',
    tagline: '包豪斯几何美学与大正榫卯实木家具；网格结构解构、黑胡桃木纹理与极简收纳系统',
    category: 'consumer',
    industries: ['家具收纳', '实木家具', '极简收纳', '北欧桌椅', '空间定制'],
    features: ['包豪斯几何展台', '大正榫卯结构微距', 'FAS 级原木认证', '实木家具全套内页'],
    accentColor: '#78350f',
    badge: '家具收纳 · 几何极简',
    previewImg: '/templates/previews/senseng-minimal.jpg',
  },
  {
    id: 'furniture-spatial-video',
    name: '灵动折叠空间',
    englishName: 'Furniture Spatial Video',
    tagline: '现代多功能变形家具与智能收纳演示全屏视频；阻尼五金回弹与空间魔方模块平滑变形',
    category: 'tech',
    industries: ['家具收纳', '功能家具', '折叠变形桌椅', '隐形收纳柜', '紧凑空间解决方案'],
    features: ['100vh 变形家具演示视频', '阻尼五金回弹测试', '空间利用率对比', '模块收纳全套内页'],
    accentColor: '#2563eb',
    badge: '家具收纳 · 灵动折叠',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
  {
    id: 'kitchen-culinary-banner',
    name: '米其林星厨匠具',
    englishName: 'Kitchen Culinary Banner',
    tagline: '米其林星厨专业精工锻造刀具与铸铁锅原矿质感；暗调岩板操作台与专业烹饪微距光影',
    category: 'consumer',
    industries: ['厨具餐具', '精工大马士革刀', '铸铁炖锅', '专业烘焙器具', '星级餐厅餐具'],
    features: ['大马士革锻造花纹', '暗调岩板料理台', '莫氏硬度防腐蚀', '高端厨具全套内页'],
    accentColor: '#dc2626',
    badge: '厨具餐具 · 星厨匠具',
    previewImg: '/templates/previews/senseng-arcade.jpg',
  },
  {
    id: 'kitchen-gourmet-video',
    name: '炙热飨宴食光',
    englishName: 'Kitchen Gourmet Video',
    tagline: '锅气升腾焰火与星级料理慢动作出锅全屏视频；美拉德反应爆炒炙烤与热感磨砂玻璃卡片',
    category: 'consumer',
    industries: ['厨具餐具', '不粘煎炒锅', '高温炙烤器具', '精致西餐具', '电磁感应炊具'],
    features: ['100vh 锅气炙烤慢镜头视频', '热感磨砂玻璃卡片', '导热均匀热成像解析', '烹饪艺术全套内页'],
    accentColor: '#ea580c',
    badge: '厨具餐具 · 炙热飨宴',
    hasVideo: true,
    previewImg: '/templates/previews/senseng-video.jpg',
  },
];

const PRESET_COLORS = [
  { label: '品牌天蓝', value: '#089ced' },
  { label: '科技靛蓝', value: '#6366f1' },
  { label: '波尔多红', value: '#d90a2c' },
  { label: '克莱因蓝', value: '#0047ff' },
  { label: '活力暖黄', value: '#eab308' },
  { label: '霓虹青碧', value: '#06b6d4' },
  { label: '洋红极光', value: '#d946ef' },
  { label: '庄严深蓝', value: '#0f2b59' },
  { label: '自然墨绿', value: '#416851' },
];

const CATEGORIES = [
  { id: 'all', label: `全部模版 (${TEMPLATES.length})` },
  { id: 'consumer', label: `品类与消费出海 (${TEMPLATES.filter((t) => t.category === 'consumer').length})` },
  { id: 'tech', label: `科技与 SaaS (${TEMPLATES.filter((t) => t.category === 'tech').length})` },
  { id: 'enterprise', label: `商贸与通用商品 (${TEMPLATES.filter((t) => t.category === 'enterprise').length})` },
  { id: 'creative', label: `艺术与时尚创意 (${TEMPLATES.filter((t) => t.category === 'creative').length})` },
] as const;

export default function TemplateSelector({
  draft,
  onUpdateDraft,
  onProceedToPublish,
  onBackToBasics,
  onSwitchToClone,
  onPreview,
}: {
  draft: Draft;
  onUpdateDraft: (patch: Partial<Draft>) => void;
  onProceedToPublish: () => void;
  onBackToBasics: () => void;
  onSwitchToClone?: () => void;
  onPreview: (template: TemplateDefinition) => void;
}) {
  const currentTemplate = draft.template || 'senseng-clean';
  const media = templateMediaRequirements[currentTemplate];
  const selectedTemplate = TEMPLATES.find((template) => template.id === currentTemplate);
  const currentColor = draft.brandColor || '#089ced';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = TEMPLATES.filter((tmpl) =>
    selectedCategory === 'all' ? true : tmpl.category === selectedCategory,
  );

  return (
    <div className="template-selector-container">
      <div className="template-step-header">
        <div>
          <span className="step-tag">极速建站分支 · 第 2 步 / 共 3 步</span>
          <h2>选择网站模版与品牌调色</h2>
          <p className="step-subtitle">
            共提供 19
            套精心设计的高保真行业旗舰模版（涵盖通用商品、玩具与公仔、毛绒与靠垫、服装与纺织品、鞋靴及科技出海等多品类，包含宽幅展台与沉浸视频型）。选中后将自动灌注你的公司与产品数据。
          </p>
        </div>

        <div
          className="branch-switch-badge"
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {onSwitchToClone && (
            <Button
              kind="quiet"
              onClick={onSwitchToClone}
              style={{ color: '#4f46e5', fontWeight: 700 }}
            >
              <span>🎯 切换为 设计稿还原</span>
            </Button>
          )}
        </div>
      </div>

      {/* 像素级克隆专属横幅 */}
      {onSwitchToClone && (
        <div
          onClick={onSwitchToClone}
          style={{
            background:
              'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            border: '1.5px dashed #6366f1',
            borderRadius: '14px',
            padding: '16px 20px',
            margin: '16px 0 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = '#4338ca')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '28px' }}>🎯</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e1b4b' }}>
                没有看中现成模版？试试「设计稿还原模式」
              </div>
              <div style={{ fontSize: '12px', color: '#4338ca', marginTop: '3px' }}>
                上传整套页面设计图与产品素材，参考网址可补充文字内容；生成后对照预览检查布局与图片。
              </div>
            </div>
          </div>
          <Button
            kind="primary"
            style={{ background: '#4f46e5', fontSize: '13px', padding: '6px 16px' }}
          >
            立即开启克隆模式 →
          </Button>
        </div>
      )}

      {media && (
        <section className="template-media-guide" aria-label="当前模板素材清单">
          <h3>{selectedTemplate?.name} · 素材准备清单</h3>
          <p>
            产品主图每款 1
            张，已有产品图片会自动使用；同一图片可以复用到多个展示位置。以下为建议尺寸（宽 ×
            高，单位 px），无需按展示位置重复上传。
          </p>
          <dl className="template-media-summary">
            <div>
              <dt>产品图片</dt>
              <dd>
                建议 {media.productCount} 张不同产品主图 · {media.productSize}
              </dd>
              <small>按实际产品数量准备，少于建议数量也可使用模板。</small>
            </div>
            <div>
              <dt>首页 Banner（选填）</dt>
              <dd>{media.bannerSize} · 1 张；轮播 2–12 张</dd>
              <small>{media.bannerNote} 多图保持相同比例。</small>
            </div>
            <div>
              <dt>视频背景（选填）</dt>
              <dd>{media.videos ? `内置 ${media.videos} 段视频；无需额外上传` : '默认无需视频'}</dd>
              <small>
                自定义全屏背景：每组 1 段 MP4 / WebM，建议 2560 × 1440（16:9，适配 27–32 寸大屏及 4K），另备 1
                张同尺寸封面。超宽屏可用 3840 × 2160，边缘预留安全裁切空间。
              </small>
            </div>
            <div>
              <dt>品牌素材（选填）</dt>
              <dd>Logo 1 张 · 建议 600 × 200；网站图标 1 张 · 建议 512 × 512</dd>
              <small>图片支持 PNG / JPEG / WebP；透明 Logo 优先 PNG。网站图标也支持 ICO。</small>
            </div>
          </dl>
          <details key={currentTemplate}>
            <summary>
              查看模板展示图的数量与原始尺寸（
              {media.slots.reduce((sum, slot) => sum + slot.count, 0)} 处）
            </summary>
            <p>
              这些位置由产品主图自动填充；没有产品图片时使用内置示例图。尺寸用于了解原设计比例，不是分别上传的入口。装饰图与背景已内置。
            </p>
            <ul className="template-slot-sizes">
              {media.slots.map((slot) => (
                <li key={`${slot.width}-${slot.height}`}>
                  <strong>{slot.count} 处</strong>
                  <span>
                    {slot.width} × {slot.height} px
                  </span>
                </li>
              ))}
            </ul>
          </details>
          <p className="template-media-help">
            产品图在「资料与产品」上传；替换首页或独立页面的背景、轮播及视频，在「页面 Banner /
            视频」设置。背景上的文字与按钮由页面呈现，建议上传不带文字的素材。
          </p>
        </section>
      )}

      {/* 分类筛选 Tab 栏 */}
      <div className="template-category-filters" role="group" aria-label="模板分类">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 模版卡片选择区域 */}
      <div
        className="template-cards-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))' }}
      >
        {filteredTemplates.map((tmpl) => {
          const requirements = templateMediaRequirements[tmpl.id];
          const isSelected = currentTemplate === tmpl.id;
          return (
            <div
              key={tmpl.id}
              className={`template-card ${isSelected ? 'selected' : ''}`}
              onClick={() =>
                onUpdateDraft({
                  buildBranch: 'template',
                  template: tmpl.id,
                  brandColor: tmpl.accentColor,
                })
              }
              onKeyDown={(event) => {
                if (
                  event.target === event.currentTarget &&
                  (event.key === 'Enter' || event.key === ' ')
                ) {
                  event.preventDefault();
                  onUpdateDraft({
                    buildBranch: 'template',
                    template: tmpl.id,
                    brandColor: tmpl.accentColor,
                  });
                }
              }}
              role="button"
              tabIndex={0}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div
                className="template-card-badge"
                style={{ background: tmpl.hasVideo ? '#4f46e5' : undefined }}
              >
                {tmpl.badge}
              </div>

              {/* 真实模版视觉缩略图 */}
              <div
                className="template-mockup-preview"
                style={{
                  position: 'relative',
                  height: '210px',
                  overflow: 'hidden',
                  borderRadius: '8px 8px 0 0',
                  background: '#f8fafc',
                }}
              >
                <img
                  src={tmpl.previewImg}
                  alt={tmpl.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    transition: 'transform 0.3s ease',
                  }}
                />
                {tmpl.hasVideo && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(7, 59, 145, 0.88)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      zIndex: 2,
                    }}
                  >
                    <span>▶</span> 动态视频首屏
                  </div>
                )}
              </div>

              <div className="template-card-body" style={{ flex: 1 }}>
                <div className="template-name-row">
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{tmpl.name}</h3>
                    <span className="template-en-name">{tmpl.englishName}</span>
                  </div>
                  {isSelected && (
                    <span className="selected-indicator">
                      <Icon name="check" size={16} /> 已选用
                    </span>
                  )}
                </div>

                <p className="template-tagline" style={{ minHeight: '44px' }}>
                  {tmpl.tagline}
                </p>

                <div className="template-tags">
                  {tmpl.industries.map((ind) => (
                    <span key={ind} className="industry-tag">
                      {ind}
                    </span>
                  ))}
                </div>

                {requirements && (
                  <div className="template-media-card" aria-label={`${tmpl.name}素材要求`}>
                    <strong>图片 / 视频准备</strong>
                    <span>
                      产品图：建议 {requirements.productCount} 张 · {requirements.productSize}
                    </span>
                    <span>Banner：选填 1 张 · {requirements.bannerSize}</span>
                    <span>
                      视频：
                      {requirements.videos
                        ? `已内置 ${requirements.videos} 段 · 可用 2560 × 1440 替换首页背景`
                        : '默认 0 段；可自行添加全屏背景'}
                    </span>
                    <small>选中模板查看完整清单；产品图会自动复用。</small>
                  </div>
                )}

                <ul className="template-feature-list">
                  {tmpl.features.map((feat) => (
                    <li key={feat}>
                      <Icon name="check" size={13} /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="template-card-footer"
                style={{ marginTop: 'auto', display: 'flex', gap: 10 }}
              >
                <Button
                  kind="quiet"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPreview(tmpl);
                  }}
                  aria-label={`预览 ${tmpl.name}`}
                >
                  <Icon name="eye" size={16} /> 预览模版
                </Button>
                <button
                  type="button"
                  className={`select-tmpl-btn ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateDraft({
                      buildBranch: 'template',
                      template: tmpl.id,
                      brandColor: tmpl.accentColor,
                    });
                  }}
                >
                  {isSelected ? '✓ 当前已选用' : '选用此模版'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 品牌主色调选择 */}
      <div className="brand-color-section panel" style={{ marginTop: '32px' }}>
        <div className="panel-title">
          <span className="section-index">★</span>
          <h3>品牌主色调 (Brand Color)</h3>
          <span>应用于网站导航高亮、按钮、视觉线条与联系卡片</span>
        </div>

        <div className="brand-color-controls">
          <div className="color-preset-pills">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`color-pill ${currentColor === c.value ? 'selected' : ''}`}
                onClick={() => onUpdateDraft({ brandColor: c.value })}
              >
                <span className="color-circle" style={{ backgroundColor: c.value }} />
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          <div className="custom-color-picker">
            <span>自定义取色：</span>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => onUpdateDraft({ brandColor: e.target.value })}
              title="选择自定义主色调"
            />
            <code className="color-code">{currentColor.toUpperCase()}</code>
          </div>
        </div>
      </div>

      {/* 底部导航与操作栏 */}
      <div className="template-action-bar">
        <Button kind="quiet" onClick={onBackToBasics}>
          <Icon name="back" />
          返回修改资料与产品
        </Button>

        <div className="action-bar-right">
          <Button
            kind="primary"
            onClick={() => {
              onUpdateDraft({ templateConfirmed: true });
              onProceedToPublish();
            }}
          >
            生成并进入预览发布 (第 3 步)
            <Icon name="arrow" />
          </Button>
        </div>
      </div>
    </div>
  );
}
