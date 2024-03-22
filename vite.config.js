import { defineConfig } from "vite";
import { resolve } from 'path'

import svgLoader from 'vite-svg-loader';
export default defineConfig({
  base: './',
  root: "src",
  build: {
    polyfill: false,
    outDir: "../dist",
    emptyOutDir: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['umd'],
      name: 'ExitusEditor',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'exituseditor.js',
      }
    }
  },
  plugins: [
    svgLoader({
      defaultImport: 'raw'
    })
  ]
});
