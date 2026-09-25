import React, { useEffect, useState } from 'react';
import { Check, Copy, Plus, Search, Table2, Trash2, X } from 'lucide-react';
import TituloEditavel from '../components/TituloEditavel';
import {
  type DadosTabelas,
  MAX_COLUNAS,
  adicionarLinha,
  atualizarCelula,
  atualizarLargura,
  atualizarTitulo,
  celulaContem,
  criarAba,
  criarTabela,
  encontrar,
  lerDados,
  alternarMarcada,
  removerAba,
  renomearAba,
  removerLinha,
  removerTabela,
  salvarDados,
} from './utils/tabelas';

const DadosApp: React.FC = () => {
  const [dados, setDados] = useState<DadosTabelas>(lerDados);
  const [abaId, setAbaId] = useState<string>(() => lerDados().abas[0]?.id ?? 'pecas');
  const [colunasNova, setColunasNova] = useState(4);
  const [busca, setBusca] = useState('');
  const [criandoAba, setCriandoAba] = useState(false);
  const [nomeAba, setNomeAba] = useState('');
  const [comCaixas, setComCaixas] = useState(true);
  const [abaRenomeando, setAbaRenomeando] = useState<string | null>(null);
  const [nomeSubAba, setNomeSubAba] = useState('');
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    salvarDados(dados);
  }, [dados]);

  // Se a aba ativa deixar de existir (ou nunca existiu), cai na primeira.
  const aba = dados.abas.find((a) => a.id === abaId) ?? dados.abas[0];

  const ocorrencias = encontrar(dados, busca);
  const buscaAtiva = busca.trim().length > 0;
  const resumoBusca = dados.abas
    .filter((a) => (ocorrencias[a.id] ?? 0) > 0)
    .map((a) => `${ocorrencias[a.id]} em ${a.rotulo}`)
    .join(' · ');

  // Ao pesquisar, abre a sub-aba que tem o termo.
  const handleBusca = (valor: string) => {
    setBusca(valor);
    const oc = encontrar(dados, valor);
    if (valor.trim() && (oc[aba?.id] ?? 0) === 0) {
      const alvo = dados.abas.find((a) => (oc[a.id] ?? 0) > 0);
      if (alvo) setAbaId(alvo.id);
    }
  };

  // Leva até a primeira célula encontrada (que fica grifada).
  useEffect(() => {
    if (!busca.trim()) return;
    const id = window.setTimeout(() => {
      document.querySelector('[data-marcado="1"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 60);
    return () => window.clearTimeout(id);
  }, [busca, abaId]);

  const confirmarRenome = () => {
    if (abaRenomeando) setDados((d) => renomearAba(d, abaRenomeando, nomeSubAba));
    setAbaRenomeando(null);
  };

  const excluirAba = (a: { id: string; rotulo: string }) => {
    if (!window.confirm(`Apagar a sub-aba "${a.rotulo}" e TODAS as tabelas dela?`)) return;
    const restantes = dados.abas.filter((x) => x.id !== a.id);
    setDados(removerAba(dados, a.id));
    setAbaId(restantes[0]?.id ?? 'pecas');
  };

  const confirmarNovaAba = () => {
    if (!nomeAba.trim()) return;
    const novo = criarAba(dados, nomeAba);
    setDados(novo);
    setAbaId(novo.abas[novo.abas.length - 1].id);
    setNomeAba('');
    setCriandoAba(false);
  };

  const copiarCelula = (texto: string, chave: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopiado(chave);
    window.setTimeout(() => setCopiado((c) => (c === chave ? null : c)), 2000);
  };

  return (
    <div className="ui-compacta pt-1 pb-16 text-slate-200">
      <header className="mb-4 text-center">
        <TituloEditavel id="dados" className="titulo-tema text-3xl font-black tracking-tighter uppercase" />
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
              placeholder="Pesquisar nas tabelas…"
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
            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={comCaixas}
                onChange={(e) => setComCaixas(e.target.checked)}
                aria-label="Com caixinhas de seleção"
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              Caixinhas
            </label>
            <button
              type="button"
              onClick={() => setDados((d) => criarTabela(d, aba?.id, colunasNova, comCaixas))}
              aria-label="Criar tabela"
              title="Criar tabela"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
            >
              <Table2 size={16} /> Criar tabela
            </button>
          </div>

          {buscaAtiva && (
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              {resumoBusca || 'Nenhum resultado'}
            </span>
          )}
        </div>

        {/* Sub-abas + criar nova */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {dados.abas.map((a) => (
            <div
              key={a.id}
              className={`flex items-stretch rounded-xl border overflow-hidden transition-all ${
                aba?.id === a.id ? 'border-blue-500' : 'border-slate-700'
              }`}
            >
              {abaRenomeando === a.id ? (
                <input
                  autoFocus
                  value={nomeSubAba}
                  onChange={(e) => setNomeSubAba(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmarRenome();
                    if (e.key === 'Escape') setAbaRenomeando(null);
                  }}
                  onBlur={confirmarRenome}
                  aria-label="Renomear sub-aba"
                  className="px-5 py-2.5 text-base font-black uppercase tracking-widest campo-tema outline-none w-44"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAbaId(a.id)}
                  onDoubleClick={() => {
                    setAbaRenomeando(a.id);
                    setNomeSubAba(a.rotulo);
                  }}
                  title="Duplo clique para renomear"
                  className={`px-6 py-2.5 text-base font-black uppercase tracking-widest transition-all cursor-pointer ${
                    aba?.id === a.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {a.rotulo} ({a.tabelas.length})
                </button>
              )}
              <button
                type="button"
                onClick={() => excluirAba(a)}
                disabled={dados.abas.length <= 1}
                aria-label={`Excluir sub-aba ${a.rotulo}`}
                title="Excluir esta sub-aba"
                className={`flex items-center justify-center px-2.5 border-l transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  aba?.id === a.id
                    ? 'bg-blue-600/70 hover:bg-red-600 text-white border-blue-500'
                    : 'bg-slate-800 hover:bg-red-600 hover:text-white text-slate-500 border-slate-700'
                }`}
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}

          {criandoAba ? (
            <span className="flex items-center gap-2 bg-slate-900/60 border border-slate-700 rounded-xl px-2 py-1.5">
              <input
                autoFocus
                type="text"
                value={nomeAba}
                onChange={(e) => setNomeAba(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmarNovaAba();
                  if (e.key === 'Escape') { setCriandoAba(false); setNomeAba(''); }
                }}
                placeholder="Nome da sub-aba"
                aria-label="Nome da nova sub-aba"
                className="campo-tema border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-100 outline-none w-44"
              />
              <button
                type="button"
                onClick={confirmarNovaAba}
                aria-label="Confirmar nova sub-aba"
                title="Criar sub-aba"
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                <Check size={16} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={() => { setCriandoAba(false); setNomeAba(''); }}
                aria-label="Cancelar nova sub-aba"
                title="Cancelar"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                <X size={16} />
              </button>
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCriandoAba(true)}
                aria-label="Criar sub-aba"
                title="Criar sub-aba"
                className="flex items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </>
          )}
        </div>

        {!aba || aba.tabelas.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl py-20 text-center">
            <Table2 className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
              Nenhuma tabela em {aba?.rotulo}. Use "Criar tabela" acima.
            </p>
          </div>
        ) : (
          aba.tabelas.map((tabela) => {
            const iniciarRedimensionamento = (coluna: number, e: React.MouseEvent) => {
              e.preventDefault();
              const inicioX = e.clientX;
              const larguraInicial = tabela.larguras[coluna];
              const aoMover = (ev: MouseEvent) => {
                // a seção está com zoom de 75% (ui-compacta)
                const delta = (ev.clientX - inicioX) / 0.75;
                setDados((d) => atualizarLargura(d, aba.id, tabela.id, coluna, larguraInicial + delta));
              };
              const aoSoltar = () => {
                window.removeEventListener('mousemove', aoMover);
                window.removeEventListener('mouseup', aoSoltar);
              };
              window.addEventListener('mousemove', aoMover);
              window.addEventListener('mouseup', aoSoltar);
            };

            const larguraAcoes = tabela.comCaixas ? 88 : 44;
            const larguraTotal = tabela.larguras.reduce((a, b) => a + b, 0) + larguraAcoes;

            return (
              <div key={tabela.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mb-6">
                <div className="flex items-center justify-end gap-4 px-4 py-2 border-b border-slate-800 bg-slate-800/30">
                  <button
                    type="button"
                    onClick={() => setDados((d) => removerTabela(d, aba.id, tabela.id))}
                    aria-label="Excluir tabela"
                    title="Excluir tabela"
                    className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 border border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="border-collapse" style={{ tableLayout: 'fixed', width: larguraTotal }}>
                    <colgroup>
                      {tabela.larguras.map((largura, coluna) => (
                        <col key={coluna} style={{ width: largura }} />
                      ))}
                      <col style={{ width: larguraAcoes }} />
                    </colgroup>
                    <thead>
                      <tr>
                        {tabela.titulos.map((titulo, coluna) => {
                          const marcado = buscaAtiva && celulaContem(titulo, busca);
                          return (
                            <th key={coluna} className={`relative border border-slate-800 p-0 ${marcado ? 'bg-amber-500/20' : 'bg-slate-950/60'}`}>
                              <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setDados((d) => atualizarTitulo(d, aba.id, tabela.id, coluna, e.target.value))}
                                data-marcado={marcado ? '1' : undefined}
                                className={`w-full bg-transparent px-4 py-2.5 text-lg font-black uppercase outline-none focus:bg-slate-900 ${marcado ? 'text-amber-200' : 'text-slate-100'}`}
                              />
                              {/* alça para ajustar a largura da coluna */}
                              <div
                                role="separator"
                                aria-label={`Ajustar largura da coluna ${coluna + 1}`}
                                title="Arraste para ajustar a largura"
                                data-redimensionar={coluna}
                                onMouseDown={(e) => iniciarRedimensionamento(coluna, e)}
                                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-500/60 z-10"
                              />
                            </th>
                          );
                        })}
                        <th className="border border-slate-800 bg-slate-950/60"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabela.linhas.map((linha, r) => (
                        <tr key={r}>
                          {linha.map((valor, coluna) => {
                            const marcado = buscaAtiva && celulaContem(valor, busca);
                            const chave = `${tabela.id}-${r}-${coluna}`;
                            return (
                              <td
                                key={coluna}
                                className={`relative group border border-slate-800 p-0 ${marcado ? 'bg-amber-500/20' : ''}`}
                              >
                                <input
                                  type="text"
                                  value={valor}
                                  onChange={(e) => setDados((d) => atualizarCelula(d, aba.id, tabela.id, r, coluna, e.target.value))}
                                  data-marcado={marcado ? '1' : undefined}
                                  className={`w-full bg-transparent px-4 py-2 pr-10 text-xl font-bold outline-none focus:bg-slate-900 ${
                                    marcado ? 'text-amber-200' : tabela.marcados[r] ? 'text-slate-500 line-through' : 'text-slate-200'
                                  }`}
                                />
                                {valor && (
                                  <button
                                    type="button"
                                    onClick={() => copiarCelula(valor, chave)}
                                    aria-label={`Copiar célula ${r + 1}-${coluna + 1}`}
                                    title="Copiar conteúdo da célula"
                                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 ${
                                      copiado === chave
                                        ? 'bg-green-600 text-white opacity-100'
                                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                                  >
                                    {copiado === chave ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                          <td className="border border-slate-800 text-center">
                            <span className="inline-flex items-center gap-1">
                            {tabela.comCaixas && (
                              <input
                                type="checkbox"
                                checked={tabela.marcados[r] ?? false}
                                onChange={() => setDados((d) => alternarMarcada(d, aba.id, tabela.id, r))}
                                aria-label={`Marcar linha ${r + 1}`}
                                title="Marcar (risca a linha)"
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => setDados((d) => removerLinha(d, aba.id, tabela.id, r))}
                              aria-label={`Excluir linha ${r + 1}`}
                              title="Excluir linha"
                              className="p-1.5 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 border-t border-slate-800 bg-slate-950/30">
                  <button
                    type="button"
                    onClick={() => setDados((d) => adicionarLinha(d, aba.id, tabela.id))}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus size={16} /> Adicionar linha
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DadosApp;
