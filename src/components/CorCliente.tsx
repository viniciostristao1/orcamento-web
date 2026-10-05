import React from 'react';
import { Check } from 'lucide-react';
import { ROTULO_COR, type CorCliente, type FiltroCor } from '../utils/corCliente';

/**
 * Bolinhas verde/vermelha de cada cartão do histórico: marcam a situação do
 * cliente (verde = quer fazer em breve; vermelho = só pesquisou). Clicar na cor
 * já marcada limpa (volta a sem cor).
 */
export const MarcadorCor: React.FC<{
  cor?: CorCliente;
  onMudar: (cor: CorCliente | undefined) => void;
}> = ({ cor, onMudar }) => {
  const bolinha = (id: CorCliente) => {
    const ativa = cor === id;
    const estilo =
      id === 'verde'
        ? ativa
          ? 'bg-green-500 border-green-300 ring-2 ring-green-400/60'
          : 'bg-green-500/15 border-green-800 hover:border-green-500'
        : ativa
          ? 'bg-red-500 border-red-300 ring-2 ring-red-400/60'
          : 'bg-red-500/15 border-red-800 hover:border-red-500';
    return (
      <button
        key={id}
        type="button"
        onClick={() => onMudar(ativa ? undefined : id)}
        aria-label={
          id === 'verde' ? 'Marcar de verde (quer fazer em breve)' : 'Marcar de vermelho (só pesquisou)'
        }
        title={ROTULO_COR[id]}
        aria-pressed={ativa}
        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer active:scale-95 flex items-center justify-center ${estilo}`}
      >
        {ativa && <Check size={14} strokeWidth={4} className="text-white" />}
      </button>
    );
  };
  return (
    <span className="flex items-center gap-1.5" role="group" aria-label="Cor do cliente">
      {bolinha('verde')}
      {bolinha('vermelho')}
    </span>
  );
};

/**
 * Filtro por cor da lista do histórico: Todas | Verdes | Vermelhos, com a
 * contagem de cada cor. Segue o visual das abas Todos/Não Realizados.
 */
export const FiltroCorCliente: React.FC<{
  valor: FiltroCor;
  verdes: number;
  vermelhos: number;
  onMudar: (f: FiltroCor) => void;
}> = ({ valor, verdes, vermelhos, onMudar }) => {
  const botao = (id: FiltroCor, rotulo: string, titulo: string, dot?: string) => {
    const ativo = valor === id;
    const corAtiva =
      id === 'verde'
        ? 'bg-green-600 text-white border-green-500'
        : id === 'vermelho'
          ? 'bg-red-600 text-white border-red-500'
          : 'bg-blue-600 text-white border-blue-500';
    return (
      <button
        key={id}
        type="button"
        onClick={() => onMudar(id)}
        aria-label={
          id === 'todas'
            ? 'Mostrar todas as cores'
            : id === 'verde'
              ? 'Mostrar só clientes verdes'
              : 'Mostrar só clientes vermelhos'
        }
        title={titulo}
        aria-pressed={ativo}
        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer active:scale-95 flex items-center gap-2 ${
          ativo ? corAtiva : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
        }`}
      >
        {dot && <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />}
        {rotulo}
      </button>
    );
  };
  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-slate-800/60">
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 mr-1">Cor:</span>
      {botao('todas', 'Todas', 'Mostrar todas as cores')}
      {botao('verde', `Verdes (${verdes})`, ROTULO_COR.verde, 'bg-green-400')}
      {botao('vermelho', `Vermelhos (${vermelhos})`, ROTULO_COR.vermelho, 'bg-red-400')}
    </div>
  );
};
