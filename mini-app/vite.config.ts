import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      // mkcert поднимает self-signed HTTPS сертификат для dev-сервера.
      // Telegram WebView требует HTTPS даже на localhost, иначе initData
      // не приходит и SDK не инициализируется.
      mkcert(),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    server: {
      host: true,
      port: Number(env.VITE_DEV_PORT) || 5173,
    },
    build: {
      target: 'es2022',
      sourcemap: true,
      rollupOptions: {
        output: {
          // Разделяем основной чанк по библиотекам — снижает размер первого
          // загрузочного бандла, важно на iOS-WebView (медленный JS-парсинг).
          manualChunks: {
            telegram: ['@telegram-apps/sdk-react'],
            sentry: ['@sentry/react'],
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  }
})
