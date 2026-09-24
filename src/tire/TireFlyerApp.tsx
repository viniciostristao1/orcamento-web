import React, { useEffect, useState, useRef } from 'react';
import { PromoInfo } from './types';
import { parseInput } from './utils/parser';
import { Flyer } from './components/Flyer';
import { exportarPng } from '../utils/exportImage';
import NeonCard from '../components/NeonCard';
import ClearButton from '../components/ClearButton';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

const DEFAULT_INPUT = `265/60R18	MARCA/MODELO	À PRAZO 10x	À VISTA (10%)	ESTOQUE
4265292105	Firestone	R$ 1.115,48	R$ 1.004,28	0
4265292105	Bridgestone Dueler HT	R$ 1.146,72	R$ 1.032,40	12
4265262205	Michelin SUV HT	R$ 1.488,20	R$ 1.339,73	5
4265262115	Michelin LTX Trail	R$ 1.488,56	R$ 1.340,05	16
4265262025	BF Goodrich	R$ 2.855,64	R$ 2.570,43	0
4265252005	Dunlop	R$ 1.383,02	R$ 1.245,07	0`;

const ESCALA_PREVIEW = 0.5;

const TireFlyerApp: React.FC = () => {
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [promoData, setPromoData] = useState<PromoInfo>(parseInput(DEFAULT_INPUT));
  const [alturaFlyer, setAlturaFlyer] = useState(0);
  const flyerRef = useRef<HTMLDivElement>(null);

  // Mede a altura real do flyer para o container do preview (reduzido pela
  // metade). Usa transform (não zoom): o zoom aninhado arredondava o
  // clientHeight e mudava 2px no PNG; transform não afeta a captura.
  useEffect(() => {
    const el = flyerRef.current;
    if (!el) return;
    const medir = () => setAlturaFlyer(el.offsetHeight);
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(medir);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleProcess = () => {
    if (!inputText.trim()) {
      alert("Por favor, insira os dados dos pneus.");
      return;
    }
    const parsed = parseInput(inputText);
    setPromoData(parsed);
  };

  // Igual à aba de orçamentos: limpa só o texto; o flyer só muda no
  // "Processar e Atualizar Flyer" (não perde o último preview por engano).
  const handleClear = () => {
    setInputText("");
  };

  const handleDownload = async () => {
    if (flyerRef.current) {
      try {
        const dataUrl = await exportarPng(flyerRef.current, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
        const link = document.createElement('a');
        link.download = `Promocao-${promoData.measure.replace(/\//g, '-') || 'Pneus'}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        alert('Erro ao gerar imagem. Tente novamente.');
      }
    }
  };

  return (
    <div className="ui-compacta pt-1 pb-12 text-slate-200">
      {/* Conteúdo mais estreito e centralizado: margens laterais no painel
          "DADOS DA TABELA" e no flyer (a largura útil cai ~pela metade). */}
      <div className="max-w-[1150px] mx-auto">
      <header className="mb-8 text-left border-b border-slate-800 pb-6">
        <h1 className="titulo-tema text-4xl font-black tracking-tighter uppercase mb-1">
          DASHBOARD <span className="text-blue-500">TIRE FLYER</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Painel de Controle de Ofertas</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-start">
        {/* Seção de Entrada */}
        <div className="space-y-8">
          <NeonCard
            title="DADOS DA TABELA"
            borderColor="blue-600"
            actions={<ClearButton onClick={handleClear} label="Limpar Texto" />}
          >
            <textarea
              className="campo-tema w-full h-[250px] p-6 font-mono text-base border border-slate-800 rounded-2xl focus:border-blue-500 outline-none transition-colors resize-none text-emerald-50 placeholder-slate-700 overflow-x-auto whitespace-pre scrollbar-hide"
              placeholder="Cole aqui a tabela de pneus..."
              value={inputText}
              wrap="off"
              onChange={(e) => setInputText(e.target.value)}
            />

            <button
              onClick={handleProcess}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] active:scale-[0.98] text-lg"
            >
              <Sparkles size={22} /> Processar e Atualizar Flyer
            </button>
          </NeonCard>

          <NeonCard title="LAYOUT DE EXPORTAÇÃO" borderColor="blue-500" compact>
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase">
              Ajustado para 750px de largura. Ideal para compartilhamento em grupos de WhatsApp com alta visibilidade.
            </p>
          </NeonCard>
        </div>

        {/* Visualização do Flyer */}
        <div className="flex flex-col items-center">
          <div className="sticky top-24 flex flex-col items-center w-[375px]">
            {/* Preview na metade do tamanho — só o visual. O PNG continua 750px
                (a captura usa o tamanho do nó; transform não interfere). */}
            <div
              className="relative group mb-8 w-[375px]"
              style={alturaFlyer ? { height: alturaFlyer * ESCALA_PREVIEW } : undefined}
            >
              <div style={{ transform: `scale(${ESCALA_PREVIEW})`, transformOrigin: 'top left', width: 750 }}>
                <div className="absolute -inset-4 bg-blue-600/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-2xl">
                  <Flyer data={promoData} flyerRef={flyerRef} />
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] active:scale-[0.98] text-lg"
            >
              <ImageIcon size={22} /> Confirmar e Baixar Imagem
            </button>

            <p className="mt-6 text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] text-center">
              Wide Pro Flyer v4.2 - Otimizado para 750px
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-32 text-center text-slate-700 text-[9px] font-black uppercase tracking-[0.5em] border-t border-slate-800 pt-12">
        AutoCenter Cloud System &bull; {new Date().getFullYear()}
      </footer>
      </div>
    </div>
  );
};

export default TireFlyerApp;
