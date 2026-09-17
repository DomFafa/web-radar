# 内部模板使用规范 API（供其它 AI / 服务调用）

10 套模板各有一份独立 JSON 文档，保存在 `src/worker/template-guides/documents/<templateId>.json`。文档只打包进 Worker，**不进入前台 JS、静态素材目录或用户页面**。Markdown 由同一 JSON 渲染，避免两份文档不一致。

这些接口只读取规范，不调用模型、不扣生成额度、不上传素材、不修改项目，也不发布网站。

## 认证和部署

生产根地址：`https://web-radar.net/api/internal/template-guides`。

- 服务端 AI 客户端使用 `Authorization: Bearer <TEMPLATE_GUIDES_API_KEY>`。
- 密钥格式：`wrtg_` + 至少 40 个随机 URL-safe 字符；建议使用 32 字节以上的安全随机数。
- 密钥仅存 Cloudflare Secret 和调用方服务端。不要放入浏览器、提示词、URL 查询参数、日志或版本库。
- `wrangler secret put TEMPLATE_GUIDES_API_KEY --env=''` 可设置/轮换；本地通过忽略的 `.dev.vars` 设置。
- 平台管理员也可使用现有 Web Radar 会话。普通用户、工作区管理员不能读取。
- 此密钥不能访问 `/api/projects`、上传、发布、用户管理或其它 API。旧密钥在轮换后立即失效。
- 所有响应 `Cache-Control: no-store`；错误不回显密钥。浏览器跨域访问未开放，面向服务端调用。

## 路由

| 方法 | 路径 | 返回 |
| --- | --- | --- |
| GET | 根路径（不带尾斜杠） | 十套规范索引、版本、文档链接与数量摘要 |
| GET | `/:templateId` | 完整 JSON 规范 |
| GET | `/:templateId?format=markdown` | 完整 Markdown 文档 |
| GET | `/schema` | 规范文档 JSON Schema（2020-12） |
| GET | `/output-schema` | AI 生成结果 manifest 的 JSON Schema |

单模板响应附带 `X-Template-Guide-Revision` 和 `X-Template-Guide-SHA256`。调用方应把版本与输出一起保存，模板规范更新后重新获取。当前 schemaVersion 为 `1.0`；内容修改需递增 revision。

错误状态：无效凭据 401、普通用户 403、模板不存在 404、写入方法 405、非法 format 400。

## 模板索引

| templateId | 名称 | 建议不同产品主图 | 默认内置视频 |
| --- | --- | ---: | ---: |
| senseng-clean | Senseng 经典工贸 | 8 | 0 |
| senseng-video | Senseng 全屏视频版 | 8 | 1 |
| saas-automation | SaaS 智能自动化 | 12 | 1 |
| fintech-platform | 金融资产管理平台 | 8 | 0 |
| digital-marketing | 数字营销增长机构 | 12 | 0 |
| porto-accounting | Porto 经典财税会计 | 3 | 0 |
| crafto-corporate | Crafto 现代企业集团 | 6 | 0 |
| juno-toys | Juno 儿童童趣玩具 | 12 | 0 |
| corpox-ai-agency | Corpox AI 智能工坊 | 12 | 0 |
| corpox-consulting | Corpox 顶级战略咨询 | 12 | 1（内容区） |

建议数量用于减少图片复用，并非上传硬性最低数；实际按产品数量生成。无需为内置装饰、背景、图标重复生成。

## 每份规范包含

- `visualSystem`：色板、视觉风格、构图、文字语气与禁用项。
- `inputContract`：真实品牌/产品/目标语言输入、缺失事实处理与不可信输入边界。
- `pagePlan`：首页、目录、关于、联系、商品详情各页内容结构。
- `inventory` / `layoutImageSlots`：真实模板槽位数量、原始尺寸、用途及复用规则。
- `assets`：每类图片/视频的稳定 ID、数量、像素、格式、性能字节预算、构图、正/负提示词、字段绑定与验收；视频还有时长、帧率、编码和封面关联。
- `textSlots`：标题、介绍、CTA、产品、FAQ、SEO 等的稳定 ID、条数、建议字数/行数、提示词和实际可绑定字段。
- `generationWorkflow` / `qualityChecks`：生成顺序、数据交付、视觉与事实验收。
- `outputContract`：下游结果格式和不自动发布的边界。

