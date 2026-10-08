import React, { useEffect, useRef, useState } from 'react';
import { processQuote, formatCurrency, formatarValorInput, parseBrazilianNumber, recalcularComSelecao } from '../utils/quoteLogic';
import { QuoteSummary } from '../types';
import NeonCard from './NeonCard';
import QuoteTable, { type AprovacaoVoto } from './QuoteTable';
import { Play, Percent, Eraser } from 'lucide-react';
import HistoryModal from './HistoryModal';
import ClearButton from './ClearButton';
import MenuDados from './MenuDados';
import { adicionarAoHistorico, atualizarAprovacaoHistorico, retratoDoResumo, type OrcamentoSalvo } from '../utils/historico';
import SistemaCard from '../sistema/SistemaCard';
import { decidirFontePlay, type CabecalhoOrcamento } from '../sistema/extracao';
import { lerRascunho, salvarRascunho } from '../utils/rascunho';
import { lerUltimoOrcamento, salvarUltimoOrcamento } from '../utils/ultimoOrcamento';

const EXEMPLO_DESC = `01 TR PASTILHAS DE FREIO DIANT + RETIFICA DOS DISCOS\n02 OXI\n03 TR BORRACHA DAS PALHETAS`;
const EXEMPLO_ORCAMENTO = `1 Serviço GUN126L473025 DISCO DIANTEIRO UM LADO NO VEICULO 1,20000 514,800000 514,80\n1 Peça 142142GC133 *GRAXA COBREADA ALTA TEMPERATURA 1 36,640000 36,64\n1 Peça CARE040201 LIMPADOR PREMIUM UNIVERSAL 1 156,600000 156,60\n1 Peça 044650K401 JOGO PASTILHAS FREIO DIANT.HILUX AP.2016 1 1.245,000000 1.245,00\n3 Serviço GUN126L850091 BORRACHA DO LIMPADOR DIANTEIRO AMBOS OS 0,10000 42,900000 42,90\n3 Peça CARE044907 CAR CONJUNTO VISIB. DO PARABRISA, H20 PARA VEICULOS1 27,100000 27,10\n3 Peça 8521428090 BORRACHA LIMPADOR DI 1 65,000000 65,00\n3 Peça 8521453080 BORRACHA LIMPADOR PA 1 82,000000 82,00\n2 Serviço HIGMOTO HIGIENIZACAO AR CONDICIONADO 0,05000 0,000000 0,00\n2 Peça CARE040703 AUTO AIR CLEANER (GRANADA) 1 110,600000 110,60\n2 Peça CARE010701 OXY-SANITIZATION APP 1 99,000000 99,00\n1 Serviço RETDISCD1 RETIFICA DISCO FREIO DIANTEIRO 1,00000 250,000000 250,00`;

interface OrcamentosAppProps {
  historicoAberto: boolean;
  onFecharHistorico: () => void;
  onAbrirHistorico: () => void;
  onIrParaSubAba: (abaId: string) => void;
  onBuscarNosDados: (termo: string, passo: 1 | -1, repor: boolean) => void;
  /** Vindo do clique no aviso: abre o histórico destacando o cartão. */
  destaqueHistoricoId?: string | null;
}

