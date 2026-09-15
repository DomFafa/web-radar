# Web Radar

独立于 Product Radar 的外贸展示网站工作室。完整首版范围见 [批准方案](docs/web-radar-v1-final-review.md)，跨项目协议见 [集成契约](docs/web-radar-integration-contract.md)。当前开发分支 `codex/web-radar-v1`。

当前工作台已改为静态展示站流程，保留原有 UI：资料与产品 → 需求沟通 → 网站方案 → 页面设计稿 → 预览与发布。LLM 同时阅读原始产品图片和已填资料，一次提出一道题，给出四个选项，第五项固定为“都不是，我要自定义”。客户确认整理出的需求、文案和页面清单后，Image 2.5 先生成首页；确认首页后，以首页、原始产品图片和已确认资料生成其余页面。基础五页外可按需推荐最多三个展示类扩展页，确认整组后由 screenshot-to-code 生成真实网页。产品详情自动扩展到各个产品，继续支持英语和一种第二语言。新流程不需要视频；已有公开版本保留其原始快照。

## screenshot-to-code 服务

提供的 `screenshot-to-code-main/` 是只读源码依赖，使用其 Agent 后端，不启动它的前端或公开开发服务器。独立服务的安装、接口与运行说明见 [site-builder README](services/site-builder/README.md)。Python 依赖安装后，在项目根目录运行 `npm run dev:builder`，即可在 `127.0.0.1:7002` 启动服务；启动器从忽略的 `.dev.vars` 读取专用 `SITE_BUILDER_KEY`，并将现有文字服务配置映射为 OpenAI 配置。生成代码使用 Responses API，因此供应商须支持图片输入、工具调用和 Responses。

线上需把此服务部署到可访问的 HTTPS 地址，并在 Worker 设置 `SITE_BUILDER_URL` 和相同的 `SITE_BUILDER_KEY`。本机进程、测试适配器和生产部署是独立状态。生产 Worker 无法直接访问本机的 `127.0.0.1`。

构建任务使用持久化编号，查询或网络重试沿用原编号。输入变化会使旧设计、确认和构建失效；晚返回结果不会覆盖新资料。生成的 HTML 会清理模型脚本和外部依赖，再填入确定的公司、产品、图片和询盘字段。独立 Chromium 对清理后的代表页检查桌面与手机布局、原图可见性和导航；失败页面最多做一次定向修正，仍不通过则明确失败。渲染时阻断外网，使用私有主产品原图和可选 logo。私有预览与发布读取同一份 R2 产物，全部设计图保持私有。

## 本地开发

Node.js 24，npm。依赖已锁定，无需访问任何旧项目配置。

```sh
npm ci
npm run build
npx wrangler d1 migrations apply web-radar --local --env test
npm run dev:test
```

访问 [本地工作室](http://127.0.0.1:8788)。`test` 环境必须显式启用，页面始终标明测试模式；可用五个固定身份测试创建者、工作区管理员、普通成员、其他公司成员和平台管理员。测试接口限制为 loopback 地址。测试生成、发布和邮件的结果不能用作真实服务验收。真实客户使用生产环境并连接 Product Radar；没有单独注册账号或共享测试登录。

需要热更新时另开 `npm run dev:ui`，端口 5174 代理 API 到 8788。内嵌鉴权和 CSP 最终验证应使用 Worker 原点 8788。

## 校验

```sh
npm run typecheck
npm test
npm run build
npx wrangler deploy --dry-run --env=""
```

`tests/auth.test.ts` 核验一次性授权、幂等重试、Origin、权限撤销、并发交换和令牌隔离。其他领域测试覆盖额度、生成确认、任务恢复、发布及模板边界。浏览器与负载脚本在 `scripts/`，执行顺序、证据与真实配置依赖见 [首版验收报告](docs/web-radar-v1-acceptance.md)。

引导式静态流程使用 `tests/site-brief.test.ts`、`tests/consultation-provider.test.ts`、设计与静态构建测试及领域回归测试。启动本地测试 Worker 后运行 `STATIC_TEST_ORIGIN=http://127.0.0.1:8788 node scripts/acceptance-guided-site.mjs`，验证上传、五选一提问、方案确认、动态页面门禁、构建、双语私有预览、公开页面原图、手机布局与修改失效。此脚本仅允许本地测试环境，不调用付费模型；Python 服务另有 `uv run pytest -q` 和 `uv run pyright`。

本次引导式流程与验证见 [需求沟通改造验收](docs/guided-site-acceptance.md)。此前真实图片与转码、视觉复测和生产部署边界见 [静态站改造验收](docs/static-site-acceptance.md)。

## 真实配置

从 `.env.example` 建立忽略于 Git 的 `.dev.vars`，或者通过 `wrangler secret put` 设置服务端凭据。不要把 key 放进 `VITE_*`、URL、日志或客户表单。仅使用新的 Web Radar 专用 Image 2.5 key；文字、Agnes、Resend、Cloudflare 和 PR 服务间认证独立配置。

生产入口为 [web-radar.net](https://web-radar.net)。`wrangler.jsonc` 已绑定正式 D1、私有 R2 和任务 Durable Object，并关闭测试模式。部署资源、验证结果及尚未接通的 Product Radar 登录依赖见 [生产部署记录](docs/production-deployment.md)。服务配置存在不代表真实生成、客户网站发布或邮件送达已验收。

## 数据与恢复

项目使用稳定 ID 和乐观版本号；两入口编辑相同记录。Product Radar 图片复制到私有 R2，来源更新由客户明确查看并应用。生成任务保存发起者、输入快照、额度状态和上游编号。未知视频提交不可重新提交；先查上游并人工核对，避免重复生成。

发布记录与草稿分别保存。只有成功发布版本对外生效；恢复上次成功发布不覆盖当前草稿、询盘或额度。下线关闭公开网关与新询盘，旧部署别名也须通过同一网关检查。管理导出提供业务数据；迁移时另行导出 D1、R2 对象、DO 调度状态，并在新环境核对在途任务、原发布账号和地址关联。迁移不是直接复制项目目录。
