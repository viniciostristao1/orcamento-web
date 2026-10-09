import React, { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import {
  LEMBRETES_EVENTO,
  avisarLembretesMudaram,
  formatarLembrete,
  listarTodosLembretes,
  type LembreteAgendado,
} from '../utils/lembretes';
import {
  criarRapido,
  removerRapido,
} from '../utils/lembretesRapidos';
import { atualizarLembreteFlyer } from '../tire/utils/historicoFlyer';
import { atualizarLembreteHistorico } from '../utils/historico';

/**
 * Sino do header (entre o cadeado e as configurações): cria lembretes rápidos
 * (texto + data/hora) e lista TODOS os lembretes — rápidos + históricos de
 * orçamentos e tire flyer — cada um com excluir. O selo mostra quantos há.
 */
const SinoLembretes: React.FC = () => {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState('');
  const [quando, setQuando] = useState('');
  const [erro, setErro] = useState('');
  const [itens, setItens] = useState<LembreteAgendado[]>(() => listarTodosLembretes());
  const ref = useRef<HTMLDivElement>(null);

  const recarregar = () => setItens(listarTodosLembretes());

  // Fechar (por qualquer caminho) limpa o que estava sendo escrito.
  const fechar = () => {
    setTexto('');
    setQuando('');
    setErro('');
    setAberto(false);
  };

  useEffect(() => {
    recarregar();
    const timer = window.setInterval(recarregar, 30000);
    window.addEventListener(LEMBRETES_EVENTO, recarregar);
    window.addEventListener('storage', recarregar);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(LEMBRETES_EVENTO, recarregar);
      window.removeEventListener('storage', recarregar);
    };
  }, []);

  useEffect(() => {
    if (!aberto) return;
    const aoClicarFora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) fechar();
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const salvar = () => {
    const r = criarRapido(texto, quando);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setTexto('');
    setQuando('');
    setErro('');
    recarregar();
    avisarLembretesMudaram();
  };

  const excluir = (item: LembreteAgendado) => {
    if (item.origem === 'rapido') removerRapido(item.id);
    else if (item.origem === 'flyer') atualizarLembreteFlyer(item.id, null);
    else atualizarLembreteHistorico(item.id, null);
    recarregar();
    avisarLembretesMudaram();
  };

  const nomeOrigem =
    (o: LembreteAgendado['origem']): string =>
      o === 'rapido' ? 'Rápido' : o === 'flyer' ? 'Flyer' : 'Orçamento';

  // O selo conta só vencidos (atrasados ou na tela) — não todos os agendados.
  const nVencidos = itens.filter((i) => i.vencido).length;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          if (aberto) fechar();
          else {
            recarregar();
            setAberto(true);
          }
        }}
        aria-label="Lembretes"
        title="Lembretes (rápidos + históricos)"
        className={`relative flex items-center justify-center p-3 rounded-xl transition-all border cursor-pointer active:scale-95 ${
          aberto
            ? 'bg-blue-600 text-white border-blue-500'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
        }`}
      >
        <Bell size={18} />
        {nVencidos > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
            {nVencidos > 99 ? '99' : nVencidos}
          </span>
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-3 w-[26rem] max-w-[90vw] max-h-[70vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-3 z-[120]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-3 pt-2 pb-2">
            Lembrete rápido
          </p>
          <div className="space-y-2 px-3">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="O que lembrar?"
              aria-label="Texto do lembrete"
              maxLength={120}
              className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-blue-500 outline-none"
            />
            <input
              type="datetime-local"
              value={quando}
              onChange={(e) => setQuando(e.target.value)}
              aria-label="Data e hora do lembrete rápido"
              className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2.5 text-lg font-bold text-white focus:border-blue-500 outline-none [color-scheme:dark]"
            />
            {erro && <p className="text-xs font-bold text-red-400">{erro}</p>}
            <button
              type="button"
              onClick={salvar}
              aria-label="Salvar lembrete"
              title="Salvar lembrete"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95 cursor-pointer text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <BellRing size={14} />
              Salvar lembrete
            </button>
          </div>

          <div className="h-px bg-slate-800 my-3"></div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-3 pb-2">
            Todos os lembretes ({itens.length})
          </p>
          {itens.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 px-3 pb-2">Nenhum lembrete.</p>
          ) : (
            <div className="space-y-1.5 px-1">
              {itens.map((item) => (
                <div
                  key={`${item.origem}:${item.id}`}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border ${
                    item.vencido ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 shrink-0 w-16">
                    {nomeOrigem(item.origem)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-100 break-words line-clamp-2" title={item.rotulo}>{item.rotulo}</span>
                    <span className={`block text-[11px] font-bold ${item.vencido ? 'text-amber-300' : 'text-slate-500'}`}>
                      {formatarLembrete(item.quando) ?? item.quando}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => excluir(item)}
                    aria-label={`Excluir lembrete ${item.rotulo}`}
                    title="Excluir lembrete"
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SinoLembretes;
