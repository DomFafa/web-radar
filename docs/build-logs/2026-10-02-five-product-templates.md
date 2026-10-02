# 五套产品原生模板候选与统一验收

状态：五套候选与跨库询盘修复已上线。真实素材 QA、资料导入、70 项桌面/手机版面检查、五套截图复核及 30 项真实询盘导航检查全部通过，待用户视觉验收。历史默认版本未切换，五个验收网站均未发布。

本次将 Pawfect 的资料生产经验用于 Auravell、Careflow、Toorun、Lumi、Mello，按各模板页面重新规划产品展示。五套统一使用 Senseng 十二件水果套装、LOOF 净化器设计和紫色羊玩偶三款已保存产品；核对 17 张原素材，缺失或冲突规格继续留空，不推断实物认证、功效或生产能力。区块场景独立生成，原主图保持原始字节。规划方法沿用 [产品网站模板 playbook](../product-website-template-playbook.md)，本文记录交付与验证结果。

- 实现工作树：`/Users/dom/.codex/worktrees/website-materials-system-3872/web-radar`。
- 本任务起点：`8a722981e2b35e98383808cb3bcb4bb69e97618e`。
- 私有证据目录：`/Users/dom/Desktop/five-template-acceptance-20261002/`。项目 ID、素材 ID、私有预览链接和原回执保存在该目录，不作为公共网站发布记录。
- 五套新合同均使用 `guideRevision=2026-10-02.2` 和 `2026-10-02.<templateId>-materials.2`，通过既有显式 `templateRevision` 选择。未新增跨库 API 字段，旧默认合同和历史 renderer 保留。

候选基线验证完成了 `npm run check`：类型检查、111 个测试文件 / 2366 项测试、生产构建通过。随后 Auravell 手机图片 `height:auto` 的局部调整经过目标浏览器复查及构建。Lumi 1440/390/320 的 21 路由检查与共享交互/私有预览边界 10 项、Toorun/Mello 的桌面/手机 28 项、Auravell/Careflow 首轮 20 页及最后 8 项视觉复查分别通过。这些是本地 fixture 与排版验证，部分区块以原产品照片代替生成场景，不能作为真实在线生成或最终客户界面验收。

真实线上生产完成 56 个独立新场景图位、15 个保留原主图位和 263 项文案绑定。逐图原像素对照与文案事实核对发现水果件数、原包装品牌以及 Mello 三图误生成拼图的问题，合计执行 19 次明确授权的定点修图。修复还包括将一张净化器场景改为稳定台面/低柜承托。每次仅更改指定素材，按最新 revision 执行一次 CAS 请求；完整保存修前、修后、耗时和 SHA，对账其他素材、产品源、合同与文案不变。修图替换原场景输出，不增加最终导入图位，也没有用本地改图代替线上产物。

| 模板 | 最终材料 revision | 新场景图位 | 保留原主图 | 文案绑定 | 定点修图 | 接收素材 |
|---|---:|---:|---:|---:|---:|---:|
| Auravell | 3 | 12 | 3 | 52 | 2 | 15/15 |
| Careflow | 3 | 12 | 3 | 47 | 2 | 15/15 |
| Toorun | 7 | 12 | 3 | 67 | 5 | 15/15 |
| Lumi | 4 | 10 | 3 | 45 | 3 | 13/13 |
| Mello | 8 | 10 | 3 | 52 | 7 | 13/13 |
| 合计 | — | 56 | 15 | 263 | 19 | 71/71 |

五套修后材料 QA 均通过。确认前再次 GET 核对最终快照，并下载已修素材核对真实 SHA；确认冻结版本后执行 submit 和 submission-status。五份初次回执均为 `accepted`、`entry=prepared-materials`、`projectVersion=1`、`receivedMedia=totalMedia`，总计 71/71，且 `autoPublish=false`。后续 Toorun 仅通过既有 reopen → confirm → submit 更新同一私有项目到 version 2 / materials revision 7；15 张媒体 SHA、全部文案和产品事实保持一致，没有重新生图，旧 version 1 归档保留。材料 QA、导入接收、浏览器终验和用户确认在 `production/acceptance-status.json` 中分别记录，私有预览链接见 `production/preview-links.json` 与 `production/preview-links.md`。

