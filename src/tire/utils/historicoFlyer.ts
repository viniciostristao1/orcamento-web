import { somenteDigitos } from '../../utils/telefone';
import { normalizarBusca } from '../../utils/busca';
import { corDaBusca, type CorCliente } from '../../utils/corCliente';
import { avisarLembretesMudaram } from '../../utils/lembretes';

/** Um flyer salvo no histórico local do Tire Flyer. */
export interface FlyerSalvo {
  id: string;
  criadoEm: string;
  /** O que o usuário digitou em CONTATO (nome, placa…). */
  contato: string;
  /** Telefone do cliente (DDD + número; só no histórico, para o botão WhatsApp). */
  telefone?: string;
  /** Cor do cliente: verde = quer fazer em breve; vermelho = só pesquisou. */
  cor?: CorCliente;
  /** Lembrete com data/hora (botão relógio do cartão; ISO "YYYY-MM-DDTHH:mm"). */
  lembreteEm?: string | null;
  /** Observação do lembrete (mesma linha da data; entra na busca). */
  observacao?: string;
  medida: string;
  /** A tabela colada (para reabrir o flyer). */
  inputText: string;
  /** Quantas marcas foram cotadas (uma linha da tabela = uma marca). */
  numMarcas: number;
}

/** Registro antigo, de antes da v0.29.0 (o campo chamava `numPneus`). */
type FlyerSalvoAntigo = Omit<FlyerSalvo, 'numMarcas'> & { numMarcas?: number; numPneus?: number };

const CHAVE = 'flyer_historico_v1';
const MAX = 100;

export function listarFlyerHistorico(): FlyerSalvo[] {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // Migra registros antigos (`numPneus` → `numMarcas`) ao ler.
    return (arr as FlyerSalvoAntigo[]).map((r) => ({
      ...r,
      numMarcas: Number(r.numMarcas ?? r.numPneus ?? 0),
    }));
  } catch {
    return [];
  }
}

function gravar(lista: FlyerSalvo[]): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, MAX)));
  } catch {
    /* cota/privacidade: ignora */
  }
}

/**
 * Salva um flyer. Se o mais recente tiver a mesma tabela, o mesmo contato e o
 * mesmo telefone, substitui (evita duplicar a cada clique em "Processar e Atualizar Flyer").
 */
export function adicionarAoFlyerHistorico(
  novo: Omit<FlyerSalvo, 'id' | 'criadoEm'>,
): FlyerSalvo[] {
  const lista = listarFlyerHistorico();
  const ultimo = lista[0];
  if (
    ultimo &&
    ultimo.inputText === novo.inputText &&
    (ultimo.contato ?? '') === (novo.contato ?? '') &&
    somenteDigitos(ultimo.telefone) === somenteDigitos(novo.telefone)
  ) {
    // Cor e lembrete são marcações posteriores (não entram no anti-duplicado):
    // reprocessar o mesmo flyer não pode apagá-las.
    lista[0] = { ...ultimo, ...novo, cor: novo.cor ?? ultimo.cor, lembreteEm: novo.lembreteEm ?? ultimo.lembreteEm, id: ultimo.id, criadoEm: ultimo.criadoEm };
    gravar(lista);
    return lista;
  }
  const rec: FlyerSalvo = {
    ...novo,
    id: String(Date.now()),
    criadoEm: new Date().toLocaleString('pt-BR'),
  };
  const out = [rec, ...lista];
  gravar(out);
  return out;
}

export function removerDoFlyerHistorico(id: string): FlyerSalvo[] {
  const out = listarFlyerHistorico().filter((r) => r.id !== id);
  gravar(out);
  return out;
}

/**
 * Marca/desmarca a cor do cliente num flyer (verde = quer fazer em breve,
 * vermelho = só pesquisou; `undefined` limpa). Salva na hora.
 */
export function atualizarCorFlyer(id: string, cor: CorCliente | undefined): FlyerSalvo[] {
  const out = listarFlyerHistorico().map((r) => (r.id === id ? { ...r, cor } : r));
  gravar(out);
  return out;
}

/**
 * Agenda o lembrete do flyer (ISO "YYYY-MM-DDTHH:mm" + observação).
 * `lembreteEm null` conclui (só a data sai — a observação fica visível).
 * Sem `observacao`, mantém a atual. Salva na hora e avisa o popup global.
 */
export function atualizarLembreteFlyer(
  id: string,
  lembreteEm: string | null,
  observacao?: string,
): FlyerSalvo[] {
  const out = listarFlyerHistorico().map((r) =>
    r.id === id
      ? {
          ...r,
          lembreteEm,
          observacao: observacao === undefined ? r.observacao : observacao.trim().slice(0, 120),
        }
      : r,
  );
  gravar(out);
  avisarLembretesMudaram();
  return out;
}

export function limparFlyerHistorico(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* ignora */
  }
}

/**
 * Filtra por **contato, telefone, cor, data ou medida** (busca "contém", ignorando
 * separadores). Buscar "verde" ou "vermelho" lista os marcados com essa cor.
 * Termo vazio devolve a lista inteira.
 */
export function filtrarFlyerHistorico(lista: FlyerSalvo[], termo: string): FlyerSalvo[] {
  const t = normalizarBusca(termo);
  if (!t) return lista;
  const corBuscada = corDaBusca(t);
  return lista.filter(
    (r) =>
      normalizarBusca(r.contato).includes(t) ||
      normalizarBusca(r.observacao ?? '').includes(t) ||
      normalizarBusca(r.telefone ?? '').includes(t) ||
      normalizarBusca(r.criadoEm).includes(t) ||
      normalizarBusca(r.medida).includes(t) ||
      (corBuscada !== null && r.cor === corBuscada),
  );
}
