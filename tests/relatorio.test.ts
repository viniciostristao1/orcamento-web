// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  adicionarAoHistorico,
  atualizarAprovacaoHistorico,
  listarHistorico,
  type OrcamentoSalvo,
} from '../src/utils/historico';
import { gruposPorMes, linhaRelatorio, mesAnterior, mesDoRegistro, ordenarPorData, percentuaisAprovacao, relatorioParaExcel, rotuloMes, tempoDoRegistro } from '../src/utils/relatorio';

const base = {
  descReparo: '1 X',
  orcamentoRaw: '1 Peça X 1 10,00',
  ajustesManuais: '',
  revAprovadaInput: '100,00',
  revPecasInput: '50,00',
  desconto: 5,
  parcelas: 3,
  placa: 'ABC1D23',
  telefone: '51 99999-9999',
  numeroOrcamento: '19715',
  dataDoc: '25/08/2026',
  nome: 'ELTON JOSE LORENZI',
  totalPecasGeral: 60,
  totalServicosGeral: 50,
  valorDescontoTotal: 3,
  valorLiquidoFinal: 107,
  totalGeral: 110,
  numItens: 2,
};

describe('relatório para Excel (aprovados)', () => {
  it('linha no formato do modelo (TAB separa as 7 células)', () => {
    const r = { ...base, id: '1', criadoEm: 'x', aprovacao: 'aprovado' } as OrcamentoSalvo;
    expect(linhaRelatorio(r)).toEqual([
      '25/08/2026',
      'ELTON JOSE LORENZI',
      'CSP',
      '19715',
      'Sim',
      'Vinícios',
      '',
    ]);
    expect(relatorioParaExcel([r])).toBe(
      '25/08/2026\tELTON JOSE LORENZI\tCSP\t19715\tSim\tVinícios\t',
    );
  });

  it('com desmarcados, a última coluna é Parcial', () => {
    const r = { ...base, id: '1', criadoEm: 'x', aprovacao: 'aprovado', naoRealizados: [1] } as OrcamentoSalvo;
    const cells = linhaRelatorio(r);
    expect(cells[4]).toBe('Sim');
    expect(cells[6]).toBe('Parcial');
  });

  it('X com algo aprovado é Sim + Parcial (o X é gancho de cobrança)', () => {
    const xParcial = { ...base, id: '1', criadoEm: 'x', aprovacao: 'naoAprovado', naoRealizados: [1] } as OrcamentoSalvo;
    expect(linhaRelatorio(xParcial).slice(4, 7)).toEqual(['Sim', 'Vinícios', 'Parcial']);
    // X sem nada aprovado é Não puro (tudo riscado ou só a marca)
    const xCheio = { ...base, id: '2', criadoEm: 'x', aprovacao: 'naoAprovado', naoRealizados: [1, 2] } as OrcamentoSalvo;
    expect(linhaRelatorio(xCheio).slice(4, 7)).toEqual(['Não', 'Vinícios', '']);
    const xMarca = { ...base, id: '3', criadoEm: 'x', aprovacao: 'naoAprovado' } as OrcamentoSalvo;
    expect(linhaRelatorio(xMarca).slice(4, 7)).toEqual(['Não', 'Vinícios', '']);
    // sem marca e tudo desmarcado: também não é parcial (nada aprovado)
    const semMarcaCheio = { ...base, id: '4', criadoEm: 'x', naoRealizados: [1, 2] } as OrcamentoSalvo;
    expect(linhaRelatorio(semMarcaCheio)[6]).toBe('');
    // misto sem marca continua parcial
    const semMarcaMisto = { ...base, id: '5', criadoEm: 'x', naoRealizados: [1] } as OrcamentoSalvo;
    expect(linhaRelatorio(semMarcaMisto)[6]).toBe('Parcial');
  });

  it('não aprovado vira Não; sem marca, célula vazia', () => {
    const nao = { ...base, id: '1', criadoEm: 'x', aprovacao: 'naoAprovado' } as OrcamentoSalvo;
    expect(linhaRelatorio(nao)[4]).toBe('Não');
    const sem = { ...base, id: '2', criadoEm: 'x' } as OrcamentoSalvo;
    expect(linhaRelatorio(sem)[4]).toBe('');
  });

  it('data cai para a do processamento quando sem data do documento', () => {
    const r = { ...base, id: '1', criadoEm: '01/08/2026 09:00:00', dataDoc: '' } as OrcamentoSalvo;
    expect(linhaRelatorio(r)[0]).toBe('01/08/2026');
  });

  it('marca/desmarca e preserva ao reprocessar', () => {
    localStorage.clear();
    adicionarAoHistorico(base);
    const [rec] = listarHistorico();
    atualizarAprovacaoHistorico(rec.id, 'aprovado');
    expect(listarHistorico()[0].aprovacao).toBe('aprovado');
    adicionarAoHistorico(base); // mesmos dados → substitui sem duplicar
    expect(listarHistorico()).toHaveLength(1);
    expect(listarHistorico()[0].aprovacao).toBe('aprovado');
    atualizarAprovacaoHistorico(rec.id, undefined);
    expect(listarHistorico()[0].aprovacao).toBeUndefined();
  });

  it('agrupa por mês (data do documento, cai para processamento)', () => {
    const a = { ...base, id: '1', criadoEm: 'x', dataDoc: '25/08/2026' } as OrcamentoSalvo;
    const b = { ...base, id: '2', criadoEm: '05/09/2026 10:00:00', dataDoc: '' } as OrcamentoSalvo;
    expect(mesDoRegistro(a)).toBe('08/2026');
    expect(mesDoRegistro(b)).toBe('09/2026');
    expect(rotuloMes('08/2026')).toBe('AGOSTO/2026');
    const grupos = gruposPorMes([a, b]);
    expect(grupos.map((g) => g.mes)).toEqual(['08/2026', '09/2026']);
  });

  it('percentuais sobre o total (sem marca não entra em fatia)', () => {
    const mk = (id: string, aprovacao?: 'aprovado' | 'naoAprovado', naoRealizados?: number[]) =>
      ({ ...base, id, criadoEm: 'x', ...(aprovacao ? { aprovacao } : {}), ...(naoRealizados ? { naoRealizados } : {}) }) as OrcamentoSalvo;
    const pct = percentuaisAprovacao([mk('a', 'aprovado'), mk('b', 'aprovado', [1]), mk('c', 'naoAprovado', [1]), mk('d')]);
    expect(pct).toEqual({ aprovados: 25, parcial: 50, naoAprovados: 0, total: 4 });
    expect(percentuaisAprovacao([])).toEqual({ aprovados: 0, parcial: 0, naoAprovados: 0, total: 0 });
  });

  it('percentuais: V com tudo desmarcado conta como não aprovado (não parcial)', () => {
    const mk = (id: string, aprovacao?: 'aprovado' | 'naoAprovado', naoRealizados?: number[]) =>
      ({ ...base, id, criadoEm: 'x', ...(aprovacao ? { aprovacao } : {}), ...(naoRealizados ? { naoRealizados } : {}) }) as OrcamentoSalvo;
    const pct = percentuaisAprovacao([mk('a', 'aprovado', [1, 2])]);
    expect(pct).toEqual({ aprovados: 0, parcial: 0, naoAprovados: 100, total: 1 });
  });

  it('copiar leva só linhas de dados (sem cabeçalho de mês)', () => {
    const a = { ...base, id: '1', criadoEm: 'x', dataDoc: '25/08/2026' } as OrcamentoSalvo;
    const texto = relatorioParaExcel([a]);
    expect(texto).not.toContain('AGOSTO');
    expect(texto.split('\n')).toHaveLength(1);
  });

  it('seletor de mês: copiar só o mês filtra linhas e percentuais', () => {
    const a = { ...base, id: '1', criadoEm: 'x', dataDoc: '25/08/2026', nome: 'AGOSTO', aprovacao: 'aprovado' } as OrcamentoSalvo;
    const b = { ...base, id: '2', criadoEm: 'x', dataDoc: '05/09/2026', nome: 'SETEMBRO', aprovacao: 'naoAprovado' } as OrcamentoSalvo;
    const lista = [a, b];
    const soSet = lista.filter((r) => mesDoRegistro(r) === '09/2026');
    expect(soSet.map((r) => r.id)).toEqual(['2']);
    const texto = relatorioParaExcel(soSet);
    expect(texto).toContain('SETEMBRO');
    expect(texto).not.toContain('AGOSTO');
    expect(texto.split('\n')).toHaveLength(1);
    expect(percentuaisAprovacao(soSet)).toEqual({ aprovados: 0, parcial: 0, naoAprovados: 100, total: 1 });
  });

  it('mês anterior atravessa o ano (para o comparativo)', () => {
    expect(mesAnterior('09/2026')).toBe('08/2026');
    expect(mesAnterior('01/2026')).toBe('12/2025');
    expect(mesAnterior('12/2025')).toBe('11/2025');
    expect(mesAnterior('13/2026')).toBeNull();
    expect(mesAnterior('todos')).toBeNull();
    expect(mesAnterior('')).toBeNull();
  });

  it('ordem da data: recentes primeiro ou antigos primeiro', () => {
    const a = { ...base, id: 'ago', criadoEm: 'x', dataDoc: '25/08/2026' } as OrcamentoSalvo;
    const b = { ...base, id: 'set', criadoEm: 'x', dataDoc: '05/09/2026' } as OrcamentoSalvo;
    expect(tempoDoRegistro(a)).toBeLessThan(tempoDoRegistro(b));
    expect(ordenarPorData([a, b], 'recentes').map((r) => r.id)).toEqual(['set', 'ago']);
    expect(ordenarPorData([a, b], 'antigos').map((r) => r.id)).toEqual(['ago', 'set']);
    // sem data do documento, cai para a do processamento (com hora)
    const c = { ...base, id: 'c', criadoEm: '01/08/2026 09:00:00', dataDoc: '' } as OrcamentoSalvo;
    const d = { ...base, id: 'd', criadoEm: '01/08/2026 18:00:00', dataDoc: '' } as OrcamentoSalvo;
    expect(ordenarPorData([c, d], 'antigos').map((r) => r.id)).toEqual(['c', 'd']);
    expect(tempoDoRegistro({ ...base, id: 'x', dataDoc: '', criadoEm: 'sem-data' } as OrcamentoSalvo)).toBe(0);
  });
});
