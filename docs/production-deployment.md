# Web Radar 生产部署记录

2026-09-12（Asia/Shanghai）。已按用户授权将网站部署到 https://web-radar.net。

## 首页设计稿 HTTP 400 与参考图读取中断修复

2026-09-14 01:24（Asia/Shanghai）。最终 Worker 版本 `82526c9f-a7d4-4c2a-94cd-2cb211ba1c71`。

- 对失败任务 `633f6a20-2e4b-4c3f-bbd9-3bf5a8695471` 的冻结输入重建请求，OpenAI 实际返回 HTTP 400、`string_above_max_length`、`param=prompt`，说明上限 32,000，收到 523,291。原实现把每个导入产品的完整研究来源、重复的产品创作条件、所有页面和语言文案一并提交。
- `providers/image.ts` 绘图输入现在使用已确认视觉方案、页面导航及当前页/语言的准确文案；研究来源继续完整保存在项目和访谈输入中，产品设计条件按相同内容分组并保留所属产品 ID。原图与 Logo 顺序不变，没有截断客户文案或产品约束。首页为 31,459 字符，其余四页 31,427–31,596；逐项核对五页中的 200 个原产品条件字段一致。发送前检查 32,000 字符限制。
- 首次上线提示词修复后，真实恢复又出现 `job_interrupted`。实时日志记录 Coordinator 在经自身 HTTP 读取七张参考图后异常结束（8,410 ms，44 ms CPU，没有提供异常堆栈）。随后将页面设计参考图改为通过项目资产权限检查后直接读取私有 R2，以 Blob 交给图像适配器；没有修改公开素材授权接口、原始资料、账号权限或数据库结构。
- 原失败任务已达到三次技术尝试上限，保留其历史；通过正常生成接口以同一份已确认资料创建一次首页任务 `d18dfc5f-0df1-4a24-98fa-7d57152fe802`。该任务首次尝试成功，Alarm 完整运行 52,686 ms、CPU 65 ms、无异常。结果 `result-d18dfc5f-0df1-4a24-98fa-7d57152fe802` 已保存，私有图片请求 HTTP 200，PNG 1,838,225 字节。
- 验证：新增四项回归覆盖研究资料过大、提前拒绝超长提示词、八张原图字节/顺序、直接二进制参考图上传；均先在旧实现失败。`npm run check` 通过类型检查、201 项测试和生产构建。正式账号浏览器验证首页设计图加载、可打开预览、首页确认按钮可用，无页面脚本错误。没有代用户确认首页、生成其余页面或发布客户网站。
- 诊断和真实验收证据位于 Git 忽略的 `artifacts/image-error-20260914/`。包含原始输入的文件为本地私有文件，未提交到仓库。Cloudflare 历史日志接口对现有 Token 返回 403，本次中断验证使用实时日志完成。

## 资源与配置

- Worker：`web-radar`；初次部署版本 `8c524598-cb3b-4702-85d2-4c15d855fd39`，连接修复后版本 `2a062be5-6911-413a-ba2a-a5ec248bf363`。
- 自定义主域名：`web-radar.net`；`workers.dev` 和版本预览地址关闭。
- D1：`web-radar`，ID `cce8ea9d-cd9b-4a35-81bd-0097b12daf93`；三项迁移均完成，无待执行迁移。
- R2：`web-radar-private`，通过 `MEDIA` 私有绑定使用。
- Durable Object：`Coordinator`，通过 `COORDINATOR` 绑定使用。
- 17 项配置保存在 Worker Secret 中；域名、运行模式和模型等非密钥配置保存在 `wrangler.jsonc`。本地 `.dev.vars` 与 Product Radar 配置片段继续被 Git 忽略。
- 主域名原有四条 Squarespace A 记录已备份并替换；六条邮件相关 MX/TXT 记录保持不变。

## 验证

