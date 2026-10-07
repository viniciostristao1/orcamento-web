import React, { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import type { OrcamentoSalvo } from '../utils/historico';
import { linhaRelatorio, relatorioParaExcel } from '../utils/relatorio';

interface RelatorioModalProps {
  aberto: boolean;
  onFechar: () => void;
  registros: OrcamentoSalvo[];
}

const CABECALHO = ['DATA', 'NOME', 'TIPO', 'NÚMERO', 'APROVADO', 'RESPONSÁVEL'];

/**
 * Relatório para Excel: tabela com todos os orçamentos (sem marca = vazio)
 * + botão de copiar em TAB (cada valor cai na sua célula ao colar).
 */
const RelatorioModal: React.FC<RelatorioModalProps> = ({ aberto, onFechar, registros }) => {
  const [copiado, setCopiado] = useState(false);

  if (!aberto) return null;

  const copiar = () => {
    navigator.clipboard.writeText(relatorioParaExcel(registros));
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 print:hidden"
      onClick={onFechar}
    >
      <div
        data-janela-relatorio="1"
        className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden ui-compacta"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 bg-slate-950/60 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <div data-neon-dot className="w-2 h-8 rounded-full bg-blue-500" style={{ boxShadow: '0 0 20px #3b82f6' }}></div>
            <h3 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-widest">
              RELATÓRIO — APROVADOS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copiar}
              disabled={registros.length === 0}
              aria-label="Copiar para Excel"
              title="Copiar para Excel (colar no Excel separa por célula)"
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all border cursor-pointer active:scale-95 text-xs font-black uppercase tracking-widest ${
                copiado
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white border-blue-500'
              }`}
            >
              {copiado ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
            <button
              type="button"
              onClick={onFechar}
              aria-label="Fechar"
              title="Fechar"
              className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-auto p-4">
          {registros.length === 0 ? (
            <p className="text-slate-500 text-center py-10 font-bold uppercase tracking-widest text-base">
              Nenhum orçamento no histórico.
            </p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {CABECALHO.map((c) => (
                    <th
                      key={c}
                      className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 whitespace-nowrap"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => {
                  const cells = linhaRelatorio(r);
                  return (
                    <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                      {cells.map((v, i) => (
                        <td
                          key={i}
                          className={`px-3 py-2 font-bold whitespace-nowrap ${
                            i === 4
                              ? v === 'Sim'
                                ? 'text-green-400'
                                : v === 'Não'
                                  ? 'text-red-400'
                                  : 'text-slate-600'
                              : 'text-slate-200'
                          }`}
                        >
                          {v || '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatorioModal;
