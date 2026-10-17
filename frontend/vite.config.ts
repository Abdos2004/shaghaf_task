import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')
  const apiBasePath = environment.VITE_API_BASE_PATH || '/api'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        [apiBasePath]: {
          target: environment.VITE_API_PROXY_TARGET || 'http://localhost:5266',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

