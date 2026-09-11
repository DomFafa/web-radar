# Web Radar

独立于 Product Radar 的外贸展示网站工作室。完整首版范围见 [批准方案](docs/web-radar-v1-final-review.md)，跨项目协议见 [集成契约](docs/web-radar-integration-contract.md)。当前开发分支 `codex/web-radar-v1`。

## 本地开发

Node.js 24，npm。依赖已锁定，无需访问任何旧项目配置。

```sh
npm ci
npm run build
npx wrangler d1 migrations apply web-radar --local --env test
npm run dev:test
```

访问 [本地工作室](http://127.0.0.1:8788)。`test` 环境必须显式启用，页面始终标明测试模式；可用五个固定身份测试创建者、工作区管理员、普通成员、其他公司成员和平台管理员。测试接口限制为 loopback 地址。测试生成、发布和邮件的结果不能用作真实服务验收。真实客户使用生产环境并连接 Product Radar；没有单独注册账号或共享测试登录。

需要热更新时另开 `npm run dev:ui`，端口 5174 代理 API 到 8788。内嵌鉴权和 CSP 最终验证应使用 Worker 原点 8788。

## 校验

```sh
npm run typecheck
npm test
npm run build
npx wrangler deploy --dry-run --env=""
```

`tests/auth.test.ts` 核验一次性授权、幂等重试、Origin、权限撤销、并发交换和令牌隔离。其他领域测试覆盖额度、生成确认、任务恢复、发布及模板边界。浏览器与负载脚本在 `scripts/`，执行顺序、证据与真实配置依赖见 [首版验收报告](docs/web-radar-v1-acceptance.md)。

## 真实配置

从 `.env.example` 建立忽略于 Git 的 `.dev.vars`，或者通过 `wrangler secret put` 设置服务端凭据。不要把 key 放进 `VITE_*`、URL、日志或客户表单。仅使用新的 Web Radar 专用 Image 2.5 key；文字、Agnes、Resend、Cloudflare 和 PR 服务间认证独立配置。

`wrangler.jsonc` 的 D1 ID 为本地占位值；真实部署前为本项目选择并核验独立 D1/R2/DO 资源、账号权限、容量、父页面允许来源和生产 APP_ORIGIN。配置存在只代表已配置，不代表已验证 API 权限、余量、邮件域名或发布资源。此开发交付不包含资源购买、套餐升级、真实邮件或客户样例公开发布。

## 数据与恢复

项目使用稳定 ID 和乐观版本号；两入口编辑相同记录。Product Radar 图片复制到私有 R2，来源更新由客户明确查看并应用。生成任务保存发起者、输入快照、额度状态和上游编号。未知视频提交不可重新提交；先查上游并人工核对，避免重复生成。

发布记录与草稿分别保存。只有成功发布版本对外生效；恢复上次成功发布不覆盖当前草稿、询盘或额度。下线关闭公开网关与新询盘，旧部署别名也须通过同一网关检查。管理导出提供业务数据；迁移时另行导出 D1、R2 对象、DO 调度状态，并在新环境核对在途任务、原发布账号和地址关联。迁移不是直接复制项目目录。
