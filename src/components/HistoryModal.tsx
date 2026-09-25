import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Database, FolderOpen, List, Search, Trash2, Upload, X, XCircle } from 'lucide-react';
import {
  type AbaHistorico,
  type OrcamentoSalvo,
  baixarBackup,
  contarItensDaDescricao,
  filtrarHistorico,
  filtrarPorAba,
  importarBackup,
  limparHistorico,
  listarHistorico,
  removerDoHistorico,
  temNaoRealizados,
} from '../utils/historico';
import { formatCurrency } from '../utils/quoteLogic';

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
      setItensDe(null);
    }
  }, [aberto]);

  if (!aberto) return null;

  const visiveis = filtrarHistorico(filtrarPorAba(lista, aba), busca);
  const totalNaoRealizados = lista.filter(temNaoRealizados).length;
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

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 print:hidden">
      <div data-neon-box className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden ui-compacta">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-950/60 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <div data-neon-dot className="w-2 h-8 rounded-full bg-blue-500" style={{ boxShadow: '0 0 20px #3b82f6' }}></div>
            <h3 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-widest">Histórico</h3>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            title="Fechar"
            className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-slate-800/60">
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
            onClick={() => {
              setBuscaAberta((v) => !v);
              setBusca('');
            }}
            aria-label="Pesquisar"
            title="Pesquisar"
            className={`flex items-center justify-center p-2.5 rounded-xl transition-all border cursor-pointer active:scale-95 ${
              buscaAberta
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            onClick={handleLimpar}
            disabled={lista.length === 0}
            aria-label="Limpar tudo"
            title="Limpar tudo"
            className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 disabled:opacity-40 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95 ml-auto"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {buscaAberta && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800/60">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                autoFocus
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por data ou placa… (ex.: 24/09 ou ABC1D23)"
                className="w-full campo-tema border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-base font-bold text-slate-200 focus:border-blue-500 outline-none"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
                  title="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <span className="text-sm font-bold text-slate-500 whitespace-nowrap">
              {visiveis.length} de {lista.length}
            </span>
          </div>
        )}

        {/* Abas: Todos | Não Realizados */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/60">
          {([
            { id: 'todos' as AbaHistorico, rotulo: `Todos (${lista.length})` },
            { id: 'naoRealizados' as AbaHistorico, rotulo: `Não Realizados (${totalNaoRealizados})` },
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

        {msg && (
          <div className="px-6 py-3 text-base font-bold text-blue-300 bg-blue-600/10 border-b border-blue-500/20">{msg}</div>
        )}

        {/* Lista */}
        <div className="overflow-y-auto p-4 space-y-3">
          {lista.length === 0 && (
            <p className="text-slate-500 text-center py-10 font-bold uppercase tracking-widest text-base">
              Nenhum orçamento salvo ainda.
            </p>
          )}
          {lista.length > 0 && visiveis.length === 0 && (
            <p className="text-slate-500 text-center py-10 font-bold uppercase tracking-widest text-base">
              {aba === 'naoRealizados'
                ? 'Nenhum orçamento com itens não realizados.'
                : 'Nenhum orçamento encontrado.'}
            </p>
          )}
          {visiveis.map((r) => {
            const itens = r.numItens ?? contarItensDaDescricao(r.descReparo);
            return (
            <div key={r.id} className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-base font-black uppercase tracking-widest text-slate-500">
                  {r.criadoEm}
                  <span className="text-slate-600"> · </span>
                  <span className="text-blue-300">{itens} {itens === 1 ? 'item' : 'itens'}</span>
                  {r.placa ? (
                    <>
                      <span className="text-slate-600"> · </span>
                      <span className="text-amber-300">{r.placa}</span>
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
                    onClick={() => setLista(removerDoHistorico(r.id))}
                    className="p-2 bg-slate-800 hover:bg-red-600 text-slate-300 rounded-lg transition-all cursor-pointer active:scale-95"
                    title="Excluir este orçamento"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-lg text-slate-300 font-bold truncate">
                {r.descReparo.split('\n').filter((l) => l.trim()).join(' · ') || '(sem descrição)'}
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
        </div>

        {/* Janelinha com os itens do orçamento (a descrição do reparo, linha a linha) */}
        {itensDe && (
          <div
            className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setItensDe(null)}
          >
            <div
              className="w-full max-w-xl max-h-[80vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 bg-slate-950/60 border-b border-slate-800/60">
                <h3 className="titulo-tema text-3xl font-black text-slate-100 uppercase tracking-widest">
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
                      </p>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
