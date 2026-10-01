import React, { useEffect, useState } from 'react';
import { CornerUpRight, Search, X } from 'lucide-react';
import {
  DADOS_EVENTO,
  DADOS_KEY,
  lerDados,
  type DadosTabelas,
} from '../dados/utils/tabelas';

interface AtalhosDadosProps {
  /** Vai para a aba Dados com a sub-aba correspondente aberta. */
  onIr: (abaId: string) => void;
  /** Pesquisa o termo na aba Dados (igual ao "Pesquisar nas tabelas" de lá). */
  onBuscar: (termo: string) => void;
}

const CLASSE_BOTAO =
  'w-full flex items-center justify-between gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer active:scale-[0.98]';

/**
 * "SUB ATALHOS": lupa de pesquisa + um botão por sub-aba da aba Dados
 * (um abaixo do outro). A lista acompanha criações/exclusões/renomeações na hora
 * (evento próprio + `storage` entre janelas). Sem caixa — só o titulozinho e os botões.
 */
const AtalhosDados: React.FC<AtalhosDadosProps> = ({ onIr, onBuscar }) => {
  const [dados, setDados] = useState<DadosTabelas>(() => lerDados());
  // Lupa aberta (vira campo de busca) + termo digitado.
  const [buscando, setBuscando] = useState(false);
  const [termo, setTermo] = useState('');

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

  const confirmarBusca = () => {
    if (termo.trim()) onBuscar(termo.trim());
    setBuscando(false);
  };

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">
        Sub Atalhos
      </p>
      <div className="flex flex-col gap-2">
        {buscando ? (
          <div className="relative">
            <input
              autoFocus
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  confirmarBusca();
                }
                if (e.key === 'Escape') setBuscando(false);
              }}
              onBlur={() => setBuscando(false)}
              placeholder="Buscar…"
              aria-label="Buscar nas tabelas"
              className="w-full campo-tema border border-blue-500 rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold text-slate-100 outline-none"
            />
            {termo ? (
              <button
                type="button"
                onClick={() => setTermo('')}
                aria-label="Limpar busca do atalho"
                title="Limpar"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            ) : (
              <Search
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTermo('');
              setBuscando(true);
            }}
            aria-label="Buscar termo nos Dados"
            title="Pesquisar nas tabelas da aba Dados"
            className={CLASSE_BOTAO}
          >
            <span className="truncate">Buscar</span>
            <Search size={14} className="shrink-0 text-slate-500" />
          </button>
        )}
        {dados.abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onIr(a.id)}
            aria-label={`Ir para sub-aba ${a.rotulo}`}
            title={`Abrir ${a.rotulo} na aba Dados`}
            className={CLASSE_BOTAO}
          >
            <span className="truncate">{a.rotulo}</span>
            <CornerUpRight size={14} className="shrink-0 text-slate-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AtalhosDados;
