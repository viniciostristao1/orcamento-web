import React, { useState, useRef } from 'react';
import { PromoInfo } from './types';
import { parseInput } from './utils/parser';
import { Flyer } from './components/Flyer';
import { exportarPng } from '../utils/exportImage';

const DEFAULT_INPUT = `265/60R18	MARCA/MODELO	À PRAZO 10x	À VISTA (10%)	ESTOQUE
4265292105	Firestone	R$ 1.115,48	R$ 1.004,28	0
4265292105	Bridgestone Dueler HT	R$ 1.146,72	R$ 1.032,40	12
4265262205	Michelin SUV HT	R$ 1.488,20	R$ 1.339,73	5
4265262115	Michelin LTX Trail	R$ 1.488,56	R$ 1.340,05	16
4265262025	BF Goodrich	R$ 2.855,64	R$ 2.570,43	0
4265252005	Dunlop	R$ 1.383,02	R$ 1.245,07	0`;

const TireFlyerApp: React.FC = () => {
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [promoData, setPromoData] = useState<PromoInfo>(parseInput(DEFAULT_INPUT));
  const flyerRef = useRef<HTMLDivElement>(null);

  const handleProcess = () => {
    if (!inputText.trim()) {
      alert("Por favor, insira os dados dos pneus.");
      return;
    }
    const parsed = parseInput(inputText);
    setPromoData(parsed);
  };

  const handleClear = () => {
    if (window.confirm("Deseja realmente limpar todos os dados?")) {
      setInputText("");
      // Limpa também o flyer para feedback visual imediato
      setPromoData({ measure: "", tires: [] });
    }
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
    <div className="ui-compacta py-12 text-slate-200">
      <header className="mb-12 text-left flex items-center justify-between border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">
            DASHBOARD <span className="text-[#2ecc71]">TIRE FLYER</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Painel de Controle de Ofertas</p>
        </div>
        <div className="hidden md:flex gap-3">
           <div className="w-2 h-2 rounded-full bg-slate-800"></div>
           <div className="w-2 h-2 rounded-full bg-slate-800"></div>
           <div className="w-2 h-2 rounded-full bg-slate-800"></div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_auto] gap-10 items-start">
        {/* Seção de Entrada */}
        <div className="space-y-8">
          <div className="bg-[#161d2f] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-[#2ecc71] rounded-full"></span>
                Dados da Tabela
              </h2>
              <button 
                onClick={handleClear}
                className="px-6 py-2.5 rounded-2xl bg-[#0b1224] hover:bg-red-500/20 hover:text-red-400 border border-slate-800 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Limpar Texto
              </button>
            </div>
            
            <textarea
              className="w-full h-[500px] p-6 font-mono text-base border border-slate-800 rounded-3xl focus:ring-2 focus:ring-[#2ecc71]/30 focus:border-[#2ecc71] outline-none transition-all resize-none bg-[#0b1224] text-emerald-50 placeholder-slate-800 shadow-inner overflow-x-auto whitespace-pre"
              placeholder="Cole aqui a tabela de pneus..."
              value={inputText}
              wrap="off"
              onChange={(e) => setInputText(e.target.value)}
            />

            <button
              onClick={handleProcess}
              className="w-full mt-6 bg-[#2ecc71]/10 hover:bg-[#2ecc71]/20 text-[#2ecc71] border border-[#2ecc71]/30 font-black py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Processar e Atualizar Flyer
            </button>
          </div>

          <div className="p-6 bg-[#161d2f]/50 rounded-3xl border border-slate-800/50 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl">🛡️</div>
            <div>
              <h4 className="text-slate-300 font-black text-xs uppercase tracking-widest">Layout de Exportação Amplo</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase opacity-80">
                Ajustado para 750px de largura. Ideal para compartilhamento em grupos de WhatsApp com alta visibilidade.
              </p>
            </div>
          </div>
        </div>

        {/* Visualização do Flyer */}
        <div className="flex flex-col items-center">
          <div className="sticky top-24 flex flex-col items-center w-[750px]">
            <div className="relative group mb-8">
              <div className="absolute -inset-4 bg-[#2ecc71]/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
                <Flyer data={promoData} flyerRef={flyerRef} />
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-[#0b1224] font-black py-6 px-12 rounded-[2rem] shadow-2xl shadow-green-900/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 text-xl tracking-tight uppercase"
            >
              Confirmar e Baixar Imagem
            </button>
            
            <p className="mt-6 text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] opacity-40 italic text-center">
              Wide Pro Flyer v4.2 - Otimizado para 750px
            </p>
          </div>
        </div>
      </div>
      
      <footer className="mt-32 text-center text-slate-800 text-[9px] font-black uppercase tracking-[0.5em] border-t border-slate-900 pt-12">
        AutoCenter Cloud System &bull; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default TireFlyerApp;
