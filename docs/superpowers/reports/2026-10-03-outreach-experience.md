# Web Radar EDM、网站留言和懒人模式验收记录

日期：2026-10-03。基线：`f526591ac64b56401dfc14d15e7053f7b9afcc9f`，分支 `codex/web-radar-v1`。本次改动仍在本地工作区，未提交、未发布线上、未向真实客户投递或提交表单。

## 客户可见结果

EDM 统一到发送入口，按选择客户、准备邮件、预览确认逐步操作；模板可原地创建，返回后保留客户名单。新增模板检查避免预览后的模板变化静默改变最终发送内容。发信配置提示读取工作区实际配置，发送记录可打开和导出。

网站联系表单留言按目标网站、联系资料、留言内容、确认拆分；输入时展示有效、重复和无效网址。保存草稿与开始执行分开，结果和下载使用文字动作。

懒人模式参照实际登录后的 Product Radar 界面和现有样式，采用同一浅灰紫背景、紫色强调、白色圆角卡片、中央聊天、右侧会话列表和底部输入。客户用自然语言描述需求和修改文案，缺少名单、目标网站或姓名/邮箱时才填写资料卡。预览确认后，系统复用工作台的真实邮件和网站任务，结果返回会话，可下载 CSV 或查看同一工作台任务。

会话按工作区和创建者隔离；只读角色不能创建或发送。确认绑定当前版本、内容和名单快照，刷新与断线恢复不重发，未知投递状态不会标成成功或自动重试。SMTP 网关失败不再生成虚假的成功 ID；Mailchimp 批量任务拒绝无法保留逐人文案的混合内容。

## 验证证据

- `npm run check`：类型检查、114 个文件内的 2362 个测试、Vite 生产构建全部通过，测试耗时 47.66 秒。
- 最终 Workers 请求兼容修正后，`npx vitest run tests/outreach/assistant-ai.test.ts tests/outreach/assistant-routes.test.ts tests/outreach/assistant-client.test.ts && npm run typecheck`：31 个针对性测试和类型检查通过。新增用例验证 `manual` 重定向策略及 302 拒绝。
- EDM 与网站工作台的直接浏览器验收通过，包含模板往返保留名单、模板预览变化拦截、分步执行、无效网址、权限与手机布局。
- `node scripts/verify_outreach_assistant.mjs`：真实前后端交互、隔离 SQLite、模型和队列 fixture。双通道生成、必要资料、预览、确认、CSV、工作台跳转、刷新、模型异常、丢失确认响应、只读角色和 390px 手机界面通过；2 次确认 HTTP 请求使用同一个请求 ID，仅创建 1 个邮件任务和 1 个网站任务。未外部投递。
- 独立 UI 复核确认桌面和手机的补资料、保存和确认按钮可见且不被底部输入遮挡；刷新客户名单不丢输入，未保存资料在页面刷新后保留。
- `node scripts/verify_outreach_assistant_live.mjs`：真实文字服务生成与修改均成功，样本约 10.4 / 11.4 秒；无虚构发件身份、目标名单或网站。模型测试未执行发送。
- 实际本地 Cloudflare Workers + 构建后的客户端 + 隔离 D1：真实模型同时生成英文邮件和网站留言成功，模型 HTTP 请求耗时 8085ms；资料保存、预览、刷新、桌面和手机通过，无页面 JavaScript 错误。发送动作按现有测试环境规则被明确拒绝，未生成投递任务。

运行时验收发现 Node 的模型烟测未覆盖 Workers 对 `redirect: 'error'` 的限制。最小 Workerd 复现确认该参数在发出请求前抛 TypeError；改为 `manual` 并拒绝非 2xx，实际 Worker 请求返回 200。独立边界复核通过，无跨地址转发认证头。

浏览器证据在 `/tmp/web-radar-assistant-acceptance/`（`evidence.json`、`worker-evidence.json`、`worker-preview.png`、`worker-mobile.png`、`results.csv`），独立 UI 复核在 `/tmp/web-radar-assistant-ux-retest/evidence.json`。该目录为临时验收证据，代码中保留可复现的 fixture 和真实文字服务检查脚本。

## 用户验收与发布边界

本地入口：`http://127.0.0.1:8798/?view=lazy-mode`，选择“公司管理员”进入隔离测试工作区。此入口为了验证实际文字生成注入了已有平台文字服务配置；全局 TEST MODE 标识仍保留，邮件发送和网站表单执行仍被禁止。

真实外部投递尚未验收。当前线上工作区读取 Resend 发信域名遇到 API Key 权限错误，回复追踪配置也未启用；本次没有修改账号配置或凭据。发布需应用 `0012_outreach_assistant.sql` 并沿用现有受控发布入口，随后在正确客户角色下验证线上行为。现有 SMTP 配置仍使用 HTTPS 网关接口，未新增原生 SMTP 功能。