实际素材暴露出两个必要的 Web Radar 修正。Auravell 首屏场景绑定 LOOF，而原主图卡片读取产品数组首项，导致图片和标签错配；卡片现按已有 `home-hero` 绑定选产品，新增先失败后通过的回归。归档预览只有一份 contact 页面，详情询盘选品未随有效 productId 更新；现只调整返回 HTML 的 selected，Web Radar 自身预览请求同时传递 contact 产品 ID，不修改原归档，不解禁私有预览表单提交。修正范围内的 27 项 hero/native 测试、两项桌面/手机真实素材 hero 检查，以及最终 107 项预览直接调用者测试、类型检查和构建通过。基线全量 2366 项结果仅归属于原候选基线，不宣称在最终修正版本上重复执行过全量套件。准确验证范围和输入连续性见 `release-hero-fix/validation-receipt.preview.json`。

此前 Web Radar 绑定与预览修正已发布并验证：源 `0382b29fc4514f9cafcd6b35c965b01fb5a0d90d`，部署 `25c59aa4-2a02-413e-bc92-cb415ed70cf7`，Worker `1ccbdefe-0ecf-4d50-a85e-ba9929218632` 承担 100% 流量。下载的 Worker 与封存制品字节一致；本次 12 项静态资源新检查全部一致，其余资源按已验证基线与清单连续性继承；五套候选合同与 25 个服务端预览通过，旧默认保持，settings/queues 保留，health 200。最终回执为 `release-hero-fix/verification-resumed.json`，`deploy.log` 末项 `verified=true`。这些部署与接口检查不替代五个真实项目的浏览器终验。

Product Radar 的固定 B 端语气按用户指定交由另一聊天修改并发布。后续通用场景规则通过 PR #70 上线至 `239373bfc0f7a40de7df4924678b46aa569f1b33`，补充完整套装数量、原品牌保留、单图构图，并将已保存产品事实带入旧生图及修图路径。Mello 七张修图在确认该版本真实上线后执行。受控跨库合同测试使用发布入口指定的 Web Radar 官方源，不混称与本次候选分支相同。

浏览器过程曾反复触发用户 Chrome 远程调试授权，随后停止新建远程调试连接和重连。最后的受控材料请求仅复用现有代理 HTTP 连接，各批次共享自己的后台页，完成即关闭；最终界面检查转为隔离浏览器方案。测试不得提交真实询盘或邮件，私有预览禁用提交边界继续保留。连接或截图失败不当作产品验收结论，已完成的材料和部署回执也不因浏览器工具失败重复生成或发布。

最终逐页看图还发现 Toorun 拼贴后排的产品名称被前排照片遮挡。仅在候选 renderer 内保留照片位置与旋转，把完整产品链接移到下方正常文流，并用编号对应每张图片。真实素材的 1/2/3 场景 × 1440/768/390 宽度九项检查通过，36 条产品链接逐字符无遮挡、点击绑定正确，类型检查、5 项目标测试和单次构建通过。未新增合同、生成任务或共用样式变化。

此呈现修正已发布：源 `4415b753706047bae6c1a600d73a00530ee47b5e`，部署 `7972b93b-067f-401b-8259-d51dd76cdf39`，Worker `ba68ffc3-ec31-4017-9a6b-f28c2003488c`，100% 流量。完整 Worker 字节一致；本次 index 重新 GET、390 项既有精确静态证据和 1230 项清单连续性分别记录。五份候选/默认合同、25 个预览、绑定/队列和健康状态全部通过。上传 24.275 秒、只读验证 28.845 秒，无重复发布或构建，见 `release-toorun-caption/release-execution.json`。

最终五个真实私有项目各 14 项桌面/手机版面检查与离线截图复核通过，总计 70 项；Toorun 使用更新后的 version 2 / materials revision 7，另补 2 项真实桌面/手机编号说明检查，10 条产品链接完整可见且绑定正确。原图完整显示、素材载入、全部产品详情、导航、移动菜单、FAQ 和 Mello 场景按钮/键盘分别按模板实际功能验证。询盘项单独记录，不把 layout-only 的通过写成整体交互通过。

Product Radar contact 请求漏传 productId 的修复 `2833f8554692558f832c2cc2da1ecdae210dc9af` 经 66 项目标回归和类型检查，通过 PR #71 合并为 `5d0482483844fafdc682b3bd83a3f4b0288f99d1`。用户完成正常 GitHub CLI 授权后，精确 main 的 CI run `37032091992` 通过，唯一一次受控发布于北京时间 2026-10-03 00:18:18 完成。网络使用 macOS 已配置的 HTTP/HTTPS 代理，未修改全局设置或提取浏览器 GitHub 凭据。

