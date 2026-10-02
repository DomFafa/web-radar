# 五套模板动效、原生导航与集合首屏

状态：实现、本地行为验证与六封面目检完成，跨库联合冻结进行中；本记录不宣称新版已部署或真实线上生图已通过。

用户要求后五套学习已认可的 Pawfect 动效经验，同时保留每套自己的导航和布局；公开选择缩略图不再共用台灯。红框内 Auravell、Careflow、Lumi、Mello 的首屏需要完整产品集合 Banner。修改从 `0e8feb1bf0983e2b655ce8336729d9e10e29a18a` 开始，位于 `codex/website-materials-system`。

## 版本与生产要求

五套新版显式版本为 `guideRevision=2026-10-03.1`、`contractRevision=2026-10-03.<templateId>-materials.3`，renderer 为 `2026-10-03.<templateId>-product-native.2`。Pawfect、原行业默认和已发布产品版 `.2` 保留。冻结回归比较五份旧合同、35 个旧页面和两条旧预览运行脚本的 SHA，不用新快照替代历史预期。

四个集合位置分别为 Auravell/Careflow `home-hero`、Lumi/Mello `hero-scene`，`role=collection`、`productScope=all-products`、`repeat=once`、`min=max=1`。生成必须使用全部输入产品的确认主图；绑定保留全部 `depictedProductIds`，没有单个 `productId`。独立场景和原主图不能充当集合图，文字、导航和原图概览卡仍由 HTML 渲染。Mello 新版首屏为 16:9，旧版 4:3 不变。Toorun 保留四幅单品图框。

规则位于 `product-native-enhanced-materials.ts`；实际渲染仍消费各主题原生 `product-renderer.ts`。新能力增加 `image.collection.v1`，保留已有生成/绑定能力、材料协议及产品事实语义。Product Radar selector 必须显式固定这五份新版；WR 默认目录继续旧版本，不能把只部署代码当作选择卡已经启用。

## 导航与动效

| 模板 | 导航 | 动效主线 |
|---|---|---|
| Auravell | 浮动衬线标识、编辑式链接、轻量询盘 | 飞入、滑幕、折页 |
| Careflow | 宽幅浅蓝导航、真实产品下拉、方圆角询盘 | 轨道滑入、抽卡、中心展开 |
| Toorun | 居中标识、彩色箭头、原生移动折叠菜单 | 弹跳、扇形、拼贴 |
| Lumi | 细线分隔、编号产品目录、方形描边询盘 | 纵深、分屏、中心展开 |
| Mello | 信息条、居中大标识、手写装饰和错位询盘 | 落章、票据、旋转落下 |

首页、目录、About、联系和详情各自编排，共 25 种效果组合。所有元素首次进入视口播放一次，不因回滚或 resize 重播；导航不参与飞入。内容初态在 head 首帧前设置，动画结束恢复模板原有 CSS transform。键盘聚焦立即显现、减少动态效果直接可读，缺少运行脚本超时恢复且晚到脚本不再次隐藏内容。滑幕终点使用连续可插值遮罩，结束再清理，而不是离散切到 `none`。

公开页、WR 自身私有预览和项目服务预览共享固定序列化源码。项目服务类型增加可选 `prepareRuntime`，helper 是 `projectPreviewPrepareForDraft`。另一个聊天负责 `domain-service.ts` 输出此字段，以及 Product Radar 的 optional schema 和清理客户脚本后在 head 插入可信初态源码；不执行客户 HTML 的原脚本。旧响应缺省字段保持兼容。

## 边界与联合发布

本聊天拥有模板、网站材料要求、动效、对应预览 helper、回归与说明。另一聊天拥有 WR 调度归档和发布性能文件 `website-results.ts`、`domain-service.ts`，以及 PR 的选择卡、预览接线和 Quick Mode 文件。EDM、站内信和其他模式不在本轮模板修改范围。没有共享文件的交叉编辑。

另一聊天的性能候选为 `d65f65f8a75d4d1f144a59dbd5952ef7f65f6abc`。待本任务最终提交后由对方合并完整候选、接入它拥有的 response、替换六张缩略图并固定新版合同，再封存联合版本走受控发布。未重复制作或上传旧封面，未独立部署。

