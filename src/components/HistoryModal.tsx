import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, Database, FileSpreadsheet, FolderOpen, List, Trash2, Upload, X, XCircle } from 'lucide-react';
import {
  type AbaHistorico,
  type OrcamentoSalvo,
  atualizarAprovacaoHistorico,
  atualizarCorHistorico,
  atualizarLembreteHistorico,
  atualizarNaoRealizadosHistorico,
  baixarBackup,
  destacarTermo,
  filtrarHistorico,
  filtrarPorAba,
  importarBackup,
  limparHistorico,
  listarHistorico,
  removerDoHistorico,
  retratoDoResumo,
  temNaoRealizados,
  temParcial,
} from '../utils/historico';
import { dataDoRegistro, formatarLembrete } from '../utils/lembretes';
import { filtrarPorCor, type CorCliente, type FiltroCor } from '../utils/corCliente';
import { MarcadorCor, SeloCor, classeBordaCor } from './CorCliente';
import { BotaoRelogio, EditorLembrete } from './LembreteRelogio';
import { formatCurrency, parseBrazilianNumber, processQuote, recalcularComSelecao, resumoAprovacao } from '../utils/quoteLogic';
import BotaoWhats from './BotaoWhats';
import HistoricoBase from './HistoricoBase';
import RelatorioModal from './RelatorioModal';

