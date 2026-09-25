import React, { useEffect, useState } from 'react';
import OrcamentosApp from './components/OrcamentosApp';
import TireFlyerApp from './tire/TireFlyerApp';
import WhatsApp from './whats/WhatsApp';
import DadosApp from './dados/DadosApp';
import ConfiguracoesTema from './components/ConfiguracoesTema';
import { RotulosProvider, useRotulos } from './components/RotulosContext';
import { aplicarTema, lerTemaSalvo, TEMA_KEY, type Tema } from './utils/tema';
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
            <img src={logoToyota} alt="Toyota" className="h-11 w-auto" />
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
            <ConfiguracoesTema tema={tema} onChange={setTema} />
          </div>
        </div>
      </header>

      <main className={`mx-auto px-[30px] pt-3 ${aba === 'orcamentos' ? 'max-w-[1050px]' : 'max-w-[1400px]'}`}>
        <div className={aba === 'orcamentos' ? '' : 'hidden'}>
          <OrcamentosApp
            historicoAberto={historicoAberto}
            onFecharHistorico={() => setHistoricoAberto(false)}
            onAbrirHistorico={() => setHistoricoAberto(true)}
          />
        </div>
        <div className={aba === 'pneus' ? '' : 'hidden'}>
          <TireFlyerApp />
        </div>
        <div className={aba === 'whats' ? '' : 'hidden'}>
          <WhatsApp />
        </div>
        <div className={aba === 'dados' ? '' : 'hidden'}>
          <DadosApp />
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <RotulosProvider>
    <AppInterno />
  </RotulosProvider>
);

export default App;
