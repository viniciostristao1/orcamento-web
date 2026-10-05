import { createWorker } from 'tesseract.js';
import workerCodigo from 'tesseract.js/dist/worker.min.js?raw';
import nucleoCodigo from 'tesseract.js-core/tesseract-core-simd-lstm.wasm.js?raw';
// Português embutido (base64 no build): o worker busca via fetch interceptado.
import dadosPor from './por.traineddata.gz';

export type ProgressoOCR = (estado: string, fracao: number) => void;

const URL_NUCLEO = '#/tesseract-core.js'; // sufixo "js": importScripts direto, sem fetch do .wasm
const MARCA_IDIOMA = '.traineddata';

/**
 * tesseract.js 100% offline em arquivo único:
 * - worker e núcleo viram Blobs do código inline (o núcleo `.wasm.js` já traz
 *   o wasm embutido — nenhum fetch externo);
 * - o `por.traineddata.gz` vai embutido (base64 no build, arquivo no dev) e é
 *   lido na thread principal para um Blob: só URLs `blob:` funcionam dentro do
 *   worker (relativas não resolvem, `data:` gigantes custam parse a cada load).
 *   O fetch do worker é interceptado para servi-lo.
 */
function urlBlob(codigo: string): string {
  return URL.createObjectURL(new Blob([codigo], { type: 'text/javascript' }));
}

let langBlobUrl: string | null = null;

/** Lê os bytes do idioma uma vez e devolve URL blob (vale no dev e no build). */
async function urlIdioma(): Promise<string> {
  if (!langBlobUrl) {
    const bytes = await (await fetch(String(dadosPor))).arrayBuffer();
    langBlobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/gzip' }));
  }
  return langBlobUrl;
}

function codigoWorkerRemendado(langUrl: string): string {
  const servirIdioma =
    `var __TD=${JSON.stringify(langUrl)};` +
    `var __FETCH=fetch.bind(self);` +
    `self.fetch=function(u,o){try{if(String(u).indexOf(${JSON.stringify(MARCA_IDIOMA)})!==-1)return __FETCH(__TD,o);}catch(e){}return __FETCH(u,o);};\n`;
  const worker = typeof workerCodigo === 'string' ? workerCodigo : (workerCodigo as unknown as { default: string }).default;
  return servirIdioma + worker;
}

/** Lê 1+ prints (imagens) e devolve o texto somado, na ordem escolhida. */
export async function lerPrints(arquivos: File[], onProgresso?: ProgressoOCR): Promise<string> {
  const worker = await createWorker('por', undefined, {
    workerPath: urlBlob(codigoWorkerRemendado(await urlIdioma())),
    corePath: urlBlob(
      typeof nucleoCodigo === 'string' ? nucleoCodigo : (nucleoCodigo as unknown as { default: string }).default,
    ) + URL_NUCLEO,
    cacheMethod: 'none',
    logger: (m: { status?: string; progress?: number }) =>
      onProgresso?.(String(m?.status ?? 'lendo'), Number(m?.progress ?? 0)),
  });
  try {
    const textos: string[] = [];
    for (let i = 0; i < arquivos.length; i++) {
      onProgresso?.(`lendo print ${i + 1} de ${arquivos.length}`, i / arquivos.length);
      const r = await worker.recognize(arquivos[i]);
      textos.push(String(r?.data?.text ?? ''));
    }
    return textos.filter((t) => t.trim()).join('\n');
  } finally {
    await worker.terminate();
  }
}
