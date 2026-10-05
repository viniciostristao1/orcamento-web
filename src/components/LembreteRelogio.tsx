import React, { useState } from 'react';
import { Check, Clock, Eraser, X } from 'lucide-react';
import { formatarLembrete, paraInputDatetime } from '../utils/lembretes';

/**
 * Botão relógio de cada cartão do histórico: agenda um lembrete com data e
 * hora (âmbar quando marcado). Abre o editor abaixo.
 */
export const BotaoRelogio: React.FC<{
  lembreteEm?: string | null;
  onAbrir: () => void;
}> = ({ lembreteEm, onAbrir }) => {
  const ativo = !!formatarLembrete(lembreteEm);
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label="Lembrete"
      title={ativo ? `Lembrete em ${formatarLembrete(lembreteEm)}` : 'Programar lembrete (data e hora)'}
      aria-pressed={ativo}
      className={`flex items-center justify-center p-2.5 rounded-lg transition-all border cursor-pointer active:scale-95 ${
        ativo
          ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 ring-2 ring-amber-400/50'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
      }`}
    >
      <Clock size={16} />
    </button>
  );
};

/**
 * Painel de data/hora do lembrete (abre abaixo do cartão): confirma, limpa ou
 * fecha sem mexer.
 */
export const EditorLembrete: React.FC<{
  inicial?: string | null;
  temAtual: boolean;
  onConfirmar: (iso: string) => void;
  onLimpar: () => void;
  onFechar: () => void;
}> = ({ inicial, temAtual, onConfirmar, onLimpar, onFechar }) => {
  const [valor, setValor] = useState(() => paraInputDatetime(inicial));
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-2.5">
      <Clock size={14} className="text-amber-400 shrink-0" />
      <input
        autoFocus
        type="datetime-local"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        aria-label="Data e hora do lembrete"
        className="campo-tema border border-slate-800 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-200 focus:border-amber-500 outline-none [color-scheme:dark]"
      />
      <button
        type="button"
        onClick={() => valor && onConfirmar(valor)}
        disabled={!valor}
        aria-label="Confirmar lembrete"
        title="Confirmar lembrete"
        className="flex items-center justify-center p-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white rounded-lg transition-all cursor-pointer active:scale-95"
      >
        <Check size={14} strokeWidth={3} />
      </button>
      {temAtual && (
        <button
          type="button"
          onClick={onLimpar}
          aria-label="Limpar lembrete"
          title="Limpar lembrete"
          className="flex items-center justify-center p-2 bg-slate-800 hover:bg-red-600 text-slate-300 rounded-lg transition-all cursor-pointer active:scale-95"
        >
          <Eraser size={14} />
        </button>
      )}
      <button
        type="button"
        onClick={onFechar}
        aria-label="Fechar"
        title="Fechar"
        className="flex items-center justify-center p-2 text-slate-500 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
};