- `npm run check`：连接修复后类型检查、132 项测试及生产构建通过。
- `node scripts/verify-production-config.mjs`：通过。
- Wrangler 类型生成和部署打包检查通过；Worker 启动时间 24ms。
- HTTPS 首页返回 200，标题为“Web Radar · 网站工作室”；线上 JS/CSS 与本地生产构建逐字节一致，未包含配置中的密钥值。
- `GET /api/health` 返回 200、`ok:true`、`service:web-radar`、`testMode:false`。
- `GET /api/config` 返回所有服务已配置、正式模式；该接口仅表示配置存在，不证明上游生成成功。
- 未登录 `GET /api/auth/me` 返回 401；生产 `POST /api/auth/test-login` 返回 404。
- 无有效签名的素材请求经线上 Durable Object 返回 403 `invalid_asset_grant`。
- 浏览器实际连接通过：在已登录的 Product Radar `/websites` 页面完成 handoff 与授权交换，内嵌 Web Radar 显示同一个 System account 工作区、当前账号和空项目列表，无需再次输入密码。本次仅验证现有获准账号，未扩大试用范围。

脱敏部署日志、DNS 备份和线上检查结果保存在忽略于 Git 的 `artifacts/deploy/`。

## Product Radar 连接修复

初次部署时 Product Radar 接口返回 404；对方部署接口后，复测服务认证返回 503 `Web Radar integration is not configured`。在 ECS 确认运行版本已经传递配置、两项变量为空且后台任务为空后，仅向 `/etc/product-radar/product-radar.env` 追加 `WEB_RADAR_BASE_URL` 和 `WEB_RADAR_INTEGRATION_SECRET`，保持原配置，备份至同目录 `.backup-web-radar-20260911-201227`，重启网页服务。发布版本和账户试用范围保持不变，采集服务仍正常。

配置加载后，有效密钥加无效请求体返回 400，错误密钥返回 401，真实获准账号的 service context 返回 200；两端健康检查为 200。PR 的 `frame-src` 和 WR 的 `frame-ancestors` 均只允许已配置的正式来源。

随后实际浏览器 handoff 返回 502。定位到 WR 使用 `redirect: 'error'`，该参数在 Workers 中会在请求发出前抛错。使用本地真实 workerd 复现后，将账号、供应商和发布网关共三处文件改为 `manual` 并拒绝上游 3xx；发布询盘的跳转响应不再传递给浏览器。供应商写操作遇到跳转继续标记状态不确定，避免自动重复提交。

新增 15 项重定向回归，并更新原有请求参数断言；先观察失败，再确认全部通过。真实 workerd 中对项目源身份查询、独立登录请求、供应商 JSON 请求和素材下载执行本地响应桩验证，均能构造请求且保持 `manual`。最后部署并在正式浏览器完成上述实际登录衔接。

复测结果见忽略于 Git 的 `artifacts/deploy/integration-check.json`、`product-radar-connect.log`、`redirect-check.log` 和 `integration-browser-check.json`。专用配置片段 `.env.product-radar-integration` 继续保持私有，不可替代 Product Radar 的完整环境文件。

## 尚未验证

本次完成两站连接与当前账号的内嵌登录。真实产品导入、独立页面的密码登录、真实模型生成、邮件发送、客户网站发布及其他账号范围尚未实测；不能用已连接或已配置状态代替这些结果。

## 工作台 UI 对齐 Product Radar

2026-09-12：部署版本 `5bb359aa-68f8-475f-94bc-deff14ac0b3d`。

