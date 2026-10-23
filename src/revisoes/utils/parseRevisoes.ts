/**
 * Aba REVISÕES (v0.160.0): cola o texto do portal Toyota com as últimas
 * passagens do veículo e projeta a próxima revisão.
 *
 * Regra Toyota (10 mil km ou 12 meses, o que ocorrer primeiro):
 * - km alvo = próximo múltiplo de 10.000 acima do último km lançado
 *   (ex.: 60.306 → 70.000; cobre o "REVISAO 06 60000" → "07 70000").
 * - data limite = última abertura + 12 meses.
 *
 * Tudo puro (sem localStorage) para os testes cobrirem direto.
 */

/** Chave do rascunho (texto colado) — entra no backup geral. */
export const REVISOES_RASCUNHO_KEY = 'revisoes_texto_v1';

export interface PassagemRevisao {
  posicao: string;
  abertura: string; // dd/mm/aaaa (como veio no portal)
  km: number;
  distribuidor: string;
  os: string;
  sts: string;
  descricao: string; // descrição principal (linha CSP)
  extras: string[]; // linhas "Outros" (CSD/CSR...) da mesma passagem
}

export interface Toyota10Info {
  vigenciaInicio: string;
  vigenciaFim: string;
  kmDe: number;
  kmAte: number;
}

export interface DadosRevisoes {
  chassi: string;
  anoFabMod: string;
  producao: string;
  tipoUso: string;
  veiculo: string;
  katashiki: string;
  venda: string;
  entrega: string;
  distribuidorVenda: string;
  toyota10: Toyota10Info | null;
  passagens: PassagemRevisao[];
}

export interface ProjecaoRevisao {
  baseAbertura: string;
  baseKm: number;
  baseDescricao: string;
  dataLimite: string; // dd/mm/aaaa
  kmAlvo: number;
  revisaoAtual: number | null; // nº extraído do "REVISAO 06..." (se houver)
  revisaoProxima: number | null;
}

const DATA_RE = '(\\d{2}/\\d{2}/\\d{4})';

function primeiraCaptura(texto: string, re: RegExp): string {
  const m = texto.match(re);
  return (m?.[1] ?? '').trim();
}

/** dd/mm/aaaa → Date (meio-dia, sem fuso). Null se inválida. */
export function parseDataPtBr(data: string): Date | null {
  const m = data.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12, 0, 0);
  if (d.getDate() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1) return null;
  return d;
}

/** Date → dd/mm/aaaa. */
export function formatarDataPtBr(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Soma N meses mantendo o dia (29/02 cai para 28/02). */
export function somarMeses(data: Date, meses: number): Date {
  const dia = data.getDate();
  const alvo = new Date(data.getFullYear(), data.getMonth() + meses, 1, 12, 0, 0);
  const ultimoDia = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
  alvo.setDate(Math.min(dia, ultimoDia));
  return alvo;
}

export function formatarKmPtBr(km: number): string {
  return km.toLocaleString('pt-BR');
}

/** Próximo múltiplo de 10.000 acima do km (60.306 → 70.000). */
export function proximoMultiplo10k(km: number): number {
  return Math.ceil((km + 1) / 10000) * 10000;
}

/** Nº da revisão no texto ("REVISAO 06 60000", "5 REVISAO 50 000"...). */
export function extrairNumeroRevisao(descricao: string): number | null {
  // Formato "5 REVISAO 50 000": o nº da revisão vem ANTES (o "50" é o km).
  const lider = descricao.match(/^\D*0?(\d{1,2})\s*REVISAO/i);
  if (lider) {
    const n = Number(lider[1]);
    if (Number.isFinite(n)) return n;
  }
  const depois = descricao.match(/REVISAO\s*0?(\d{1,2})\b/i);
  if (!depois) return null;
  const n = Number(depois[1]);
  return Number.isFinite(n) ? n : null;
}

/** Linha principal de passagem: "2 14/10/2026 60306 1421420 - ... 172129 F 1 CSP REVISAO..." */
const LINHA_PASSAGEM_RE =
  /^\s*(\d+)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{4,7})\s+(.+?)\s+(\d{3,})\s+([A-Za-z])\s+(\d+)\s+([A-Za-z]{2,4})\s+(.+?)\s*$/;

