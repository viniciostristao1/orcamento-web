import React from 'react';
import { PromoInfo } from '../types';
import { formatarPreco } from '../utils/parser';

interface FlyerProps {
  data: PromoInfo;
  flyerRef: React.RefObject<HTMLDivElement | null>;
}

const getBrandStyle = (brandName: string) => {
  const name = brandName.toUpperCase();
  
  if (name.includes('DUNLOP')) {
    return { textColor: '#f97316', sideBarColor: '#000000' }; // Laranja / Barra Preta
  }
  if (name.includes('BF GOODRICH') || name.includes('BFGOODRICH')) {
    return { textColor: '#1e3a8a', sideBarColor: '#ef4444' }; // Azul Escuro / Barra Vermelha
  }
  if (name.includes('MICHELIN')) {
    return { textColor: '#2563eb', sideBarColor: '#000000' }; // Azul / Barra Preta
  }
  if (name.includes('BRIDGESTONE')) {
    return { textColor: '#000000', sideBarColor: '#ef4444' }; // Preto / Barra Vermelha
  }
  
  return { textColor: '#1e293b', sideBarColor: '#cbd5e1' }; // Padrão
};

export const Flyer: React.FC<FlyerProps> = ({ data, flyerRef }) => {
  return (
    <div 
      ref={flyerRef}
      data-saida="flyer"
      className="bg-white text-slate-900 w-[750px] shadow-2xl overflow-hidden font-sans border border-slate-200"
      style={{ minHeight: 'auto' }}
    >
      {/* Header: Compact and Centralized */}
      <div className="bg-slate-900 px-10 py-5 flex flex-col items-center border-b-[10px] border-[#2ecc71] relative">
        <div className="flex flex-col items-center w-full">
           <h1 className="text-white text-5xl font-black uppercase tracking-tighter leading-none mb-3 text-center">
            TABELA DE <span className="text-[#2ecc71]">OFERTAS</span>
          </h1>
        </div>

        {/* Measure Display */}
        <div className="bg-white text-slate-900 px-12 py-2.5 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.4)] ring-[10px] ring-slate-800 transform -rotate-1">
          <span className="block font-black text-4xl tracking-tighter italic leading-none">
            {data.measure || "PROMOÇÃO"}
          </span>
        </div>
      </div>

      {/* List Area */}
      <div className="p-5 space-y-4 bg-slate-50">
        {data.tires.length > 0 ? data.tires.map((tire, idx) => {
          const style = getBrandStyle(tire.brand);
          const formattedInstallment = formatarPreco(tire.priceInstallment);
          const formattedCash = formatarPreco(tire.priceCash);

          return (
            <div 
              key={idx} 
              className="bg-white rounded-[2rem] border-2 border-slate-200 p-5 flex flex-col gap-3 relative shadow-sm overflow-hidden"
            >
              {/* The Side Bar Finisher */}
              <div 
                className="absolute left-0 top-3 bottom-3 w-3 rounded-r-[10px]"
                style={{ backgroundColor: style.sideBarColor }}
              />

              <div className="flex justify-between items-center pl-6">
                <div className="flex-1">
                  <h2 
                    className="text-4xl font-black uppercase tracking-tighter leading-none italic"
                    style={{ color: style.textColor }}
                  >
                    {tire.brand}
                  </h2>
                </div>

                {/* Status Tag */}
                <div className={`px-6 py-2 rounded-2xl text-base font-black tracking-widest uppercase border-4 shadow-sm flex items-center justify-center min-w-[200px] transition-all ${
                  tire.stock > 0 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-500' 
                    : 'bg-red-100 text-red-700 border-red-600'
                }`}>
                  {tire.stock > 0 ? `ESTOQUE: ${tire.stock} UN` : 'SOB ENCOMENDA'}
                </div>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-3 pl-6">
                {/* Card Price Box */}
                <div className="bg-[#0f172a] rounded-2xl py-2 px-5 border-b-4 border-slate-800 flex flex-col justify-center text-white text-center">
                  <p className="text-[13px] font-black text-slate-400 uppercase tracking-tight mb-0.5">EM ATÉ 10X NO CARTÃO DE CRÉDITO</p>
                  <div className="flex items-baseline justify-center gap-0.5 text-[#2ecc71]">
                    <span className="text-lg font-black mr-0.5">R$</span>
                    <span className="text-5xl font-black leading-none tracking-tighter">
                      {formattedInstallment.replace('R$', '').trim().split(',')[0]}
                    </span>
                    <span className="text-2xl font-black">
                      ,{formattedInstallment.split(',')[1]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-black uppercase tracking-[0.2em]">A UNIDADE</p>
                </div>

                {/* Cash Price Box */}
                <div className="bg-[#15803d] rounded-2xl py-2 px-5 text-white shadow-xl flex flex-col justify-center border-b-4 border-[#166534] text-center">
                  <p className="text-[13px] font-black uppercase tracking-tight mb-0.5 text-white/90">DINHEIRO / DÉBITO / PIX</p>
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-lg font-black mr-0.5">R$</span>
                    <span className="text-6xl font-black leading-none tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      {formattedCash.replace('R$', '').trim().split(',')[0]}
                    </span>
                    <span className="text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      ,{formattedCash.split(',')[1]}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 mt-0.5 font-black uppercase tracking-[0.2em]">A UNIDADE</p>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="h-[200px] flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-sm border-2 border-dashed border-slate-200 rounded-[2rem]">
            Aguardando dados...
          </div>
        )}
      </div>

      {/* Footer: Benefits Section */}
      <div className="bg-white px-8 pt-2 pb-8">
        {/* Highlight Box: Sombreado externo "contornado" mais nítido para combinar com os boxes de preço */}
        <div className="bg-white rounded-[2.5rem] py-4 px-6 border-2 border-slate-100 shadow-[0_12px_25px_rgba(0,0,0,0.12)]">
          <div className="text-center">
            <p className="text-[26px] font-bold text-slate-900 uppercase tracking-[0.25em] mb-1 flex items-center justify-center gap-3">
              <span className="text-3xl">🎁</span> BENEFÍCIOS:
            </p>
            <div className="flex flex-col justify-center items-center gap-y-0">
              <p className="text-[26px] font-bold text-slate-800 uppercase tracking-tighter text-center leading-tight">
                • MONTAGEM E BALANCEAMENTO: <span className="text-[#15803d] font-black">GRÁTIS</span>
              </p>
              <p className="text-[26px] font-bold text-slate-800 uppercase tracking-tighter text-center leading-tight">
                • ALINHAMENTO (NA TROCA DE 4 PNEUS): <span className="text-[#15803d] font-black">GRÁTIS</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
