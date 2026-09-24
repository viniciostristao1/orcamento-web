export interface QuoteItem {
  id: number;
  description: string;
  value: number;
  pecasValue: number;
  servicosValue: number;
}

export interface QuoteSummary {
  items: QuoteItem[];
  totalOrcamento: number;
  revisaoAprovada: number;
  totalGeral: number;
  numParcelas: number;
  valorParcela: number;
  currentTime: string;
  
  // Dados Internos (Não aparecem no QuoteTable)
  totalPecasGeral: number;
  totalServicosGeral: number;
  valorDescontoTotal: number;
  valorLiquidoFinal: number;
  descontoPercentual: number;
} 
