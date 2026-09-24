import React, { useEffect, useRef, useState } from 'react';
import { Settings, Check } from 'lucide-react';
import type { Tema } from '../utils/tema';

interface ConfiguracoesTemaProps {
  tema: Tema;
  onChange: (tema: Tema) => void;
}

const OPCOES: { id: Tema; nome: string; descricao: string }[] = [
  { id: 'original', nome: 'Original', descricao: 'Visual do app (azul e cinza-escuro)' },
  { id: 'claude', nome: 'Claude', descricao: 'Tema escuro (cinzas quentes e laranja)' },
];

const ConfiguracoesTema: React.FC<ConfiguracoesTemaProps> = ({ tema, onChange }) => {
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-label="Configurações"
        title="Configurações"
        className={`flex items-center justify-center p-3 rounded-xl transition-all border cursor-pointer active:scale-95 ${
          aberto
            ? 'bg-blue-600 text-white border-blue-500'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
        }`}
      >
        <Settings size={18} />
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-3 z-[120]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-3 pt-2 pb-3">
            Tema da interface
          </p>
          {OPCOES.map((opcao) => {
            const ativo = tema === opcao.id;
            return (
              <button
                key={opcao.id}
                type="button"
                onClick={() => { onChange(opcao.id); setAberto(false); }}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left border transition-colors cursor-pointer ${
                  ativo
                    ? 'bg-blue-600/10 border-blue-500/40'
                    : 'border-transparent hover:bg-slate-900'
                }`}
              >
                <span
                  className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    ativo ? 'border-blue-500 bg-blue-600' : 'border-slate-600'
                  }`}
                >
                  {ativo && <Check size={11} className="text-white" />}
                </span>
                <span>
                  <span className="block text-xs font-black uppercase tracking-widest text-slate-200">
                    {opcao.nome}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1">{opcao.descricao}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesTema;
