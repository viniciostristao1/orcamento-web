import React, { useEffect, useState } from 'react';
import { CornerUpRight } from 'lucide-react';
import {
  DADOS_EVENTO,
  DADOS_KEY,
  lerDados,
  type DadosTabelas,
} from '../dados/utils/tabelas';

interface AtalhosDadosProps {
  /** Vai para a aba Dados com a sub-aba correspondente aberta. */
  onIr: (abaId: string) => void;
}

/**
 * "SUB ATALHOS": botões (um abaixo do outro) para cada sub-aba da aba Dados.
 * A lista acompanha criações/exclusões/renomeações na hora (evento próprio +
 * `storage` entre janelas). Sem caixa — só o titulozinho e os botões.
 */
const AtalhosDados: React.FC<AtalhosDadosProps> = ({ onIr }) => {
  const [dados, setDados] = useState<DadosTabelas>(() => lerDados());

  useEffect(() => {
    const atualizar = (e?: Event) => {
      if (e instanceof StorageEvent && e.key && e.key !== DADOS_KEY) return;
      setDados(lerDados());
    };
    window.addEventListener(DADOS_EVENTO, atualizar);
    window.addEventListener('storage', atualizar);
    return () => {
      window.removeEventListener(DADOS_EVENTO, atualizar);
      window.removeEventListener('storage', atualizar);
    };
  }, []);

  if (dados.abas.length === 0) return null;

  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">
        Sub Atalhos
      </p>
      <div className="flex flex-col gap-1.5">
        {dados.abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onIr(a.id)}
            aria-label={`Ir para sub-aba ${a.rotulo}`}
            title={`Abrir ${a.rotulo} na aba Dados`}
            className="w-full flex items-center justify-between gap-1 px-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer active:scale-[0.98]"
          >
            <span className="truncate">{a.rotulo}</span>
            <CornerUpRight size={12} className="shrink-0 text-slate-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AtalhosDados;
