import React from 'react';
import { Gauge, Wrench, CreditCard } from 'lucide-react';
import { PromoInfo, TireData } from '../types';
import { formatarPreco } from '../utils/parser';
import { separarMarcaModelo, logoDaMarca, type MarcaPresente } from '../utils/marcas';
import fotoLoja from '../assets/loja.jpeg';
import pneuRegular from '../assets/pneu.png';
import pneuOffroad from '../assets/pneu-offroad.png';
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

/**
 * Preço grande do layout (R$ pequeno, reais gigantes, centavos médios).
 * Desde a v0.150.0 o número do PIX/DINHEIRO/DÉBITO é um pouco MAIOR que o do
 * 10x (43px contra 40px; R$ e centavos iguais nos dois: 17/20) e o tracking é
 * `tighter` — os dígitos ficam mais densos, o que abre espaço para os valores
 * serem bem maiores sem invadir o selo "Sob encomenda".
 */
const PrecoGrande: React.FC<{ valor: number; cor: string; maior?: boolean }> = ({
  valor,
  cor,
  maior,
}) => {
  const [reais, cents] = separarPreco(valor);
  return (
    <p
      data-preco={maior ? 'vista' : '10x'}
      className="font-black leading-none tracking-tighter whitespace-nowrap"
      style={{ color: cor }}
    >
      <span className="text-[17px] align-top mr-[3px]">R$</span>
      <span className={maior ? 'text-[43px]' : 'text-[40px]'}>{reais}</span>
      <span className="text-[20px]">,{cents}</span>
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
      className="max-w-[226px] max-h-[66px] object-contain"
      draggable={false}
    />
  );
};

/**
 * Foto realista do pneu (v0.147.0): recorte do flyer de referência do usuário,
 * fundo transparente e embutida no build. O BFGoodrich usa a banda off-road,
 * como no flyer original; as demais marcas (e desconhecidas) a linha de estrada.
 */
const FotoPneu: React.FC<{ marcaId?: string }> = ({ marcaId }) => {
  const offroad = marcaId === 'BFGOODRICH';
  return (
    <img
      src={offroad ? pneuOffroad : pneuRegular}
      alt=""
      data-pneu={offroad ? 'bfgoodrich' : 'regular'}
      draggable={false}
      className="h-[76px] w-auto object-contain"
    />
  );
};

/**
 * Tarja-título das colunas (v0.148.0, estilo "02"): aparece UMA vez, logo
 * abaixo da MEDIDA e acima dos primeiros valores — como cabeçalho da coluna
 * do 10x (vermelha) e do PIX/DINHEIRO/DÉBITO (verde). Fica colada na tarja
 * azul em cima e na 1ª linha embaixo (sem espaço branco) e alinhada com as
 * colunas de preço: começa depois do pneu (92) + marca (232) e tem a largura
 * da área dos preços (750 - 2 de borda - 32 de padding - 92 - 232 - 26 do
 * espaçador = 366). O corte diagonal no meio encaixa o vermelho no verde.
 */
const TituloColunas: React.FC = () => (
  <div data-titulo-colunas className="flex h-[26px] shrink-0" style={{ marginLeft: 324, width: 366 }}>
    <div
      className="flex-1 flex items-center justify-center bg-[#ea1d2c] text-white font-black uppercase text-[13px] whitespace-nowrap"
      style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
    >
      Em até 10x no cartão
    </div>
    <div
      className="flex-1 flex items-center justify-center bg-[#16a34a] text-white font-black uppercase text-[13px] whitespace-nowrap"
      style={{ clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)' }}
    >
      Pix / Dinheiro / Débito
    </div>
  </div>
);

const LinhaPneu: React.FC<{ tire: TireData }> = ({ tire }) => {
  const { marca, modelo } = separarMarcaModelo(tire.brand);
  return (
    <div className="relative flex items-stretch bg-[#eef2f8] rounded-2xl overflow-hidden">
      <div className="w-[92px] shrink-0 flex items-center justify-center bg-[#e3e9f2]">
        <FotoPneu marcaId={marca?.id} />
      </div>

      {/* Sem padding lateral (v0.150.0): os logos ganham a largura toda da
          coluna — maiores, sem tirar espaço dos valores. */}
      <div className="w-[232px] shrink-0 flex flex-col items-center justify-center py-2">
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

      {/* Só os valores na linha (v0.148.0): as tarjas que explicam 10x e
          PIX/DINHEIRO/DÉBITO ficam uma vez só, como título das colunas.
          Sem px nas células (v0.149.0): o preço à vista (39px) precisa da
          largura toda para não invadir o selo "Sob encomenda". */}
      <div className="flex-1 grid grid-cols-2 items-center">
        <div className="text-center border-r border-[#c9d2dd]">
          <PrecoGrande valor={tire.priceInstallment} cor="#0f1b2d" />
        </div>
        <div className="text-center">
          <PrecoGrande valor={tire.priceCash} cor="#0f1b2d" maior />
        </div>
      </div>

      {/* Espaçador FIXO do selo "Sob encomenda": fica em TODAS as linhas (não só
          nas sem estoque) para a divisória 10x/à vista cair sempre no MESMO x —
          e o preço nunca fica embaixo da faixa vertical. */}
      <div className="w-[26px] shrink-0" aria-hidden="true" />

      {tire.stock <= 0 && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-180 [writing-mode:vertical-rl] text-center h-[76px] bg-[#e11d2e] text-white rounded-l-[3px] px-[2px] py-1 text-[7.5px] leading-[1.2] font-black uppercase tracking-[0.06em]">
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
 * BFGoodrich, Bridgestone, Pirelli, Yokohama e Dunlop) numa linha só, pequenas
 * e com fundo transparente — a loja aparece atrás (20px desde a v0.146.0).
 * O pneu da linha é FOTO realista (v0.147.0), recorte do flyer de referência.
 * Desde a v0.148.0 as tarjas "EM ATÉ 10X NO CARTÃO" (vermelha) e
 * "PIX/DINHEIRO/DÉBITO" (verde) viraram TÍTULO das colunas — uma vez só,
 * abaixo da MEDIDA e acima dos primeiros valores — e as linhas ficam só com
 * os valores. Na v0.149.0 os valores cresceram de novo (10x 37px, PIX/à
 * vista 39px — um pouco MAIOR que o 10x) e os logos das marcas foram para
 * 205px de largura (coluna da marca em 224px). O selo "Sob encomenda" ficou
 * mais fino (7,5px, dentro do espaçador de 26px, colado na borda) para não
 * cobrir o dígito final do preço à vista, que é mais largo.
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
              className="h-[20px] w-auto object-contain"
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

      {/* Tarja-título das colunas (colada na tarja azul) + uma linha por pneu */}
      <div className="bg-white px-4 pb-3.5">
        <TituloColunas />
        <div data-linhas-pneu className="space-y-3">
          {data.tires.map((tire, idx) => (
            <LinhaPneu key={idx} tire={tire} />
          ))}
        </div>
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
