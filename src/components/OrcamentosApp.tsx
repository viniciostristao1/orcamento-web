import React, { useEffect, useRef, useState } from 'react';
import { aplicarPrevia, calcularPrevia, construirPrevia, converterBrutoParaLista, converterListaParaBruto, criarPreviaManual, itensParaLista, parseListaItens, previaComOriginal, previaVazia, processQuote, formatCurrency, formatarValorInput, parseBrazilianNumber, recalcularComSelecao, removerItemDefinitivo, type ItemPrevia, type PreviaOrcamento, type ResultadoLista } from '../utils/quoteLogic';
import { temTelefoneValido } from '../utils/telefone';
import { QuoteSummary } from '../types';
import NeonCard from './NeonCard';
import QuoteTable, { type AprovacaoVoto } from './QuoteTable';
import { Play, Percent, Eraser, Plus } from 'lucide-react';
import HistoryModal from './HistoryModal';
import ClearButton from './ClearButton';
import MenuDados from './MenuDados';
import { adicionarAoHistorico, atualizarAprovacaoHistorico, atualizarChassiHistorico, atualizarConteudoHistorico, atualizarPreviaHistorico, listarHistorico, processQuoteDoRegistro, retratoDoResumo, type OrcamentoSalvo } from '../utils/historico';
import SistemaCard from '../sistema/SistemaCard';
import { decidirFontePlay, type CabecalhoOrcamento } from '../sistema/extracao';
import { lerRascunho, salvarRascunho } from '../utils/rascunho';
import { lerUltimoOrcamento, salvarUltimoOrcamento } from '../utils/ultimoOrcamento';
import { lerColapsados, salvarColapsados } from '../utils/colapsados';

/** Exemplo de formato no placeholder (TAB separa nº, descrição e valor). */
const EXEMPLO_LISTA = `1\tFiltro de ar\tR$ 195,90\n2\tLimpeza de bicos\tR$ 725,95\n3\tRetifica discos\tR$ 150,00`;

/** Resumo vivo sob cada campo (conta, soma, ignoradas e inválidas com motivo). */
const ResumoLista: React.FC<{ res: ResultadoLista }> = ({ res }) => {
  if (res.itens.length === 0 && res.invalidas.length === 0) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {res.itens.length} {res.itens.length === 1 ? 'item' : 'itens'} · R$ {formatCurrency(res.soma)}
        {res.ignoradas > 0 && (
          <span className="text-slate-500"> · {res.ignoradas} de cabeçalho ignorada{res.ignoradas === 1 ? '' : 's'}</span>
        )}
      </p>
      {res.invalidas.slice(0, 6).map((p) => (
        <p key={p.linha} className="text-sm font-bold text-red-400">
          Linha {p.linha}: {p.motivo}
        </p>
      ))}
      {res.invalidas.length > 6 && (
        <p className="text-sm font-bold text-red-400">…e mais {res.invalidas.length - 6}</p>
      )}
    </div>
  );
};

interface OrcamentosAppProps {
  historicoAberto: boolean;
  onFecharHistorico: () => void;
  onAbrirHistorico: () => void;
  onIrParaSubAba: (abaId: string) => void;
  onBuscarNosDados: (termo: string, passo: 1 | -1, repor: boolean) => void;
  /** Vindo do clique no aviso: abre o histórico destacando o cartão. */
  destaqueHistoricoId?: string | null;
  /** Vez do destaque (re-clique no mesmo id rola de novo). */
  destaqueHistoricoVez?: number;
}

