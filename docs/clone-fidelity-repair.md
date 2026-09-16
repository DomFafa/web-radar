# Design reconstruction repair — 2026-09-16

## Cause

The old clone generator returned fixed purple demo HTML whenever test providers were enabled **or** credentials were missing, while the editor claimed “100% pixel-perfect” and Cloudflare deployment. The renderer also retained authenticated asset URLs in public HTML, duplicated one document into every route, and sent at most 12 reference images. This project had 13 images. Filename guesses classified numbered product photos as catalog layouts and `product-page.jpg` as a detail page.

## Changes

- Demo generation requires both test mode and the explicit `CLONE_TEST_FIXTURE=true` switch. It carries visible fixture provenance and is rejected for production publishing. Missing credentials and failed model calls are errors, never demo success.
- The selected model survives draft validation. Requests use the configured provider, send every supplied image at high detail, stop on unreadable images, and never silently switch models or endpoints.
- The prompt prioritizes screenshot measurements, colors and composition. It no longer imposes purple styling, invented business claims, a four-column generic grid or Tailwind CDN.
- Generation returns shared CSS and five separate page bodies per language. Product detail placeholders are expanded with each actual product; malformed, incomplete, truncated or private-screenshot-dependent output is rejected before publishing.
- Failed regeneration keeps the previous usable documents and published release intact.
- Public media uses release-approved asset URLs. Page references remain private; explicitly designated artwork is publishable. Static reconstruction artwork uses the application origin in standalone Pages deployments.
- Upload guesses distinguish numbered artwork from page layouts. Existing known incorrect guesses are repaired, but explicit manual role selections are retained.
- The editor shows actual generation provenance and distinguishes code generation, local test publication and production publication. Visual acceptance is separate from successful generation.

## Specific site repair

Project `af8c295b-48f0-487b-8796-19469e44d50b` was rebuilt directly against the supplied Senseng designs. This is explicitly recorded as `reference-rebuild`, not an AI-generated result. Existing company/product records were preserved; display order follows the reference. Five page types produce 12 individual documents (including all eight product detail pages).

Reproduction:

- `scripts/rebuild_senseng_clone.mjs` builds independent documents using the existing approved Senseng artwork and measured corrections in `scripts/styles/senseng-clone-reference.css`.
- `scripts/apply_senseng_clone_repair.mjs` checks that company/product data has not changed, saves with the current version, publishes only to the specified localhost project, and records the release.
- `scripts/verify_clone_fidelity.mjs` tests five page types at 1536 px and 390 px, anonymous images, navigation and horizontal overflow.
- `scripts/verify_clone_editor.mjs` tests all private previews and the corrected 5-reference / 8-artwork classifications.

Artifacts and before/after project backups are in `artifacts/clone-fidelity/` (git-ignored). At 1536 px, the home hero starts at y=56 and ends at y=485, matching the supplied reference; the product panel starts at y=634. This does not claim a zero-difference pixel comparison. Actual user text and independently supplied product photographs differ from text/photos baked into the mockup.

## Validation boundaries

`npm run check` passed 299 tests, TypeScript checks and the production build. Browser regression covers all ten template previews, cookie session restoration, two consecutive fixture generations/publications, and concurrent draft version handling. Fixture tests establish workflow correctness, not AI visual fidelity.

The user separately authorized one real OpenAI verification using the 13 uploaded images. `scripts/verify_clone_live.mjs` saves its result separately and never replaces the repaired project. Run this only with explicit authorization: it uses the existing local OpenAI key and may incur API charges. On this Mac, direct API connections failed; the existing system HTTPS proxy is `http://127.0.0.1:7890`. The verification process can use `HTTPS_PROXY` and `NODE_USE_ENV_PROXY=1`; do not hardcode a developer-local forwarding port into production code.

### Real provider attempt

