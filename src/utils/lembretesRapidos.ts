/**
 * Lembretes rápidos (avulsos, criados no sino): texto livre + data/hora.
 * Vencidos entram no mesmo popup pulsante dos históricos; o clique conclui
 * (apaga). A chave entra no backup geral.
 */
export interface LembreteRapido {
  id: string;
  texto: string;
  /** ISO "YYYY-MM-DDTHH:mm". */
  quando: string;
  criadoEm: string;
}

export const RAPIDOS_KEY = 'lembretes_rapidos_v1';
const MAX = 100;

export function listarRapidos(): LembreteRapido[] {
  try {
    const arr = JSON.parse(localStorage.getItem(RAPIDOS_KEY) ?? '[]');
    return Array.isArray(arr) ? (arr as LembreteRapido[]) : [];
  } catch {
    return [];
  }
}

function gravar(lista: LembreteRapido[]): void {
  try {
    localStorage.setItem(RAPIDOS_KEY, JSON.stringify(lista.slice(0, MAX)));
  } catch {
    /* cota/privacidade: ignora */
  }
}

/** Cria um lembrete rápido (texto + data/hora obrigatórios). */
export function criarRapido(
  texto: string,
  quando: string,
): { ok: true; item: LembreteRapido } | { ok: false; erro: string } {
  if (!texto.trim()) return { ok: false, erro: 'Escreva o texto do lembrete.' };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(quando)) {
    return { ok: false, erro: 'Escolha a data e a hora.' };
  }
  const item: LembreteRapido = {
    id: String(Date.now()),
    texto: texto.trim().slice(0, 120),
    quando,
    criadoEm: new Date().toLocaleString('pt-BR'),
  };
  const out = [item, ...listarRapidos()];
  gravar(out);
  return { ok: true, item };
}

/** Apaga um lembrete rápido (concluir ou excluir). */
export function removerRapido(id: string): LembreteRapido[] {
  const out = listarRapidos().filter((r) => r.id !== id);
  gravar(out);
  return out;
}

/** Reprograma um lembrete rápido (troca a data/hora). Formato inválido não muda nada. */
export function atualizarRapido(id: string, quando: string): LembreteRapido[] {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(quando)) return listarRapidos();
  const out = listarRapidos().map((r) => (r.id === id ? { ...r, quando } : r));
  gravar(out);
  return out;
}

/** Edita o texto de um lembrete rápido (1–120 caracteres; vazio não muda nada). */
export function atualizarTextoRapido(id: string, texto: string): LembreteRapido[] {
  const limpo = texto.trim().slice(0, 120);
  if (!limpo) return listarRapidos();
  const out = listarRapidos().map((r) => (r.id === id ? { ...r, texto: limpo } : r));
  gravar(out);
  return out;
}
