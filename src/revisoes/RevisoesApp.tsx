import React, { useEffect, useState } from 'react';
import { Check, Copy, Eraser, Play, Plus, Trash2 } from 'lucide-react';
import NeonCard from '../components/NeonCard';
import ClearButton from '../components/ClearButton';
import BotaoWhats from '../components/BotaoWhats';
import { BotaoRelogio, EditorLembrete } from '../components/LembreteRelogio';
import { formatarLembrete, LEMBRETES_EVENTO } from '../utils/lembretes';
import {
  formatarKmPorDia,
  formatarKmPtBr,
  lerRascunhoRevisoes,
  ordenarPorData,
  parseTextoRevisoes,
  projetarProxima,
  salvarRascunhoRevisoes,
  type DadosRevisoes,
} from './utils/parseRevisoes';
import {
  adicionarAhistoricoRevisoes,
  atualizarContatoRevisao,
  atualizarDataPrevista,
  atualizarLembreteRevisao,
  dataPtBrParaInput,
  dataPtBrParaISOManha,
  inputParaDataPtBr,
  listarHistoricoRevisoes,
  ordenarPorPrevisao,
  removerDoHistoricoRevisoes,
  type RevisaoAgendada,
} from './utils/historicoRevisoes';

const RevisoesApp: React.FC<{ destaqueId?: string | null }> = ({ destaqueId = null }) => {
  const [texto, setTexto] = useState<string>(lerRascunhoRevisoes);
  const [dados, setDados] = useState<DadosRevisoes | null>(() => {
    const inicial = lerRascunhoRevisoes();
    return inicial.trim() ? parseTextoRevisoes(inicial) : null;
  });
  const [copiado, setCopiado] = useState(false);
  // Nome/telefone do cliente (abaixo da projeção): entram na lista ao salvar.
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [salvoAgora, setSalvoAgora] = useState(false);
  // Lista de previsões (chassi + data): recarrega no sino/storage também.
  const [lista, setLista] = useState<RevisaoAgendada[]>(listarHistoricoRevisoes);
  const [lembreteAberto, setLembreteAberto] = useState<string | null>(null);

  useEffect(() => {
    salvarRascunhoRevisoes(texto);
  }, [texto]);

  useEffect(() => {
    const recarregar = () => setLista(listarHistoricoRevisoes());
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
  const passagensRecentes = dados ? ordenarPorData(dados.passagens).reverse() : [];
  const listaOrdenada = ordenarPorPrevisao(lista);

  const textoProjecao =
    dados && projecao
      ? [
          dados.chassi ? `Chassi: ${dados.chassi}` : '',
          dados.veiculo ? `Veículo: ${dados.veiculo}` : '',
          `Última: ${projecao.baseAbertura} · ${formatarKmPtBr(projecao.baseKm)} km (${projecao.baseDescricao})`,
          projecao.kmPorDia !== null
            ? `Ritmo: ${formatarKmPorDia(projecao.kmPorDia)} km/dia em ${projecao.diasTotais} dias (${formatarKmPtBr(projecao.kmTotais)} km)`
            : 'Ritmo: sem histórico suficiente (1 passagem só)',
          projecao.dataEstimadaPorRitmo
            ? `Pelo ritmo chega aos ${formatarKmPtBr(projecao.kmAlvo)} km em ${projecao.dataEstimadaPorRitmo}`
            : `Limite: ${formatarKmPtBr(projecao.kmAlvo)} km ou ${projecao.dataLimite}`,
          projecao.revisaoProxima !== null
            ? `Previsão: revisão ${String(projecao.revisaoProxima).padStart(2, '0')} — ${projecao.dataPrevista} (${projecao.motivoPrevisao === 'ritmo' ? 'pelo ritmo' : 'pelo limite de 12 meses'})`
            : `Previsão: ${projecao.dataPrevista} (${projecao.motivoPrevisao === 'ritmo' ? 'pelo ritmo' : 'pelo limite de 12 meses'})`,
        ]
          .filter(Boolean)
          .join('\n')
      : '';

  const copiarProjecao = () => {
    if (!textoProjecao) return;
    navigator.clipboard.writeText(textoProjecao);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
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

  return (
    <div className="ui-compacta pt-1 pb-16 text-slate-200">
      <div className="max-w-[1150px] mx-auto space-y-6">
        <div className="grid gap-6 lg:grid-cols-2 items-start">
        <NeonCard
          title="COLAR PASSAGENS"
          borderColor="blue-600"
          compact
          actions={<ClearButton onClick={() => { setTexto(''); setDados(null); }} label="Limpar passagens" />}
        >
          <textarea
            className="campo-tema w-full h-[280px] p-6 text-lg font-mono leading-relaxed border border-slate-800 rounded-2xl focus:border-blue-500 outline-none transition-colors resize-none overflow-x-auto whitespace-pre scrollbar-hide"
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
          <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase mt-2">
            O texto fica salvo neste navegador (entra no backup geral). A previsão vai para a lista
            ao lado com chassi + data.
          </p>
        </NeonCard>

        {/* Lista de previsões à direita do colar: chassi + data (editável), nome/WhatsApp, lembrete e WhatsApp. */}
        <NeonCard title={`LISTA DE PREVISÕES (${listaOrdenada.length})`} borderColor="blue-600" compact>
          {listaOrdenada.length === 0 ? (
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest py-6 text-center">
              Cole as passagens ao lado e clique em “Adicionar à lista”.
            </p>
          ) : (
            <div className="space-y-3">
              {listaOrdenada.map((item) => {
                const destacado = destaqueId === item.id;
                const lembreteTxt = formatarLembrete(item.lembreteEm);
                return (
                  <div
                    key={item.id}
                    data-revisao={item.id}
                    className={`bg-slate-950/60 border rounded-2xl p-3 space-y-2 transition-colors ${
                      destacado ? 'border-amber-400 ring-2 ring-amber-400/60' : 'border-slate-800'
                    }`}
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
                      <button
                        type="button"
                        onClick={() => excluirItem(item.id, item.chassi)}
                        aria-label={`Excluir previsão ${item.chassi}`}
                        title="Excluir previsão"
                        className="p-2 text-slate-600 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Nome + WhatsApp + previsão (editável) + WhatsApp + lembrete, numa linha só. */}
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

        {dados && (
          <>
            {!dados.chassi && !dados.veiculo && dados.passagens.length === 0 && (
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest py-4 text-center">
                Nada reconhecido — confira o texto colado.
              </p>
            )}

            {passagensRecentes.length > 0 && (
              <NeonCard title={`PASSAGENS (${passagensRecentes.length})`} borderColor="#f59e0b" compact>
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
                            {p.descricao}
                            {p.extras.length > 0 && (
                              <span className="block text-xs text-slate-500">+{p.extras.length} item(ns) extra(s)</span>
                            )}
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
                actions={
                  <button
                    type="button"
                    onClick={copiarProjecao}
                    aria-label={copiado ? 'Projeção copiada' : 'Copiar projeção'}
                    title={copiado ? 'Projeção copiada' : 'Copiar projeção'}
                    className={`flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                      copiado
                        ? 'bg-green-600 border-green-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {copiado ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
                  </button>
                }
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
                <p
                  className="text-lg leading-relaxed text-slate-200 whitespace-pre-wrap mt-3"
                  style={{ fontFamily: 'var(--tema-fonte-conteudo)' }}
                >
                  {textoProjecao}
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase mt-2">
                  Previsão pelo quanto roda: chega aos {formatarKmPtBr(projecao.kmAlvo)} km em{' '}
                  {projecao.dataEstimadaPorRitmo ?? projecao.dataLimite} — vale a mais próxima entre
                  ela e o limite de 12 meses ({projecao.dataLimite}).
                </p>

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
    </div>
  );
};

export default RevisoesApp;
