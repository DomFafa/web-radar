import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date(process.env.VITE_DEPLOYED_AT || Date.now()).toISOString()),
    __BUILD_UPDATED_BY__: JSON.stringify(execFileSync('git', ['log', '-1', '--format=%an'], {
      cwd: fileURLToPath(new URL('.', import.meta.url)), encoding: 'utf8',
    }).trim()),
  },
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://127.0.0.1:8788',
      '/preview': 'http://127.0.0.1:8788',
      '/public': 'http://127.0.0.1:8788',
    },
  },
});
