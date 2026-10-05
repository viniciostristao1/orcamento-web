/// <reference types="vite/client" />

/** Idioma do OCR embutido em base64 no build (offline, arquivo único). */
declare module '*.traineddata.gz' {
  const src: string;
  export default src;
}
