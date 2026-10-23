/**
 * Bloco de notas gerais (botão ao lado do sino no header): anotações livres —
 * algo a melhorar, recados, qualquer coisa. Cada nota tem salvar, copiar,
 * limpar e excluir. A chave entra no backup geral.
 */
export interface NotaGeral {
  id: string;
  texto: string;
  atualizadoEm: string;
}

export const NOTAS_GERAIS_KEY = 'notas_gerais_v1';
const MAX = 100;
const MAX_TEXTO = 2000;

export function listarNotasGerais(storage: Storage = localStorage): NotaGeral[] {
  try {
    const arr = JSON.parse(storage.getItem(NOTAS_GERAIS_KEY) ?? '[]');
    return Array.isArray(arr) ? (arr as NotaGeral[]) : [];
  } catch {
    return [];
  }
}

function gravar(lista: NotaGeral[], storage: Storage = localStorage): void {
  try {
    storage.setItem(NOTAS_GERAIS_KEY, JSON.stringify(lista.slice(0, MAX)));
  } catch {
    /* cota/privacidade: ignora */
  }
}

/** Nova nota vazia (no topo da lista). */
export function criarNotaGeral(storage: Storage = localStorage): NotaGeral[] {
  const nota: NotaGeral = {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    texto: '',
    atualizadoEm: new Date().toLocaleString('pt-BR'),
  };
  const out = [nota, ...listarNotasGerais(storage)];
  gravar(out, storage);
  return out;
}

/** Salva o texto da nota (apara em 2000 caracteres). */
export function salvarNotaGeral(
  id: string,
  texto: string,
  storage: Storage = localStorage,
): NotaGeral[] {
  const out = listarNotasGerais(storage).map((n) =>
    n.id === id
      ? { ...n, texto: texto.slice(0, MAX_TEXTO), atualizadoEm: new Date().toLocaleString('pt-BR') }
      : n,
  );
  gravar(out, storage);
  return out;
}

/** Exclui a nota. */
export function excluirNotaGeral(id: string, storage: Storage = localStorage): NotaGeral[] {
  const out = listarNotasGerais(storage).filter((n) => n.id !== id);
  gravar(out, storage);
  return out;
}
