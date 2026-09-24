import type { QuoteSummary } from '../types';

export interface UltimoOrcamento {
  summary: QuoteSummary;
  selecionados: number[];
}

export const ULTIMO_KEY = 'orcamento_ultimo_v1';

/**
 * Último documento gerado (resumo + itens marcados). Fica no localStorage local
 * para o visual do orçamento não sumir ao reabrir o app — não substitui o
 * histórico (aquele guarda todos os processados).
 */
export const lerUltimoOrcamento = (): UltimoOrcamento | null => {
  try {
    const bruto = localStorage.getItem(ULTIMO_KEY);
    if (!bruto) return null;
    const d = JSON.parse(bruto);
    if (!d?.summary || !Array.isArray(d.summary.items)) return null;
    return {
      summary: d.summary,
      selecionados: Array.isArray(d.selecionados) ? d.selecionados : d.summary.items.map((i: { id: number }) => i.id),
    };
  } catch {
    return null;
  }
};

export const salvarUltimoOrcamento = (dados: UltimoOrcamento): void => {
  try {
    localStorage.setItem(ULTIMO_KEY, JSON.stringify(dados));
  } catch {
    // localStorage indisponível — o último orçamento vale só nesta sessão
  }
};
