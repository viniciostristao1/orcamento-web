// STUB TEMPORÁRIO — será substituído pelo components/QuoteTable.tsx real do AI Studio.
import React from 'react';
import type { QuoteSummary } from '../types';
import { formatCurrency } from '../utils/quoteLogic';

const QuoteTable: React.FC<{ summary: QuoteSummary }> = ({ summary }) => (
  <div className="border border-slate-800 rounded-2xl p-6">
    <h3 className="text-lg font-black uppercase tracking-widest mb-4">Itens</h3>
    <p className="text-slate-400 text-sm">
      Total peças: {formatCurrency(summary.totalPecasGeral)} · Total serviços:{' '}
      {formatCurrency(summary.totalServicosGeral)}
    </p>
  </div>
);

export default QuoteTable;
