# 五套产品原生模板候选与统一验收

状态：候选已上线并完成真实初次生成；视觉修正及完整项目预览验收进行中。

用户要求提炼 Pawfect 经验，将 Auravell、Careflow、Toorun、Lumi、Mello 重新规划成实际产品网站。用户确认五套使用同一组三款产品。效果优先，场景按区块独立生成，不强行复用。

- 实现工作树：`/Users/dom/.codex/worktrees/website-materials-system-3872/web-radar`
- 起点：`8a722981e2b35e98383808cb3bcb4bb69e97618e`
- 证据：`/Users/dom/Desktop/five-template-acceptance-20261002/`
- 已核对同三款产品的 17 张原素材，保留规格冲突和建议状态。
- 新合同可按显式版本读取，现有默认和历史 renderer 保留。
- Product Radar 既有 `templateRevision` 支持足够，无需新增跨库协议。

工程方法与逐块规划见 `../product-website-template-playbook.md`。

已完成验证：

- `npm run check`：类型检查、111 文件 / 2366 项测试、生产构建通过。
- 全量检查后仅修正 Auravell 手机场景图片的 `height:auto`，避免图片挤出卡片说明；单列目标浏览器复查，最终 `npm run build` 通过。
- Lumi 的桌面/390/320 宽度共 21 路由检查通过；共享交互与私有预览边界 10 项通过。
- Toorun/Mello 桌面/手机共 28 项检查通过，包括预览链接拦截环境下的场景按钮及键盘操作。
- Auravell/Careflow 首轮 20 页浏览器矩阵及最后 8 项目标视觉复查通过；修正首屏叠层、场景说明和表单底色。
- 上述使用真实产品原素材作为排版替身，不能视为独立场景生成与在线链路验收。
- 用户授权将 Product Radar 的固定 B 端提示词问题交由「体验 Product Radar 七项功能」聊天修改并发布；两边不并发操作 Product Radar 发布。

候选发布：源 `a466d9ec4cf0ab5dc5f659160c65ac686e1ead5b`，Worker `45587732-2b19-4737-8817-d7d3f5c88cd0`，部署 `3c7f8d29-b987-4fa8-9069-0c3a7cc9598a`。线上 Worker 字节与封存制品一致；391 项静态资源、5 个候选合同及 25 个预览通过，旧默认保持。下载/连接超时与原模板 HTML 的 Cloudflare 规范化跳转只做只读恢复，没有重复上传或构建。

真实初次生成已全部 ready：56 张独立新场景、每套 3 张原主图，263 条文字。原始回执与图像 SHA 记录在证据目录的 `production/`。视觉核对发现部分水果套装数量增加或原品牌字样缺失，按图槽定点修正，旧回执保留在 `repairs/`，不得用本地改图替代线上资料。

Auravell 实际首屏场景选中 LOOF，但原图卡片读取了产品数组首项，导致水果图卡和 LOOF 标签错配。修正卡片使用现有 `home-hero` 绑定产品；没有改合同或资料。新增回归覆盖 primaryProductId 与 hero 不一致，先失败后通过。此为尚在验收中的候选渲染纠错，历史 `.1` 不受影响。

线上实际导航另发现已归档预览中的询盘产品选择未跟随详情页。归档 contact 只存一份主产品页面，原预览包装未调整 select；现只对有效 productId 更新返回 HTML 的 selected，不修改归档，也不解禁私有预览提交。Web Radar 自身预览请求同时为 contact 携带产品 ID。归档 A/请求 B、未知产品、禁用边界与直接调用者共 107 项测试通过。

Product Radar 的受众修正已上线；后续通用场景规则由该库 PR #70 上线至 `239373bfc0f7a40de7df4924678b46aa569f1b33`，覆盖完整套装数量、原品牌与单图构图，并把已保存产品事实传入 legacy 生图及修图。受控合同测试依赖该库指定的 Web Radar 官方分支，未混称与当前候选分支相同。

待完成：候选渲染与预览纠错发布；Mello 修后 QA；剩余导入与五份项目预览最终响应式验收。
