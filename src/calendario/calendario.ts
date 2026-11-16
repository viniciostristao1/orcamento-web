/**
 * Calendário de lembretes: grade do mês (semana começa na segunda) + leitura
 * SOMENTE dos lembretes que o app já guarda no localStorage (`lembreteEm` dos
 * três históricos). Não cria cadastro novo nem muda chaves/formatos — reusa
 * `listarTodosLembretes` (utils/lembretes) e descarta os rápidos.
 */
import { listarTodosLembretes } from '../utils/lembretes';

export type TipoCalendario = 'orcamento' | 'pneus' | 'revisao';

export interface LembreteCalendario {
  id: string;
  tipo: TipoCalendario;
  rotulo: string;
  quando: string;
  ano: number;
  /** 1-12. */
  mes: number;
  dia: number;
  /** "HH:mm" ou '' quando sem hora. */
  hora: string;
}

const TIPO_POR_ORIGEM: Record<string, TipoCalendario | null> = {
  orcamento: 'orcamento',
  flyer: 'pneus',
  revisao: 'revisao',
  rapido: null,
};

export const NOME_TIPO: Record<TipoCalendario, string> = {
  orcamento: 'Orçamento',
  pneus: 'Pneus',
  revisao: 'Revisão',
};

export const MESES: string[] = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const DIAS_SEMANA: string[] = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

/** Blocos visíveis por célula antes do indicador "+N". */
export const MAX_POR_DIA = 3;

/** "2026-11-16T09:00" → partes (manual, sem fuso — `new Date` com data pura
 *  cai em UTC e mudaria o dia). null quando inválido (ex.: 31/02). */
export function partesData(
  iso: string | null | undefined,
): { ano: number; mes: number; dia: number; hora: string } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec((iso ?? '').trim());
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  if (dia > new Date(ano, mes, 0).getDate()) return null;
  return { ano, mes, dia, hora: m[4] !== undefined ? `${m[4]}:${m[5]}` : '' };
}

/** Todos os lembretes com data dos três históricos (rápidos fora). */
export function listarLembretesCalendario(agora: number = Date.now()): LembreteCalendario[] {
  const out: LembreteCalendario[] = [];
  for (const l of listarTodosLembretes(agora)) {
    const tipo = TIPO_POR_ORIGEM[l.origem] ?? null;
    if (!tipo) continue;
    const p = partesData(l.quando);
    if (!p) continue;
    out.push({ id: String(l.id), tipo, rotulo: l.rotulo, quando: String(l.quando), ...p });
  }
  return out.sort((a, b) => a.quando.localeCompare(b.quando));
}

export interface DiaGrade {
  dia: number;
  hoje: boolean;
}

/** Grade do mês (mes 1-12): semanas de 7 células, semana começa na segunda.
 *  Fora do mês = null (célula vazia). */
export function gradeMes(
  ano: number,
  mes: number,
  hojeRef: Date = new Date(),
): (DiaGrade | null)[][] {
  const desloc = (new Date(ano, mes - 1, 1).getDay() + 6) % 7;
  const dias = new Date(ano, mes, 0).getDate();
  const hojeDia = hojeRef.getDate();
  const hojeMes = hojeRef.getMonth() + 1;
  const hojeAno = hojeRef.getFullYear();
  const celulas: (DiaGrade | null)[] = [];
  for (let i = 0; i < desloc; i++) celulas.push(null);
  for (let d = 1; d <= dias; d++) {
    celulas.push({ dia: d, hoje: d === hojeDia && mes === hojeMes && ano === hojeAno });
  }
  while (celulas.length % 7 !== 0) celulas.push(null);
  const semanas: (DiaGrade | null)[][] = [];
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7));
  return semanas;
}

export function tituloMes(ano: number, mes: number): string {
  return `${MESES[mes - 1] ?? mes} ${ano}`;
}

/** Mês seguinte/anterior atravessando o ano (dez↔jan). mes 1-12. */
export function avancarMes(ano: number, mes: number, delta: 1 | -1): { ano: number; mes: number } {
  const total = (ano * 12 + (mes - 1) + delta) * 1;
  return { ano: Math.floor(total / 12), mes: (total % 12) + 1 };
}

/** Lembretes do mês exibido, agrupados por dia. */
export function agruparPorDia(
  lista: LembreteCalendario[],
  ano: number,
  mes: number,
): Map<number, LembreteCalendario[]> {
  const porDia = new Map<number, LembreteCalendario[]>();
  for (const l of lista) {
    if (l.ano !== ano || l.mes !== mes) continue;
    const atual = porDia.get(l.dia) ?? [];
    atual.push(l);
    porDia.set(l.dia, atual);
  }
  return porDia;
}

/** "0 lembretes" · "1 lembrete" · "N lembretes". */
export function textoContador(n: number): string {
  return n === 1 ? '1 lembrete' : `${n} lembretes`;
}

/** Blocos da célula: os primeiros + quantos sobraram para o "+N". */
export function fatiaDia(itens: LembreteCalendario[]): {
  visiveis: LembreteCalendario[];
  extras: number;
} {
  return { visiveis: itens.slice(0, MAX_POR_DIA), extras: Math.max(0, itens.length - MAX_POR_DIA) };
}
