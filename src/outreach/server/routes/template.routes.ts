import { publicFetch as fetch } from "../lib/network";
import { loadProviders } from "../lib/credentials";
import { Hono } from "hono";
import { eq, and, desc, count, inArray } from "drizzle-orm";
import { createDb } from "../../db";
import { templates, providers } from "../../db/schema";
import type { Bindings, Variables } from "../../shared/types";
import { requireAuth, requirePermission } from "../middleware/auth";
import { blockedEmailMessage, findBlockedEmailTerms } from "../../shared/email-content-policy";

type Env = { Bindings: Bindings; Variables: Variables };

export const templateRoutes = new Hono<Env>();

templateRoutes.use("/*", requireAuth);

const TEMPLATE_GROUPS = [
  { category: "基础模板", accent: "#5b55e8", soft: "#eef0ff", items: [["欢迎介绍", "欢迎了解我们的服务"], ["品牌故事", "关于我们和品牌理念"], ["团队介绍", "认识我们的专业团队"], ["服务概览", "为你提供的专业服务"], ["资源分享", "送给你一份实用资源"], ["客户案例", "看看我们如何帮助客户"], ["功能更新", "产品有了新的变化"], ["行业洞察", "值得关注的行业趋势"], ["感谢关注", "感谢你对我们的关注"], ["简单通知", "和你同步一条重要信息"]] },
  { category: "产品资讯", accent: "#267a70", soft: "#e8f5f1", items: [["月度简报", "本月产品与行业精选"], ["行业报告", "一份值得阅读的行业报告"], ["内容精选", "本周精选内容推荐"], ["产品周刊", "本周产品动态"], ["数据洞察", "用数据看见新的机会"], ["专家观点", "来自专家的一线观点"], ["趋势速递", "快速了解最新趋势"], ["团队通讯", "团队近期动态分享"], ["阅读清单", "为你整理了一份阅读清单"], ["知识专栏", "本期知识专栏更新"]] },
  { category: "产品推广", accent: "#d05f42", soft: "#fff0ea", items: [["新品发布", "全新产品正式发布"], ["产品亮点", "发现产品的核心价值"], ["限时优惠", "限时专属优惠"], ["产品对比", "找到更适合你的方案"], ["功能上新", "解锁全新功能"], ["套餐推荐", "为你推荐合适的套餐"], ["试用邀请", "立即开始免费试用"], ["客户评价", "来自客户的真实反馈"], ["回购提醒", "你可能会喜欢这些"], ["升级通知", "让你的体验更进一步"]] },
  { category: "活动邀请", accent: "#b78935", soft: "#fbf4df", items: [["线上分享", "邀请你参加线上分享"], ["线下活动", "期待活动现场见到你"], ["产品发布会", "欢迎参加产品发布会"], ["研讨会", "一起讨论行业新机会"], ["直播预告", "直播即将开始"], ["课程邀请", "一堂为你准备的课程"], ["社区活动", "加入我们的社区活动"], ["展会邀约", "展会现场与我们见面"], ["报名确认", "你的活动报名已确认"], ["活动回顾", "一起回顾活动精彩瞬间"]] },
  { category: "客户跟进", accent: "#ef7c57", soft: "#fff4ef", items: [["首次联系", "很高兴与你建立联系"], ["方案跟进", "跟进我们的最新方案"], ["会议总结", "感谢今天的交流"], ["预约沟通", "方便安排一次沟通吗"], ["报价跟进", "关于上次报价的跟进"], ["试用跟进", "试用体验得如何"], ["沉睡客户", "很久不见，最近还好吗"], ["客户成功", "帮助你更好地使用产品"], ["续约提醒", "你的服务即将到期"], ["反馈收集", "想听听你的使用反馈"]] },
  { category: "节日促销", accent: "#e05265", soft: "#fff0f2", items: [["新年问候", "新年快乐，开启新的旅程"], ["春节祝福", "春节快乐，感谢一路相伴"], ["春季上新", "春日新品焕新登场"], ["夏日活动", "清爽夏日专属活动"], ["秋季精选", "秋季精选，限时推荐"], ["冬日礼遇", "冬日暖心礼遇"], ["周年庆典", "感谢陪伴，我们周年庆了"], ["会员专享", "会员专属福利已上线"], ["黑五促销", "年度优惠限时开启"], ["节日感谢", "节日里想对你说声谢谢"]] },
  { category: "交易通知", accent: "#3d6fd6", soft: "#edf3ff", items: [["订单确认", "你的订单已确认"], ["付款成功", "付款成功，感谢你的购买"], ["发货通知", "你的包裹已经发出"], ["配送更新", "配送状态有了更新"], ["订单完成", "订单已完成，感谢支持"], ["退款通知", "退款处理进度通知"], ["发票发送", "你的电子发票已生成"], ["账户安全", "账户安全提醒"], ["密码重置", "重置你的账户密码"], ["服务到期", "服务到期提醒"]] },
  { category: "欢迎与留存", accent: "#37816f", soft: "#e8f5f1", items: [["欢迎加入", "欢迎加入我们的社区"], ["注册成功", "你的账户创建成功"], ["首次使用", "开始你的第一次体验"], ["新手指南", "三步了解核心功能"], ["功能教学", "快速掌握实用功能"], ["使用提醒", "别忘了回来看看"], ["里程碑", "一起庆祝你的新进展"], ["会员生日", "祝你生日快乐"], ["回归欢迎", "欢迎回来，我们想你了"], ["满意度回访", "你的体验对我们很重要"]] },
] as const;

