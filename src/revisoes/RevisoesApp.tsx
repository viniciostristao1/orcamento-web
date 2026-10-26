import React, { useEffect, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, CalendarArrowDown, Check, ClockArrowDown, ClockArrowUp, Copy, Eraser, PhoneOff, Play, Plus, Search, StickyNote, Trash2, X } from 'lucide-react';
import NeonCard from '../components/NeonCard';
import ClearButton from '../components/ClearButton';
import BotaoWhats from '../components/BotaoWhats';
import { BotaoRelogio, EditorLembrete } from '../components/LembreteRelogio';
import { formatarLembrete, LEMBRETES_EVENTO } from '../utils/lembretes';
import {
  formatarKmPorDia,
  formatarKmPtBr,
  lerRascunhoRevisoes,
  limparDescricaoRevisao,
  ordenarPorData,
  parseTextoRevisoes,
  projetarProxima,
  salvarRascunhoRevisoes,
  textoPassagensParaCopiar,
  type DadosRevisoes,
} from './utils/parseRevisoes';
import {
  adicionarAhistoricoRevisoes,
  atualizarChamadoRevisao,
  atualizarContatoRevisao,
  atualizarDataPrevista,
  atualizarLembreteRevisao,
  atualizarNotaRevisao,
  dataPtBrParaInput,
  dataPtBrParaISOManha,
  inputParaDataPtBr,
  filtrarListaRevisoes,
  lerOrdemListaRevisoes,
  lerUltimaBusca,
  limparChamadosRevisoes,
  listarHistoricoRevisoes,
  ordenarListaRevisoes,
  ORDENS_LISTA_REVISOES,
  removerDoHistoricoRevisoes,
  salvarOrdemListaRevisoes,
  salvarUltimaBusca,
  textoListaParaExcel,
  type OrdemListaRevisoes,
  type RevisaoAgendada,
} from './utils/historicoRevisoes';

/** Ícone + título do botão de ordem para cada modo (ciclo: previsão → lembretes → adição). */
const ORDEM_INFO: Record<OrdemListaRevisoes, { titulo: string; Icone: typeof CalendarArrowDown }> = {
  previsao: { titulo: 'Previsão próxima primeiro — clique para: lembrete mais próximo', Icone: CalendarArrowDown },
  'lembrete-proximo': { titulo: 'Lembrete mais próximo primeiro — clique para: lembrete mais distante', Icone: ClockArrowDown },
  'lembrete-distante': { titulo: 'Lembrete mais distante primeiro — clique para: adição mais recente', Icone: ClockArrowUp },
  'adicao-recente': { titulo: 'Adicionados recentes primeiro — clique para: ordem de adição', Icone: ArrowDownWideNarrow },
  'adicao-antiga': { titulo: 'Ordem de adição (antigos primeiro) — clique para: previsão próxima', Icone: ArrowUpNarrowWide },
};

