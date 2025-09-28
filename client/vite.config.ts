import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

// <https://vitejs.dev/config/>
export default defineConfig((env) => {
  const envars = loadEnv(env.mode, './');

  const serverURL = new URL(
    envars.VITE_SERVER_URL ?? '<http://localhost:3001>'
  );
  const serverAPIPath = envars.VITE_SERVER_API_PATH ?? '/api';

  return {
    envDir: './',

    define: {
      __API_PATH__: JSON.stringify(serverAPIPath),
    },

    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      port: 5173,
      proxy: {
        [serverAPIPath]: serverURL.origin,
      },
    },
  };
});
