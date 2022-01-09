import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@components': path.join(process.cwd(), './src/components'),
      '@utils': path.join(process.cwd(), './src/utils'),
      '@request': path.join(process.cwd(), './src/request')
    }
  }
})