// All known names for base (基础模板) starter templates — used to detect
// whether an existing user already went through template initialization.
const ALL_KNOWN_BASE_NAMES = [
  // Current English names
  ...(["Password reset instructions", "Survey", "SMS", "Minimal", "Documents ready for review", "Important security alert", "Event ticket", "Order confirmation", "Welcome email", "Thank you"]),
  // Legacy English names (before template redesign)
  ...(["Welcome introduction", "Brand story", "Meet the team", "Service overview", "Resource share", "Customer story", "Feature update", "Industry insights", "Thank you for your interest", "Simple announcement"]),
  // Original Chinese names
  ...(["欢迎介绍", "品牌故事", "团队介绍", "服务概览", "资源分享", "客户案例", "功能更新", "行业洞察", "感谢关注", "简单通知"]),
];

const ENGLISH_NAMES_BY_CATEGORY: Record<string, string[]> = {
  "基础模板": ["Password reset instructions", "Survey", "SMS", "Minimal", "Documents ready for review", "Important security alert", "Event ticket", "Order confirmation", "Welcome email", "Thank you"],
  "产品资讯": ["Monthly digest", "Industry report", "Curated content", "Product weekly", "Data insights", "Expert perspective", "Trend update", "Team newsletter", "Reading list", "Knowledge column"],
  "产品推广": ["New product launch", "Product highlights", "Limited-time offer", "Product comparison", "New features", "Plan recommendation", "Free trial invitation", "Customer reviews", "Buy again", "Upgrade announcement"],
  "活动邀请": ["Online session", "In-person event", "Product launch event", "Webinar invitation", "Live stream reminder", "Course invitation", "Community event", "Trade show invitation", "Registration confirmed", "Event recap"],
  "客户跟进": ["First outreach", "Proposal follow-up", "Meeting recap", "Book a conversation", "Quote follow-up", "Trial follow-up", "Re-engage a customer", "Customer success", "Renewal reminder", "Feedback request"],
  "节日促销": ["New year greeting", "Lunar New Year greeting", "Spring collection", "Summer campaign", "Autumn picks", "Winter offer", "Anniversary celebration", "Member exclusive", "Black Friday sale", "Seasonal thank you"],
  "交易通知": ["Order confirmation", "Payment successful", "Shipping notification", "Delivery update", "Order complete", "Refund notification", "Invoice delivery", "Account security", "Password reset", "Service expiry"],
  "欢迎与留存": ["Welcome aboard", "Registration success", "Getting started", "Getting started guide", "Feature tutorial", "Usage reminder", "Milestone", "Member birthday", "Welcome back", "Satisfaction check-in"],
};

