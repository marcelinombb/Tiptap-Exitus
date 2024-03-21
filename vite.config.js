import { defineConfig } from "vite";
import svgLoader from 'vite-svg-loader';
export default defineConfig({
  base: './',
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  plugins: [
    svgLoader({
      defaultImport: 'raw'
    })
  ]
});
