import React, { useRef } from 'react';
import { QuoteSummary } from '../types';
import { formatCurrency } from '../utils/quoteLogic';
import { Printer, Download, Image as ImageIcon } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface QuoteTableProps {
  summary: QuoteSummary;
  selecionados: Set<number>;
  onToggleItem: (id: number) => void;
}

const QuoteTable: React.FC<QuoteTableProps> = ({ summary, selecionados, onToggleItem }) => {
  const printableRef = useRef<HTMLDivElement>(null);

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    window.print();
  };

  const handleDownloadImage = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!printableRef.current) return;
    
    try {
      // Gera a imagem em alta definição
      const dataUrl = await htmlToImage.toPng(printableRef.current, {
        quality: 1.0,
        pixelRatio: 3, // Qualidade ainda maior para exportação
        backgroundColor: '#ffffff',
        cacheBust: true,
        // no PNG não entram as caixinhas (data-ui) nem os itens desmarcados (data-fora)
        filter: (node) => {
          const el = node as HTMLElement;
          return !(el.dataset?.fora || el.dataset?.ui);
        },
      });
      
      const link = document.createElement('a');
      link.download = `Orcamento_Toyota_${summary.currentTime.replace(/[/:\s]/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Houve um erro ao gerar a imagem. Tente usar a função de imprimir/salvar PDF.');
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-700">
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 print:hidden ui-compacta">
        <button 
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg active:scale-95 text-lg group cursor-pointer"
        >
          <Printer size={22} className="group-hover:scale-110 transition-transform" />
          IMPRIMIR / PDF
        </button>
        
        <button 
          type="button"
          onClick={handleDownloadImage}
          className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg active:scale-95 text-lg group cursor-pointer"
        >
          <ImageIcon size={22} className="group-hover:scale-110 transition-transform" />
          BAIXAR IMAGEM (ALTA QUALIDADE)
        </button>
      </div>

      {/* Printable Document Context */}
      <div 
        ref={printableRef}
        id="printable-quote" 
        className="bg-white text-slate-950 p-6 sm:p-10 rounded-[2rem] shadow-2xl mx-auto border border-slate-200 print:p-0 print:shadow-none print:border-none print:rounded-none"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-blue-700 uppercase tracking-tight mb-1">Orçamento Adicional</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          {/* Main Items Table */}
          <div className="overflow-hidden border-2 border-slate-300 rounded-2xl mb-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="py-2 px-6 text-center w-20 font-bold uppercase text-xl border-r border-blue-500">Item</th>
                  <th className="py-2 px-6 text-left font-bold uppercase text-xl border-r border-blue-500">Descrição</th>
                  <th className="py-2 px-6 text-right w-44 font-bold uppercase text-xl">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200">
                {summary.items.map((item) => {
                  const marcado = selecionados.has(item.id);
                  return (
                  <tr
                    key={item.id}
                    data-fora={marcado ? undefined : '1'}
                    className={`even:bg-slate-50/50 ${marcado ? '' : 'opacity-45'}`}
                  >
                    <td className="py-2 px-6 text-center font-bold text-slate-500 text-2xl border-r-2 border-slate-200">
                      <span className="inline-flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          data-ui="1"
                          checked={marcado}
                          onChange={() => onToggleItem(item.id)}
                          title="Incluir este item no orçamento"
                          className="w-5 h-5 accent-blue-600 cursor-pointer print:hidden"
                        />
                        <span>{item.id}</span>
                      </span>
                    </td>
                    <td className={`py-2 px-6 font-bold text-slate-900 text-2xl uppercase leading-none ${marcado ? '' : 'line-through'}`}>{item.description}</td>
                    <td className="py-2 px-6 text-right font-bold text-slate-950 text-2xl border-l-2 border-slate-200 bg-slate-50/30">
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-blue-600">
                <tr className="bg-blue-50/50 text-blue-900">
                  <td colSpan={2} className="py-3 px-6 text-right uppercase tracking-wider text-2xl font-bold">Valor Total Adicional:</td>
                  <td className="py-3 px-6 text-right text-2xl font-bold border-l-2 border-blue-100 bg-blue-100/20">{formatCurrency(summary.totalOrcamento)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Document Info - Space Further Reduced */}
          <div className="text-center text-[10px] text-slate-400 mb-2 uppercase tracking-[0.2em] font-medium leading-[1.1]">
            <p>Data: <span className="text-slate-900">{summary.currentTime}</span></p>
            <p>Orçamento sujeito a alterações. Validade: 10 dias.</p>
            <p className="text-blue-600 font-bold">Toyota Weiand Lajeado</p>
          </div>

          {/* Final Financial Summary Section */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-[2rem] px-6 py-3 sm:px-10 sm:py-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px w-10 bg-slate-300"></div>
              <h3 className="text-xl font-bold text-blue-900 uppercase tracking-[0.3em]">Resumo Financeiro</h3>
              <div className="h-px w-10 bg-slate-300"></div>
            </div>
            
            <div className="space-y-0.5 max-w-xl mx-auto">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase tracking-tight text-2xl">Revisão Aprovada:</span>
                <span className="text-slate-950 font-bold text-2xl">{formatCurrency(summary.revisaoAprovada)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase tracking-tight text-2xl">Orçamento Adicional:</span>
                <span className="text-slate-950 font-bold text-2xl">{formatCurrency(summary.totalOrcamento)}</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-bold uppercase tracking-wide text-2xl">Parcelamento ({summary.numParcelas}x):</span>
                <span className="font-bold text-2xl">{summary.numParcelas} x {formatCurrency(summary.valorParcela)}</span>
              </div>

              <div className="h-px bg-blue-600 my-2 opacity-40"></div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-widest text-2xl text-blue-900 leading-none">Total Geral:</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Revisão + Adicional</span>
                </div>
                <span className="text-2xl font-bold text-slate-950">
                  {formatCurrency(summary.totalGeral)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-[10px] text-slate-300 font-medium uppercase tracking-[0.4em] print:hidden leading-none">
            Documento Gerado Eletronicamente
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteTable;
