import React, { useEffect, useRef, useState } from 'react';
import { Plus, Search, Table2, Trash2, X } from 'lucide-react';
import {
  type AbaDados,
  type DadosTabelas,
  MAX_COLUNAS,
  adicionarLinha,
  atualizarCelula,
  atualizarTitulo,
  celulaContem,
  criarTabela,
  encontrar,
  lerDados,
  removerLinha,
  removerTabela,
  salvarDados,
} from './utils/tabelas';

const ABAS: { id: AbaDados; rotulo: string }[] = [
  { id: 'pecas', rotulo: 'PEÇAS' },
  { id: 'os', rotulo: "O.S'S" },
];

const DadosApp: React.FC = () => {
  const [dados, setDados] = useState<DadosTabelas>(lerDados);
  const [aba, setAba] = useState<AbaDados>('pecas');
  const [colunasNova, setColunasNova] = useState(4);
  const [busca, setBusca] = useState('');
  const buscaRef = useRef(busca);

  useEffect(() => {
    salvarDados(dados);
  }, [dados]);

  const ocorrencias = encontrar(dados, busca);
  const buscaAtiva = busca.trim().length > 0;

  // Ao pesquisar, abre a sub-aba que tem o termo.
  const handleBusca = (valor: string) => {
    setBusca(valor);
    buscaRef.current = valor;
    const oc = encontrar(dados, valor);
    if (valor.trim() && oc[aba] === 0) {
      if (oc.pecas > 0) setAba('pecas');
      else if (oc.os > 0) setAba('os');
    }
  };

  // Leva até a primeira célula encontrada (que fica grifada).
  useEffect(() => {
    if (!busca.trim()) return;
    const id = window.setTimeout(() => {
      document.querySelector('[data-marcado="1"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 60);
    return () => window.clearTimeout(id);
  }, [busca, aba]);

  const criar = () => setDados((d) => criarTabela(d, aba, colunasNova));

  return (
    <div className="ui-compacta pt-1 pb-16 text-slate-200">
      <header className="mb-4 text-center">
        <h1 className="titulo-tema text-3xl font-black tracking-tighter uppercase">DADOS</h1>
      </header>

      <div className="max-w-[1150px] mx-auto">
        {/* Pesquisa + criar tabela */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              placeholder="Pesquisar nas tabelas (peças e O.S's)…"
              className="campo-tema w-full border border-slate-800 rounded-xl pl-11 pr-10 py-3 text-base font-bold text-slate-100 focus:border-blue-500 outline-none"
            />
            {busca && (
              <button
                type="button"
                onClick={() => handleBusca('')}
                aria-label="Limpar busca"
                title="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Colunas</label>
            <select
              value={colunasNova}
              onChange={(e) => setColunasNova(parseInt(e.target.value, 10))}
              aria-label="Número de colunas"
              className="campo-tema border border-slate-800 rounded-lg px-2 py-1 text-base font-black text-slate-100 outline-none cursor-pointer"
            >
              {Array.from({ length: MAX_COLUNAS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n} className="bg-slate-900">
                  {n}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={criar}
              aria-label="Criar tabela"
              title="Criar tabela"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
            >
              <Table2 size={16} /> Criar tabela
            </button>
          </div>

          {buscaAtiva && (
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              {ocorrencias.pecas} em Peças · {ocorrencias.os} em O.S's
            </span>
          )}
        </div>

        {/* Sub-abas */}
        <div className="flex items-center gap-2 mb-4">
          {ABAS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAba(t.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer active:scale-95 ${
                aba === t.id
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {t.rotulo} ({dados[t.id].length})
            </button>
          ))}
        </div>

        {dados[aba].length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl py-20 text-center">
            <Table2 className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
              Nenhuma tabela em {ABAS.find((a) => a.id === aba)?.rotulo}. Use "Criar tabela" acima.
            </p>
          </div>
        ) : (
          dados[aba].map((tabela, indice) => (
            <div key={tabela.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mb-6">
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-slate-800 bg-slate-800/30">
                <div>
                  <h2 className="titulo-tema text-lg font-black text-slate-100 uppercase tracking-tight">
                    Tabela {indice + 1} · {ABAS.find((a) => a.id === aba)?.rotulo}
                  </h2>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {tabela.criadoEm} · {tabela.colunas} colunas · {tabela.linhas.length} linha(s)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDados((d) => removerTabela(d, aba, tabela.id))}
                  aria-label="Excluir tabela"
                  title="Excluir tabela"
                  className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 border border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {tabela.titulos.map((titulo, coluna) => {
                        const marcado = buscaAtiva && celulaContem(titulo, busca);
                        return (
                          <th key={coluna} className={`border border-slate-800 min-w-[150px] p-0 ${marcado ? 'bg-amber-500/20' : 'bg-slate-950/60'}`}>
                            <input
                              type="text"
                              value={titulo}
                              onChange={(e) => setDados((d) => atualizarTitulo(d, aba, tabela.id, coluna, e.target.value))}
                              data-marcado={marcado ? '1' : undefined}
                              className={`w-full bg-transparent px-3 py-2 text-sm font-black uppercase outline-none focus:bg-slate-900 ${marcado ? 'text-amber-200' : 'text-slate-100'}`}
                            />
                          </th>
                        );
                      })}
                      <th className="w-10 border border-slate-800 bg-slate-950/60"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabela.linhas.map((linha, r) => (
                      <tr key={r}>
                        {linha.map((valor, coluna) => {
                          const marcado = buscaAtiva && celulaContem(valor, busca);
                          return (
                            <td key={coluna} className={`border border-slate-800 p-0 ${marcado ? 'bg-amber-500/20' : ''}`}>
                              <input
                                type="text"
                                value={valor}
                                onChange={(e) => setDados((d) => atualizarCelula(d, aba, tabela.id, r, coluna, e.target.value))}
                                data-marcado={marcado ? '1' : undefined}
                                className={`w-full bg-transparent px-3 py-2 text-sm font-bold outline-none focus:bg-slate-900 ${marcado ? 'text-amber-200' : 'text-slate-200'}`}
                              />
                            </td>
                          );
                        })}
                        <td className="w-10 border border-slate-800 text-center">
                          <button
                            type="button"
                            onClick={() => setDados((d) => removerLinha(d, aba, tabela.id, r))}
                            aria-label={`Excluir linha ${r + 1}`}
                            title="Excluir linha"
                            className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-950/30">
                <button
                  type="button"
                  onClick={() => setDados((d) => adicionarLinha(d, aba, tabela.id))}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={16} /> Adicionar linha
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DadosApp;
