import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build = UM arquivo .html autocontido (CSS+JS embutidos) para abrir com
// duplo clique no Chrome, sem servidor (file://). `base: './'` mantém os
// caminhos relativos. `assetsInclude` cobre o idioma do OCR (binário .gz vai
// embutido em base64 pelo `assetsInlineLimit` alto).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  assetsInclude: ['**/*.traineddata.gz'],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
})
