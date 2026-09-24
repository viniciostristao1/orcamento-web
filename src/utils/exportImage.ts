import * as htmlToImage from 'html-to-image';

type OpcoesPng = Parameters<typeof htmlToImage.toPng>[1];

/**
 * O html-to-image grava no clone os estilos computados, mas reduz todo
 * `font-size` em 0.1px (`Math.floor(px) - 0.1`, ver clone-node.js). Assim um texto
 * que quebra em 2 linhas no navegador passa a caber em 1 linha no SVG e, como a
 * altura da linha vai fixa, sobra um vão antes do divisor/total (caso clássico:
 * último item de "Itens Não Realizados" longe do "Total Não Realizado" só no PNG).
 * Esta função devolve ao SVG os tamanhos reais de fonte medidos no documento.
 */
export const restaurarFontesReduzidas = (svg: string, fontSizes: Iterable<string>): string => {
  let corrigido = svg;
  for (const tamanho of new Set(fontSizes)) {
    const px = parseFloat(tamanho);
    if (!Number.isFinite(px)) continue;
    const reduzido = `${Math.floor(px) - 0.1}px`;
    if (reduzido === tamanho) continue;
    // Troca só ocorrências "inteiras": sem isso, o reduzido de 10px ("9.9px")
    // casaria dentro do de 30px ("29.9px") e viraria 210px (texto gigante).
    const escapado = reduzido.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    corrigido = corrigido.replace(new RegExp(`(?<![\\d.])${escapado}`, 'g'), tamanho);
  }
  return corrigido;
};

const carregarImagem = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

/**
 * Exporta o nó como PNG (mesmo fluxo do `toPng` do html-to-image: fontes
 * embutidas, `pixelRatio`, fundo) — mas sem a redução de 0.1px, que mudava a
 * quebra de linha na captura. Ver `restaurarFontesReduzidas`.
 */
export const exportarPng = async (node: HTMLElement, opcoes: OpcoesPng = {}): Promise<string> => {
  const svgDataUrl = await htmlToImage.toSvg(node, opcoes);
  const svgOriginal = decodeURIComponent(
    svgDataUrl.replace(/^data:image\/svg\+xml[^,]*,/, ''),
  );

  const fontSizes = [node, ...node.querySelectorAll<HTMLElement>('*')].map(
    (el) => window.getComputedStyle(el).fontSize,
  );
  const svg = restaurarFontesReduzidas(svgOriginal, fontSizes);

  const img = await carregarImagem(
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
  );

  const ratio = opcoes.pixelRatio || window.devicePixelRatio || 1;
  const limiteCanvas = 16384;
  const escala = Math.min(ratio, limiteCanvas / img.width, limiteCanvas / img.height);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * escala));
  canvas.height = Math.max(1, Math.round(img.height * escala));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponível');

  if (opcoes.backgroundColor) {
    ctx.fillStyle = opcoes.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL();
};
