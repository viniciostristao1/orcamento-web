import React from 'react';
import { PromoInfo } from '../types';
import { formatarPreco } from '../utils/parser';

interface FlyerEncarteProps {
  data: PromoInfo;
}

/**
 * Layout "Amarelo Encarte" (ideia 09 aprovada): tabela estilo encarte de
 * jornal com faixa hazard no topo, carimbos de estoque e chamada no rodapé.
 */
export const FlyerEncarte: React.FC<FlyerEncarteProps> = ({ data }) => (
  <>
    <div className="bg-[#facc15] px-10 py-[22px] flex flex-col items-center border-b-[10px] border-[#b91c1c]">
      <h1 className="text-[#111827] text-5xl font-black uppercase tracking-tight leading-none mb-3 text-center">
        TABELA DE <span className="text-[#dc2626]">OFERTAS</span>
      </h1>
      <div className="bg-[#111827] text-[#facc15] px-[52px] py-3 rounded-[44px] shadow-[0_15px_40px_rgba(0,0,0,0.4)] ring-[10px] ring-[#a16207] transform -rotate-1">
        <span className="block font-black text-4xl tracking-tight italic leading-none">
          {data.measure || 'PROMOÇÃO'}
        </span>
      </div>
    </div>

    <div
      className="h-3.5"
      style={{ background: 'repeating-linear-gradient(45deg, #111827 0 16px, #facc15 16px 32px)' }}
    />

    <div className="bg-white p-5 flex flex-col">
      <table className="w-full border-collapse border-[3px] border-[#111827]">
        <thead>
          <tr>
            <th className="bg-[#111827] text-[#facc15] text-[13px] font-black uppercase tracking-wider px-3.5 py-3 text-left">
              Pneu
            </th>
            <th className="bg-[#111827] text-[#facc15] text-[13px] font-black uppercase tracking-wider px-3.5 py-3 text-center">
              Em até 10x
            </th>
            <th className="bg-[#111827] text-[#facc15] text-[13px] font-black uppercase tracking-wider px-3.5 py-3 text-center">
              À vista 💰
            </th>
            <th className="bg-[#111827] text-[#facc15] text-[13px] font-black uppercase tracking-wider px-3.5 py-3 text-center">
              Estoque
            </th>
          </tr>
        </thead>
        <tbody>
          {data.tires.map((tire, idx) => (
            <tr key={idx}>
              <td
                className={`px-3.5 py-3 text-[19px] font-black uppercase tracking-tight ${
                  idx === data.tires.length - 1 ? '' : 'border-b-2 border-[#e5e7eb]'
                }`}
              >
                {tire.brand}
              </td>
              <td
                className={`px-3.5 py-3 text-center text-base font-extrabold text-[#6b7280] whitespace-nowrap tabular-nums ${
                  idx === data.tires.length - 1 ? '' : 'border-b-2 border-[#e5e7eb]'
                }`}
              >
                10x de {formatarPreco(tire.priceInstallment)}
              </td>
              <td
                className={`px-3.5 py-3 text-center text-2xl font-black text-[#b91c1c] whitespace-nowrap tabular-nums ${
                  idx === data.tires.length - 1 ? '' : 'border-b-2 border-[#e5e7eb]'
                }`}
              >
                {formatarPreco(tire.priceCash)}
              </td>
              <td className={`px-3.5 py-3 text-center ${idx === data.tires.length - 1 ? '' : 'border-b-2 border-[#e5e7eb]'}`}>
                <span
                  className={`inline-block border-[3px] rounded-lg px-2.5 py-[3px] text-xs font-black uppercase tracking-wide ${
                    tire.stock > 0
                      ? 'text-[#15803d] border-[#15803d]'
                      : 'text-[#b91c1c] border-[#b91c1c]'
                  }`}
                >
                  {tire.stock > 0 ? `${tire.stock} UN` : 'SOB ENCOMENDA'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3.5 bg-[#111827] text-[#facc15] text-center text-base font-black uppercase tracking-widest py-3">
        📞 Consulte disponibilidade · Montagem GRÁTIS na troca
      </div>
    </div>

    <div className="bg-white px-8 pt-3 pb-8">
      <div className="bg-white rounded-[40px] py-3.5 px-6 border-2 border-slate-100 shadow-[0_12px_25px_rgba(0,0,0,0.12)] text-center">
        <p className="text-[26px] font-extrabold tracking-[0.22em] uppercase mb-0.5 text-[#111827] flex items-center justify-center gap-3">
          <span className="text-3xl">🎁</span> Benefícios:
        </p>
        <p className="text-[25px] font-bold uppercase tracking-tighter leading-tight text-[#111827]">
          • Montagem e balanceamento: <b className="text-[#b91c1c] font-black">GRÁTIS</b>
        </p>
        <p className="text-[25px] font-bold uppercase tracking-tighter leading-tight text-[#111827]">
          • Alinhamento (na troca de 4 pneus): <b className="text-[#b91c1c] font-black">GRÁTIS</b>
        </p>
      </div>
    </div>
  </>
);
