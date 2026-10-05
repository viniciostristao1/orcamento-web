import React from 'react';
import { Send, X } from 'lucide-react';
import type { Contact } from '../whats/types';

interface LembreteContatosProps {
  contatos: Contact[];
  /** Leva até o contato na aba Whats (a área toda é clicável). */
  onIrParaContato: (id: string) => void;
  /** X: esconde o aviso (volta se a lista de hoje mudar). */
  onDispensar: () => void;
}

/**
 * Lembrete global: aparece em TODAS as abas quando há contato(s) do Relatório
 * de Envios com data marcada para hoje (e ainda não concluídos). A janelinha
 * inteira é clicável e leva até o contato; com mais de um, cada nome leva ao
 * seu (o clique na área vai para o primeiro da lista).
 */
const LembreteContatos: React.FC<LembreteContatosProps> = ({
  contatos,
  onIrParaContato,
  onDispensar,
}) => {
  if (contatos.length === 0) return null;

  const irPrimeiro = () => onIrParaContato(contatos[0].id);

  return (
    <div className="animate-bounce print:hidden">
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
          contatos.length === 1
            ? `Ir para contato ${contatos[0].name}`
            : `Ir para os ${contatos.length} contatos de hoje`
        }
        title="Ir para o contato no Relatório de Envios"
        className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3 ring-1 ring-slate-700/40 max-w-[240px] cursor-pointer"
      >
        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/30 shrink-0">
          <Send className="text-white" size={24} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">
            {contatos.length === 1 ? 'Hoje: 1 para chamar' : `Hoje: ${contatos.length} para chamar`}
          </p>
          <div className="flex flex-col gap-0.5 mt-0.5">
            {contatos.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onIrParaContato(c.id);
                }}
                aria-label={`Ir para contato ${c.name}`}
                title={`Ir para ${c.name} no Relatório de Envios`}
                className="font-extrabold text-slate-100 text-lg tracking-tight truncate text-left hover:text-blue-300 transition-colors cursor-pointer"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDispensar();
          }}
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
