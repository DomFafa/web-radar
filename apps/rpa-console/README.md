# Web Radar · RPA 任务控制台（Mock）

独立前端原型，基于 Web Radar 的 `radar-ui-foundation-v1` 视觉风格。所有脚本、任务结果、日志及统计仅存在浏览器内存中，刷新后会重置。

```sh
cd apps/rpa-console
npm run check
npm run build
python3 -m http.server 4173 --directory dist
```

打开 `http://127.0.0.1:4173/`。可以搜索和选择四个演示脚本、模拟执行、查看状态、进度、日志或清空日志。模拟执行无需依赖安装、密钥、数据库或环境变量。

## 隔离边界

- 所有代码仅位于 `apps/rpa-console/`，构建输出到独立的 `dist/`。
- 无 `fetch`、WebSocket、HTTP 客户端、外部脚本、生产服务地址、RPA SDK 或 Cloudflare 绑定。
- 不依赖现有 Web Radar 应用的运行时、部署工作流和环境变量。
- 本目录不包含 Sites 项目 ID；Sites 创建成功后才能使用该项目自己的项目 ID 与私有预览。
