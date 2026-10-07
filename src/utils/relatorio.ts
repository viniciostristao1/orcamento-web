import { temNaoRealizados, type OrcamentoSalvo } from './historico';
import { dataDoRegistro } from './lembretes';

/**
 * Relatório para Excel: uma linha por orçamento do histórico, colunas TAB
 * (`DATA ⇥ NOME ⇥ CSP ⇥ NÚMERO ⇥ Sim/Não ⇥ Vinícios`) — no Excel cada valor
 * cai na sua célula. Inclui TODOS (sem marca = célula vazia).
 */
export const RELATORIO_TIPO = 'CSP';
export const RELATORIO_RESPONSAVEL = 'Vinícios';

/** Uma linha do relatório (6 células, nesta ordem). */
export function linhaRelatorio(r: OrcamentoSalvo): [string, string, string, string, string, string] {
  return [
    (r.dataDoc ?? '').trim() || dataDoRegistro(r.criadoEm),
    (r.nome ?? '').trim(),
    RELATORIO_TIPO,
    (r.numeroOrcamento ?? '').trim(),
    r.aprovacao === 'aprovado' ? 'Sim' : r.aprovacao === 'naoAprovado' ? 'Não' : '',
    RELATORIO_RESPONSAVEL,
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

/** "08/2026" → "AGOSTO/2026" (rótulo do grupo no relatório). */
export function rotuloMes(mes: string): string {
  const m = mes.match(/(\d{2})\/(\d{4})/);
  if (!m) return mes;
  const nome = MESES_PT[parseInt(m[1], 10) - 1] ?? m[1];
  return `${nome}/${m[2]}`;
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
  const parcial = lista.filter((r) => r.aprovacao === 'aprovado' && temNaoRealizados(r)).length;
  const naoAprovados = lista.filter(
    (r) => r.aprovacao === 'naoAprovado' || (!r.aprovacao && temNaoRealizados(r)),
  ).length;
  return { aprovados: pct(aprovados), parcial: pct(parcial), naoAprovados: pct(naoAprovados), total };
}
