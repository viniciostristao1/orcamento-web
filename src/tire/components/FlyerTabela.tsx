import React from 'react';
import { PromoInfo } from '../types';
import { formatarPreco } from '../utils/parser';
import { getBrandStyle } from '../utils/marcas';

interface FlyerTabelaProps {
  data: PromoInfo;
}

/**
 * Layout "Tabela de ofertas" (ideia 4 aprovada): uma linha por pneu, com os
 * valores em colunas (10x / à vista / estoque). O mais compacto — cabe mais
 * pneu na folha.
 */
export const FlyerTabela: React.FC<FlyerTabelaProps> = ({ data }) => (
  <div className="p-5 bg-slate-50">
    <table className="w-full border-collapse bg-white">
      <thead>
        <tr>
          <th className="bg-slate-900 text-white text-[14px] font-black uppercase tracking-[0.06em] px-3.5 py-3 text-left">
            Pneu
          </th>
          <th className="bg-slate-900 text-white text-[14px] font-black uppercase tracking-[0.06em] px-3.5 py-3 text-center">
            Em até 10x
          </th>
          <th className="bg-slate-900 text-white text-[14px] font-black uppercase tracking-[0.06em] px-3.5 py-3 text-center">
            À vista 💰
          </th>
          <th className="bg-slate-900 text-white text-[14px] font-black uppercase tracking-[0.06em] px-3.5 py-3 text-center">
            Estoque
          </th>
        </tr>
      </thead>
      <tbody>
        {data.tires.map((tire, idx) => {
          const style = getBrandStyle(tire.brand);
          const ultima = idx === data.tires.length - 1;

          return (
            <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
              <td
                className={`px-3.5 py-3 text-[20px] font-black uppercase tracking-tight ${ultima ? '' : 'border-b-2 border-slate-100'}`}
                style={{ color: style.textColor }}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-[3px] mr-2 align-middle"
                  style={{ backgroundColor: style.sideBarColor }}
                />
                {tire.brand}
              </td>
              <td className={`px-3.5 py-3 text-center text-[17px] font-extrabold text-slate-600 tabular-nums whitespace-nowrap ${ultima ? '' : 'border-b-2 border-slate-100'}`}>
                {formatarPreco(tire.priceInstallment)}
              </td>
              <td className={`px-3.5 py-3 text-center text-[25px] font-black text-[#15803d] tabular-nums whitespace-nowrap ${ultima ? '' : 'border-b-2 border-slate-100'}`}>
                {formatarPreco(tire.priceCash)}
              </td>
              <td
                className={`px-3.5 py-3 text-center text-[14px] font-black uppercase ${tire.stock > 0 ? 'text-[#15803d]' : 'text-[#dc2626]'} ${ultima ? '' : 'border-b-2 border-slate-100'}`}
              >
                {tire.stock > 0 ? `${tire.stock} un` : 'Sob encomenda'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
