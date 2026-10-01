import React, { useEffect, useState } from 'react';
import { CornerUpRight, Search, X } from 'lucide-react';
import {
  DADOS_BUSCA_LIMPA_EVENTO,
  DADOS_EVENTO,
  DADOS_KEY,
  lerDados,
  listarOcorrencias,
  normalizarBusca,
  type DadosTabelas,
} from '../dados/utils/tabelas';

interface AtalhosDadosProps {
  /** Vai para a aba Dados com a sub-aba correspondente aberta. */
  onIr: (abaId: string) => void;
  /**
   * Pesquisa o termo na aba Dados. `repor` = digitando (sempre recomeça do 1º);
   * `passo` = Enter (mesmo termo avança, Shift+Enter volta).
   */
  onBuscar: (termo: string, passo: 1 | -1, repor: boolean) => void;
}

const CLASSE_BOTAO =
  'w-full flex items-center justify-between gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all cursor-pointer active:scale-[0.98]';

/**
 * "SUB ATALHOS": lupa de pesquisa + um botão por sub-aba da aba Dados
 * (um abaixo do outro). A lista acompanha criações/exclusões/renomeações na hora
 * (evento próprio + `storage` entre janelas). Sem caixa — só o titulozinho e os botões.
 */
const AtalhosDados: React.FC<AtalhosDadosProps> = ({ onIr, onBuscar }) => {
  const [dados, setDados] = useState<DadosTabelas>(() => lerDados());
  // Lupa aberta (vira campo de busca) + termo digitado.
  const [buscando, setBuscando] = useState(false);
  const [termo, setTermo] = useState('');

  useEffect(() => {
    const atualizar = (e?: Event) => {
      if (e instanceof StorageEvent && e.key && e.key !== DADOS_KEY) return;
      setDados(lerDados());
    };
    // X do "Pesquisar nas tabelas" limpa o termo daqui também.
    const limparTermo = () => setTermo('');
    window.addEventListener(DADOS_EVENTO, atualizar);
    window.addEventListener('storage', atualizar);
    window.addEventListener(DADOS_BUSCA_LIMPA_EVENTO, limparTermo);
    return () => {
      window.removeEventListener(DADOS_EVENTO, atualizar);
      window.removeEventListener('storage', atualizar);
      window.removeEventListener(DADOS_BUSCA_LIMPA_EVENTO, limparTermo);
    };
  }, []);

  if (dados.abas.length === 0) return null;

  const confirmarBusca = (passo: 1 | -1) => {
    if (termo.trim()) onBuscar(termo.trim(), passo, false);
    // fica aberto: Enter de novo avança para a próxima ocorrência
  };

  // Digitando pula direto para o resultado (igual ao campo de lá): a cada letra
  // recomeça do 1º (`repor`), sem trocar o comportamento do Enter.
  const digitarBusca = (valor: string) => {
    setTermo(valor);
    if (valor.trim()) onBuscar(valor.trim(), 1, true);
  };

  // Feedback ao digitar: quantos resultados e em quais sub-abas (igual ao
  // contador do campo de busca da aba Dados).
  const temTermo = normalizarBusca(termo).length > 0;
  const ocorrencias = temTermo ? listarOcorrencias(dados, termo) : [];
  const porAba: Record<string, number> = {};
  for (const oc of ocorrencias) porAba[oc.abaId] = (porAba[oc.abaId] ?? 0) + 1;
  const resumoBusca = dados.abas
    .filter((a) => (porAba[a.id] ?? 0) > 0)
    .map((a) => `${porAba[a.id]} em ${a.rotulo}`)
    .join(' · ');

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 ml-1">
        Sub Atalhos
      </p>
      <div className="flex flex-col gap-2">
        {buscando ? (
          <div>
            <div className="relative">
              <input
                autoFocus
                value={termo}
                onChange={(e) => digitarBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    confirmarBusca(e.shiftKey ? -1 : 1);
                  }
                  if (e.key === 'Escape') setBuscando(false);
                }}
                onBlur={() => setBuscando(false)}
                placeholder="Buscar…"
                aria-label="Buscar nas tabelas"
                className="w-full campo-tema border border-blue-500 rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold text-slate-100 outline-none"
              />
              {termo ? (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setTermo('')}
                aria-label="Limpar busca do atalho"
                title="Limpar"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                  <X size={14} />
                </button>
              ) : (
                <Search
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              )}
            </div>
            {temTermo && (
              <p
                className={`mt-1 ml-1 text-[10px] font-black uppercase tracking-widest leading-tight ${
                  ocorrencias.length > 0 ? 'text-green-500' : 'text-slate-500'
                }`}
              >
                {ocorrencias.length > 0
                  ? `${ocorrencias.length} · ${resumoBusca}`
                  : 'Nada encontrado'}
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setBuscando(true)}
            aria-label="Buscar termo nos Dados"
            title="Pesquisar nas tabelas da aba Dados"
            className={CLASSE_BOTAO}
          >
            <span className="truncate">Buscar</span>
            <Search size={14} className="shrink-0 text-slate-500" />
          </button>
        )}
        {dados.abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onIr(a.id)}
            aria-label={`Ir para sub-aba ${a.rotulo}`}
            title={`Abrir ${a.rotulo} na aba Dados`}
            className={CLASSE_BOTAO}
          >
            <span className="truncate">{a.rotulo}</span>
            <CornerUpRight size={14} className="shrink-0 text-slate-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AtalhosDados;
