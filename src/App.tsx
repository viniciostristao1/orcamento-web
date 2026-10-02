import React, { useEffect, useState } from 'react';
import OrcamentosApp from './components/OrcamentosApp';
import TireFlyerApp from './tire/TireFlyerApp';
import WhatsApp from './whats/WhatsApp';
import DadosApp from './dados/DadosApp';
import ConfiguracoesTema from './components/ConfiguracoesTema';
import LembreteContatos from './components/LembreteContatos';
import { RotulosProvider, useRotulos } from './components/RotulosContext';
import { aplicarTema, lerTemaSalvo, TEMA_KEY, type Tema } from './utils/tema';
import { VERSAO } from './utils/versao';
import {
  CONTATOS_EVENTO,
  CONTATOS_KEY,
  contatosParaHoje,
  lerContatos,
} from './whats/utils/contatosHoje';
import type { Contact } from './whats/types';
import logoToyota from './assets/logo_toyota.png';

type Aba = 'orcamentos' | 'pneus' | 'whats' | 'dados';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'orcamentos', label: 'Orçamentos' },
  { id: 'pneus', label: 'Tire Flyer' },
  { id: 'whats', label: 'Whats' },
  { id: 'dados', label: 'Dados' },
];

const AppInterno: React.FC = () => {
  const [aba, setAba] = useState<Aba>('orcamentos');
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [tema, setTema] = useState<Tema>(lerTemaSalvo);
  const { rotulos, renomearAba } = useRotulos();
  const [abaEditando, setAbaEditando] = useState<string | null>(null);
  const [nomeAba, setNomeAba] = useState('');

  // Lembrete global: contatos do Relatório de Envios com data para hoje (ainda
  // não concluídos). Vale para todas as abas — lê do localStorage e se atualiza
  // a cada salvamento da aba Whats (evento próprio + `storage` entre janelas).
  const [contatosHoje, setContatosHoje] = useState<Contact[]>(() =>
    contatosParaHoje(lerContatos()),
  );
  // Contato para onde o clique no lembrete deve levar (aba Whats rola até ele).
  const [destaque, setDestaque] = useState<{ id: string; vez: number } | null>(null);
  // X do lembrete: esconde até a lista de hoje mudar.
  const [dispensado, setDispensado] = useState('');

  useEffect(() => {
    const atualizar = (e?: Event) => {
      if (e instanceof StorageEvent && e.key && e.key !== CONTATOS_KEY) return;
      setContatosHoje(contatosParaHoje(lerContatos()));
    };
    window.addEventListener(CONTATOS_EVENTO, atualizar);
    window.addEventListener('storage', atualizar);
    return () => {
      window.removeEventListener(CONTATOS_EVENTO, atualizar);
      window.removeEventListener('storage', atualizar);
    };
  }, []);

  const chaveHoje = contatosHoje.map((c) => c.id).sort().join(',');
  const mostrarLembrete = contatosHoje.length > 0 && dispensado !== chaveHoje;

  // Clique no lembrete: vai para a aba Whats e destaca o contato (`vez` faz o
  // clique no mesmo contato duas vezes funcionar).
  const irParaContato = (id: string) => {
    setAba('whats');
    setDestaque((d) => ({ id, vez: (d?.vez ?? 0) + 1 }));
  };

  // Atalho SUB ATALHOS: vai para a aba Dados com a sub-aba aberta.
  const [subAbaDados, setSubAbaDados] = useState<{ id: string; vez: number } | null>(null);
  const irParaSubAbaDados = (id: string) => {
    setAba('dados');
    setSubAbaDados((d) => ({ id, vez: (d?.vez ?? 0) + 1 }));
  };

  // Lupa do SUB ATALHOS: pesquisa o termo na aba Dados (igual a digitar no
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-[100] print:hidden ui-compacta">
        <div className="max-w-[1400px] mx-auto px-8 h-20 flex items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img src={logoToyota} alt="Toyota" className="logo-toyota h-11 w-auto" />
            <h1 className="titulo-tema text-2xl font-black tracking-tighter uppercase whitespace-nowrap">Toyota Weiand <span className="text-blue-500 font-black">Lajeado</span></h1>
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
                  className="px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-[0.15em] campo-tema border border-blue-500 outline-none w-40"
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
                  className={`px-5 py-2.5 rounded-xl transition-all text-sm font-black uppercase tracking-[0.15em] border cursor-pointer active:scale-95 whitespace-nowrap ${
                    aba === t.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {rotulos.abas[t.id] ?? t.label}
                </button>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-l border-slate-800 pl-4 h-8 flex items-center whitespace-nowrap">Gestão de Vendas</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 whitespace-nowrap" title="Versão do arquivo">v{VERSAO}</span>
            <ConfiguracoesTema tema={tema} onChange={setTema} />
          </div>
        </div>
      </header>

      <main className={`mx-auto px-[30px] pt-3 ${aba === 'orcamentos' ? 'max-w-[1125px]' : 'max-w-[1400px]'}`}>
        <div className={aba === 'orcamentos' ? '' : 'hidden'}>
          <OrcamentosApp
            historicoAberto={historicoAberto}
            onFecharHistorico={() => setHistoricoAberto(false)}
            onAbrirHistorico={() => setHistoricoAberto(true)}
            onIrParaSubAba={irParaSubAbaDados}
            onBuscarNosDados={buscarNosDados}
          />
        </div>
        <div className={aba === 'pneus' ? '' : 'hidden'}>
          <TireFlyerApp />
        </div>
        <div className={aba === 'whats' ? '' : 'hidden'}>
          <WhatsApp destaque={destaque} />
        </div>
        <div className={aba === 'dados' ? '' : 'hidden'}>
          <DadosApp subAba={subAbaDados} buscaDados={buscaDados} />
        </div>
      </main>

      {/* Lembrete global (todas as abas): contatos para chamar hoje. */}
      {mostrarLembrete && (
        <LembreteContatos
          contatos={contatosHoje}
          onIrParaContato={irParaContato}
          onDispensar={() => setDispensado(chaveHoje)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <RotulosProvider>
    <AppInterno />
  </RotulosProvider>
);

export default App;
