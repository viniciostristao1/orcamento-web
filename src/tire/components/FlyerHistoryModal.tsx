import React, { useEffect, useState } from 'react';
import { FolderOpen, Search, Trash2, X } from 'lucide-react';
import {
  type FlyerSalvo,
  filtrarFlyerHistorico,
  limparFlyerHistorico,
  listarFlyerHistorico,
  removerDoFlyerHistorico,
} from '../utils/historicoFlyer';

interface FlyerHistoryModalProps {
  aberto: boolean;
  onFechar: () => void;
  onAbrir: (registro: FlyerSalvo) => void;
}

const FlyerHistoryModal: React.FC<FlyerHistoryModalProps> = ({ aberto, onFechar, onAbrir }) => {
  const [lista, setLista] = useState<FlyerSalvo[]>([]);
  const [msg, setMsg] = useState('');
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (aberto) {
      setLista(listarFlyerHistorico());
      setMsg('');
      setBuscaAberta(false);
      setBusca('');
    }
  }, [aberto]);

  if (!aberto) return null;

  const visiveis = filtrarFlyerHistorico(lista, busca);

  const handleLimpar = () => {
    if (!window.confirm('Apagar TODO o histórico do Tire Flyer?')) return;
    limparFlyerHistorico();
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
            <h3 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-widest">HISTÓRICO — TIRE FLYER</h3>
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
            onClick={() => {
              setBuscaAberta((v) => !v);
              setBusca('');
            }}
            aria-label="Pesquisar"
            title="Pesquisar (contato, data ou medida)"
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
                placeholder="Pesquisar por contato, data ou medida… (ex.: JOÃO, 24/09, 265/60R18)"
                className="w-full campo-tema border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-base font-bold text-slate-200 focus:border-blue-500 outline-none"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca('')}
                  aria-label="Limpar busca"
                  title="Limpar busca"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
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

        {msg && (
          <div className="px-6 py-3 text-base font-bold text-blue-300 bg-blue-600/10 border-b border-blue-500/20">{msg}</div>
        )}

        {/* Lista */}
        <div className="overflow-y-auto p-4 space-y-3">
          {lista.length === 0 && (
            <p className="text-slate-500 text-center py-10 font-bold uppercase tracking-widest text-base">
              Nenhum flyer salvo ainda.
            </p>
          )}
          {lista.length > 0 && visiveis.length === 0 && (
            <p className="text-slate-500 text-center py-10 font-bold uppercase tracking-widest text-base">
              Nenhum flyer encontrado.
            </p>
          )}
          {visiveis.map((r) => (
            <div key={r.id} className="border border-slate-800 rounded-2xl p-4 bg-slate-950/40 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-base font-black uppercase tracking-widest text-slate-500">
                  {r.criadoEm}
                  {r.contato ? (
                    <>
                      <span className="text-slate-600"> · </span>
                      <span className="text-blue-300">{r.contato}</span>
                    </>
                  ) : null}
                  <span className="text-slate-600"> · </span>
                  <span className="text-amber-300">{r.medida}</span>
                  <span className="text-slate-600"> · </span>
                  <span className="text-slate-400">
                    {r.numPneus} {r.numPneus === 1 ? 'pneu' : 'pneus'}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAbrir(r)}
                    aria-label="Abrir flyer"
                    title="Abrir flyer"
                    className="flex items-center justify-center p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all cursor-pointer active:scale-95"
                  >
                    <FolderOpen size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLista(removerDoFlyerHistorico(r.id))}
                    aria-label="Excluir este flyer"
                    title="Excluir este flyer"
                    className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 rounded-lg transition-all cursor-pointer active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-lg text-slate-300 font-bold truncate">
                {r.inputText.split('\n').filter((l) => l.trim()).slice(1, 4).join(' · ') || '(sem tabela)'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlyerHistoryModal;
