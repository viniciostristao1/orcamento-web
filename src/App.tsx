import React, { useState } from 'react';
import { Car, History } from 'lucide-react';
import OrcamentosApp from './components/OrcamentosApp';
import TireFlyerApp from './tire/TireFlyerApp';

type Aba = 'orcamentos' | 'pneus';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'orcamentos', label: 'Orçamentos' },
  { id: 'pneus', label: 'Tire Flyer' },
];

const App: React.FC = () => {
  const [aba, setAba] = useState<Aba>('orcamentos');
  const [historicoAberto, setHistoricoAberto] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-[100] print:hidden ui-compacta">
        <div className="max-w-[1400px] mx-auto px-10 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <Car className="text-blue-500" size={32} />
            <h1 className="text-2xl font-black tracking-tighter uppercase">Toyota Weiand <span className="text-blue-500 font-black">Lajeado</span></h1>
          </div>

          <nav className="flex items-center gap-2">
            {ABAS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setAba(t.id)}
                className={`px-6 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-[0.2em] border cursor-pointer active:scale-95 ${
                  aba === t.id
                    ? t.id === 'pneus'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40'
                      : 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 border-l border-slate-800 pl-6 h-8 flex items-center">Gestão de Vendas</span>
            {aba === 'orcamentos' && (
              <button
                type="button"
                onClick={() => setHistoricoAberto(true)}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all text-xs font-black uppercase border border-slate-700 cursor-pointer active:scale-95"
              >
                <History size={16} /> Histórico
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={`mx-auto px-[30px] pt-8 ${aba === 'pneus' ? 'max-w-[1400px]' : 'max-w-[1050px]'}`}>
        <div className={aba === 'orcamentos' ? '' : 'hidden'}>
          <OrcamentosApp
            historicoAberto={historicoAberto}
            onFecharHistorico={() => setHistoricoAberto(false)}
          />
        </div>
        <div className={aba === 'pneus' ? '' : 'hidden'}>
          <TireFlyerApp />
        </div>
      </main>
    </div>
  );
};

export default App;
