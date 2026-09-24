// STUB TEMPORÁRIO — será substituído pelo utils/quoteLogic.ts real do AI Studio.
import type { QuoteSummary } from '../types';

export function parseBrazilianNumber(s: string): number {
  const n = parseFloat(String(s).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function processQuote(
  _descReparo: string,
  _orcamentoRaw: string,
  _revAprovada: number,
  _revPecas: number,
  desconto: number,
  _parcelas: number,
  _ajustesManuais: string,
): QuoteSummary {
  return {
    totalPecasGeral: 0,
    totalServicosGeral: 0,
    descontoPercentual: desconto,
    valorDescontoTotal: 0,
    valorLiquidoFinal: 0,
    itens: [],
  };
}
