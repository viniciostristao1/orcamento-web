import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  BUSCA_AUTO_LIMPA_MS,
  DADOS_BUSCA_LIMPA_EVENTO,
  DADOS_EVENTO,
  DADOS_KEY,
  lerDados,
  listarOcorrencias,
  normalizarBusca,
  type DadosTabelas,
} from '../dados/utils/tabelas';

interface MenuDadosProps {
  /** Vai para a aba Dados com a sub-aba correspondente aberta. */
  onIr: (abaId: string) => void;
  /**
   * Pesquisa o termo na aba Dados. `repor` = digitando (sempre recomeça do 1º);
   * `passo` = Enter (mesmo termo avança, Shift+Enter volta).
   */
  onBuscar: (termo: string, passo: 1 | -1, repor: boolean) => void;
}

/**
 * "MENU DADOS": menu lateral das sub-abas da aba Dados (ideia 03 — barra âmbar
 * no item sob o mouse, quase-preto como o fundo, sem botões cinza). A lista
 * acompanha criações/exclusões/renomeações na hora (evento próprio + `storage`
 * entre janelas). Inclui a lupa de pesquisa nas tabelas.
 */
const MenuDados: React.FC<MenuDadosProps> = ({ onIr, onBuscar }) => {
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

  // O BUSCAR limpa sozinho após 1 min sem digitar (volta o timer a cada letra).
  // Limpa só o campo daqui (sem trocar de aba): os Dados têm o próprio timer e
  // se limpam quase junto — e o X de lá também limpa aqui via evento.
  useEffect(() => {
    if (!termo.trim()) return;
    const t = window.setTimeout(() => setTermo(''), BUSCA_AUTO_LIMPA_MS);
    return () => window.clearTimeout(t);
  }, [termo]);

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
    <nav aria-label="Menu Dados" className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-3 pt-1 pb-2">
        Menu Dados
      </p>
      <div className="flex flex-col gap-1">
        {buscando ? (
          <div className="px-1">
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
                className="w-full campo-tema border border-amber-500/60 rounded-xl pl-3 pr-8 py-2 text-sm font-bold text-slate-100 outline-none bg-transparent"
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
            className="group relative w-full flex items-center gap-3 pl-4 pr-3 py-2.5 text-left cursor-pointer"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span
              className="text-base font-normal uppercase tracking-wide text-slate-100 group-hover:text-white transition-colors"
              style={{ fontFamily: 'var(--tema-fonte-conteudo)' }}
            >
              Buscar
            </span>
            <Search size={14} className="ml-auto shrink-0 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </button>
        )}
        {dados.abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onIr(a.id)}
            aria-label={`Ir para sub-aba ${a.rotulo}`}
            title={`Abrir ${a.rotulo} na aba Dados`}
            className="group relative w-full flex items-center gap-3 pl-4 pr-3 py-2.5 text-left cursor-pointer"
          >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span
              className="truncate text-sm font-normal uppercase tracking-wide text-slate-100 group-hover:text-white transition-colors"
              style={{ fontFamily: 'var(--tema-fonte-conteudo)' }}
            >
              {a.rotulo}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MenuDados;
