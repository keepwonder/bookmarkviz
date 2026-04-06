import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/echarts-wordcloud')) return 'echarts-wordcloud'
          if (id.includes('node_modules/echarts/') || id.includes('node_modules/zrender/')) return 'echarts'
        },
      },
    } as any,
  },
})
