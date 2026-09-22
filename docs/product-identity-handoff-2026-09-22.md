# 产品身份与均衡套图交接

产品在规划时生成同一份内部身份，后续产品系列、套图、网站模板沿用。前台不增加属性表单；没有新增独立的图片识别；已停用 JEV 自动调度和页面自动轮询，保留历史记录接口。历史产品只在选用时根据已存资料补齐一次，不扫全库、不重做 Ocean 那次结果。

## 数量与顺序

默认整套 5 张，最多 10 张，均包含第 1 张原主图。前 5 张是完整小套，6–10 张是扩展。没有局部特写、放大圈或细节拼图。未知包装/结构不虚构；无包装产品在第 9 张使用完整陈列。场景不加入未确认的使用性能或配件。

| 位置 | 内容 |
| --- | --- |
| 1 | 保留原主图，不重复收费生成 |
| 2 | 完整正面主体，通常白底 |
| 3 | 类目适合的第二种完整展示 |
| 4 | 主要使用/摆放场景 |
| 5 | 第二种环境场景 |
| 6 | 类目适合的第三种完整展示 |
| 7 | 完整主体突出卖点，禁止局部放大 |
| 8 | 使用位置或静态摆放场景 |
| 9 | 产品与原包装；无包装则完整陈列 |
| 10 | 网站横向构图，完整产品加环境留白 |

下面由代码中的 19 类规则生成。第 1、7、8、9、10 张按上表；套装/配件优先替换第 3、6 张为完整成员/配件布局。来源仅见封闭包装时，全程保留封闭状态，不猜内部。

| 类目 | 第 2 张 | 第 3 张 | 第 4 张场景 | 第 5 张场景 | 第 6 张 |
| --- | --- | --- | --- | --- | --- |
| 通用商品 | 产品整体 | 完整主体陈列 | Place the complete subject in a neutral everyday tabletop. Keep it fully visible; no invented features or included accessories. | Use a clean retail display shelf, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 完整主体展示 |
| 玩具与公仔 | 产品正面（不带包装） | 产品侧面（不带包装） | Place the complete subject in a tidy playroom display shelf. Keep it fully visible; no invented features or included accessories. | Use a warm home study desk, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 产品背面（不带包装） |
| 毛绒与靠垫 | 产品正面（不带包装） | 产品侧面（不带包装） | Place the complete subject in a clean sofa corner. Keep it fully visible; no invented features or included accessories. | Use a bedroom reading chair, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 产品背面（不带包装） |
| 服装与纺织品 | 产品整体 | 服装完整平铺 | Place the complete subject in a garment display rail or flat-lay wardrobe setting, without a model. Keep it fully visible; no invented features or included accessories. | Use a boutique clothing display without a model, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 服装悬挂展示 |
| 鞋靴 | 产品整体 | 鞋款完整陈列 | Place the complete subject in a clean entryway shoe display. Keep it fully visible; no invented features or included accessories. | Use a sports-shop display shelf, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 鞋款展台展示 |
| 箱包 | 产品整体 | 箱包立放展示 | Place the complete subject in a travel packing table with the bag closed. Keep it fully visible; no invented features or included accessories. | Use a tidy hotel luggage bench, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 箱包肩带平铺 |
| 珠宝与腕表 | 产品整体 | 饰品完整平铺 | Place the complete subject in a restrained jewelry display stand. Keep it fully visible; no invented features or included accessories. | Use a dressing-table display tray, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 饰品支架展示 |
| 家居装饰 | 产品整体 | 摆件整体轮廓 | Place the complete subject in a styled living-room side table. Keep it fully visible; no invented features or included accessories. | Use a bright hallway console, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 摆件展台展示 |
| 家具与收纳 | 产品整体 | 家具整体比例 | Place the complete subject in a proportionate home interior; keep doors and drawers as shown. Keep it fully visible; no invented features or included accessories. | Use a quiet office reading area, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 家具完整占地展示 |
| 厨具与餐具 | 产品整体 | 厨具整体形态 | Place the complete subject in a clean kitchen counter, without heat or unverified performance demonstrations. Keep it fully visible; no invented features or included accessories. | Use a neatly arranged dining table, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 餐厨用品平铺 |
| 杯壶与饮具 | 产品整体 | 杯壶壶身与把手 | Place the complete subject in a clean desk or picnic tabletop, keeping the lid as shown. Keep it fully visible; no invented features or included accessories. | Use a shaded picnic table, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 杯壶整体与杯口 |
| 美妆与个护 | 产品整体 | 容器与标签整体 | Place the complete subject in a clean vanity shelf; no before-and-after, skin or efficacy claims. Keep it fully visible; no invented features or included accessories. | Use a boutique personal-care display shelf, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 个护容器完整陈列 |
| 电子与小家电 | 产品整体 | 设备与操作面整体 | Place the complete subject in a tidy workspace, without inventing powered-on behavior or cables. Keep it fully visible; no invented features or included accessories. | Use a home media cabinet, without inventing powered-on behavior, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 设备完整摆放 |
| 工具与设备 | 产品整体 | 工具完整轮廓 | Place the complete subject in a clean workshop bench, at rest; no hidden mechanisms or invented assembly. Keep it fully visible; no invented features or included accessories. | Use an orderly tool-shop display, at rest, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 工具完整平铺 |
| 运动与户外 | 产品整体 | 户外用品整体形态 | Place the complete subject in a calm outdoor rest area, without unsupported load or safety demonstrations. Keep it fully visible; no invented features or included accessories. | Use a sports-store display with no performance demonstration, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 户外用品完整平铺 |
| 宠物用品 | 产品整体 | 宠物用品整体形态 | Place the complete subject in a tidy pet-care corner, without adding animals or size claims. Keep it fully visible; no invented features or included accessories. | Use a pet-store display without animals, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 宠物用品完整陈列 |
| 文具与办公 | 产品整体 | 文具完整平铺 | Place the complete subject in an uncluttered study desk; do not invent internal pages. Keep it fully visible; no invented features or included accessories. | Use an office supply shelf, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 文具立放展示 |
| 海报、贴纸与平面商品 | 产品整体 | 完整图案排布 | Place the complete subject in a simple display of the same artwork, without altering text or graphics. Keep it fully visible; no invented features or included accessories. | Use a studio display ledge preserving the same artwork, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 图案使用展示 |
| 食品与包装商品 | 产品整体 | 食品包装整体标签 | Place the complete subject in a clean retail or pantry shelf; do not expose unseen contents, invent ingredients or show nutrition claims. Keep it fully visible; no invented features or included accessories. | Use a grocery display with the existing sealed goods, with a meaningfully different physical setting and arrangement. Show the entire same subject. | 食品商品完整陈列 |

