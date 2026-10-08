/**
 * Extração de texto do orçamento do sistema (PDF/print) — funções PURAS
 * (testáveis sem pdf.js/tesseract). O fluxo é sempre com revisão: o texto
 * extraído aparece para conferência e só vira DADOS DO ORÇAMENTO no clique.
 */

import { normalizarTelefoneParaWhats, temTelefoneValido } from '../utils/telefone';

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

/** Resultado da leitura do orçamento do sistema Toyota (seções mapeadas). */
export interface SistemaToyota {
  /** Linhas de itens (vão para DADOS DO ORÇAMENTO). */
  dados: string;
  /** Reclamações originais (vão para DESCRIÇÃO DO REPARO). */
  descReparo: string;
  cliente: string;
  numero: string;
  data: string;
}

/** Linha de item do sistema: `ID Serviço|Peça ...` (com ou sem acento). */
const LINHA_ITEM = /^\d+\s+(?:Servi[cç]o|Pe[cç]a)\b/i;

/**
 * Mapeia o texto do PDF/print do sistema por seção (layout real):
 * - DADOS: linhas de item entre "It Tipo Código…" e "Fechamento";
 * - DESCRIÇÃO: linhas entre "Reclamações Originais…" e "Sugestão";
 * - cliente: o que vem após "Cliente Cadastro" (o "Cadastro" vem colado);
 * - número: o primeiro número do documento (primeira coisa que aparece);
 * - data: do cabeçalho (inclusive colada em "NºOrçamento Interno…").
 * Todo o resto é ignorado.
 */
export function extrairSistemaToyota(texto: string): SistemaToyota {
  const linhas = texto.split('\n');
  const out: SistemaToyota = { dados: '', descReparo: '', cliente: '', numero: '', data: '' };

  const idxItens = linhas.findIndex((l) => /^\s*It\s+Tipo\s+C[oó]digo/i.test(l));
  const idxFech = linhas.findIndex((l, i) => i > idxItens && /Fechamento/i.test(l));
  if (idxItens >= 0) {
    const fim = idxFech > idxItens ? idxFech : linhas.length;
    out.dados = linhas
      .slice(idxItens + 1, fim)
      .map((l) => l.trim())
      .filter((l) => LINHA_ITEM.test(l))
      .join('\n');
  }

  const idxRec = linhas.findIndex((l) => /Reclama[cç][oõ]es Originais/i.test(l));
  const idxSug = linhas.findIndex((l, i) => i > idxRec && /Sugest[aã]o/i.test(l));
  if (idxRec >= 0) {
    const fim = idxSug > idxRec ? idxSug : Math.min(idxRec + 12, linhas.length);
    out.descReparo = linhas
      .slice(idxRec + 1, fim)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join('\n');
  }

  const mCli = texto.match(/Cliente\s*Cadastro\s*([A-ZÀ-Ú0-9 .&'/-]{3,60})/i);
  if (mCli) out.cliente = mCli[1].trim().replace(/\s+/g, ' ');

  for (const l of linhas.slice(0, 6)) {
    const m = l.trim().match(/^(\d{4,})\s*$/);
    if (m) {
      out.numero = m[1];
      break;
    }
  }

  const cab = extrairCabecalho(texto);
  if (!cab.data) {
    const m = texto.match(/Or[cç]amento Interno\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (m) cab.data = m[1];
  }
  out.data = cab.data;
  return out;
}

/** Entrada da escolha de fonte do play (tudo já trimado fora, compara-se aqui). */
export interface EstadoFontePlay {
  descCampo: string;
  dadosCampo: string;
  revDesc: string;
  revDados: string;
  /** O usuário digitou nos campos depois da última extração/uso? */
  camposSujos: boolean;
  /** Chegou extração nova ainda não usada? */
  revisaoFresca: boolean;
}

/**
 * Decide o que o play soma: revisão fresca + campos intactos = vale a revisão
 * (anexar + play direto funciona, sem o "Usar"); de resto, cada lado cai para
 * o que tiver conteúdo (campo primeiro). Edição manual nos campos vence sempre.
 */
export function decidirFontePlay(e: EstadoFontePlay): {
  desc: string;
  dados: string;
  usouRevisao: boolean;
} {
  const descCampo = e.descCampo.trim();
  const dadosCampo = e.dadosCampo.trim();
  const revDesc = e.revDesc.trim();
  const revDados = e.revDados.trim();
  if (!e.camposSujos && e.revisaoFresca && (revDesc || revDados)) {
    return { desc: revDesc || descCampo, dados: revDados || dadosCampo, usouRevisao: true };
  }
  return { desc: descCampo || revDesc, dados: dadosCampo || revDados, usouRevisao: false };
}

/** Cabeçalho detectado no texto (tudo opcional; editável antes de salvar). */
export interface CabecalhoOrcamento {
  numero: string;
  placa: string;
  nome: string;
  data: string;
  /** Telefone normalizado (55 + DDD + número) ou '' quando inválido. */
  telefone: string;
  /** Chassi/VIN (17 caracteres) ou '' quando não achou. */
  chassi: string;
}

const VAZIO: CabecalhoOrcamento = { numero: '', placa: '', nome: '', data: '', telefone: '', chassi: '' };

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

  // Telefone: prefere o Celular (móvel com DDD); cai para Fone/Tel.
  // Normalizado com 55 na frente (ex.: 51-981765337 → 5551981765337).
  const mCel =
    texto.match(/(?:CELULAR|CEL)[\s:.]*([\d\s().-]{8,25})/i) ??
    texto.match(/(?:FONE|TEL(?:EFONE)?)[\s:.]*([\d\s().-]{8,25})/i);
  if (mCel) {
    const normalizado = normalizarTelefoneParaWhats(mCel[1]);
    if (temTelefoneValido(normalizado)) out.telefone = normalizado;
  }

  // Chassi/VIN: 17 caracteres. Vale rotulado (CHASSI, Nr.Fab etc.) ou avulso
  // (no layout Toyota os rótulos ficam numa linha e os valores noutra). Todo
  // VIN real tem letra E dígito — palavra comum de 17 letras (ex. o
  // "RESPONSABILIZAMOS" do termo de garantia) não vale; 17 só-dígitos também não.
  const ehVin = (t: string): boolean =>
    /^[A-Z0-9]{17}$/.test(t) && /[A-Z]/.test(t) && /\d/.test(t);
  const rotulados = [
    ...texto.matchAll(
      /(?:CHASSI[SU]?|NR\.?\s*FAB|N[UÚ]MERO\s*(?:DO\s*)?CHASSI|VIN)\b[\s:.]*([A-Z0-9]{17})(?![A-Z0-9])/gi,
    ),
  ];
  const rotulado = rotulados.map((m) => m[1].toUpperCase()).find(ehVin);
  if (rotulado) {
    out.chassi = rotulado;
  } else {
    const avulsos = texto.toUpperCase().match(/(?<![A-Z0-9])[A-Z0-9]{17}(?![A-Z0-9])/g) ?? [];
    const vin = avulsos.find(ehVin);
    if (vin) out.chassi = vin;
  }
  return out;
}
