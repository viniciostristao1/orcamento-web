import React, { useEffect, useRef, useState } from 'react';
import { Database, FolderOpen, Trash2, Upload, X } from 'lucide-react';
import {
  type OrcamentoSalvo,
  baixarBackup,
  contarItensDaDescricao,
  importarBackup,
  limparHistorico,
  listarHistorico,
  removerDoHistorico,
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
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setLista(listarHistorico());
      setMsg('');
    }
  }, [aberto]);

  if (!aberto) return null;

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
      <div className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-5 bg-slate-950/60 border-b border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 rounded-full bg-blue-500" style={{ boxShadow: '0 0 20px #3b82f6' }}></div>
            <h3 className="text-xl font-black text-slate-100 uppercase tracking-widest">Histórico</h3>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600 text-slate-200 rounded-xl transition-all text-xs font-black uppercase border border-slate-700 cursor-pointer active:scale-95"
          >
            <X size={16} /> Fechar
          </button>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-slate-800/60">
          <button
            type="button"
            onClick={() => baixarBackup()}
            disabled={lista.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition-all text-xs font-black uppercase border border-slate-700 cursor-pointer active:scale-95"
          >
            <Database size={16} /> Backup (JSON)
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all text-xs font-black uppercase border border-slate-700 cursor-pointer active:scale-95"
          >
            <Upload size={16} /> Restaurar backup
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleRestaurar} />
          <button
            type="button"
            onClick={handleLimpar}
            disabled={lista.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600 disabled:opacity-40 text-slate-200 rounded-xl transition-all text-xs font-black uppercase border border-slate-700 cursor-pointer active:scale-95 ml-auto"
          >
            <Trash2 size={16} /> Limpar tudo
          </button>
        </div>

        {msg && (
          <div className="px-6 py-3 text-sm font-bold text-blue-300 bg-blue-600/10 border-b border-blue-500/20">{msg}</div>
        )}

        {/* Lista */}
        <div className="overflow-y-auto p-4 space-y-3">
          {lista.length === 0 && (
            <p className="text-slate-500 text-center py-10 font-bold uppercase tracking-widest text-sm">
              Nenhum orçamento salvo ainda.
            </p>
          )}
          {lista.map((r) => {
            const itens = r.numItens ?? contarItensDaDescricao(r.descReparo);
            return (
            <div key={r.id} className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[13px] font-black uppercase tracking-widest text-slate-500">
                  {r.criadoEm}
                  <span className="text-slate-600"> · </span>
                  <span className="text-blue-300">{itens} {itens === 1 ? 'item' : 'itens'}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAbrir(r)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all text-xs font-black uppercase cursor-pointer active:scale-95"
                  >
                    <FolderOpen size={15} /> Abrir
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
              <p className="text-base text-slate-300 font-bold truncate">
                {r.descReparo.split('\n').filter((l) => l.trim()).join(' · ') || '(sem descrição)'}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm font-bold text-slate-500">
                <span>Revisão: <span className="text-slate-300">{r.revAprovadaInput}</span></span>
                <span>Peças: <span className="text-slate-300">{formatCurrency(r.totalPecasGeral)}</span></span>
                <span>Serviços: <span className="text-slate-300">{formatCurrency(r.totalServicosGeral)}</span></span>
                <span>Líquido: <span className="text-blue-300 text-base">{formatCurrency(r.valorLiquidoFinal)}</span></span>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