interface HistoryModalProps {
  aberto: boolean;
  onFechar: () => void;
  onAbrir: (rec: OrcamentoSalvo) => void;
  /** Vindo do clique no aviso: destaca o cartão e rola até ele. */
  destaqueId?: string | null;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ aberto, onFechar, onAbrir, destaqueId = null }) => {
  const [lista, setLista] = useState<OrcamentoSalvo[]>([]);
  const [msg, setMsg] = useState('');
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<AbaHistorico>('todos');
  const [filtroCor, setFiltroCor] = useState<FiltroCor>('todas');
  // Registro com o editor de lembrete aberto (data/hora).
  const [lembreteDe, setLembreteDe] = useState<string | null>(null);
  // Janela do relatório para Excel.
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  // Registro com a janelinha de itens aberta (descrição do reparo, linha a linha).
  const [itensDe, setItensDe] = useState<OrcamentoSalvo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setLista(listarHistorico());
      setMsg('');
      setBuscaAberta(false);
      setBusca('');
      setAba('todos');
      setFiltroCor('todas');
      setLembreteDe(null);
      setRelatorioAberto(false);
      setItensDe(null);
    }
  }, [aberto]);

  // Destaque vindo do aviso: rola até o cartão e o acende em âmbar.
  useEffect(() => {
    if (!aberto || !destaqueId) return;
    const t = window.setTimeout(() => {
      document
        .querySelector(`[data-hist-id="${destaqueId}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [aberto, destaqueId]);

  // Valores do registro aberto em "Ver itens" + resumo de aprovação (o
  // orçamento é recalculado a partir dos textos salvos, como ao abrir).
  const resumoItens = useMemo(() => {
    if (!itensDe) return null;
    const summary = processQuote(
      itensDe.descReparo,
      itensDe.orcamentoRaw,
      parseBrazilianNumber(itensDe.revAprovadaInput),
      parseBrazilianNumber(itensDe.revPecasInput),
      itensDe.desconto,
      itensDe.parcelas,
      itensDe.ajustesManuais,
    );
    return resumoAprovacao(summary, itensDe.naoRealizados);
  }, [itensDe]);

  if (!aberto) return null;

  // As contagens das abas seguem a pesquisa e o filtro de cor (não a lista inteira).
  const porCor = filtrarPorCor(filtrarHistorico(lista, busca), filtroCor);
  const porAba = {
    todos: porCor,
    aprovados: filtrarPorAba(porCor, 'aprovados'),
    naoAprovados: filtrarPorAba(porCor, 'naoAprovados'),
  };
  const visiveis = porAba[aba];
  // Contagem das cores segue a pesquisa (sem o filtro de cor, para dar para comparar).
  const baseBusca = filtrarHistorico(lista, busca);
  const nVerdes = baseBusca.filter((r) => r.cor === 'verde').length;
  const nVermelhos = baseBusca.filter((r) => r.cor === 'vermelho').length;
  // O registro aberto em "Ver itens" tem seleção salva (aprovados/não aprovados)?
  const temSelecao = (itensDe?.naoRealizados?.length ?? 0) > 0;

  const handleRestaurar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = await importarBackup(file);
      setLista(listarHistorico());
      setMsg(`${n} orçamento(s) restaurado(s).`);
    } catch {
      setMsg('Não consegui ler esse arquivo de backup.');
    } finally {
      e.target.value = '';
    }
  };

  const handleLimpar = () => {
    if (!window.confirm('Apagar TODO o histórico de orçamentos? (faça um backup antes, se quiser guardar)')) return;
    limparHistorico();
    setLista([]);
    setMsg('Histórico apagado.');
  };

  // Excluir um orçamento pede confirmação (vale nas duas abas: a lista é a mesma).
  const handleExcluir = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) return;
    setLista(removerDoHistorico(id));
  };

  // Marca/desmarca a cor do cliente (salva na hora; a janelinha de itens
  // acompanha se for o registro aberto nela).
  const handleMudarCor = (id: string, cor: CorCliente | undefined) => {
    setLista(atualizarCorHistorico(id, cor));
    setItensDe((atual) => (atual && atual.id === id ? { ...atual, cor } : atual));
  };

  // Agenda/limpa o lembrete do registro (salva na hora; avisa o popup global).
  // Sem observação, mantém a atual (a nota sobrevive ao concluir/limpar).
  const handleLembrete = (id: string, iso: string | null, observacao?: string) => {
    setLista(atualizarLembreteHistorico(id, iso, observacao));
    setLembreteDe(null);
  };

  // V/X direto no cartão (sem "Abrir orçamento"): V aprova TUDO (limpa os
  // desmarcados e vai para Aprovados); X reprova TUDO (risca todos e vai para
  // Não Aprovados). Clicar no ativo desmarca (V puro volta ao comum; X cheio
  // volta ao comum; com parcial, limpa só a marca e preserva os itens).
  // Só troca `aprovacao`/`naoRealizados` (+ totais) — `id`, `criadoEm` e
  // `dataDoc` ficam intactos (não muda a data).
  const handleVotarInline = (rec: OrcamentoSalvo, voto: 'aprovado' | 'naoAprovado') => {
    const atual = rec.aprovacao;
    const len = rec.naoRealizados?.length ?? 0;
    // Tudo desmarcado (X cheio ou V degenerado): sem parcial estrita.
    const cheio = len > 0 && !temParcial(rec);
    const sincronizarItens = (patch: Partial<OrcamentoSalvo>) =>
      setItensDe((atualRec) => (atualRec && atualRec.id === rec.id ? { ...atualRec, ...patch } : atualRec));
    const resumoDoRec = () =>
      processQuote(
        rec.descReparo,
        rec.orcamentoRaw,
        parseBrazilianNumber(rec.revAprovadaInput),
        parseBrazilianNumber(rec.revPecasInput),
        rec.desconto,
        rec.parcelas,
        rec.ajustesManuais,
      );

    if (voto === 'aprovado') {
      if (atual === 'aprovado' && !cheio) {
        // Desmarca: limpa só a marca, preserva os itens.
        setLista(atualizarAprovacaoHistorico(rec.id, undefined));
        sincronizarItens({ aprovacao: undefined });
        return;
      }
      // Aprova tudo (vale também para V+cheio degenerado): zero desmarcados.
      try {
        const summary = resumoDoRec();
        const totais = retratoDoResumo(recalcularComSelecao(summary, new Set(summary.items.map((i) => i.id))));
        atualizarAprovacaoHistorico(rec.id, 'aprovado');
        setLista(atualizarNaoRealizadosHistorico(rec.id, [], totais));
        sincronizarItens({ aprovacao: 'aprovado', naoRealizados: [] });
      } catch {
        atualizarAprovacaoHistorico(rec.id, 'aprovado');
        setLista(atualizarNaoRealizadosHistorico(rec.id, []));
        sincronizarItens({ aprovacao: 'aprovado', naoRealizados: [] });
      }
      return;
    }

    // voto === 'naoAprovado'
    if (atual === 'naoAprovado' && cheio) {
      // X cheio → desmarca tudo: volta ao comum (sem marca, sem desmarcados).
      try {
        const summary = resumoDoRec();
        const totais = retratoDoResumo(recalcularComSelecao(summary, new Set(summary.items.map((i) => i.id))));
        atualizarAprovacaoHistorico(rec.id, undefined);
        setLista(atualizarNaoRealizadosHistorico(rec.id, [], totais));
        sincronizarItens({ aprovacao: undefined, naoRealizados: [] });
      } catch {
        atualizarAprovacaoHistorico(rec.id, undefined);
        setLista(atualizarNaoRealizadosHistorico(rec.id, []));
        sincronizarItens({ aprovacao: undefined, naoRealizados: [] });
      }
      return;
    }
    if (atual === 'naoAprovado') {
      // X ativo mas não cheio: limpa só a marca, preserva os itens.
      setLista(atualizarAprovacaoHistorico(rec.id, undefined));
      sincronizarItens({ aprovacao: undefined });
      return;
    }
    // Reprova tudo: X + todos os itens desmarcados.
    try {
      const summary = resumoDoRec();
      const todosIds = summary.items.map((i) => i.id);
      const totais = retratoDoResumo(recalcularComSelecao(summary, new Set<number>()));
      atualizarAprovacaoHistorico(rec.id, 'naoAprovado');
      setLista(atualizarNaoRealizadosHistorico(rec.id, todosIds, totais));
      sincronizarItens({ aprovacao: 'naoAprovado', naoRealizados: todosIds });
    } catch {
      // Sem recalcular: marca o X preservando a lista (não muda a data).
      setLista(atualizarAprovacaoHistorico(rec.id, 'naoAprovado'));
      sincronizarItens({ aprovacao: 'naoAprovado' });
    }
  };

  // (Des)marca um item como não aprovado direto na janelinha de itens
  // (vira parcial): salva `naoRealizados` + totais, sem mudar a data.
  const handleToggleItemInline = (rec: OrcamentoSalvo, itemId: number) => {
    const atuais = new Set(rec.naoRealizados ?? []);
    if (atuais.has(itemId)) atuais.delete(itemId);
    else atuais.add(itemId);
    const novaLista = [...atuais];
    try {
      const summary = processQuote(
        rec.descReparo,
        rec.orcamentoRaw,
        parseBrazilianNumber(rec.revAprovadaInput),
        parseBrazilianNumber(rec.revPecasInput),
        rec.desconto,
        rec.parcelas,
        rec.ajustesManuais,
      );
      const selecionados = new Set(summary.items.map((i) => i.id).filter((id) => !atuais.has(id)));
      const base = recalcularComSelecao(summary, selecionados);
      setLista(atualizarNaoRealizadosHistorico(rec.id, novaLista, retratoDoResumo(base)));
    } catch {
      setLista(atualizarNaoRealizadosHistorico(rec.id, novaLista));
    }
    setItensDe((atualRec) => (atualRec && atualRec.id === rec.id ? { ...atualRec, naoRealizados: novaLista } : atualRec));
  };

  return (
    <>
      <HistoricoBase
        titulo="HISTÓRICO"
        onFechar={onFechar}
        acoesExtras={
          <>
            <button
              type="button"
              onClick={() => baixarBackup()}
              disabled={lista.length === 0}
              aria-label="Backup (JSON)"
              title="Backup (JSON)"
              className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
            >
              <Database size={18} />
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Restaurar backup"
              title="Restaurar backup"
              className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
            >
              <Upload size={18} />
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleRestaurar} />
            <button
              type="button"
              onClick={() => setRelatorioAberto(true)}
              disabled={lista.length === 0}
              aria-label="Relatório para Excel"
              title="Relatório para Excel (aprovados e não aprovados)"
              className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
            >
              <FileSpreadsheet size={18} />
            </button>
          </>
        }
        onLimpar={handleLimpar}
        podeLimpar={lista.length > 0}
        buscaAberta={buscaAberta}
        onAlternarBusca={() => {
          setBuscaAberta((v) => !v);
          setBusca('');
        }}
        tituloBusca="Pesquisar"
        busca={busca}
        onBusca={setBusca}
        placeholderBusca="Pesquisar por data, placa, telefone, nº, cor ou item… (ex.: 24/09, ABC1D23, 4471, freio)"
        totalVisiveis={visiveis.length}
        totalLista={lista.length}
        faixaExtras={
          <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/60">
            {([
              { id: 'todos' as AbaHistorico, rotulo: `Todos (${porAba.todos.length})` },
              { id: 'aprovados' as AbaHistorico, rotulo: `Aprovados (${porAba.aprovados.length})` },
              { id: 'naoAprovados' as AbaHistorico, rotulo: `Não Aprovados (${porAba.naoAprovados.length})` },
            ]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setAba(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer active:scale-95 ${
                  aba === t.id
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {t.rotulo}
              </button>
            ))}
          </div>
        }
        filtroCor={filtroCor}
        verdes={nVerdes}
        vermelhos={nVermelhos}
        onFiltroCor={setFiltroCor}
        msg={msg || undefined}
        vazioLista="Nenhum orçamento salvo ainda."
        vazioFiltro={
          filtroCor === 'verde'
            ? 'Nenhum cliente verde.'
            : filtroCor === 'vermelho'
              ? 'Nenhum cliente vermelho.'
              : aba === 'aprovados'
                ? 'Nenhum orçamento aprovado.'
                : aba === 'naoAprovados'
                  ? 'Nenhum orçamento não aprovado.'
                  : 'Nenhum orçamento encontrado.'
        }
      >
          {visiveis.map((r) => {
            const descricao = r.descReparo.split('\n').filter((l) => l.trim()).join(' · ') || '(sem descrição)';
            const grifado = busca.trim() ? destacarTermo(descricao, busca) : null;
            const lembreteFmt = formatarLembrete(r.lembreteEm);
            return (
            <div
              key={r.id}
              data-hist-id={r.id}
              data-destaque={destaqueId === r.id ? '1' : undefined}
              className={`border rounded-2xl p-4 bg-slate-950/40 transition-colors ${classeBordaCor(r.cor)} ${
                destaqueId === r.id ? 'ring-2 ring-amber-400/70' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-base font-black uppercase tracking-widest text-slate-500">
                  <SeloCor cor={r.cor} />
                  {dataDoRegistro(r.criadoEm)}
                  <span className="text-slate-600"> · </span>
                  <span className={lembreteFmt ? 'text-amber-300' : 'text-slate-600'} title={lembreteFmt ? `Lembrete em ${lembreteFmt}` : 'Sem lembrete'}>
                    {lembreteFmt ?? '—'}
                  </span>
                {r.placa ? (
                  <>
                    <span className="text-slate-600"> · </span>
                    <span className="text-amber-300">{r.placa}</span>
                  </>
                ) : null}
                {r.nome ? (
                  <>
                    <span className="text-slate-600"> · </span>
                    <span className="text-sky-300">{r.nome}</span>
                  </>
                ) : null}
                {r.telefone ? (
                  <>
                    <span className="text-slate-600"> · </span>
                    <span className="text-green-300">{r.telefone}</span>
                  </>
                ) : null}
                {r.numeroOrcamento ? (
                  <>
                    <span className="text-slate-600"> · </span>
                    <span className="text-violet-300">Nº {r.numeroOrcamento}</span>
                  </>
                ) : null}
                {r.dataDoc ? (
                  <>
                    <span className="text-slate-600"> · </span>
                    <span className="text-slate-400">{r.dataDoc}</span>
                  </>
                ) : null}
                {temNaoRealizados(r) ? (
                  <>
                    <span className="text-slate-600"> · </span>
                    <span className="text-red-300">{r.naoRealizados!.length} não aprovado(s)</span>
                  </>
                ) : null}
              </span>
                <div className="flex items-center gap-2">
                  <MarcadorCor cor={r.cor} onMudar={(cor) => handleMudarCor(r.id, cor)} />
                  <BotaoRelogio lembreteEm={r.lembreteEm} onAbrir={() => setLembreteDe((d) => (d === r.id ? null : r.id))} />
                  <BotaoWhats telefone={r.telefone} />
                <button
                  type="button"
                  onClick={() => handleVotarInline(r, 'aprovado')}
                  aria-label="Marcar como aprovado"
                  title="Aprovar tudo (limpa os desmarcados, sem mudar a data; clicar de novo desmarca)"
                  aria-pressed={r.aprovacao === 'aprovado'}
                  className={`flex items-center justify-center p-2.5 rounded-lg transition-all cursor-pointer active:scale-95 border ${
                    r.aprovacao === 'aprovado'
                      ? 'bg-green-500 text-white ring-2 ring-green-300 border-green-400'
                      : 'bg-slate-800 hover:bg-green-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Check size={16} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() => handleVotarInline(r, 'naoAprovado')}
                  aria-label="Marcar como não aprovado"
                  title="Reprovar tudo (risca todos, sem mudar a data; clicar de novo desmarca)"
                  aria-pressed={r.aprovacao === 'naoAprovado'}
                  className={`flex items-center justify-center p-2.5 rounded-lg transition-all cursor-pointer active:scale-95 border ${
                    r.aprovacao === 'naoAprovado'
                      ? 'bg-red-500 text-white ring-2 ring-red-300 border-red-400'
                      : 'bg-slate-800 hover:bg-red-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <X size={16} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() => setItensDe(r)}
                  aria-label="Ver itens do orçamento"
                  title="Ver itens do orçamento (dá para desmarcar e virar parcial sem mudar a data)"
                  className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all cursor-pointer active:scale-95"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onAbrir(r)}
                  aria-label="Abrir orçamento"
                  title="Abrir orçamento"
                  className="flex items-center justify-center p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all cursor-pointer active:scale-95"
                >
                  <FolderOpen size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleExcluir(r.id)}
                  aria-label="Excluir orçamento"
                  className="p-2 bg-slate-800 hover:bg-red-600 text-slate-300 rounded-lg transition-all cursor-pointer active:scale-95"
                  title="Excluir este orçamento"
                >
                  <Trash2 size={15} />
                </button>
                </div>
              </div>
              {lembreteDe === r.id && (
                <EditorLembrete
                  inicial={r.lembreteEm}
                  obsInicial={r.observacao}
                  temAtual={!!formatarLembrete(r.lembreteEm)}
                  onConfirmar={(iso, obs) => handleLembrete(r.id, iso, obs)}
                  onLimpar={() => handleLembrete(r.id, null)}
                  onFechar={() => setLembreteDe(null)}
                />
              )}
              <p className="text-lg text-slate-100 font-normal line-clamp-2">
              {grifado ? (
                <>
                  {grifado[0]}
                  <mark className="bg-amber-500/30 text-amber-100 rounded px-0.5">{grifado[1]}</mark>
                  {grifado[2]}
                </>
              ) : (
                descricao
              )}
            </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-base font-bold text-slate-500">
                <span>Revisão: <span className="text-slate-300">{r.revAprovadaInput}</span></span>
                <span>Peças: <span className="text-slate-300">{formatCurrency(r.totalPecasGeral)}</span></span>
                <span>Serviços: <span className="text-slate-300">{formatCurrency(r.totalServicosGeral)}</span></span>
                <span>Bruto: <span className="text-blue-300 text-lg">{formatCurrency(r.totalGeral)}</span></span>
              </div>
              {r.observacao ? (
                <p className="mt-1 text-sm font-bold text-slate-400 truncate" title={r.observacao}>
                  {r.observacao}
                </p>
              ) : null}
          </div>
          );
        })}
      </HistoricoBase>

      {/* Janelinha com os itens do orçamento (a descrição do reparo, linha a linha) */}
      {itensDe && (
        <div
          className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setItensDe(null)}
        >
          <div
            data-janela-itens="1"
            className="w-full max-w-xl max-h-[80vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-slate-950/60 border-b border-slate-800/60">
              <h3 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-widest">
                ITENS DO ORÇAMENTO
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleVotarInline(itensDe, 'aprovado')}
                  aria-label="Marcar como aprovado"
                  title="Aprovar tudo (limpa os desmarcados, sem mudar a data; clicar de novo desmarca)"
                  aria-pressed={itensDe.aprovacao === 'aprovado'}
                  className={`flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer active:scale-95 border ${
                    itensDe.aprovacao === 'aprovado'
                      ? 'bg-green-500 text-white ring-2 ring-green-300 border-green-400'
                      : 'bg-slate-800 hover:bg-green-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Check size={16} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() => handleVotarInline(itensDe, 'naoAprovado')}
                  aria-label="Marcar como não aprovado"
                  title="Reprovar tudo (risca todos, sem mudar a data; clicar de novo desmarca)"
                  aria-pressed={itensDe.aprovacao === 'naoAprovado'}
                  className={`flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer active:scale-95 border ${
                    itensDe.aprovacao === 'naoAprovado'
                      ? 'bg-red-500 text-white ring-2 ring-red-300 border-red-400'
                      : 'bg-slate-800 hover:bg-red-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <X size={16} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() => setItensDe(null)}
                  aria-label="Fechar"
                  title="Fechar"
                  className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 text-slate-200 border border-slate-700 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
              {/* Desmarcar a caixinha vira parcial (salva sem mudar a data).
                  A marcação V/X só aparece nos registros com item desmarcado
                  (o orçamento recém-gerado ainda não foi aprovado pelo cliente). */}
            {temSelecao && (
              <div className="flex items-center gap-4 px-5 pt-3 text-[11px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5 text-green-500">
                  <CheckCircle2 size={14} /> Aprovado pelo cliente
                </span>
                <span className="flex items-center gap-1.5 text-red-400">
                  <XCircle size={14} /> Não aprovado
                </span>
              </div>
            )}
            <div className="overflow-y-auto p-5 space-y-2">
              {itensDe.descReparo
                .split('\n')
                .filter((l) => l.trim())
                .map((linha, i) => {
                  const id = parseInt(linha.trim().split(/\s+/)[0], 10);
                  const temId = Number.isFinite(id);
                  const desmarcado = temId && (itensDe.naoRealizados ?? []).includes(id);
                  const naoAprovado = temSelecao && desmarcado;
                  const valor = temId ? resumoItens?.valoresPorId[id] : undefined;
                  return (
                    <div
                      key={i}
                      data-situacao={temSelecao ? (naoAprovado ? 'naoAprovado' : 'aprovado') : 'neutro'}
                      className="text-base font-bold flex items-start gap-2"
                    >
                      {temId && (
                        <input
                          type="checkbox"
                          checked={!desmarcado}
                          onChange={() => handleToggleItemInline(itensDe, id)}
                          aria-label={`Alternar item ${id}`}
                          title="Desmarcar vira parcial (sem mudar a data)"
                          className="mt-1 h-4 w-4 shrink-0 accent-blue-600 cursor-pointer"
                        />
                      )}
                      {temSelecao &&
                        (naoAprovado ? (
                          <XCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                        ) : (
                          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-green-500" />
                        ))}
                      <span className={naoAprovado ? 'text-red-300 line-through' : 'text-slate-200'}>
                        {linha}
                      </span>
                      {valor !== undefined && (
                        <span
                          className={`ml-auto shrink-0 pl-4 ${
                            naoAprovado ? 'text-red-300 line-through' : 'text-slate-100'
                          }`}
                        >
                          R$ {formatCurrency(valor)}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Resumo embaixo: aprovado, não aprovado, % aprovado e total */}
            {temSelecao && resumoItens && (
              <div className="border-t border-slate-800/60 bg-slate-950/40 px-5 py-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">
                      Aprovado
                    </span>
                    <span className="text-base font-black text-green-500">
                      R$ {formatCurrency(resumoItens.aprovado)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">
                      Não aprovado
                    </span>
                    <span className="text-base font-black text-red-400">
                      R$ {formatCurrency(resumoItens.naoAprovado)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">
                      % aprovado
                    </span>
                    <span className="text-base font-black text-blue-300">
                      {Math.round(resumoItens.percentual)}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">
                      Total
                    </span>
                    <span className="text-base font-black text-slate-100">
                      R$ {formatCurrency(resumoItens.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Relatório para Excel (todos os orçamentos, aprovados ou não). */}
      <RelatorioModal
        aberto={relatorioAberto}
        onFechar={() => setRelatorioAberto(false)}
        registros={lista}
        onExcluir={handleExcluir}
        onLimparTudo={handleLimpar}
      />
    </>
  );
};

export default HistoryModal;
