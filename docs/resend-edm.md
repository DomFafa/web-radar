# EDM Resend 接入

## 管理员设置

1. 在 EDM 邮件 → 服务商配置添加 **Resend**，填写名称和 API Key，可设为默认邮件通道。支持多个帐号；帐号与凭据仅属于当前工作空间。
2. 使用 **Full access** Key 才能检测帐号、读取域名和管理数据回调。测试连接读取域名权限，不会发送邮件。仅 Sending access Key 可以发信，但不能使用上述管理功能。
3. 保存后点击 **连接 / 检测数据回调**。系统在 Resend 注册或恢复 HTTPS 回调，保存加密的签名密钥。重复操作复用相同地址。网站公开地址来自平台 APP_ORIGIN，私密 Key 不返回浏览器。
4. 在 **发信域名** 查看每个 Resend 帐号下的域名；**检测域名 / DNS** 显示验证状态、区域及所需记录。先在 Resend 添加域名，在 DNS 服务商完成解析，再检测。
5. 点击 **开启打开与点击追踪**。回调已连接和域名追踪已开启两项都需要完成；发件邮箱应使用该帐号已验证域名。
6. 正常创建营销活动并发送。发送前会自动检测并连接回调、开启当前域名的打开和点击追踪；权限不足时阻止入队并提示修复。发送中心合并 Mailchimp 与 Resend 已验证域名，用独立下拉框选择域名，保留邮箱前缀及自定义回复地址。发送前重新读取 Resend 域名，优先匹配对应帐号；同域名有多个帐号时优先默认帐号。已开始的活动保留所选择的发送通道。

## 数据范围

- 接收 Resend 的 sent、delivered、opened、clicked、bounced、complained、failed 事件，更新收件人状态、活动报告、EDM 概览和控制台。
- 仅关联本系统通过该 Resend 帐号发送的邮件；帐号内其他系统发送的邮件不会计入。
- 每封邮件的送达、打开、点击、退信、投诉分别去重统计。点击意味着已打开、送达，乱序事件不会将已点击降回已发送。
- 退信或投诉会停止对应联系人的后续订阅发送。确认失败的邮件不会被迟到的 sent 事件覆盖。
- EDM 概览和控制台的「同步 Resend 数据」会在后台分页读取已知邮件 ID 的最新事件，补齐能够核实的送达、打开、点击、退信等数据，并显示进度与失败原因。同步可重复执行，按每封邮件去重；不发送邮件，也不会重试结果不确定的邮件。API 只提供最新事件，无法重建完整历史或补采集此前未开启的打开/点击事件。打开/点击事件受邮件客户端隐私保护、图片禁用和自动扫描影响，不应视作准确的人类阅读证明。
- 原有 Mailchimp 检测和域名管理保持可用；Resend DNS 记录仅展示，不自动覆盖解析。

## 运维与验证

应用数据库迁移 `0008_resend_tracking.sql` 和 `0009_email_scheduling.sql` 后部署。公开入口为
`POST /api/outreach/webhooks/resend/{providerId}`，无需用户会话，必须通过 Svix 签名和五分钟时间窗验证；其他配置接口仍需登录，修改需要工作空间管理员权限。

发送前预留邮件关联记录，使用 `Idempotency-Key: wr-{recipientId}`。数据库事务原子更新去重计数和时间戳；不确定的发送结果不会盲目重发。新到达但尚未关联的签名事件返回 503，允许 Resend 重试。

自动测试使用模拟 Resend API、真实 SQLite 事务及固定 Svix 签名样例，浏览器验证页面交互。测试不向真实收件人发信。

参考：
- [Resend 发信 API](https://resend.com/docs/api-reference/emails/send-email)
- [域名 API](https://resend.com/docs/api-reference/domains/get-domain)
- [Webhook 事件](https://resend.com/docs/webhooks/event-types)
- [签名校验](https://resend.com/docs/webhooks/verify-webhooks-requests)

## 队列发送速率

- 活动发送速率为 1–200 封/分钟，默认 50。事务型发信按持久化预约时间调度，50 对应最少 1.2 秒的请求间隔；队列延迟和网络耗时可能使实际速度更低。
- D1 原子事务统一协调并发消费者；Worker 重启、延迟到达或队列重复投递不会集中补发。排队等待使用延迟消息，不消耗失败重试次数；发送前仍执行持久化防重复检查。
- 本安装的 Resend 发送额外共享最多 2 请求/秒的上限，历史查询最多 5 请求/秒，与发信共享时钟。仍需留意同一 Resend 团队内其他应用的 API 使用量。
- 收到 429 时读取 `Retry-After` 并共享冷却时间；日/月额度不足或鉴权失败时暂停活动，修复后由操作者恢复。不确定的历史发送结果继续保留待核实，不自动重发。
- Mailchimp Marketing 的整活动发送由 Mailchimp 调度，不支持本地逐封限速；上述逐封调度适用于 Resend 等事务型发送通道。

[Resend 速率限制](https://resend.com/docs/api-reference/rate-limit) · [读取已发送邮件](https://resend.com/docs/api-reference/emails/retrieve-email)