function buildDefaultTemplateHtml(category: string, accent: string, soft: string, title: string, index: number) {
  if (category === "基础模板") {
    const baseLayouts = [
      ["Password reset instructions", "Did you forget your password?", "That's okay, it happens. Click the button below to reset your password.", "Reset your password"],
      ["Survey", "We'd love your feedback!", "Please take a minute to share your feedback. Your answers help us improve and serve you better.", "Take survey"],
      ["SMS", "Join our SMS list", "Sign up for exclusive updates, offers, and news. You can unsubscribe at any time.", "Sign me up"],
      ["Minimal", "It's time to design your email", "Define the layout of your email and give your content a place to live by adding, rearranging, and deleting blocks.", "Add button text"],
      ["Documents ready for review", "Your documents are ready to review", "The documents you requested are ready for your review. Please respond with your edits or approval.", "Review documents"],
      ["Important security alert", "Important notice regarding your account", "We are writing to inform you about an important security update. Please review the details and contact us with any concerns.", "Contact us"],
      ["Event ticket", "Your event ticket is ready", "Hi {{name}}, your ticket is confirmed. Here are the details you need before the event.", "Download ticket"],
      ["Order confirmation", "Thanks for your order", "Your order has been confirmed. We will send another update when it is on the way.", "View order"],
      ["Welcome email", "Welcome to GrowthOS", "We are glad to have you here. Follow the steps below to get started with your account.", "Get started"],
      ["Thank you", "Thanks for being with us", "We appreciate your time and support. If you have any questions, our team is here to help.", "Learn more"],
    ];
    const [name, headline, copy, button] = baseLayouts[index % baseLayouts.length];
    return `<div data-growthos-template='en-v3' style='max-width:600px;margin:auto;background:#f4f4f4;font-family:Arial,sans-serif;color:#171717'><div style='background:white;padding:24px 34px;text-align:center;border-bottom:1px solid #e5e5e5'><div style='display:inline-block;width:64px;height:64px;line-height:64px;border:5px solid #171717;border-radius:50%;font-size:34px;font-weight:bold'>A</div></div><div style='background:white;padding:54px 72px 46px'><h1 style='font-size:28px;line-height:1.25;margin:0 0 24px'>${headline}</h1><p style='font-size:16px;line-height:1.75;margin:0 0 28px'>${copy}</p><a href='https://example.com' style='display:inline-block;background:#050505;color:white;padding:14px 24px;text-decoration:none;font-weight:bold'>${button}</a></div><div style='background:white;border-top:1px solid #ededed;padding:28px 34px;text-align:center;color:#666;font-size:12px;line-height:1.8'><div style='font-size:18px;color:#111;margin-bottom:18px'>●  ◎  ◉</div><a href='https://example.com' style='color:#111'>View this email in your browser</a><p>Copyright © GrowthOS. All rights reserved.<br>Our mailing address is: Your Company Address</p><p>Want to change how you receive these emails?<br><u>Update your preferences</u> or <u>unsubscribe</u></p></div></div>`;
  }
  const categoryLabels: Record<string, string> = {
    "基础模板": "WELCOME & BRAND",
    "产品资讯": "INSIGHTS & NEWS",
    "产品推广": "PRODUCT & SALES",
    "活动邀请": "EVENTS",
    "客户跟进": "CUSTOMER SUCCESS",
    "节日促销": "SEASONAL CAMPAIGNS",
    "交易通知": "TRANSACTIONAL",
    "欢迎与留存": "ONBOARDING & RETENTION",
  };
  const label = categoryLabels[category] || "GROWTHOS";
  const headlines = ["Make every message count", "A clearer way to move forward", "Built for your next big step"];
  const englishTitle = headlines[index % headlines.length];
  const images: Record<string, string> = {
    "基础模板": "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
    "产品资讯": "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80",
    "产品推广": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    "活动邀请": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    "客户跟进": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80",
    "节日促销": "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&q=80",
    "交易通知": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    "欢迎与留存": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
  };
  const image = images[category] || images["基础模板"];
  const layouts = [
    `<div data-growthos-template='en-v2' style='max-width:600px;margin:auto;background:${soft};font-family:Arial,sans-serif;color:#172033'><div style='padding:34px 30px;background:${accent};color:white'><div style='font-size:12px;letter-spacing:2px'>GROWTHOS · ${label}</div><h1 style='font-size:30px;line-height:1.2;margin:30px 0 12px'>${englishTitle}</h1><p style='color:#eef2ff;line-height:1.7'>A clear, useful update to help you make progress with confidence.</p><a href='https://example.com' style='display:inline-block;background:white;color:${accent};padding:13px 22px;border-radius:4px;text-decoration:none;font-weight:bold;margin-top:12px'>Explore now</a></div><img src='${image}' alt='${label}' style='display:block;width:100%;height:220px;object-fit:cover'><div style='padding:28px 30px;background:white'><h2 style='font-size:19px'>What is inside</h2><p style='color:#667085;line-height:1.8'>Start with one simple action and make every conversation more valuable. We would love to hear what you think.</p><div style='border-top:1px solid #e7e9ee;padding-top:18px;color:#667085;font-size:13px'>GrowthOS · Intelligent growth operations</div></div></div>`,
    `<div data-growthos-template='en-v2' style='max-width:600px;margin:auto;background:white;font-family:Arial,sans-serif;color:#20242c;border:1px solid #e7e9ee'><div style='padding:25px 30px;border-bottom:1px solid #e7e9ee'><strong style='font-size:18px;color:${accent}'>GROWTHOS</strong><span style='float:right;color:#8b93a3;font-size:11px'>${label}</span></div><img src='${image}' alt='${label}' style='display:block;width:calc(100% - 60px);height:190px;object-fit:cover;margin:28px 30px 0;border-radius:6px'><div style='padding:28px 30px 34px'><div style='font-size:12px;letter-spacing:2px;color:${accent}'>FEATURED / ${String(index + 1).padStart(2, "0")}</div><h1 style='font-size:29px;line-height:1.25;margin:14px 0'>${englishTitle}</h1><p style='color:#596273;line-height:1.8'>Discover a simpler way to understand what matters and take the next step.</p><div style='margin:24px 0;padding:20px;background:${soft};border-left:4px solid ${accent}'><b>Worth a closer look</b><p style='margin:9px 0 0;color:#667085;line-height:1.7'>Thoughtful content, reliable service, and an experience designed around you.</p></div><a href='https://example.com' style='color:${accent};font-weight:bold;text-decoration:none'>Learn more →</a></div></div>`,
    `<div data-growthos-template='en-v2' style='max-width:600px;margin:auto;background:#f7f8fb;font-family:Arial,sans-serif;color:#182b27'><div style='padding:30px'><div style='font-size:13px;letter-spacing:2px;color:${accent}'>GROWTHOS</div><h1 style='font-size:32px;line-height:1.2;margin:34px 0 14px'>${englishTitle}</h1><p style='color:#55706a;line-height:1.8'>A flexible, practical solution for teams that are ready to grow.</p><div style='margin-top:26px;padding:16px;background:white;border-radius:6px;border:1px dashed ${accent};text-align:center;color:#7b8794;font-size:12px'>IMAGE MODULE · ADD A RELEVANT IMAGE HERE</div><div style='display:flex;gap:10px;margin-top:16px'><div style='flex:1;padding:16px;background:white;border-radius:6px'><b style='color:${accent}'>01</b><p style='font-size:13px;line-height:1.5'>Simple to use</p></div><div style='flex:1;padding:16px;background:white;border-radius:6px'><b style='color:${accent}'>02</b><p style='font-size:13px;line-height:1.5'>Made to grow</p></div></div><a href='https://example.com' style='display:inline-block;color:white;background:${accent};padding:13px 22px;border-radius:4px;text-decoration:none;font-weight:bold;margin-top:24px'>Get started</a></div><div style='background:${soft};padding:20px 30px;color:#66756f;font-size:12px'>Thanks for reading. We look forward to staying in touch.</div></div>`,
  ];
  return layouts[index % layouts.length];
}