const OrcamentosApp: React.FC<OrcamentosAppProps> = ({ historicoAberto, onFecharHistorico, onAbrirHistorico, onIrParaSubAba, onBuscarNosDados, destaqueHistoricoId = null, destaqueHistoricoVez = 0 }) => {
  // Último orçamento em edição (localStorage local). Sem rascunho, lista vazia.
  const [rascunho] = useState(lerRascunho);
  const [listaAdicional, setListaAdicional] = useState<string>(() => rascunho?.listaAdicional ?? "");
  // Campo antigo da revisão (v0.218.0): sem estado/UI — só passa pelo
  // rascunho para não perder o dado se ele existir.
  const listaRevisaoAntiga = useRef<string>(rascunho?.listaRevisao ?? '');
  const [ajustesManuais, setAjustesManuais] = useState<string>(() => rascunho?.ajustesManuais ?? "");
  const [desconto, setDesconto] = useState<number>(() => rascunho?.desconto ?? 5);
  const [parcelas, setParcelas] = useState<number>(() => rascunho?.parcelas ?? 6);
  const [placa, setPlaca] = useState<string>(() => rascunho?.placa ?? "");
  const [telefone, setTelefone] = useState<string>(() => rascunho?.telefone ?? "");
  const [nome, setNome] = useState<string>(() => rascunho?.nome ?? "");
  // Chassi do veículo (card do sistema; extraído do PDF/print, editável).
  const [chassi, setChassi] = useState<string>(() => rascunho?.chassi ?? "");
  // Cabeçalho do orçamento do sistema (card 3): nº e data do documento.
  const [numero, setNumero] = useState<string>(() => rascunho?.numero ?? "");
  const [dataDoc, setDataDoc] = useState<string>(() => rascunho?.dataDoc ?? "");
  // Texto em revisão no card do sistema: se os campos estiverem vazios na hora
  // do play, vale o que já foi extraído (sem obrigar o clique em "Usar").
  const [revDesc, setRevDesc] = useState('');
  const [revDados, setRevDados] = useState('');
  // Revisão fresca (extração nova ainda não usada) + listas sujas (edição manual):
  // o gerar prefere a revisão fresca com listas intactas (decidirFontePlay).
  const revNonce = useRef(0);
  const revNonceUsed = useRef(0);
  const listasSujas = useRef(false);
  // Último documento gerado: reabre o app já com o visual do orçamento na tela.
  const [ultimo] = useState(lerUltimoOrcamento);
  const [summary, setSummary] = useState<QuoteSummary | null>(() => ultimo?.summary ?? null);
  const [selecionados, setSelecionados] = useState<Set<number>>(() => new Set(ultimo?.selecionados ?? []));
  // Prévia interativa do documento (edição direta: textos, valores, linhas
  // excluídas/adicionadas, revisão + a versão original do PDF para o voltar).
  const [previa, setPrevia] = useState<PreviaOrcamento | null>(() => ultimo?.previa ?? null);
  // Registro aberto do histórico (id + data + retrato do conteúdo): regerar
  // mudando SÓ o chassi atualiza o registro no lugar (sem mudar a data);
  // qualquer outra mudança segue o fluxo normal (novo registro).
  const registroAbertoRef = useRef<{ id: string; criadoEm: string; base: Omit<OrcamentoSalvo, 'id' | 'criadoEm'> } | null>(null);
  // Registro do histórico referente ao documento em tela + aprovação (V/X).
  const [aprovacao, setAprovacao] = useState<AprovacaoVoto | null>(null);
  // Toasts fora do `ui-compacta` (mesmo padrão do Desfazer dos Dados): linha
  // apagada de vez (com Desfazer ~6s) + aviso rápido do orçamento manual.
  const [avisoRapido, setAvisoRapido] = useState<string | null>(null);
  const [desfazerApagar, setDesfazerApagar] = useState<{ item: ItemPrevia; indice: number; rotulo: string } | null>(null);
  const timerAviso = useRef<number | null>(null);
  const timerDesfazer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timerAviso.current) window.clearTimeout(timerAviso.current);
    if (timerDesfazer.current) window.clearTimeout(timerDesfazer.current);
  }, []);

  // Estados locais para os inputs de texto para permitir digitação livre (como vírgulas e pontos)
  const [revAprovadaInput, setRevAprovadaInput] = useState<string>(() => rascunho?.revAprovadaInput ?? "1766,23");
  const [revPecasInput, setRevPecasInput] = useState<string>(() => rascunho?.revPecasInput ?? "1000,00");
  // Recolhimento das 4 áreas (DESCRIÇÃO, DADOS, AJUSTE, RESUMO): só o cabeçalho
  // aparece; o conteúdo continua no estado (recolher nunca apaga o digitado).
  const [colapsados, setColapsados] = useState(lerColapsados);
  useEffect(() => {
    salvarColapsados(colapsados);
  }, [colapsados]);

  // Salva o rascunho enquanto o usuário edita (reabre com o que estava fazendo).
  useEffect(() => {
    salvarRascunho({ listaAdicional, listaRevisao: listaRevisaoAntiga.current, ajustesManuais, revAprovadaInput, revPecasInput, desconto, parcelas, placa, telefone, numero, dataDoc, nome, chassi });
  }, [listaAdicional, ajustesManuais, revAprovadaInput, revPecasInput, desconto, parcelas, placa, telefone, numero, dataDoc, nome, chassi]);

  // Mantém o último documento gerado salvo (inclusive a marcação dos itens e a prévia).
  useEffect(() => {
    if (summary) salvarUltimoOrcamento({ summary, selecionados: [...selecionados], previa: previa ?? undefined });
  }, [summary, selecionados, previa]);

  // Sem prévia com documento (último antigo): a 1ª geração é a atual.
  useEffect(() => {
    if (summary && !previa) {
      setPrevia(previaComOriginal(construirPrevia(summary.items, summary.revisaoAprovada)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  /** Gera o documento a partir da lista colada (CLAUDE). */
  const gerarDasListas = () => {
    // Fonte (decidirFontePlay): revisão fresca + listas intactas = vale a
    // revisão (convertida para a lista A; anexar o 2º orçamento + gerar dá o
    // 2º sem o "Usar"); edição nas listas vence sempre; vazio dos dois lados
    // = alerta.
    const fonte = decidirFontePlay({
      descCampo: listaAdicional,
      dadosCampo: listaAdicional,
      revDesc,
      revDados,
      camposSujos: listasSujas.current,
      revisaoFresca: revNonce.current !== revNonceUsed.current,
    });
    let textoA = listaAdicional;
    if (fonte.usouRevisao) {
      // Alinha a lista com o que foi somado (a próxima vez vale a lista).
      textoA = converterBrutoParaLista(fonte.desc, fonte.dados);
      setListaAdicional(textoA);
      revNonceUsed.current = revNonce.current;
      listasSujas.current = false;
    } else if (!textoA.trim() && (fonte.desc.trim() || fonte.dados.trim())) {
      // Lista vazia: vale a revisão pendente (convertida para a lista).
      textoA = converterBrutoParaLista(fonte.desc, fonte.dados);
      if (textoA.trim()) setListaAdicional(textoA);
    }
    const resA = parseListaItens(textoA);
    // Nada colado: avisa em vez de sair em silêncio
    // (sem aviso o usuário acha que "não gerou": sem scroll e sem imagem).
    if (resA.itens.length === 0 && resA.invalidas.length === 0) {
      alert(
        'Cole a lista de itens em CLAUDE — ou anexe o PDF/print no card do sistema.',
      );
      return;
    }
    // Linhas com problema não descartam em silêncio: lista e pede confirmação.
    const probs = resA.invalidas.map((p) => `Linha ${p.linha}: ${p.motivo}`);
    if (probs.length > 0) {
      const detalhe = probs.slice(0, 6).join('\n') + (probs.length > 6 ? `\n…e mais ${probs.length - 6}` : '');
      if (!window.confirm(`Linhas com problema:\n${detalhe}\n\nGerar com as ${resA.itens.length} válidas?`)) return;
    }
    // O Total Revisão é só manual (como antes do CLAUDE): a lista não o altera.
    const { desc, dados } = converterListaParaBruto(resA.itens);
    processarComTextos(desc, dados, parseBrazilianNumber(revAprovadaInput), textoA);
  };

  /**
   * Núcleo da geração: soma os textos convertidos (lista nova, verbos
   * mantidos), salva no histórico e mostra o documento. Vale para o GERAR,
   * o Play e a reabertura manual.
   */
  const processarComTextos = (desc: string, dados: string, revAprovNum: number, textoA: string) => {
    // Normaliza o Total Revisão exibido igual ao salvo (anti-duplicado do Nº).
    const revAprovTexto = formatCurrency(revAprovNum);
    if (revAprovTexto !== revAprovadaInput) setRevAprovadaInput(revAprovTexto);
    const finalRevPecas = parseBrazilianNumber(revPecasInput);

    const result = processQuote(desc, dados, revAprovNum, finalRevPecas, desconto, parcelas, ajustesManuais, { manterVerbos: true });

    // Histórico local (localStorage): salva a cada geração.
    const novo: Omit<OrcamentoSalvo, 'id' | 'criadoEm'> = {
      descReparo: desc,
      orcamentoRaw: dados,
      listaAdicional: textoA,
      ajustesManuais,
      revAprovadaInput: formatCurrency(revAprovNum),
      revPecasInput,
      desconto,
      parcelas,
      placa: placa.trim(),
      telefone: telefone.trim(),
      numeroOrcamento: numero.trim(),
      dataDoc: dataDoc.trim(),
      nome: nome.trim(),
      chassi: chassi.trim().toUpperCase(),
      ...retratoDoResumo(result),
    };

    // Regerou o registro aberto mudando SÓ o chassi (ex.: lançou o chassi num
    // orçamento antigo)? Atualiza no lugar, sem mudar a data e sem duplicar.
    const aberto = registroAbertoRef.current;
    const soChassi =
      aberto !== null &&
      (Object.keys(novo) as (keyof typeof novo)[]).every((k) => k === 'chassi' || novo[k] === aberto.base[k]);
    if (soChassi) {
      if ((novo.chassi ?? '') !== (aberto.base.chassi ?? '')) {
        const atualizados = atualizarChassiHistorico(aberto.id, novo.chassi ?? '');
        setAprovacao(atualizados.find((r) => r.id === aberto.id)?.aprovacao ?? null);
        registroAbertoRef.current = { ...aberto, base: { ...novo } };
      } else {
        // Nada mudou: só mostra de novo (sem duplicar, sem tocar na data).
        setAprovacao(listarHistorico().find((r) => r.id === aberto.id)?.aprovacao ?? null);
      }
      // O documento mostra a data/hora do registro (não a de agora) e mantém
      // a marcação de itens atual (não zera os desmarcados). A prévia segue
      // valendo (mesmos textos do PDF) sobre o resultado recalculado.
      if (previa) {
        const sincronizado = aplicarPrevia({ ...result, currentTime: aberto.criadoEm }, previa);
        setSummary(sincronizado);
      } else {
        setSummary({ ...result, currentTime: aberto.criadoEm });
      }
      setTimeout(() => { document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150);
      return;
    }

    // Manual vazio em tela (botão "+"): preenche o registro aberto no lugar,
    // sem duplicar no histórico.
    if (!soChassi && aberto !== null && previa && previaVazia(previa)) {
      const salvos = atualizarConteudoHistorico(aberto.id, novo);
      registroAbertoRef.current = { ...aberto, base: { ...novo } };
      setSummary(result);
      setSelecionados(new Set(result.items.map((i) => i.id)));
      const fresca = previaComOriginal(construirPrevia(result.items, result.revisaoAprovada));
      setPrevia(fresca);
      atualizarPreviaHistorico(aberto.id, fresca, retratoDoResumo(result));
      setAprovacao(salvos.find((r) => r.id === aberto.id)?.aprovacao ?? null);
      setTimeout(() => { document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150);
      return;
    }

    setSummary(result);
    setSelecionados(new Set(result.items.map((i) => i.id))); // começa com todos marcados
    // 1ª geração: a prévia interativa nasce das listas (original guardado p/ voltar).
    const fresca = previaComOriginal(construirPrevia(result.items, result.revisaoAprovada));
    setPrevia(fresca);

    const salvos = adicionarAoHistorico(novo);
    registroAbertoRef.current = { id: salvos[0].id, criadoEm: salvos[0].criadoEm, base: { ...novo } };
    atualizarPreviaHistorico(salvos[0].id, fresca, retratoDoResumo(result));
    // Reprocessou registro já marcado? Mostra a marca de volta.
    setAprovacao(salvos[0].aprovacao ?? null);    
    setTimeout(() => { document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150);
  };

  // Reabre um orçamento do histórico na tela (recalcula a partir dos textos).
  // Zera a revisão pendente: o contexto agora é o registro aberto.
  const abrirDoHistorico = (r: OrcamentoSalvo) => {
    onFecharHistorico();
    const result = processQuoteDoRegistro(r);
    // Prévia salva (edições diretas). Sem ela é registro antigo: monta a
    // partir do recálculo, mas SEM original (voltar desabilitado, sem quebrar).
    const aberta: PreviaOrcamento =
      r.previa ?? { ...construirPrevia(result.items, result.revisaoAprovada), original: null };
    // Listas: as do registro; sem elas (antigo), reconstrói da prévia para
    // continuar editável no formato novo.
    setListaAdicional(r.listaAdicional ?? itensParaLista(aberta.itens.filter((i) => !i.excluido)));
    setAjustesManuais(r.ajustesManuais);
    setRevAprovadaInput(r.revAprovadaInput);
    setRevPecasInput(r.revPecasInput);
    setDesconto(r.desconto);
    setParcelas(r.parcelas);
    setPlaca(r.placa ?? '');
    setTelefone(r.telefone ?? '');
    setNome(r.nome ?? '');
    setChassi(r.chassi ?? '');
    setNumero(r.numeroOrcamento ?? '');
    setDataDoc(r.dataDoc ?? '');
    setAprovacao(r.aprovacao ?? null);
    setRevDesc('');
    setRevDados('');
    revNonceUsed.current = revNonce.current;
    listasSujas.current = false;
    setPrevia(aberta);
    // Foto do conteúdo (para a regeração só-com-chassi não mudar a data).
    registroAbertoRef.current = {
      id: r.id,
      criadoEm: r.criadoEm,
      base: {
        descReparo: r.descReparo,
        orcamentoRaw: r.orcamentoRaw,
        listaAdicional: r.listaAdicional ?? '',
        ajustesManuais: r.ajustesManuais,
        revAprovadaInput: r.revAprovadaInput,
        revPecasInput: r.revPecasInput,
        desconto: r.desconto,
        parcelas: r.parcelas,
        placa: (r.placa ?? '').trim(),
        telefone: (r.telefone ?? '').trim(),
        numeroOrcamento: (r.numeroOrcamento ?? '').trim(),
        dataDoc: (r.dataDoc ?? '').trim(),
        nome: (r.nome ?? '').trim(),
        chassi: (r.chassi ?? '').trim().toUpperCase(),
        ...retratoDoResumo(result),
      },
    };
    // O documento mostra a data/hora de quando o orçamento foi criado
    // (a do histórico), não a de agora — a prévia editada vale sobre ele.
    const comData = { ...result, currentTime: r.criadoEm };
    setSummary(aplicarPrevia(comData, aberta));
    // Restaura a marcação salva (registros da aba "Não Realizados"); linhas
    // excluídas na prévia ficam fora da marcação.
    const excluidos = new Set(aberta.itens.filter((i) => i.excluido).map((i) => i.id));
    const desmarcados = new Set(r.naoRealizados ?? []);
    setSelecionados(
      new Set(
        aplicarPrevia(comData, aberta).items
          .map((i) => i.id)
          .filter((id) => !desmarcados.has(id) && !excluidos.has(id)),
      ),
    );
    setTimeout(() => { document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150);
  };

  // V/P/X do documento (sempre salvam): V aprova com a marcação atual (tudo feito
  // = Aprovados; algum desmarcado = Parcial); P marca parcial com os itens como
  // estão; X risca tudo, marca não aprovado e salva. Clicar no mesmo limpa a
  // marca (salvando também).
  // V com NADA marcado aprova tudo (degenerado "zero aprovados" ia para Não
  // Aprovados sem Parcial — igual ao V inline do histórico).
  const votarAprovacao = (v: AprovacaoVoto | undefined) => {
    if (!visivel || !summary) return;
    const nadaMarcado = v === 'aprovado' && selecionados.size === 0 && visivel.items.length > 0;
    const sel = nadaMarcado ? new Set(visivel.items.map((i) => i.id)) : selecionados;
    if (nadaMarcado) setSelecionados(sel);
    const desmarcados =
      v === 'naoAprovado'
        ? visivel.items.map((i) => i.id)
        : visivel.items.filter((i) => !sel.has(i.id)).map((i) => i.id);
    if (v === 'naoAprovado') setSelecionados(new Set());
    setAprovacao(v ?? null);
    const base = recalcularComSelecao(
      summary,
      v === 'naoAprovado' ? new Set<number>() : sel,
    );
    // Textos convertidos das listas atuais (o voto regrava o registro).
    const convertidos = converterListaParaBruto(parseListaItens(listaAdicional).itens);
    const salvos = adicionarAoHistorico({
      descReparo: convertidos.desc,
      orcamentoRaw: convertidos.dados,
      listaAdicional,
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
      chassi: chassi.trim().toUpperCase(),
      naoRealizados: desmarcados,
      ...retratoDoResumo(base),
    });
    atualizarAprovacaoHistorico(salvos[0].id, v);
    // O voto também carrega a prévia atual (edições não se perdem no V/X).
    if (previa) {
      atualizarPreviaHistorico(salvos[0].id, previa, retratoDoResumo(base));
    }
  };

  // Marca/desmarca um item: os totais refletem só os marcados.
  const alternarItem = (id: number) => {
    const s = new Set(selecionados);
    if (s.has(id)) {
      s.delete(id);
    } else {
      s.add(id);
    }
    if (previa && summary) {
      persistirPrevia(previa, summary, s);
    } else {
      setSelecionados(s);
    }
  };

  /**
   * Grava uma edição da prévia: atualiza o estado, sincroniza o resumo (para o
   * RESUMO LÍQUIDO, o relatório e o V/X continuarem coerentes) e salva no
   * histórico SÓ o registro desse orçamento (id/data intactos + retrato novo).
   */
  const persistirPrevia = (
    nova: PreviaOrcamento,
    baseSummary: QuoteSummary,
    sel: Set<number>,
  ) => {
    const sincronizado = aplicarPrevia(baseSummary, nova);
    const calc = calcularPrevia(nova, sel);
    const retrato = {
      ...retratoDoResumo(recalcularComSelecao(sincronizado, sel)),
      totalGeral: calc.totalGeralPrevia,
      numItens: nova.itens.filter((i) => !i.excluido).length,
    };
    setPrevia(nova);
    setSummary(sincronizado);
    setSelecionados(sel);
    const id = registroAbertoRef.current?.id;
    if (id) atualizarPreviaHistorico(id, nova, retrato);
  };

  /** Edição direta na prévia (descrição, valor ou revisão): salva na hora. */
  const editarPrevia = (fn: (p: PreviaOrcamento) => PreviaOrcamento) => {
    if (!previa || !summary) return;
    const nova: PreviaOrcamento = {
      ...previa,
      itens: previa.itens.map((i) => ({ ...i })),
      original: previa.original,
    };
    persistirPrevia(fn(nova), summary, selecionados);
  };

  const editarDescricaoPrevia = (id: number, descricao: string) => {
    editarPrevia((p) => {
      const item = p.itens.find((i) => i.id === id);
      if (item) item.descricao = descricao;
      return p;
    });
  };

  const editarValorPrevia = (id: number, valor: number) => {
    editarPrevia((p) => {
      const item = p.itens.find((i) => i.id === id);
      if (item) item.valor = valor;
      return p;
    });
  };

  const editarRevisaoPrevia = (valor: number) => {
    editarPrevia((p) => ({ ...p, revisaoAprovada: valor }));
  };

  const excluirLinhaPrevia = (id: number) => {
    if (!previa || !summary) return;
    const nova: PreviaOrcamento = {
      ...previa,
      itens: previa.itens.map((i) => (i.id === id ? { ...i, excluido: true } : { ...i })),
      original: previa.original,
    };
    const sel = new Set(selecionados);
    sel.delete(id);
    persistirPrevia(nova, summary, sel);
  };

  const restaurarLinhaPrevia = (id: number) => {
    if (!previa || !summary) return;
    const nova: PreviaOrcamento = {
      ...previa,
      itens: previa.itens.map((i) => (i.id === id ? { ...i, excluido: false } : { ...i })),
      original: previa.original,
    };
    const sel = new Set(selecionados);
    sel.add(id);
    persistirPrevia(nova, summary, sel);
  };

  /** Segundo ×: apaga a linha DE VEZ (fora do array), com Desfazer ~6s. */
  const apagarLinhaDefinitiva = (id: number) => {
    if (!previa || !summary) return;
    const indice = previa.itens.findIndex((i) => i.id === id);
    if (indice < 0) return;
    const item = previa.itens[indice];
    const rotulo = item.descricao.trim() ? `Linha "${item.descricao.trim().toUpperCase()}"` : `Linha ${indice + 1}`;
    const nova: PreviaOrcamento = { ...removerItemDefinitivo(previa, id), original: previa.original };
    const sel = new Set(selecionados);
    sel.delete(id);
    persistirPrevia(nova, summary, sel);
    // Desfazer reinsere na posição original como excluída (volta ao "–").
    if (timerDesfazer.current) window.clearTimeout(timerDesfazer.current);
    setDesfazerApagar({ item: { ...item }, indice, rotulo });
    timerDesfazer.current = window.setTimeout(() => setDesfazerApagar(null), 6000);
  };

  const desfazerApagarLinha = () => {
    if (!desfazerApagar || !previa || !summary) return;
    const { item, indice } = desfazerApagar;
    const itens = previa.itens.map((i) => ({ ...i }));
    itens.splice(Math.min(indice, itens.length), 0, { ...item, excluido: true });
    const nova: PreviaOrcamento = { ...previa, itens, original: previa.original };
    const sel = new Set(selecionados);
    sel.delete(item.id);
    persistirPrevia(nova, summary, sel);
    if (timerDesfazer.current) window.clearTimeout(timerDesfazer.current);
    setDesfazerApagar(null);
  };

  /** Botão "+": abre um orçamento manual limpo (só o item 1, vazio). */
  const novoOrcamentoManual = () => {
    // Tudo já está salvo (histórico + último + rascunho): abre direto. Só
    // avisa quando havia documento com conteúdo em tela; vazio não avisa.
    if (previa && !previaVazia(previa)) {
      if (timerAviso.current) window.clearTimeout(timerAviso.current);
      setAvisoRapido('Orçamento anterior salvo no histórico');
      timerAviso.current = window.setTimeout(() => setAvisoRapido(null), 3500);
    }
    const fresca = previaComOriginal(criarPreviaManual());
    const agora = new Date().toLocaleString('pt-BR');
    const doc: QuoteSummary = {
      items: [{ id: 1, description: '', pecasValue: 0, servicosValue: 0, value: 0 }],
      totalOrcamento: 0,
      revisaoAprovada: 0,
      totalGeral: 0,
      numParcelas: 6,
      valorParcela: 0,
      currentTime: agora,
      totalPecasGeral: 0,
      totalServicosGeral: 0,
      valorDescontoTotal: 0,
      valorLiquidoFinal: 0,
      descontoPercentual: 5,
    };
    // Contato zerado (nome/telefone digitados vão ao doc/histórico, não ao PNG).
    setDesconto(5);
    setParcelas(6);
    setRevAprovadaInput('0,00');
    setRevPecasInput('0,00');
    setListaAdicional('');
    setNumero('');
    setDataDoc('');
    setPlaca('');
    setNome('');
    setChassi('');
    setTelefone('');
    setAprovacao(null);
    setSummary(doc);
    setSelecionados(new Set([1]));
    setPrevia(fresca);
    // Registro próprio no histórico (sempre novo, mesmo vazio) + prévia.
    const novo: Omit<OrcamentoSalvo, 'id' | 'criadoEm'> = {
      descReparo: '',
      orcamentoRaw: '',
      listaAdicional: '',
      ajustesManuais: '',
      revAprovadaInput: '0,00',
      revPecasInput: '0,00',
      desconto: 5,
      parcelas: 6,
      placa: '',
      telefone: '',
      numeroOrcamento: '',
      dataDoc: '',
      nome: '',
      chassi: '',
      manual: true,
      ...retratoDoResumo(doc),
    };
    const salvos = adicionarAoHistorico(novo, true);
    registroAbertoRef.current = { id: salvos[0].id, criadoEm: salvos[0].criadoEm, base: { ...novo } };
    atualizarPreviaHistorico(salvos[0].id, fresca, retratoDoResumo(doc));
    setTimeout(() => { document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' }); }, 150);
  };

  const adicionarLinhaPrevia = () => {
    if (!previa || !summary) return;
    const proximoId = previa.itens.reduce((m, i) => Math.max(m, i.id), 0) + 1;
    const nova: PreviaOrcamento = {
      ...previa,
      itens: [...previa.itens.map((i) => ({ ...i })), { id: proximoId, descricao: '', valor: 0, excluido: false }],
      original: previa.original,
    };
    const sel = new Set(selecionados);
    sel.add(proximoId);
    persistirPrevia(nova, summary, sel);
  };

  /** Volta à 1ª versão gerada do PDF (textos, valores, linhas, caixinhas, revisão). */
  const voltarOriginalPrevia = () => {
    if (!previa?.original || !summary) return;
    if (!window.confirm('Desfazer todas as edições manuais desse orçamento e voltar à versão gerada do PDF?')) return;
    const orig = previa.original;
    const ids = new Set(orig.itens.map((i) => i.id));
    const nova: PreviaOrcamento = {
      itens: orig.itens.map((i) => ({ ...i })),
      revisaoAprovada: orig.revisaoAprovada,
      original: previa.original,
    };
    // Linhas adicionadas pelo "+" saem junto (não existiam no PDF).
    const sincronizado = {
      ...aplicarPrevia(summary, nova),
      items: aplicarPrevia(summary, nova).items.filter((i) => ids.has(i.id)),
    };
    const sel = new Set(orig.itens.map((i) => i.id));
    persistirPrevia(nova, sincronizado, sel);
  };

  const visivel = summary ? recalcularComSelecao(summary, selecionados) : null;
  // Resumo vivo do campo (conta, soma, inválidas) — parse puro, barato.
  const resumoA = parseListaItens(listaAdicional);

  // Cabeçalho extraído do PDF/print: nº e data preenchem os próprios campos;
  // PLACA, NOME, CHASSI e TELEFONE são escritos/sobrescritos (só quando veio conteúdo).
  const aplicarCabecalho = (c: CabecalhoOrcamento) => {
    if (c.numero.trim()) setNumero(c.numero.trim());
    if (c.data.trim()) setDataDoc(c.data.trim());
    if (c.placa.trim()) setPlaca(c.placa.trim());
    if (c.nome.trim()) setNome(c.nome.trim());
    if (c.chassi.trim()) setChassi(c.chassi.trim().toUpperCase());
    if (c.telefone.trim()) setTelefone(c.telefone.trim());
  };

  return (
    <>
      <div id="grade-orcamentos" className="grid grid-cols-1 xl:grid-cols-[210px_minmax(0,1fr)_526px] gap-8">
          {/* MENU DADOS: lateral esquerda, fixo no topo ao rolar. */}
          <aside className="min-w-0 xl:sticky xl:top-24 self-start print:hidden ui-compacta">
            <MenuDados onIr={onIrParaSubAba} onBuscar={onBuscarNosDados} />
          </aside>
          <div className="min-w-0 space-y-6 print:hidden ui-compacta">
            {/* CLAUDE no topo da coluna (acima do sistema). */}
            <NeonCard
              title="CLAUDE"
              borderColor="blue-600"
              compact
              collapsible
              defaultOpen={true}
              actions={<ClearButton onClick={() => { setListaAdicional(''); }} label="Limpar lista" />}
            >
              <div className="space-y-4">
                {/* WhatsApp do cliente: campo do próprio card (mesmo estado,
                    validação e botão da fileira; não sai no PNG). A borracha
                    do card limpa só a lista — o telefone fica. */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">WhatsApp do cliente</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Cole o número: 51 99999-9999"
                    maxLength={20}
                    aria-label="Telefone do cliente (WhatsApp)"
                    className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 text-xl font-black text-white focus:border-emerald-500 outline-none"
                  />
                  {telefone.trim() !== '' && !temTelefoneValido(telefone) && (
                    <p className="text-sm font-bold text-red-400">
                      Telefone incompleto — use DDD + número (ex.: 51 99999-9999).
                    </p>
                  )}
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Não sai no PNG · vale para o botão do WhatsApp
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Itens do adicional (nº ⇥ descrição ⇥ valor)</label>
                  <textarea
                    aria-label="Itens do adicional"
                    className="w-full h-[216px] campo-tema border border-slate-800 rounded-2xl p-6 text-lg font-mono leading-relaxed focus:border-blue-600 outline-none resize-none overflow-x-auto whitespace-pre scrollbar-hide"
                    value={listaAdicional}
                    onChange={(e) => { setListaAdicional(e.target.value); listasSujas.current = true; }}
                    placeholder={EXEMPLO_LISTA}
                    wrap="off"
                  />
                  <ResumoLista res={resumoA} />
                </div>
                <button
                  onClick={gerarDasListas}
                  type="button"
                  aria-label="Gerar orçamento"
                  title="Gerar orçamento da lista"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl shadow-2xl transition-all flex items-center justify-center active:scale-[0.98] cursor-pointer"
                >
                  GERAR ORÇAMENTO
                </button>
              </div>
            </NeonCard>

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
              chassi={chassi}
              onChassi={setChassi}
              onLimparContato={() => {
                setPlaca('');
                setTelefone('');
                setNome('');
                setChassi('');
              }}
              onLimparValores={() => {
                setRevAprovadaInput('');
                setRevPecasInput('');
                setAjustesManuais('');
                setListaAdicional('');
              }}
              onAbrirHistorico={onAbrirHistorico}
              revDesc={revDesc}
              revDados={revDados}
              onRevDesc={setRevDesc}
              onRevDados={setRevDados}
              onRevisaoInicial={(v) => setRevAprovadaInput(formatarValorInput(v))}
              onExtraido={() => {
                // Extração nova: revisão fresca e listas intactas de novo.
                revNonce.current += 1;
                listasSujas.current = false;
              }}
              onUsarLista={(lista) => {
                if (lista.trim()) setListaAdicional(lista);
                revNonceUsed.current = revNonce.current;
                listasSujas.current = false;
              }}
              descRecolhido={colapsados.descricao}
              dadosRecolhido={colapsados.dados}
              onAlternarDesc={() => setColapsados((c) => ({ ...c, descricao: !c.descricao }))}
              onAlternarDados={() => setColapsados((c) => ({ ...c, dados: !c.dados }))}
            />

          </div>

          {/* Coluna da direita: pilha com largura única. */}
          <div className="min-w-0">
            {/* Pilha com largura única (APROVADO = AJUSTES = RESUMO). */}
            <div className="flex flex-col gap-4 min-w-0 xl:w-[526px]">
            {/* Saída (botões + prévia) no topo da coluna direita. O id mantém
                o scroll pós-gerar e as regras de impressão. */}
            <div id="result-section" className="min-w-0">
              {!visivel && (
                // Sem documento em tela (perfil novo): atalho para o manual limpo.
                // Só tela (print:hidden) — nunca entra no PNG.
                <div className="w-full flex flex-col items-center gap-3 py-10 print:hidden">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                    Nenhum orçamento em tela — processe um ou comece um manual
                  </p>
                  <button
                    type="button"
                    onClick={novoOrcamentoManual}
                    aria-label="Novo orçamento manual"
                    title="Novo orçamento manual (limpo, só com o item 1)"
                    className="flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white p-4 rounded-xl transition-all shadow-lg active:scale-95 group cursor-pointer"
                  >
                    <Plus size={24} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              )}
              {visivel && (
                <div className="w-full">
                  <QuoteTable
                    summary={visivel}
                    previa={previa}
                    numParcelas={parcelas}
                    selecionados={selecionados}
                    onToggleItem={alternarItem}
                    onEditarDescricao={editarDescricaoPrevia}
                    onEditarValor={editarValorPrevia}
                    onEditarRevisao={editarRevisaoPrevia}
                    onExcluirItem={excluirLinhaPrevia}
                    onRestaurarItem={restaurarLinhaPrevia}
                    onApagarItem={apagarLinhaDefinitiva}
                    onAdicionarItem={adicionarLinhaPrevia}
                    onVoltarOriginal={voltarOriginalPrevia}
                    onNovoManual={novoOrcamentoManual}
                    aprovacao={aprovacao}
                    onMarcarAprovacao={votarAprovacao}
                    telefone={telefone}
                    nomeCliente={nome}
                  />
                </div>
              )}
            </div>

            {/* Demais cards da pilha (fora da impressão e do zoom da prévia). */}
            <div className="flex flex-col gap-4 min-w-0 print:hidden ui-compacta">
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
                    <select aria-label="Parcelas" className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 text-xl font-black text-white focus:border-blue-500 outline-none appearance-none" value={parcelas} onChange={(e) => setParcelas(parseInt(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(n => <option key={n} value={n} className="bg-slate-900">{n}x</option>)}
                    </select>
                  </div>
                </div>

                <button
                  onClick={gerarDasListas}
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
            <NeonCard
              title="AJUSTE (ID VALOR)"
              borderColor="#f59e0b"
              compact
              collapsible
              aberto={!colapsados.ajuste}
              onAlternar={() => setColapsados((c) => ({ ...c, ajuste: !c.ajuste }))}
              actions={<ClearButton onClick={() => setAjustesManuais('')} />}
            >
              <textarea
                rows={2}
                aria-label="Ajuste manual"
                className="w-full campo-tema border border-slate-800 rounded-2xl p-4 text-amber-500 font-mono text-lg focus:border-amber-500 outline-none resize-none"
                placeholder="Ex: 1 50,00"
                value={ajustesManuais}
                onChange={(e) => setAjustesManuais(e.target.value)}
              />
            </NeonCard>

            {/* RESUMO LÍQUIDO colado abaixo do AJUSTES, em pares. */}
            {visivel && (
              <NeonCard
                title="RESUMO LÍQUIDO"
                borderColor="#10b981"
                compact
                collapsible
                aberto={!colapsados.resumo}
                onAlternar={() => setColapsados((c) => ({ ...c, resumo: !c.resumo }))}
              >
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Total Peças</span>
                      <span className="titulo-tema text-xl font-black text-slate-100">{formatCurrency(visivel.totalPecasGeral)}</span>
                    </div>
                    <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Total Serviços</span>
                      <span className="titulo-tema text-xl font-black text-slate-100">{formatCurrency(visivel.totalServicosGeral)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-emerald-900/40 text-center">
                      <span className="text-[10px] font-black text-emerald-500 uppercase block mb-0.5">Desc. ({visivel.descontoPercentual}%)</span>
                      <span className="titulo-tema text-xl font-black text-emerald-400">- {formatCurrency(visivel.valorDescontoTotal)}</span>
                    </div>
                    <div className="px-3 py-2 bg-blue-600/10 rounded-2xl border border-blue-500/30 text-center">
                      <span className="text-[10px] font-black text-blue-400 uppercase block mb-0.5 underline">Valor Líquido</span>
                      <span className="titulo-tema text-xl font-black text-blue-400">{formatCurrency(visivel.valorLiquidoFinal)}</span>
                    </div>
                  </div>
                </div>
              </NeonCard>
            )}
            </div>

            </div>
          </div>
        </div>

      <HistoryModal
        aberto={historicoAberto}
        onFechar={onFecharHistorico}
        onAbrir={abrirDoHistorico}
        destaqueId={destaqueHistoricoId}
        destaqueVez={destaqueHistoricoVez}
      />

      {/* Toasts fora do `ui-compacta` (zoom não encolhe o fixo). */}
      {desfazerApagar && (
        <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[200] flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3 shadow-2xl max-w-[92vw]">
          <span className="text-sm font-bold text-slate-200 truncate">
            {desfazerApagar.rotulo} apagada
          </span>
          <button
            type="button"
            onClick={desfazerApagarLinha}
            className="shrink-0 text-sm font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Desfazer
          </button>
        </div>
      )}
      {avisoRapido && (
        <div className="fixed left-1/2 bottom-20 -translate-x-1/2 z-[200] flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3 shadow-2xl max-w-[92vw]">
          <span className="text-sm font-bold text-slate-200 truncate">
            {avisoRapido}
          </span>
        </div>
      )}
    </>
  );
};

export default OrcamentosApp;
