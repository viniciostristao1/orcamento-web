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

/** Resultado do orçamento complementar (novo layout de entrada). */
export interface SistemaComplementar {
  /** Uma linha de Serviço por item: `N Serviço COD TITULO VALOR`. */
  dados: string;
  /** Títulos numerados: `01 TITULO`. */
  descReparo: string;
  cliente: string;
  numero: string;
  placa: string;
  /** Data de Criação do documento. */
  data: string;
  /** Valor do "orçamento inicial" (ex.: "3.040,92") ou '' quando não achou. */
  revisaoInicial: string;
}

/**
 * Detecta o novo layout de entrada: ORÇAMENTO DE SERVIÇOS COMPLEMENTARES
 * com totais por item ("Total do Serviço" ou ao menos "Total Peças").
 * Usado para escolher o parser.
 */
export function ehLayoutComplementar(texto: string): boolean {
  return (
    /OR[CÇ]AMENTO DE SERVI[CÇ]OS COMPLEMENTARES/i.test(texto) &&
    (/Total do Servi[cç]o/i.test(texto) || /Total Pe[cç]as/i.test(texto))
  );
}

const TITULO_INVALIDO = /^(Servi[cç]os Complementares|OR[CÇ]AMENTO|TOYOTA|P[aá]gina|Total Or[cç]amento|Assinatura|Observa[cç][aã]o|Modelo Ve[ií]culo|Nº:|Placa:|C[oó]digo|Consultor|Mec[aâ]nico)$/i;

