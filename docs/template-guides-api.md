# 内部模板使用规范 API（供其它 AI / 服务调用）

## Product Radar 轻量目录与按需合同（2026-09-23）

建站资料使用 `/materials/catalog`，普通 Product Radar 账号可通过既有服务认证读取；下面旧规范接口的管理员限制不适用于这组资料路由。每次请求（包括条件请求）仍验证当前账号及工作区权限。

目录保留 `schemaVersion: wr-template-materials-v1`，只返回摘要，不返回 `imageSlots`、`textSlots` 或完整规则：

| 字段 | 含义 |
| --- | --- |
| `templateId`, `name`, `materialsReady`, `pages` | 模板身份和可用页面 |
| `guideRevision`, `contractRevision`, `rendererRevision`, `contractSha256` | 精确合同与执行版本；哈希是合同 JSON 的 SHA-256 |
| `requiredCapabilities`, `productApplicability` | 同一版本合同的能力与产品适用类别 |
| `materialRequirements.requiresDetail` | 存在 `binding=supported`、`role=detail` 且 `required` 或 `min>0` 的图片槽位 |
| `materialRequirements.requiresPackaging` | 存在 `binding=supported`、`role=packaging` 且 `required` 的图片槽位 |
| `thumbnailUrl`, `thumbnailRevision`, `thumbnailWidth`, `thumbnailHeight` | 对应合同演示的真实截图、内容 SHA-256 和尺寸；无对应版本的封面时均为 `null`，由客户端显示占位，不借用其他模板封面 |
| `requirementsPath`, `previewPath` | 带固定 `contractRevision` 的完整合同与演示地址 |

顶层 `catalogRevision` 是 `JSON.stringify(templates)` 的 SHA-256，并作为带双引号的 `ETag`。客户端可按账号、工作区缓存已授权读取的摘要，最多短期复用，或带 `If-None-Match` 重新验证。未变化时返回 `304`；所有响应仍 `Cache-Control: no-store`，不允许浏览器/CDN公共缓存身份相关接口。账号撤权、工作区不匹配优先返回原有权限错误，不返回 `304`。

只在选择模板时请求 `requirementsPath`，以 `templateId + contractRevision + contractSha256` 复用已经校验的合同，不在每次打开列表时读取所有合同。完整合同也支持 `ETag` / `If-None-Match`，并保留 `X-Template-Materials-Revision`、`X-Template-Materials-SHA256`。摘要约束必须与实际合同一致，失配时拒绝继续备料。同版本未变无需重新下载规则。旧草稿继续请求其保存的合同版本，不随目录默认版本升级。

目录只注册通过执行映射验证的模板插件；新模板可由版本化清单接入，无需逐个修改 Product Radar。完整合同与执行能力仍由消费端按支持范围校验。演示在打开时单独请求，不在目录同步时批量生成或下载。封面生成/校验脚本及发布检查保证清单地址是对应图片，而非返回 `200` 的 HTML 页面。

当前可选的 11 套模板各有一份独立 JSON 文档；历史模板规范保留用于已保存项目的兼容读取。文档保存在 `src/worker/template-guides/documents/<templateId>.json`。文档只打包进 Worker，**不进入前台 JS、静态素材目录或用户页面**。Markdown 由同一 JSON 渲染，避免两份文档不一致。

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
| GET | 根路径（不带尾斜杠） | 当前规范索引、版本、文档链接与数量摘要 |
| GET | `/:templateId` | 完整 JSON 规范 |
| GET | `/:templateId?format=markdown` | 完整 Markdown 文档 |
| GET | `/schema` | 规范文档 JSON Schema（2020-12） |
| GET | `/output-schema` | AI 生成结果 manifest 的 JSON Schema |

单模板响应附带 `X-Template-Guide-Revision` 和 `X-Template-Guide-SHA256`。调用方应把版本与输出一起保存，模板规范更新后重新获取。当前 schemaVersion 为 `1.0`；内容修改需递增 revision。

错误状态：无效凭据 401、普通用户 403、模板不存在 404、写入方法 405、非法 format 400。

