import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/mi-pana/',
  plugins: [react()],

  // ── Production build optimisations ──────────────────────────────────────────
  build: {
    // Target modern browsers — smaller output, no legacy polyfills
    target: 'es2020',
    // Warn when a chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
    // Strip console.* and debugger statements from production output
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Split vendor code into a separate chunk so it can be cached
        // independently of app code changes
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-qr': ['jsqr', 'qrcode.react'],
        },
      },
    },
    // esbuild drop options — remove all console/debugger calls in prod
    esbuildOptions: {
      drop: ['console', 'debugger'],
    },
  },

  // ── Dev server ───────────────────────────────────────────────────────────────
  server: {
    port: 5173,
    host: true,
    open: true,
  },

  // ── Test environment ─────────────────────────────────────────────────────────
  test: {
    environment: 'node',
  },
})