const RevisoesApp: React.FC<{ destaqueId?: string | null }> = ({ destaqueId = null }) => {
  const [texto, setTexto] = useState<string>(lerRascunhoRevisoes);
  const [dados, setDados] = useState<DadosRevisoes | null>(() => {
    const inicial = lerRascunhoRevisoes();
    return inicial.trim() ? parseTextoRevisoes(inicial) : null;
  });
  // Nome/telefone do cliente (abaixo da projeção): entram na lista ao salvar.
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [salvoAgora, setSalvoAgora] = useState(false);
  // Lista de previsões (chassi + data): recarrega no sino/storage também.
  const [lista, setLista] = useState<RevisaoAgendada[]>(listarHistoricoRevisoes);
  // Ordem da lista (botão no header: previsão → lembretes → adição; gravada no navegador).
  const [ordemLista, setOrdemLista] = useState<OrdemListaRevisoes>(lerOrdemListaRevisoes);
  // Data da última busca de clientes para prever revisão (ao lado do copiar).
  const [ultimaBusca, setUltimaBusca] = useState<string>(lerUltimaBusca);
  const [lembreteAberto, setLembreteAberto] = useState<string | null>(null);
  const [copiadoPassagens, setCopiadoPassagens] = useState(false);
  const [copiadoLista, setCopiadoLista] = useState(false);
  // Busca na lista (lupa do header): filtra por nome do cliente ou chassi.
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState('');
  // Nota do item: editor aberto + rascunho + feedback de cópia.
  const [notaAberta, setNotaAberta] = useState<string | null>(null);
  const [rascunhoNota, setRascunhoNota] = useState('');
  const [notaCopiada, setNotaCopiada] = useState<string | null>(null);

  useEffect(() => {
    salvarRascunhoRevisoes(texto);
  }, [texto]);

  useEffect(() => {
    const recarregar = () => {
      setLista(listarHistoricoRevisoes());
      setUltimaBusca(lerUltimaBusca());
    };
    window.addEventListener(LEMBRETES_EVENTO, recarregar);
    window.addEventListener('storage', recarregar);
    return () => {
      window.removeEventListener(LEMBRETES_EVENTO, recarregar);
      window.removeEventListener('storage', recarregar);
    };
  }, []);

  // Clique no aviso/sino: destaca o item da lista e rola até ele.
  useEffect(() => {
    if (!destaqueId) return;
    const t = window.setTimeout(() => {
      document.querySelector(`[data-revisao="${destaqueId}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(t);
  }, [destaqueId]);

  const processar = () => {
    if (!texto.trim()) {
      alert('Cole as passagens copiadas do portal Toyota no campo acima.');
      return;
    }
    const parsed = parseTextoRevisoes(texto);
    setDados(parsed);
    if (parsed.passagens.length === 0) {
      alert('Nenhuma passagem encontrada no texto — confira se colou a tabela com Data e KM.');
    }
  };

  const projecao = dados ? projetarProxima(dados.passagens) : null;
  const passagensOrdenadas = dados ? ordenarPorData(dados.passagens) : [];
  // Só as 3 últimas (a previsão usa o histórico completo).
  const passagensRecentes = [...passagensOrdenadas].reverse().slice(0, 3);
  const listaOrdenada = ordenarListaRevisoes(lista, ordemLista);
  // Busca (lupa): filtra por nome do cliente ou chassi; o copiar segue o visível.
  const listaVisivel = busca.trim() ? filtrarListaRevisoes(listaOrdenada, busca) : listaOrdenada;

  // Alterna a ordem da lista (previsão → lembrete próximo → distante → adição recente → antiga).
  const alternarOrdemLista = () => {
    const idx = ORDENS_LISTA_REVISOES.indexOf(ordemLista);
    const proxima = ORDENS_LISTA_REVISOES[(idx + 1) % ORDENS_LISTA_REVISOES.length];
    salvarOrdemListaRevisoes(proxima);
    setOrdemLista(proxima);
  };

  // Colar → calcular → lista (chassi + data prevista pelo ritmo). Mesmo chassi atualiza.
  const salvarNaLista = () => {
    if (!dados || !projecao) return;
    const chassi = (dados.chassi ?? '').trim().toUpperCase();
    if (!chassi) {
      alert('Chassi não encontrado no texto — confira se colou o cabeçalho com "Chassi:".');
      return;
    }
    const out = adicionarAhistoricoRevisoes({
      chassi,
      veiculo: dados.veiculo ?? '',
      nome,
      telefone,
      ultimaAbertura: projecao.baseAbertura,
      ultimoKm: projecao.baseKm,
      kmAlvo: projecao.kmAlvo,
      revisaoProxima: projecao.revisaoProxima,
      dataPrevista: projecao.dataPrevista,
      motivoPrevisao: projecao.motivoPrevisao,
      ritmoKmPorDia: projecao.kmPorDia,
      lembreteEm: dataPtBrParaISOManha(projecao.dataPrevista),
      observacao: '',
    });
    setLista(out);
    setNome('');
    setTelefone('');
    setSalvoAgora(true);
    window.setTimeout(() => setSalvoAgora(false), 2500);
  };

  const excluirItem = (id: string, chassi: string) => {
    if (!window.confirm(`Excluir a previsão do chassi ${chassi || 'sem chassi'}?`)) return;
    setLista(removerDoHistoricoRevisoes(id));
  };

  // Copia as passagens visíveis (DATA ⇥ KM ⇥ REVISÃO): sem OS e sem extras.
  const copiarPassagens = () => {
    const t = textoPassagensParaCopiar(passagensRecentes);
    if (!t) return;
    navigator.clipboard.writeText(t);
    setCopiadoPassagens(true);
    window.setTimeout(() => setCopiadoPassagens(false), 2000);
  };

  // Copia a lista para colar no Excel (TAB entre colunas, com cabeçalho; segue o filtro).
  const copiarLista = () => {
    if (listaVisivel.length === 0) return;
    navigator.clipboard.writeText(textoListaParaExcel(listaVisivel));
    setCopiadoLista(true);
    window.setTimeout(() => setCopiadoLista(false), 2000);
  };

  // Apaga da lista os marcados como "já chamei" (segundo contato já tentado).
  const nChamados = lista.filter((r) => r.chamado).length;
  const limparChamados = () => {
    if (nChamados === 0) return;
    if (!window.confirm(`Apagar da lista os ${nChamados} marcado(s) como chamado?`)) return;
    setLista(limparChamadosRevisoes());
  };

  return (
    <div className="ui-compacta pt-1 pb-16 text-slate-200">
      <div className="mx-auto space-y-6">
        <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0 space-y-6">
        <NeonCard
          title="COLAR PASSAGENS"
          borderColor="blue-600"
          compact
          actions={<ClearButton onClick={() => { setTexto(''); setDados(null); }} label="Limpar passagens" />}
        >
          <textarea
            className="campo-tema w-full h-[190px] p-6 text-lg font-mono leading-relaxed border border-slate-800 rounded-2xl focus:border-blue-500 outline-none transition-colors resize-none overflow-x-auto whitespace-pre scrollbar-hide"
            placeholder="Cole aqui as passagens copiadas do portal Toyota (Chassi, Veículo, Toyota 10 e a tabela Posição/Abertura/KM/OS...)"
            value={texto}
            wrap="off"
            onChange={(e) => setTexto(e.target.value)}
            aria-label="Texto das passagens do portal Toyota"
          />
          <button
            onClick={processar}
            type="button"
            aria-label="Processar revisões"
            title="Processar revisões"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl shadow-2xl transition-all flex items-center justify-center active:scale-[0.98] cursor-pointer"
          >
            <Play size={28} fill="currentColor" />
          </button>
        </NeonCard>

        {dados && (
          <>
            {!dados.chassi && !dados.veiculo && dados.passagens.length === 0 && (
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest py-4 text-center">
                Nada reconhecido — confira o texto colado.
              </p>
            )}

            {passagensRecentes.length > 0 && (
              <NeonCard title={passagensOrdenadas.length > 3 ? `PASSAGENS (ÚLTIMAS 3 DE ${passagensOrdenadas.length})` : `PASSAGENS (${passagensOrdenadas.length})`} borderColor="#f59e0b" compact
                actions={
                  <button
                    type="button"
                    onClick={copiarPassagens}
                    aria-label={copiadoPassagens ? 'Passagens copiadas' : 'Copiar passagens'}
                    title={copiadoPassagens ? 'Passagens copiadas' : 'Copiar passagens (sem OS)'}
                    className={`flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                      copiadoPassagens
                        ? 'bg-green-600 border-green-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {copiadoPassagens ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
                  </button>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Data</th>
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">KM</th>
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">OS</th>
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Revisão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passagensRecentes.map((p, i) => (
                        <tr key={`${p.os}-${i}`} className="border-b border-slate-800/50 last:border-0">
                          <td className="px-3 py-2 text-base font-bold text-slate-100 whitespace-nowrap">{p.abertura}</td>
                          <td className="px-3 py-2 text-base font-bold text-slate-100 text-right whitespace-nowrap">
                            {formatarKmPtBr(p.km)}
                          </td>
                          <td className="px-3 py-2 text-base text-slate-400 whitespace-nowrap">{p.os}</td>
                          <td className="px-3 py-2 text-base text-slate-200">
                            {limparDescricaoRevisao(p.descricao)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </NeonCard>
            )}

            {projecao && (
              <NeonCard
                title="PRÓXIMA REVISÃO"
                borderColor="emerald-500"
                compact
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">KM alvo</span>
                    <span className="titulo-tema text-xl font-black text-slate-100">
                      {formatarKmPtBr(projecao.kmAlvo)} km
                    </span>
                  </div>
                  <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Data limite</span>
                    <span className="titulo-tema text-xl font-black text-slate-100">{projecao.dataLimite}</span>
                  </div>
                  <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Ritmo médio</span>
                    <span className="titulo-tema text-xl font-black text-slate-100">
                      {projecao.kmPorDia !== null ? `${formatarKmPorDia(projecao.kmPorDia)} km/dia` : '—'}
                    </span>
                    {projecao.kmPorDia !== null && (
                      <span className="block text-[10px] font-bold text-slate-500">
                        {formatarKmPtBr(projecao.kmTotais)} km em {projecao.diasTotais} dias
                        {projecao.ultimoKmPorDia !== null && ` · último ${formatarKmPorDia(projecao.ultimoKmPorDia)}`}
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-2 bg-emerald-600/10 rounded-2xl border border-emerald-500/30 text-center">
                    <span className="text-[10px] font-black text-emerald-500 uppercase block mb-0.5">Previsão</span>
                    <span className="titulo-tema text-xl font-black text-emerald-400">{projecao.dataPrevista}</span>
                    <span className="block text-[10px] font-bold text-emerald-500">
                      {projecao.motivoPrevisao === 'ritmo' ? 'pelo ritmo' : 'pelo limite'}
                      {projecao.dataEstimadaPorRitmo && projecao.motivoPrevisao === 'limite'
                        ? ` (ritmo daria ${projecao.dataEstimadaPorRitmo})`
                        : ''}
                    </span>
                  </div>
                </div>
                {/* Nome + WhatsApp do cliente: entram na lista ao salvar. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome do cliente — ex.: JOÃO DA SILVA"
                      maxLength={60}
                      aria-label="Nome do cliente"
                      className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-lg font-bold text-white uppercase tracking-wide focus:border-emerald-500 outline-none"
                    />
                    {nome && (
                      <button
                        type="button"
                        onClick={() => setNome('')}
                        aria-label="Limpar nome"
                        title="Limpar nome"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Eraser size={16} />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="WhatsApp — ex.: 51 99999-9999"
                      maxLength={20}
                      aria-label="WhatsApp do cliente"
                      className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-lg font-bold text-white tracking-wide focus:border-emerald-500 outline-none"
                    />
                    {telefone && (
                      <button
                        type="button"
                        onClick={() => setTelefone('')}
                        aria-label="Limpar WhatsApp"
                        title="Limpar WhatsApp"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Eraser size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={salvarNaLista}
                  type="button"
                  aria-label="Adicionar previsão à lista"
                  title="Adicionar previsão à lista (chassi + data)"
                  className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer text-sm uppercase tracking-widest"
                >
                  <Plus size={20} strokeWidth={3} />
                  {salvoAgora ? 'Salvo na lista!' : 'Adicionar à lista'}
                </button>
              </NeonCard>
            )}
          </>
        )}
        </div>

        {/* Lista de previsões à direita: chassi + data (editável), nome/WhatsApp, lembrete e WhatsApp. */}
        <NeonCard title={`LISTA DE PREVISÕES (${listaOrdenada.length})`} borderColor="blue-600" compact
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBuscaAberta((a) => !a)}
                aria-label="Buscar na lista"
                title="Buscar por nome do cliente ou chassi"
                aria-pressed={buscaAberta}
                className={`flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  buscaAberta
                    ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Search size={18} />
              </button>
              {(() => {
                const { titulo, Icone } = ORDEM_INFO[ordemLista];
                return (
                  <button
                    type="button"
                    onClick={alternarOrdemLista}
                    disabled={listaOrdenada.length === 0}
                    aria-label="Alternar ordem da lista"
                    title={titulo}
                    className="flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer active:scale-95 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border-slate-700 disabled:cursor-not-allowed"
                  >
                    <Icone size={18} />
                  </button>
                );
              })()}
              <input
                type="date"
                value={dataPtBrParaInput(ultimaBusca)}
                onChange={(e) => {
                  if (!e.target.value) {
                    salvarUltimaBusca('');
                    setUltimaBusca('');
                    return;
                  }
                  const pt = inputParaDataPtBr(e.target.value);
                  if (pt) {
                    salvarUltimaBusca(pt);
                    setUltimaBusca(pt);
                  }
                }}
                aria-label="Data da última busca de clientes"
                title="Data da última busca de clientes para prever revisão"
                className="campo-tema border border-slate-800 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-200 focus:border-blue-500 outline-none [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={copiarLista}
              aria-label={copiadoLista ? 'Lista copiada' : 'Copiar lista para Excel'}
              title={copiadoLista ? 'Lista copiada' : 'Copiar lista para Excel'}
              className={`flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                copiadoLista
                  ? 'bg-green-600 border-green-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copiadoLista ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
              </button>
              <button
                type="button"
                onClick={limparChamados}
                disabled={nChamados === 0}
                aria-label="Limpar chamados"
                title={nChamados > 0 ? `Apagar os ${nChamados} marcado(s) como chamado` : 'Nenhum chamado para apagar'}
                className="flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer active:scale-95 bg-slate-800 hover:bg-red-600 disabled:opacity-40 text-slate-200 border-slate-700 disabled:cursor-not-allowed"
              >
                <PhoneOff size={18} />
              </button>
            </div>
          }
        >
          {buscaAberta && (
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  autoFocus
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou chassi… (ex.: JOÃO, 9BRK)"
                  aria-label="Buscar por nome ou chassi"
                  className="w-full campo-tema border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-base font-bold text-white focus:border-blue-500 outline-none"
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
                {listaVisivel.length} de {listaOrdenada.length}
              </span>
            </div>
          )}
          {listaOrdenada.length === 0 ? (
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest py-6 text-center">
              Cole as passagens ao lado e clique em “Adicionar à lista”.
            </p>
          ) : listaVisivel.length === 0 ? (
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest py-6 text-center">
              Nenhuma previsão com “{busca.trim()}”.
            </p>
          ) : (
            <div className="space-y-3">
              {listaVisivel.map((item) => {
                const destacado = destaqueId === item.id;
                const lembreteTxt = formatarLembrete(item.lembreteEm);
                return (
                  <div
                    key={item.id}
                    data-revisao={item.id}
                    className={`bg-slate-950/60 border rounded-2xl p-3 space-y-2 transition-colors ${
                      destacado ? 'border-amber-400 ring-2 ring-amber-400/60' : 'border-slate-800'
                    } ${item.chamado ? 'opacity-50 saturate-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-100 tracking-wide break-words">
                          {item.chassi}
                          {item.veiculo && (
                            <span className="font-bold text-slate-400"> · {item.veiculo}</span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-500 font-bold">
                          Última {item.ultimaAbertura} · {formatarKmPtBr(item.ultimoKm)} km →{' '}
                          {item.revisaoProxima !== null ? `rev. ${String(item.revisaoProxima).padStart(2, '0')} · ` : ''}
                          {formatarKmPtBr(item.kmAlvo)} km
                          {item.ritmoKmPorDia != null
                            ? ` · ritmo ${formatarKmPorDia(item.ritmoKmPorDia)} km/dia`
                            : ''}
                          {item.motivoPrevisao ? ` (${item.motivoPrevisao === 'ritmo' ? 'pelo ritmo' : 'pelo limite'})` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setNotaAberta((a) => (a === item.id ? null : item.id));
                            setRascunhoNota(item.nota ?? '');
                          }}
                          aria-label={`Nota da revisão ${item.chassi}`}
                          title="Escrever nota sobre a revisão"
                          aria-pressed={notaAberta === item.id}
                          className={`flex items-center justify-center p-2 rounded-lg transition-all border cursor-pointer active:scale-95 ${
                            item.nota?.trim()
                              ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                          }`}
                        >
                          <StickyNote size={18} />
                        </button>
                        <input
                          type="checkbox"
                          checked={!!item.chamado}
                          onChange={(e) => setLista(atualizarChamadoRevisao(item.id, e.target.checked))}
                          aria-label="Marcar como chamado"
                          title="Já chamei (segundo contato): acinzenta o item"
                          className="w-5 h-5 accent-amber-500 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => excluirItem(item.id, item.chassi)}
                          aria-label={`Excluir previsão ${item.chassi}`}
                          title="Excluir previsão"
                          className="p-2 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Nome + WhatsApp + previsão (editável) + WhatsApp + lembrete, numa linha só. */}
                    {notaAberta === item.id && (
                      <div className="rounded-xl border border-slate-800 bg-slate-900 p-2 space-y-2">
                        <textarea
                          value={rascunhoNota}
                          onChange={(e) => setRascunhoNota(e.target.value)}
                          placeholder="Nota sobre a revisão…"
                          aria-label="Texto da nota da revisão"
                          rows={2}
                          maxLength={500}
                          className="w-full bg-transparent text-sm font-bold text-slate-100 outline-none resize-y placeholder:text-slate-600 min-h-[3rem]"
                        />
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest mr-auto ${rascunhoNota !== (item.nota ?? '') ? 'text-amber-400' : 'text-slate-600'}`}
                          >
                            {rascunhoNota !== (item.nota ?? '') ? '● não salva' : 'Salva'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setLista(atualizarNotaRevisao(item.id, rascunhoNota))}
                            aria-label="Salvar nota"
                            title="Salvar nota"
                            className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all cursor-pointer active:scale-95"
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!rascunhoNota.trim()) return;
                              navigator.clipboard.writeText(rascunhoNota);
                              setNotaCopiada(item.id);
                              window.setTimeout(() => setNotaCopiada((c) => (c === item.id ? null : c)), 2000);
                            }}
                            aria-label={notaCopiada === item.id ? 'Nota copiada' : 'Copiar nota'}
                            title={notaCopiada === item.id ? 'Nota copiada' : 'Copiar nota'}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer active:scale-95 ${
                              notaCopiada === item.id
                                ? 'bg-green-600 text-white'
                                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                            }`}
                          >
                            {notaCopiada === item.id ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRascunhoNota('')}
                            aria-label="Limpar nota"
                            title="Limpar nota"
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eraser size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!window.confirm('Apagar a nota desta revisão?')) return;
                              setLista(atualizarNotaRevisao(item.id, ''));
                              setRascunhoNota('');
                              setNotaAberta(null);
                            }}
                            aria-label="Excluir nota"
                            title="Excluir nota"
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={item.nome}
                        onChange={(e) => setLista(atualizarContatoRevisao(item.id, e.target.value, item.telefone))}
                        placeholder="Nome do cliente"
                        maxLength={60}
                        aria-label={`Nome do cliente ${item.chassi}`}
                        className="flex-1 min-w-[140px] campo-tema border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-white uppercase tracking-wide focus:border-blue-500 outline-none"
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={item.telefone}
                        onChange={(e) => setLista(atualizarContatoRevisao(item.id, item.nome, e.target.value))}
                        placeholder="WhatsApp (DDD + número)"
                        maxLength={20}
                        aria-label={`WhatsApp do cliente ${item.chassi}`}
                        className="w-40 campo-tema border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-white tracking-wide focus:border-blue-500 outline-none"
                      />
                      <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Previsão
                        </span>
                        <input
                          type="date"
                          value={dataPtBrParaInput(item.dataPrevista)}
                          onChange={(e) => {
                            const pt = inputParaDataPtBr(e.target.value);
                            if (pt) setLista(atualizarDataPrevista(item.id, pt));
                          }}
                          aria-label={`Data prevista ${item.chassi}`}
                          title="Editar a data prevista (move o lembrete junto)"
                          className="campo-tema border border-slate-800 rounded-lg px-2 py-1.5 text-base font-bold text-slate-100 focus:border-amber-500 outline-none [color-scheme:dark]"
                        />
                      </label>
                      <BotaoWhats telefone={item.telefone} />
                      <BotaoRelogio
                        lembreteEm={item.lembreteEm}
                        onAbrir={() => setLembreteAberto((a) => (a === item.id ? null : item.id))}
                      />
                      {lembreteTxt && (
                        <span className="text-[11px] font-bold text-amber-300">
                          {lembreteTxt.split(' ')[1]}
                        </span>
                      )}
                    </div>
                    {lembreteAberto === item.id && (
                      <EditorLembrete
                        inicial={item.lembreteEm}
                        obsInicial={item.observacao ?? ''}
                        temAtual={!!lembreteTxt}
                        onConfirmar={(iso, obs) => {
                          setLista(atualizarLembreteRevisao(item.id, iso, obs));
                          setLembreteAberto(null);
                        }}
                        onLimpar={() => {
                          setLista(atualizarLembreteRevisao(item.id, null));
                          setLembreteAberto(null);
                        }}
                        onFechar={() => setLembreteAberto(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </NeonCard>
        </div>

      </div>
    </div>
  );
};

export default RevisoesApp;
