import React from 'react';
import { Search, Trash2, X } from 'lucide-react';
import { FiltroCorCliente } from './CorCliente';
import type { FiltroCor } from '../utils/corCliente';

/**
 * Casca compartilhada dos dois históricos (Orçamentos e Tire Flyer): overlay,
 * cabeçalho, linha de ações, campo de busca, filtro de cor e área da lista.
 * Cada modal entra com o título, os botões próprios e os cartões — o DOM e as
 * classes daqui são idênticos nos dois (é o que os testes de tela cobrem).
 */
interface HistoricoBaseProps {
  titulo: string;
  onFechar: () => void;
  /** Botões à esquerda da lupa (ex.: backup/restaurar, só nos orçamentos). */
  acoesExtras?: React.ReactNode;
  onLimpar: () => void;
  podeLimpar: boolean;
  buscaAberta: boolean;
  onAlternarBusca: () => void;
  tituloBusca: string;
  busca: string;
  onBusca: (v: string) => void;
  placeholderBusca: string;
  totalVisiveis: number;
  totalLista: number;
  /** Faixa entre a busca e o filtro de cor (ex.: abas Todos/Não Realizados). */
  faixaExtras?: React.ReactNode;
  filtroCor: FiltroCor;
  verdes: number;
  vermelhos: number;
  onFiltroCor: (f: FiltroCor) => void;
  msg?: string;
  /** Texto quando não há nada salvo. */
  vazioLista: string;
  /** Texto/cartão quando há itens mas o filtro/busca não casa ninguém. */
  vazioFiltro: React.ReactNode;
  children: React.ReactNode; // os cartões visíveis
}

const botaoAcao =
  'flex items-center justify-center p-2.5 rounded-xl transition-all border cursor-pointer active:scale-95';

const HistoricoBase: React.FC<HistoricoBaseProps> = ({
  titulo,
  onFechar,
  acoesExtras,
  onLimpar,
  podeLimpar,
  buscaAberta,
  onAlternarBusca,
  tituloBusca,
  busca,
  onBusca,
  placeholderBusca,
  totalVisiveis,
  totalLista,
  faixaExtras,
  filtroCor,
  verdes,
  vermelhos,
  onFiltroCor,
  msg,
  vazioLista,
  vazioFiltro,
  children,
}) => (
  <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 print:hidden">
    <div data-neon-box className="w-full max-w-4xl max-h-[93vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden ui-compacta">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-6 py-5 bg-slate-950/60 border-b border-slate-800/60">
        <div className="flex items-center gap-4">
          <div data-neon-dot className="w-2 h-8 rounded-full bg-blue-500" style={{ boxShadow: '0 0 20px #3b82f6' }}></div>
          <h3 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-widest">{titulo}</h3>
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
        {acoesExtras}
        <button
          type="button"
          onClick={onAlternarBusca}
          aria-label="Pesquisar"
          title={tituloBusca}
          className={`${botaoAcao} ${
            buscaAberta
              ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          <Search size={18} />
        </button>
        {/* Filtro de cor na mesma linha: entre a lupa e o limpar tudo. */}
        <FiltroCorCliente compacto valor={filtroCor} verdes={verdes} vermelhos={vermelhos} onMudar={onFiltroCor} />
        <button
          type="button"
          onClick={onLimpar}
          disabled={!podeLimpar}
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
              onChange={(e) => onBusca(e.target.value)}
              placeholder={placeholderBusca}
              className="w-full campo-tema border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-base font-bold text-slate-200 focus:border-blue-500 outline-none"
            />
            {busca && (
              <button
                type="button"
                onClick={() => onBusca('')}
                aria-label="Limpar busca"
                title="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span className="text-sm font-bold text-slate-500 whitespace-nowrap">
            {totalVisiveis} de {totalLista}
          </span>
        </div>
      )}

      {faixaExtras}

      {msg && (
        <div className="px-6 py-3 text-base font-bold text-blue-300 bg-blue-600/10 border-b border-blue-500/20">{msg}</div>
      )}

      {/* Lista */}
      <div className="overflow-y-auto p-4 space-y-3">
        {totalLista === 0 && (
          <p className="text-slate-500 text-center py-10 font-bold uppercase tracking-widest text-base">
            {vazioLista}
          </p>
        )}
        {totalLista > 0 && totalVisiveis === 0 && (
          <p className="text-slate-500 text-center py-10 font-bold uppercase tracking-widest text-base">
            {vazioFiltro}
          </p>
        )}
        {children}
      </div>
    </div>
  </div>
);

export default HistoricoBase;
