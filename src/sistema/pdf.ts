import { agruparLinhasPdf, type FragmentoPdf } from './extracao';

let workerPronto = false;

/** pdf.js embutido: o worker vira Blob a partir do código inline (offline, arquivo único). */
async function pdfApi() {
  const pdfjs = await import('pdfjs-dist');
  if (!workerPronto) {
    const mod = (await import('pdfjs-dist/build/pdf.worker.min.mjs?raw')) as unknown as {
      default: string;
    };
    const codigo = typeof mod === 'string' ? mod : mod.default;
    const url = URL.createObjectURL(new Blob([codigo], { type: 'text/javascript' }));
    pdfjs.GlobalWorkerOptions.workerSrc = url;
    workerPronto = true;
  }
  return pdfjs;
}

export interface TextoPdf {
  paginas: number;
  texto: string;
}

/** Extrai o texto do PDF página a página, reconstruindo as linhas. */
export async function extrairTextoPdf(arquivo: File): Promise<TextoPdf> {
  const pdfjs = await pdfApi();
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const partes: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const pagina = await doc.getPage(p);
    const conteudo = await pagina.getTextContent();
    const itens = (conteudo.items as unknown as FragmentoPdf[]).filter(
      (i) => typeof i?.str === 'string',
    );
    partes.push(agruparLinhasPdf(itens));
  }
  await doc.destroy();
  return { paginas: doc.numPages, texto: partes.filter((t) => t.trim()).join('\n') };
}
