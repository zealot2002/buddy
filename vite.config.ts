import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // 前端会直接 import ../api/data/*.ts；带扩展名的请求交给 Vite，勿转发 Express
        bypass(req) {
          const pathname = req.url?.split('?')[0] ?? '';
          if (/\.(ts|tsx|js|mjs|json|css)(\?|$)/.test(pathname)) {
            return pathname;
          }
          return null;
        },
      },
    },
  },
})
