import type { QuoteSummary } from '../types';

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
  (a.placa ?? '') === (b.placa ?? ''); // placa identifica o veículo: placa diferente = outro orçamento

/**
 * Salva um orçamento. Se o mais recente tiver os MESMOS dados, substitui
 * (evita duplicar a cada clique em "Processar Tudo").
 */
export function adicionarAoHistorico(
  novo: Omit<OrcamentoSalvo, 'id' | 'criadoEm'>,
): OrcamentoSalvo[] {
  const lista = listarHistorico();
  if (lista.length > 0 && mesmosDados(lista[0], novo)) {
    lista[0] = { ...lista[0], ...novo, id: lista[0].id, criadoEm: lista[0].criadoEm };
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

export type AbaHistorico = 'todos' | 'naoRealizados';

/** Registro salvo pelo botão "salvar com itens não realizados". */
export const temNaoRealizados = (r: OrcamentoSalvo): boolean => (r.naoRealizados?.length ?? 0) > 0;

/** Filtra pela aba do histórico: "Todos" ou "Não Realizados". */
export function filtrarPorAba(lista: OrcamentoSalvo[], aba: AbaHistorico): OrcamentoSalvo[] {
  return aba === 'naoRealizados' ? lista.filter(temNaoRealizados) : lista;
}

/** Normaliza para busca: maiúsculas e só letras/números (ignora / - . : e espaços). */
const normalizarBusca = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * Filtra o histórico por **data ou placa** (busca "contém", ignorando
 * separadores). Termo vazio devolve a lista inteira.
 */
export function filtrarHistorico(lista: OrcamentoSalvo[], termo: string): OrcamentoSalvo[] {
  const t = normalizarBusca(termo);
  if (!t) return lista;
  return lista.filter(
    (r) => normalizarBusca(r.placa ?? '').includes(t) || normalizarBusca(r.criadoEm).includes(t),
  );
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
