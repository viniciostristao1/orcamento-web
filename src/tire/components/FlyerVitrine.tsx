import React from 'react';
import { Gauge, Wrench, CreditCard } from 'lucide-react';
import { PromoInfo, TireData } from '../types';
import { formatarPreco } from '../utils/parser';
import { marcasPresentes, separarMarcaModelo, logoDaMarca, type MarcaPresente } from '../utils/marcas';
import fotoLoja from '../assets/loja.jpeg';

interface FlyerVitrineProps {
  data: PromoInfo;
}

/** "R$ 1.115,48" → reais "1.115" + centavos "48" (para o preço grande). */
const separarPreco = (valor: number): [string, string] => {
  const limpo = formatarPreco(valor).replace(/[^\d.,]/g, '');
  const [reais = '0', cents = '00'] = limpo.split(',');
  return [reais, cents];
};

/** Preço grande do layout (R$ pequeno, reais gigantes, centavos médios). */
const PrecoGrande: React.FC<{ valor: number; cor: string }> = ({ valor, cor }) => {
  const [reais, cents] = separarPreco(valor);
  return (
    <p className="font-black leading-none tracking-tight whitespace-nowrap" style={{ color: cor }}>
      <span className="text-[15px] align-top mr-[3px]">R$</span>
      <span className="text-[31px]">{reais}</span>
      <span className="text-[17px]">,{cents}</span>
    </p>
  );
};

/** "Logo" da marca (texto estilizado com as cores de cada fabricante). */
const LogoBadge: React.FC<{ marca: MarcaPresente; compacto?: boolean }> = ({ marca, compacto }) => {
  const logo = logoDaMarca(marca.id);
  return (
    <span className="inline-flex flex-col items-center">
      <span
        className={`inline-block font-black uppercase leading-none ${
          logo.italico ? 'italic' : ''
        } ${compacto ? 'text-[17px] px-2.5 py-[5px]' : 'text-[14px] px-2 py-[4px]'} ${
          marca.id === 'BFGOODRICH' ? 'tracking-tight' : 'tracking-[0.02em]'
        }`}
        style={{
          background: logo.bg,
          color: logo.fg,
          border: '1px solid #e2e8f0',
          borderRadius: 5,
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        {marca.rotulo}
      </span>
      {logo.underline && (
        <span className="block h-[3px] w-full -mt-[1px]" style={{ background: logo.underline }} />
      )}
    </span>
  );
};

/** Desenho de pneu (SVG) que preenche a foto de cada linha. */
const PneuIcone: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
    <circle cx="40" cy="40" r="38" fill="#1c2634" />
    <circle cx="40" cy="40" r="38" fill="none" stroke="#0e1520" strokeWidth="2" />
    <g stroke="#3d4856" strokeWidth="4" strokeLinecap="round">
      {Array.from({ length: 20 }).map((_, i) => {
        const a = (i / 20) * Math.PI * 2;
        const x1 = 40 + Math.cos(a) * 32.5;
        const y1 = 40 + Math.sin(a) * 32.5;
        const x2 = 40 + Math.cos(a) * 37;
        const y2 = 40 + Math.sin(a) * 37;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </g>
    <circle cx="40" cy="40" r="24.5" fill="#c9d2dd" />
    <circle cx="40" cy="40" r="24.5" fill="none" stroke="#93a0ae" strokeWidth="2" />
    <g fill="#eef2f7" stroke="#9aa6b4" strokeWidth="1.4">
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const cx = 40 + Math.cos(a) * 13.5;
        const cy = 40 + Math.sin(a) * 13.5;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx="6"
            ry="9.5"
            transform={`rotate(${(i * 360) / 5} ${cx} ${cy})`}
          />
        );
      })}
    </g>
    <circle cx="40" cy="40" r="6" fill="#6b7684" />
    <circle cx="40" cy="40" r="3" fill="#2b323c" />
  </svg>
);

