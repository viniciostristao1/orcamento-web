import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import type { LembreteDisparo } from '../utils/lembrete';

interface LembreteDisparoProps {
  valor: LembreteDisparo;
  onChange: (lembrete: LembreteDisparo) => void;
}

/**
 * Cartão "Lembrete de Disparo": configura o aviso pop-up que pula na aba Whats
 * no dia do disparo mensal — dia do mês, textos e liga/desliga.
 */
const LembreteDisparo: React.FC<LembreteDisparoProps> = ({ valor, onChange }) => {
  const set = (patch: Partial<LembreteDisparo>) => onChange({ ...valor, ...patch });

  const handleDia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseInt(e.target.value, 10);
    set({ dia: Number.isFinite(n) ? Math.min(31, Math.max(1, n)) : 1 });
  };

  return (
    <div className="bg-slate-900/60 p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-slate-800 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-900/30 border border-blue-500/30">
            {valor.ativo ? (
              <Bell className="text-white" size={20} />
            ) : (
              <BellOff className="text-white" size={20} />
            )}
          </div>
          <div>
            <h2 className="titulo-tema text-lg font-black text-slate-100 uppercase tracking-tight">
              Lembrete de Disparo
            </h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Aviso pop-up mensal
            </p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={valor.ativo}
            onChange={(e) => set({ ativo: e.target.checked })}
            aria-label="Lembrete ativo"
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          Ativo
        </label>
      </div>

      <div className="grid grid-cols-[90px_1fr] gap-3 items-end">
        <div>
          <label
            htmlFor="lembrete-dia"
            className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-2 tracking-[0.2em]"
          >
            Dia do mês
          </label>
          <input
            id="lembrete-dia"
            type="number"
            min={1}
            max={31}
            value={valor.dia}
            onChange={handleDia}
            aria-label="Dia do mês"
            className="w-full px-4 py-3 campo-tema text-slate-100 border border-slate-800 rounded-2xl focus:border-blue-500/40 outline-none transition-all text-lg font-bold text-center"
          />
        </div>
        <div>
          <label
            htmlFor="lembrete-titulo"
            className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-2 tracking-[0.2em]"
          >
            Título do aviso
          </label>
          <input
            id="lembrete-titulo"
            type="text"
            value={valor.titulo}
            onChange={(e) => set({ titulo: e.target.value })}
            aria-label="Título do aviso"
            placeholder="HOJE É DIA 01"
            maxLength={60}
            className="w-full px-4 py-3 campo-tema text-slate-100 border border-slate-800 rounded-2xl focus:border-blue-500/40 outline-none transition-all text-lg font-bold placeholder:text-slate-700"
          />
        </div>
      </div>

      <div className="mt-3">
        <label
          htmlFor="lembrete-mensagem"
          className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-2 tracking-[0.2em]"
        >
          Mensagem do aviso
        </label>
        <input
          id="lembrete-mensagem"
          type="text"
          value={valor.mensagem}
          onChange={(e) => set({ mensagem: e.target.value })}
          aria-label="Mensagem do aviso"
          placeholder="Disparar Agora!"
          maxLength={60}
          className="w-full px-4 py-3 campo-tema text-slate-100 border border-slate-800 rounded-2xl focus:border-blue-500/40 outline-none transition-all text-lg font-bold placeholder:text-slate-700"
        />
      </div>

      <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase mt-3">
        O aviso pula na aba Whats quando chega esse dia do mês (vale para meses com o dia; ex.:
        dia 31 não aparece em fevereiro).
      </p>
    </div>
  );
};

export default LembreteDisparo;
