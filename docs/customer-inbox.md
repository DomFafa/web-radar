# 客户收件箱

## 状态与边界

功能在 Cloudflare 与 Ubuntu 版本分别运行，复用身份、工作区与角色。应用发布本身不会接通收信；需单独配置接收入口和域名路由，也不自动导入历史邮箱。

收信启用需要管理员在「客户收件箱 → 收信配置」填写域名和转发目的邮箱，部署统一接收 Worker，并通过一封实际测试来信验证。验证前不可启用新追踪。现有历史活动和任务的 reply_tracking 默认为关闭；新建表单默认勾选追踪，但只有工作区配置验证并启用后才替换回复地址。

Resend、SES、SendGrid、Mailgun、Brevo 与 Mailchimp Transactional 逐封发送使用每个活动收件人的 Reply-To；Mailchimp Marketing 整批活动不支持此逐收件人路径，继续使用原回复地址并标为未追踪。自定义 SMTP HTTP 中继尚无已验证的 Reply-To 合同，保持既有实际发送，不创建追踪地址，发送快照不记录未传出的 Reply-To。旧收信地址仍可接收。站内信仅在已有安全检查通过、进入浏览器提交前使用独立地址，不绕过原来的验证码/权限规则。

## 模块与统计

- 客户收件箱：会话、纯文本正文、鉴权附件、处理状态、负责人、收信配置、人工关联和审计。
- EDM 活动/站内信任务：客户回复链接，带来源与活动 ID 筛选。
- 业务数据：按创建者或业务记录进入对应收件箱。
- 已读按用户独立记录；新来信将已完成会话重新打开。
- 人工回复只在业务人员确认后计入；Auto-Submitted 自动回执、退信单独显示。普通来信初始「待确认」，不依靠主题猜测真人回复。
- 同一个活动收件人或站内信目标的多封客户回复只计一个已回复目标。
- 回复率分母为已发送收件人/成功提交目标；未追踪显示「未追踪」，覆盖不全显示「部分追踪」。原送达、打开、点击、提交状态不被回复状态覆盖。
- 可按来源、处理状态、类型、收信地址、用户、UTC 日期、关键字、未读/未关联筛选。

## 收信入口配置

1. 在两套后台分别添加相同收信域名、各自转发邮箱。保存一次性返回的 id / endpoint / secret，勿提交 Git。
2. 在域名所属 Cloudflare 帐号创建 R2 桶 `web-radar-inbox-ingress`，队列 `web-radar-inbox-ingest` 与 `web-radar-inbox-ingest-dlq`。
3. 使用 `deploy/inbox-gateway/wrangler.jsonc` 部署独立 Worker；将 `TARGETS` 作为 secret 写入。一个域名对应目标数组，例如：

```json
{
  "reply.example.com": [
    {"id":"后台配置 ID A","endpoint":"https://web-radar.net/api/inbox/receive/ID-A","secret":"一次性密钥 A","forwardTo":"sales@example.net","default":true},
    {"id":"后台配置 ID B","endpoint":"https://web.vnvnv.com/api/inbox/receive/ID-B","secret":"一次性密钥 B","forwardTo":"sales@example.net"}
  ]
}
```

4. 核对现有 MX 和转发规则。主域已使用 Google 或其他邮箱服务时，为独立收信子域配置 Email Routing，保留主域原 MX。验证转发目的邮箱，并将 literal 地址 `reply@收信域名` 路由到统一 Worker。开启 Email Routing Settings 中的 Subaddressing（`support_subaddress`）；官方说明加号标签匹配固定地址规则，并保留完整 `message.to`。子域不支持 catch-all，不得以第二套 MX 混装两个独立收信服务。参考 [子域配置](https://developers.cloudflare.com/email-service/configuration/subdomains/) 与 [加号地址](https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/#subaddressing)。
5. 新业务回复地址分别包含各自配置 ID 的前 12 个十六进制字符：`reply+e-实例标识-32位随机码@域名`、`reply+s-实例标识-32位随机码@域名`。Worker 仅在分流时解析加号标签，完整收件地址用于签名、存储、去重与业务关联。固定地址只归属于明确设置 default 的一个实例；最多一个 default。未知或畸形加号标签拒收，不能落到另一实例。旧 `e-`/`s-` 格式与已保存路由不改写；旧地址继续接收也须保留其原域名及接收规则。
6. 发测试邮件验证两端接收/转发，再分别启用。旧配置停用只停止新地址分配，已有追踪地址继续接收。不得直接删除旧入口密钥。
7. 更换应用访问域名时只更新 TARGETS 的 endpoint；收信地址与任务映射不变。

## 接收、恢复与归属

- 网关先保存原始 MIME 到私有 R2，投递队列使用 HMAC 签名（配置 ID、时间戳、原始收件人、envelope sender、转发状态、正文 hash）。目标应用验证时效和配置域名。
- 队列失败指数退避，20 次后进死信队列；原始文件保留。管理员检查失败原因后从死信队列重放 `{key}`，不要重新发送业务邮件。
- 两个实例不广播写入同一封业务回复，不同步数据库。复制实例后不能沿用旧收信配置/路由表，需重新生成实例配置。
- 同一配置下 Message-ID + envelope recipient 去重；没有 Message-ID 时用原始正文 hash。
- 优先精确独立地址，再使用邮件标准 In-Reply-To/References 唯一关联；不凭发件域名猜测。未知邮件由管理员人工关联。
- 支持解除、更正关联并重算已确认回复数据。原始 MIME、原发送/提交文字快照保留。普通列表不公开原始存储键。
- MIME 最大 15 MB，附件最多显示 30 个；完整原文私有保存。正文以文本展示，HTML 图片/脚本不会执行；附件使用 attachment + octet-stream 下载。
- 附件/正文访问均按工作区、业务创建者或指定负责人检查。数据主管默认仅见概要，管理员可按收信配置授予正文和附件权限。成员与只读成员仅查看本人/分配会话；只有可写角色可分类和处理。管理员分配、关联和下载都有审计。

## 验收与延后事项

`tests/customer-inbox.test.ts` 验证签名、去重、正文隔离、附件鉴权、固定/独立地址、关联更正、分类统计、并发版本、未读状态；`scripts/verify_customer_inbox.mjs` 验证实际本地 Worker + 浏览器页面。

域名接入必须通过真实来信验证接收与转发，再启用新追踪；本地测试不能替代这一步。历史 Gmail/Outlook/IMAP 导入、站内直接发送回复、AI 摘要、自动跟进提醒不属于现有收信链路。网关转发失败会在来信中标识，不能据此宣称业务员已阅读；转发重试需按原始邮件处理，不重复提交外部表单。
