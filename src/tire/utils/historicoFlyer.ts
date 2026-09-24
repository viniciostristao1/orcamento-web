/** Um flyer salvo no histórico local do Tire Flyer. */
export interface FlyerSalvo {
  id: string;
  criadoEm: string;
  /** O que o usuário digitou em CONTATO (nome, placa, telefone…). */
  contato: string;
  medida: string;
  /** A tabela colada (para reabrir o flyer). */
  inputText: string;
  numPneus: number;
}

const CHAVE = 'flyer_historico_v1';
const MAX = 100;

export function listarFlyerHistorico(): FlyerSalvo[] {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as FlyerSalvo[]) : [];
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
 * Salva um flyer. Se o mais recente tiver a mesma tabela e o mesmo contato,
 * substitui (evita duplicar a cada clique em "Processar e Atualizar Flyer").
 */
export function adicionarAoFlyerHistorico(
  novo: Omit<FlyerSalvo, 'id' | 'criadoEm'>,
): FlyerSalvo[] {
  const lista = listarFlyerHistorico();
  const ultimo = lista[0];
  if (ultimo && ultimo.inputText === novo.inputText && (ultimo.contato ?? '') === (novo.contato ?? '')) {
    lista[0] = { ...ultimo, ...novo, id: ultimo.id, criadoEm: ultimo.criadoEm };
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

export function limparFlyerHistorico(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* ignora */
  }
}

/**
 * Normaliza para busca: sem acentos, maiúsculas e só letras/números
 * (ignora / - . : e espaços) — "JOÃO" casa com "joao".
 */
const normalizarBusca = (s: string): string =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

/**
 * Filtra por **contato, data ou medida** (busca "contém", ignorando
 * separadores). Termo vazio devolve a lista inteira.
 */
export function filtrarFlyerHistorico(lista: FlyerSalvo[], termo: string): FlyerSalvo[] {
  const t = normalizarBusca(termo);
  if (!t) return lista;
  return lista.filter(
    (r) =>
      normalizarBusca(r.contato).includes(t) ||
      normalizarBusca(r.criadoEm).includes(t) ||
      normalizarBusca(r.medida).includes(t),
  );
}
