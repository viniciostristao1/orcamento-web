import React from 'react';
import { PromoInfo } from '../types';
import { formatarPreco } from '../utils/parser';

interface FlyerRacingProps {
  data: PromoInfo;
}

/**
 * Layout "Vermelho Racing" (ideia 02 aprovada): faixas horizontais por pneu
 * (vermelho do à vista e preto do 10x) com listra quadriculada no cabeçalho.
 */
export const FlyerRacing: React.FC<FlyerRacingProps> = ({ data }) => (
  <>
    <div className="bg-[#111827] px-10 py-[22px] flex flex-col items-center border-b-[10px] border-[#dc2626]">
      <h1 className="text-white text-5xl font-black uppercase tracking-tight leading-none mb-3 text-center">
        TABELA DE <span className="text-[#ef4444]">OFERTAS</span>
      </h1>
      <div className="bg-white text-[#111827] px-[52px] py-3 rounded-[44px] shadow-[0_15px_40px_rgba(0,0,0,0.4)] ring-[10px] ring-[#dc2626] transform -rotate-1">
        <span className="block font-black text-4xl tracking-tight italic leading-none">
          {data.measure || 'PROMOÇÃO'}
        </span>
      </div>
    </div>

    <div
      className="h-3"
      style={{ background: 'repeating-linear-gradient(90deg, #fff 0 14px, #111827 14px 28px)' }}
    />

    <div className="bg-[#f9fafb] p-5 flex flex-col gap-4">
      {data.tires.map((tire, idx) => (
        <div key={idx} className="bg-white rounded-[20px] border-2 border-slate-200 overflow-hidden">
          <div className="flex justify-between items-center gap-2.5 px-5 pt-[11px] pb-[9px] bg-white">
            <span className="text-[27px] font-black italic uppercase tracking-tight leading-none text-[#111827]">
              {tire.brand}
            </span>
            <span className={`text-[13px] font-black uppercase tracking-wider ${tire.stock > 0 ? 'text-[#15803d]' : 'text-[#dc2626]'}`}>
              {tire.stock > 0 ? `Estoque: ${tire.stock} un` : 'Sob encomenda'}
            </span>
          </div>

          <div className="bg-[#dc2626] text-white px-5 py-3 flex justify-between items-baseline">
            <span className="text-base font-black uppercase tracking-widest">À vista</span>
            <span className="text-[42px] font-black tracking-[-0.045em] leading-none tabular-nums">
              {formatarPreco(tire.priceCash)}
            </span>
          </div>

          <div className="bg-[#111827] text-[#fca5a5] px-5 py-[9px] flex justify-between items-baseline">
            <span className="text-[15px] font-bold">ou em até 10x no cartão</span>
            <span className="text-[21px] font-black tracking-[-0.02em] tabular-nums">
              {formatarPreco(tire.priceInstallment)}
            </span>
          </div>
        </div>
      ))}
    </div>

    <div className="bg-white px-8 pt-3 pb-8">
      <div className="bg-white rounded-[40px] py-3.5 px-6 border-2 border-slate-100 shadow-[0_12px_25px_rgba(0,0,0,0.12)] text-center">
        <p className="text-[26px] font-extrabold tracking-[0.22em] uppercase mb-0.5 text-[#111827] flex items-center justify-center gap-3">
          <span className="text-3xl">🎁</span> Benefícios:
        </p>
        <p className="text-[25px] font-bold uppercase tracking-tighter leading-tight text-[#111827]">
          • Montagem e balanceamento: <b className="text-[#dc2626] font-black">GRÁTIS</b>
        </p>
        <p className="text-[25px] font-bold uppercase tracking-tighter leading-tight text-[#111827]">
          • Alinhamento (na troca de 4 pneus): <b className="text-[#dc2626] font-black">GRÁTIS</b>
        </p>
      </div>
    </div>
  </>
);