- 参考 `product-radar-release-37f9f62/src/client/design-system.css`、`app-shell.css` 与 `studio-workspace.css`，统一灰白工作区、紫色操作、字体、按钮、表单、状态与响应式布局。样式集中在 `src/client/radar-ui.css`。
- 编辑流程调整为资料与产品 → 网站风格 → 网站文案 → 首页视频 → 预览与发布；客户询盘单独管理。项目列表支持状态筛选、名称搜索和继续未完成步骤。
- `src/client/workflow.ts` 集中处理准备状态；检查有效联系邮箱、产品图片、主产品、各语言文案与产品译文、确认选用的视频。与现有服务端发布条件保持一致，公司介绍正文仍为可选。发布检查项可以返回对应编辑步骤。
- 嵌入时使用横向步骤、减少重复导航与账号信息；手机保留项目名、保存状态和额度。项目数据结构、权限和生成确认接口沿用原实现。
- `npm run check`：类型检查、146 项测试、生产构建通过。后续仅有样式修正，已重新构建并完成以下浏览器验证。
- 本地独立测试 Worker（8790）完成导入、保存、脚本确认、四张分镜、12 秒测试视频、双语文案、私有预览与测试发布；未使用真实付费生成服务。
- `UI_TEST_ORIGIN=http://127.0.0.1:8790 node scripts/acceptance-ui-alignment.mjs`：五步跳转、缺项回跳、保存重开、筛选、390px 五个步骤和列表、可读表单字号、嵌入桌面与手机布局通过。嵌入测试使用获准的本地父页面 `http://127.0.0.1:4189` 与模拟授权交换响应，仅验证 UI，不替代线上登录衔接验收。
- 截图与测试证据：`artifacts/ui-alignment/review/`、`artifacts/ui-alignment/browser/`。测试 Worker 配置与数据均在忽略于 Git 的 `artifacts/ui-alignment/`，与生产数据隔离。
- 正式环境健康接口返回 200、`testMode:false`，线上 JS/CSS 与本地构建逐字节一致，证据见 `artifacts/ui-alignment/deployed.json`。本次未重新执行正式账号浏览器验收。此轮调整范围为工作台及编辑器，生成的网站模板未修改。

## 分镜提示与当前超管账号不限额

部署版本 `cd0b5fa3-9e2e-4bc0-ab0e-57e5ece41da8`。

2026-09-12：线上只读诊断确认目标项目的脚本任务成功，但 `scriptConfirmedRevision` 为空，未产生图片任务；发起者身份为 `super_admin`，此前没有额度配置。

按用户明确要求，仅为该项目所属的当前超管账号启用图片与视频不限额。`0004_unlimited_quota.sql` 为额度表增加独立布尔标记；既有有限额度、用量和预留继续保留。任务提交与技术重试识别不限额标记，仍通过原有事务记录用量。平台管理员可在额度表单查看与编辑不限额状态，普通账号不能授予该权限。

分镜区现在显示未确认脚本、无额度、部分额度、正在处理或图片已齐备的原因；提供返回脚本确认入口。单张与整组生成统一校验脚本和额度，全部图片齐备后禁止重复提交“缺少的分镜”。没有替用户确认脚本，也没有发送真实图片或视频生成请求。

验证：`npm run check` 通过类型检查、151 项测试与构建；新增 5 项不限额权限、完整分镜生成、用量、失败重试与视频额度回归。`node scripts/acceptance-storyboard-gates.mjs` 在独立本地测试 Worker 上通过脚本未确认、零额度、部分额度、3 张测试分镜生成，以及不限额页面和视频按钮验收。浏览器修复前复现了“脚本未确认时单张按钮仍可点”的失败。

线上额度更新证据：`artifacts/storyboard-debug/unlimited-production.json`；本地浏览器证据：`artifacts/storyboard-debug/browser/`。

## 视频状态查询与结果恢复

2026-09-12：部署版本 `f1e49d8c-c3fe-482d-b311-11632b332a39`。

真实 Agnes 任务已完成，但接口返回顶层 `url`，旧适配器仅接受 `metadata.url`；实际素材来源为 `https://cos-platform-outputs.agnes-ai.cn`，此前未包含在下载来源白名单中。另一次只读查询返回 HTTP 429（查询过于频繁）。旧逻辑统一展示查询失败，连续 12 次后停止追踪；成功查询到处理中状态后也未清除旧错误提示。

修复：兼容实际响应的顶层下载地址并保留原字段支持，将已核验的素材域名加入本地及线上来源配置；素材仍须通过 HTTPS 来源校验且下载不携带生成 API 密钥。生产查询间隔调整为 30 秒，遇到失败至少退避 60 秒并遵守 `Retry-After`；限流不耗尽查询失败次数，退避时间持久化以跨重启生效。正常查询清除旧提示；恢复已知任务时清空历史查询失败计数。

验证：新增 5 项回归先在旧实现失败，修复后 `npm run check` 通过类型检查、156 项测试与生产构建。覆盖两种完成响应、安全来源校验、限流退避持久化、同一任务只提交一次、结果入库用量结算和旧错误清除。生产健康接口返回 200、`testMode:false`，线上 JS/CSS 与本地构建逐字节一致。证据保存于忽略的 `artifacts/video-debug/`，上游原始响应与下载地址仅保存在本地私有诊断文件。

