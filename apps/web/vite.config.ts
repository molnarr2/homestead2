import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'

// vite-react-ssg reads `ssgOptions` (not part of Vite's own UserConfig type) and
// crawls the routes exported from src/main.tsx at build time, emitting a real
// index.html per route with fully rendered markup.
const config: UserConfig & { ssgOptions?: Record<string, unknown> } = {
  plugins: [{ enforce: 'pre', ...mdx() }, react()],
  ssgOptions: {
    script: 'async',
    formatting: 'none',
    dirStyle: 'nested',
    beastiesOptions: false,
  },
  build: {
    target: 'es2020',
  },
}

export default defineConfig(config)