export function parseTextoRevisoes(texto: string): DadosRevisoes {
  const chassi = primeiraCaptura(texto, /Chassi:\s*([A-Za-z0-9]{10,20})/);
  const anoFabMod = primeiraCaptura(texto, /Ano\s*Fab\.\/Mod\.:\s*(\d{4}\s*\/\s*\d{4})/).replace(/\s+/g, '');
  const producao = primeiraCaptura(texto, /Produ[çc][ãa]o:\s*(\d{2}\/\d{2}\/\d{4})/);
  const tipoUso = primeiraCaptura(texto, /Tipo de uso[^:\n]*:\s*([^\n\t]+)/);
  const veiculo = primeiraCaptura(texto, /Ve[íi]culo:\s*(.+?)\s*Katashiki:/s).replace(/\s+/g, ' ').trim();
  const katashiki = primeiraCaptura(texto, /Katashiki:\s*([^\s\t]+)/);
  const venda = primeiraCaptura(texto, /Venda:\s*(\d{2}\/\d{2}\/\d{4})/);
  const entrega = primeiraCaptura(texto, /Entrega:\s*(\d{2}\/\d{2}\/\d{4})/);
  const distribuidorVenda = primeiraCaptura(texto, /Distribuidor de venda:\s*([^\n]+)/);

  let toyota10: Toyota10Info | null = null;
  const mT10 = texto.match(
    new RegExp(`Toyota\\s*10\\s*-\\s*Vig[êe]ncia:\\s*${DATA_RE}\\s*a\\s*${DATA_RE}\\s*Km:\\s*(\\d+)\\s*a\\s*(\\d+)`, 'i'),
  );
  if (mT10) {
    toyota10 = {
      vigenciaInicio: mT10[1],
      vigenciaFim: mT10[2],
      kmDe: Number(mT10[3]),
      kmAte: Number(mT10[4]),
    };
  }

  const passagens: PassagemRevisao[] = [];
  for (const linhaBruta of texto.split(/\r?\n/)) {
    const linha = linhaBruta.trim();
    if (!linha) continue;
    const m = linha.match(LINHA_PASSAGEM_RE);
    if (m) {
      const aberturaValida = parseDataPtBr(m[2]) !== null;
      // Cabeçalho ("Posição Abertura KM...") não tem data válida — ignora.
      if (!aberturaValida) continue;
      passagens.push({
        posicao: m[1],
        abertura: m[2],
        km: Number(m[3]),
        distribuidor: m[4].trim(),
        os: m[5],
        sts: m[6].toUpperCase(),
        descricao: `${m[8].toUpperCase()} ${m[9]}`.replace(/\s+/g, ' ').trim(),
        extras: [],
      });
      continue;
    }
    // Linhas "Outros ..." pertencem à última passagem (serviços extras).
    if (/^outros\b/i.test(linha) && passagens.length > 0) {
      const semPrefixo = linha.replace(/^outros\b\s*/i, '').replace(/\s+/g, ' ').trim();
      if (semPrefixo) passagens[passagens.length - 1].extras.push(semPrefixo);
    }
  }

  return {
    chassi: chassi.toUpperCase(),
    anoFabMod,
    producao,
    tipoUso,
    veiculo,
    katashiki,
    venda,
    entrega,
    distribuidorVenda: distribuidorVenda.replace(/\s+/g, ' ').trim(),
    toyota10,
    passagens,
  };
}

/** Ordena as passagens da mais antiga para a mais recente (por data, km desempata). */
export function ordenarPorData(passagens: PassagemRevisao[]): PassagemRevisao[] {
  return [...passagens].sort((a, b) => {
    const da = parseDataPtBr(a.abertura)?.getTime() ?? 0;
    const db = parseDataPtBr(b.abertura)?.getTime() ?? 0;
    if (da !== db) return da - db;
    return a.km - b.km;
  });
}

/**
 * Projeta a próxima revisão a partir da última passagem (a mais recente por
 * data): +12 meses na data e próximo múltiplo de 10k no km. Null sem passagem
 * válida.
 */
export function projetarProxima(passagens: PassagemRevisao[]): ProjecaoRevisao | null {
  const ordenadas = ordenarPorData(passagens.filter((p) => parseDataPtBr(p.abertura)));
  if (ordenadas.length === 0) return null;
  const base = ordenadas[ordenadas.length - 1];
  const dataBase = parseDataPtBr(base.abertura);
  if (!dataBase) return null;
  const revisaoAtual = extrairNumeroRevisao(base.descricao);
  return {
    baseAbertura: base.abertura,
    baseKm: base.km,
    baseDescricao: base.descricao,
    dataLimite: formatarDataPtBr(somarMeses(dataBase, 12)),
    kmAlvo: proximoMultiplo10k(base.km),
    revisaoAtual,
    revisaoProxima: revisaoAtual === null ? null : revisaoAtual + 1,
  };
}

/** Rascunho do texto colado (localStorage local, como o das outras abas). */
export function lerRascunhoRevisoes(storage: Storage = localStorage): string {
  try {
    return storage.getItem(REVISOES_RASCUNHO_KEY) ?? '';
  } catch {
    return '';
  }
}

export function salvarRascunhoRevisoes(texto: string, storage: Storage = localStorage): void {
  try {
    if (texto) storage.setItem(REVISOES_RASCUNHO_KEY, texto);
    else storage.removeItem(REVISOES_RASCUNHO_KEY);
  } catch {
    /* cota/privacidade: ignora */
  }
}