function buildDefaultSubject(category: string, index: number) {
  const subjects: Record<string, string[]> = {
    "基础模板": ["A fresh start for your growth journey", "A note from the GrowthOS team", "Meet the people behind the product"],
    "产品资讯": ["This month's product and industry highlights", "New insights worth sharing", "Your curated update is here"],
    "产品推广": ["Discover what is new", "A better way to reach your goals", "Your exclusive offer is waiting"],
    "活动邀请": ["You are invited to our next event", "Save your seat for this session", "Join us for an inspiring conversation"],
    "客户跟进": ["A quick follow-up", "Ready for the next step?", "Thank you for the conversation"],
    "节日促销": ["A special season, a special offer", "Something special for you", "Celebrate with us"],
    "交易通知": ["Your order update", "Your payment was successful", "Important account information"],
    "欢迎与留存": ["Welcome to GrowthOS", "Your next step starts here", "Let us help you get more value"],
  };
  return (subjects[category] || subjects["基础模板"])[index % 3];
}

const STARTER_USER_TEMPLATES = ENGLISH_NAMES_BY_CATEGORY["基础模板"].map((name, index) => ({
  name,
  subject: buildDefaultSubject("基础模板", index),
  bodyHtml: buildDefaultTemplateHtml("基础模板", "", "", name, index).replace(/ data-growthos-template='en-v3'/, ""),
  category: "My templates",
}));