生产原任务于 05:39:30（北京时间）自动完成并写入项目：保留同一上游编号，提交次数及供应商尝试记录均为 1；视频用量 1、预留 0、账本 committed，当前超管不限额仍为开启。真实 R2 素材为 MP4，3,417,427 字节；项目 `heroAssetId` 已指向该结果，`heroAccepted` 仍为 false，保留用户预览确认步骤。通过 Cloudflare 管理凭据下载原存储对象，在独立本地 Chrome 中验证元数据、实际播放推进与拖动播放位置：8.041667 秒、1280×704、已解码 62 帧、无媒体错误。证据见 `completion.json`、`playback.json`、`playback.png`。正式账号页面未在本轮重新进行浏览器验收。

恢复过程中准备过限定单个任务的 Cloudflare 远程预览工具，但预览连接超时，未发出恢复写请求；随后生产任务自行继续查询并完成。临时诊断与预览进程已关闭，未增加生产维护入口，也未重新提交视频。

## 客户网站发布 HTTP 400 与发布后 404 修复

2026-09-13：最终 Worker 部署版本 `216910cb-1634-4817-9bc1-a08e4d226ab9`。

发布草稿 V12 时，Cloudflare 项目本身查询成功；随后部署列表请求使用 `per_page=100`，实际返回 HTTP 400、错误码 `8000024`，指出 `page` 或 `per_page` 无效。同一项目改为 `per_page=25&page=1` 后返回 200。发布适配器改为每页 25 条、最多四页，保留原有 100 条历史发布查找范围及按发布标记恢复已有部署的逻辑。

原发布任务 `d8333954-c31f-4a52-889e-65229b87c7df` 已通过正常领域重试与状态激活流程恢复成功，沿用原冻结快照，没有重新生成文案、图片或视频。实际文件上传与部署提交均返回成功，部署编号 `a91c5b50-3b7c-4112-94f6-03714524f33f`。

公开网站验收进一步复现了目录路由问题：Pages 将 `/en/index.html` 规范化跳转到 `/en/`，原网关仅允许快照中的完整文件路径，导致跳转后 404。网关现在将目录地址对应到已发布的 `index.html` 文件进行白名单校验；未发布及内部目录仍不可访问。上一版快照的资源请求也使用目录地址，避免 Pages 将内部快照路径暴露为浏览器跳转目标。

目录修复使用完全相同的已确认草稿重新发布：任务 `2a9025c0-022b-4479-8bf0-61f8031d36e1`、发布 `a50f2f74-87ff-4254-b460-7690adfdd5bd`、Pages 部署 `fb5f1341-2e81-494e-ba43-88037be7bcbe`，最终均成功，项目已激活该发布且未下线。恢复工具在本地运行现有 `DomainService`，连接真实 D1，重新验证 Product Radar 身份与资产可用性，并调用真实 Pages 适配器；没有添加生产维护接口或直接伪造成功状态。

验证：新增分页恢复与目录路由回归在旧实现中失败，修复后 `npm run check` 通过类型检查、159 项测试及生产构建。正式工作台健康检查返回 200、`testMode:false`，线上 JS/CSS 与构建一致。公开客户网站在 Chrome 中从根地址跳转到 `/en/` 并返回 200，全部首页图片加载、8.041667 秒视频实际播放，5 个产品的目录、产品详情及联系表单跳转通过，无浏览器脚本错误；未提交询盘邮件，本轮未重新验收已登录工作台页面。

客户网站：<https://wr-d51aa7a2f9d989621d7f91f5cec0e309.pages.dev>。诊断、发布恢复、最终线上检查和截图保存在忽略于 Git 的 `artifacts/publish-debug/`。本轮未调整生成网站的设计或模板。

## 引导式静态建站流程上线

2026-09-13 23:56（Asia/Shanghai），按用户“部署上线”授权发布。

