# 域名绑定与 Resend 账号

## 使用

- 平台管理 → Cloudflare 与 Resend 账号：添加共享账号；Resend 可设为默认。
- 编辑网站 → 预览与发布 → 域名绑定与询盘邮件：选择发信账号，或跟随平台默认；更改立即生效，不改动页面草稿。
- 域名绑定默认选中网站已有的 Cloudflare 托管账号并自动读取该账号的域名；无需重复添加 Token。单账号配置使用 `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN`，多托管账号配置跟随网站已有绑定；尚未发布的网站采用与发布逻辑相同的账号分配。环境凭据仅存于 Worker Secret，数据库只保存账号引用。
- 网站发布后可选择后台 Cloudflare 账号，也可输入新的 Token（仅保存到当前网站），读取其授权域名列表，填写 `www`、其他子域名或 `@` 绑定根域名。
- Token 需要 Zone Read 和 DNS Edit。Pages 自定义域名调用使用网站原托管账号的 Pages Edit 凭据。根域名必须与 Pages 项目属于同一 Cloudflare 账号，跨账号可使用子域名。绑定不迁移 Pages 项目。
- 绑定创建 Pages 域名关联和 CNAME 后显示实际证书状态；使用“刷新状态”核查，不持续后台轮询。DNS 或 TLS 尚未生效不显示成功访问链接。
- 冲突解析不会被覆盖。解绑只删除应用创建、且类型/目标/标记均未被修改的 DNS 记录；既有解析保留。绑定失败后可继续配置或解绑，重试会读取已有 Pages/DNS 状态。
- 有域名绑定的网站必须先解绑才能删除，防止留下无人维护的域名关联。
- Resend 需要填写其已验证域名的发信地址，支持 Sending access Key。保存账号不会发送测试邮件，也不代表发信域名已通过 Resend 验证。
- 新询盘入队时记录发信账号 ID；更改默认或网站设置不改变已入队任务。原环境配置作为未指定账号的后备来源，既有任务仍使用原配置。被网站、域名或未完成邮件引用的账号不能删除。

## 存储与部署

迁移 `0006_provider_accounts.sql` 新增独立账号、域名和邮件设置表，不改动页面草稿版本。Token / Key 用 AES-GCM 加密保存，以现有 `ASSET_SIGNING_KEY` 派生专用密钥，并以账号 ID 作为附加认证数据。API 只返回账号名称和发信地址，不回传密钥。

先备份 D1，再执行远程迁移并同步部署 Worker 与前端。保留当前 `ASSET_SIGNING_KEY`：更换此密钥会导致已有账号凭据无法解密，需迁移密文或重新录入。D1 完整备份包含加密账号；业务 JSON 导出不包含密钥或上述连接设置，完整恢复需要 D1 备份。

本功能仅涉及 Cloudflare Worker / D1 和现有外部 API，不要求更新独立 Python 服务器。单元测试与本地浏览器通过模拟上游验证，不发送真实邮件，也不修改真实域名。

接口依据：[Cloudflare Pages 自定义域名](https://developers.cloudflare.com/pages/configuration/custom-domains/)、[Pages Domains API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/domains/)、[Resend 多租户账号](https://resend.com/docs/knowledge-base/setting-up-resend-for-multi-tenants)。
