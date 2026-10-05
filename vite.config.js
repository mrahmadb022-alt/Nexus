import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vitest covers the pure logic in src/lib; Playwright smoke tests live in tests/e2e.
  test: {
    include: ['src/**/*.test.js'],
  },
})
