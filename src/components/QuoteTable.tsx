import React, { useEffect, useRef, useState } from 'react';
import { QuoteSummary } from '../types';
import { calcularPrevia, construirPrevia, ehLinhaVazia, formatCurrency, numeroExibicaoPrevia, parseBrazilianNumber, previaVazia, type PreviaOrcamento } from '../utils/quoteLogic';
import { Printer, Image as ImageIcon, Check, Minus, X, Plus, RotateCcw } from 'lucide-react';
import { exportarPng } from '../utils/exportImage';
import { abrirWhats, temTelefoneValido } from '../utils/telefone';
import { IconeWhatsApp } from './BotaoWhats';

export type AprovacaoVoto = 'aprovado' | 'parcial' | 'naoAprovado';

/** Texto clicável que vira campo editável no lugar (Enter/blur confirma, Esc cancela). */
const CelulaTexto: React.FC<{
  value: string;
  onCommit: (v: string) => void;
  className?: string;
  ariaLabel: string;
}> = ({ value, onCommit, className = '', ariaLabel }) => {
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState(value);
  // Valor de abertura: o commit é imediato, então o Esc volta para ele.
  const originalRef = useRef(value);
  // Foca e leva o caret ao fim SÓ na abertura da edição. A ref inline abaixo é
  // recriada a cada render — e o pai re-renderiza a cada tecla (onCommit
  // imediato) — então sem a guarda o React a re-disparava e o caret voltava
  // ao fim no meio da digitação (a 2ª tecla no meio do texto caía no fim).
  const focouAbertura = useRef(false);
  const iniciarEdicao = () => {
    originalRef.current = value;
    setRascunho(value);
    focouAbertura.current = false;
    setEditando(true);
  };
  const terminarEdicao = () => {
    focouAbertura.current = false;
    setEditando(false);
  };
  if (!editando && !value.trim()) {
    // Linha nova (descrição vazia): placeholder clicável só na tela — fora do
    // PNG (data-ui) para a célula sair vazia na captura.
    return (
      <span
        data-ui="1"
        onClick={iniciarEdicao}
        title="Clique para editar"
        className={`${className} cursor-text text-slate-300 print:hidden`}
      >
        …
      </span>
    );
  }
  if (!editando) {
    return (
      <span onClick={iniciarEdicao} title="Clique para editar" className={`${className} cursor-text`}>
        {value}
      </span>
    );
  }
  return (
    <input
      type="text"
      value={rascunho}
      onChange={(e) => { setRascunho(e.target.value); onCommit(e.target.value); }}
      onBlur={terminarEdicao}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        else if (e.key === 'Escape') { onCommit(originalRef.current); terminarEdicao(); }
      }}
      ref={(el) => {
        if (el && !focouAbertura.current) {
          focouAbertura.current = true;
          el.focus();
          const fim = el.value.length;
          el.setSelectionRange(fim, fim);
        }
      }}
      aria-label={ariaLabel}
      className={`${className} w-full bg-transparent border-b-2 border-blue-400 outline-none`}
    />
  );
};

/** Valor clicável com commit imediato (calculadora): digitar já atualiza os totais. */
const CelulaValor: React.FC<{
  value: number;
  onCommit: (v: number) => void;
  className?: string;
  ariaLabel: string;
}> = ({ value, onCommit, className = '', ariaLabel }) => {
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState<string | null>(null);
  const texto = rascunho ?? formatCurrency(value);
  // Valor de abertura: o commit é imediato, então o Esc volta para ele.
  const originalRef = useRef(value);
  // Mesma guarda do CelulaTexto: focar e levar ao fim só na abertura — sem
  // ela, cada tecla (commit imediato → re-render do pai) jogava o caret ao
  // fim no meio da digitação.
  const focouAbertura = useRef(false);
  const iniciarEdicao = () => {
    originalRef.current = value;
    setRascunho(formatCurrency(value));
    focouAbertura.current = false;
    setEditando(true);
  };
  const terminarEdicao = () => {
    focouAbertura.current = false;
    setEditando(false);
  };
  if (!editando) {
    return (
      <span onClick={iniciarEdicao} title="Clique para editar" className={`${className} cursor-text`}>
        {formatCurrency(value)}
      </span>
    );
  }
  const confirmarTexto = (t: string) => {
    const n = parseBrazilianNumber(t);
    onCommit(Number.isFinite(n) ? n : 0);
  };
  return (
    <input
      type="text"
      inputMode="decimal"
      value={texto}
      onChange={(e) => { setRascunho(e.target.value); confirmarTexto(e.target.value); }}
      onBlur={() => { setRascunho(null); terminarEdicao(); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        else if (e.key === 'Escape') { onCommit(originalRef.current); setRascunho(null); terminarEdicao(); }
      }}
      ref={(el) => {
        if (el && !focouAbertura.current) {
          focouAbertura.current = true;
          el.focus();
          const fim = el.value.length;
          el.setSelectionRange(fim, fim);
        }
      }}
      aria-label={ariaLabel}
      className={`${className} w-full bg-transparent border-b-2 border-blue-400 outline-none`}
    />
  );
};