const OrcamentosApp: React.FC<OrcamentosAppProps> = ({ historicoAberto, onFecharHistorico, onAbrirHistorico, onIrParaSubAba, onBuscarNosDados, destaqueHistoricoId = null }) => {
  // Último orçamento em edição (localStorage local). Sem rascunho, cai no exemplo.
  const [rascunho] = useState(lerRascunho);
  const [descReparo, setDescReparo] = useState<string>(() => rascunho?.descReparo ?? EXEMPLO_DESC);
  const [orcamentoRaw, setOrcamentoRaw] = useState<string>(() => rascunho?.orcamentoRaw ?? EXEMPLO_ORCAMENTO);
  const [ajustesManuais, setAjustesManuais] = useState<string>(() => rascunho?.ajustesManuais ?? "");
  const [desconto, setDesconto] = useState<number>(() => rascunho?.desconto ?? 5);
  const [parcelas, setParcelas] = useState<number>(() => rascunho?.parcelas ?? 6);
  const [placa, setPlaca] = useState<string>(() => rascunho?.placa ?? "");
  const [telefone, setTelefone] = useState<string>(() => rascunho?.telefone ?? "");
  const [nome, setNome] = useState<string>(() => rascunho?.nome ?? "");
  // Cabeçalho do orçamento do sistema (card 3): nº e data do documento.
  const [numero, setNumero] = useState<string>(() => rascunho?.numero ?? "");
  const [dataDoc, setDataDoc] = useState<string>(() => rascunho?.dataDoc ?? "");
  // Texto em revisão no card do sistema: se os campos estiverem vazios na hora
  // do play, vale o que já foi extraído (sem obrigar o clique em "Usar").
  const [revDesc, setRevDesc] = useState('');
  const [revDados, setRevDados] = useState('');
  // Revisão fresca (extração nova ainda não usada) + campos sujos (edição manual):
  // o play prefere a revisão fresca com campos intactos (decidirFontePlay).
  const revNonce = useRef(0);
  const revNonceUsed = useRef(0);
  const camposSujos = useRef(false);
  // Último documento gerado: reabre o app já com o visual do orçamento na tela.
  const [ultimo] = useState(lerUltimoOrcamento);
  const [summary, setSummary] = useState<QuoteSummary | null>(() => ultimo?.summary ?? null);
  const [selecionados, setSelecionados] = useState<Set<number>>(() => new Set(ultimo?.selecionados ?? []));
  // Registro do histórico referente ao documento em tela + aprovação (V/X).
  const [aprovacao, setAprovacao] = useState<AprovacaoVoto | null>(null);

  // Estados locais para os inputs de texto para permitir digitação livre (como vírgulas e pontos)
  const [revAprovadaInput, setRevAprovadaInput] = useState<string>(() => rascunho?.revAprovadaInput ?? "1766,23");
  const [revPecasInput, setRevPecasInput] = useState<string>(() => rascunho?.revPecasInput ?? "1000,00");

  // Salva o rascunho enquanto o usuário edita (reabre com o que estava fazendo).
  useEffect(() => {
    salvarRascunho({ descReparo, orcamentoRaw, ajustesManuais, revAprovadaInput, revPecasInput, desconto, parcelas, placa, telefone, numero, dataDoc, nome });
  }, [descReparo, orcamentoRaw, ajustesManuais, revAprovadaInput, revPecasInput, desconto, parcelas, placa, telefone, numero, dataDoc, nome]);

  // Mantém o último documento gerado salvo (inclusive a marcação dos itens).
  useEffect(() => {
    if (summary) salvarUltimoOrcamento({ summary, selecionados: [...selecionados] });
  }, [summary, selecionados]);

  const handleGenerate = () => {
    // Fonte do play (decidirFontePlay): revisão fresca + campos intactos = vale
    // a revisão (anexar o 2º orçamento + play gera o 2º, sem o "Usar"); edição
    // manual nos campos vence sempre; vazio dos dois lados cai na revisão.
    const fonte = decidirFontePlay({
      descCampo: descReparo,
      dadosCampo: orcamentoRaw,
      revDesc,
      revDados,
      camposSujos: camposSujos.current,
      revisaoFresca: revNonce.current !== revNonceUsed.current,
    });
    // Sem os dois não há o que somar: avisa em vez de sair em silêncio
    // (sem aviso o usuário acha que "não gerou": sem scroll e sem imagem).
    if (!fonte.desc || !fonte.dados) {
      alert(
        'Preencha a DESCRIÇÃO e os DADOS — ou anexe o PDF/print no card do sistema e clique em "Usar no orçamento manual".',
      );
      return;
    }
    if (fonte.usouRevisao) {
      // Alinha os campos com o que foi somado (a próxima vez vale o campo).
      setDescReparo(fonte.desc);
      setOrcamentoRaw(fonte.dados);
      revNonceUsed.current = revNonce.current;
      camposSujos.current = false;
    }
    const finalRevAprovada = parseBrazilianNumber(revAprovadaInput);
    const finalRevPecas = parseBrazilianNumber(revPecasInput);
    
    const result = processQuote(fonte.desc, fonte.dados, finalRevAprovada, finalRevPecas, desconto, parcelas, ajustesManuais);
    setSummary(result);
    setSelecionados(new Set(result.items.map((i) => i.id))); // começa com todos marcados

    // Histórico local (localStorage): salva a cada "Processar Tudo".
    const salvos = adicionarAoHistorico({
      descReparo: fonte.desc,
      orcamentoRaw: fonte.dados,
      ajustesManuais,
      revAprovadaInput,
      revPecasInput,
      desconto,
      parcelas,
      placa: placa.trim(),
      telefone: telefone.trim(),
      numeroOrcamento: numero.trim(),
      dataDoc: dataDoc.trim(),
      nome: nome.trim(),
      ...retratoDoResumo(result),
    });
    // Reprocessou registro já marcado? Mostra a marca de volta.
    setAprovacao(salvos[0].aprovacao ?? null);    
    setTimeout(() => { document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150);
  };

  // Reabre um orçamento do histórico na tela (recalcula a partir dos textos).
  // Zera a revisão pendente: o contexto agora é o registro aberto.
  const abrirDoHistorico = (r: OrcamentoSalvo) => {
    setDescReparo(r.descReparo);
    setOrcamentoRaw(r.orcamentoRaw);
    setAjustesManuais(r.ajustesManuais);
    setRevAprovadaInput(r.revAprovadaInput);
    setRevPecasInput(r.revPecasInput);
    setDesconto(r.desconto);
    setParcelas(r.parcelas);
    setPlaca(r.placa ?? '');
    setTelefone(r.telefone ?? '');
    setNome(r.nome ?? '');
    setNumero(r.numeroOrcamento ?? '');
    setDataDoc(r.dataDoc ?? '');
    setAprovacao(r.aprovacao ?? null);
    setRevDesc('');
    setRevDados('');
    revNonceUsed.current = revNonce.current;
    camposSujos.current = false;
    onFecharHistorico();
    const finalRevAprovada = parseBrazilianNumber(r.revAprovadaInput);
    const finalRevPecas = parseBrazilianNumber(r.revPecasInput);
    const result = processQuote(r.descReparo, r.orcamentoRaw, finalRevAprovada, finalRevPecas, r.desconto, r.parcelas, r.ajustesManuais);
    // O documento mostra a data/hora de quando o orçamento foi criado
    // (a do histórico), não a de agora.
    setSummary({ ...result, currentTime: r.criadoEm });
    // Restaura a marcação salva (registros da aba "Não Realizados").
    const desmarcados = new Set(r.naoRealizados ?? []);
    setSelecionados(new Set(result.items.map((i) => i.id).filter((id) => !desmarcados.has(id))));
    setTimeout(() => { document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150);
  };

  // V/X do documento (sempre salvam): V aprova com a marcação atual (tudo feito
  // = Aprovados; algum desmarcado = Não Aprovados); X risca tudo, marca não
  // aprovado e salva. Clicar no mesmo limpa a marca (salvando também).
  const votarAprovacao = (v: AprovacaoVoto | undefined) => {
    if (!visivel || !summary) return;
    const desmarcados =
      v === 'naoAprovado'
        ? visivel.items.map((i) => i.id)
        : visivel.items.filter((i) => !selecionados.has(i.id)).map((i) => i.id);
    if (v === 'naoAprovado') setSelecionados(new Set());
    setAprovacao(v ?? null);
    const base = recalcularComSelecao(
      summary,
      v === 'naoAprovado' ? new Set<number>() : selecionados,
    );
    const salvos = adicionarAoHistorico({
      descReparo,
      orcamentoRaw,
      ajustesManuais,
      revAprovadaInput,
      revPecasInput,
      desconto,
      parcelas,
      placa: placa.trim(),
      telefone: telefone.trim(),
      numeroOrcamento: numero.trim(),
      dataDoc: dataDoc.trim(),
      nome: nome.trim(),
      naoRealizados: desmarcados,
      ...retratoDoResumo(base),
    });
    atualizarAprovacaoHistorico(salvos[0].id, v);
  };

  // Marca/desmarca um item: os totais refletem só os marcados.
  const alternarItem = (id: number) => {
    setSelecionados((prev) => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return s;
    });
  };

  const visivel = summary ? recalcularComSelecao(summary, selecionados) : null;

  // Cabeçalho extraído do PDF/print: nº e data preenchem os próprios campos;
  // PLACA, NOME e TELEFONE são escritos/sobrescritos (só quando veio conteúdo).
  const aplicarCabecalho = (c: CabecalhoOrcamento) => {
    if (c.numero.trim()) setNumero(c.numero.trim());
    if (c.data.trim()) setDataDoc(c.data.trim());
    if (c.placa.trim()) setPlaca(c.placa.trim());
    if (c.nome.trim()) setNome(c.nome.trim());
    if (c.telefone.trim()) setTelefone(c.telefone.trim());
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[210px_minmax(0,1fr)_425px] gap-8 print:hidden ui-compacta">
          {/* MENU DADOS: lateral esquerda, fixo no topo ao rolar. */}
          <aside className="min-w-0 xl:sticky xl:top-24 self-start">
            <MenuDados onIr={onIrParaSubAba} onBuscar={onBuscarNosDados} />
          </aside>
          <div className="min-w-0 space-y-6">
            <SistemaCard
              numero={numero}
              dataDoc={dataDoc}
              onNumero={setNumero}
              onDataDoc={setDataDoc}
              onCabecalho={aplicarCabecalho}
              telefone={telefone}
              nome={nome}
              placa={placa}
              onTelefone={setTelefone}
              onNome={setNome}
              onPlaca={setPlaca}
              onLimparContato={() => {
                setPlaca('');
                setTelefone('');
                setNome('');
              }}
              onLimparValores={() => {
                setRevAprovadaInput('');
                setRevPecasInput('');
                setAjustesManuais('');
                setDescReparo('');
                setOrcamentoRaw('');
              }}
              onAbrirHistorico={onAbrirHistorico}
              revDesc={revDesc}
              revDados={revDados}
              onRevDesc={setRevDesc}
              onRevDados={setRevDados}
              onExtraido={() => {
                // Extração nova: revisão fresca e campos intactos de novo.
                revNonce.current += 1;
                camposSujos.current = false;
              }}
              onUsarTextos={(desc, dados) => {
                if (desc.trim()) setDescReparo(desc);
                if (dados.trim()) setOrcamentoRaw(dados);
                revNonceUsed.current = revNonce.current;
                camposSujos.current = false;
              }}
            />

            <NeonCard
              title="DADOS DO ORÇAMENTO"
              borderColor="blue-600"
              compact
              actions={<ClearButton onClick={() => setOrcamentoRaw('')}/>}
            >
              {/* Altura medida para terminar junto da DESCRIÇÃO (ver SistemaCard). */}
              <textarea 
                className="w-full h-[216px] campo-tema border border-slate-800 rounded-2xl p-6 text-lg font-mono leading-relaxed focus:border-blue-600 outline-none resize-none overflow-x-auto whitespace-pre scrollbar-hide" 
                value={orcamentoRaw} 
                onChange={(e) => { setOrcamentoRaw(e.target.value); camposSujos.current = true; }} 
                wrap="off" 
              />
            </NeonCard>

          </div>

          {/* Coluna da direita: pilha com largura única. */}
          <div className="min-w-0">
            {/* Pilha com largura única (APROVADO = AJUSTES = RESUMO). */}
            <div className="flex flex-col gap-4 min-w-0 xl:w-[425px]">
            <NeonCard
              title="APROVADO E DESCONTO"
              borderColor="emerald-500"
              compact
              actions={
                <ClearButton
                  onClick={() => {
                    setRevAprovadaInput('');
                    setRevPecasInput('');
                    setAjustesManuais('');
                  }}
                  label="Limpar aprovado e desconto"
                />
              }
            >
              <div className="space-y-2">
                {/* Total Revisão | Peças na Revisão (com vassoura para limpar e
                    formatação automática de milhar/centavos ao colar ou sair) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Total Revisão (R$)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-xl font-black text-white focus:border-emerald-500 outline-none" 
                        value={revAprovadaInput} 
                        onChange={(e) => setRevAprovadaInput(e.target.value)}
                        onPaste={(e) => {
                          const colado = e.clipboardData.getData('text');
                          if (colado) {
                            e.preventDefault();
                            setRevAprovadaInput(formatarValorInput(colado));
                          }
                        }}
                        onBlur={(e) => setRevAprovadaInput(formatarValorInput(e.target.value))}
                        placeholder="0,00"
                      />
                      <button
                        type="button"
                        onClick={() => setRevAprovadaInput('')}
                        aria-label="Limpar Total Revisão"
                        title="Limpar Total Revisão"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Eraser size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Peças na Revisão (R$)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-xl font-black text-white focus:border-emerald-500 outline-none" 
                        value={revPecasInput} 
                        onChange={(e) => setRevPecasInput(e.target.value)}
                        onPaste={(e) => {
                          const colado = e.clipboardData.getData('text');
                          if (colado) {
                            e.preventDefault();
                            setRevPecasInput(formatarValorInput(colado));
                          }
                        }}
                        onBlur={(e) => setRevPecasInput(formatarValorInput(e.target.value))}
                        placeholder="0,00"
                      />
                      <button
                        type="button"
                        onClick={() => setRevPecasInput('')}
                        aria-label="Limpar Peças na Revisão"
                        title="Limpar Peças na Revisão"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Eraser size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desconto em Peças | Parcelas */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Desconto em Peças (%)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-xl font-black text-amber-500 focus:border-amber-500 outline-none" 
                        value={desconto} 
                        onChange={(e) => setDesconto(parseFloat(e.target.value))} 
                      />
                      <Percent size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Parcelas</label>
                    <select className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 text-xl font-black text-white focus:border-blue-500 outline-none appearance-none" value={parcelas} onChange={(e) => setParcelas(parseInt(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => <option key={n} value={n} className="bg-slate-900">{n}x</option>)}
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate} 
                  type="button"
                  aria-label="Processar Tudo"
                  title="Processar Tudo"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl shadow-2xl transition-all flex items-center justify-center active:scale-[0.98] mt-2 cursor-pointer"
                >
                  <Play size={26} fill="currentColor" />
                </button>
              </div>
            </NeonCard>

            {/* Ajustes Manuais abaixo do APROVADO (mesma largura);
                o campo mostra só 3 linhas (rows=3). */}
            <NeonCard title="AJUSTES MANUAIS (ID VALOR)" borderColor="#f59e0b" compact actions={<ClearButton onClick={() => setAjustesManuais('')} />}>
              <textarea 
                rows={2}
                className="w-full campo-tema border border-slate-800 rounded-2xl p-4 text-amber-500 font-mono text-lg focus:border-amber-500 outline-none resize-none" 
                placeholder="Ex: 1 50,00" 
                value={ajustesManuais} 
                onChange={(e) => setAjustesManuais(e.target.value)} 
              />
            </NeonCard>

            {/* RESUMO LÍQUIDO colado abaixo do AJUSTES, em pares. */}
            {visivel && (
              <NeonCard title="RESUMO LÍQUIDO" borderColor="#10b981" compact>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Total Peças</span>
                      <span className="titulo-tema text-2xl font-black text-white">{formatCurrency(visivel.totalPecasGeral)}</span>
                    </div>
                    <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Total Serviços</span>
                      <span className="titulo-tema text-2xl font-black text-white">{formatCurrency(visivel.totalServicosGeral)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-emerald-900/40 text-center">
                      <span className="text-[10px] font-black text-emerald-500 uppercase block mb-0.5">Desc. ({visivel.descontoPercentual}%)</span>
                      <span className="titulo-tema text-2xl font-black text-emerald-400">- {formatCurrency(visivel.valorDescontoTotal)}</span>
                    </div>
                    <div className="px-3 py-2 bg-blue-600/10 rounded-2xl border border-blue-500/30 text-center">
                      <span className="text-[10px] font-black text-blue-400 uppercase block mb-0.5 underline">Valor Líquido</span>
                      <span className="titulo-tema text-2xl font-black text-blue-300">{formatCurrency(visivel.valorLiquidoFinal)}</span>
                    </div>
                  </div>
                </div>
              </NeonCard>
            )}

            <NeonCard
              title="DESCRIÇÃO DO REPARO"
              borderColor="blue-500"
              compact
              actions={<ClearButton onClick={() => setDescReparo('')} />}
            >
              <textarea 
                className="w-full h-56 campo-tema border border-slate-800 rounded-2xl p-6 text-lg font-medium focus:border-blue-500 outline-none resize-none transition-colors scrollbar-hide" 
                value={descReparo} 
                onChange={(e) => { setDescReparo(e.target.value); camposSujos.current = true; }} 
              />
            </NeonCard>
            </div>
          </div>
        </div>

        <div id="result-section" className="mt-14">
          {visivel && (
            <div className="max-w-4xl mx-auto">
              <QuoteTable
                summary={visivel}
                selecionados={selecionados}
                onToggleItem={alternarItem}
                aprovacao={aprovacao}
                onMarcarAprovacao={votarAprovacao}
                telefone={telefone}
              />
            </div>
          )}
        </div>

      <HistoryModal
        aberto={historicoAberto}
        onFechar={onFecharHistorico}
        onAbrir={abrirDoHistorico}
        destaqueId={destaqueHistoricoId}
      />
    </>
  );
};

export default OrcamentosApp;
