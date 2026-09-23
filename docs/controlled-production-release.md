# Web Radar 受控生产发布

生产入口是 `.github/workflows/production-release.yml` 的手动 dispatch。普通 push、PR 或本地 `npm run release:production` 不会部署。此工作流发布 Web Radar 主 Worker 和对应静态文件，不部署 Product Radar、建站服务或客户网站，不执行 D1 迁移。

## 发布前提和执行过程

1. 将经过评审的代码合入 `DomFafa/web-radar:codex/web-radar-v1`，保留集成历史。最低祖先包含 `0633b8554e0c080f133237b5d4db36cfcec286f8`，避免退回缺少产品身份和冻结合同的版本。
2. 在上述发布分支上 dispatch，填写完整的 Web Radar SHA 和兼容的 `DomFafa/product-radar:main` SHA。两个 SHA 都必须仍为实时远端分支 tip，且检出目录干净。不得填写分支名、短 SHA 或另一开发分支的提交。
3. 构建阶段不读取生产 Cloudflare 凭证。检查 Web Radar 同 SHA 的 `check.yml`（local、browser、template-browser、render-quality）和 `radar-integration.yml`（web-radar-integration），以及 Product Radar 同 SHA 的 product-radar-integration。只接受正确仓库、分支、工作流的最新 push run 和最新一次 job 结果；pending、skipped、neutral、失败或旧 SHA 都拒绝。随后针对精确两仓提交重新运行真实路由跨仓 gate，要求新产生的 summary，不能用普通 Vitest 的 skipped 结果替代。
4. 只构建一次：Vite 产物、Wrangler dry-run 产物、生产配置和 gate 证据封装为不可变的 GitHub Actions artifact。清单记录完整源码对和每个文件的 SHA-256；清单本身的摘要经 build job output 传给 deploy job，不从下载产物自报值取信。
5. production environment 阶段下载同一次工作流的确切 artifact ID，拒绝缺少、额外、符号链接或哈希不同的文件。再次核对两仓源 SHA、实时 tip、检查状态及配置；在上传前拒绝会移除现有非文本绑定的配置，包括邮件队列和浏览器绑定。生产状态在 preflight 中变化也会中止。
6. Wrangler 使用 `--no-bundle --keep-vars --strict` 部署封存的 Worker 和静态文件。它不会在部署阶段重新编译。部署 message 写入完整源码 SHA 与清单摘要，tag 写入短 SHA。再次读取生产 Worker 字节、部署 ID/100% 流量、配置/非静态绑定摘要、健康接口和全部静态文件，核对通过后才记录 `verified:true`。

工作流以 `web-radar-production` concurrency 串行运行。发布后验证失败会使 job 失败并保留安全摘要，**不会自动重试部署或自动回滚**。Wrangler 失败时仅保留数字 Cloudflare 错误码；原始日志留在临时 runner，不公开其中的配置或凭据。静态文件比对覆盖本次上传的文件，不能替代登录后的浏览器交互或模板视觉验收。保留每次 release artifact 和成功结果；部署结果只含 SHA、状态、摘要和公开文件路径，不上传凭证、配置内容或 Wrangler 原始日志。

## 仓库拥有者仍需配置的边界

代码已将检查接入该工作流的实际部署路径，但不能单靠仓库代码收回现有权限。2026-09-23 已配置仅允许 `codex/web-radar-v1` 的 production environment、部署启用变量、短期 Cloudflare Secret 和两仓只读 GitHub Secret；首次 dispatch 的构建通过，部署失败且未生成新的线上 Worker 版本。随后发现同事 PR #8 已直接部署，必须先整合现网功能再发布。实际成功部署仍以对应工作流的 `verified:true` 证据为准。

- 创建/检查 `production` environment，限制 deployment branch 为 `codex/web-radar-v1`，配置所需审批及禁止管理员绕过。只有确认配置完成后，将 environment variable `PRODUCTION_RELEASE_ENABLED` 设为 `true`；缺失时脚本明确失败，不会默认为允许。
- 将适当范围的 `CLOUDFLARE_API_TOKEN` 放入该 environment 的 secret。当前短期令牌包含目标账号的 Workers Scripts Write、Queues Write，以及仅 `web-radar.net` 的 Zone Read 和 Workers Routes Read/Write；有效期到 2026-10-01。账号级权限不能描述成仅可修改一个 Worker。到期前由拥有者替换受控发布凭据；移除/轮换仍在本地、旧 CI 或其他入口可用的生产写入凭证，并限制 Cloudflare 成员部署权限，否则仍能直接运行 Wrangler/API 绕过本入口。此文不宣称这些凭证已收口。
- 跨私有仓读取需要 `RADAR_READ_TOKEN`（只读 Contents + Actions，两仓范围），可作为 repository secret 供构建使用；公开访问足够时可以不配。该 token 不应具备生产部署或 Git 写入权限。
- 分支规则必须要求 PR、CODEOWNER 和上述 checks，并关闭适当角色的 bypass。此前 owner push 的实际输出证明 owner 可绕过 PR/必需检查；本地脚本和工作流无法撤销该权限。能改发布工作流、政策或环境规则的管理员同样仍能改变保护。
- concurrency 只能串行本仓使用同一 group 的工作流，不能对抗另一仓或持有生产凭证的直接部署。preflight 和发布后校验可发现部分竞态，不能提供 Cloudflare 之外入口的全局锁。

## PR #8 邮件功能交接限制

本次保留已在线上的邮件、网站留言、Dashboard 和 8 个新增模板；没有触发真实邮件发送或网站表单提交。Mailchimp Marketing 的联系人关联和订阅者摘要已修正，并增加重放保护。当前 Marketing 仅在本次队列交付包含活动全部待发收件人时发送；若队列拆成多个批次，会明确失败并建议使用 Transactional 服务商，不能视为完整的大批量 Marketing 支持。已有远端活动但发送结果不明时显示待核实，禁止自动重发。相关验证使用本地数据库和网络 mock。

## 回退与兼容

保留旧合同、renderer、preview runtime 和静态依赖。若新草稿已固定新合同，不能简单重发缺少这些版本的旧 Worker。应先检查兼容性，用保留已发布合同的前向修复提交走同一发布流程；不把新合同快照原地改回旧语义。

## 本地验证和官方依据

`node --test scripts/verify-release-source.test.mjs scripts/release-production.test.mjs` 覆盖来源、工作流结果和产物篡改的拒绝路径；本地 Wrangler `--dry-run --no-bundle` 可以核对封存部署输入，不执行网络写入。完整线上 dispatch 需在上述配置及发布授权到位后串行执行；本地测试通过不能证明生产环境策略已经生效。

参数与 API 按 [Cloudflare Wrangler deploy](https://developers.cloudflare.com/workers/wrangler/commands/workers/#deploy)、[Worker 下载 API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/get/)、[GitHub workflow runs](https://docs.github.com/en/rest/actions/workflow-runs)、[workflow jobs](https://docs.github.com/en/rest/actions/workflow-jobs) 和 [不可变 workflow artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data) 核对。仓库锁定的 Wrangler 版本也通过本地 `deploy --help` 验证了实际支持的参数。
