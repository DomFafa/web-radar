# Outreach Experience Implementation Plan

> Execution: coordinated in this chat; independent workbench modules run in parallel, then shared chat integration and acceptance.

**Goal:** 清晰的 EDM/网站留言工作台，以及与 Product Radar 一致、可恢复、可执行的聊天懒人模式。

**Architecture:** 共用现有任务和队列；新增聊天会话存储与受约束的 AI 草稿接口；客户端把必要输入、内容预览、发送确认、实时结果嵌入聊天。工作台保留对同一任务的控制与导出。

**Tech Stack:** React 19, TypeScript, Hono, Cloudflare D1/Queues, Vitest, Playwright.

**Spec:** ../specs/2026-10-03-outreach-experience.md

## Global Constraints

- 不改网站搭建或 Product Radar，不引入新依赖，不触碰已有 output/。
- 不真实群发；测试邮箱/站点用隔离 fixture。测试模式标识与禁止真实发送规则保留。
- 草稿和确认必须有版本/幂等边界，租户和创建者隔离；无凭据进入浏览器或日志。

## Review Focus

- 刷新/双击/并发确认不会重复创建或触达。
- 模型响应不能伪造服务端状态、覆盖确认、选择未知联系人或调用发送。
- 配置失败和无权限提供可执行提示，不把未知状态说成成功。
- 模式切换及补资料后保留工作内容。
- CSV/HTML/网址等外部输入沿用现有安全边界。

## Tasks

- [x] 1. EDM 工作台：原地创建模板、步骤/配置/记录导航、中文场景、必要的权限与草稿恢复，补针对性测试。
- [x] 2. 网站留言工作台：分步输入、网址检查、确认与结果文字动作，补针对性测试。
- [x] 3. 对话后端：会话持久化、AI 结构化对话、版本和确认、复用任务/导出接口，补数据库/权限/重试测试。
- [x] 4. 对齐 Product Radar 的懒人模式 UI：会话列表、聊天、必要输入卡、预览、任务和下载；连接同一工作台记录。
- [x] 5. 独立评审、目标测试、类型检查、完整单测与构建、隔离桌面/手机浏览器验收，记录结果和真实服务限制。

验收记录：../reports/2026-10-03-outreach-experience.md
