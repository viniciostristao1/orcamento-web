import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Database, FolderOpen, List, Trash2, Upload, X, XCircle } from 'lucide-react';
import {
  type AbaHistorico,
  type OrcamentoSalvo,
  atualizarCorHistorico,
  baixarBackup,
  contarItensDaDescricao,
  destacarTermo,
  filtrarHistorico,
  filtrarPorAba,
  importarBackup,
  limparHistorico,
  listarHistorico,
  removerDoHistorico,
  temNaoRealizados,
} from '../utils/historico';
import { filtrarPorCor, type CorCliente, type FiltroCor } from '../utils/corCliente';
import { MarcadorCor, SeloCor, classeBordaCor } from './CorCliente';
import { formatCurrency, parseBrazilianNumber, processQuote, resumoAprovacao } from '../utils/quoteLogic';
import BotaoWhats from './BotaoWhats';
import HistoricoBase from './HistoricoBase';

interface HistoryModalProps {
  aberto: boolean;
  onFechar: () => void;
  onAbrir: (rec: OrcamentoSalvo) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ aberto, onFechar, onAbrir }) => {
  const [lista, setLista] = useState<OrcamentoSalvo[]>([]);
  const [msg, setMsg] = useState('');
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<AbaHistorico>('todos');
  const [filtroCor, setFiltroCor] = useState<FiltroCor>('todas');
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
      setItensDe(null);
    }
  }, [aberto]);

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
    naoRealizados: filtrarPorAba(porCor, 'naoRealizados'),
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
              { id: 'naoRealizados' as AbaHistorico, rotulo: `Não Realizados (${porAba.naoRealizados.length})` },
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
              : aba === 'naoRealizados'
                ? 'Nenhum orçamento com itens não realizados.'
                : 'Nenhum orçamento encontrado.'
        }
      >
        {visiveis.map((r) => {
          const itens = r.numItens ?? contarItensDaDescricao(r.descReparo);
          const descricao = r.descReparo.split('\n').filter((l) => l.trim()).join(' · ') || '(sem descrição)';
          const grifado = busca.trim() ? destacarTermo(descricao, busca) : null;
          return (
          <div key={r.id} className={`border rounded-2xl p-4 bg-slate-950/40 transition-colors ${classeBordaCor(r.cor)}`}>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-base font-black uppercase tracking-widest text-slate-500">
                <SeloCor cor={r.cor} />
                {r.criadoEm}
                <span className="text-slate-600"> · </span>
                <span className="text-blue-300">{itens} {itens === 1 ? 'item' : 'itens'}</span>
                {r.placa ? (
                  <>
                    <span className="text-slate-600"> · </span>
                    <span className="text-amber-300">{r.placa}</span>
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
                    <span className="text-red-300">{r.naoRealizados!.length} não realizado(s)</span>
                  </>
                ) : null}
              </span>
              <div className="flex items-center gap-2">
                <MarcadorCor cor={r.cor} onMudar={(cor) => handleMudarCor(r.id, cor)} />
                <BotaoWhats telefone={r.telefone} />
                <button
                  type="button"
                  onClick={() => setItensDe(r)}
                  aria-label="Ver itens do orçamento"
                  title="Ver itens do orçamento"
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
            {/* Aprovação só faz sentido no que foi salvo em "Não Realizados"
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
                  const naoAprovado =
                    temSelecao && Number.isFinite(id) && (itensDe.naoRealizados ?? []).includes(id);
                  const valor = resumoItens?.valoresPorId[id];
                  return (
                    <p
                      key={i}
                      data-situacao={temSelecao ? (naoAprovado ? 'naoAprovado' : 'aprovado') : 'neutro'}
                      className="text-base font-bold flex items-start gap-2"
                    >
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
                    </p>
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
    </>
  );
};

export default HistoryModal;
