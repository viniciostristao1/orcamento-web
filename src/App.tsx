import React, { useState } from 'react';
import { processQuote, formatCurrency, parseBrazilianNumber } from './utils/quoteLogic';
import { QuoteSummary } from './types';
import NeonCard from './components/NeonCard';
import QuoteTable from './components/QuoteTable';
import { Calculator, Trash2, Car, Sparkles, Percent, X, History } from 'lucide-react';
import HistoryModal from './components/HistoryModal';
import { adicionarAoHistorico, retratoDoResumo, type OrcamentoSalvo } from './utils/historico';

const ClearButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
    type="button"
    className="relative z-50 flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-red-600 text-slate-200 rounded-xl transition-all text-xs font-black uppercase border border-slate-700 cursor-pointer active:scale-95"
  >
    <Trash2 size={16} /> Limpar
  </button>
);

const App: React.FC = () => {
  const [descReparo, setDescReparo] = useState<string>(`01 TR PASTILHAS DE FREIO DIANT + RETIFICA DOS DISCOS\n02 OXI\n03 TR BORRACHA DAS PALHETAS`);
  const [orcamentoRaw, setOrcamentoRaw] = useState<string>(`1 Serviço GUN126L473025 DISCO DIANTEIRO UM LADO NO VEICULO 1,20000 514,800000 514,80\n1 Peça 142142GC133 *GRAXA COBREADA ALTA TEMPERATURA 1 36,640000 36,64\n1 Peça CARE040201 LIMPADOR PREMIUM UNIVERSAL 1 156,600000 156,60\n1 Peça 044650K401 JOGO PASTILHAS FREIO DIANT.HILUX AP.2016 1 1.245,000000 1.245,00\n3 Serviço GUN126L850091 BORRACHA DO LIMPADOR DIANTEIRO AMBOS OS 0,10000 42,900000 42,90\n3 Peça CARE044907 CAR CONJUNTO VISIB. DO PARABRISA, H20 PARA VEICULOS1 27,100000 27,10\n3 Peça 8521428090 BORRACHA LIMPADOR DI 1 65,000000 65,00\n3 Peça 8521453080 BORRACHA LIMPADOR PA 1 82,000000 82,00\n2 Serviço HIGMOTO HIGIENIZACAO AR CONDICIONADO 0,05000 0,000000 0,00\n2 Peça CARE040703 AUTO AIR CLEANER (GRANADA) 1 110,600000 110,60\n2 Peça CARE010701 OXY-SANITIZATION APP 1 99,000000 99,00\n1 Serviço RETDISCD1 RETIFICA DISCO FREIO DIANTEIRO 1,00000 250,000000 250,00`);
  const [ajustesManuais, setAjustesManuais] = useState<string>("");
  const [revAprovada, setRevAprovada] = useState<number>(1766.23);
  const [revPecas, setRevPecas] = useState<number>(1000.00);
  const [desconto, setDesconto] = useState<number>(5);
  const [parcelas, setParcelas] = useState<number>(3);
  const [placa, setPlaca] = useState<string>("");
  const [summary, setSummary] = useState<QuoteSummary | null>(null);
  const [historicoAberto, setHistoricoAberto] = useState(false);

  // Estados locais para os inputs de texto para permitir digitação livre (como vírgulas e pontos)
  const [revAprovadaInput, setRevAprovadaInput] = useState<string>("1766,23");
  const [revPecasInput, setRevPecasInput] = useState<string>("1000,00");

  const handleGenerate = () => {
    if (!descReparo.trim() || !orcamentoRaw.trim()) return;
    const finalRevAprovada = parseBrazilianNumber(revAprovadaInput);
    const finalRevPecas = parseBrazilianNumber(revPecasInput);
    
    const result = processQuote(descReparo, orcamentoRaw, finalRevAprovada, finalRevPecas, desconto, parcelas, ajustesManuais);
    setSummary(result);

    // Histórico local (localStorage): salva a cada "Processar Tudo".
    adicionarAoHistorico({
      descReparo,
      orcamentoRaw,
      ajustesManuais,
      revAprovadaInput,
      revPecasInput,
      desconto,
      parcelas,
      placa: placa.trim(),
      ...retratoDoResumo(result),
    });
    
    // Atualiza os estados numéricos para consistência
    setRevAprovada(finalRevAprovada);
    setRevPecas(finalRevPecas);
    
    setTimeout(() => { document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150);
  };

  // Reabre um orçamento do histórico na tela (recalcula a partir dos textos).
  const abrirDoHistorico = (r: OrcamentoSalvo) => {
    setDescReparo(r.descReparo);
    setOrcamentoRaw(r.orcamentoRaw);
    setAjustesManuais(r.ajustesManuais);
    setRevAprovadaInput(r.revAprovadaInput);
    setRevPecasInput(r.revPecasInput);
    setDesconto(r.desconto);
    setParcelas(r.parcelas);
    setPlaca(r.placa ?? '');
    setHistoricoAberto(false);
    const finalRevAprovada = parseBrazilianNumber(r.revAprovadaInput);
    const finalRevPecas = parseBrazilianNumber(r.revPecasInput);
    setSummary(processQuote(r.descReparo, r.orcamentoRaw, finalRevAprovada, finalRevPecas, r.desconto, r.parcelas, r.ajustesManuais));
    setTimeout(() => { document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-32">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-[100] print:hidden">
        <div className="max-w-[1400px] mx-auto px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Car className="text-blue-500" size={32} />
            <h1 className="text-2xl font-black tracking-tighter uppercase">Toyota Weiand <span className="text-blue-500 font-black">Lajeado</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 border-l border-slate-800 pl-6 h-8 flex items-center">Gestão de Vendas</span>
            <button
              type="button"
              onClick={() => setHistoricoAberto(true)}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all text-xs font-black uppercase border border-slate-700 cursor-pointer active:scale-95"
            >
              <History size={16} /> Histórico
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-10 pt-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 print:hidden">
          <div className="xl:col-span-8 space-y-10">
            <NeonCard title="1. Descrição do Reparo" borderColor="blue-500" actions={<ClearButton onClick={() => setDescReparo('')}/>}>
              <textarea 
                className="w-full h-56 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xl font-medium focus:border-blue-500 outline-none resize-none transition-colors" 
                value={descReparo} 
                onChange={(e) => setDescReparo(e.target.value)} 
              />
            </NeonCard>
            
            <NeonCard title="2. DADOS DO ORÇAMENTO" borderColor="blue-600" actions={<ClearButton onClick={() => setOrcamentoRaw('')}/>}>
              <textarea 
                className="w-full h-96 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-lg font-mono leading-relaxed focus:border-blue-600 outline-none resize-none overflow-x-auto whitespace-pre scrollbar-hide" 
                value={orcamentoRaw} 
                onChange={(e) => setOrcamentoRaw(e.target.value)} 
                wrap="off" 
              />
            </NeonCard>
            
            <NeonCard title="3. Ajustes Manuais (ID VALOR)" borderColor="#f59e0b">
              <textarea 
                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-amber-500 font-mono text-lg focus:border-amber-500 outline-none resize-none" 
                placeholder="Ex: 1 50,00" 
                value={ajustesManuais} 
                onChange={(e) => setAjustesManuais(e.target.value)} 
              />
            </NeonCard>
          </div>

          <div className="xl:col-span-4 space-y-8">
            <NeonCard title="APROVADO E DESCONTO" borderColor="emerald-500" compact>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Total Revisão (R$)</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xl font-black text-white focus:border-emerald-500 outline-none" 
                    value={revAprovadaInput} 
                    onChange={(e) => setRevAprovadaInput(e.target.value)} 
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Peças na Revisão (R$)</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xl font-black text-white focus:border-emerald-500 outline-none" 
                    value={revPecasInput} 
                    onChange={(e) => setRevPecasInput(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Desconto em Peças (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-12 text-xl font-black text-amber-500 focus:border-amber-500 outline-none" 
                      value={desconto} 
                      onChange={(e) => setDesconto(parseFloat(e.target.value))} 
                    />
                    <Percent size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Parcelas</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xl font-black text-white focus:border-blue-500 outline-none appearance-none" value={parcelas} onChange={(e) => setParcelas(parseInt(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => <option key={n} value={n} className="bg-slate-900">{n}x</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Placa</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xl font-black text-white uppercase tracking-widest focus:border-blue-500 outline-none" 
                    value={placa} 
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())} 
                    placeholder="Ex.: ABC1D23"
                    maxLength={8}
                  />
                </div>

                <button 
                  onClick={handleGenerate} 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] active:scale-[0.98] mt-2 text-lg"
                >
                  <Sparkles size={24} /> Processar Tudo
                </button>
              </div>
            </NeonCard>
          </div>
        </div>

        <div id="result-section" className="mt-20">
          {summary && (
            <div className="space-y-12">
              <div className="max-w-[1200px] mx-auto print:hidden">
                <NeonCard title="RESUMO LÍQUIDO" borderColor="#10b981">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">Total Peças</span>
                      <span className="text-2xl font-black text-white">{formatCurrency(summary.totalPecasGeral)}</span>
                    </div>
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">Total Serviços</span>
                      <span className="text-2xl font-black text-white">{formatCurrency(summary.totalServicosGeral)}</span>
                    </div>
                    <div className="p-6 bg-slate-950 rounded-2xl border border-emerald-900/40 text-center">
                      <span className="text-[10px] font-black text-emerald-500 uppercase block mb-2">Desc. ({summary.descontoPercentual}%)</span>
                      <span className="text-2xl font-black text-emerald-400">- {formatCurrency(summary.valorDescontoTotal)}</span>
                    </div>
                    <div className="p-6 bg-blue-600/10 rounded-2xl border border-blue-500/30 text-center">
                      <span className="text-[10px] font-black text-blue-400 uppercase block mb-2 underline">Valor Líquido</span>
                      <span className="text-3xl font-black text-blue-300">{formatCurrency(summary.valorLiquidoFinal)}</span>
                    </div>
                  </div>
                </NeonCard>
              </div>

              <div className="max-w-4xl mx-auto">
                <QuoteTable summary={summary} />
              </div>
            </div>
          )}
        </div>
      </main>

      <HistoryModal
        aberto={historicoAberto}
        onFechar={() => setHistoricoAberto(false)}
        onAbrir={abrirDoHistorico}
      />
    </div>
  );
};

export default App;