## 本地验证与范围

8 个目标测试文件的基线 202 项通过，涵盖新版渲染/API/集合绑定/原生材料/动效/材料预览/typed 集成/历史兼容。后续两选择器和手机首屏修正后，受影响的 4 个文件 74 项再通过；未重复无关测试。五套旧合同、35 页面与旧预览脚本 SHA 均保持；类型检查通过。序列化源码 `build-product-motion.mjs --check` 和 diff 检查通过。

隔离 Chromium 基线实测 5 模板 × 5 页面 × 1440/390 × 公开/strict nonce 私有预览，总计 100/100，通过首次进入、往返滚动、resize、原 CSS transform、减少动态效果与页面异常检查；其中 94 项实际执行阈值防闪现，71 项实际执行动画中控件 focus。另有 5 项无 JS/缺失 runtime 超时/晚到不再隐藏专项通过。几何不适用项记录范围，不伪造控件或下屏内容。基线与其源码分别保存在 `artifacts/product-motion/base-100-results.json`、`base-100-motion-source.ts`，不把后续窄复测冒充全量。

独立复核发现 Careflow About 照片组、Toorun 首页介绍段落的两处选择器未命中真实 DOM。补真实 renderer 消费者回归，先复现失败，再修正确切选择器；动效单元测试 5/5 通过。修后两页 × 两种宽度 × 两种展示，共 8 项全部通过，证据为 `careflow-about-consumer-results.json` 与 `toorun-home-consumer-results.json`。最终远端 CI 按最终 SHA 再执行完整 100 项。

最小 API 回归检查五套 default/v2/v3 的 revision、hash、ETag 和显式 demo，10/10 通过。导航额外完成 14 个真实桌面/手机/断点组合、97 项检查，包括可见询盘、移动菜单、产品下拉实际详情跳转、Escape 与外部点击；零异常、零断图、零横向溢出。证据为 `artifacts/product-native-enhanced/navigation-report.json`。CI 新增序列化一致性检查与 100 项动效浏览器检查，并保留既有检查。

六封面目视检查额外发现两个桌面集合主体被文字卡部分遮挡，以及 Auravell、Careflow、Lumi 的旧手机容器裁掉集合成员。桌面问题按原产品身份重新构图；仅在新版 home 调整三套手机媒体比例为其宽幅合同，Auravell 留出浮动导航空间，其余图槽与旧版不变。Mello 使用等比例的更高宽屏真实截图记录首屏集合，不拉伸或修改页面样式。移动照片检查使用实际完整图片，不能把手机首屏折线下的图片误判为裁切或合格。

三套手机首屏 CSS 修后，三页 × 390 × 公开/私有的 6 项动效回归全部通过，实际执行防闪现阈值与 focus；回执单独保存在 `artifacts/product-motion/three-collection-mobile-results.json`。不把动效行为通过替代集合成员的目视验收。

正式六桌面、六手机截图运行无页面异常、断图或横向溢出；root 亲自复核总览与三张受影响手机图，确认四个桌面集合完整、手机成员没有被裁失、导航和文字卡不遮产品。所有正式桌面输出为 1440×900，按实际原生页面等比例采样：Auravell/Careflow/Pawfect 1440×900@1、Toorun 1600×1000@0.9、Lumi 1920×1200@0.75、Mello 2400×1500@0.6。未拉伸截图或为截图覆写页面样式。Mello 手机集合在折线下，按完整页面另检。第一轮不合格截图与报告保存在交付目录 `initial-render/`。

公开封面素材在 `/Users/dom/Desktop/web-radar-template-covers-v2-20261003/`，是单独生成的无品牌演示产品，包含 18 张单品图、四张独立集合图和 Toorun 一张额外单品场景。记录每张提示词、原始输出、引用链、SHA 与目视检查；网页版本仅转 WebP，不裁切。它们不能替代客户原产品或实际在线生成验收。上一轮三款真实资料的 `.2` 线上证据继续属于 `.2`，不归因于本轮 `.3`。
