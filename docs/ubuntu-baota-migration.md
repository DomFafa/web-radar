# Web Radar 完整迁移至 Ubuntu + 宝塔

编写日期：2026-09-24。依据当前仓库代码核对；这是迁移实施说明，未修改生产部署，也未实现下述服务器适配器。

## 1. 先明确结论与范围

当前 Web Radar 是 Cloudflare Workers 应用，不是已支持 `npm start` 的普通 Node.js 服务。仅把 `dist/` 上传宝塔，会得到前端页面，登录、保存、建站、上传、发布和队列均不能完整工作。`npm run dev` 依赖 Wrangler 的开发运行环境，也不应作为正式迁移方案。

本指南的目标：工作台、API、数据库、素材、后台任务、网页采集、生成服务，以及生成网站的托管均迁到服务器。Cloudflare 可以继续提供 DNS/CDN；Resend 和模型接口继续作为外部服务。

建议分两次切换：先迁工作台及数据，暂时保留已发布的 Cloudflare Pages 网站；稳定后再迁客户网站。第一阶段属于过渡状态，完成第二阶段才算整个托管链路迁完。

另有独立依赖：当前真实登录复用 Product Radar 的账户与工作空间。迁 Web Radar 不等于迁走 Product Radar；必须保持原认证服务可访问。若还要完全脱离 Product Radar，需要另行实现独立身份认证及用户/权限迁移。

## 2. 已确认的代码依赖与替换清单

| 当前实现 | 服务器目标 | 必须完成的改造 |
|---|---|---|
| React/Vite，`dist/` | Node 静态服务或 Nginx | 保留 SPA 路由，但不得吞掉 API 的 404 |
| `src/worker/index.ts` + Hono | Hono Node.js 服务 | 新建服务器入口、注入配置、处理请求流与可信代理 |
| D1，核心原生 SQL + EDM Drizzle D1 | 第一版采用本机 SQLite | 适配 prepare/bind/first/all/run/raw/batch；保持事务、变更行数及 SQL 语义 |
| `MEDIA` R2 Bucket | 私有文件存储适配器 | 保留对象 key、HTTP/自定义元数据、Range、授权与签名读取 |
| `COORDINATOR` Durable Object | 单实例任务协调进程 | 移植锁、配额串行修改、tick、持久化唤醒与重启恢复 |
| Cloudflare Queues | Redis + BullMQ | 三类独立任务：邮件发送、邮件状态同步、站内信；保留重试、延后和死信处理 |
| `BROWSER` / Cloudflare Puppeteer | 隔离的本地 Chromium 执行服务 | 替换浏览器连接，限制并发、内存、时间和出站访问 |
| `services/site-builder` | Python 服务 | 保持 vendor 相对路径，安装 Chromium，独立持久化 SQLite |
| Cloudflare Pages API 和 `_worker.js` | 本机网站发布与路由服务 | 版本目录、域名映射、访问门禁、询盘转发、上线/下线/恢复 |
| Cloudflare 域名绑定界面 | 本机托管域名绑定 | DNS API 可沿用；Pages 绑定逻辑须替换为源站及证书配置 |
| Resend Webhook | 相同 HTTPS 路径 | 保留原始请求体、Svix 头、签名密钥和去重记录 |

