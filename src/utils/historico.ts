import type { QuoteSummary } from '../types';
import { somenteDigitos } from './telefone';
import { normalizarBusca } from './busca';
import { avisarLembretesMudaram } from './lembretes';
import { corDaBusca, type CorCliente } from './corCliente';
import { registrarBackup } from './backup';

/** Um orçamento salvo no histórico local do navegador. */
export interface OrcamentoSalvo {
  id: string;
  criadoEm: string;
  descReparo: string;
  orcamentoRaw: string;
  ajustesManuais: string;
  revAprovadaInput: string;
  revPecasInput: string;
  desconto: number;
  parcelas: number;
  // Placa do veículo (opcional; aparece só na lista do histórico).
  placa?: string;
  // Telefone do cliente (DDD + número; só no histórico, para o botão WhatsApp).
  telefone?: string;
  // Cor do cliente: verde = quer fazer em breve; vermelho = só pesquisou.
  // Marcada no histórico, depois de gerar (não entra no PNG nem no anti-duplicado).
  cor?: CorCliente;
  // Nº do orçamento + data do documento (card 3: extraídos do PDF/print).
  // Opcionais; entram na busca e no anti-duplicado, como placa/telefone.
  numeroOrcamento?: string;
  dataDoc?: string;
  // Nome do cliente (campo próprio no card do sistema).
  // Entra na busca e no anti-duplicado, como os demais contatos.
  nome?: string;
  // Lembrete com data/hora (botão relógio do cartão; ISO "YYYY-MM-DDTHH:mm").
  // Marcação posterior: não entra no anti-duplicado e o reprocessar preserva.
  lembreteEm?: string | null;
  // Observação do lembrete (mesma linha da data; entra na busca).
  observacao?: string;
  // Aprovação do cliente (botões V/X do documento; vai para o relatório Excel).
  // Marcação posterior: não entra no anti-duplicado e o reprocessar preserva.
  aprovacao?: 'aprovado' | 'naoAprovado';
  // Quantidade de itens do orçamento (para a lista do histórico).
  // Opcional: registros antigos (antes da v0.2.2) não têm — cai no fallback.
  numItens?: number;
  // IDs dos itens desmarcados no momento em que foi salvo (botão próprio).
  // Opcional: registros comuns não têm — só entram na aba "Não Realizados".
  naoRealizados?: number[];
  // Retrato do resultado no momento (só para a lista; ao abrir, é recalculado).
  totalPecasGeral: number;
  totalServicosGeral: number;
  valorDescontoTotal: number;
  valorLiquidoFinal: number;
  totalGeral: number;
}

const CHAVE = 'orcamentos_historico_v1';
const MAX = 100;

export function listarHistorico(): OrcamentoSalvo[] {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as OrcamentoSalvo[]) : [];
  } catch {
    return [];
  }
}

function gravar(lista: OrcamentoSalvo[]): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, MAX)));
  } catch {
    /* cota/privacidade: ignora */
  }
}

const mesmosDados = (a: OrcamentoSalvo, b: Omit<OrcamentoSalvo, 'id' | 'criadoEm'>): boolean =>
  a.descReparo === b.descReparo &&
  a.orcamentoRaw === b.orcamentoRaw &&
  a.ajustesManuais === b.ajustesManuais &&
  a.revAprovadaInput === b.revAprovadaInput &&
  a.revPecasInput === b.revPecasInput &&
  a.desconto === b.desconto &&
  a.parcelas === b.parcelas &&
  (a.placa ?? '') === (b.placa ?? '') && // placa identifica o veículo: placa diferente = outro orçamento
  somenteDigitos(a.telefone) === somenteDigitos(b.telefone) && // telefone diferente = outro orçamento
  (a.numeroOrcamento ?? '') === (b.numeroOrcamento ?? '') &&
  (a.dataDoc ?? '') === (b.dataDoc ?? '') &&
  (a.nome ?? '').toUpperCase() === (b.nome ?? '').toUpperCase();

/**
 * Salva um orçamento. Se o mais recente tiver os MESMOS dados, substitui
 * (evita duplicar a cada clique em "Processar Tudo").
 */