const DEFAULT_TEMPLATES = TEMPLATE_GROUPS.filter(({ category }) => category !== "基础模板").flatMap(({ category, accent, soft, items }) =>
  items.map(([name], index) => [name, buildDefaultSubject(category, index), buildDefaultTemplateHtml(category, accent, soft, name, index)] as const)
);

async function ensureDefaultTemplates(db: any, userId: string) {
  const existing = await db
    .select({ id: templates.id, name: templates.name, category: templates.category, subject: templates.subject, bodyHtml: templates.bodyHtml })
    .from(templates)
    .where(eq(templates.userId, userId));

  // Clean up legacy marker data-growthos-template='en-v3' if present.
  // Only strip the marker and set category — do NOT rename, because old and
  // new template sets use different indices and renaming via index is wrong.
  for (const item of existing) {
    if (item.bodyHtml?.includes("data-growthos-template='en-v3'")) {
      const cleanedHtml = item.bodyHtml.replace(/ data-growthos-template='en-v3'/, "");
      await db.update(templates)
        .set({
          category: "My templates",
          bodyHtml: cleanedHtml,
          updatedAt: new Date(),
        })
        .where(eq(templates.id, item.id));

      item.category = "My templates";
      item.bodyHtml = cleanedHtml;
    }
  }

  // Normalize names for built-in templates (en-v2)
  for (const item of existing) {
    if (!item.bodyHtml?.includes("data-growthos-template='en-v2'")) continue;
    const group = TEMPLATE_GROUPS.find((candidate) => candidate.category === item.category);
    const itemIndex = group?.items.findIndex(([name]) => name === item.name) ?? -1;
    const englishName = itemIndex >= 0 ? ENGLISH_NAMES_BY_CATEGORY[item.category]?.[itemIndex] : undefined;
    if (englishName && item.name !== englishName) {
      await db.update(templates).set({ name: englishName, updatedAt: new Date() }).where(eq(templates.id, item.id));
      item.name = englishName;
    }
  }

  // Build a lookup set of existing template names for the user (case-insensitive)
  const existingNames = new Set<string>();
  for (const item of existing) {
    if (item.name) existingNames.add(item.name.trim().toLowerCase());
  }

  // Auto-supplement initialization condition:
  // 1) Brand new user (0 existing templates): Seed full suite of starter and default templates.
  // 2) Existing user missing starter templates completely: Seed missing starter templates.
  const isBrandNewUser = existing.length === 0;
  // Check ALL known base template names (current English, legacy English, Chinese)
  // to detect whether the user already went through initialization.
  const hasAnyStarterTemplate = ALL_KNOWN_BASE_NAMES.some((name) => existingNames.has(name.toLowerCase()));

  // Skip auto-supplementing deleted templates if the user already has initialized templates
  if (!isBrandNewUser && hasAnyStarterTemplate) {
    return;
  }

  const newTemplates: Array<{ id: string; userId: string; name: string; subject: string; bodyHtml: string; category: string }> = [];

  // Seed missing starter user templates (including Thank you)
  for (const tpl of STARTER_USER_TEMPLATES) {
    if (!existingNames.has(tpl.name.toLowerCase())) {
      newTemplates.push({
        id: crypto.randomUUID(),
        userId,
        name: tpl.name,
        subject: tpl.subject,
        bodyHtml: tpl.bodyHtml,
        category: "My templates",
      });
      existingNames.add(tpl.name.toLowerCase());
    }
  }

  // Seed missing built-in templates only for brand new users
  if (isBrandNewUser) {
    for (const [name, subject, bodyHtml] of DEFAULT_TEMPLATES) {
      const group = TEMPLATE_GROUPS.find((item) => item.items.some(([itemName]) => itemName === name));
      const category = group?.category || "产品资讯";
      const itemIndex = group?.items.findIndex(([itemName]) => itemName === name) ?? -1;
      const englishName = ENGLISH_NAMES_BY_CATEGORY[category]?.[itemIndex] || name;

      if (!existingNames.has(englishName.toLowerCase())) {
        newTemplates.push({
          id: crypto.randomUUID(),
          userId,
          name: englishName,
          subject,
          bodyHtml,
          category,
        });
        existingNames.add(englishName.toLowerCase());
      }
    }
  }

  if (newTemplates.length) {
    for (let i = 0; i < newTemplates.length; i += 10) {
      await db.insert(templates).values(newTemplates.slice(i, i + 10));
    }
  }
}

