import React from 'react';
import { Gauge, Wrench, CreditCard } from 'lucide-react';
import { PromoInfo, TireData } from '../types';
import { formatarPreco } from '../utils/parser';
import { separarMarcaModelo, logoDaMarca, type MarcaPresente } from '../utils/marcas';
import fotoLoja from '../assets/loja.jpeg';
import logoMichelin from '../assets/marcas/michelin.png';
import logoBridgestone from '../assets/marcas/bridgestone.png';
import logoPirelli from '../assets/marcas/pirelli.png';
import logoYokohama from '../assets/marcas/yokohama.png';
import logoDunlop from '../assets/marcas/dunlop.png';
import logoBfGoodrich from '../assets/marcas/bfgoodrich.png';
import logoFirestone from '../assets/marcas/firestone.png';
import logoGoodyear from '../assets/marcas/goodyear.png';

interface FlyerVitrineProps {
  data: PromoInfo;
}

/**
 * Faixa FIXA de marcas no topo (v0.145.0): sempre as 6 marcas de pneus que a
 * loja trabalha, na ordem pedida — independente do que está na tabela.
 */
const MARCAS_TOPO: { id: string; nome: string; src: string }[] = [
  { id: 'MICHELIN', nome: 'Michelin', src: logoMichelin },
  { id: 'BFGOODRICH', nome: 'BFGoodrich', src: logoBfGoodrich },
  { id: 'BRIDGESTONE', nome: 'Bridgestone', src: logoBridgestone },
  { id: 'PIRELLI', nome: 'Pirelli', src: logoPirelli },
  { id: 'YOKOHAMA', nome: 'Yokohama', src: logoYokohama },
  { id: 'DUNLOP', nome: 'Dunlop', src: logoDunlop },
];

/** Logos oficiais embutidos (PNG no repo) — marca desconhecida cai no texto. */
const LOGOS_MARCA: Record<string, string> = {
  MICHELIN: logoMichelin,
  BRIDGESTONE: logoBridgestone,
  PIRELLI: logoPirelli,
  YOKOHAMA: logoYokohama,
  DUNLOP: logoDunlop,
  BFGOODRICH: logoBfGoodrich,
  FIRESTONE: logoFirestone,
  GOODYEAR: logoGoodyear,
};

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

/** "Logo" de texto (fallback p/ marca sem arquivo) com as cores do fabricante. */
const LogoTexto: React.FC<{ marca: MarcaPresente }> = ({ marca }) => {
  const logo = logoDaMarca(marca.id);
  return (
    <span
      className={`inline-block font-black uppercase leading-none text-[17px] px-2.5 py-[5px] ${
        logo.italico ? 'italic' : ''
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
  );
};

/** Selo da marca na linha: logo oficial quando existe; texto estilizado senão. */
const MarcaBadge: React.FC<{ marca: MarcaPresente }> = ({ marca }) => {
  const src = LOGOS_MARCA[marca.id];
  if (!src) return <LogoTexto marca={marca} />;
  return (
    <img
      src={src}
      alt={marca.rotulo}
      className="max-w-[174px] max-h-[52px] object-contain"
      draggable={false}
    />
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
  return (
    <div className="relative flex items-stretch bg-[#eef2f8] rounded-2xl overflow-hidden">
      <div className="w-[92px] shrink-0 flex items-center justify-center bg-[#e3e9f2]">
        <PneuIcone className="w-[74px] h-[74px]" />
      </div>

      <div className="w-[194px] shrink-0 flex flex-col items-center justify-center px-2 py-2">
        {marca ? (
          <MarcaBadge marca={marca} />
        ) : (
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
            Em até 10x <span className="text-slate-400">no cartão</span>
          </p>
          <PrecoGrande valor={tire.priceInstallment} cor="#0f1b2d" />
        </div>
        <div className="text-center px-1">
          <p className="text-[12px] font-black uppercase text-slate-600 leading-none mb-[3px]">
            À vista
          </p>
          <PrecoGrande valor={tire.priceCash} cor="#0f1b2d" />
        </div>
      </div>

      {/* Espaçador FIXO do selo "Sob encomenda": fica em TODAS as linhas (não só
          nas sem estoque) para a divisória 10x/à vista cair sempre no MESMO x —
          e o preço nunca fica embaixo da faixa vertical. */}
      <div className="w-[26px] shrink-0" aria-hidden="true" />

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
  <div className="flex items-center gap-3.5 px-4 py-[22px]">
    <Icone size={42} className="text-white shrink-0" strokeWidth={1.7} />
    <div className="min-w-0">
      <p className="text-white text-[16.5px] font-black uppercase leading-tight border-b-[3px] border-[#e11d2e] inline-block pb-[2px]">
        {titulo}
      </p>
      <p className="text-white/80 text-[14.5px] font-semibold uppercase leading-tight mt-[5px]">{texto}</p>
    </div>
  </div>
);

/**
 * Layout "Vitrine da loja" (v0.141.0): foto da loja no topo, banner
 * "TABELA DE OFERTAS + MEDIDA" e uma linha por pneu com o logo OFICIAL da marca
 * (texto estilizado só quando não há arquivo), 10x com o valor integral e à
 * vista. Desde a v0.145.0 o topo da foto leva as 6 marcas fixas (Michelin,
 * BFGoodrich, Bridgestone, Pirelli, Yokohama e Dunlop) numa linha só, bem
 * pequenas e com fundo transparente — a loja aparece atrás.
 */
export const FlyerVitrine: React.FC<FlyerVitrineProps> = ({ data }) => {
  return (
    <>
      {/* Foto da loja (fundo da parte superior). */}
      <div className="relative h-[215px] bg-slate-300 overflow-hidden">
        <img
          src={fotoLoja}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: 'center 58%' }}
        />
        {/* Faixa de marcas colada no topo, direto sobre a foto: linha única,
            bem pequena e SEM fundo (transparente — a loja aparece atrás).
            O realce BRANCO (drop-shadow) é só um contorno: sem ele, logo de
            letra escura (Michelin azul) some em cima do totem escuro da foto. */}
        <div
          data-faixa-marcas
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-[8px]"
        >
          {MARCAS_TOPO.map((m) => (
            <img
              key={m.id}
              src={m.src}
              alt={m.nome}
              data-logo-topo={m.id}
              draggable={false}
              className="h-[15px] w-auto object-contain"
              style={{
                filter:
                  'drop-shadow(0 0 1.5px rgba(255,255,255,.95)) drop-shadow(0 0 3px rgba(255,255,255,.55))',
              }}
            />
          ))}
        </div>
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
      <div data-linhas-pneu className="bg-white px-4 py-3.5 space-y-3">
        {data.tires.map((tire, idx) => (
          <LinhaPneu key={idx} tire={tire} />
        ))}
      </div>

      {/* Rodapé de serviços — fonte grande p/ leitura no WhatsApp. */}
      <div className="bg-[#0d1626] grid grid-cols-3 divide-x divide-white/15">
        <Beneficio Icone={Gauge} titulo="Alinhamento cortesia" texto="na troca de 4 pneus" />
        <Beneficio Icone={Wrench} titulo="Montagem e" texto="balanceamento cortesia" />
        <Beneficio Icone={CreditCard} titulo="Parcelamos em" texto="até 10x" />
      </div>
      <div className="h-[6px] bg-[#e11d2e]" />
    </>
  );
};
