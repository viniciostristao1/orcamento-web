import React from 'react';
import { BellRing, X } from 'lucide-react';
import type { LembreteVencido } from '../utils/lembretes';

interface LembreteHistoricoProps {
  itens: LembreteVencido[];
  /** Abre o orçamento/flyer em questão (e conclui o lembrete). */
  onIrPara: (item: LembreteVencido) => void;
  /** X: esconde o aviso (volta se a lista de vencidos mudar). */
  onDispensar: () => void;
}

/**
 * Lembretes vencidos dos históricos (orçamentos + tire flyer): pisca no canto
 * inferior direito; cada linha leva ao orçamento em questão. Mesmo padrão do
 * lembrete de contatos do Whats (área clicável + um botão por item + X).
 */
const LembreteHistorico: React.FC<LembreteHistoricoProps> = ({ itens, onIrPara, onDispensar }) => {
  if (itens.length === 0) return null;

  const irPrimeiro = () => onIrPara(itens[0]);
  const nomeAcao = (item: LembreteVencido): string =>
    item.origem === 'rapido' ? `Concluir lembrete ${item.rotulo}` : `Ir para orçamento ${item.rotulo}`;

  return (
    <div className="animate-pulse print:hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={irPrimeiro}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            irPrimeiro();
          }
        }}
        aria-label={
          itens.length === 1
            ? nomeAcao(itens[0])
            : `Ir para os ${itens.length} orçamentos com lembrete`
        }
        title="Ir para o orçamento"
        className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-amber-500/50 flex items-start gap-3 ring-1 ring-amber-400/40 max-w-[260px] cursor-pointer"
      >
        <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-900/30 shrink-0">
          <BellRing className="text-black" size={24} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.1em]">
            {itens.length === 1 ? 'Lembrete: 1 orçamento' : `Lembretes: ${itens.length} orçamentos`}
          </p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            {itens.map((item) => {
              return (
              <button
                key={`${item.origem}:${item.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onIrPara(item);
                }}
                aria-label={nomeAcao(item)}
                title={item.origem === 'rapido' ? `Concluir "${item.rotulo}"` : `Abrir ${item.origem === 'flyer' ? 'flyer' : 'orçamento'} ${item.rotulo}`}
                className="font-extrabold text-slate-100 text-lg tracking-tight truncate text-left hover:text-amber-300 transition-colors cursor-pointer"
              >
                {item.rotulo}
              </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDispensar();
          }}
          aria-label="Dispensar lembretes"
          title="Dispensar (volta se a lista mudar)"
          className="p-1.5 -mr-2 -mt-2 text-slate-500 hover:text-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default LembreteHistorico;
