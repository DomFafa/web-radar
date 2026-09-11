# Web Radar v1 本地交付与验收

2026-09-12。完整首版本地实现与联合入口验收完成。当前是显式本地测试环境；没有调用真实生成服务、发送真实邮件、购买资源或公开部署客户网站。

## 交付范围

- 独立登录与 Product Radar 嵌入入口共用编辑器、同一项目和版本；一次性短时授权、来源核对、角色实时验证。权限覆盖项目、预览、媒体、询盘和后台。
- 公司、产品、主产品、类目、市场、英文加一种第二语言；独立产品快照、图片复制至私有 R2、来源差异审阅和主动应用。
- 三套原创视频 Hero 模板，包含首页、目录、独立产品详情、公司与联系页面；支持文字、图片、视频、排序、品牌色及译文编辑。
- 脚本确认、分镜与单张重做、整组确认、8 秒三图／12 秒四图完整视频；已有视频上传与人工选用。发起者额度原子预留、保存成功结算，技术失败退回。
- 持久任务与 Agnes 全局并发 1。未知提交不重发；已有上游任务即使账号权限变化也继续核对终态，不提前释放名额。浏览器不能借此读取无权限结果。
- 私有整站预览使用隔离 iframe。媒体先由父页面鉴权读取，通过严格来源和频道握手送入 iframe 内创建 Blob URL；视频播放、暂停、语言、导航和减少动态效果均可用。预览不发送询盘。
- 发布、保留上一成功版本、恢复和下线；询盘保存、完整邮件和有界重试；平台服务状态、账户额度、未知视频核对、业务导出。
- 每站在首次发布前固定 Cloudflare accountId 和 Pages 项目名。支持多个账户配置；同账户 token 轮换沿用网址，绑定账户缺失时失败，不换账户重建。

## 发布的一致性

Pages 上传预先生成的可信 HTML。每次仅包含新版本和上一成功版本，最多 98 个 HTML 文件。网关逐一检查 D1 当前激活版本，再从 Pages ASSETS 读取对应静态页面。Cloudflare 已切换部署但 D1 尚未激活，或激活失败时，仍返回上一成功内容。

上一版产物目录不接受直接访问，页面路径使用该版本的精确白名单。过时部署别名不能绕过激活检查；下线拒绝页面、媒体和新询盘。公开 gate 直接读 Worker/D1，公开媒体直接从 Worker/R2 支持 Range 输出，不经过全局任务 Durable Object。草稿从未进入公开目录。

## 已完成验证

| 验证 | 结果与证据 |
| --- | --- |
| 自动测试 | 117 / 117，9 个测试文件；覆盖授权、域模型/真实 SQLite 事务、任务恢复、邮件幂等、模板、公开媒体、Pages 网关和账户绑定。`artifacts/final-check.log` |
| TypeScript 与生产构建 | 均通过。`npm run check` |
| Worker 打包 | `wrangler deploy --dry-run --env=""` 通过；仅打包，未部署。`artifacts/worker-dry-run.log` |
| 真实本地 Worker/D1/R2 API | 12 项完整链路通过，包括来源图片导入、8 秒三图、额度、权限/Range、发布、询盘、恢复与下线。`artifacts/api-acceptance.json` |
| 独立浏览器工作室 | 6 项通过，包括公司与产品、12 秒四图视频实播、双语内容、私有预览、测试发布和 390px 布局；JS 错误 0。`artifacts/browser/result.json` |
| 私有预览浏览器 | 4 项通过：图片与视频实播/暂停/恢复、德语与产品导航、询盘禁用、减少动态效果；浏览器与控制台错误 0。`artifacts/preview-browser/result.json` |
| Pages 浏览器 | 7 项通过：静态目录/详情、德语同源询盘与防重、新部署激活失败时保留旧版、旧别名/下线/媒体拦截。使用本地 Pages 运行时模拟器与真实本地 Worker/D1/R2，未部署真实 Pages。`artifacts/pages-browser/result.json` |
| 前端状态边界 | 同账号续期保留输入，换账号同项目清空旧输入，延迟确认响应不覆盖新输入，特殊产品 ID 不破坏预览脚本。`artifacts/frontend-races/`、`artifacts/frontend-review-fixed.json` |
| Product Radar 联合入口 | 实际 iframe 导入、刷新同项目、独立入口打开同草稿、修改回传同步、成员/匿名隔离、丢确认后重取 code、换账号清空；JS 错误 0。联合任务执行，证据复制至 `artifacts/integration/` |
| 一次性兑换并发 | 同一 code 20 次并发：1 个 200、19 个 409，63ms。仅证明防重复兑换。`artifacts/integration/wr-exchange-concurrency.json` |
| 独立审查 | 后端与前端已发现问题全部修复并独立复验关闭。`docs/auth-media-review.md`、`docs/frontend-review.md` |