const LinhaPneu: React.FC<{ tire: TireData }> = ({ tire }) => {
  const { marca, modelo } = separarMarcaModelo(tire.brand);
  const parcela = tire.priceInstallment / 10;
  return (
    <div className="relative flex items-stretch bg-[#eef2f8] rounded-2xl overflow-hidden">
      <div className="w-[92px] shrink-0 flex items-center justify-center bg-[#e3e9f2]">
        <PneuIcone className="w-[74px] h-[74px]" />
      </div>

      <div className="w-[186px] shrink-0 flex flex-col items-center justify-center px-2 py-2">
        {marca ? <LogoBadge marca={marca} compacto /> : (
          <span className="text-[15px] font-black text-slate-600">{tire.brand}</span>
        )}
        {modelo && (
          <span className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 text-center leading-tight">
            {modelo}
          </span>
        )}
      </div>

      <div className="flex-1 grid grid-cols-2 items-center">
        <div className="text-center border-r border-[#c9d2dd] px-1">
          <p className="text-[12px] font-black uppercase text-slate-600 leading-none mb-[3px]">
            10x <span className="text-slate-400">no cartão</span>
          </p>
          <PrecoGrande valor={parcela} cor="#0f1b2d" />
        </div>
        <div className="text-center px-1">
          <p className="text-[12px] font-black uppercase text-slate-600 leading-none mb-[3px]">
            À vista
          </p>
          <PrecoGrande valor={tire.priceCash} cor="#0f1b2d" />
        </div>
      </div>

      {/* Espaçador do selo "Sob encomenda": garante que o preço NUNCA fica
          embaixo da faixa vertical, em qualquer fonte. */}
      {tire.stock <= 0 && <div className="w-[26px] shrink-0" aria-hidden="true" />}

      {tire.stock <= 0 && (
        <div className="absolute right-[4px] top-1/2 -translate-y-1/2 rotate-180 [writing-mode:vertical-rl] bg-[#e11d2e] text-white rounded-[3px] px-[3px] py-2 text-[9.5px] font-black uppercase tracking-[0.16em]">
          Sob encomenda
        </div>
      )}
    </div>
  );
};

const Beneficio: React.FC<{ Icone: typeof Gauge; titulo: string; texto: string }> = ({
  Icone,
  titulo,
  texto,
}) => (
  <div className="flex items-center gap-3 px-4 py-4">
    <Icone size={30} className="text-white shrink-0" strokeWidth={1.7} />
    <div className="min-w-0">
      <p className="text-white text-[12.5px] font-black uppercase leading-tight border-b-2 border-[#e11d2e] inline-block pb-[1px]">
        {titulo}
      </p>
      <p className="text-white/75 text-[11px] font-semibold uppercase leading-tight mt-[3px]">{texto}</p>
    </div>
  </div>
);

/**
 * Layout "Vitrine da loja" (v0.141.0): foto da loja no topo, faixa com os logos
 * SÓ das marcas presentes na tabela (sem Dunlop quando não há Dunlop), banner
 * "TABELA DE OFERTAS + MEDIDA" e uma linha por pneu com 10x e à vista.
 */
export const FlyerVitrine: React.FC<FlyerVitrineProps> = ({ data }) => {
  const marcas = marcasPresentes(data.tires.map((t) => t.brand));

  return (
    <>
      {/* Faixa de logos — só as marcas que existem na tabela. */}
      {marcas.length > 0 && (
        <div className="bg-white px-5 pt-3.5 pb-3 flex items-center justify-center gap-3 flex-wrap border-b border-slate-200">
          {marcas.map((m) => (
            <LogoBadge key={m.id} marca={m} />
          ))}
        </div>
      )}

      {/* Foto da loja (fundo da parte superior). */}
      <div className="relative h-[215px] bg-slate-300 overflow-hidden">
        <img
          src={fotoLoja}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center 58%' }}
        />
      </div>

      {/* Banner TABELA DE OFERTAS / MEDIDA */}
      <div className="relative bg-[#0d1626] h-[96px] flex items-center overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[74px] overflow-hidden">
          <div className="absolute w-[16px] h-[180%] bg-[#e11d2e] left-[10px] top-[-40%] rotate-[18deg]" />
          <div className="absolute w-[16px] h-[180%] bg-[#e11d2e] left-[38px] top-[-40%] rotate-[18deg]" />
        </div>
        <div className="pl-[92px] pr-2">
          <p className="text-white font-black italic leading-[0.9] text-[33px] tracking-tight">
            TABELA DE
            <br />
            OFERTAS
          </p>
        </div>
        <div className="flex-1 flex items-center justify-end gap-4 pr-6">
          <div className="w-[4px] h-[56px] bg-[#e11d2e] rotate-[14deg] rounded-full" />
          <div className="text-right">
            <p className="text-[#e11d2e] font-black uppercase italic tracking-[0.25em] text-[12px]">
              Medida
            </p>
            <p className="text-white font-black italic text-[37px] leading-none tracking-tight">
              {data.measure || 'PROMOÇÃO'}
            </p>
          </div>
        </div>
      </div>

      {/* Uma linha por pneu */}
      <div className="bg-white px-4 py-3.5 space-y-3">
        {data.tires.map((tire, idx) => (
          <LinhaPneu key={idx} tire={tire} />
        ))}
      </div>

      {/* Rodapé de serviços */}
      <div className="bg-[#0d1626] grid grid-cols-3 divide-x divide-white/15">
        <Beneficio Icone={Gauge} titulo="Alinhamento cortesia" texto="na troca de 4 pneus" />
        <Beneficio Icone={Wrench} titulo="Montagem e" texto="balanceamento cortesia" />
        <Beneficio Icone={CreditCard} titulo="Parcelamos em" texto="até 10x" />
      </div>
      <div className="h-[6px] bg-[#e11d2e]" />
    </>
  );
};
