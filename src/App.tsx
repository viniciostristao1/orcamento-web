import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import OrcamentosApp from './components/OrcamentosApp';
import TireFlyerApp from './tire/TireFlyerApp';
import DadosApp from './dados/DadosApp';
import ConfiguracoesTema from './components/ConfiguracoesTema';
import Bloqueio from './components/Bloqueio';
import SinoLembretes from './components/SinoLembretes';
import LembreteHistorico from './components/LembreteHistorico';
import { atualizarLembreteHistorico } from './utils/historico';
import { atualizarLembreteFlyer } from './tire/utils/historicoFlyer';
import { removerRapido } from './utils/lembretesRapidos';
import {
  LEMBRETES_EVENTO,
  listarLembretesVencidos,
  type LembreteVencido,
  type OrigemLembrete,
} from './utils/lembretes';
import { RotulosProvider, useRotulos } from './components/RotulosContext';
import { aplicarTema, lerTemaSalvo, TEMA_KEY, type Tema } from './utils/tema';
import { VERSAO } from './utils/versao';
import logoToyota from './assets/logo_toyota.png';

type Aba = 'orcamentos' | 'pneus' | 'dados';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'orcamentos', label: 'Orçamentos' },
  { id: 'pneus', label: 'Tire Flyer' },
  { id: 'dados', label: 'Dados' },
];

