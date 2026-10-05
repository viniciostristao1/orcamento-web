import React, { useEffect, useState } from 'react';
import { FolderOpen, Trash2 } from 'lucide-react';
import {
  type FlyerSalvo,
  atualizarCorFlyer,
  filtrarFlyerHistorico,
  limparFlyerHistorico,
  listarFlyerHistorico,
  removerDoFlyerHistorico,
} from '../utils/historicoFlyer';
import { filtrarPorCor, type CorCliente, type FiltroCor } from '../../utils/corCliente';
import { MarcadorCor, SeloCor, classeBordaCor } from '../../components/CorCliente';
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

  useEffect(() => {
    if (aberto) {
      setLista(listarFlyerHistorico());
      setMsg('');
      setBuscaAberta(false);
      setBusca('');
      setFiltroCor('todas');
    }
  }, [aberto]);

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

  return (
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
      {visiveis.map((r) => (
        <div key={r.id} className={`border rounded-2xl p-4 bg-slate-950/40 transition-colors ${classeBordaCor(r.cor)}`}>
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-base font-black uppercase tracking-widest text-slate-500">
              <SeloCor cor={r.cor} />
              {r.criadoEm}
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
              <span className="text-slate-600"> · </span>
              <span className="text-slate-400">
                {r.numMarcas} {r.numMarcas === 1 ? 'marca' : 'marcas'}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <MarcadorCor cor={r.cor} onMudar={(cor) => handleMudarCor(r.id, cor)} />
              <BotaoWhats telefone={r.telefone} />
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
          <p className="text-lg text-slate-100 font-bold truncate">
            {r.inputText.split('\n').filter((l) => l.trim()).slice(1, 4).join(' · ') || '(sem tabela)'}
          </p>
        </div>
      ))}
    </HistoricoBase>
  );
};

export default FlyerHistoryModal;
