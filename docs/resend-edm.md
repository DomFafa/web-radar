# EDM Resend 接入

## 管理员设置

1. 在 EDM 邮件 → 服务商配置添加 **Resend**，填写名称和 API Key，可设为默认邮件通道。支持多个帐号；帐号与凭据仅属于当前工作空间。
2. 使用 **Full access** Key 才能检测帐号、读取域名和管理数据回调。测试连接读取域名权限，不会发送邮件。仅 Sending access Key 可以发信，但不能使用上述管理功能。
3. 保存后点击 **连接 / 检测数据回调**。系统在 Resend 注册或恢复 HTTPS 回调，保存加密的签名密钥。重复操作复用相同地址。网站公开地址来自平台 APP_ORIGIN，私密 Key 不返回浏览器。
4. 在 **发信域名** 查看每个 Resend 帐号下的域名；**检测域名 / DNS** 显示验证状态、区域及所需记录。先在 Resend 添加域名，在 DNS 服务商完成解析，再检测。
5. 点击 **开启打开与点击追踪**。回调已连接和域名追踪已开启两项都需要完成；发件邮箱应使用该帐号已验证域名。
6. 正常创建营销活动并发送。发送中心合并 Mailchimp 与 Resend 已验证域名，用独立下拉框选择域名，保留邮箱前缀及自定义回复地址。发送前重新读取 Resend 域名，优先匹配对应帐号；同域名有多个帐号时优先默认帐号。已开始的活动保留所选择的发送通道。

## 数据范围

- 接收 Resend 的 sent、delivered、opened、clicked、bounced、complained、failed 事件，更新收件人状态、活动报告、EDM 概览和控制台。
- 仅关联本系统通过该 Resend 帐号发送的邮件；帐号内其他系统发送的邮件不会计入。
- 每封邮件的送达、打开、点击、退信、投诉分别去重统计。点击意味着已打开、送达，乱序事件不会将已点击降回已发送。
- 退信或投诉会停止对应联系人的后续订阅发送。确认失败的邮件不会被迟到的 sent 事件覆盖。
- 历史邮件不会补采集配置前的事件。打开/点击事件受邮件客户端隐私保护、图片禁用和自动扫描影响，不应视作准确的人类阅读证明。
- 原有 Mailchimp 检测和域名管理保持可用；Resend DNS 记录仅展示，不自动覆盖解析。

## 运维与验证

应用数据库迁移 `0008_resend_tracking.sql` 后部署。公开入口为
`POST /api/outreach/webhooks/resend/{providerId}`，无需用户会话，必须通过 Svix 签名和五分钟时间窗验证；其他配置接口仍需登录，修改需要工作空间管理员权限。

发送前预留邮件关联记录，使用 `Idempotency-Key: wr-{recipientId}`。数据库事务原子更新去重计数和时间戳；不确定的发送结果不会盲目重发。新到达但尚未关联的签名事件返回 503，允许 Resend 重试。

自动测试使用模拟 Resend API、真实 SQLite 事务及固定 Svix 签名样例，浏览器验证页面交互。测试不向真实收件人发信。

参考：
- [Resend 发信 API](https://resend.com/docs/api-reference/emails/send-email)
- [域名 API](https://resend.com/docs/api-reference/domains/get-domain)
- [Webhook 事件](https://resend.com/docs/webhooks/event-types)
- [签名校验](https://resend.com/docs/webhooks/verify-webhooks-requests)
