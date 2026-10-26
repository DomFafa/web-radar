import { readFileSync, existsSync } from 'node:fs';
import { parseArgs, parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const { values } = parseArgs({ options: { env: { type: 'string' } } });
if (values.env !== undefined && values.env !== 'test')
  throw Error('仅支持默认本地配置或 --env test。');
const varsFile = values.env === 'test' ? '.dev.vars.test' : '.dev.vars';
const vars = existsSync(`${root}${varsFile}`)
  ? parseEnv(readFileSync(`${root}${varsFile}`, 'utf8'))
  : {};
const python = `${root}services/site-builder/.venv/bin/python`;
if (!existsSync(python))
  throw Error('请先按 services/site-builder/README.md 安装 Python 服务依赖。');
const env = {
  ...process.env,
  SITE_BUILDER_KEY: process.env.SITE_BUILDER_KEY || vars.SITE_BUILDER_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || vars.TEXT_API_KEY,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || vars.TEXT_API_BASE_URL,
  IMAGE_API_KEY: process.env.IMAGE_API_KEY ?? vars.IMAGE_API_KEY,
  IMAGE_API_BASE_URL: process.env.IMAGE_API_BASE_URL ?? vars.IMAGE_API_BASE_URL,
  IMAGE_MODEL: process.env.IMAGE_MODEL ?? vars.IMAGE_MODEL,
  PROVIDER_MEDIA_ORIGINS: process.env.PROVIDER_MEDIA_ORIGINS ?? vars.PROVIDER_MEDIA_ORIGINS,
};
if (values.env === 'test')
  env.SITE_BUILDER_DB = process.env.SITE_BUILDER_DB ?? vars.SITE_BUILDER_DB ?? `${root}services/site-builder/data/test/builds.sqlite3`;
if (!env.SITE_BUILDER_KEY || !env.OPENAI_API_KEY)
  throw Error(`请填写 ${varsFile} 中的 SITE_BUILDER_KEY 和 TEXT_API_KEY。`);
const child = spawn(
  python,
  ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '7002', '--workers', '1'],
  {
    cwd: `${root}services/site-builder`,
    env,
    stdio: 'inherit',
  },
);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