// 获取模板列表
templateRoutes.get("/", requirePermission("templates:read"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const page = parseInt(c.req.query("page") || "1");
  const pageSize = Math.min(parseInt(c.req.query("pageSize") || "20"), 200);
  const category = c.req.query("category");

  // Only the first page performs template seeding. Parallel pagination requests stay read-only.
  if (page === 1) await ensureDefaultTemplates(db, user.id);

  const conditions = [eq(templates.userId, user.id)];
  if (category) {
    conditions.push(eq(templates.category, category));
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(templates)
    .where(whereClause);

  const total = totalResult?.count || 0;

  const data = await db
    .select()
    .from(templates)
    .where(whereClause)
    .orderBy(desc(templates.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const dataWithType = data.map((template: any) => ({
    ...template,
    isBuiltIn: template.bodyHtml?.includes("data-growthos-template='en-v2'") || template.bodyHtml?.includes("data-growthos-template='en-v3'"),
  }));

  return c.json({
    success: true,
    data: dataWithType,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

// 获取单个模板
templateRoutes.get("/:id", requirePermission("templates:read"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const templateId = c.req.param("id");

  const [template] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.id, templateId), eq(templates.userId, user.id)));

  if (!template) {
    return c.json({ success: false, error: "模板不存在" }, 404);
  }

  return c.json({ success: true, data: template });
});

// 创建模板
templateRoutes.post("/", requirePermission("templates:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const body = await c.req.json<{
    name: string;
    subject: string;
    bodyHtml: string;
    bodyText?: string;
    variables?: Array<{ key: string; label: string; default?: string }>;
    category?: string;
  }>();

  if (!body.name?.trim() || !body.subject?.trim() || !body.bodyHtml?.trim()) {
    return c.json(
      { success: false, error: "模板名称、主题和正文内容不能为空" },
      400
    );
  }

  const blockedTerms = findBlockedEmailTerms(body.subject, body.bodyHtml, body.bodyText);
  if (blockedTerms.length) {
    return c.json({ success: false, error: blockedEmailMessage(blockedTerms), blockedTerms }, 400);
  }

  const id = crypto.randomUUID();
  await db.insert(templates).values({
    id,
    userId: user.id,
    name: body.name.trim(),
    subject: body.subject.trim(),
    bodyHtml: body.bodyHtml,
    bodyText: body.bodyText || null,
    variables: body.variables ? JSON.stringify(body.variables) : null,
    category: body.category?.trim() || null,
  });

  const [template] = await db.select().from(templates).where(eq(templates.id, id));
  return c.json({ success: true, data: template }, 201);
});

// 更新模板
templateRoutes.put("/:id", requirePermission("templates:write"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const templateId = c.req.param("id");
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.id, templateId), eq(templates.userId, user.id)));

  if (!existing) {
    return c.json({ success: false, error: "模板不存在" }, 404);
  }

  const blockedTerms = findBlockedEmailTerms(
    body.subject ?? existing.subject,
    body.bodyHtml ?? existing.bodyHtml,
    body.bodyText ?? existing.bodyText,
  );
  if (blockedTerms.length) {
    return c.json({ success: false, error: blockedEmailMessage(blockedTerms), blockedTerms }, 400);
  }

  const updateData: Record<string, any> = { updatedAt: new Date() };
  const allowedFields = ["name", "subject", "bodyHtml", "bodyText", "category"];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }
  if (body.variables !== undefined) {
    updateData.variables = JSON.stringify(body.variables);
  }

  await db.update(templates).set(updateData).where(eq(templates.id, templateId));

  const [updated] = await db.select().from(templates).where(eq(templates.id, templateId));
  return c.json({ success: true, data: updated });
});