- 当前 Worker 版本：`51eaae1c-c560-48d4-b7ef-a92cb3580e53`。上一个可回退版本：`216910cb-1634-4817-9bc1-a08e4d226ab9`。
- 入口仍为 `https://web-radar.net`，正式供应商模式。现有 D1、R2、账号与权限绑定沿用；远程检查无待执行迁移。
- 新流程：资料与产品 → 需求沟通 → 网站方案 → 页面设计稿 → 预览与发布。每题四个模型选项，第五个固定为“都不是，我要自定义”。首页确认、内页确认和整组复刻的门槛沿用此次已验收实现。
- 新增独立服务 `https://builder.web-radar.net`，运行在现有 ECS 的独立 `web-radar-site-builder.service`，以 `web-radar-builder` 用户执行，监听 `127.0.0.1:7002`，由独立 Nginx 域名代理。Product Radar 主服务持续 active，没有重启或切换其应用版本。
- Python 服务目录 `/opt/web-radar-site-builder/releases/20260913-guided`，`current` 指向该版本；vendor backend 按原文件打包，未修改。使用已有 CPython 3.12.14 和独立依赖环境，`uv sync --frozen --no-dev` 安装锁定版本。服务器通过 `SITE_BUILDER_BROWSER_CHANNEL=chrome` 使用已安装 Chrome。
- 持久数据 `/var/lib/web-radar-site-builder/builds.sqlite3`，凭证 `/etc/web-radar-site-builder.env`（0600）。单进程消费者；systemd 开机启动及失败重启，独立临时目录、只读系统、3 GB 内存上限、150% CPU 上限。
- DNS 新建 `builder.web-radar.net`，已开启 Cloudflare 代理；独立 Let's Encrypt 证书有效至 2026-12-12，自动续期及现有 Nginx reload hook 已配置。没有修改主域名或邮件记录。
- Worker 仅新增 `SITE_BUILDER_URL` 和 `SITE_BUILDER_KEY` 两项 Secret，其他线上凭证保留。本地 `.dev.vars` 的服务 URL 同步完善。配置模板见 `deploy/site-builder/`，实际密钥不进入 Git。

### 本次上线验证

- `npm run check`：类型检查、195 项测试、生产构建通过。
- Python 使用服务器相同的 `chrome` channel：76 项测试通过；pyright 无错误。保留一项既有 Starlette 弃用提示。
- 服务器实际 vendor 导入及服务启动成功；独立用户 Chrome 启动正常。与正式服务相同 systemd 限制下的真实 renderer 检查通过，桌面 1440 px、手机 390 px 均无诊断错误。
- HTTPS 未鉴权请求 401；合法凭证查询不存在任务返回预期 404；非法提交返回 422；经 Cloudflare 代理验证相同结果。
- 服务器调用当前配置的真实 Responses API 成功。该探测仅请求简短文本，不等同于整站复刻验收。
- 正式浏览器使用现有管理员凭证登录成功；真实产品图片上传成功；真实视觉 LLM 根据产品生成一题，四个选项加固定自定义项，自定义输入正常；超级管理员 `unlimited=true`，手机无横向溢出，页面运行错误 0。
- 专用私有验收草稿：`3c005d4c-e1ef-477e-9029-4e00c0153299`，名称“上线验收 · 单题需求沟通”。未发布，未调用图片生成。第一次验收脚本在编辑器加载完成前读取导航，随后补上等待并复用同一草稿，完整通过；应用无需修改。
- 线上 JS/CSS 与本地构建逐字节一致，前端产物未包含已配置密钥。健康检查 `ok=true, testMode=false`，所有供应商配置保留。
- 原有公开站点 `/en/` 返回 200，真实产品媒体读取 200（156438 字节）。

证据位于被 Git 忽略的 `artifacts/deploy/guided-20260913/`。复刻服务归档 SHA-256：`2b00b617522e1b9c7539c0f608a0143a77b269b04c6d1e930467c791a3771702`。

本次没有重新生成整组真实设计图或执行付费整站复刻，完整真实生成的视觉质量仍需另行验收；本地全流程测试和服务器运行探测不能代替该项。发布源为当前工作区，没有创建 Git 提交或推送（仓库未配置 remote）。

### 服务后续更新与回退

新版本需保持 `services/site-builder` 和 `screenshot-to-code-main/backend` 的相对目录，排除本地数据、环境文件和虚拟环境，部署到新的 release 目录。依赖按锁文件安装，并验证 Chrome。切换 `current` 及重启服务前，先只读确认 SQLite 没有 queued/running 任务；重启中的任务会被标记失败，因此不能在活跃生成时直接切换。SQLite 数据目录与凭证独立于 release 保留，不随版本复制或覆盖。

