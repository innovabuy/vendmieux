import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync } from 'fs'
import { resolve } from 'path'

function fontPreloadPlugin() {
  return {
    name: 'font-preload',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      const fontFiles = Object.keys(ctx.bundle).filter(
        f => f.endsWith('.woff2') && /latin-(400|600)-normal/.test(f)
      );
      const preloadTags = fontFiles.map(
        f => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/${f}">`
      ).join('\n    ');
      return html.replace('</title>', `</title>\n    ${preloadTags}`);
    }
  }
}

export default defineConfig({
  plugins: [react(), fontPreloadPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          livekit: ['livekit-client'],
        }
      }
    }
  }
})