export function adicionarAoHistorico(
  novo: Omit<OrcamentoSalvo, 'id' | 'criadoEm'>,
): OrcamentoSalvo[] {
  const lista = listarHistorico();
  if (lista.length > 0 && mesmosDados(lista[0], novo)) {
    // Cor, lembrete e aprovação são marcações posteriores (não entram no
    // anti-duplicado): reprocessar o mesmo orçamento não pode apagá-las.
    lista[0] = {
      ...lista[0],
      ...novo,
      cor: novo.cor ?? lista[0].cor,
      lembreteEm: novo.lembreteEm ?? lista[0].lembreteEm,
      aprovacao: novo.aprovacao ?? lista[0].aprovacao,
      id: lista[0].id,
      criadoEm: lista[0].criadoEm,
    };
    gravar(lista);
    return lista;
  }
  const rec: OrcamentoSalvo = {
    ...novo,
    id: String(Date.now()),
    criadoEm: new Date().toLocaleString('pt-BR'),
  };
  const out = [rec, ...lista];
  gravar(out);
  return out;
}

export function removerDoHistorico(id: string): OrcamentoSalvo[] {
  const out = listarHistorico().filter((r) => r.id !== id);
  gravar(out);
  return out;
}

/**
 * Marca/desmarca a cor do cliente num registro (verde = quer fazer em breve,
 * vermelho = só pesquisou; `undefined` limpa). Salva na hora.
 */
export function atualizarCorHistorico(id: string, cor: CorCliente | undefined): OrcamentoSalvo[] {
  const out = listarHistorico().map((r) => (r.id === id ? { ...r, cor } : r));
  gravar(out);
  return out;
}

/**
 * Marca/desmarca a aprovação do cliente (botões V/X do documento).
 * Salva na hora.
 */
export function atualizarAprovacaoHistorico(
  id: string,
  aprovacao: 'aprovado' | 'naoAprovado' | undefined,
): OrcamentoSalvo[] {
  const out = listarHistorico().map((r) => (r.id === id ? { ...r, aprovacao } : r));
  gravar(out);
  return out;
};

/**
 * Marca/desmarca os itens não aprovados (parcial) direto no histórico.
 * Só troca `naoRealizados` (+ totais, quando informados) — `id`, `criadoEm` e
 * `dataDoc` ficam intactos (não muda a data do orçamento).
 */
export function atualizarNaoRealizadosHistorico(
  id: string,
  naoRealizados: number[],
  totais?: Pick<
    OrcamentoSalvo,
    'totalPecasGeral' | 'totalServicosGeral' | 'valorDescontoTotal' | 'valorLiquidoFinal' | 'totalGeral' | 'numItens'
  >,
): OrcamentoSalvo[] {
  const out = listarHistorico().map((r) =>
    r.id === id ? { ...r, naoRealizados, ...(totais ?? {}) } : r,
  );
  gravar(out);
  return out;
}

/**
 * Agenda o lembrete do registro (ISO "YYYY-MM-DDTHH:mm" + observação).
 * `lembreteEm null` conclui (só a data sai — a observação fica visível).
 * Sem `observacao`, mantém a atual. Salva na hora e avisa o popup global.
 */
export function atualizarLembreteHistorico(
  id: string,
  lembreteEm: string | null,
  observacao?: string,
): OrcamentoSalvo[] {
  const out = listarHistorico().map((r) =>
    r.id === id
      ? {
          ...r,
          lembreteEm,
          observacao: observacao === undefined ? r.observacao : observacao.trim().slice(0, 120),
        }
      : r,
  );
  gravar(out);
  avisarLembretesMudaram();
  return out;
}

export function limparHistorico(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* ignora */
  }
}