## 当前 9 个模板（2026-10-01）

Cloudflare 根地址：`https://web-radar.net/api/internal/template-guides`。
服务器根地址：`https://web.vnvnv.com/api/internal/template-guides`。
两端保持相同的模板 ID 和规范；凭据由各部署环境管理。
Good Boy Supply Co. (`good-boy-pals`) 和 PaperNote (`papernote`) 已从可选目录移除。旧项目使用的规范、版本化合同及素材继续兼容；新建项目以目录返回的 9 个模板为准。

| templateId | 名称 | 建议商品/作品主图 | 首页主视觉 | 默认视频 |
| --- | --- | --- | --- | --- |
| senseng-candy | Candy Pop & Play | 8 张，1200 × 1200 | 2560 × 930，1 张 | 0 |
| senseng-video | Immersive Video | 8 张，1536 × 1024 | 2560 × 1440，1 张封面 | 1 段内置；替换规格见 JSON |
| senseng-nature | Botanical & Forest | 8 张，1200 × 1200 | 2560 × 960，1 张 | 0 |
| pawfect-groom | Pawfect Groom | 6 张服务照片，1200 × 1200 | 1200 × 1400，1 张肖像 | 0 |
| lumi-business | Lumi | 6 张，1200 × 1200 | 2560 × 1440，1 张 | 0；可选背景视频 |
| mello-coffee | Mello Coffee & Bakery | 4 张精选饮品/烘焙，1200 × 1200 | 1200 × 1000，1 张饮品特写 | 0 |
| auravell | Auravell Yoga & Mindful Living | 每课程 1 张，1200 × 900 | 3456 × 1800，1 张冥想场景 | 3 |
| careflow-healthcare | Careflow Healthcare | 建议 6 张，1200 × 900 | 2752 × 1412，1 张，主体居右 | 0 |
| toorun-early-learning | Toorun Early Learning | 6 张课程照片，1200 × 1200 | 568 × 688，建议 4 张人物图 | 0 |

数量为建议准备的不同素材数，不是必传数；已有内置素材可保留，客户商品/作品按真实数量准备。
每类图片、视频的 `quantity.min/recommended/max`、`dimensions`、格式、大小预算与构图说明以对应 JSON 为准。
同一主图在首页、目录、详情重复使用只算 1 张；Mello 九宫格可复用菜单图片，不额外要求九张。
附加素材包括 Pawfect 的沙龙照片和护理图库、Lumi 的插画与文章封面、Mello 的店内空间与生活方式图片；完整数量见各自 `assets`。

新增规范文件：`pawfect-groom.json`、`lumi-business.json`、`mello-coffee.json`、`toorun-early-learning.json`。
每份包含五类页面规划、图片规格与生成提示词、文案条数和长度、缺失事实规则、输出 schema 及实际字段绑定。

### 外部 AI 的调用顺序

1. `GET /api/internal/template-guides`，从当前 9 个模板中选择 `templateId`。
2. `GET /api/internal/template-guides/:templateId`，读取 `assets` 和 `textSlots`；需要文字文档时添加 `?format=markdown`。
3. 图片规格 ID（`assetSpecId`）用于生成清单；不能直接当成素材合同的 `slotId`。
4. 准备提交项目素材时，使用既有 Product Radar 用户/工作区认证读取 `/materials/catalog` 和目录给出的版本化 `requirementsPath`。
5. 按完整合同的 `imageSlots` / `textSlots` 绑定素材，使用现有项目 API 保存与预览。规范只读密钥不能修改项目。

