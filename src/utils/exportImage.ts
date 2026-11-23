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
 * Classe do gêmeo off-screen da exportação PNG (ver `prepararClonePng`).
 * Nunca existe na tela: só o clone da captura a recebe, então as regras
 * `.png-compacto` do CSS valem só no PNG — a edição e o preview não mudam.
 */
export const PNG_COMPACTO_CLASS = 'png-compacto';

/**
 * Clona o nó para um gêmeo invisível fora da tela, com a MESMA largura do
 * original e o estado atual dos campos sincronizado (valor dos textareas,
 * valor/checked dos inputs, valor dos selects), e devolve o gêmeo + a limpeza.
 * O html-to-image copia o estilo computado de cada nó que captura — como o
 * gêmeo está no documento (fora da viewport, sem sair do fluxo visível), o
 * cálculo é idêntico ao da tela, e a classe compacta só nele ajusta os
 * respiros no PNG. O original nunca é tocado (sem flash no preview).
 * O esconderijo fica num INVÓLUCRO (nunca serializado): estilos de
 * posicionamento no próprio gêmeo vazariam para o SVG e deslocariam a pintura
 * para fora da imagem (PNG em branco). Só vale para o orçamento
 * (`#printable-quote`); o flyer e outros nós seguem o caminho direto de antes,
 * byte a byte.
 */
export function prepararClonePng(original: HTMLElement): {
  clone: HTMLElement;
  limpar: () => void;
} {
  const clone = original.cloneNode(true) as HTMLElement;
  // cloneNode não leva o estado digitado (vale o atributo inicial) — espelha
  // o que o html-to-image faria ao clonar o original (valor/checked atuais).
  const origem = [original, ...Array.from(original.querySelectorAll('*'))];
  const destino = [clone, ...Array.from(clone.querySelectorAll('*'))];
  origem.forEach((o, i) => {
    const c = destino[i] as HTMLElement;
    if (o instanceof HTMLTextAreaElement && c instanceof HTMLTextAreaElement) {
      c.value = o.value;
    } else if (o instanceof HTMLInputElement && c instanceof HTMLInputElement) {
      if (o.type === 'checkbox' || o.type === 'radio') {
        c.checked = o.checked;
        if (o.checked) c.setAttribute('checked', '');
        else c.removeAttribute('checked');
      } else {
        c.value = o.value;
      }
    } else if (o instanceof HTMLSelectElement && c instanceof HTMLSelectElement) {
      c.value = o.value;
    }
  });
  clone.classList.add(PNG_COMPACTO_CLASS);
  clone.setAttribute('aria-hidden', 'true');
  // Mesma largura do original (fora do fluxo o bloco esticaria na viewport e
  // mudaria as quebras de linha). Altura continua do conteúdo: sem fixar.
  // Só largura aqui: o resto do esconderijo vai no invólucro (fora do SVG).
  clone.style.width = window.getComputedStyle(original).width;
  const invólucro = document.createElement('div');
  invólucro.setAttribute('aria-hidden', 'true');
  invólucro.style.position = 'fixed';
  invólucro.style.left = '-10000px';
  invólucro.style.top = '0';
  invólucro.appendChild(clone);
  document.body.appendChild(invólucro);
  return { clone, limpar: () => invólucro.remove() };
}

/**
 * Exporta o nó como PNG (mesmo fluxo do `toPng` do html-to-image: fontes
 * embutidas, `pixelRatio`, fundo) — mas sem a redução de 0.1px, que mudava a
 * quebra de linha na captura. Ver `restaurarFontesReduzidas`.
 */
export const exportarPng = async (node: HTMLElement, opcoes: OpcoesPng = {}): Promise<string> => {
  // O 1.11.13 não tem `onClone`: o compacto vai num gêmeo off-screen (só PNG).
  const pre = node.id === 'printable-quote' ? prepararClonePng(node) : null;
  let svgDataUrl: string;
  try {
    svgDataUrl = await htmlToImage.toSvg(pre?.clone ?? node, opcoes);
  } finally {
    pre?.limpar();
  }
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
