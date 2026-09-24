// STUB TEMPORÁRIO (provisório, inferido do quoteLogic.ts) — será substituído pelo types.ts real do AI Studio.
export interface QuoteItem {
  id: number;
  description: string;
  pecasValue: number;
  servicosValue: number;
  value: number;
}

export interface QuoteSummary {
  items: QuoteItem[];
  totalOrcamento: number;
  revisaoAprovada: number;
  totalGeral: number;
  numParcelas: number;
  valorParcela: number;
  currentTime: string;
  totalPecasGeral: number;
  totalServicosGeral: number;
  valorDescontoTotal: number;
  valorLiquidoFinal: number;
  descontoPercentual: number;
}