The authorized real request (model `gpt-6-astra`, 13 images) did not return a usable result before the then-configured 240-second timeout, at `2026-09-16T02:01:13Z`. A preceding direct connection attempt had failed, while an unauthenticated connectivity check through the existing system proxy succeeded. There is **no successful real-model visual acceptance result**. No provider result replaced the local repair. The generation deadline has since been increased to ten minutes, with distinct timeout/network errors and no automatic paid retries. This longer deadline is covered by code review/tests but was not tested with another paid request.

## 2026-09-16：视觉接口连接与上传进度

- 修正 `clone-service.ts` 的 `redirect: 'error'`：workerd 在发起请求前即拒绝此参数，导致界面误报网络不可达。现在使用 `manual`，3xx 作为接口错误处理，凭据不会自动转发到重定向地址。
- `npm run dev` / `npm run dev:test` 改由 `scripts/start-dev.mjs` 启动 Wrangler，使用官方本地运行时的 `outboundService` 将出站请求交给 Node HTTP 客户端。优先读取 `HTTPS_PROXY` / `HTTP_PROXY`，macOS 无显式配置时读取系统 HTTP 代理；localhost 总是绕过代理。生产 Worker 不包含此本地适配层。
- 保留 `.wrangler/state` 本地数据目录。自定义端口/测试库使用 `npm run dev:test -- --port 8794 --persist-to artifacts/upload-review/state`。系统代理变更后重启服务即可，不需要改写密钥文件。
- 上传改用 XHR 字节进度，显示总百分比、文件名、完成数量。100% 以服务器成功响应为准；批量上传逐张保留结果，失败后仅需重选未完成文件。新增拖拽上传和键盘操作。
- `scripts/verify_dev_network.mjs` 在真实 workerd 中运行生成函数（隔离模拟模型），再通过同一代理链路访问官方接口（不带凭据，预期 HTTP 401）。此检查不调用付费模型，不代表设计还原质量验收。
- `scripts/verify_upload_progress.mjs` 用隔离本地项目验证上传进度、部分失败保留和重试。上传鉴权仍支持 HttpOnly cookie 与嵌入式 Bearer，晚到的旧会话错误不会清除新登录。

## 2026-09-16：后台生成任务与暂停/停止

新前端改用 `POST /api/projects/:id/clone/start`，先持久化任务及输入快照再返回 202。Durable Object alarm 执行生成、结果保存及自动发布，浏览器关闭/刷新不影响任务。`GET clone/task` 每两秒读取轻量状态；返回内容不含输入快照。既有同步 generate 接口仅保留兼容性。

- 显示真实阶段、读取图片数、模型流式输出字符数、已耗时和预计剩余区间。初次估算基于素材数，后续参考同项目最近成功任务耗时；模型没有完成百分比时显示不定进度条，不伪造百分比。
- 排队/图片读取时可暂停；模型执行中请求暂停，将等待本次结果写入私有 R2 检查点，再暂停发布。继续复用检查点，不重复调用模型。暂停时间不计入执行耗时。
- 停止会终止本地上游请求并禁止迟到结果写入或发布；无法撤销模型侧已经发生的处理/费用。发布提交后不再提供暂停/停止按钮。
- 暂停/继续/停止使用任务 ID 检查，过期任务操作不能影响新任务。重复开始不会创建第二个在途任务。普通重试接口不能恢复已停止的旧生成。
- 后台进程异常重启时，有结果检查点则暂停等待继续；没有结果则明确失败，不自动重复可能计费的请求。普通浏览器刷新只重新读取状态。
- 任务元数据使用现有 jobs 表 JSON，无数据库结构迁移。上传及旧发布结果保留。
- 验证包含流式分片、多字节内容、截断与错误响应、后台持久化、并发控制、停止后迟到结果、恢复不重复调用、自动发布，以及真实浏览器运行/暂停/停止时刷新恢复。浏览器测试使用隔离模拟模型，未产生真实生成费用。

流式字段按 [OpenAI 官方接口文档](https://developers.openai.com/api/reference/resources/chat/subresources/completions/streaming-events) 的 `delta.content` 与 `finish_reason` 处理，不显示内部推理内容。