## Node.js 调用示例

```js
const base = 'https://web-radar.net/api/internal/template-guides';
const headers = { Authorization: `Bearer ${process.env.TEMPLATE_GUIDES_API_KEY}` };
async function read(path) {
  const response = await fetch(base + path, { headers });
  if (!response.ok) throw new Error(`Template guide HTTP ${response.status}`);
  return response.json();
}
const guide = await read('/senseng-clean');
const outputSchema = await read('/output-schema');
// 由调用方提供真实上下文，不要把认证密钥交给模型。
const context = {
  language: 'en',
  brand: { name: 'Example Brand', description: 'Provided description', audience: 'Wholesale buyers' },
  products: [{ id: 'p1', name: 'Provided product name', facts: ['Verified fact'], referenceImages: ['https://your-authorized-media.example/p1.png'] }],
  requestedAssets: ['product-master', 'hero-image'],
};
// 将 guide / outputSchema 与 context 分别作为规范和资料传给你的生成服务。
// 图片/视频地址由调用方按权限提供；规范 API 不读取这些地址，也不提供第三方模型凭据。
```

## 推荐 AI 操作契约

1. 获取指定模板规范和输出 schema；先核对输入资料，不擅自改用其它模板。
2. 只生成 `requestedAssets`。产品素材缺失时报告 `missingFacts`，不要根据商品名虚构外形或包装。
3. 每张图片/视频输出实际地址或已上传的 assetId、像素、MIME、字节数与 alt；视频另报时长/帧率。
4. 文案输出 `textSlotId`，产品文案带 `productId`；重复条目带从 0 开始的 `itemIndex`，页面文案带 `page`，并列出 `factReferences`。
5. 校验 schema 之后，还要按对应 guide 检查 assetSpecId/textSlotId 是否存在、尺寸/数量是否匹配、事实是否有来源。不要以 schema 通过代替视觉与真实性检查。
6. 调用方适配层用现有受权项目上传/保存接口应用结果。该只读密钥不能完成这一步。
7. 检查电脑/手机预览，再由有发布权限的调用方决定是否发布。

### 重要的现有绑定限制

- 参考模板图片槽位当前按主产品优先、索引取模复用 `draft.products[].imageAssetId`；不能直接通过槽位 ID 分别上传任意场景图。
- 首页/独立页面背景可通过 `draft.banners[]` 设置图片、轮播或全屏视频；产品详情不使用 Banner 覆盖。
- 参考模板主标题读取 `draft.copy[language].headline`；多个正文、按钮、统计、客户评价、FAQ 仍是模板静态内容。Senseng 首屏文案也仍需模板接入。
- `binding.strategy=manual-template-edit` 明确表示待开发者接入，不可宣称已通过保存 draft 自动生效。原模板中的示例业绩数字/评价不可当作真实公司事实。
- 本功能提供规范与接口，**没有改变上述模板渲染机制，也没有自动调用生图/视频模型**。

### 输出示例

```json
{
  "schemaVersion": "1.0",
  "templateId": "senseng-clean",
  "guideRevision": "2026-09-17.1",
  "language": "en",
  "assets": [],
  "copy": [{"textSlotId":"product-description","productId":"p1","text":"A description supported by supplied product facts.","factReferences":["products[p1].facts"]}],
  "missingFacts": ["products[p1].referenceImages"],
  "warnings": ["No product image was generated because no reference was supplied."]
}
```

维护时同步修改对应 JSON、增加 revision，并运行 `npm run check`。测试覆盖十套槽位尺寸与渲染器一致性、文案/视频规则、只读权限、JSON/Markdown 等价性与输出协议。

本地真实 Worker 验证：先 `npm run build`，再执行 `node scripts/verify_template_guides.mjs`。测试使用隔离的 D1 和测试密钥，不发起模型请求。
