# 五套产品原生模板候选与统一验收

状态：实现与验收进行中，尚未宣称部署或客户验收完成。

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

待完成：候选发布；五份真实材料生成；图文 QA；确认/提交及客户可浏览验收入口。
