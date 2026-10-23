/**
 * Aba REVISÕES (v0.160.0): cola o texto do portal Toyota com as últimas
 * passagens do veículo e projeta a próxima revisão.
 *
 * Limites Toyota (10 mil km ou 12 meses, o que ocorrer primeiro):
 * - km alvo = último km + 10.000 exatos (ex.: 60.306 → 70.306; arredondar para
 *   o múltiplo de 10k chamava o cliente cedo demais).
 * - data limite = última abertura + 12 meses.
 *
 * Previsão por ritmo (v0.162.0): média de km/dia entre as passagens
 * (km total / dias totais, só intervalos com data e km crescentes) estima em
 * que data o cliente chega ao km alvo. A data prevista é a mais próxima entre
 * a estimada pelo ritmo e a data limite (o que ocorrer primeiro).
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
  dataLimite: string; // dd/mm/aaaa (+12 meses)
  kmAlvo: number;
  revisaoAtual: number | null; // nº extraído do "REVISAO 06..." (se houver)
  revisaoProxima: number | null;
  /** Ritmo médio entre as passagens (km/dia; null com <2 passagens válidas). */
  kmPorDia: number | null;
  /** Ritmo só do último intervalo (referência; null sem intervalo válido). */
  ultimoKmPorDia: number | null;
  diasTotais: number;
  kmTotais: number;
  numIntervalos: number;
  /** Data em que chega ao km alvo pelo ritmo (null sem ritmo). */
  dataEstimadaPorRitmo: string | null;
  /** Previsão final = mais próxima entre estimada e limite. */
  dataPrevista: string;
  motivoPrevisao: 'ritmo' | 'limite';
}

/** Um intervalo entre duas passagens (base do ritmo). */
export interface IntervaloRitmo {
  de: string;
  ate: string;
  dias: number;
  kmRodados: number;
  kmPorDia: number;
}