/** Soma dois valores BR ("209,89" + "0,00" → "209,89"). */
const somarBR = (a: string, b: string): string => {
  const n = (v: string): number => {
    const f = parseFloat(v.replace(/\./g, '').replace(',', '.'));
    return isNaN(f) ? 0 : f;
  };
  return (n(a) + n(b)).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Extrai o layout complementar (ex.: JBG-6E46.pdf, 4376.pdf) — função PURA.
 * Cada bloco = título solto antes de "Código Peça" + linha de totais
 * ("Total Peças: R$ X | Total MO: R$ Y | Total do Serviço: R$ Z").
 * Gera 1 linha de Serviço por item (com o Total do Serviço) e numera os
 * títulos (01, 02, ...) para a DESCRIÇÃO. A saída (soma) usa a mesma lógica.
 */
export function extrairComplementar(texto: string): SistemaComplementar {
  const out: SistemaComplementar = {
    dados: '',
    descReparo: '',
    cliente: '',
    numero: '',
    placa: '',
    data: '',
    revisaoInicial: '',
  };
  const linhas = texto.split('\n');

  const mRev = texto.match(/or[cç]amento inicial\s+R\$\s*([\d.,]+)/i);
  if (mRev) out.revisaoInicial = mRev[1].trim();

  const mNum = texto.match(/Nº:\s*(\d{4,})/);
  if (mNum) out.numero = mNum[1];
  const mCli = texto.match(/Nome Cliente:\s*([A-ZÀ-Ú0-9 .&'/-]{3,60})/i);
  if (mCli && mCli[1].trim()) out.cliente = mCli[1].trim().replace(/\s+/g, ' ');
  if (!out.cliente) {
    // PDF cru quebra rótulo e valor em linhas ("Nome Cliente:" / "FULANO").
    for (let i = 0; i < linhas.length; i++) {
      if (/^\s*Nome Cliente:\s*$/.test(linhas[i])) {
        for (let j = i + 1; j < Math.min(i + 4, linhas.length); j++) {
          const t = linhas[j].trim();
          if (t && /[A-ZÀ-Ú]/.test(t) && !/^(Telefone|E-mail|Modelo|Placa|OS:|Data)/i.test(t)) {
            out.cliente = t.replace(/\s+/g, ' ');
            break;
          }
        }
        break;
      }
    }
  }
  const mData = texto.match(/Data de Cria[cç][aã]o:\s*(\d{2}\/\d{2}\/\d{4})/i);
  if (mData) out.data = mData[1];

  // Placa reaproveita a lógica geral (rotulada ou avulsa).
  const cab = extrairCabecalho(texto);
  if (!out.numero && cab.numero) out.numero = cab.numero;
  if (cab.placa) out.placa = cab.placa;
  if (!out.cliente && cab.nome) out.cliente = cab.nome;
  if (!out.data && cab.data) out.data = cab.data;

  const blocos: { titulo: string; codigoMO: string; total: string }[] = [];
  for (let i = 0; i < linhas.length; i++) {
    if (!/^\s*Código Peça\b/i.test(linhas[i])) continue;
    // Título: primeira linha não-vazia acima que não seja cabeçalho conhecido.
    let titulo = '';
    for (let j = i - 1; j >= 0; j--) {
      const t = linhas[j].trim();
      if (!t) continue;
      if (TITULO_INVALIDO.test(t)) break;
      if (/^(Código|Total|Página|Rodovia|\(51\)|94\.674|Consultor|Mecânico|Placa:|Modelo|OS:|Nº:)/i.test(t)) break;
      titulo = t.replace(/\s+/g, ' ').trim();
      break;
    }
    if (!titulo) continue;
    // Totais + código MO: procura à frente até o próximo bloco.
    // O cabeçalho pode vir junto ("Código MO Descrição …") ou quebrado em
    // linhas ("Código MO" / "Descrição" / … / "GUN…"), conforme o extrator.
    // Nem todo bloco traz "Total do Serviço" (ex.: 4376.pdf, bloco VIA TANQUE
    // com MO zerada mostra só "Total Peças: R$ 209,89") — aí vale
    // Total Peças + Total MO.
    let totalServico = '';
    let totalPecas = '';
    let totalMO = '';
    let codigoMO = '';
    let viuCodigoMO = false;
    const IGNORAR_MO = /^(Descrição|Descricao|Tempo|Custo|Qtd|Preço|Preco|Unit|Estoque|Total|Peças|Pecas|MO|Código|Codigo)$/i;
    for (let k = i + 1; k < linhas.length; k++) {
      if (/^\s*Código Peça\b/i.test(linhas[k])) break;
      const mTotS = linhas[k].match(/Total do Servi[cç]o:\s*R\$\s*([\d.,]+)/i);
      if (mTotS && !totalServico) totalServico = mTotS[1].trim();
      const mTotP = linhas[k].match(/Total Pe[cç]as:\s*R\$\s*([\d.,]+)/i);
      if (mTotP && !totalPecas) totalPecas = mTotP[1].trim();
      const mTotM = linhas[k].match(/Total MO:\s*R\$\s*([\d.,]+)/i);
      if (mTotM && !totalMO) totalMO = mTotM[1].trim();
      if (/^\s*Código MO\b/i.test(linhas[k])) {
        viuCodigoMO = true;
        continue;
      }
      if (viuCodigoMO && !codigoMO) {
        const t = linhas[k].trim();
        if (!t || IGNORAR_MO.test(t)) continue;
        const mCod = t.match(/^([A-Z0-9]{3,})/);
        if (mCod && /[A-Z]/.test(mCod[1])) {
          codigoMO = mCod[1];
        }
      }
      if (totalServico && codigoMO) break;
    }
    const total = totalServico || (totalPecas ? somarBR(totalPecas, totalMO || '0,00') : '');
    if (titulo && total) {
      blocos.push({ titulo, codigoMO: codigoMO || 'COMPL', total });
    }
  }

  out.dados = blocos
    .map((b, idx) => `${idx + 1} Serviço ${b.codigoMO} ${b.titulo} ${b.total}`)
    .join('\n');
  out.descReparo = blocos
    .map((b, idx) => `${String(idx + 1).padStart(2, '0')} ${b.titulo}`)
    .join('\n');
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
 * Dígito verificador do VIN (ISO 3779, posição 9): transliterar, ponderar e
 * mod 11 (10 = 'X'). Desempata VIN colado com dígito vizinho (ex.: Hr "0" +
 * VIN) — só o verdadeiro valida. I/O/Q nunca existem em VIN real.
 */
const VIN_PESO = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
const VIN_VALOR: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4,
  N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};

export function vinDigitoOk(vin: string): boolean {
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return false;
  let soma = 0;
  for (let i = 0; i < 17; i++) {
    const c = vin[i];
    const v = /\d/.test(c) ? parseInt(c, 10) : VIN_VALOR[c];
    if (v === undefined) return false;
    soma += v * VIN_PESO[i];
  }
  const resto = soma % 11;
  return vin[8] === (resto === 10 ? 'X' : String(resto));
}

// Chassi/VIN: 17 caracteres do alfabeto VIN (sem I, O e Q — nunca existem em
// VIN real). Vale rotulado (CHASSI, Nr.Fab etc., no texto todo) ou avulso no
// CABEÇALHO (primeiras linhas, fora das linhas de item — código de peça +
// palavras ("CARE040703 AUTO AIR") também somam 17 e não são chassi).
// Todo VIN real tem letra E dígito — palavra comum de 17 letras (ex. o
// "RESPONSABILIZAMOS" da garantia vinha antes do VIN no texto e era pego
// pela busca avulsa). Sem o formato VIN, o campo fica vazio (nunca se
// preenche com outro dado, ex.: Nº do orçamento + marca "19384747853TOYOTA").
const ehVin = (t: string): boolean =>
  /^[A-HJ-NPR-Z0-9]{17}$/.test(t) && /[A-HJ-NPR-Z]/.test(t) && /\d/.test(t);

/** Um candidato só vence; vários, só com dígito único válido (senão em branco). */
const escolherVin = (candidatos: string[]): string | undefined => {
  const unicos = [...new Set(candidatos)];
  if (unicos.length === 1) return unicos[0];
  const validos = unicos.filter(vinDigitoOk);
  return validos.length === 1 ? validos[0] : undefined;
};

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

  const ehItem = (l: string): boolean => LINHA_ITEM.test(l.trim());
  const rotulados = [
    ...texto.matchAll(
      /(?:CHASSI[SU]?|NR\.?\s*FAB|N[UÚ]MERO\s*(?:DO\s*)?CHASSI|VIN)\b[\s:.]*([A-Z0-9]{17})(?![A-Z0-9])/gi,
    ),
  ];
  const rotulado = rotulados.map((m) => m[1].toUpperCase()).find(ehVin);
  if (rotulado) {
    out.chassi = rotulado;
  } else {
    const cima = texto.toUpperCase();
    const topo = cima
      .split('\n')
      .slice(0, 40)
      .filter((l) => !ehItem(l));
    // Janelas de 17 em trechos de 17–24 (cobre o VIN colado com 1–2 dígitos do
    // campo vizinho, ex.: Hr "0" + VIN): uma só vence; várias, só com dígito
    // único válido (melhor em branco que errado).
    const janelas: string[] = [];
    for (const m of topo.join(' ').match(/(?<![A-Z0-9])[A-Z0-9]{17,24}(?![A-Z0-9])/g) ?? []) {
      for (let k = 0; k + 17 <= m.length; k++) {
        const w = m.slice(k, k + 17);
        if (ehVin(w)) janelas.push(w);
      }
    }
    const vin = escolherVin(janelas);
    if (vin) {
      out.chassi = vin;
    } else {
      // VIN quebrado (corte do pdf.js ou espaços do OCR, ex.: "8AJYY59G4 F6528539"
      // ou "8AJY Y59G4 F6528539"): junta 2–3 tokens vizinhos separados só por
      // espaço (1–2), partes de 3+ somando 17. Parte curta não vale (senão
      // "0 8AJYY59G4F65285" vira falso). Por índice (regex consumiria o texto e
      // pularia combinações sobrepostas, ex.: o "VIN" antes do VIN triplo).
      const linhas = topo;
      const quebrados: string[] = [];
      const vale = (t: string): boolean => t.length === 17 && ehVin(t);
      const espaco = (fim: number, ini: number, linha: string): boolean => /^[ \t]{1,2}$/.test(linha.slice(fim, ini));
      for (const linha of linhas) {
        const toks = [...linha.matchAll(/[A-Z0-9]+/g)];
        for (let i = 0; i < toks.length; i++) {
          const t1 = toks[i][0];
          if (t1.length >= 3 && i + 1 < toks.length) {
            const t2 = toks[i + 1][0];
            const fim1 = (toks[i].index ?? 0) + t1.length;
            if (t2.length >= 3 && espaco(fim1, toks[i + 1].index ?? 0, linha) && vale(t1 + t2)) {
              quebrados.push(t1 + t2);
            }
          }
          if (t1.length >= 3 && i + 2 < toks.length) {
            const t2 = toks[i + 1][0];
            const t3 = toks[i + 2][0];
            const fim1 = (toks[i].index ?? 0) + t1.length;
            const fim2 = (toks[i + 1].index ?? 0) + t2.length;
            if (
              t2.length >= 3 &&
              t3.length >= 3 &&
              espaco(fim1, toks[i + 1].index ?? 0, linha) &&
              espaco(fim2, toks[i + 2].index ?? 0, linha) &&
              vale(t1 + t2 + t3)
            ) {
              quebrados.push(t1 + t2 + t3);
            }
          }
        }
      }
      const achou = escolherVin(quebrados);
      if (achou) {
        out.chassi = achou;
      } else {
        // VIN partido em DUAS LINHAS (ex.: "...8AJYY59G4" + "F6528539 ..."):
        // fim alfanumérico de uma + começo da próxima, somando 17.
        const partidos: string[] = [];
        for (let i = 0; i + 1 < linhas.length; i++) {
          const fim = (linhas[i].match(/[A-Z0-9]{1,16}$/) ?? [''])[0];
          const comeco = (linhas[i + 1].match(/^[A-Z0-9]{1,16}/) ?? [''])[0];
          for (let k = Math.max(1, 17 - comeco.length); k <= Math.min(16, fim.length); k++) {
            const junto = fim.slice(-k) + comeco.slice(0, 17 - k);
            if (ehVin(junto)) partidos.push(junto);
          }
        }
        const inteiro = escolherVin(partidos);
        if (inteiro) out.chassi = inteiro;
      }
    }
  }
  return out;
}