该 Product Radar 发布完成 4810 项测试（16 项显式跳过）、37 项发布护栏、跨库合同验证、类型检查和构建；归档解包后按完整清单验证。实际 ECS current 为 `20261002-161809-5d0482483844-cb1e1558`，旧版本保留；两项服务和内外健康检查正常，本机 90 个静态文件、公网 HTML/主 JS/CSS 均与制品哈希一致。受控入口全程 277.397 秒，主要耗时为完整 TypeScript 回归 195.416 秒；跨库验证 13.587 秒、类型检查与构建 4.691 秒、归档验证 1.504 秒、上传 9.657 秒、激活 12.537 秒。压缩包装未单独计时。证据见 `/Users/dom/Desktop/product-radar-preview-inquiry-release-20261003-5d04824/` 与 `/Users/dom/Desktop/product-radar-preview-inquiry-20261002/public-verification.json`。回执内的 Web Radar `f526591a` 仅是受控入口使用的上游集成测试源，线上候选 Worker 仍按本任务 `4415b753` 的独立发布回执归因。

GitHub 主任务沿既有 `DomFafa/web-radar` 分支和 PR #18 更新，未自动合并。按仓库约定向 `wuyueerhao/web-radar` 分支推送尝试一次被远端 permission denied，未改权限、未强推；该 fork 同步限制另存 `fork-push-status.json`，不混称已完成同步。

验收证据位于各 `production/<templateId>/browser-final/layout-only/report.json` 和 `final-visual-report.{md,json}`；Toorun 的补采为 `collage-captions-live.json`，仅验证名称，完整图片以 14 项主报告为准。Mello 初次按钮截图落在 CSS 颜色过渡中间帧，稳定补图与计算样式核对后不视为应用缺陷；数字小标手机换行仅作非阻断外观观察。Auravell 手机首屏浮动导航部分覆盖氛围场景，按原模板风格保留；原主图卡片完整显示、产品绑定正确，场景裁切与主图截断分别判断。

Product Radar `5d048248` 上线后，五套真实项目各完成三产品 × 1440/390 两种视口的询盘导航，总计 30/30 通过。每次通过目录进入真实详情、点击询盘按钮，校验 GET 的 productId/expectedVersion、返回项目/版本/产品以及表单实际选中项，均与点击产品一致；询盘提交继续禁用，未发送真实询盘。五份 `browser-final/inquiry-only/report.json` 均为 `passed=true`，无页面异常、交互失败或版本错配。70 项排版证据保持原范围，未因一处请求参数修复重复整套版面检查、生成或部署。

首轮复测发现 Playwright 自带 `serviceWorkers: block` 在不带 allow-same-origin 的沙箱页面读取 navigator.serviceWorker 时抛出异常。通过无联网的最小复现确认后，仅把测试脚本改为带访问判断的注册拦截；保留全部业务断言、页面异常检查和 API 写请求阻止。Auravell 首轮一次点击未发出详情请求，独立窄诊断和随后完整六项均成功，未宣称已证明字体或应用根因，也未据此修改网站。首次失败原件、哈希、最小复现与窄诊断均保留在 `repairs/inquiry-tooling/`。最终测试脚本 SHA256 为 `ac6bd0e0ffdff25029fae956565e64f4b9b0d89111163a9ae56d80fc9c89d7d0`，所有隔离测试浏览器完成即关闭。

剩余事项仅为用户确认五套风格效果。五个客户网站保持私有、未发布；Web Radar PR #18 按现有仓库约定待手动合并。另一聊天后续获授权的产品辅图与六卡片模板选择改进在独立分支处理，不计入本次上线与验收结果。

2026-10-03 PR #18 的 `template-browser` 在品牌色脚本发现八项失败，均为 Pawfect 产品资料版 contact 卡片：脚本要求品牌浅色，已验收 renderer 的卡片保留白底与中性边框。本地按同样八种组合复现后，仅更新测试期望，范围限定 materials revision 2/3，逐色检查白底与边框、跨色检查实际卡片样式不变；其他模板继续检查品牌表面变化。按钮、提交、文字对比度、导航、焦点、图片身份和浏览器异常断言保留。最终 Pawfect 原生/资料版、首页/联系页、公开/预览、桌面/手机、红/黄共 32 项通过；原失败日志与修后结果见私有证据目录 `ci-brand-card-fix/`。完整 PR 工作流在推送后继续验证；本次仅修改测试和记录，不改变页面或部署应用。
