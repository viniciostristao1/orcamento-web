import React, { useEffect, useRef, useState } from 'react';
import { QuoteSummary } from '../types';
import { formatCurrency, itensNaoRealizados } from '../utils/quoteLogic';
import { Printer, Download, Image as ImageIcon, Save, Check } from 'lucide-react';
import { exportarPng } from '../utils/exportImage';

interface QuoteTableProps {
  summary: QuoteSummary;
  selecionados: Set<number>;
  onToggleItem: (id: number) => void;
  onSalvarNaoRealizados?: () => void;
}

const QuoteTable: React.FC<QuoteTableProps> = ({ summary, selecionados, onToggleItem, onSalvarNaoRealizados }) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const [alturaDocumento, setAlturaDocumento] = useState(0);
  const [salvoRecente, setSalvoRecente] = useState(false);

  const handleSalvarNaoRealizados = () => {
    if (!onSalvarNaoRealizados) return;
    onSalvarNaoRealizados();
    setSalvoRecente(true);
    setTimeout(() => setSalvoRecente(false), 2000);
  };

  // Mede a altura real do documento para o preview em metade do tamanho (só o
  // visual). O PNG/impressão não mudam: transform não afeta o tamanho do nó.
  useEffect(() => {
    const el = printableRef.current;
    if (!el) return;
    const medir = () => setAlturaDocumento(el.offsetHeight);
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(medir);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Itens desmarcados (não realizados) e a soma — a caixa só aparece se houver algum.
  const naoRealizados = itensNaoRealizados(summary, selecionados);

  // Valores do documento: "TOTAL" = itens marcados + revisão aprovada;
  // "TOTAL GERAL" (só com algum desmarcado) = todos os itens + revisão.
  const totalSelecionado = summary.revisaoAprovada + summary.totalOrcamento;
  const totalCompleto = summary.revisaoAprovada + summary.items.reduce((acc, i) => acc + i.value, 0);
  const parcelaSelecionada = totalSelecionado / summary.numParcelas;

  // Impressão: em vez de re-renderizar o HTML na largura do papel (o que mudava
  // a proporção das colunas e quebrava linhas diferentes), geramos a MESMA
  // imagem do PNG e imprimimos ela a 100% da largura — proporções idênticas.
  const [imagemImpressao, setImagemImpressao] = useState<string | null>(null);
  const printImgRef = useRef<HTMLImageElement>(null);

  const opcoesPng = {
    quality: 1.0,
    pixelRatio: 3,
    backgroundColor: '#ffffff',
    cacheBust: true,
    filter: (node: Node) => !(node as HTMLElement).dataset?.ui,
  };

  const handlePrint = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!printableRef.current) return;
    try {
      const dataUrl = await exportarPng(printableRef.current, opcoesPng);
      setImagemImpressao(dataUrl);
    } catch (error) {
      console.error('Erro ao preparar impressão:', error);
      window.print(); // fallback: imprime o documento ao vivo
    }
  };

  // Só chama a impressão depois que a imagem está pronta para renderizar.
  useEffect(() => {
    if (!imagemImpressao) return;
    const img = printImgRef.current;
    const imprimir = () => window.print();
    if (img && typeof img.decode === 'function') {
      img.decode().then(imprimir).catch(imprimir);
    } else {
      setTimeout(imprimir, 150);
    }
  }, [imagemImpressao]);

  // Depois de fechar a janela de impressão, descarta a imagem.
  useEffect(() => {
    const limpar = () => setImagemImpressao(null);
    window.addEventListener('afterprint', limpar);
    return () => window.removeEventListener('afterprint', limpar);
  }, []);

  const handleDownloadImage = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!printableRef.current) return;
    
    try {
      // Gera a imagem em alta definição, com as fontes no tamanho real
      // (o exportarPng desfaz a redução de 0.1px do html-to-image)
      const dataUrl = await exportarPng(printableRef.current, opcoesPng);
      
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
    <div
      className="w-full space-y-6 animate-in fade-in zoom-in-95 duration-700"
      data-impressao={imagemImpressao ? 'imagem' : undefined}
    >
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 print:hidden ui-compacta">
        <button 
          type="button"
          onClick={handlePrint}
          aria-label="Imprimir / PDF"
          title="Imprimir / PDF"
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all shadow-lg active:scale-95 group cursor-pointer"
        >
          <Printer size={24} className="group-hover:scale-110 transition-transform" />
        </button>
        
        <button 
          type="button"
          onClick={handleDownloadImage}
          aria-label="Baixar imagem (alta qualidade)"
          title="Baixar imagem (alta qualidade)"
          className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl transition-all shadow-lg active:scale-95 group cursor-pointer"
        >
          <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Salva no histórico com a marcação atual (vai para a aba "Não Realizados").
            Só faz sentido quando há algum item desmarcado. */}
        <button
          type="button"
          onClick={handleSalvarNaoRealizados}
          disabled={naoRealizados.itens.length === 0 || !onSalvarNaoRealizados}
          aria-label="Salvar com itens não realizados"
          title={
            naoRealizados.itens.length === 0
              ? 'Desmarque algum item para salvar na aba Não Realizados'
              : 'Salvar com itens não realizados'
          }
          className="flex items-center justify-center bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-4 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          {salvoRecente ? <Check size={24} strokeWidth={3} /> : <Save size={24} />}
        </button>
      </div>

      {/* Printable Document Context */}
      <div
        className="preview-orcamento-holder w-full max-w-4xl mx-auto"
        style={alturaDocumento ? { height: alturaDocumento * 0.5 } : undefined}
      >
      <div className="preview-orcamento">
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
                    className="even:bg-slate-50/50"
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
                    <td className={`py-2 px-6 font-bold text-2xl uppercase leading-none ${marcado ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{item.description}</td>
                    <td className={`py-2 px-6 text-right font-bold text-2xl border-l-2 border-slate-200 bg-slate-50/30 ${marcado ? 'text-slate-950' : 'text-slate-400 line-through'}`}>
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
                <span className="font-bold text-2xl">{summary.numParcelas} x {formatCurrency(parcelaSelecionada)}</span>
              </div>

              <div className="h-px bg-blue-600 my-2 opacity-40"></div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-widest text-2xl text-blue-900 leading-none">Total:</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Revisão + Adicional</span>
                </div>
                <span className="text-2xl font-bold text-slate-950">
                  {formatCurrency(totalSelecionado)}
                </span>
              </div>
            </div>
          </div>

          {/* Itens Não Realizados — caixa separada, só quando há itens desmarcados */}
          {naoRealizados.itens.length > 0 && (
            <div className="mt-3 bg-red-50/70 border-2 border-red-200 rounded-[2rem] px-6 py-3 sm:px-10 sm:py-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="h-px w-10 bg-red-200"></div>
                <h3 className="text-xl font-bold text-red-800 uppercase tracking-[0.3em]">Itens Não Realizados</h3>
                <div className="h-px w-10 bg-red-200"></div>
              </div>

              <div className="space-y-0.5 max-w-xl mx-auto">
                {naoRealizados.itens.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-6">
                    <span className="font-bold uppercase tracking-tight text-slate-500 text-2xl line-through">
                      {item.id} · {item.description}
                    </span>
                    <span className="font-bold text-slate-400 text-2xl line-through whitespace-nowrap">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}

                <div className="h-px bg-red-300 my-2 opacity-60"></div>

                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-widest text-2xl text-red-800 leading-none">Total Não Realizado:</span>
                  <span className="text-2xl font-bold text-red-700">
                    {formatCurrency(naoRealizados.total)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TOTAL GERAL — tudo (itens marcados + não realizados + revisão).
              Só aparece quando há algum item desmarcado. */}
          {naoRealizados.itens.length > 0 && (
            <div className="mt-3 bg-slate-50 border-2 border-slate-300 rounded-[2rem] px-6 py-4 sm:px-10">
              <div className="flex justify-between items-center max-w-xl mx-auto">
                <span className="font-bold uppercase tracking-widest text-2xl text-blue-900 leading-none">Total Geral:</span>
                <span className="text-3xl font-bold text-slate-950">
                  {formatCurrency(totalCompleto)}
                </span>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center text-[10px] text-slate-300 font-medium uppercase tracking-[0.4em] print:hidden leading-none">
            Documento Gerado Eletronicamente
          </div>
        </div>
      </div>
      </div>
      </div>

      {/* Área só da impressão: a imagem do PNG (mesmas proporções), a 100% da
          largura da página. No navegador ela fica escondida. */}
      {imagemImpressao && (
        <div className="area-impressao">
          <img ref={printImgRef} src={imagemImpressao} alt="Orçamento" />
        </div>
      )}
    </div>
  );
};

export default QuoteTable;