Worker 回退使用上面记录的旧版本。复刻服务更新可回退 `current` 到已验证的 release 后重启；首次部署只有当前一个版本。Nginx 修改必须先通过 `nginx -t` 再 reload。无需重启 Product Radar，也无需改动其数据。

## Product Radar 八产品内嵌授权修复

2026-09-14 00:38（Asia/Shanghai），Worker 版本 `6f4536f8-be2c-45b3-a84f-f366ccce612c`，上一版本 `51eaae1c-c560-48d4-b7ef-a92cb3580e53`。

- 真实浏览器复现：Product Radar `/api/auth/me` 和 `/api/web-radar/config` 均 200，iframe 发出 `web-radar:ready`；父页面 `/api/web-radar/handoffs` 返回 502，未收到授权码。源站直连诊断进一步取得 Web Radar 的 `413 body_too_large`。
- 原请求选了 8 个 Build 产品，每个产品保留完整来源报告、设计依据和创作条件；实际紧凑 UTF-8 授权 JSON 为 538984 字节，超过授权入口的默认 262144 字节上限。并非账号权限或 API key 缺失。
- 仅将 `src/worker/integration.ts` 的 handoff 读取上限调整为 1 MiB，与现有项目草稿请求上限一致。未删减来源条件，未修改其他接口上限、角色、产品数量或一次性授权规则；没有修改 Product Radar 应用或服务器配置。
- 新增两项授权回归测试：八产品完整设计上下文跨授权持久化与交换、超过 1 MiB 时仍在上游账号请求前拒绝。先复现测试 413 失败，再修改；最终 `npm run check` 类型检查、197 项测试和生产构建通过。
- 用用户原请求 `59380afe-df09-4862-9734-d6e36cc3758d` 在线重连成功：handoff 200，收到 `web-radar:authenticated`，父页面错误提示消失，iframe 进入新工作台。
- 对应草稿 `d69c40a7-1b5e-41dc-a501-2ff335ecf491`。独立鉴权读取确认 8 个产品的完整 source snapshot 与 Product Radar 输出逐项一致，8 张私有图片全部 200，超级管理员仍 `unlimited=true`。这次只修复并验证导入连接，没有触发付费生成或发布客户网站。
- 证据：`artifacts/embed-debug/summary.json`、`verified-import.json`、`connected.png`（均被 Git 忽略）；完整原始 payload 文件为私有验收材料，不可提交到 Git。

## 首页设计稿提示词超限修复

2026-09-14 04:45（Asia/Shanghai），Worker 版本 `4ec2853c-6c36-4ba6-8ef9-ce641862f2dd`，100% 部署 `63bfc812-feca-45d4-80bb-aa19f5f5fc94`。可回退版本 `82526c9f-a7d4-4c2a-94cd-2cb211ba1c71`。

- 项目 `6ffc53a3-d992-4508-a104-90ef0ac82e62` 两次首页任务的实际生产提示词均为 32,025 字符，只超 32,000 上限 25 字符；用户修改要求为空，失败发生在调用图片服务之前。
- 条件分组使用准确文案中产品有序表的 1-based 位置，减少重复 UUID。完整原始 ID、40 条条件及归属、准确文案、8 张参考图保留；首页输入降至 30,514 字符，没有提高限制或截断资料。
- 为隔离未发布工作，从实际下载的生产包仅替换 `generatePageDesign` 与其固定导航标签表，包括已验收的简短导航及可用控件提示词规则。其他 Worker 字节、HTML/JS/CSS、30 项绑定、运行/资源配置和非版本设置逐项相同；没有更新 Python 服务或迁移。实际下载部署包与待部署包 SHA-256 一致，健康检查 200、`testMode:false`。
- 新回归在旧实现中复现超限，修复后类型检查、203 项测试、构建通过；10 个真实冻结输入/页面组合完整性检查和独立只读复核通过。
- 原任务 `c93bade0-24d1-474b-bf00-03d72545dbca` 仅恢复一次，attempts=2，于 04:50:22 成功。PNG 1,700,635 字节，1536 × 1024，鉴权下载 200。项目产品与已确认方案未变，任务总数仍 10、发布数仍 0。
- 正式 Chrome 真实登录并定位原项目：首页预览与放大成功，确认首页风格按钮可用，脚本错误 0。未代替用户确认设计或生成后续页面，未发布客户网站。本轮未创建提交或推送。
- 私有诊断、部署边界与验收材料：`artifacts/prompt-limit-20260914/acceptance.md`。原始项目和提示词仅保存在 Git 忽略目录。


