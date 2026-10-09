import { temNaoRealizados, temParcial, type OrcamentoSalvo } from './historico';
import { dataDoRegistro } from './lembretes';

/**
 * Relatório para Excel: uma linha por orçamento do histórico, colunas TAB
 * (`DATA ⇥ NOME ⇥ CSP ⇥ NÚMERO ⇥ Sim/Não ⇥ Vinícios`) — no Excel cada valor
 * cai na sua célula. Inclui TODOS (sem marca = célula vazia).
 */
export const RELATORIO_TIPO = 'CSP';
export const RELATORIO_RESPONSAVEL = 'Vinícios';

/** Uma linha do relatório (7 células, nesta ordem). */
export function linhaRelatorio(r: OrcamentoSalvo): [string, string, string, string, string, string, string] {
  // APROVADO espelha os ITENS (é o que o gerente quer ver): V e P aprovam; X com
  // algo aprovado também é Sim (o X é gancho de cobrança — "não fechou tudo");
  // X sem nada aprovado é Não; sem marca, vazio.
  const aprovado =
    r.aprovacao === 'aprovado' || r.aprovacao === 'parcial' || (r.aprovacao === 'naoAprovado' && temParcial(r))
      ? 'Sim'
      : r.aprovacao === 'naoAprovado'
        ? 'Não'
        : '';
  return [
    (r.dataDoc ?? '').trim() || dataDoRegistro(r.criadoEm),
    (r.nome ?? '').trim(),
    RELATORIO_TIPO,
    (r.numeroOrcamento ?? '').trim(),
    aprovado,
    RELATORIO_RESPONSAVEL,
    // Parcial = misto (algum aprovado e algum desmarcado) ou marca P (clicar em
    // parcial é sempre Parcial). X com tudo riscado é "Não" puro, sem Parcial.
    temParcial(r) || r.aprovacao === 'parcial' ? 'Parcial' : '',
  ];
}

/** Texto pronto para colar no Excel (TAB entre colunas, Enter entre linhas).
 * Só as linhas de dados (sem os cabeçalhos de mês). */
export function relatorioParaExcel(lista: OrcamentoSalvo[]): string {
  return lista.map((r) => linhaRelatorio(r).join('\t')).join('\n');
}

const MESES_PT = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
];

/** "25/08/2026" → "08/2026" (vale para data do documento ou de processamento). */
export function mesDoRegistro(r: OrcamentoSalvo): string {
  const data = (r.dataDoc ?? '').trim() || dataDoRegistro(r.criadoEm);
  const m = data.match(/(\d{2})\/(\d{4})/);
  return m ? `${m[1]}/${m[2]}` : 'SEM DATA';
}

/** "25/08/2026" (ou "25/08/2026 09:00:00") → ms (data do documento, cai para
 *  a do processamento). 0 quando não dá para ler (vai para o fim da ordem). */
export function tempoDoRegistro(r: OrcamentoSalvo): number {
  const data = (r.dataDoc ?? '').trim() || dataDoRegistro(r.criadoEm);
  const m = data.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return 0;
  return new Date(
    parseInt(m[3], 10),
    parseInt(m[2], 10) - 1,
    parseInt(m[1], 10),
    parseInt(m[4] ?? '0', 10),
    parseInt(m[5] ?? '0', 10),
    parseInt(m[6] ?? '0', 10),
  ).getTime();
}

export type OrdemDataRelatorio = 'recentes' | 'antigos';

/** Ordena por data: recentes = maior primeiro; antigos = menor primeiro. */
export function ordenarPorData(lista: OrcamentoSalvo[], ordem: OrdemDataRelatorio): OrcamentoSalvo[] {
  const copia = [...lista];
  copia.sort((a, b) =>
    ordem === 'antigos' ? tempoDoRegistro(a) - tempoDoRegistro(b) : tempoDoRegistro(b) - tempoDoRegistro(a),
  );
  return copia;
}

/** "08/2026" → "AGOSTO/2026" (rótulo do grupo no relatório). */
export function rotuloMes(mes: string): string {
  const m = mes.match(/(\d{2})\/(\d{4})/);
  if (!m) return mes;
  const nome = MESES_PT[parseInt(m[1], 10) - 1] ?? m[1];
  return `${nome}/${m[2]}`;
}

/** "09/2026" → "08/2026" (atravessa o ano: "01/2026" → "12/2025"). Null se inválido. */
export function mesAnterior(mes: string): string | null {
  const m = mes.match(/^(\d{2})\/(\d{4})$/);
  if (!m) return null;
  let mm = parseInt(m[1], 10);
  let aa = parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return null;
  mm -= 1;
  if (mm < 1) {
    mm = 12;
    aa -= 1;
  }
  return `${String(mm).padStart(2, '0')}/${aa}`;
}

export interface GrupoMes {
  mes: string;
  registros: OrcamentoSalvo[];
}

/** Agrupa por mês mantendo a ordem (mais recentes primeiro, como a lista). */
export function gruposPorMes(lista: OrcamentoSalvo[]): GrupoMes[] {
  const grupos: GrupoMes[] = [];
  for (const r of lista) {
    const mes = mesDoRegistro(r);
    const g = grupos.find((x) => x.mes === mes);
    if (g) g.registros.push(r);
    else grupos.push({ mes, registros: [r] });
  }
  return grupos;
}

export interface PercentuaisAprovacao {
  aprovados: number;
  parcial: number;
  naoAprovados: number;
  total: number;
}

/** % sobre o total (arredondadas; sem marca não entra em nenhuma fatia). */
export function percentuaisAprovacao(lista: OrcamentoSalvo[]): PercentuaisAprovacao {
  const total = lista.length;
  const pct = (n: number): number => (total === 0 ? 0 : Math.round((n / total) * 100));
  const aprovados = lista.filter((r) => r.aprovacao === 'aprovado' && !temNaoRealizados(r)).length;
  // Parcial = misto com marca (V, P ou X) ou marca P (clicar em parcial é sempre
  // Parcial, mesmo sem desmarque).
  const parcial = lista.filter(
    (r) => !!r.aprovacao && (temParcial(r) || r.aprovacao === 'parcial'),
  ).length;
  // Não aprovados = X puro (tudo riscado ou só a marca), V degenerado com tudo
  // desmarcado, ou sem marca com desmarcados.
  const naoAprovados = lista.filter(
    (r) =>
      (r.aprovacao === 'naoAprovado' && !temParcial(r)) ||
      (r.aprovacao === 'aprovado' && temNaoRealizados(r) && !temParcial(r)) ||
      (!r.aprovacao && temNaoRealizados(r)),
  ).length;
  return { aprovados: pct(aprovados), parcial: pct(parcial), naoAprovados: pct(naoAprovados), total };
}
