import React, { useEffect, useRef, useState } from 'react';
import { LayoutTemplate, LayoutList, Table, Tag, Flame, Flag, Newspaper } from 'lucide-react';
import type { LayoutFlyer } from '../utils/layoutFlyer';

interface SeletorLayoutFlyerProps {
  layout: LayoutFlyer;
  onChange: (layout: LayoutFlyer) => void;
}

const OPCOES: { id: LayoutFlyer; nome: string; descricao: string; Icone: typeof LayoutTemplate }[] = [
  { id: 'atual', nome: 'Clássico', descricao: 'Dois quadros por pneu (como é hoje)', Icone: LayoutList },
  { id: 'tabela', nome: 'Tabela de ofertas', descricao: 'Uma linha por pneu, valores em colunas', Icone: Table },
  { id: 'etiqueta', nome: 'Etiqueta de preço', descricao: 'Etiqueta com o à vista em destaque', Icone: Tag },
  { id: 'laranja', nome: 'Laranja Queima-Estoque', descricao: 'Laranja e preto, à vista em destaque', Icone: Flame },
  { id: 'racing', nome: 'Vermelho Racing', descricao: 'Faixas vermelho/preto com listra de corrida', Icone: Flag },
  { id: 'encarte', nome: 'Amarelo Encarte', descricao: 'Tabela estilo encarte de jornal', Icone: Newspaper },
];

/**
 * Ícone que troca o layout de SAÍDA do flyer (o PNG exportado usa o escolhido).
 * O clássico continua sendo o padrão; a escolha fica salva no navegador.
 */
export const SeletorLayoutFlyer: React.FC<SeletorLayoutFlyerProps> = ({ layout, onChange }) => {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const aoClicarFora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  const ativa = OPCOES.find((o) => o.id === layout) ?? OPCOES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-label="Layout do flyer"
        title={`Layout do flyer: ${ativa.nome}`}
        className={`h-full flex items-center justify-center px-5 rounded-xl transition-all border cursor-pointer active:scale-95 ${
          aberto
            ? 'bg-blue-600 text-white border-blue-500'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
        }`}
      >
        <LayoutTemplate size={28} />
      </button>

      {aberto && (
        <div className="absolute left-0 bottom-full mb-3 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-[120]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-3 pt-2 pb-2">
            Layout do flyer
          </p>
          <div className="max-h-[52vh] overflow-y-auto pr-1 -mr-1">
            {OPCOES.map((opcao) => {
              const ativo = layout === opcao.id;
              const Icone = opcao.Icone;
              return (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => { onChange(opcao.id); setAberto(false); }}
                  aria-label={`Layout ${opcao.nome}`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border transition-colors cursor-pointer ${
                    ativo
                      ? 'bg-blue-600/10 border-blue-500/40'
                      : 'border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      ativo
                        ? 'text-blue-400 border-blue-500/40 bg-blue-600/10'
                        : 'text-slate-400 border-slate-700 bg-slate-900'
                    }`}
                  >
                    <Icone size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-black uppercase tracking-widest text-slate-200 truncate">
                      {opcao.nome}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5 truncate">{opcao.descricao}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeletorLayoutFlyer;