## 身份、版本与失效规则

- `src/shared/product-identity.ts` 是两仓字节相同的 v1 字段定义。字段包括类目、单品/套装/配件、件数、包装、主体可见范围、形态、部件、颜色及关键外观。材料/尺寸等继续使用产品已有字段，不重复堆入标签。
- 身份存进现有 `provenance_json.productIdentity`，产品 ID 不变；主图接受/恢复时同一条 SQL 更新图片、文案、身份和 `image_revision`；保留旧图的历史重试入口也推进版本，失败保留原资料。旧版本保持可恢复，过期候选不能覆盖新版本。
- 图片编辑必须携带修改要求；沿用已有候选文案复核同时更新身份，不再新加一轮识别。直接编辑主图的路径必须完成资料同步才交付候选。
- 组只表示首次生成同一批次；产品系列表示后续变体。标准系列方向以程序拦截未受影响字段漂移；明确的自定义要求允许改变相应属性。
- 新主图可创建新版套图，旧套图保留在历史；旧图片不会混入当前产品的建站素材。已经保存的网站继续固定原合同、素材与渲染依赖，不自动替客户网站发布。

## 长度、成本与失败处理

身份字段分别有限长，整体 JSON 最多 1,800 字符且 4,096 UTF-8 字节；编译进提示词的片段最多 2,000 字符，完整生图请求最多 20,000 字符。超限明确失败，不悄悄截断，也不调用模型压缩。现有线协议仍执行整包大小限制。

身份随原规划响应产出，不增加一次单独规划请求；新套图和追加位置由程序匹配，不再反复概括已有图片再规划。既有图像质量复核与一次纠正仍会产生原有服务消耗，无法承诺每个供应商账单固定下降。模型、供应商和图像质量配置保持既有设置。

每个任务位置持续存在。合格图片保留，失败显示位置和原因；原有一次自动纠正后仍失败则保留失败状态，不能把部分成功当全完成。新规则下追加到第 10 张即停止；失败位置用重试，不另增第 11 张。

程序校验保证结构、长度、数量关系、版本与方向一致；不能单独证明模型写出的事实与每个像素完全吻合。保留原有候选预览和既有图像复核，并对未知事实保持保守。

## 两仓维护边界

| 修改内容 | 修改仓库 |
| --- | --- |
| 产品身份的产生、系列、套图规划、主图同步、数量/失败状态 | Product Radar |
| 网站样式、页面布局、已有合同支持的模板偏好 | Web Radar |
| 改身份字段定义或增加双方尚不支持的合同能力 | 两仓同时更新定义、测试和版本 |

Web Radar 维护人 `wuyueerhao` 可在私有仓库正常克隆分支提交 PR，由仓库所有者 DomFafa 合并；不需要公开仓库或传 ZIP。本次不改变已有权限。

Web Radar 新默认合同为 `2026-09-22.<template>-materials.5`，声明 `product.identity.v1` 和 `productApplicability`。偏好用于排序，不把不熟悉的类目一律排除。旧 materials.4 及更早版本仍返回原合同与原渲染结果。新接收器将身份与 sourceVersion 保留到网站草稿；普通编辑不能擦除内部来源身份。

兼容发布顺序为先 Product Radar，再 Web Radar。Product Radar 仅向声明新能力的合同发送新增字段，因此先上线时仍能调用旧 Web Radar；Web Radar 上线后新模板才使用新版能力。回滚时先回滚 Web Radar，再回滚 Product Radar。无需数据库迁移、调整供应商或改动发布过的客户站点。

## 复验入口

Product Radar：`tests/product-identity*.test.ts`、`product-series-generation`、`product-presentation-append-jobs`、`presentation-template-flow`、`website-materials-submission`。Web Radar：`tests/product-identity.test.ts`、`materials-plugin-contract`、`materials-service`。两仓集成使用 Product Radar 的 `tests/helpers/run-template-plugin-integration.mjs`，提供两仓绝对路径。正式发布验证另见同目录验收记录。