/** Ritmo de rodagem a partir do histórico. Null sem intervalo válido. */
export interface RitmoRodagem {
  kmPorDia: number;
  ultimoKmPorDia: number | null;
  diasTotais: number;
  kmTotais: number;
  numIntervalos: number;
  intervalos: IntervaloRitmo[];
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

/** km/dia com 1 decimal no padrão pt-BR (ex.: 118,8). */
export function formatarKmPorDia(kmPorDia: number): string {
  return kmPorDia.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

/** Dias cheios entre duas datas pt-BR (meio-dia, sem fuso). */
export function diferencaDias(de: string, ate: string): number | null {
  const d1 = parseDataPtBr(de);
  const d2 = parseDataPtBr(ate);
  if (!d1 || !d2) return null;
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
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
 * data): alvo = último km + 10.000 exatos e limite = +12 meses na data.
 * Null sem passagem válida.
 *
 * Ritmo (v0.162.0): com 2+ passagens válidas, estima quando o km alvo é
 * atingido (km que faltam / km por dia, arredondando o dia para cima) e a
 * previsão final é a mais próxima entre a estimada e o limite de 12 meses.
 */
export function projetarProxima(passagens: PassagemRevisao[]): ProjecaoRevisao | null {
  const ordenadas = ordenarPorData(passagens.filter((p) => parseDataPtBr(p.abertura)));
  if (ordenadas.length === 0) return null;
  const base = ordenadas[ordenadas.length - 1];
  const dataBase = parseDataPtBr(base.abertura);
  if (!dataBase) return null;
  const revisaoAtual = extrairNumeroRevisao(base.descricao);
  const dataLimite = formatarDataPtBr(somarMeses(dataBase, 12));
  // Alvo exato: 10.000 km rodados a partir da última (sem arredondar).
  const kmAlvo = base.km + 10000;
  const ritmo = calcularRitmo(ordenadas);

  let dataEstimadaPorRitmo: string | null = null;
  if (ritmo && ritmo.kmPorDia > 0) {
    const kmFaltam = kmAlvo - base.km;
    if (kmFaltam > 0) {
      const diasEstimados = Math.ceil(kmFaltam / ritmo.kmPorDia);
      dataEstimadaPorRitmo = formatarDataPtBr(
        new Date(dataBase.getTime() + diasEstimados * 86400000),
      );
    }
  }

  // O que ocorrer primeiro: estimada pelo ritmo ou limite de 12 meses.
  let dataPrevista = dataLimite;
  let motivoPrevisao: 'ritmo' | 'limite' = 'limite';
  if (dataEstimadaPorRitmo) {
    const tEst = parseDataPtBr(dataEstimadaPorRitmo)?.getTime() ?? Number.POSITIVE_INFINITY;
    const tLim = parseDataPtBr(dataLimite)?.getTime() ?? Number.POSITIVE_INFINITY;
    if (tEst <= tLim) {
      dataPrevista = dataEstimadaPorRitmo;
      motivoPrevisao = 'ritmo';
    }
  }

  return {
    baseAbertura: base.abertura,
    baseKm: base.km,
    baseDescricao: base.descricao,
    dataLimite,
    kmAlvo,
    revisaoAtual,
    revisaoProxima: revisaoAtual === null ? null : revisaoAtual + 1,
    kmPorDia: ritmo?.kmPorDia ?? null,
    ultimoKmPorDia: ritmo?.ultimoKmPorDia ?? null,
    diasTotais: ritmo?.diasTotais ?? 0,
    kmTotais: ritmo?.kmTotais ?? 0,
    numIntervalos: ritmo?.numIntervalos ?? 0,
    dataEstimadaPorRitmo,
    dataPrevista,
    motivoPrevisao,
  };
}

/**
 * Ritmo médio de rodagem entre as passagens (já ordenadas ou não): soma só os
 * intervalos com data crescente e km crescente (ignora repetição/retrocesso de
 * hodômetro). Null sem nenhum intervalo válido.
 */
export function calcularRitmo(passagens: PassagemRevisao[]): RitmoRodagem | null {
  const ordenadas = ordenarPorData(passagens.filter((p) => parseDataPtBr(p.abertura)));
  const intervalos: IntervaloRitmo[] = [];
  for (let i = 1; i < ordenadas.length; i++) {
    const ant = ordenadas[i - 1];
    const atu = ordenadas[i];
    const d1 = parseDataPtBr(ant.abertura);
    const d2 = parseDataPtBr(atu.abertura);
    if (!d1 || !d2) continue;
    const dias = Math.round((d2.getTime() - d1.getTime()) / 86400000);
    const kmRodados = atu.km - ant.km;
    if (!(dias > 0) || !(kmRodados > 0)) continue;
    intervalos.push({ de: ant.abertura, ate: atu.abertura, dias, kmRodados, kmPorDia: kmRodados / dias });
  }
  if (intervalos.length === 0) return null;
  const diasTotais = intervalos.reduce((a, x) => a + x.dias, 0);
  const kmTotais = intervalos.reduce((a, x) => a + x.kmRodados, 0);
  if (!(diasTotais > 0) || !(kmTotais > 0)) return null;
  return {
    kmPorDia: kmTotais / diasTotais,
    ultimoKmPorDia: intervalos[intervalos.length - 1].kmPorDia,
    diasTotais,
    kmTotais,
    numIntervalos: intervalos.length,
    intervalos,
  };
}

/** Texto para copiar as passagens (uma por linha, sem OS e sem extras). */
export function textoPassagensParaCopiar(passagens: PassagemRevisao[]): string {
  return passagens
    .map((p) => `${p.abertura} - ${formatarKmPtBr(p.km)} km - ${limparDescricaoRevisao(p.descricao)}`)
    .join('\n');
}

/**
 * Descrição curta da passagem (exibir/copiar): sem o tipo de serviço (CSP,
 * CSR, CSD, ISS, GS, GSE...) e sem o código final (NSP151LHHXR06...).
 * Ex.: "CSP REVISAO 06 60000 NSP151LHHXR06" → "REVISAO 06 60000".
 */
export function limparDescricaoRevisao(descricao: string): string {
  let s = descricao.trim().replace(/\s+/g, ' ');
  // Tipo de serviço no início (2-4 letras antes de número ou REVISAO).
  s = s.replace(/^[A-Za-z]{2,4}\s+(?=\d|REVISAO\b)/i, '');
  // Nº duplicado antes do REVISAO ("6 REVISAO 60 000" → "REVISAO 60 000").
  s = s.replace(/^\d{1,2}\s+(?=REVISAO\b)/i, '');
  // Código final (letras+números, 8+ chars): palavras e números puros ficam.
  const partes = s.split(' ');
  const ultimo = partes[partes.length - 1] ?? '';
  if (
    ultimo.length >= 8 &&
    /^[A-Z0-9]+$/.test(ultimo) &&
    /[A-Z]/.test(ultimo) &&
    /[0-9]/.test(ultimo)
  ) {
    partes.pop();
    s = partes.join(' ');
  }
  return s.trim() || descricao.trim();
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
