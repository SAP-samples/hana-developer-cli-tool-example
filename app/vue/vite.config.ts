import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => ({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('ui5-')
        }
      }
    })
  ],
  base: command === 'build' ? '/ui/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/websockets': {
        target: 'http://localhost:3010',
        ws: true
      },
      '/hana': 'http://localhost:3010',
      '/api': 'http://localhost:3010',
      '/api-docs': 'http://localhost:3010',
      '/i18n': 'http://localhost:3010',
      '/': {
        target: 'http://localhost:3010',
        bypass(req) {
          if (req.method === 'PUT' && req.url === '/') return undefined
          if (req.method === 'GET' && req.url === '/' && req.headers.accept?.includes('application/json')) return undefined
          return req.url
        }
      }
    }
  },
  build: {
    outDir: 'dist'
  }
}))
