import React from 'react';
import { PromoInfo } from '../types';
import { formatarPreco } from '../utils/parser';
import { getBrandStyle } from '../utils/marcas';

interface FlyerEtiquetaProps {
  data: PromoInfo;
}

/**
 * Layout "Etiqueta de preço" (ideia 7 aprovada): cada pneu vira uma etiqueta
 * de loja (com furo), à vista em destaque e o 10x numa plaquinha escura.
 */
export const FlyerEtiqueta: React.FC<FlyerEtiquetaProps> = ({ data }) => (
  <div className="p-5 bg-slate-50 flex flex-col gap-3.5">
    {data.tires.map((tire, idx) => {
      const style = getBrandStyle(tire.brand);

      return (
        <div
          key={idx}
          className="relative flex items-center gap-4 bg-white border-2 border-dashed border-slate-300 rounded-3xl py-3.5 pl-12 pr-[22px]"
        >
          {/* Furo da etiqueta */}
          <span className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-slate-50 border-2 border-slate-300" />

          <div className="flex-1 min-w-0">
            <div
              className="text-[25px] font-black italic uppercase tracking-tight leading-tight"
              style={{ color: style.textColor }}
            >
              {tire.brand}
            </div>
            <div className={`mt-1 text-[13px] font-black uppercase tracking-wide ${tire.stock > 0 ? 'text-[#15803d]' : 'text-[#dc2626]'}`}>
              {tire.stock > 0 ? `Estoque: ${tire.stock} un` : 'Sob encomenda'}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline justify-end text-[44px] font-black text-[#15803d] tracking-tighter leading-none tabular-nums">
              <span className="text-[19px] mr-0.5">R$</span>
              <span>{formatarPreco(tire.priceCash).replace('R$', '').trim().split(',')[0]}</span>
              <span className="text-[22px]">,{formatarPreco(tire.priceCash).split(',')[1]}</span>
            </div>
            <div className="text-[11px] font-black tracking-[0.2em] uppercase text-[#15803d]">
              à vista a unidade
            </div>
          </div>

          <div className="flex-none bg-slate-900 text-white rounded-2xl px-3.5 py-2.5 text-center">
            <div className="text-[10px] tracking-[0.14em] font-black text-slate-400 uppercase">ou em até</div>
            <div className="text-[19px] font-black text-[#2ecc71] whitespace-nowrap">
              10x {formatarPreco(tire.priceInstallment)}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
