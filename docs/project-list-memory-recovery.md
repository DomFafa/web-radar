# 项目列表 500：模板启动内存修复

## 原因与改动

2026-10-01，Cloudflare 的已登录 `/api/projects` 请求返回 500。线上追踪显示 Coordinator 在开始处理请求前发生 `exceededMemory`，CPU 时间为 0；D1 项目 JSON 和相同列表查询均正常。大量模板 HTML/CSS 被作为顶层字符串一起载入了 Worker / Durable Object。

- Lumi、Auravell、Careflow 和参考布局改为在模块中保存 gzip 数据，访问具体页面时才解压；不在全局缓存完整解压结果。
- 可编辑原文保存在相邻的 `*.reference.json`，运行 `node scripts/pack-lumi-reference.mjs`、`node scripts/pack-theme-reference.mjs` 更新生成文件。
- `--check` 同时比较解压后的原文及模块结构，兼容不同 Node/zlib 版本产生的不同压缩字节。
- 旧版预览脚本改为引用已有的预览专用模块；历史发布渲染器及其校验值不变。
- 不改变项目数据、权限或数据库结构。API 未知错误继续返回通用提示，诊断堆栈不出现在公开响应中。

## 验证

类型检查、全部 104 个测试文件、2,237 项测试（包含已同步的模板 API 兼容修复）及前端 / Worker / 服务器构建通过。Careflow 75 个、Auravell 90 个浏览器场景通过。

Lumi 旧浏览器脚本在客户自定义 Banner 的 Next 按钮处被固定导航遮挡。使用 HEAD 原始模板数据与压缩版本对照，64 组完整渲染输出（包括该 Banner）逐字节一致；这项既有问题并非压缩回归，未通过跳过断言来掩盖。

发布时保存生产绑定与版本，随后使用真实 SSO 登录请求项目列表、分页、筛选和详情；服务器采用独立版本目录并保留回退入口。具体源提交、部署版本和在线验证结果记录在本次发布产物中。
