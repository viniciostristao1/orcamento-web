import type { OrcamentoSalvo } from './historico';
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

/** Texto pronto para colar no Excel (TAB entre colunas, Enter entre linhas). */
export function relatorioParaExcel(lista: OrcamentoSalvo[]): string {
  return lista.map((r) => linhaRelatorio(r).join('\t')).join('\n');
}
