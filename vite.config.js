import { resolve } from 'path'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  base: './',
  root: 'src',
  resolve: {
    extensions: ['.ts', '.svg'],
    alias: [
      { find: '@icons', replacement: fileURLToPath(new URL('./src/assets/icons/Editor', import.meta.url)) },
      { find: '@editor', replacement: fileURLToPath(new URL('./src/editor', import.meta.url)) }
    ]
  },
  build: {
    sourcemap: true,
    polyfill: false,
    outDir: '../dist',
    emptyOutDir: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['umd'],
      name: 'ExitusEditor'
    },
    rollupOptions: {
      output: {
        entryFileNames: 'exituseditor.js'
      }
    },
    esbuild: {
      drop: ['console', 'debugger']
    }
  },
  plugins: [
    svgLoader({
      defaultImport: 'raw'
    }),
    cssInjectedByJsPlugin({ styleId: 'exitus-editor-style' })
  ]
})
