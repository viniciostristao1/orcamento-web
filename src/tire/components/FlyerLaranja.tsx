import React from 'react';
import { PromoInfo } from '../types';
import { formatarPreco } from '../utils/parser';

interface FlyerLaranjaProps {
  data: PromoInfo;
}

const split = (v: number) => {
  const [int, dec] = formatarPreco(v).replace('R$', '').trim().split(',');
  return { int, dec };
};

/**
 * Layout "Laranja Queima-Estoque" (ideia 01 aprovada): cartões com dois quadros
 * de preço, à vista em laranja cheio; cabeçalho laranja com plaquinha preta.
 */
export const FlyerLaranja: React.FC<FlyerLaranjaProps> = ({ data }) => (
  <>
    <div className="bg-[#ea580c] px-10 py-[22px] flex flex-col items-center border-b-[10px] border-[#ea580c]">
      <h1 className="text-white text-5xl font-black uppercase tracking-tight leading-none mb-3 text-center">
        TABELA DE <span className="text-[#111827]">OFERTAS</span>
      </h1>
      <div className="bg-[#111827] text-[#fdba74] px-[52px] py-3 rounded-[44px] shadow-[0_15px_40px_rgba(0,0,0,0.4)] ring-[10px] ring-[#7c2d12] transform -rotate-1">
        <span className="block font-black text-4xl tracking-tight italic leading-none">
          {data.measure || 'PROMOÇÃO'}
        </span>
      </div>
    </div>

    <div className="bg-[#fff7ed] p-5 flex flex-col gap-4">
      {data.tires.map((tire, idx) => {
        const inst = split(tire.priceInstallment);
        const cash = split(tire.priceCash);
        return (
          <div
            key={idx}
            className="relative bg-white rounded-[32px] border-2 border-[#fed7aa] p-5 flex flex-col gap-3 shadow-sm overflow-hidden"
          >
            <div className="absolute left-0 top-3 bottom-3 w-3 rounded-r-[10px] bg-[#ea580c]" />

            <div className="flex justify-between items-center gap-3 pl-6">
              <h2 className="text-[34px] font-black italic uppercase tracking-tight leading-none text-[#9a3412]">
                {tire.brand}
              </h2>
              <div
                className={`px-5 py-2 rounded-2xl text-[15px] font-black tracking-widest uppercase border-[3px] whitespace-nowrap ${
                  tire.stock > 0
                    ? 'bg-[#ea580c] text-white border-[#9a3412]'
                    : 'bg-[#1c1917] text-[#fdba74] border-[#44403c]'
                }`}
              >
                {tire.stock > 0 ? `ESTOQUE: ${tire.stock} UN` : 'SOB ENCOMENDA'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pl-6">
              <div className="bg-white border-2 border-[#fdba74] border-b-[6px] rounded-2xl px-5 py-2 text-center flex flex-col justify-center">
                <p className="text-[13px] font-black uppercase text-[#9a3412] mb-0.5">Em até 10x no cartão</p>
                <div className="flex items-baseline justify-center font-black tracking-[-0.03em] leading-none text-[#7c2d12]">
                  <span className="text-lg mr-0.5">R$</span>
                  <span className="text-5xl">{inst.int}</span>
                  <span className="text-[23px]">,{inst.dec}</span>
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c2410c] mt-0.5">a unidade</p>
              </div>

              <div className="bg-[#ea580c] border-b-[6px] border-[#9a3412] rounded-2xl px-5 py-2 text-center flex flex-col justify-center text-white">
                <p className="text-[13px] font-black uppercase text-[#fed7aa] mb-0.5">Dinheiro / débito / Pix</p>
                <div className="flex items-baseline justify-center font-black tracking-[-0.03em] leading-none">
                  <span className="text-lg mr-0.5">R$</span>
                  <span className="text-5xl">{cash.int}</span>
                  <span className="text-[23px]">,{cash.dec}</span>
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ffedd5] mt-0.5">a unidade</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    <div className="bg-white px-8 pt-3 pb-8">
      <div className="bg-white rounded-[40px] py-3.5 px-6 border-2 border-slate-100 shadow-[0_12px_25px_rgba(0,0,0,0.12)] text-center">
        <p className="text-[26px] font-extrabold tracking-[0.22em] uppercase mb-0.5 text-[#1c1917] flex items-center justify-center gap-3">
          <span className="text-3xl">🎁</span> Benefícios:
        </p>
        <p className="text-[25px] font-bold uppercase tracking-tighter leading-tight text-[#1c1917]">
          • Montagem e balanceamento: <b className="text-[#ea580c] font-black">GRÁTIS</b>
        </p>
        <p className="text-[25px] font-bold uppercase tracking-tighter leading-tight text-[#1c1917]">
          • Alinhamento (na troca de 4 pneus): <b className="text-[#ea580c] font-black">GRÁTIS</b>
        </p>
      </div>
    </div>
  </>
);