### 本地 20 / 50 会话负载

这些是登录、创建、填写保存、模板预览、刷新和文字任务入队的一轮完整旅程，不等于真实生成时长或生产容量证明。

| 模拟会话 | 错误率 | 旅程 P50 | 旅程 P95 | 批次耗时 |
| --- | --- | --- | --- | --- |
| 20 | 0% | 465ms | 515ms | 522ms |
| 50 | 0% | 1071ms | 1190ms | 1197ms |

证据：`artifacts/load-acceptance.json`。首次运行缺少主产品的测试前提失败已保留在 `artifacts/load-initial-preconditions.json`，修正测试数据后再运行；没有放宽业务校验。队列并发限制、部分失败与额度归属另外由 SQLite 回归验证。Cloudflare 实际 CPU、账户配额、流量和真实模型耗时仍需生产配置后测量；没有据此承诺免费容量。

## 复现

```sh
npm ci
npm run build
npx wrangler d1 migrations apply web-radar --local --env test
npm run dev:test
```

另一个终端依次运行：

```sh
npm run check
node scripts/acceptance-api.mjs
node scripts/acceptance-browser.mjs
node scripts/acceptance-preview.mjs
node_modules/.bin/esbuild scripts/acceptance-pages.ts --bundle --platform=node --format=esm --packages=external --outfile=artifacts/pages-acceptance.mjs
node artifacts/pages-acceptance.mjs
node scripts/acceptance-frontend-races.mjs
node scripts/acceptance-load.mjs
npx wrangler deploy --dry-run --env=""
```

Pages 脚本使用刚由 browser 脚本创建的测试发布，最后将该测试站下线。前端并发输入脚本临时使用本地 5173 父页面。脚本均要求显式 testMode；不会调用真实供应商。测试会在本地数据库产生有标识的项目，不删除其他项目。

## 接入真实服务的剩余依赖

1. Product Radar 正式地址、允许嵌入来源、服务间凭据、真实现有账号及工作区权限验收。此次跨入口连接使用明确的本地测试身份，不证明生产账号范围已开放。
2. 独立文字配置、Web Radar 专用 Image 2.5 新 key；指定 Agnes 模型/权限/额度/契约与签名参考素材读取验证。没有复制旧项目的任何 key，也没有自动选付费模型。
3. 独立 D1、R2、Durable Object 资源与正式 APP_ORIGIN，多个 Cloudflare 账户/token 的权限及实际可用容量。D1 ID 目前仍是本地占位值。
4. Resend 平台发信域名、MAIL_FROM、专用 key、明确测试收件邮箱；验证完整邮件真正到达，当前只有模拟投递与幂等回归。
5. 已授权的真实产品/公司素材、可公开的样例和真实服务验收范围。部署、外部 API 成功、实际视频质量、邮件送达分别保留证据。

`node scripts/verify-production-config.mjs` 正确报告 `ready:false`，不会把空配置当成已接通。这些依赖不影响已完成的本地开发，仍阻止声称生产上线完成。

## 仓库与交接

Git 已初始化；工作分支 `codex/web-radar-v1`。开发验收时因缺少作者身份，首次提交被 Git 拒绝；随后本轮提交沿用 Product Radar 仓库已有的 Git 作者身份，仅配置当前仓库。本次仅做本地提交，不推送。真实密钥、测试运行数据、构建产物和截图均在 Git 忽略范围内。

入口与使用说明见 `README.md`；业务与适配器细节见各实现报告。原需求记录保留，当前状态以本文为准。未来迁移通过平台业务导出及独立 D1/R2/调度状态备份恢复，需在目标服务器验证在途任务和既有 Pages 绑定；本次未迁移生产数据。