const AppInterno: React.FC = () => {
  const [aba, setAba] = useState<Aba>('orcamentos');
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [tema, setTema] = useState<Tema>(lerTemaSalvo);
  const { rotulos, renomearAba } = useRotulos();
  const [abaEditando, setAbaEditando] = useState<string | null>(null);
  const [nomeAba, setNomeAba] = useState('');
  // Lembretes vencidos dos históricos (orçamentos + tire flyer): aviso que pisca
  // no canto inferior direito; o clique abre o orçamento e conclui o lembrete.
  const [lembretes, setLembretes] = useState<LembreteVencido[]>(() => listarLembretesVencidos());
  const [lembretesDisp, setLembretesDisp] = useState('');
  // Clique no aviso: abre o histórico no cartão em questão (não gera na tela).
  const [irParaHistorico, setIrParaHistorico] = useState<{ origem: OrigemLembrete; id: string; vez: number } | null>(null);

  useEffect(() => {
    const recarregar = () => {
      const atual = listarLembretesVencidos();
      setLembretes((antes) =>
        JSON.stringify(antes) === JSON.stringify(atual) ? antes : atual,
      );
    };
    recarregar();
    const timer = window.setInterval(recarregar, 30000);
    window.addEventListener(LEMBRETES_EVENTO, recarregar);
    window.addEventListener('storage', recarregar);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(LEMBRETES_EVENTO, recarregar);
      window.removeEventListener('storage', recarregar);
    };
  }, []);

  const chaveLembretes = lembretes.map((l) => `${l.origem}:${l.id}:${l.quando}`).join(',');
  const mostrarLembretes = lembretes.length > 0 && lembretesDisp !== chaveLembretes;

  // Clique no aviso: troca para a aba certa, abre o histórico no cartão e
  // conclui o lembrete. Rápido não tem histórico: só conclui.
  const [flyerHistVez, setFlyerHistVez] = useState(0);
  const irParaLembrete = (item: LembreteVencido) => {
    if (item.origem === 'rapido') {
      removerRapido(item.id);
    } else {
      setAba(item.origem === 'flyer' ? 'pneus' : 'orcamentos');
      setIrParaHistorico((d) => ({
        origem: item.origem,
        id: item.id,
        vez: (d?.vez ?? 0) + 1,
      }));
      if (item.origem === 'flyer') {
        setFlyerHistVez((v) => v + 1);
        atualizarLembreteFlyer(item.id, null);
      } else {
        setHistoricoAberto(true);
        atualizarLembreteHistorico(item.id, null);
      }
    }
    setLembretes(listarLembretesVencidos());
  };
  // Cadeado: cobre a tela com a senha, sem desmontar o app.
  const [bloqueado, setBloqueado] = useState(false);

  // Atalho MENU DADOS: vai para a aba Dados com a sub-aba aberta.
  const [subAbaDados, setSubAbaDados] = useState<{ id: string; vez: number } | null>(null);
  const irParaSubAbaDados = (id: string) => {
    setAba('dados');
    setSubAbaDados((d) => ({ id, vez: (d?.vez ?? 0) + 1 }));
  };

  // Lupa do MENU DADOS: pesquisa o termo na aba Dados (igual a digitar no
  // "Pesquisar nas tabelas" de lá — abre a sub-aba do 1º resultado).
  // `repor` (digitando) sempre recomeça do 1º; Enter repetido no mesmo termo
  // avança (Shift+Enter volta), como lá.
  const [buscaDados, setBuscaDados] = useState<{ termo: string; passo: 1 | -1; repor: boolean; vez: number } | null>(null);
  const buscarNosDados = (termo: string, passo: 1 | -1 = 1, repor = false) => {
    setAba('dados');
    setBuscaDados((d) => ({ termo, passo, repor, vez: (d?.vez ?? 0) + 1 }));
  };

  useEffect(() => {
    aplicarTema(tema);
    try {
      localStorage.setItem(TEMA_KEY, tema);
    } catch {
      // localStorage indisponível (modo privado) — o tema vale só nesta sessão
    }
  }, [tema]);

  const confirmarNomeAba = () => {
    if (abaEditando) renomearAba(abaEditando, nomeAba);
    setAbaEditando(null);
  };

  // Ideia 01 (sublinhado): só texto, ativa com traço âmbar embaixo.
  // No claro (papel) o texto é preto: os tons slate são remapeados pelo tema
  // (`@theme inline`), então aqui vão hex literais (não remapeiam e não somem).
  const claro = tema === 'papel';
  const abaAtiva = claro ? 'text-[#0f172a]' : 'text-white';
  const abaNormal = claro
    ? 'text-[#64748b] hover:text-[#0f172a]'
    : 'text-slate-400 hover:text-slate-200';
  const abaEditandoBorda = tema === 'grafite' ? 'border-amber-500' : 'border-blue-500';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-[100] print:hidden ui-compacta">
        <div className="max-w-[1400px] mx-auto pl-[30px] pr-0 h-20 flex items-center justify-between gap-5">
          {/* Logo alinhado à esquerda, acima do MENU DADOS (mesma origem). */}
          <div className="flex items-center justify-start w-[210px] shrink-0">
            <img src={logoToyota} alt="Toyota" className="logo-toyota h-11 w-auto" />
          </div>

          <nav className="flex items-center gap-2">
            {ABAS.map((t) =>
              abaEditando === t.id ? (
                <input
                  key={t.id}
                  autoFocus
                  value={nomeAba}
                  onChange={(e) => setNomeAba(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmarNomeAba();
                    if (e.key === 'Escape') setAbaEditando(null);
                  }}
                  onBlur={confirmarNomeAba}
                  aria-label="Renomear aba"
                  className={`px-3 py-1 rounded-xl text-lg font-black uppercase campo-tema border outline-none w-40 ${abaEditandoBorda}`}
                />
              ) : (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAba(t.id)}
                  onDoubleClick={() => {
                    setAbaEditando(t.id);
                    setNomeAba(rotulos.abas[t.id] ?? t.label);
                  }}
                  title="Duplo clique para renomear"
                  style={{ fontFamily: 'var(--tema-fonte-conteudo)' }}
                  className={`relative px-3 py-2 transition-colors text-lg font-black uppercase tracking-wide cursor-pointer active:scale-95 whitespace-nowrap ${
                    aba === t.id ? abaAtiva : abaNormal
                  }`}
                >
                  {rotulos.abas[t.id] ?? t.label}
                  {aba === t.id && (
                    <span className="absolute bottom-0 left-3 right-3 h-1 rounded-full bg-amber-500" />
                  )}
                </button>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 whitespace-nowrap" title="Versão do arquivo">v{VERSAO}</span>
            <button
              type="button"
              onClick={() => setBloqueado(true)}
              aria-label="Sair"
              title="Sair (bloqueia a tela com senha)"
              className="flex items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
            >
              <Lock size={18} />
            </button>
            <SinoLembretes />
            <ConfiguracoesTema tema={tema} onChange={setTema} />
          </div>
        </div>
      </header>

      <main className="mx-auto px-[30px] pt-3 max-w-[1400px]">
        <div className={aba === 'orcamentos' ? '' : 'hidden'}>
          <OrcamentosApp
            historicoAberto={historicoAberto}
            onFecharHistorico={() => setHistoricoAberto(false)}
            onAbrirHistorico={() => setHistoricoAberto(true)}
            onIrParaSubAba={irParaSubAbaDados}
            onBuscarNosDados={buscarNosDados}
            destaqueHistoricoId={irParaHistorico?.origem === 'orcamento' ? irParaHistorico.id : null}
          />
        </div>
        <div className={aba === 'pneus' ? '' : 'hidden'}>
          <TireFlyerApp
            abrirHistorico={flyerHistVez > 0 ? { vez: flyerHistVez } : null}
            destaqueId={irParaHistorico?.origem === 'flyer' ? irParaHistorico.id : null}
          />
        </div>
        <div className={aba === 'dados' ? '' : 'hidden'}>
          <DadosApp subAba={subAbaDados} buscaDados={buscaDados} />
        </div>
      </main>

      {/* Aviso global (todas as abas) no canto inferior direito. */}
      {mostrarLembretes && (
        <div className="fixed bottom-8 right-8 z-[300] flex flex-col items-end gap-3 print:hidden">
          <LembreteHistorico
            itens={lembretes}
            onIrPara={irParaLembrete}
            onDispensar={() => setLembretesDisp(chaveLembretes)}
          />
        </div>
      )}

      {/* Cadeado: cobre tudo (inclusive header e modais) sem desmontar o app. */}
      {bloqueado && <Bloqueio onDesbloquear={() => setBloqueado(false)} />}
    </div>
  );
};

const App: React.FC = () => (
  <RotulosProvider>
    <AppInterno />
  </RotulosProvider>
);

export default App;
