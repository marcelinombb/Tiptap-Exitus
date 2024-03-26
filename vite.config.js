import { defineConfig } from "vite";
import { resolve } from 'path'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import svgLoader from 'vite-svg-loader';

export default defineConfig({
  base: './',
  root: "src",
  build: {
    sourcemap: true,
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
    }),
    cssInjectedByJsPlugin({styleId: "exitus-editor-style"}),
  ]
});