Hono 官方支持 Node.js Adapter，但添加 Adapter 不会自动替换 D1/R2/DO/Queues。[Hono Node.js 文档](https://hono.dev/docs/getting-started/nodejs)

### 数据库选择

第一阶段建议 SQLite，便于保持现有 SQLite/D1 SQL 语义，减少迁移同时改数据库方言的风险。使用本机磁盘、WAL、外键约束、busy timeout、短事务，并验证多进程并发。不要放在 NFS 上，也不要把事务跨越模型/API 请求。

如果需求已明确为多台应用服务器、高并发写入或数据库高可用，应直接设计 PostgreSQL 适配与数据转换；不能把 D1 SQL 文件直接导入 MySQL/PostgreSQL。宝塔安装了 MySQL，并不意味着本项目必须使用 MySQL。

## 3. 建议服务器配置

以下为部署起点估算，不是压测承诺，主要成本来自 Chromium、网页截图和生成后的渲染。

| 使用规模 | CPU / 内存 | 磁盘 | 初始限制 |
|---|---|---|---|
| 测试及少量使用 | 4 核 / 8 GB | 100 GB SSD 起 | 建站 1 个，浏览器 1 个 |
| 推荐单机生产起点 | 8 核 / 16 GB | 200 GB SSD 起 | 建站 1 个，浏览器先开 1–2 个 |
| 较多采集、站内信或多用户 | 8–16 核 / 32 GB 起 | 根据素材总量扩容 | 浏览器与任务服务逐步拆机 |

磁盘须容纳：数据库、素材、网站历史版本、浏览器文件、日志，以及迁移时的新旧副本。先统计现有 R2 容量，再预留至少一次完整迁移副本和运行余量；异地备份另外存放。

建议 Ubuntu 24.04 LTS、Node.js 24 LTS、Python 3.12。Node 版本应经项目锁文件和完整测试验证后固定，不使用漂移的 `latest` 镜像。[Node 发布计划](https://github.com/nodejs/Release)

模型通过外部 API 调用时不需要 GPU。服务器必须能稳定访问实际配置的模型接口、Resend、Product Radar、软件包源和需要采集的公网网站。

## 4. 目标部署结构

```text
公网 HTTPS
    │
宝塔 Nginx：域名、TLS、反向代理
    ├─ Web Radar 工作台/API → 127.0.0.1:3000
    ├─ 网站托管路由（第二阶段）→ 127.0.0.1:3001
    └─ Builder HTTPS 入口（按需）→ 127.0.0.1:7002

私有应用网络
    ├─ 主 API
    ├─ 单实例任务协调器
    ├─ 邮件 / 统计同步 / 站内信消费者
    ├─ Redis（任务队列，持久化）
    └─ Python builder + 隔离浏览器

持久数据：SQLite、素材、发布版本、builder 数据库
```

推荐宝塔管理 Nginx、证书和备份入口；应用进程由 Docker Compose 管理。也可以用 systemd，但不要同时用宝塔 Node 管理器、PM2 和 systemd 启动同一个进程。

## 5. 第一阶段：改造成服务器可运行版本

这是开始生产数据切换前的硬性前置条件。当前仓库尚未提供完整的服务器入口、主应用 Dockerfile 或 Compose 部署文件。

### 5.1 主 API 与可信代理

- 新建 Node 入口，使用 `@hono/node-server`，保持现有 API 路径和返回结构。
- 抽离 Cloudflare 特有的 import；不能让 Node 入口加载 `cloudflare:workers`。
- 为业务服务提供独立的运行环境适配，不应模拟整套 Worker 环境后假设生产可用。
- 不再依赖 `CF-Connecting-IP` 作为唯一客户端 IP。只信任本机 Nginx/已配置代理提供的真实 IP，防止用户伪造头绕过限流。
- Node 外部请求不能携带可直接信任的 `X-WR-Principal`。该头必须在可信内部边界重新生成，保持身份和工作空间检查。
- 新增 readiness 检查，覆盖数据库、Redis、素材可访问性。现有 `/api/health` 返回 200 不能单独证明全链路正常。
- 将关键 `waitUntil` 后台工作移入可靠队列；不能用无人接管的 Promise 代替。

### 5.2 数据库、存储与协调器

- 给 D1 接口实现真实 SQLite 适配；`batch` 必须是原子事务，失败全部回滚。
- 保留邮件尝试锁、限速时钟、发布幂等键、额度账本和回调去重的唯一约束。
- R2 的文件正文及元数据都要迁；视频需支持 Range/206，不能只实现普通文件 GET。
- 私有媒体不能直接放进 Nginx 可访问目录；授权预览、公开发布附件分别走相应读取规则。
- 对对象 key 做路径隔离，禁止将未经验证的 key 直接拼接文件路径。
- DO 的 `alarm` 改为持久化调度；进程启动时扫描可恢复任务。单独 `setInterval` 不是完整替代。
- 当前 `DomainService` 有进程内串行锁。改成独立协调器后，所有相关修改必须经过它，或改用数据库事务/可证明正确的分布式锁；仅让 tick 单实例不够。

### 5.3 邮件、站内信、浏览器

- Redis 开启持久化，队列实例使用 `maxmemory-policy noeviction`。队列不得因为缓存淘汰丢失任务。[BullMQ 生产建议](https://docs.bullmq.io/guide/going-to-production)
- 50 封/分钟的数据库调度规则、防重复发送记录、429 冷却与额度暂停继续保留。
- BullMQ 的队列全局限速与本项目“每个活动 + Resend 共享限制”不是一回事；不能只加一个通用 limiter 就删掉原有约束。
- 多次回调只计算一次，失去网络响应的发送保持待核实。队列重启不自动重发不确定邮件。
- 站内信的浏览器进程不挂载业务密钥或私有数据目录；限制同时打开的页面数、超时及下载。
- 浏览器和网页抓取禁止访问本机、内网、云 metadata 地址，覆盖跳转和子资源。迁到 VPS 后本机有数据库、宝塔等敏感端口，不能只验证第一次输入的网址。
- 在应用检查外再配出站网络隔离；不能以全局关闭沙箱作为默认浏览器部署方式。

### 5.4 交付物与验收门槛

适配阶段应交付服务器入口、Dockerfile、Compose 文件、环境变量样例、迁移/恢复命令、队列管理命令和健康检查。至少验证：

1. 原 Cloudflare 业务测试与服务器适配测试通过。
2. SQLite 事务回滚、并发限速、重复任务和重启恢复通过。
3. 登录、工作空间隔离、资料保存、图片/视频读写、建站、预览和发布通过。
4. 使用模拟供应商验证邮件与站内信；真实发信须限定为明确授权的测试收件人。

以下章节中出现的 `compose.server.yml`、`api`、`scheduler` 等均是建议交付名称，不是当前仓库已经存在的命令入口。

## 6. 第二阶段：准备 Ubuntu 和宝塔

1. 在宝塔安装/确认 Nginx。使用 Docker 时不需要在宿主机另外安装 Node、Redis 和 Python；这些可以放进镜像。
2. 确认 Docker Engine 和 Compose plugin 可用：`docker version`、`docker compose version`。按 Docker 的 Ubuntu 官方说明安装，已有 Docker 不必重复安装。[Docker Ubuntu 安装](https://docs.docker.com/engine/install/ubuntu/)
3. 对外开放 80/443；SSH 与宝塔面板仅允许管理员 IP/VPN。应用端口只发布到 `127.0.0.1`，Redis 不发布公网端口。Docker 发布端口会影响防火墙路径，不能只看 UFW 状态。[Docker 防火墙说明](https://docs.docker.com/engine/network/packet-filtering-firewalls/)
4. 使用独立目录保存程序、持久数据和凭据：

```text
/opt/web-radar/releases/<版本>/       # 完整源码/发布包
/opt/web-radar/current              # 当前版本指针
/etc/web-radar/app.env              # 权限 600
/etc/web-radar/builder.env          # 权限 600
/srv/web-radar/data/app.sqlite3
/srv/web-radar/data/media/
/srv/web-radar/data/sites/
/srv/web-radar/data/builder/
/srv/web-radar/data/redis/
/srv/web-radar/backups/
```

创建目录时确定容器/服务的 UID、GID，赋予最小所需权限。不要用 `chmod -R 777` 解决启动问题；SQLite 所在目录需要允许服务创建 WAL/SHM 文件。

## 7. 第三阶段：配置与密钥清点

从真实生产配置和凭据管理中整理配置；`.env.example` 只有字段说明，Git 不包含生产 Secret。`wrangler secret list` 也不能导出 Secret 明文。本地 `.dev.vars` 要逐项确认与生产一致，不能直接当成权威备份。

必须保留/确认：

| 配置 | 迁移要求 |
|---|---|
| `ASSET_SIGNING_KEY` | 保持原值：除签名外，还用于解密数据库里的供应商凭据；不能随迁移随手重建 |
| `APP_ORIGIN` | 建议继续用 `https://web-radar.net`，减少已有网站资源和回调地址变更 |
| `ENVIRONMENT` / `TEST_PROVIDERS` | 正式环境为 production / false；测试环境单独隔离 |
| Product Radar 三项配置 | 保留原账户关联、共享密钥和允许嵌入的 origin；外部认证服务必须可访问 |
| 文本、图片、旧视频供应商配置 | 保持实际可用地址、模型与密钥；迁移不要求更换模型 |
| `SITE_BUILDER_URL` / `SITE_BUILDER_KEY` | URL 指向实际新服务，两个服务共享同一认证 Key |
| 数据库中的 Resend / Cloudflare 等账号 | 连同加密字段和原加密主密钥一起迁移，不只复制环境变量里的默认账户 |
| Resend webhook signing secret | 单独于发信 API Key，需保留；签名验证要读取原始 body |
| `TEMPLATE_GUIDES_API_KEY` | 如其他 AI 在调用后台模板文档，保留 API 地址与授权方式 |

`DATABASE_PATH`、`REDIS_URL`、`MEDIA_ROOT` 等是服务器适配阶段需要新增的配置，不是给当前 Worker 添加几个环境变量就能启用。

本次生产排查发现现有 EDM Resend Key 返回 `suspended_api_key`。服务器迁移不会恢复该 Key；正式发信和追踪验收前需先在 Resend 处理停用状态。

## 8. 第四阶段：预迁移数据库和素材

先做一次演练，保持新服务器任务消费者关闭，避免副本库里的任务开始真实执行。

### 8.1 导出 D1

在可信管理机的项目目录中执行，Cloudflare 凭据通过受保护环境提供。下面的备份目录位于 Git 仓库外；请按实际管理机修改路径：

```bash
umask 077
mkdir -p /srv/web-radar/migration-backup
npx wrangler d1 export web-radar --remote --output=/srv/web-radar/migration-backup/web-radar.sql
sha256sum /srv/web-radar/migration-backup/web-radar.sql > /srv/web-radar/migration-backup/web-radar.sql.sha256
```

这是整库导出，包含用户相关数据及加密凭据，按敏感备份管理。Cloudflare 说明导出期间可能影响数据库访问，正式导出放在维护窗口。[D1 导入导出](https://developers.cloudflare.com/d1/best-practices/import-export-data/)

导入一个全新的本地 SQLite 文件进行演练，不覆盖正在运行的数据库。服务器适配导入工具应识别 D1 元数据/迁移记录，不重复运行已包含在导出 schema 中的建表迁移；对不兼容语句记录并转换，而非盲删。

导入后执行：

```sql
PRAGMA integrity_check;
PRAGMA foreign_key_check;
```

再核对各业务表行数、项目 ID、发布记录、关联外键、日期与 JSON 字段。特别核对邮件发送尝试、Resend 邮件 ID 映射、限速时钟和同步记录；丢掉它们可能造成重复发送或统计失真。

### 8.2 复制 R2

R2 的 S3 Access Key/Secret 与管理 Cloudflare 的 API Token 不是同一套凭据。使用只针对目标桶的迁移权限，存入受保护的 rclone 配置。

配置好名为 `r2` 的 remote 后，正文可用下列方式预复制：

```bash
rclone copy r2:web-radar-private /srv/web-radar/migration/r2-objects --progress
```

这只是对象正文的复制示例，不代表迁移已经完整。另需导出对象 key、大小、Content-Type、Cache-Control 和业务使用的自定义元数据清单，由存储导入工具恢复。[R2 与 rclone](https://developers.cloudflare.com/r2/examples/rclone/)

不要对新旧桶执行未经核对的双向 sync 或删除。核对对象数量、总大小、清单和抽样内容哈希；multipart 对象的 ETag 不应直接当成普通文件 MD5。检查真实图片、视频 Range 请求、设计稿、模板素材和发布产物。

### 8.3 其他持久数据

- 若沿用现有 builder 服务，先确认其数据位置、版本和健康，不需要为了迁移主应用强行搬动它。
- 若一并迁 builder，备份其 `SITE_BUILDER_DB` 指向的 SQLite，以及代码实际使用的持久文件/缓存目录。
- 不要直接复制运行中的 SQLite 主文件而遗漏 WAL；使用 SQLite backup API/命令，或停止写入后做一致性备份。
- 整理所有已发布站点、Pages 项目、绑定域名、当前和可恢复版本、部署文件及 DNS 记录。只有 D1+R2 并不能保证已复制了所有 Pages 上的可用产物，应逐个验证。

## 9. 第五阶段：启动服务器版与 Python builder

先用临时域名完成演练，或在测试机通过 hosts 指向新服务器。演练实例不连接正式发信队列，不修改正式回调入口。

服务器适配版交付后，启动顺序为存储/Redis → API → builder → 协调器/消费者。预迁移验收期间最后一组保持关闭。下面是约定命令的示意，不适用于未经改造的当前仓库：

```bash
docker compose -f compose.server.yml --env-file /etc/web-radar/app.env config --quiet
docker compose -f compose.server.yml --env-file /etc/web-radar/app.env build
docker compose -f compose.server.yml --env-file /etc/web-radar/app.env up -d redis api builder
docker compose -f compose.server.yml --env-file /etc/web-radar/app.env ps
```

仅给 Compose 传 `--env-file` 不会自动让所有变量进入容器；Compose 文件还须明确设置各服务的 `env_file`/`environment`。避免把完整 `docker compose config` 输出贴到日志，展开内容可能包含密钥。

### builder 特别注意

- Python 3.12+；保留 `services/site-builder` 与 `screenshot-to-code-main/backend` 的相对路径，以及 `services/site-builder/assets/`。
- 在镜像构建阶段用锁文件安装，例如在该目录执行 `uv sync --frozen --no-dev`。
- 安装浏览器及 Linux 依赖：`uv run playwright install --with-deps chromium`。[Playwright Python 文档](https://playwright.dev/python/docs/browsers)
- 运行 `uvicorn app:app --host 0.0.0.0 --port 7002 --workers 1`；这是容器内监听方式。宿主机直接运行时用 127.0.0.1。
- 每个 builder 数据库仅运行一个服务实例、一个 uvicorn worker，禁止生产 `--reload`。
- 设置 Python 服务实际读取的 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`SITE_BUILDER_KEY`、`SITE_BUILDER_DB`；只给主应用设置 `TEXT_API_KEY` 不会自动注入独立容器。
- 当前生产代码要求 builder URL 为 HTTPS。沿用 `https://builder.web-radar.net`，或在适配阶段明确支持固定的可信内部服务地址。不能通过把环境改成 test 来绕过这个要求。

仓库已有 `deploy/site-builder/` 的 systemd/Nginx 示例，可供不用容器时参考；其中路径和资源限制须按新机器调整。

## 10. 第六阶段：宝塔站点与 HTTPS

在宝塔添加测试域名/正式域名站点，配置有效证书和反向代理。界面名称可能随面板版本不同，目标是 HTTPS 请求进入本机应用端口。不要额外启用 PHP，也不要对整个 API 配 CDN 缓存。

合入站点已有的 `server` 配置中的反代示例，先删除/修改冲突的 `location /`，不要重复粘贴整个 server：

```nginx
client_max_body_size 100m;

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_connect_timeout 10s;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
    proxy_buffering off;
}
```

100m 为示例，需要与实际上传和应用限制一致。生成任务仍应异步返回任务 ID；不要靠无限延长 HTTP timeout 承载整个生成过程。图片/视频可以另外设计缓存和 Range 转发。

如果前面还有 Cloudflare CDN，需仅信任 Cloudflare 官方代理 IP 段恢复客户端 IP，再由 Nginx转发；不能无条件相信公网请求自带的 `CF-Connecting-IP` 或 `X-Forwarded-For`。

配置完执行宝塔 Nginx 的语法检查再 reload；实际二进制常见于 `/www/server/nginx/sbin/nginx`，以已安装路径为准。证书申请/续签按宝塔面板当前功能配置并验证。[宝塔 SSL 官方说明](https://docs.bt.cn/user-guide/site/php/site-config/ssl)

## 11. 第七阶段：正式切流，防止两个环境同时写入

1. 记录旧 Worker 版本、Pages 项目、DNS/Custom Domain 配置、代码 commit 和可恢复备份。
2. 降低相关 DNS TTL（DNS-only 记录）；使用 CDN 的记录按其机制安排切换。提前准备新源站有效 TLS 证书。
3. 旧工作台进入维护状态：停止新增建站/发信/站内信任务，冻结业务写入。
4. 等待正在执行的外部调用完成；确认邮件、发布和站内信没有无法归属的在途操作。停止旧队列消费者和 DO 调度，保留必要的对外访问能力。
5. 对迁移窗口中的询盘和邮件回调采用可验证的暂存/转发方案，或返回可重试错误；不能返回成功后丢弃，也不能让它们继续写旧库而被最终导出漏掉。
6. 最终导出 D1、增量复制 R2，导入新服务器，核对校验结果。旧、新库的任务不可以同时恢复。
7. 启动新 API、验证 HTTPS 和认证，然后将主域名切到新服务器。
8. **当前主域名绑定了 Worker Custom Domain。只改 DNS A 记录可能仍被 Worker 接管。必须同步解除/切换相应 Worker 路由和 Custom Domain 配置，再确认 DNS/请求实际到达新源站。**
9. 恢复新服务器唯一的一套协调器和消费者。迁移旧任务时保留同一逻辑任务 ID、尝试记录与供应商消息 ID；不要只按 queued/sending 状态重新创建一遍。
10. 保留旧服务与备份用于回滚，但保持旧消费者停止。初期重点观察队列积压、重复任务、数据库锁、内存和邮件回调。

对外主域名不变时，Resend callback、退订链接及既有网站调用的主服务路径可继续使用；仍须验证路径、签名和访问权限，不能仅验证 DNS。

## 12. 第八阶段：将已发布网站也迁出 Pages

当前 `src/worker/providers/pages.ts` 生成 `_worker.js`，负责发布版本门禁、访问允许文件、询盘转发与静态文件读取。Nginx 不能直接执行这个 Worker 文件。

完整迁移需先实现：

- `sites/<projectId>/<releaseId>/` 不可变版本目录；发布成功后原子切换当前版本。
- 基于已经验证的域名映射定位项目，未知 Host 直接拒绝；不允许任意 Host 拼接磁盘路径。
- 当前发布版本、下线状态、历史恢复、允许公开文件列表与原有行为一致。
- 询盘 POST 在原路径工作，授权、限流、幂等、防滥用和邮件通知保持有效。
- 素材路径、根路径跳转、多语言页面、产品详情、robots、sitemap、canonical 和自定义域名适配。
- 新的域名绑定流程创建指向服务器的 A/AAAA/CNAME，并完成域名验证及 TLS；不能继续向 Pages API 发起托管绑定。

迁移顺序：先一个验收站 → 验证所有路径与询盘 → 小批量域名 → 其余站点。第一阶段保留 Pages 时，必须让其仍能访问主域名的 `/public/sites/.../gate/...` 等现有接口，否则 Pages 即使还在也可能返回不可用。

`*.pages.dev` 是 Cloudflare 提供的域名，不能把它的 DNS 搬到自己的服务器。使用这类网址的站点需要改用自己的域名；可以保留原 Pages 项目做过渡跳转。新的正式域名应重新生成对应 canonical/sitemap，旧自定义域名则尽量保持不变。

所有客户站点切换并验收后，才下线原 Pages 发布流程、停止使用其托管权限。Cloudflare DNS 可以保留，DNS 服务和 Pages 托管是两回事。

## 13. 验收清单

- 登录与 Product Radar 嵌入正常，管理员/普通用户/跨工作空间隔离正常。
- 网站项目数量、资料、产品、Logo/favicon、Banner 轮播及视频一致。
- 上传、私有预览、公开媒体和视频拖动播放正常。
- 模板建站、网址/设计稿建站，重启后的任务状态和额度一致。
- 发布、恢复、下线、域名绑定、HTTPS 和询盘记录正常。
- EDM 联系人、模板、活动、发件域名与加密配置可用；无真实发送的启动探测。
- 50 封/分钟并发限速、429 延迟、额度暂停、消息幂等及重复回调去重通过。
- 在服务商凭据有效且明确授权测试收件人的情况下，验证真实送达与互动数据；不能用模拟事件代替真实送达验收。
- 站内信只在自有/授权测试网站验证，重启不会重复提交。
- 测试未登录 API、跨工作空间、未知域名和私有对象访问均被拒绝。
- readiness 正常；做一次实际备份恢复演练。

## 14. 回滚、备份与运维

### 回滚

若新服务器尚未接受写入，可以停止新消费者、恢复旧路由/DNS，再恢复旧消费者。

若新服务器已产生新询盘、发信或项目修改，不能只把 DNS 指回旧数据库。先停止新写入，备份新状态，核对并迁回新增数据、已发送消息 ID 和去重记录，再恢复旧端。不要把新旧邮件队列一起打开。

应用版本回退与数据库回退分别处理；有不兼容 schema 变化时不能只切容器镜像。旧 D1、R2、Pages 不在迁移当天删除。

### 备份与监控

- SQLite 使用在线备份或停写快照，保留版本和校验值；素材、发布产物及 metadata 一起备份。
- Redis 持久化、队列状态备份与数据库快照要有时间关联；恢复仍以业务幂等记录确认哪些任务可重试。
- 每日加密备份到另一台机器/对象存储，并定期执行恢复测试。只在同一硬盘留副本不是灾难恢复。
- 监控磁盘、SQLite busy 错误、Redis 内存、队列最老任务、浏览器内存、5xx、TLS 到期和供应商 429/鉴权错误。
- 日志脱敏，不记录模型/邮件服务 API Key、邮件正文和完整导入联系人。

## 15. 推荐实施顺序

1. 清点数据量、活跃任务、发布域名、有效凭据和 Product Radar 依赖。
2. 实现服务器运行适配，交付可重复部署的 Compose 包。
3. 在 Ubuntu + 宝塔进行数据副本演练，关闭真实副作用。
4. 维护窗口迁移工作台、数据和后台任务，保留 Pages 过渡。
5. 稳定运行后迁移客户网站及域名。
6. 完成恢复演练后，再逐步移除 Cloudflare 托管资源。

下一步的实际开发应是“服务器运行适配”，而不是立即更改主域名解析。