## 首页设计输入安全预算与无损重复资料压缩

2026-09-14。Worker版本 `691dc5df-452c-4b7f-87d1-0505e51c04bf`，100%流量；前一版本 `4ec2853c-6c36-4ba6-8ef9-ce641862f2dd`。

- 保留图片模型先出设计稿。完整请求限制28,000字符，首版预留4,000字符修改；先无损编码重复条件，超长非可见来源资料才进入有独立复核、最多一次修正的文字整理。不可容纳的固定可见文案在任务创建、旧图清理与额度预留之前拒绝。
- 真实原始首页输入30,162→23,471，修改预留后27,471；8个产品、40项条件归属及原文反解相同，0文字调用。1次真实图片调用41.243秒获得1536×1024首页PNG；用户原项目/任务不变。
- `npm run check`通过类型检查、230项测试和构建。正式账号浏览器原项目与已保存设计图/放大预览正常，无脚本错误；本轮新图仅为独立供应商验收，没有代用户在线创建/确认新设计或发布客户网站。
- 窄包只更改页面设计输入与任务前预检。30项绑定、运行时与部署设置、现有HTML/JS/CSS均保留；实际代码下载hash校验和正式health通过。Wrangler在成功部署后的非版本设置同步发生网络错误，已用实际部署/代码/配置读取核实，无重复部署。
- 完整证据及边界见 `artifacts/page-design-budget-20260914/acceptance.md`；包含来源资料的文件仅存Git忽略私有目录。图生站还原、Hero独立背景素材和整单自动恢复未在此补丁中改动。


## 会话恢复、模板试览与克隆发布版本修复

2026-09-16（Asia/Shanghai）。按用户要求先验证本地部署，再部署到正式域名。

- 本地入口：http://127.0.0.1:8788（明确标记测试环境）；线上：https://web-radar.net（testMode:false）。
- 当前 Worker 版本：`f421b5a4-20eb-4ef6-943f-38d54be5a2f9`，100% 流量。前一版本：`5e0d9d9e-a4fd-465a-a686-bd7b79c44268`。
- 包含 HttpOnly 会话恢复与续期、10 套模板只读试览、克隆生成与发布版本衔接及无冲突的并发保存合并。
- 发布前：类型检查、289 项测试、生产构建与隔离浏览器回归通过；连续两次测试克隆生成发布完成。正式 D1 无待执行迁移。
- 发布后：线上健康检查正常；JS/CSS 与本地构建逐字节一致；模板缩略图及两个参考视频可读取；未登录 me 为 401，生产测试登录为 404。真实浏览器登录页正常、无 JavaScript 错误。
- 本次未使用正式账号执行付费模型生成或发布客户网站。线上登录后的业务流程由本地隔离回归覆盖，不将其声明为正式环境端到端验收。
- 部署日志、前后版本快照、资源哈希及浏览器截图：`artifacts/deploy-20260916/`；此前功能回归记录：`artifacts/session-review/README.md`。

### 2026-09-16 — Design reconstruction correction

- Latest production Worker version: `c6521b26-1cb3-4c27-acc2-041f51e81c7d` on `https://web-radar.net`, deployed with `--keep-vars`.
- Client bundle: `/assets/index-D7CRmbzc.js`; CSS: `/assets/index-DagSt_t8.css`.
- `npm run check`: 20 test files / 299 tests passed, plus TypeScript and Vite build.
- Local project `af8c295b-48f0-487b-8796-19469e44d50b`: direct reference reconstruction published as release `14cedaa1-1502-481a-aaf4-7db7979f3626`, current project version 20. This is a **local test release**, not a Cloudflare-hosted customer site.
- Anonymous browser checks: five page types at 1536 and 390 px, no broken/private media URLs or horizontal overflow, navigation works. Private editor previews and correct 5-page / 8-artwork classification passed.
- Live model verification was separately authorized but timed out; it was not treated as successful visual generation. See `docs/clone-fidelity-repair.md` for the cause, validation boundaries and repeatable repair scripts.

