import React, { useEffect } from 'react';
import { ArrowDownAZ, ArrowUpAZ, X } from 'lucide-react';

interface OrdenarTabelaProps {
  aberto: boolean;
  titulos: string[];
  onFechar: () => void;
  onOrdenar: (coluna: number, direcao: 'asc' | 'desc') => void;
}

/**
 * Janelinha de ordenação: escolhe a coluna e a direção (A–Z / Z–A).
 * Renderizada FORA do `ui-compacta` (como o toast do Desfazer), senão o zoom
 * da interface encolheria o painel fixo.
 */
export const OrdenarTabela: React.FC<OrdenarTabelaProps> = ({ aberto, titulos, onFechar, onOrdenar }) => {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-300">Ordenar por coluna</span>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar ordenação"
            title="Fechar"
            className="p-1.5 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {titulos.map((titulo, coluna) => {
            const nome = titulo.trim() || `Coluna ${coluna + 1}`;
            return (
              <div key={coluna} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50">
                <span className="text-sm font-black text-slate-200 truncate">{nome}</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOrdenar(coluna, 'asc')}
                    aria-label={`Ordenar ${nome} crescente`}
                    title="Ordem crescente (A–Z / 0–9 / data mais antiga)"
                    className="flex items-center justify-center p-2 bg-slate-800 hover:bg-blue-600 text-slate-300 border border-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <ArrowUpAZ size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOrdenar(coluna, 'desc')}
                    aria-label={`Ordenar ${nome} decrescente`}
                    title="Ordem decrescente (Z–A / 9–0 / data mais recente)"
                    className="flex items-center justify-center p-2 bg-slate-800 hover:bg-blue-600 text-slate-300 border border-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <ArrowDownAZ size={16} />
                  </button>
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500 px-5 pb-4 leading-relaxed">
          A ordenação vale para a tabela inteira e mantém a caixinha de cada linha junto com ela.
          Valores vazios ficam por último.
        </p>
      </div>
    </div>
  );
};

export default OrdenarTabela;
