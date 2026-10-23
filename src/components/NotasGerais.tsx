import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Eraser, Plus, StickyNote, Trash2, X } from 'lucide-react';
import {
  criarNotaGeral,
  excluirNotaGeral,
  listarNotasGerais,
  salvarNotaGeral,
  type NotaGeral,
} from '../utils/notasGerais';

/** Uma nota do bloco geral: rascunho local + salvar/copiar/limpar/excluir. */
const NotaGeralItem: React.FC<{
  nota: NotaGeral;
  onMudou: (lista: NotaGeral[]) => void;
}> = ({ nota, onMudou }) => {
  const [rascunho, setRascunho] = useState(nota.texto);
  const [copiado, setCopiado] = useState(false);
  const suja = rascunho !== nota.texto;

  const salvar = () => onMudou(salvarNotaGeral(nota.id, rascunho));

  const copiar = () => {
    if (!rascunho.trim()) return;
    navigator.clipboard.writeText(rascunho);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  };

  // Limpar esvazia e já salva (igual à borracha das notas da aba Dados).
  const limpar = () => {
    setRascunho('');
    onMudou(salvarNotaGeral(nota.id, ''));
  };

  const excluir = () => {
    if (!window.confirm('Excluir esta nota?')) return;
    onMudou(excluirNotaGeral(nota.id));
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900">
      <textarea
        value={rascunho}
        onChange={(e) => setRascunho(e.target.value)}
        placeholder="Escreva a anotação…"
        aria-label="Texto da nota geral"
        rows={3}
        className="w-full bg-transparent px-3 pt-2.5 text-sm font-bold text-slate-100 outline-none resize-y placeholder:text-slate-600 min-h-[4.5rem]"
      />
      <div className="flex items-center gap-1.5 px-2 pb-2">
        <span
          className={`text-[10px] font-black uppercase tracking-widest mr-auto ${suja ? 'text-amber-400' : 'text-slate-600'}`}
          title={suja ? 'Mudanças ainda não salvas' : `Salva em ${nota.atualizadoEm}`}
        >
          {suja ? '● não salva' : 'Salva'}
        </span>
        <button
          type="button"
          onClick={salvar}
          aria-label="Salvar nota"
          title="Salvar nota"
          className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all cursor-pointer active:scale-95"
        >
          <Check size={14} strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={copiar}
          aria-label={copiado ? 'Nota copiada' : 'Copiar nota'}
          title={copiado ? 'Nota copiada' : 'Copiar nota'}
          className={`p-1.5 rounded-lg transition-all cursor-pointer active:scale-95 ${
            copiado ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          {copiado ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
        </button>
        <button
          type="button"
          onClick={limpar}
          aria-label="Limpar nota"
          title="Limpar nota (esvazia)"
          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Eraser size={14} />
        </button>
        <button
          type="button"
          onClick={excluir}
          aria-label="Excluir nota"
          title="Excluir nota"
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

/**
 * Bloco de notas gerais (botão ao lado do sino): anotações livres — algo a
 * melhorar, recados, qualquer coisa. Nova nota + salvar/copiar/limpar/excluir
 * por nota. Tudo local, com backup geral.
 */
const NotasGerais: React.FC = () => {
  const [aberto, setAberto] = useState(false);
  const [notas, setNotas] = useState<NotaGeral[]>(() => listarNotasGerais());
  const ref = useRef<HTMLDivElement>(null);

  const recarregar = () => setNotas(listarNotasGerais());

  useEffect(() => {
    recarregar();
    window.addEventListener('storage', recarregar);
    return () => window.removeEventListener('storage', recarregar);
  }, []);

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
        onClick={() => {
          if (aberto) setAberto(false);
          else {
            recarregar();
            setAberto(true);
          }
        }}
        aria-label="Notas gerais"
        title="Notas gerais (anotações livres)"
        className={`relative flex items-center justify-center p-3 rounded-xl transition-all border cursor-pointer active:scale-95 ${
          aberto
            ? 'bg-amber-500 text-black border-amber-400'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
        }`}
      >
        <StickyNote size={18} />
        {notas.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
            {notas.length > 99 ? '99' : notas.length}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-3 w-[32rem] max-w-[90vw] max-h-[70vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-3 z-[120]">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Notas gerais ({notas.length})
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setNotas(criarNotaGeral())}
                aria-label="Nova nota"
                title="Nova nota"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-all cursor-pointer active:scale-95 text-[10px] font-black uppercase tracking-widest"
              >
                <Plus size={14} strokeWidth={3} />
                Nova
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                title="Fechar"
                className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {notas.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 px-1 pb-2">Nenhuma nota. Clique em Nova.</p>
          ) : (
            <div className="space-y-2">
              {notas.map((nota) => (
                <NotaGeralItem key={nota.id} nota={nota} onMudou={setNotas} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotasGerais;
