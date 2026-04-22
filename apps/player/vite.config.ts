import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { createReadStream, existsSync, statSync } from 'fs'
import type { Plugin } from 'vite'

const distRoot = resolve(__dirname, '../../dist')

function serveDistStories(): Plugin {
  return {
    name: 'serve-dist-stories',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/stories/')) return next()
        const filePath = resolve(distRoot, req.url.slice(1))
        if (!filePath.startsWith(distRoot)) return next()
        if (!existsSync(filePath) || !statSync(filePath).isFile()) return next()
        res.setHeader('Content-Type', 'audio/wav')
        res.setHeader('Accept-Ranges', 'bytes')
        createReadStream(filePath).pipe(res)
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), serveDistStories()],
  build: {
    outDir: '../../dist/player',
    emptyOutDir: true,
  },
})
