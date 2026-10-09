/**
 * Lembretes com data/hora dos históricos (orçamentos + tire flyer): o botão
 * relógio de cada cartão agenda `lembreteEm` (ISO `YYYY-MM-DDTHH:mm`); quando
 * chega a hora, o aviso pisca no canto inferior direito e o clique abre o
 * orçamento em questão. Clicar num aviso vencido abre e o conclude (limpa).
 */

export type OrigemLembrete = 'orcamento' | 'flyer' | 'rapido';

export interface LembreteVencido {
  origem: OrigemLembrete;
  id: string;
  /** Texto do botão (texto do rápido, placa/contato/medida ou descrição). */
  rotulo: string;
  quando: string;
}

/** Item da lista geral do sino (vencidos e agendados). */
export interface LembreteAgendado extends LembreteVencido {
  vencido: boolean;
}

import { listarRapidos } from './lembretesRapidos';

/** Evento para o aviso global se atualizar na hora (mesmo padrão do zap:contatos). */
export const LEMBRETES_EVENTO = 'historico:lembretes';

export const avisarLembretesMudaram = (): void => {
  try {
    window.dispatchEvent(new Event(LEMBRETES_EVENTO));
  } catch {
    /* ambiente sem window (testes de lógica usam jsdom: tem) */
  }
};

/** "05/10/2026 18:17:04" (ou com vírgula) → só a data: "05/10/2026". */
export function dataDoRegistro(criadoEm: string): string {
  return (criadoEm ?? '').split(/[,\s]/)[0] ?? '';
}

/** ISO "2026-10-12T09:00" → "12/10/2026 09:00" (null quando vazio/inválido). */
export function formatarLembrete(iso: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso ?? '');
  if (!m) return null;
  return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}`;
}

/** ISO completo ou parcial → valor do `<input type="datetime-local">`. */
export function paraInputDatetime(iso: string | null | undefined): string {
  const m = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/.exec(iso ?? '');
  return m ? m[1] : '';
}

/** Hoje com a hora atual, no formato do `<input type="datetime-local">` local
 *  (montado na mão: `toISOString` é UTC e mudaria o dia/hora). */
export function hojeHoraInput(agora: Date = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}T${p(agora.getHours())}:${p(agora.getMinutes())}`;
}

interface RegistroComLembrete {
  id: string;
  criadoEm: string;
  lembreteEm?: string | null;
  placa?: string;
  telefone?: string;
  descReparo?: string;
  contato?: string;
  medida?: string;
}

const lerLista = (chave: string): RegistroComLembrete[] => {
  try {
    const arr = JSON.parse(localStorage.getItem(chave) ?? '[]');
    return Array.isArray(arr) ? (arr as RegistroComLembrete[]) : [];
  } catch {
    return [];
  }
};

const rotuloOrcamento = (r: RegistroComLembrete): string =>
  r.placa?.trim() ||
  r.telefone?.trim() ||
  (r.descReparo ?? '').split('\n').find((l) => l.trim())?.trim().slice(0, 30) ||
  dataDoRegistro(r.criadoEm);

const rotuloFlyer = (r: RegistroComLembrete): string =>
  r.contato?.trim() || r.medida?.trim() || dataDoRegistro(r.criadoEm);

/** Registros com lembrete vencido (data/hora <= agora): históricos + rápidos. */
export function listarLembretesVencidos(agora: number = Date.now()): LembreteVencido[] {
  return listarTodosLembretes(agora)
    .filter((l) => l.vencido)
    .map(({ origem, id, rotulo, quando }) => ({ origem, id, rotulo, quando }));
}

/**
 * Todos os lembretes ativos (rápidos + históricos com data), ordenados pela
 * data — é o que o sino lista. Rápidos sem data válida são ignorados.
 */
export function listarTodosLembretes(agora: number = Date.now()): LembreteAgendado[] {
  const todos: LembreteAgendado[] = [];
  const colher = (
    origem: OrigemLembrete,
    chave: string,
    rotulo: (r: RegistroComLembrete) => string,
  ): void => {
    for (const r of lerLista(chave)) {
      if (!r?.lembreteEm || typeof r.id === 'undefined') continue;
      const t = new Date(r.lembreteEm).getTime();
      if (!Number.isFinite(t)) continue;
      todos.push({
        origem,
        id: String(r.id),
        rotulo: rotulo(r),
        quando: String(r.lembreteEm),
        vencido: t <= agora,
      });
    }
  };
  colher('orcamento', 'orcamentos_historico_v1', rotuloOrcamento);
  colher('flyer', 'flyer_historico_v1', rotuloFlyer);
  for (const q of listarRapidos()) {
    const t = new Date(q.quando).getTime();
    if (!Number.isFinite(t)) continue;
    todos.push({ origem: 'rapido', id: q.id, rotulo: q.texto, quando: q.quando, vencido: t <= agora });
  }
  return todos.sort((a, b) => a.quando.localeCompare(b.quando));
}
