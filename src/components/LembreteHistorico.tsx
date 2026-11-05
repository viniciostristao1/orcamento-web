import React from 'react';
import { BellRing, Clock, X } from 'lucide-react';
import { formatarLembrete, type LembreteVencido } from '../utils/lembretes';

interface LembreteHistoricoProps {
  item: LembreteVencido;
  /** Botão principal: históricos navegam + concluem; rápido abre o sino (sem concluir). */
  onIrPara: (item: LembreteVencido) => void;
  /** Relógio: abre o sino com a reprogramação (sem concluir). */
  onReprogramar: (item: LembreteVencido) => void;
  /** X: esconde só esta caixinha (volta se a lista de vencidos mudar). */
  onDispensar: (item: LembreteVencido) => void;
}

const NOME_ORIGEM: Record<LembreteVencido['origem'], string> = {
  orcamento: 'Orçamento',
  flyer: 'Flyer',
  revisao: 'Revisão',
  rapido: 'Rápido',
};

/**
 * Um lembrete vencido = uma caixinha âmbar pulsante no canto inferior direito.
 * O `App` empilha uma por vencido (antes eram N botões numa caixa só, e o
 * clique no vão concluía o 1º — fácil perder o lembrete errado).
 */
const LembreteHistorico: React.FC<LembreteHistoricoProps> = ({ item, onIrPara, onReprogramar, onDispensar }) => {
  const nomeAcao =
    item.origem === 'rapido'
      ? `Ver lembrete ${item.rotulo} no sino`
      : item.origem === 'revisao'
        ? `Ir para revisão ${item.rotulo}`
        : `Ir para orçamento ${item.rotulo}`;
  const tituloIr =
    item.origem === 'rapido'
      ? `Ver "${item.rotulo}" no sino (sem concluir)`
      : `Abrir ${item.origem === 'flyer' ? 'flyer' : item.origem === 'revisao' ? 'revisão' : 'orçamento'} ${item.rotulo} (conclui o lembrete)`;
  const hora = formatarLembrete(item.quando);

  return (
    <div className="animate-pulse print:hidden">
      <div
        data-lembrete={`${item.origem}:${item.id}`}
        className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-amber-500/50 flex items-start gap-3 ring-1 ring-amber-400/40 max-w-[260px]"
      >
        <div className="bg-amber-500 p-2.5 rounded-xl shadow-lg shadow-amber-900/30 shrink-0">
          <BellRing className="text-black" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.1em]">
            Lembrete · {NOME_ORIGEM[item.origem]}
          </p>
          <button
            type="button"
            onClick={() => onIrPara(item)}
            aria-label={nomeAcao}
            title={tituloIr}
            className="font-extrabold text-slate-100 text-sm tracking-tight truncate text-left hover:text-amber-300 transition-colors cursor-pointer block w-full"
          >
            {item.rotulo}
          </button>
          {hora && (
            <p className="text-[11px] font-bold text-amber-300/90 truncate">{hora}</p>
          )}
        </div>
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onReprogramar(item)}
            aria-label={`Reprogramar lembrete ${item.rotulo}`}
            title="Reprogramar no sino (sem concluir)"
            className="p-1.5 text-slate-500 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <Clock size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDispensar(item)}
            aria-label={`Dispensar lembrete ${item.rotulo}`}
            title="Dispensar (volta se a lista mudar)"
            className="p-1.5 -mr-1 text-slate-500 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LembreteHistorico;
