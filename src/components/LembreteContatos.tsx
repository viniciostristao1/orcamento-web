import React from 'react';
import { Send, X } from 'lucide-react';
import type { Contact } from '../whats/types';

interface LembreteContatosProps {
  contatos: Contact[];
  /** Clicou num contato: a App troca para a aba Whats e rola até ele. */
  onIrParaContato: (id: string) => void;
  /** X: esconde o aviso (volta se a lista de hoje mudar). */
  onDispensar: () => void;
}

/**
 * Lembrete global: aparece em TODAS as abas quando há contato(s) do Relatório
 * de Envios com data marcada para hoje (e ainda não concluídos). Cada nome é um
 * botão que leva até o contato na aba Whats.
 */
const LembreteContatos: React.FC<LembreteContatosProps> = ({
  contatos,
  onIrParaContato,
  onDispensar,
}) => {
  if (contatos.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[300] animate-bounce print:hidden">
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-800 flex items-start gap-5 ring-1 ring-slate-700/40 max-w-xs">
        <div className="bg-blue-600 p-3.5 rounded-2xl shadow-lg shadow-blue-900/30 shrink-0">
          <Send className="text-white" size={32} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
            {contatos.length === 1 ? 'Hoje tem 1 contato para chamar' : `Hoje tem ${contatos.length} contatos para chamar`}
          </p>
          <div className="flex flex-col gap-1 mt-1">
            {contatos.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onIrParaContato(c.id)}
                aria-label={`Ir para contato ${c.name}`}
                title={`Ir para ${c.name} no Relatório de Envios`}
                className="font-extrabold text-slate-100 text-xl tracking-tight truncate text-left hover:text-blue-300 transition-colors cursor-pointer"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onDispensar}
          aria-label="Dispensar lembrete"
          title="Dispensar (volta se a lista de hoje mudar)"
          className="p-1.5 -mr-2 -mt-2 text-slate-500 hover:text-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default LembreteContatos;