interface QuoteTableProps {
  summary: QuoteSummary;
  /** Prévia interativa (null = 1ª montagem; cai no resumo). */
  previa: PreviaOrcamento | null;
  /** Quantidade de parcelas (padrão 6; o controle continua existindo). */
  numParcelas?: number;
  selecionados: Set<number>;
  onToggleItem: (id: number) => void;
  onEditarDescricao: (id: number, descricao: string) => void;
  onEditarValor: (id: number, valor: number) => void;
  onEditarRevisao: (valor: number) => void;
  onExcluirItem: (id: number) => void;
  onRestaurarItem: (id: number) => void;
  /** Apaga a linha DE VEZ (segundo ×, só na linha já excluída; com Desfazer). */
  onApagarItem: (id: number) => void;
  onAdicionarItem: () => void;
  onVoltarOriginal: () => void;
  /** Abre um orçamento manual limpo (só o item 1, vazio). */
  onNovoManual: () => void;
  /** Aprovação atual do orçamento em tela (V/X). */
  aprovacao?: AprovacaoVoto | null;
  /** Marca/desmarca (clicar no mesmo limpa; sempre salva no histórico). */
  onMarcarAprovacao?: (v: AprovacaoVoto | undefined) => void;
  /** Telefone do cliente (só abre a conversa, sem texto pronto). */
  telefone?: string;
  /** Nome do cliente (vai para o PNG, junto da data). */
  nomeCliente?: string;
}

