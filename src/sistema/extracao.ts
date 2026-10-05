/**
 * Extração de texto do orçamento do sistema (PDF/print) — funções PURAS
 * (testáveis sem pdf.js/tesseract). O fluxo é sempre com revisão: o texto
 * extraído aparece para conferência e só vira DADOS DO ORÇAMENTO no clique.
 */

/** Um fragmento de texto do pdf.js (str + posição + quebra de linha). */
export interface FragmentoPdf {
  str: string;
  hasEOL?: boolean;
  /** transform do pdf.js: [escalaX, skewY, skewX, escalaY, x, y]. */
  transform?: number[];
}

/**
 * Junta os fragmentos em linhas. Resolve o "colou tudo numa linha só":
 * agrupa por coordenada Y (tolerância) e respeita `hasEOL` quando existe.
 */
export function agruparLinhasPdf(itens: FragmentoPdf[]): string {
  const linhas: string[] = [];
  let atual = '';
  let yAtual: number | null = null;
  const TOL = 2;

  const descarregar = () => {
    if (atual.trim()) linhas.push(atual.replace(/\s+/g, ' ').trim());
    atual = '';
  };

  for (const item of itens) {
    const y = item.transform ? item.transform[5] : null;
    if (yAtual === null) {
      yAtual = y;
    } else if (y !== null && yAtual !== null && Math.abs(y - yAtual) > TOL) {
      descarregar();
      yAtual = y;
    }
    atual += item.str;
    if (item.hasEOL) {
      descarregar();
      yAtual = null;
    }
  }
  descarregar();
  return linhas.join('\n');
}

/**
 * Limpeza genérica do texto extraído (PDF ou OCR): apara, tira linhas vazias
 * e colapsa espaços. NÃO interpreta valores — isso é na revisão/processamento.
 */
export function normalizarTextoExtraido(texto: string): string {
  return texto
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 0)
    .join('\n');
}

/** Cabeçalho detectado no texto (tudo opcional; editável antes de salvar). */
export interface CabecalhoOrcamento {
  numero: string;
  placa: string;
  nome: string;
  data: string;
}

const VAZIO: CabecalhoOrcamento = { numero: '', placa: '', nome: '', data: '' };

/**
 * Procura número, placa, nome/cliente e data nas linhas (rótulos comuns de
 * orçamento: ORÇAMENTO/Nº, PLACA, CLIENTE/NOME, DATA/EMISSÃO). Sem rótulo,
 * tenta placa Mercosul/antiga e data avulsas na 1ª metade do texto.
 */
export function extrairCabecalho(texto: string): CabecalhoOrcamento {
  const out = { ...VAZIO };
  const linhas = texto.split('\n').slice(0, 40);

  for (const linha of linhas) {
    const l = linha.trim();
    if (!l) continue;
    let m: RegExpMatchArray | null;
    if (!out.numero && (m = l.match(/(?<![A-ZÀ-Ú0-9])(?:OR[CÇ]AMENTO|N[º°]|NO\.?|N[UÚ]MERO|PEDIDO|O\.?S\.?)[\s:.\-#]*(\d[\d./-]{2,})/i))) {
      out.numero = m[1].replace(/[^\d]/g, '') || m[1];
    }
    if (!out.placa && (m = l.match(/PLACA[\s:.\-]*([A-Z0-9-]{7,8})/i))) {
      out.placa = m[1].toUpperCase();
    }
    if (!out.nome && (m = l.match(/(?:CLIENTE|NOME|RAZ[AÃ]O(?: SOCIAL)?|EMPRESA|CONDUTOR)[\s:.]*([A-ZÀ-Ú0-9 .&'/-]{3,60})/i))) {
      out.nome = m[1].trim().replace(/\s+/g, ' ');
    }
    if (!out.data && (m = l.match(/(?:DATA|EMISS[AÃ]O|ABERTURA)[\s:.]*(\d{2}\/\d{2}\/\d{4})/i))) {
      out.data = m[1];
    }
  }

  // Sem rótulo: placa (Mercosul ABC1D23 ou antiga ABC-1234) e data avulsas.
  if (!out.placa) {
    const m = linhas.join(' ').match(/\b([A-Z]{3}\d[A-Z0-9]\d{2}|[A-Z]{3}-?\d{4})\b/);
    if (m) out.placa = m[1].toUpperCase();
  }
  if (!out.data) {
    const m = linhas.join(' ').match(/\b(\d{2}\/\d{2}\/\d{4})\b/);
    if (m) out.data = m[1];
  }
  return out;
}
