import React, { useEffect, useMemo, useState } from 'react';
import { FolderOpen, List, Trash2, X } from 'lucide-react';
import {
  type FlyerSalvo,
  atualizarCorFlyer,
  atualizarLembreteFlyer,
  filtrarFlyerHistorico,
  limparFlyerHistorico,
  listarFlyerHistorico,
  removerDoFlyerHistorico,
} from '../utils/historicoFlyer';
import { filtrarPorCor, type CorCliente, type FiltroCor } from '../../utils/corCliente';
import { dataDoRegistro, formatarLembrete } from '../../utils/lembretes';
import { MarcadorCor, SeloCor, classeBordaCor } from '../../components/CorCliente';
import { BotaoRelogio, EditorLembrete } from '../../components/LembreteRelogio';
import { formatarPreco, parseInput } from '../utils/parser';
import type { PromoInfo } from '../types';
import BotaoWhats from '../../components/BotaoWhats';
import HistoricoBase from '../../components/HistoricoBase';

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
  const [filtroCor, setFiltroCor] = useState<FiltroCor>('todas');
  // Registro com o editor de lembrete aberto (data/hora).
  const [lembreteDe, setLembreteDe] = useState<string | null>(null);
  // Registro com a janelinha de detalhes aberta (marcas e preços, sem reabrir).
  const [detalhesDe, setDetalhesDe] = useState<FlyerSalvo | null>(null);

  useEffect(() => {
    if (aberto) {
      setLista(listarFlyerHistorico());
      setMsg('');
      setBuscaAberta(false);
      setBusca('');
      setFiltroCor('todas');
      setLembreteDe(null);
      setDetalhesDe(null);
    }
  }, [aberto]);

  // Marcas e preços do registro aberto em "Ver detalhes" (recalculado do texto salvo).
  const detalhesInfo: PromoInfo | null = useMemo(
    () => (detalhesDe ? parseInput(detalhesDe.inputText) : null),
    [detalhesDe],
  );

  if (!aberto) return null;

  // A contagem das cores segue a pesquisa (sem o filtro de cor, para comparar).
  const baseBusca = filtrarFlyerHistorico(lista, busca);
  const visiveis = filtrarPorCor(baseBusca, filtroCor);
  const nVerdes = baseBusca.filter((r) => r.cor === 'verde').length;
  const nVermelhos = baseBusca.filter((r) => r.cor === 'vermelho').length;

  const handleLimpar = () => {
    if (!window.confirm('Apagar TODO o histórico do Tire Flyer?')) return;
    limparFlyerHistorico();
    setLista([]);
    setMsg('Histórico apagado.');
  };

  // Excluir um flyer pede confirmação (igual ao histórico de orçamentos).
  const handleExcluir = (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este flyer?')) return;
    setLista(removerDoFlyerHistorico(id));
  };

  // Marca/desmarca a cor do cliente (salva na hora).
  const handleMudarCor = (id: string, cor: CorCliente | undefined) => {
    setLista(atualizarCorFlyer(id, cor));
  };

  // Agenda/limpa o lembrete do flyer (salva na hora; avisa o popup global).
  const handleLembrete = (id: string, iso: string | null) => {
    setLista(atualizarLembreteFlyer(id, iso));
    setLembreteDe(null);
  };

  return (
    <>
    <HistoricoBase
      titulo="HISTÓRICO — TIRE FLYER"
      onFechar={onFechar}
      onLimpar={handleLimpar}
      podeLimpar={lista.length > 0}
      buscaAberta={buscaAberta}
      onAlternarBusca={() => {
        setBuscaAberta((v) => !v);
        setBusca('');
      }}
      tituloBusca="Pesquisar (contato, telefone, cor, data ou medida)"
      busca={busca}
      onBusca={setBusca}
      placeholderBusca="Pesquisar por contato, telefone, cor, data ou medida… (ex.: JOÃO, verde, 24/09, 265/60R18)"
      totalVisiveis={visiveis.length}
      totalLista={lista.length}
      filtroCor={filtroCor}
      verdes={nVerdes}
      vermelhos={nVermelhos}
      onFiltroCor={setFiltroCor}
      msg={msg || undefined}
      vazioLista="Nenhum flyer salvo ainda."
      vazioFiltro={
        filtroCor === 'verde'
          ? 'Nenhum cliente verde.'
          : filtroCor === 'vermelho'
            ? 'Nenhum cliente vermelho.'
            : 'Nenhum flyer encontrado.'
      }
    >
      {visiveis.map((r) => {
        const lembreteFmt = formatarLembrete(r.lembreteEm);
        return (
        <div key={r.id} className={`border rounded-2xl p-4 bg-slate-950/40 transition-colors ${classeBordaCor(r.cor)}`}>
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-base font-black uppercase tracking-widest text-slate-500">
              <SeloCor cor={r.cor} />
              {dataDoRegistro(r.criadoEm)}
              <span className="text-slate-600"> · </span>
              <span className={lembreteFmt ? 'text-amber-300' : 'text-slate-600'} title={lembreteFmt ? `Lembrete em ${lembreteFmt}` : 'Sem lembrete'}>
                {lembreteFmt ?? '—'}
              </span>
              {r.contato ? (
                <>
                  <span className="text-slate-600"> · </span>
                  <span className="text-blue-300">{r.contato}</span>
                </>
              ) : null}
              {r.telefone ? (
                <>
                  <span className="text-slate-600"> · </span>
                  <span className="text-green-300">{r.telefone}</span>
                </>
              ) : null}
              <span className="text-slate-600"> · </span>
              <span className="text-amber-300">{r.medida}</span>
            </span>
            <div className="flex items-center gap-2">
              <MarcadorCor cor={r.cor} onMudar={(cor) => handleMudarCor(r.id, cor)} />
              <BotaoRelogio lembreteEm={r.lembreteEm} onAbrir={() => setLembreteDe((d) => (d === r.id ? null : r.id))} />
              <BotaoWhats telefone={r.telefone} />
              <button
                type="button"
                onClick={() => setDetalhesDe(r)}
                aria-label="Ver detalhes do flyer"
                title="Ver detalhes do flyer"
                className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all cursor-pointer active:scale-95"
              >
                <List size={16} />
              </button>
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
                onClick={() => handleExcluir(r.id)}
                aria-label="Excluir este flyer"
                title="Excluir este flyer"
                className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 rounded-lg transition-all cursor-pointer active:scale-95"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {lembreteDe === r.id && (
            <EditorLembrete
              inicial={r.lembreteEm}
              temAtual={!!formatarLembrete(r.lembreteEm)}
              onConfirmar={(iso) => handleLembrete(r.id, iso)}
              onLimpar={() => handleLembrete(r.id, null)}
              onFechar={() => setLembreteDe(null)}
            />
          )}
          <p className="text-lg text-slate-100 font-bold truncate">
            {r.inputText.split('\n').filter((l) => l.trim()).slice(1, 4).join(' · ') || '(sem tabela)'}
          </p>
        </div>
        );
      })}
    </HistoricoBase>

    {/* Janelinha com os detalhes do flyer (marcas e preços, sem reabrir) */}
    {detalhesDe && (
      <div
        className="fixed inset-0 z-[210] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        onClick={() => setDetalhesDe(null)}
      >
        <div
          data-janela-flyer="1"
          className="w-full max-w-xl max-h-[80vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 bg-slate-950/60 border-b border-slate-800/60">
            <h3 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-widest">
              DETALHES DO FLYER
            </h3>
            <button
              type="button"
              onClick={() => setDetalhesDe(null)}
              aria-label="Fechar"
              title="Fechar"
              className="flex items-center justify-center p-2.5 bg-slate-800 hover:bg-red-600 text-slate-200 border border-slate-700 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-5 pt-3 text-base font-black uppercase tracking-widest text-slate-500">
            {detalhesDe.contato ? <span className="text-blue-300">{detalhesDe.contato}</span> : null}
            {detalhesDe.telefone ? <span className="text-green-300"> · {detalhesDe.telefone}</span> : null}
            <span className="text-amber-300"> · {detalhesInfo?.measure || detalhesDe.medida}</span>
          </div>
          <div className="overflow-y-auto p-5 space-y-2">
            {(detalhesInfo?.tires ?? []).map((t, i) => (
              <p key={i} className="text-base font-bold flex items-start gap-2">
                <span className="text-slate-200">{t.brand || '(sem marca)'}</span>
                <span className="ml-auto shrink-0 pl-4 text-slate-100">
                  {formatarPreco(t.priceInstallment)} <span className="text-slate-500">/</span> {formatarPreco(t.priceCash)}
                </span>
                <span className={`shrink-0 text-xs font-black uppercase ${t.stock > 0 ? 'text-green-500' : 'text-slate-500'}`}>
                  {t.stock > 0 ? `${t.stock} un` : 'encomenda'}
                </span>
              </p>
            ))}
            {(detalhesInfo?.tires ?? []).length === 0 && (
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sem marcas nesta tabela.</p>
            )}
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default FlyerHistoryModal;
