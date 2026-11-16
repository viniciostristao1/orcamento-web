import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LEMBRETES_EVENTO } from '../utils/lembretes';
import {
  DIAS_SEMANA,
  NOME_TIPO,
  agruparPorDia,
  avancarMes,
  fatiaDia,
  gradeMes,
  listarLembretesCalendario,
  textoContador,
  tituloMes,
  type LembreteCalendario,
  type TipoCalendario,
} from './calendario';

/** Cor do bloco por tipo (paleta do app, sem cor nova): azul = Orçamento
 *  (cor primária), âmbar = Pneus (sinos/avisos), verde = Revisão (WhatsApp).
 *  `cal-orcamento` ganha texto escuro no acento claro (bege/cobre/terracota)
 *  via index.css — mesmo tratamento do botão primário. */
const CLASSE_TIPO: Record<TipoCalendario, string> = {
  orcamento: 'cal-orcamento bg-blue-600 text-white',
  pneus: 'bg-amber-500 text-black',
  revisao: 'bg-green-600 text-white',
};

const ORDEM_TIPOS: TipoCalendario[] = ['orcamento', 'pneus', 'revisao'];

const agora = (): { ano: number; mes: number } => {
  const d = new Date();
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 };
};

/** Aba Calendário: grade do mês (semana começa na segunda) com os lembretes
 *  que o app já guarda (`lembreteEm` dos históricos de orçamentos, flyer e
 *  revisões). Só leitura — sem cadastro novo nem mudança de chaves. */
const CalendarioApp: React.FC = () => {
  const [referencia, setReferencia] = useState<{ ano: number; mes: number }>(agora);
  const [lembretes, setLembretes] = useState<LembreteCalendario[]>(() => listarLembretesCalendario());

  useEffect(() => {
    const recarregar = (): void => setLembretes(listarLembretesCalendario());
    recarregar();
    window.addEventListener(LEMBRETES_EVENTO, recarregar);
    window.addEventListener('storage', recarregar);
    return () => {
      window.removeEventListener(LEMBRETES_EVENTO, recarregar);
      window.removeEventListener('storage', recarregar);
    };
  }, []);

  const porDia = agruparPorDia(lembretes, referencia.ano, referencia.mes);
  const semanas = gradeMes(referencia.ano, referencia.mes);
  const total = [...porDia.values()].reduce((soma, itens) => soma + itens.length, 0);

  const irPara = (delta: 1 | -1): void =>
    setReferencia((r) => avancarMes(r.ano, r.mes, delta));

  const botaoNavegar =
    'flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95';

  return (
    <div data-calendario>
      <div className="flex items-center justify-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => irPara(-1)}
          aria-label="Mês anterior"
          title="Mês anterior"
          className={botaoNavegar}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center min-w-52">
          <h2 className="titulo-tema text-xl font-black uppercase tracking-wide">
            {tituloMes(referencia.ano, referencia.mes)}
          </h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {textoContador(total)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => irPara(1)}
          aria-label="Próximo mês"
          title="Próximo mês"
          className={botaoNavegar}
        >
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => setReferencia(agora())}
          aria-label="Voltar ao mês atual"
          title="Voltar ao mês atual"
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95 text-xs font-black uppercase tracking-widest"
        >
          Hoje
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center py-0.5"
          >
            {d}
          </div>
        ))}
        {semanas.flat().map((celula, i) =>
          celula === null ? (
            <div key={`vazio-${i}`} className="min-h-[58px]" />
          ) : (
            <div
              key={`${referencia.ano}-${referencia.mes}-${celula.dia}`}
              className="min-h-[58px] border border-slate-800 rounded-lg p-1 bg-slate-900/40"
            >
              <div
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  celula.hoje ? 'bg-slate-800 text-slate-100 font-black' : 'text-slate-300'
                }`}
              >
                {celula.dia}
              </div>
              <div className="mt-0.5 space-y-0.5">
                {(() => {
                  const { visiveis, extras } = fatiaDia(porDia.get(celula.dia) ?? []);
                  return (
                    <>
                      {visiveis.map((l) => {
                        const texto = l.hora ? `${l.hora} · ${l.rotulo}` : l.rotulo;
                        return (
                          <span
                            key={`${l.tipo}:${l.id}`}
                            title={`${NOME_TIPO[l.tipo]} — ${texto}`}
                            className={`block w-full truncate rounded px-1 py-px text-[10px] font-bold text-left ${CLASSE_TIPO[l.tipo]}`}
                          >
                            {texto}
                          </span>
                        );
                      })}
                      {extras > 0 && (
                        <span className="block text-[10px] font-bold text-slate-500 pl-1">
                          +{extras}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {ORDEM_TIPOS.map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-sm ${CLASSE_TIPO[t]}`} aria-hidden="true" />
            {NOME_TIPO[t]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CalendarioApp;