/** Baixa um JSON com todo o histórico (backup). */
export function baixarBackup(): void {
  const lista = listarHistorico();
  const blob = new Blob([JSON.stringify(lista, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const data = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `orcamentos_backup_${data}.json`;
  a.click();
  URL.revokeObjectURL(url);
  registrarBackup();
}

/** Restaura um backup JSON, mesclando pelos ids (não duplica). Retorna o total. */
export async function importarBackup(arquivo: File): Promise<number> {
  const texto = await arquivo.text();
  const dados = JSON.parse(texto);
  if (!Array.isArray(dados)) throw new Error('Arquivo de backup inválido.');
  const atuais = listarHistorico();
  const vistos = new Set(atuais.map((r) => r.id));
  const importados = (dados as OrcamentoSalvo[]).filter(
    (r) => r && typeof r.id === 'string' && !vistos.has(r.id),
  );
  const out = [...importados, ...atuais];
  gravar(out);
  return importados.length;
}

/** Conta os itens da descrição (linhas que começam com um número). */
export function contarItensDaDescricao(descricao: string): number {
  return descricao.split('\n').filter((l) => /^\s*\d/.test(l)).length;
}

/**
 * Divide um texto em [antes, termo, depois] para grifar a parte encontrada
 * (comparação sem acentos e sem diferenciar maiúsculas). Null se não achar.
 * Os índices são do texto ORIGINAL: cada unidade da base sem acento carrega o
 * índice de origem (NFD/acento muda o comprimento, então o índice direto erra
 * quando há acento antes do termo).
 */
export function destacarTermo(texto: string, termo: string): [string, string, string] | null {
  const semAcento = (s: string): string =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const t = semAcento((termo ?? '').trim().toLowerCase());
  if (!t) return null;
  const orig = texto ?? '';
  let base = '';
  const mapa: number[] = [];
  let oi = 0;
  for (const ch of orig) {
    const s = semAcento(ch.toLowerCase());
    base += s;
    for (let k = 0; k < s.length; k++) mapa.push(oi);
    oi += ch.length;
  }
  const idx = base.indexOf(t);
  if (idx < 0) return null;
  const ini = mapa[idx];
  const fimNfd = idx + t.length;
  const fim = fimNfd < mapa.length ? mapa[fimNfd] : orig.length;
  return [orig.slice(0, ini), orig.slice(ini, fim), orig.slice(fim)];
}

export type AbaHistorico = 'todos' | 'aprovados' | 'naoAprovados';

/** Registro com algum item desmarcado (não aprovado). */
export const temNaoRealizados = (r: OrcamentoSalvo): boolean => (r.naoRealizados?.length ?? 0) > 0;

/**
 * Parcial de verdade: algum item aprovado E algum desmarcado
 * (`0 < desmarcados < total`). X com tudo riscado (ou V puro) NÃO é parcial.
 * Sem total confiável (`numItens` ausente e descrição sem itens), mantém o
 * comportamento antigo (qualquer desmarcado = parcial) para não esconder os
 * registros antigos.
 */
export const temParcial = (r: OrcamentoSalvo): boolean => {
  const len = r.naoRealizados?.length ?? 0;
  if (len === 0) return false;
  const total = r.numItens ?? contarItensDaDescricao(r.descReparo ?? '');
  if (!total || total <= 0) return true;
  return len < total;
};

/**
 * Filtra pela aba do histórico: Todos | Aprovados (V sem desmarque) |
 * Não Aprovados (X, ou V com desmarque = oportunidade de recuperação, ou com
 * item desmarcado ainda sem marca — compatível com registros antigos).
 */
export function filtrarPorAba(lista: OrcamentoSalvo[], aba: AbaHistorico): OrcamentoSalvo[] {
  switch (aba) {
    case 'aprovados':
      return lista.filter((r) => r.aprovacao === 'aprovado' && !temNaoRealizados(r));
    case 'naoAprovados':
      return lista.filter((r) => temNaoRealizados(r) || r.aprovacao === 'naoAprovado');
    default:
      return lista;
  }
}

/**
 * Filtra o histórico por **data, placa, nome, telefone, nº, cor ou item** —
 * busca "contém", sem acentos e ignorando separadores (ex.: buscar "freio" acha os
 * orçamentos com pastilhas de freio; útil na aba "Não Realizados"). Buscar "verde"
 * ou "vermelho" lista os registros marcados com essa cor. Termo vazio = tudo.
 *
 * Faixa de valor (pelo bruto): `>2000`, `>=2000`, `<500`, `<=500` ou `1000-3000`
 * (milhar com ponto, centavos com vírgula). Número sozinho continua buscando texto
 * (ex.: `4471` acha o Nº do orçamento, não o valor).
 */
/** "1.500,00" → 1500 (milhar com ponto, centavos com vírgula). Null se não é número. */
function numeroBusca(s: string): number | null {
  const t = (s ?? '').trim();
  if (!/^(\d{1,3}(\.\d{3})*|\d+)(,\d{1,2})?$/.test(t)) return null;
  const n = parseFloat(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Termo de faixa de valor (pelo bruto): `>2000`, `>=2000`, `<500`, `<=500` ou
 * `1000-3000` (ordem invertida vale: `3000-1000` = `1000-3000`). Null quando o
 * termo é busca textual (inclusive número sozinho, que continua achando o Nº —
 * e placa com hífen, ex.: `ABC-1D23`, que não é número dos dois lados).
 */
export function faixaDeValor(termo: string): { min: number; max: number } | null {
  const t = (termo ?? '').trim().replace(/\s+/g, '');
  if (!t) return null;
  let m = t.match(/^>=?(.+)$/);
  if (m) {
    const n = numeroBusca(m[1]);
    return n === null ? null : { min: n, max: Number.POSITIVE_INFINITY };
  }
  m = t.match(/^<=?(.+)$/);
  if (m) {
    const n = numeroBusca(m[1]);
    return n === null ? null : { min: Number.NEGATIVE_INFINITY, max: n };
  }
  m = t.match(/^(.+)-(.+)$/);
  if (m) {
    const a = numeroBusca(m[1]);
    const b = numeroBusca(m[2]);
    if (a === null || b === null) return null;
    return a <= b ? { min: a, max: b } : { min: b, max: a };
  }
  return null;
}

export function filtrarHistorico(lista: OrcamentoSalvo[], termo: string): OrcamentoSalvo[] {
  const cru = (termo ?? '').trim().replace(/\s+/g, '');
  const porValor = (faixa: { min: number; max: number }): OrcamentoSalvo[] =>
    lista.filter((r) => (r.totalGeral ?? 0) >= faixa.min && (r.totalGeral ?? 0) <= faixa.max);
  // `>`/`<` não existem em telefone/placa/data: são sempre faixa de valor.
  if (/^[<>]/.test(cru)) {
    const faixa = faixaDeValor(termo);
    if (faixa) return porValor(faixa);
  }
  const t = normalizarBusca(termo);
  if (!t) return lista;
  const corBuscada = corDaBusca(t);
  const texto = lista.filter(
    (r) =>
      normalizarBusca(r.placa ?? '').includes(t) ||
      normalizarBusca(r.nome ?? '').includes(t) ||
      normalizarBusca(r.observacao ?? '').includes(t) ||
      normalizarBusca(r.telefone ?? '').includes(t) ||
      normalizarBusca(r.numeroOrcamento ?? '').includes(t) ||
      normalizarBusca(r.dataDoc ?? '').includes(t) ||
      normalizarBusca(r.criadoEm).includes(t) ||
      normalizarBusca(r.descReparo).includes(t) ||
      (corBuscada !== null && r.cor === corBuscada),
  );
  // `1000-3000` é ambíguo com telefone/placa (ex.: `99999-9999`): o texto tem
  // prioridade; a faixa de valor só vale quando o texto não acha ninguém.
  if (texto.length > 0) return texto;
  const faixa = faixaDeValor(termo);
  if (faixa) return porValor(faixa);
  return texto;
}

/** Resumo do resultado para a lista do histórico (sem recalcular). */
export function retratoDoResumo(s: QuoteSummary): Pick<
  OrcamentoSalvo,
  'totalPecasGeral' | 'totalServicosGeral' | 'valorDescontoTotal' | 'valorLiquidoFinal' | 'totalGeral' | 'numItens'
> {
  return {
    totalPecasGeral: s.totalPecasGeral,
    totalServicosGeral: s.totalServicosGeral,
    valorDescontoTotal: s.valorDescontoTotal,
    valorLiquidoFinal: s.valorLiquidoFinal,
    totalGeral: s.totalGeral,
    numItens: s.items.length,
  };
}
