# 仓库同步与线上发布约定

2026-10-01，项目负责人确认以下常规流程。

## 仓库与合并

1. 本地项目的提交先推送到 [wuyueerhao/web-radar](https://github.com/wuyueerhao/web-radar)。当前本地 remote 名称为 `fork`，默认 push 指向该仓库。
2. 推送后，向原始仓库 [DomFafa/web-radar](https://github.com/DomFafa/web-radar) 发起 Pull Request。同一分支已有未合并的 PR 时更新该 PR，不重复创建。
3. 上游仓库的合并由负责人后续手动完成。代理提交和维护 PR，不自动合并。

本约定确认时，开发分支为 `codex/10-industry-templates`，对应 [PR #17](https://github.com/DomFafa/web-radar/pull/17)，目标分支为 `DomFafa/web-radar:codex/web-radar-v1`。后续任务开始时核对实际分支和 PR 状态；本地 `origin` 当前仍是上游仓库，不能凭 remote 名称判断推送目标。

## Cloudflare 发布

用户要求更新线上时，使用项目配置的 `CLOUDFLARE_ACCOUNT_ID` 与 `CLOUDFLARE_API_TOKEN` 直接发布 Web Radar Worker 和静态资源。上游 PR 合并及 `production-release` 工作流不是此常规发布路径的前置条件，无需再次请求“流程例外”。这项约定取代此前将上述前置条件用于所有生产发布的说明。

发布仍需完成与改动相应的验证：

1. 核对推送的完整提交号、发布目标及构建内容；保留类型检查、相关测试、模板浏览器和 API 合同验证。
2. 发布前检查生产绑定和变量，保留现有数据库、存储、队列、浏览器和服务配置；凭据仅从私有环境读取，不写入 Git、公开产物或日志。
3. 使用仓库锁定版本的 Wrangler 发布，保留生产变量（`--keep-vars`），记录完整源提交号、Worker 版本与部署 ID。
4. 发布后验证健康状态及实际受影响的页面、模板目录、API 文档和静态资源。只有验证通过才报告上线完成。

已有 [production-release 工作流说明](controlled-production-release.md) 作为可选的上游 Actions 发布方式保留；选择该工作流时仍遵守其自身检查，不伪造分支、检查结果或工作流环境。

服务器副本继续按用户要求单独部署与验证。只更新文档时不重复部署应用；向上游提交 PR 不会代替任一环境的线上发布。