const QuoteTable: React.FC<QuoteTableProps> = ({
  summary,
  previa,
  numParcelas = 6,
  selecionados,
  onToggleItem,
  onEditarDescricao,
  onEditarValor,
  onEditarRevisao,
  onExcluirItem,
  onRestaurarItem,
  onApagarItem,
  onAdicionarItem,
  onVoltarOriginal,
  onNovoManual,
  aprovacao = null,
  onMarcarAprovacao,
  telefone = '',
  nomeCliente = '',
}) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [alturaDocumento, setAlturaDocumento] = useState(0);
  // Escala da prévia: no desktop (xl) o layout é travado em 896px e a escala
  // preenche a largura útil do holder; fora do xl, 0,5 como sempre foi.
  const [escala, setEscala] = useState(0.5);

  // Mede a altura real do documento e a largura útil do holder para a escala
  // (só o visual). O PNG/impressão não mudam: transform não afeta o tamanho
  // do nó e o layout continua travado em 896px no desktop.
  useEffect(() => {
    const el = printableRef.current;
    const holder = holderRef.current;
    if (!el || !holder) return;
    const medir = () => {
      setAlturaDocumento(el.offsetHeight);
      // jsdom não tem matchMedia nem largura real: cai no 0,5 de sempre.
      const xl =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(min-width: 1280px)').matches &&
        holder.clientWidth > 0;
      setEscala(xl ? holder.clientWidth / 896 : 0.5);
    };
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(medir);
    observer.observe(el);
    observer.observe(holder);
    return () => observer.disconnect();
  }, []);

  // Prévia interativa: sem ela (1ª montagem), cai no resumo recalculado.
  const prev: PreviaOrcamento =
    previa ?? { ...construirPrevia(summary.items, summary.revisaoAprovada), original: null };
  // Calculadora da prévia: adicional = marcados não excluídos; total = revisão
  // + adicional; parcela = total / N arredondada para cima no centavo.
  const calc = calcularPrevia(prev, selecionados, numParcelas);

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

  // Confirma a edição em curso (o PNG sai exatamente como está na prévia,
  // sem rascunho de campo aberto): o blur dispara o commit das células.
  const confirmarEdicaoAberta = async () => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    await new Promise((r) => setTimeout(r, 60));
  };

  const handlePrint = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!printableRef.current) return;
    // Nada imprimível (só linhas vazias e revisão zerada): avisa em vez de
    // imprimir uma folha em branco.
    if (previaVazia(prev)) {
      alert('O orçamento está vazio: preencha ao menos uma descrição ou valor (ou a revisão aprovada) antes de imprimir.');
      return;
    }
    await confirmarEdicaoAberta();
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
    // Nada imprimível (só linhas vazias e revisão zerada): avisa em vez de
    // baixar um PNG em branco.
    if (previaVazia(prev)) {
      alert('O orçamento está vazio: preencha ao menos uma descrição ou valor (ou a revisão aprovada) antes de baixar a imagem.');
      return;
    }
    await confirmarEdicaoAberta();

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
        {/* Orçamento manual: abre um documento limpo (só o item 1, vazio).
            Violeta (#7c3aed, literal — fora do remapeamento do tema): difere das
            seis demais no Duna (marinho, verde-escuro, verde, verde-escuro,
            âmbar queimado, vermelho, oliva) e no padrão. */}
        <button
          type="button"
          onClick={onNovoManual}
          aria-label="Novo orçamento manual"
          title="Novo orçamento manual (limpo, só com o item 1)"
          className="flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white p-4 rounded-xl transition-all shadow-lg active:scale-95 group cursor-pointer"
        >
          <Plus size={24} className="group-hover:scale-110 transition-transform" />
        </button>

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

        {/* WhatsApp do cliente: abre só a conversa (sem texto). Apagado sem telefone. */}
        <button
          type="button"
          onClick={() => abrirWhats(telefone)}
          disabled={!temTelefoneValido(telefone)}
          aria-label="Conversar no WhatsApp"
          title={temTelefoneValido(telefone) ? `Conversar no WhatsApp (${telefone})` : 'Conversar no WhatsApp (digite o telefone no card do sistema)'}
          className="flex items-center justify-center bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white p-4 rounded-xl transition-all shadow-lg active:scale-95 group cursor-pointer disabled:cursor-not-allowed"
        >
          <span className="group-hover:scale-110 transition-transform inline-flex">
            <IconeWhatsApp size={24} />
          </span>
        </button>

        {/* Aprovação do cliente (vai para o relatório Excel). Clicar no mesmo limpa. */}
        <button
          type="button"
          onClick={() => onMarcarAprovacao?.(aprovacao === 'aprovado' ? undefined : 'aprovado')}
          disabled={!onMarcarAprovacao}
          aria-label="Marcar como aprovado"
          title="Marcar como aprovado"
          aria-pressed={aprovacao === 'aprovado'}
          className={`flex items-center justify-center p-4 rounded-xl transition-all shadow-lg active:scale-95 group cursor-pointer disabled:opacity-40 ${
            aprovacao === 'aprovado'
              ? 'bg-green-500 text-white ring-4 ring-green-300'
              : 'bg-green-700 hover:bg-green-600 text-white'
          }`}
        >
          <Check size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
        </button>
        <button
          type="button"
          onClick={() => onMarcarAprovacao?.(aprovacao === 'parcial' ? undefined : 'parcial')}
          disabled={!onMarcarAprovacao}
          aria-label="Marcar como parcial"
          title="Marcar como parcial (vai para a aba Parcial)"
          aria-pressed={aprovacao === 'parcial'}
          className={`flex items-center justify-center p-4 rounded-xl transition-all shadow-lg active:scale-95 group cursor-pointer disabled:opacity-40 ${
            aprovacao === 'parcial'
              ? 'bg-amber-500 text-white ring-4 ring-amber-300'
              : 'bg-amber-700 hover:bg-amber-600 text-white'
          }`}
        >
          <Minus size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
        </button>
        <button
          type="button"
          onClick={() => onMarcarAprovacao?.(aprovacao === 'naoAprovado' ? undefined : 'naoAprovado')}
          disabled={!onMarcarAprovacao}
          aria-label="Marcar como não aprovado"
          title="Marcar como não aprovado"
          aria-pressed={aprovacao === 'naoAprovado'}
          className={`flex items-center justify-center p-4 rounded-xl transition-all shadow-lg active:scale-95 group cursor-pointer disabled:opacity-40 ${
            aprovacao === 'naoAprovado'
              ? 'bg-red-500 text-white ring-4 ring-red-300'
              : 'bg-red-700 hover:bg-red-600 text-white'
          }`}
        >
          <X size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Voltar à 1ª versão gerada do PDF (desfaz as edições da prévia). */}
        <button
          type="button"
          onClick={onVoltarOriginal}
          disabled={!prev?.original}
          aria-label="Voltar à versão original"
          title={
            prev?.original
              ? 'Desfazer todas as edições manuais e voltar à versão gerada do PDF'
              : 'Sem a versão original guardada (orçamento antigo): a prévia atual é a referência'
          }
          className="flex items-center justify-center bg-slate-600 hover:bg-slate-500 disabled:opacity-40 text-white p-4 rounded-xl transition-all shadow-lg active:scale-95 group cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCcw size={24} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Printable Document Context: no desktop o layout é travado em 896px
          (o PNG sai idêntico) e a escala preenche a coluna; fora do xl, tudo
          como era (fluido + escala .5). */}
      <div
        ref={holderRef}
        className="preview-orcamento-holder w-full max-w-4xl mx-auto"
        style={alturaDocumento ? { height: alturaDocumento * escala } : undefined}
      >
      <div className="preview-orcamento" style={{ transform: `scale(${escala})` }}>
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
                <tr className="bg-[#1e293b] text-white">
                  <th className="py-2 px-6 text-center w-20 font-bold uppercase text-xl border-r border-[#334155]">Item</th>
                  <th className="py-2 px-6 text-left font-bold uppercase text-xl border-r border-[#334155]">Descrição</th>
                  <th className="py-2 px-6 text-right w-44 font-bold uppercase text-xl">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-200">
                {prev.itens.map((item) => {
                  const marcado = selecionados.has(item.id) && !item.excluido;
                  const numero = numeroExibicaoPrevia(prev.itens, item.id);
                  if (item.excluido) {
                    // Linha excluída: riscada e fraca na tela (toque restaura),
                    // fora do PNG (data-ui) e da impressão. O segundo × (ao
                    // lado da barra) apaga de vez, com Desfazer no toast.
                    return (
                      <tr
                        key={item.id}
                        data-ui="1"
                        onClick={() => onRestaurarItem(item.id)}
                        title="Toque para restaurar a linha na posição original"
                        className="bg-slate-100/60 cursor-pointer print:hidden"
                      >
                        <td className="py-2 px-6 text-center font-bold text-slate-400 text-2xl border-r-2 border-slate-200">
                          <span className="inline-flex items-center justify-center gap-2">
                            <span>–</span>
                            <button
                              type="button"
                              data-ui="1"
                              onClick={(ev) => { ev.stopPropagation(); onApagarItem(item.id); }}
                              aria-label="Apagar linha definitivamente"
                              title="Apagar a linha de vez (sem voltar; tem Desfazer)"
                              className="print:hidden text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <X size={16} strokeWidth={3} />
                            </button>
                          </span>
                        </td>
                        <td className="py-2 px-6 font-bold text-2xl uppercase leading-none text-slate-400 line-through">{item.descricao || '(sem descrição)'}</td>
                        <td className="py-2 px-6 text-right font-bold text-2xl border-l-2 border-slate-200 text-slate-400 line-through">
                          {formatCurrency(item.valor)}
                        </td>
                      </tr>
                    );
                  }
                  // Linha totalmente vazia (sem descrição e valor zerado): segue
                  // editável na tela, mas fora do PNG (data-ui) e da impressão.
                  const vazia = ehLinhaVazia(item);
                  return (
                  <tr
                    key={item.id}
                    {...(vazia ? { 'data-ui': '1' as const } : {})}
                    className={vazia ? 'even:bg-slate-50/50 print:hidden' : 'even:bg-slate-50/50'}
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
                        <span>{numero}</span>
                        <button
                          type="button"
                          data-ui="1"
                          onClick={() => onExcluirItem(item.id)}
                          aria-label={`Excluir linha ${numero}`}
                          title="Excluir a linha (restaura com um toque)"
                          className="print:hidden text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X size={16} strokeWidth={3} />
                        </button>
                      </span>
                    </td>
                    <td className={`py-2 px-6 font-bold text-2xl uppercase leading-none ${marcado ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                      <CelulaTexto
                        value={item.descricao}
                        onCommit={(v) => onEditarDescricao(item.id, v)}
                        ariaLabel={`Descrição do item ${numero}`}
                      />
                    </td>
                    <td className={`py-2 px-6 text-right font-bold text-2xl border-l-2 border-slate-200 bg-slate-50/30 ${marcado ? 'text-slate-950' : 'text-slate-400 line-through'}`}>
                      <CelulaValor
                        value={item.valor}
                        onCommit={(v) => onEditarValor(item.id, v)}
                        ariaLabel={`Valor do item ${numero}`}
                      />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-blue-600">
                <tr className="bg-blue-50/50 text-blue-900">
                  <td colSpan={2} className="py-3 px-6 text-right uppercase tracking-wider text-2xl font-bold">Valor Total Adicional:</td>
                  <td className="py-3 px-6 text-right text-2xl font-bold border-l-2 border-blue-100 bg-blue-100/20">{formatCurrency(calc.adicional)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Adicionar linha: só na tela (fora do PNG e da impressão).
              Linha totalmente vazia também não sai no PNG. */}
          <div data-ui="1" className="print:hidden flex flex-col items-center mt-2 gap-1">
            <button
              type="button"
              onClick={onAdicionarItem}
              aria-label="Adicionar linha"
              title="Adicionar linha no fim (aprovada, vazia)"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              linhas vazias não saem no PNG
            </span>
          </div>

          {/* Document Info - Space Further Reduced */}
          <div className="text-center text-[10px] text-slate-400 mb-2 uppercase tracking-[0.2em] font-medium leading-[1.1]">
            <p>Data: <span className="text-slate-900">{summary.currentTime}</span></p>
            <p>Orçamento sujeito a alterações. Validade: 10 dias.</p>
            {nomeCliente.trim() && <p>Cliente: <span className="text-slate-900 font-bold">{nomeCliente.trim().toUpperCase()}</span></p>}
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
                <span className="text-slate-950 font-bold text-2xl text-right">
                  <CelulaValor
                    value={prev.revisaoAprovada}
                    onCommit={onEditarRevisao}
                    ariaLabel="Revisão aprovada"
                  />
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 uppercase tracking-tight text-2xl">Orçamento Adicional:</span>
                <span className="text-slate-950 font-bold text-2xl">{formatCurrency(calc.adicional)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span className="font-bold uppercase tracking-wide text-2xl">Parcelamento ({calc.numParcelas}x):</span>
                <span className="font-bold text-2xl">{calc.numParcelas} × {formatCurrency(calc.parcela)}</span>
              </div>

              <div className="h-px bg-blue-600 my-2 opacity-40"></div>

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-widest text-2xl text-blue-900 leading-none">Total:</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Revisão + Adicional</span>
                </div>
                <span className="text-2xl font-bold text-slate-950">
                  {formatCurrency(calc.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Itens Não Aprovados — caixa separada, só quando há itens marcados
              como não aprovados (excluídos não entram: saíram do orçamento). */}
          {calc.naoAprovados.length > 0 && (
            <div className="mt-3 bg-red-50/70 border-2 border-red-200 rounded-[2rem] px-6 py-3 sm:px-10 sm:py-4">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="h-px w-10 bg-red-200"></div>
                <h3 className="text-xl font-bold text-red-800 uppercase tracking-[0.3em]">Itens Não Aprovados</h3>
                <div className="h-px w-10 bg-red-200"></div>
              </div>

              <div className="space-y-0.5 max-w-xl mx-auto">
                {calc.naoAprovados.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-6">
                    <span className="font-bold uppercase tracking-tight text-slate-500 text-2xl line-through">
                      {numeroExibicaoPrevia(prev.itens, item.id)} · {item.descricao}
                    </span>
                    <span className="font-bold text-slate-400 text-2xl line-through whitespace-nowrap">
                      {formatCurrency(item.valor)}
                    </span>
                  </div>
                ))}

                <div className="h-px bg-red-300 my-2 opacity-60"></div>

                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-widest text-2xl text-red-800 leading-none">Total Não Aprovado:</span>
                  <span className="text-2xl font-bold text-red-700">
                    {formatCurrency(calc.totalNaoAprovado)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TOTAL GERAL — revisão + tudo não excluído (marcados + não aprovados).
              Só aparece quando há algum item desmarcado. */}
          {calc.naoAprovados.length > 0 && (
            <div className="mt-3 bg-slate-50 border-2 border-slate-300 rounded-[2rem] px-6 py-4 sm:px-10">
              <div className="flex justify-between items-center max-w-xl mx-auto">
                <span className="font-bold uppercase tracking-widest text-2xl text-blue-900 leading-none">Total Geral:</span>
                <span className="text-3xl font-bold text-slate-950">
                  {formatCurrency(calc.totalGeralPrevia)}
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
