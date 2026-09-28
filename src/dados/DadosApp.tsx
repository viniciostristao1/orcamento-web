import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpDown, Check, Copy, Plus, Search, Table2, Trash2, X } from 'lucide-react';
import TituloEditavel from '../components/TituloEditavel';
import OrdenarTabela from './components/OrdenarTabela';
import {
  type AbaDados,
  type DadosTabelas,
  type TabelaDados,
  MAX_COLUNAS,
  adicionarColuna,
  adicionarLinha,
  atualizarCelula,
  atualizarLargura,
  atualizarTitulo,
  celulaContem,
  colarBloco,
  criarAba,
  criarTabela,
  lerDados,
  limparBloco,
  listarOcorrencias,
  alternarMarcada,
  ordenarPorColuna,
  removerAba,
  renomearAba,
  removerColuna,
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
  // Seleção de várias células (arrastar / Shift+clique) para copiar o bloco.
  const [selecao, setSelecao] = useState<{ tabelaId: string; r1: number; c1: number; r2: number; c2: number } | null>(null);
  const arrastandoSelecao = useRef(false);
  // Refs das células da tabela, para TAB/Enter levarem o foco junto do destaque.
  const refsCelulas = useRef<Map<string, HTMLInputElement>>(new Map());
  const chaveCelula = (tabelaId: string, r: number, c: number) => `${tabelaId}:${r}:${c}`;
  // Ocorrência da busca em destaque (Enter pula para a próxima, estilo "1 de N").
  const [ocorrenciaAtual, setOcorrenciaAtual] = useState(0);
  // Tabela aberta na janelinha de ordenação (por coluna).
  const [ordenando, setOrdenando] = useState<{ abaId: string; tabelaId: string; titulos: string[] } | null>(null);
  // Sub-aba recém-excluída (para o "Desfazer") + timer que esconde o aviso.
  const [desfazerAba, setDesfazerAba] = useState<{ aba: AbaDados; idx: number } | null>(null);
  const desfazerTimer = useRef<number | null>(null);

  useEffect(() => {
    salvarDados(dados);
  }, [dados]);

  // Limpa o timer do "Desfazer" ao desmontar.
  useEffect(() => () => { if (desfazerTimer.current) window.clearTimeout(desfazerTimer.current); }, []);

  // Se a aba ativa deixar de existir (ou nunca existiu), cai na primeira.
  const aba = dados.abas.find((a) => a.id === abaId) ?? dados.abas[0];

  const ocorrencias = listarOcorrencias(dados, busca);
  const buscaAtiva = busca.trim().length > 0;
  const porAba: Record<string, number> = {};
  for (const oc of ocorrencias) porAba[oc.abaId] = (porAba[oc.abaId] ?? 0) + 1;
  const resumoBusca = dados.abas
    .filter((a) => (porAba[a.id] ?? 0) > 0)
    .map((a) => `${porAba[a.id]} em ${a.rotulo}`)
    .join(' · ');
  const indiceAtual = ocorrencias.length > 0 ? ocorrenciaAtual % ocorrencias.length : 0;
  const ocorrencia = ocorrencias[indiceAtual];

  // Ao pesquisar, abre a sub-aba que tem o termo e começa pela 1ª ocorrência.
  const handleBusca = (valor: string) => {
    setBusca(valor);
    setOcorrenciaAtual(0);
    const lista = listarOcorrencias(dados, valor);
    if (valor.trim() && !lista.some((o) => o.abaId === aba?.id) && lista[0]) {
      setAbaId(lista[0].abaId);
    }
  };

  // Enter/pula para a ocorrência seguinte (Shift+Enter volta), trocando de
  // sub-aba se o termo estiver em outra — e rola até ela, que fica destacada.
  const irParaOcorrencia = (passo: number) => {
    if (ocorrencias.length === 0) return;
    const i = ((indiceAtual + passo) % ocorrencias.length + ocorrencias.length) % ocorrencias.length;
    setOcorrenciaAtual(i);
    const alvo = ocorrencias[i];
    if (alvo && alvo.abaId !== aba?.id) setAbaId(alvo.abaId);
  };

  // Leva até a ocorrência em destaque (a que o Enter está percorrendo).
  useEffect(() => {
    if (!busca.trim()) return;
    const id = window.setTimeout(() => {
      document.querySelector('[data-atual="1"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 60);
    return () => window.clearTimeout(id);
  }, [busca, ocorrenciaAtual, abaId]);

  const confirmarRenome = () => {
    if (abaRenomeando) setDados((d) => renomearAba(d, abaRenomeando, nomeSubAba));
    setAbaRenomeando(null);
  };

  // Exclui a sub-aba na hora e oferece "Desfazer" por ~6s (restaura na posição).
  const excluirAba = (a: { id: string; rotulo: string }) => {
    if (dados.abas.length <= 1) return; // nunca apaga a última
    const idx = dados.abas.findIndex((x) => x.id === a.id);
    if (idx < 0) return;
    const abaRemovida = dados.abas[idx];
    const restantes = dados.abas.filter((x) => x.id !== a.id);
    setDados(removerAba(dados, a.id));
    if (abaId === a.id) setAbaId(restantes[0]?.id ?? 'pecas');
    setDesfazerAba({ aba: abaRemovida, idx });
    if (desfazerTimer.current) window.clearTimeout(desfazerTimer.current);
    desfazerTimer.current = window.setTimeout(() => setDesfazerAba(null), 6000);
  };

  const restaurarAba = () => {
    if (!desfazerAba) return;
    const { aba: abaSalva, idx } = desfazerAba;
    setDados((d) => ({ ...d, abas: [...d.abas.slice(0, idx), abaSalva, ...d.abas.slice(idx)] }));
    setAbaId(abaSalva.id);
    if (desfazerTimer.current) window.clearTimeout(desfazerTimer.current);
    setDesfazerAba(null);
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

  // Copia a linha inteira (células separadas por TAB — cola em planilha/WhatsApp).
  const copiarLinha = (linha: string[], chave: string) => {
    const texto = linha.join('\t').trim();
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopiado(chave);
    window.setTimeout(() => setCopiado((c) => (c === chave ? null : c)), 2000);
  };

  // Excluir linha pede confirmação antes (evita perder os dados por engano).
  const excluirLinha = (abaId: string, tabelaId: string, linha: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta linha?')) return;
    setDados((d) => removerLinha(d, abaId, tabelaId, linha));
  };

  // Excluir coluna (título + células daquela coluna) também pede confirmação.
  const excluirColuna = (abaId: string, tabelaId: string, coluna: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta coluna?')) return;
    setDados((d) => removerColuna(d, abaId, tabelaId, coluna));
  };

  // Solta o mouse em qualquer lugar encerra o "arrastar para selecionar".
  useEffect(() => {
    const soltar = () => { arrastandoSelecao.current = false; };
    window.addEventListener('mouseup', soltar);
    return () => window.removeEventListener('mouseup', soltar);
  }, []);

  // Começa a seleção na célula: clique simples deixa só ela marcada (desmarca
  // as demais); Shift+clique estende o bloco atual.
  const iniciarSelecao = (tabelaId: string, r: number, c: number, shift: boolean) => {
    setSelecao((s) =>
      shift && s && s.tabelaId === tabelaId ? { ...s, r2: r, c2: c } : { tabelaId, r1: r, c1: c, r2: r, c2: c },
    );
    arrastandoSelecao.current = true;
  };

  // Passar o mouse (com o botão pressionado) pelas células estende a seleção.
  const estenderSelecao = (tabelaId: string, r: number, c: number) => {
    if (!arrastandoSelecao.current) return;
    setSelecao((s) => (s && s.tabelaId === tabelaId ? (s.r2 === r && s.c2 === c ? s : { ...s, r2: r, c2: c }) : s));
    document.getSelection()?.removeAllRanges();
  };

  const celulaNaSelecao = (tabelaId: string, r: number, c: number): boolean => {
    if (!selecao || selecao.tabelaId !== tabelaId) return false;
    const rA = Math.min(selecao.r1, selecao.r2);
    const rB = Math.max(selecao.r1, selecao.r2);
    const cA = Math.min(selecao.c1, selecao.c2);
    const cB = Math.max(selecao.c1, selecao.c2);
    return r >= rA && r <= rB && c >= cA && c <= cB;
  };

  // Texto de um bloco de células (TAB entre colunas, Enter entre linhas) —
  // mesmo formato de copiar de uma planilha.
  const textoDoBloco = (tabela: TabelaDados, rA: number, rB: number, cA: number, cB: number): string =>
    tabela.linhas
      .slice(rA, rB + 1)
      .map((l) => l.slice(cA, cB + 1).join('\t'))
      .join('\n');

  // TAB/Enter movem o destaque E o foco juntos (como numa planilha): TAB anda
  // para a direita (na última coluna, desce para a 1ª da linha de baixo) e
  // Enter desce uma linha; Shift+Tab/Shift+Enter voltam.
  const moverSelecao = (
    tabela: TabelaDados,
    r: number,
    c: number,
    destino: 'direita' | 'esquerda' | 'baixo' | 'cima',
  ) => {
    let nr = r;
    let nc = c;
    if (destino === 'direita') {
      nc = c + 1;
      if (nc >= tabela.colunas) {
        nc = 0;
        nr = r + 1;
      }
    } else if (destino === 'esquerda') {
      nc = c - 1;
      if (nc < 0) {
        nc = tabela.colunas - 1;
        nr = r - 1;
      }
    } else if (destino === 'baixo') {
      nr = r + 1;
    } else {
      nr = r - 1;
    }
    if (nr < 0 || nr >= tabela.linhas.length) return; // fora da tabela: não move
    setSelecao({ tabelaId: tabela.id, r1: nr, c1: nc, r2: nr, c2: nc });
    refsCelulas.current.get(chaveCelula(tabela.id, nr, nc))?.focus();
  };

  // Atalhos do bloco selecionado: Ctrl+C copia, Ctrl+X recorta (copia e apaga)
  // e Delete/Backspace apagam as células — igual a uma planilha. Com uma célula
  // só, tudo continua nativo (cortar/apagar parte do texto dentro da célula).
  const aoTeclarCelula = (e: React.KeyboardEvent, tabela: TabelaDados, r: number, c: number) => {
    if (e.key === 'Escape') {
      setSelecao(null);
      return;
    }
    if (!(e.ctrlKey || e.metaKey || e.altKey)) {
      if (e.key === 'Tab') {
        e.preventDefault();
        moverSelecao(tabela, r, c, e.shiftKey ? 'esquerda' : 'direita');
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        moverSelecao(tabela, r, c, e.shiftKey ? 'cima' : 'baixo');
        return;
      }
    }
    if (!selecao || selecao.tabelaId !== tabela.id) return;
    const rA = Math.min(selecao.r1, selecao.r2);
    const rB = Math.max(selecao.r1, selecao.r2);
    const cA = Math.min(selecao.c1, selecao.c2);
    const cB = Math.max(selecao.c1, selecao.c2);
    if (rA === rB && cA === cB) return; // uma célula só: deixa o comportamento normal
    const ctrl = e.ctrlKey || e.metaKey;
    const tecla = e.key.toLowerCase();
    if (ctrl && tecla !== 'c' && tecla !== 'x') return;
    if (!ctrl && e.key !== 'Delete' && e.key !== 'Backspace') return;
    e.preventDefault();
    if (ctrl) navigator.clipboard.writeText(textoDoBloco(tabela, rA, rB, cA, cB));
    if ((ctrl && tecla === 'x') || !ctrl) {
      setDados((d) => limparBloco(d, aba.id, selecao.tabelaId, rA, cA, rB, cB));
    }
  };

  // Colar de planilha/Notion: TAB separa colunas e Enter separa linhas — o
  // bloco é distribuído a partir da célula (cria linhas se precisar).
  const aoColarCelula = (
    e: React.ClipboardEvent<HTMLInputElement>,
    abaId: string,
    tabelaId: string,
    r: number,
    c: number,
  ) => {
    const texto = e.clipboardData.getData('text/plain');
    if (!texto || (!texto.includes('\t') && !texto.includes('\n') && !texto.includes('\r'))) return;
    e.preventDefault();
    const bloco = texto
      .replace(/\r/g, '')
      .replace(/\n+$/, '')
      .split('\n')
      .map((l) => l.split('\t').map((v) => v.trim()));
    setDados((d) => colarBloco(d, abaId, tabelaId, r, c, bloco));
  };

  return (
    <>
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
              onKeyDown={(e) => {
                if (e.key !== 'Enter' || !busca.trim()) return;
                e.preventDefault();
                irParaOcorrencia(e.shiftKey ? -1 : 1);
              }}
              placeholder="Pesquisar nas tabelas…"
              title="Enter vai para o próximo resultado (Shift+Enter volta)"
              className="campo-tema w-full border border-slate-800 rounded-xl pl-11 pr-24 py-3 text-base font-bold text-slate-100 focus:border-blue-500 outline-none"
            />
            {buscaAtiva && (
              <span className="absolute right-10 top-1/2 -translate-y-1/2 max-w-[55%] truncate pointer-events-none text-[10px] font-black uppercase tracking-widest text-slate-500">
                {ocorrencias.length > 0
                  ? `${indiceAtual + 1} de ${ocorrencias.length}${resumoBusca ? ` · ${resumoBusca}` : ''}`
                  : 'Nenhum resultado'}
              </span>
            )}
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
                  onClick={() => {
                    setAbaId(a.id);
                    if (buscaAtiva) {
                      const i = ocorrencias.findIndex((o) => o.abaId === a.id);
                      if (i >= 0) setOcorrenciaAtual(i);
                    }
                  }}
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

            // Copiar/excluir linha (+ caixinha) no fim de cada linha; no
            // cabeçalho cabem 3 botões (adicionar coluna, ordenar e excluir).
            const larguraAcoes = 92;
            const larguraTotal = tabela.larguras.reduce((a, b) => a + b, 0) + larguraAcoes;
            // Ocorrência da busca que está em destaque (Enter percorre).
            const atual =
              ocorrencia && ocorrencia.abaId === aba.id && ocorrencia.tabelaId === tabela.id ? ocorrencia : null;

            return (
              <div key={tabela.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden mb-6">
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
                          const atualAqui = atual?.tipo === 'titulo' && atual.coluna === coluna;
                          return (
                            <th key={coluna} className={`relative group border border-slate-800 p-0 ${atualAqui ? 'bg-amber-400/80' : marcado ? 'bg-amber-500/20' : 'bg-slate-950/60'}`}>
                              <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setDados((d) => atualizarTitulo(d, aba.id, tabela.id, coluna, e.target.value))}
                                onMouseDown={() => setSelecao(null)}
                                data-marcado={marcado ? '1' : undefined}
                                data-atual={atualAqui ? '1' : undefined}
                                className={`w-full bg-transparent px-3 py-1.5 pr-9 text-lg font-black uppercase outline-none focus:bg-slate-900 ${atualAqui ? 'text-slate-950 ring-2 ring-inset ring-amber-400' : marcado ? 'text-amber-200' : 'text-slate-100'}`}
                              />
                              {/* excluir a coluna (título + células dela) — some com 1 coluna só */}
                              {tabela.titulos.length > 1 && (
                                <button
                                  type="button"
                                  tabIndex={-1}
                                  onClick={() => excluirColuna(aba.id, tabela.id, coluna)}
                                  aria-label={`Excluir coluna ${coluna + 1}`}
                                  title="Excluir coluna"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                                >
                                  <X size={13} />
                                </button>
                              )}
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
                        {/* Cabeçalho da coluna de opções: adicionar coluna e ordenar. */}
                        <th className="border border-slate-800 bg-slate-950/60 p-1 text-center">
                          <span className="inline-flex items-center justify-center gap-1">
                            {tabela.colunas < MAX_COLUNAS && (
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setDados((d) => adicionarColuna(d, aba.id, tabela.id))}
                                aria-label="Adicionar coluna"
                                title="Adicionar coluna no fim"
                                className="inline-flex items-center justify-center p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 border border-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
                              >
                                <Plus size={14} strokeWidth={2.5} />
                              </button>
                            )}
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={() => { setSelecao(null); setOrdenando({ abaId: aba.id, tabelaId: tabela.id, titulos: [...tabela.titulos] }); }}
                              aria-label="Ordenar tabela"
                              title="Ordenar por coluna (A–Z / Z–A)"
                              className="inline-flex items-center justify-center p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 border border-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
                            >
                              <ArrowUpDown size={14} />
                            </button>
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabela.linhas.map((linha, r) => (
                        <tr key={r}>
                          {linha.map((valor, coluna) => {
                            const marcado = buscaAtiva && celulaContem(valor, busca);
                            const selecionada = celulaNaSelecao(tabela.id, r, coluna);
                            const atualAqui = atual?.tipo === 'celula' && atual.linha === r && atual.coluna === coluna;
                            const chave = `${tabela.id}-${r}-${coluna}`;
                            return (
                              <td
                                key={coluna}
                                data-selecionada={selecionada ? '1' : undefined}
                                onMouseEnter={() => estenderSelecao(tabela.id, r, coluna)}
                                className={`relative group border border-slate-800 p-0 ${marcado && !atualAqui ? 'bg-amber-500/20' : ''}`}
                              >
                                <input
                                  type="text"
                                  value={valor}
                                  ref={(el) => {
                                    const k = chaveCelula(tabela.id, r, coluna);
                                    if (el) refsCelulas.current.set(k, el);
                                    else refsCelulas.current.delete(k);
                                  }}
                                  onChange={(e) => setDados((d) => atualizarCelula(d, aba.id, tabela.id, r, coluna, e.target.value))}
                                  onMouseDown={(e) => iniciarSelecao(tabela.id, r, coluna, e.shiftKey)}
                                  onKeyDown={(e) => aoTeclarCelula(e, tabela, r, coluna)}
                                  onPaste={(e) => aoColarCelula(e, aba.id, tabela.id, r, coluna)}
                                  data-marcado={marcado ? '1' : undefined}
                                  data-atual={atualAqui ? '1' : undefined}
                                  className={`w-full px-3 py-1 pr-9 text-lg font-bold outline-none ${
                                    atualAqui
                                      ? 'bg-amber-400/80 text-slate-950 ring-2 ring-inset ring-amber-400'
                                      : `${selecionada ? 'bg-blue-600/35 ring-2 ring-inset ring-blue-500' : 'bg-transparent focus:bg-slate-900'} ${
                                          marcado ? 'text-amber-200' : tabela.marcados[r] ? 'text-slate-500 line-through' : 'text-slate-200'
                                        }`
                                  }`}
                                />
                                {valor && (
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => copiarCelula(valor, chave)}
                                    aria-label={`Copiar célula ${r + 1}-${coluna + 1}`}
                                    title="Copiar conteúdo da célula"
                                    className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 ${
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
                            {/* Ações com o mesmo tamanho e o mesmo espaçamento
                                (a caixinha, o copiar e o excluir). */}
                            <span className="inline-flex items-center justify-center gap-1.5">
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
                                tabIndex={-1}
                                onClick={() => copiarLinha(linha, `${tabela.id}-linha-${r}`)}
                                aria-label={`Copiar linha ${r + 1}`}
                                title="Copiar a linha toda"
                                className={`flex items-center justify-center w-6 h-6 rounded-md transition-colors cursor-pointer ${
                                  copiado === `${tabela.id}-linha-${r}`
                                    ? 'bg-green-600 text-white'
                                    : 'text-slate-600 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                              >
                                {copiado === `${tabela.id}-linha-${r}` ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                              </button>
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => excluirLinha(aba.id, tabela.id, r)}
                                aria-label={`Excluir linha ${r + 1}`}
                                title="Excluir linha"
                                className="flex items-center justify-center w-6 h-6 rounded-md text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Barra de baixo com a largura da tabela: o + fica abaixo da
                      1ª coluna e o excluir tabela abaixo da última coluna/linha
                      (e rolam juntos quando a tabela é mais larga que o card). */}
                  <div
                    style={{ width: larguraTotal }}
                    className="p-3 border-x border-b border-slate-800 bg-slate-950/30 flex items-center justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => setDados((d) => adicionarLinha(d, aba.id, tabela.id))}
                      aria-label="Adicionar linha"
                      title="Adicionar linha"
                      className="flex items-center justify-center w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setDados((d) => removerTabela(d, aba.id, tabela.id))}
                      aria-label="Excluir tabela"
                      title="Excluir tabela"
                      className="flex items-center justify-center w-9 h-9 bg-slate-800 hover:bg-red-600 text-slate-300 border border-slate-700 rounded-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    <OrdenarTabela
      aberto={Boolean(ordenando)}
      titulos={ordenando?.titulos ?? []}
      onFechar={() => setOrdenando(null)}
      onOrdenar={(coluna, direcao) => {
        if (!ordenando) return;
        setDados((d) => ordenarPorColuna(d, ordenando.abaId, ordenando.tabelaId, coluna, direcao));
        setOrdenando(null);
      }}
    />
    {desfazerAba && (
      <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-[200] flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3 shadow-2xl max-w-[92vw]">
        <span className="text-sm font-bold text-slate-200 truncate">
          Sub-aba “{desfazerAba.aba.rotulo}” excluída
        </span>
        <button
          type="button"
          onClick={restaurarAba}
          className="shrink-0 text-sm font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 cursor-pointer"
        >
          Desfazer
        </button>
      </div>
    )}
    </>
  );
};

export default DadosApp;