### 2026-09-16 视觉接口连接及上传进度修复

本地入口现为 `npm run dev:test`（测试环境）或 `npm run dev`，自动接入系统/环境 HTTP 代理，数据仍保存在 `.wrangler/state`。避免直接运行旧 `wrangler dev` 命令绕过出站适配。线上使用 Cloudflare 自身出站网络，修复的重定向参数同样适用。
上传进度基于浏览器传输字节与服务端完成确认，支持部分成功保留及失败重试。本次不需要数据库迁移，不重新生成或覆盖已有发布网站。

部署版本：`d5885456-690a-4552-a452-ade821f67c16`。构建：`index-M3SRmWnK.js` / `index-DagSt_t8.css`。验证：308 项单元测试、真实 workerd 模拟生成与官方接口连通性、浏览器上传部分失败/保留/重试均通过；本地用户项目重启前后数据与版本一致。

### 2026-09-16 后台设计生成任务

设计生成与自动发布改为持久化后台任务，接口先返回任务 ID。界面每两秒同步阶段、图片读取数、流式输出字符数，显示执行耗时和估计剩余区间。支持暂停、继续、停止和刷新恢复。模型执行中暂停会在结果保存后生效；继续读取检查点，不再次调用模型。发布已提交后不可暂停/停止。

本次复用现有 jobs 表，无结构迁移。验证：317 项测试通过；隔离真实浏览器验证了运行/暂停/停止时刷新、恢复后不重复调用模型及无人值守自动发布。构建资源：`index-DJzQDzUU.js`。

后台任务功能线上版本：`510d87fc-5b58-43e8-a6a7-19a8e22561cb`。

### 2026-09-16 任务结束、发布一致性与智能完善

- 任务结束后停止生成状态和项目详情的定时查询；新任务、恢复操作和重新聚焦页面可重新同步状态。暂停期间不持续查询。
- 生成完成后的状态统一由任务面板展示。可选择自动发布或仅生成预览；已上线的相同内容不再创建重复发布任务/记录。成功发布清除中间错误，并兼容隐藏旧成功记录残留的处理中提示。
- 图生站增加智能完善/忠实还原选项。智能完善优先保留首屏与品牌视觉，依据已有产品和品牌资料补充有用内容，明确禁止虚构认证、评价和数据。品牌微调指令优先应用，实际优化说明随生成结果保存。修改选项或指令需重新生成才影响页面。
- 类型检查、324 项测试、生产构建通过。真实 workerd 与 Chrome 的隔离模拟模型回归验证任务刷新/暂停/恢复/停止、自动发布、完成后停止查询和相同内容发布去重。没有额外付费模型调用，未将模拟输出视为视觉还原验收。
- 本地构建资源：`index-DeT_r0L_.js` / `index-DagSt_t8.css`。无数据库结构迁移，不重新生成已有客户网站。
- 仅生成预览的浏览器补充回归通过：不新增发布记录，完成后停止查询。线上部署版本：`c575d6a1-5106-4fd5-b7af-7a8cb4a05c54`；上一版本：`510d87fc-5b58-43e8-a6a7-19a8e22561cb`。部署使用 `--keep-vars` 保留线上配置。
- 部署后线上健康正常（`testMode:false`），JS/CSS 与本地构建逐字节一致；未登录接口 401、生产测试登录 404、模板图片和视频资源可访问。业务流程在隔离本地环境验证，未用正式账号再次生成客户网站。

### 2026-09-16 项目列表时间排序

项目列表接口按卡片显示的 `updatedAt` 倒序返回；时间相同时依次按创建时间、项目 ID 排序。筛选与搜索保留该顺序，无数据迁移。类型检查、74 项服务测试、构建及本地现有项目排序检查通过。线上版本：`990c41b6-dad8-4b55-a482-fd0f7eec86ec`，前一版本：`c575d6a1-5106-4fd5-b7af-7a8cb4a05c54`。