// 删除模板
templateRoutes.delete("/:id", requirePermission("templates:delete"), async (c) => {
  const db = createDb(c.env.DB);
  const user = c.get("user")!;
  const templateId = c.req.param("id");

  const [existing] = await db
    .select()
    .from(templates)
    .where(and(eq(templates.id, templateId), eq(templates.userId, user.id)));

  if (!existing) {
    return c.json({ success: false, error: "模板不存在" }, 404);
  }

  await db.delete(templates).where(eq(templates.id, templateId));
  return c.json({ success: true, data: { deleted: true } });
});

// AI 生成邮件内容
templateRoutes.post("/generate", requirePermission("templates:write"), async (c) => {
  try {
    const db = createDb(c.env.DB);
    const body = await c.req.json<{
      company?: string;
      industry?: string;
      product?: string;
      tone?: "professional" | "friendly" | "casual";
      language?: "zh" | "en";
      prompt?: string;
    }>();

    // 从数据库中查找可用的 AI 提供商
    const aiProvidersList = (await loadProviders(db,c.env,c.get('user')!.id)).filter(p=>p.status==='active' && ['openai','deepseek','anthropic'].includes(p.provider)).sort((a,b)=>Number(b.isDefault)-Number(a.isDefault));
    const aiProvider = aiProvidersList[0];
    if (!aiProvider) {
      return c.json({ success: false, error: "AI 服务未配置，请到后台「服务商配置」中添加 OpenAI 或 DeepSeek 等 API Key" }, 503);
    }

    const apiKey = aiProvider.apiKey;
    const config = aiProvider.config ? JSON.parse(aiProvider.config) : {};
    const tone = body.tone || "professional";
    const language = body.language || "en";

    let finalPrompt = "";
    if (body.prompt) {
      // 用户自定义提示词
      finalPrompt = `你是一个专业的B2B邮件营销专家。请根据以下要求生成一封营销邮件：\n${body.prompt}\n\n请严格返回JSON格式: {"subject": "邮件主题", "bodyHtml": "HTML格式邮件正文"}\n正文中使用 {{name}}, {{company}}, {{industry}} 等变量。你可以使用丰富的HTML标签，如<p>, <b>, <a href="..."> 等。`;
    } else {
      finalPrompt = language === "zh"
        ? `你是一个专业的B2B邮件营销专家。请根据以下信息生成一封个性化的营销邮件。
          公司: ${body.company || "目标公司"}
          行业: ${body.industry || "未知"}
          产品/服务: ${body.product || "我们的产品"}
          语气: ${tone === "professional" ? "专业正式" : tone === "friendly" ? "友好热情" : "轻松随意"}
          
          请返回JSON格式: {"subject": "邮件主题", "bodyHtml": "HTML格式邮件正文"}
          使用 {{company}}, {{name}}, {{industry}} 作为变量占位符。你可以使用丰富的HTML标签，如<p>, <b>, <a href="..."> 等。`
        : `You are a professional B2B email marketing expert. Generate a personalized marketing email based on:
          Company: ${body.company || "Target Company"}
          Industry: ${body.industry || "Unknown"}
          Product/Service: ${body.product || "Our product"}
          Tone: ${tone}
          
          Return JSON: {"subject": "email subject", "bodyHtml": "HTML email body"}
          Use {{company}}, {{name}}, {{industry}} as variable placeholders. Use rich HTML tags like <p>, <b>, <a href="...">.`;
    }

    let response;
    let contentStr = "";

    // 调用不同的 AI 服务商
    if (aiProvider.provider === "anthropic") {
      const baseURL = config.baseURL || "https://api.anthropic.com/v1";
      response = await fetch(`${baseURL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          messages: [{ role: "user", content: finalPrompt + "\n\n请只返回 JSON 对象，不要包含其他解释文本和 Markdown 代码块标记。" }]
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status} ${await response.text()}`);
      const responseText = await response.text();
      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`AI 服务商接口返回了非 JSON 数据！这通常是因为你的 API 地址填错了。如果你使用的是代理，请尝试在 API 地址末尾加上 '/v1'。返回内容前缀：${responseText.substring(0, 60)}...`);
      }
      contentStr = result.content[0].text;
      
    } else {
      // openai 和 deepseek 都兼容 OpenAI 格式
      const isDeepSeek = aiProvider.provider === "deepseek";
      let baseURL = config.baseURL;
      if (baseURL) {
        baseURL = baseURL.replace(/\/+$/, ""); // remove trailing slashes
        if (!baseURL.endsWith("/v1")) {
          baseURL += "/v1";
        }
      } else {
        baseURL = isDeepSeek ? "https://api.deepseek.com/v1" : "https://api.openai.com/v1";
      }
      const model = config.model || (isDeepSeek ? "deepseek-chat" : "gpt-3.5-turbo");

      response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: finalPrompt }],
          response_format: isDeepSeek ? { type: "json_object" } : undefined,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status} ${await response.text()}`);
      const responseText = await response.text();
      let result: any;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`AI 服务商接口返回了非 JSON 数据！这通常是因为你的 API 地址填错了。如果你使用的是代理，请尝试在 API 地址末尾加上 '/v1'。返回内容前缀：${responseText.substring(0, 60)}...`);
      }
      contentStr = result.choices[0].message.content;
    }

    // 清理可能的 Markdown 标记
    contentStr = contentStr.replace(/```json/gi, "").replace(/```/g, "").trim();
    const content = JSON.parse(contentStr);

    return c.json({ success: true, data: content });
  } catch (error: any) {
    return c.json(
      { success: false, error: `AI 生成失败: ${error.message}` },
      200
    );
  }
});