Mello 的原生首屏照片由 `hero-portrait` 素材槽替换；页面 Banner 覆盖整段首屏，二者不同。
原生模板中尚未接入字段的静态内容会在规范中标为 `manual-template-edit`，不可承诺自动写回生效。
内置示例人物、项目、价格、地址、营业时间与评价必须替换为客户确认信息，不能当作客户事实。

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
const guide = await read('/mello-coffee');
const outputSchema = await read('/output-schema');
// 由调用方提供真实上下文，不要把认证密钥交给模型。
const context = {
  language: 'en',
  brand: { name: 'Example Brand', description: 'Provided description', audience: 'Wholesale buyers' },
  products: [{ id: 'p1', name: 'Provided product name', facts: ['Verified fact'], referenceImages: ['https://your-authorized-media.example/p1.png'] }],
  requestedAssets: ['product-main', 'hero-image'],
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

维护时同步修改对应 JSON、增加 revision，并运行 `npm run check`。测试覆盖模板槽位尺寸与渲染器一致性、文案/视频规则、只读权限、JSON/Markdown 等价性与输出协议。

本地真实 Worker 验证：先 `npm run build`，再执行 `node scripts/verify_template_guides.mjs`。测试使用隔离的 D1 和测试密钥，不发起模型请求。

## Careflow Healthcare 接入说明（2026-10-01）

- 模板 ID：`careflow-healthcare`；Guide revision：`2026-10-01.2`；合同版本：`2026-10-01.careflow-healthcare-materials.3`；渲染版本保持 `2026-10-01.careflow-healthcare-materials.2`。
- 原生页面：`home`、`catalog`、`detail`、`about`、`contact`。详情由每个产品/服务生成，预览和发布走同一渲染器。
- Guide：`GET /api/internal/template-guides/careflow-healthcare`（可加 `?format=markdown`）；Materials API 从 `/materials/catalog` 返回的版本化 `requirementsPath` 获取可执行合同。
- 16 个页面图片槽位，每个 0–1 张；尺寸逐项列在 JSON 的 `layoutImageSlots` / `assets` 及合同的 `imageSlots`。保留默认示例图时无需上传。首屏 `home-hero` 为 **2752 × 1412**；左下角覆盖标题卡，主体宜放右侧。
- `product-main`：每个服务 1 张 **1200 × 900** 主图；`product-gallery`：每个服务 **0–10 张 1200 × 900** 附图，使用 `productId` 与 `itemIndex` 关联。主图在目录和详情复用；附图可以点击切换、键盘切换和放大。
- 支持 JPEG、PNG、WebP，建议大图 ≤600 KB、其他图片 ≤350 KB；可传独立移动图和焦点。字体、图标和示例图片已本地化，无需运行 Webflow 脚本。
- 文案使用纯文本槽位与 `locale`；`palette.primary` 控制按钮主色，按钮文字根据背景亮度自动选择深色或白色。其他调色参数未在此版本声明支持。
- 示例医生、评分、患者评价、统计、院区和资讯仅用于参考预览；客户发布省略 `reference-claims`，使用已确认的机构和服务数据。预约入口提交现有询盘，不直接确认预约；页脚入口转联系页，不伪装已订阅。
- 参考站的图库、导航、折叠问答和院区选项卡采用项目自有运行时；没有外部 Webflow 表单、广告或跟踪脚本。

### Careflow 页面图片清单

每个槽位 0–1 张；留空使用对应示例图。所有图片和文案通过版本化合同绑定，不能把多个位置拼在同一张图中。

| 图片槽位 | 建议尺寸（px） | 数量 |
|---|---|---|
| `home-hero` | 2752 × 1412 | 0–1 |
| `home-image-02` | 1136 × 1204 | 0–1 |
| `home-image-03` | 1544 × 1412 | 0–1 |
| `home-image-04` | 2752 × 1412 | 0–1 |
| `detail-image-01` | 2752 × 1412 | 0–1 |
| `about-image-01` | 1004 × 892 | 0–1 |
| `about-image-02` | 764 × 892 | 0–1 |
| `about-image-03` | 764 × 892 | 0–1 |
| `about-image-04` | 1004 × 892 | 0–1 |
| `about-image-05` | 1132 × 1220 | 0–1 |
| `contact-image-01` | 400 × 400 | 0–1 |
| `contact-image-02` | 400 × 400 | 0–1 |
| `contact-image-03` | 400 × 400 | 0–1 |
| `contact-image-04` | 400 × 400 | 0–1 |
| `contact-image-05` | 400 × 400 | 0–1 |
| `contact-image-06` | 2752 × 1412 | 0–1 |

主图与附图另计：`product-main` 每服务 1 张，`product-gallery` 每服务 0–10 张。92 个纯文本槽位包括各页 SEO、标题、正文与按钮。`company-about` 与 `about-copy-03` 指向同一段介绍，前者优先。联系方式直接读取品牌资料，版权行由品牌名与年份生成。


## Auravell Yoga & Mindful Living（2026-10-01）

模板 ID `auravell`，Guide revision `2026-10-01.2`，合同版本 `2026-10-01.auravell-materials.3`，渲染版本保持 `2026-10-01.auravell-materials.2`。通过 `/api/internal/template-guides/auravell` 获取 JSON 或 Markdown，通过材料目录获取冻结合同。所有入口使用现有 API 认证。

上述两套模板的 `.3` 合同与 Lumi 的 `2026-10-01.lumi-business-materials.2` 修正 Product Radar 可执行图片来源与能力声明，旧合同仍可按版本读取，页面渲染不变。Toorun 的 `2026-10-01.toorun-early-learning-materials.3` 使用 `2026-10-01.toorun-early-learning-native.2` 渲染器，首页四个原生卡片复用所选产品主图，不再要求生成整块首页横幅；旧项目继续使用原固定版本。

包含首页、课程目录、课程详情、关于、联系和会员方案（`extra-plans`，发布路径 `en/extra-plans/index.html`）。预览和发布共用原生渲染器，移动端菜单、课程筛选、图片切换和询盘均使用项目运行时。预览不发送询盘，正式表单调用现有 JSON 询盘接口，不确认预约。

| 图片槽位 | 尺寸（px） | 数量 |
|---|---|---|
| `home-hero` | 3456 × 1800 | 0–1 |
| `about-hero` | 1920 × 1080 | 0–1 |
| `class-hero` | 1920 × 1080 | 0–1 |
| `wellness-meditation` | 1008 × 1200 | 0–1 |
| `wellness-breathwork` | 1008 × 1200 | 0–1 |
| `wellness-yoga` | 1008 × 1200 | 0–1 |
| `whyus-main` | 1536 × 1200 | 0–1 |
| `whyus-secondary` | 1200 × 1200 | 0–1 |
| `footer-background` | 1920 × 800 | 0–1 |
| `product-main` | 1200 × 900 | 每课程 1 张 |
| `product-gallery` | 1200 × 900 | 每课程 0–10 张 |

9 个布局图位置可选；课程主图和附图按 `productId` 绑定，附图使用 `itemIndex` 排序。主体居中，保留裁切空间；图片不嵌文案，首页左侧留标题空间。支持 JPEG、PNG、WebP。正文为纯文本；字体和 CSS 依赖本地化。示例课程只用于演示，正式站不自动添加不存在的课程或虚假联系方式。运营方应核实课程、方案价格、营业时间和品牌介绍后发布。

### 2026-10-01 动效修复版本

两个模板的新合同均为 `materials.2`，旧 `.1` 合同、渲染器和预览运行时保留。已有确认素材项目继续使用原合同；需要新布局时按 Materials API 重新确认 `.2` 合同并发布。普通模板预览和新项目使用修复版。

Auravell 恢复参考站五个页面的完整结构及原生动效：首屏入场、视差、服务卡悬停、练习图切换、视频滚动收拢、导师卡、分类/方案标签、FAQ 和移动菜单。3 段视频均为内置静音 MP4，配套封面；无需上传。图片槽位仍为 9 个，产品主图 1200×900、附图最多 10 张；视频并非 `imageBindings`，当前 API 不支持视频绑定。

Careflow 恢复滚动渐入、逐字按钮悬停、图片放大、折叠高度过渡、团队横向循环、计数和导航交互。演示视频仅点击后加载隐私增强播放器。两者均支持减少动态效果、键盘操作及私有预览，装饰动效不能影响询盘及图库。
