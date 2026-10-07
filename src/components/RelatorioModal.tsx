import React, { useState } from 'react';
import { Check, Copy, Trash2, X } from 'lucide-react';
import type { OrcamentoSalvo } from '../utils/historico';
import {
  gruposPorMes,
  linhaRelatorio,
  percentuaisAprovacao,
  relatorioParaExcel,
  rotuloMes,
} from '../utils/relatorio';

interface RelatorioModalProps {
  aberto: boolean;
  onFechar: () => void;
  registros: OrcamentoSalvo[];
  /** Exclui um orçamento (com confirmação de quem chama). */
  onExcluir: (id: string) => void;
  /** Apaga TODO o histórico (com confirmação de quem chama). */
  onLimparTudo: () => void;
}

const CABECALHO = ['DATA', 'NOME', 'TIPO', 'NÚMERO', 'APROVADO', 'RESPONSÁVEL'];

/**
 * Relatório para Excel: todos os orçamentos separados por mês, com o
 * percentual de aprovados/parcial/não aprovados no topo. O "Copiar" (ícone)
 * leva só as linhas de dados em TAB (cada valor cai na sua célula ao colar).
 * Lixeira por linha exclui; lixeira do topo limpa tudo.
 */
const RelatorioModal: React.FC<RelatorioModalProps> = ({ aberto, onFechar, registros, onExcluir, onLimparTudo }) => {
  const [copiado, setCopiado] = useState(false);

  if (!aberto) return null;

  const grupos = gruposPorMes(registros);
  const pct = percentuaisAprovacao(registros);

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
        className="w-full max-w-5xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden ui-compacta"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 bg-slate-950/60 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <div data-neon-dot className="w-2 h-8 rounded-full bg-blue-500" style={{ boxShadow: '0 0 20px #3b82f6' }}></div>
            <h3 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-widest">
              RELATÓRIO
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copiar}
              disabled={registros.length === 0}
              aria-label="Copiar para Excel"
              title="Copiar para Excel (colar no Excel separa por célula)"
              className={`flex items-center justify-center p-2.5 rounded-xl transition-all border cursor-pointer active:scale-95 ${
                copiado
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white border-blue-500'
              }`}
            >
              {copiado ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
            </button>
            <button
              type="button"
              onClick={onLimparTudo}
              disabled={registros.length === 0}
              aria-label="Limpar todos os orçamentos"
              title="Apagar TODOS os orçamentos do histórico"
              className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 disabled:opacity-40 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
            >
              <Trash2 size={18} />
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

        {registros.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-800/60 text-sm font-black uppercase tracking-widest">
            <span className="text-green-400">Aprovados {pct.aprovados}%</span>
            <span className="text-slate-600"> · </span>
            <span className="text-amber-300">Parcial {pct.parcial}%</span>
            <span className="text-slate-600"> · </span>
            <span className="text-red-400">Não aprovados {pct.naoAprovados}%</span>
            <span className="text-slate-600"> · </span>
            <span className="text-slate-400">{pct.total} orçamento(s)</span>
          </div>
        )}

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
                  <th className="w-10 border-b border-slate-800" aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {grupos.map((g) => (
                  <React.Fragment key={g.mes}>
                    <tr>
                      <td
                        colSpan={CABECALHO.length + 1}
                        className="px-3 pt-4 pb-1 text-xs font-black uppercase tracking-widest text-blue-300"
                      >
                        {rotuloMes(g.mes)}
                      </td>
                    </tr>
                    {g.registros.map((r) => {
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
                          <td className="px-2 py-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onExcluir(r.id)}
                              aria-label={`Excluir orçamento ${cells[3] || cells[1] || 'sem número'}`}
                              title="Excluir este orçamento"
                              className="flex items-center justify-center p-2 bg-slate-800 hover:bg-red-600 text-slate-300 rounded-lg transition-all cursor-pointer active:scale-95"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatorioModal;
