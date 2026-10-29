// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  adicionarAoHistorico,
  atualizarAprovacaoHistorico,
  listarHistorico,
  type OrcamentoSalvo,
} from '../src/utils/historico';
import { fimDoDiaMs, filtrarPorPeriodo, gruposPorMes, inicioDoDiaMs, linhaRelatorio, mesAnterior, mesDoRegistro, ordenarPorData, percentuaisAprovacao, relatorioParaExcel, rotuloMes, somasAprovadasBruto, tempoDoRegistro, valorAprovadoBruto } from '../src/utils/relatorio';

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

  it('soma mensal em bruto: V puro usa o totalGeral; parcial soma só os marcados (sem revisão)', () => {
    const rec = {
      descReparo: '1 PASTILHA\n2 OLEO',
      orcamentoRaw: '1 Peça PASTILHA 100,00\n2 Serviço OLEO 50,00',
      ajustesManuais: '',
      revAprovadaInput: '200,00',
      revPecasInput: '0,00',
      desconto: 0,
      parcelas: 1,
      dataDoc: '25/08/2026',
      criadoEm: 'x',
      totalGeral: 350,
      numItens: 2,
    };
    const mk = (id: string, extra: Partial<OrcamentoSalvo> = {}) =>
      ({ ...rec, id, ...extra }) as OrcamentoSalvo;
    // V puro = bruto cheio (revisão + tudo)
    expect(valorAprovadoBruto(mk('v', { aprovacao: 'aprovado' }))).toBe(350);
    // V com desmarque misto = só o marcado, sem revisão
    expect(valorAprovadoBruto(mk('vp', { aprovacao: 'aprovado', naoRealizados: [2] }))).toBe(100);
    // P sem desmarque = todos os itens, sem revisão
    expect(valorAprovadoBruto(mk('p', { aprovacao: 'parcial' }))).toBe(150);
    // P com desmarque = só o marcado
    expect(valorAprovadoBruto(mk('pp', { aprovacao: 'parcial', naoRealizados: [2] }))).toBe(100);
    // X com algo aprovado soma o marcado (mesmo recorte do % parcial)
    expect(valorAprovadoBruto(mk('x', { aprovacao: 'naoAprovado', naoRealizados: [2] }))).toBe(100);
    // Zerados: X puro, V cheio degenerado, sem marca
    expect(valorAprovadoBruto(mk('xn', { aprovacao: 'naoAprovado' }))).toBe(0);
    expect(valorAprovadoBruto(mk('vc', { aprovacao: 'aprovado', naoRealizados: [1, 2] }))).toBe(0);
    expect(valorAprovadoBruto(mk('sm', { naoRealizados: [2] }))).toBe(0);
    expect(valorAprovadoBruto(mk('sz'))).toBe(0);
  });

  it('somasAprovadasBruto: separa aprovados/parcial e respeita o mês filtrado', () => {
    const rec = {
      descReparo: '1 PASTILHA\n2 OLEO',
      orcamentoRaw: '1 Peça PASTILHA 100,00\n2 Serviço OLEO 50,00',
      ajustesManuais: '',
      revAprovadaInput: '200,00',
      revPecasInput: '0,00',
      desconto: 0,
      parcelas: 1,
      criadoEm: 'x',
      totalGeral: 350,
      numItens: 2,
    };
    const vAgo = { ...rec, id: 'v', dataDoc: '25/08/2026', aprovacao: 'aprovado' } as OrcamentoSalvo;
    const pAgo = { ...rec, id: 'p', dataDoc: '26/08/2026', aprovacao: 'parcial', naoRealizados: [2] } as OrcamentoSalvo;
    const vSet = { ...rec, id: 's', dataDoc: '05/09/2026', aprovacao: 'aprovado' } as OrcamentoSalvo;
    const xSet = { ...rec, id: 'x', dataDoc: '06/09/2026', aprovacao: 'naoAprovado' } as OrcamentoSalvo;
    expect(somasAprovadasBruto([vAgo, pAgo, vSet, xSet])).toEqual({ aprovados: 700, parcial: 100, total: 800 });
    const soAgo = [vAgo, pAgo, vSet, xSet].filter((r) => mesDoRegistro(r) === '08/2026');
    expect(somasAprovadasBruto(soAgo)).toEqual({ aprovados: 350, parcial: 100, total: 450 });
    expect(somasAprovadasBruto([])).toEqual({ aprovados: 0, parcial: 0, total: 0 });
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

  it('filtro por período: intervalo inclusivo (dia cheio nas bordas)', () => {
    const a = { ...base, id: 'a', criadoEm: 'x', dataDoc: '01/10/2026' } as OrcamentoSalvo;
    const b = { ...base, id: 'b', criadoEm: 'x', dataDoc: '05/10/2026' } as OrcamentoSalvo;
    const c = { ...base, id: 'c', criadoEm: 'x', dataDoc: '07/10/2026' } as OrcamentoSalvo;
    expect(filtrarPorPeriodo([a, b, c], '2026-10-01', '2026-10-07').map((r) => r.id)).toEqual(['a', 'b', 'c']);
    expect(filtrarPorPeriodo([a, b, c], '2026-10-02', '2026-10-06').map((r) => r.id)).toEqual(['b']);
    expect(filtrarPorPeriodo([a, b, c], '2026-10-05', '2026-10-05').map((r) => r.id)).toEqual(['b']);
  });

  it('filtro por período: só início ou só fim (lado vazio = sem limite)', () => {
    const a = { ...base, id: 'a', criadoEm: 'x', dataDoc: '01/10/2026' } as OrcamentoSalvo;
    const b = { ...base, id: 'b', criadoEm: 'x', dataDoc: '05/10/2026' } as OrcamentoSalvo;
    expect(filtrarPorPeriodo([a, b], '2026-10-05', null).map((r) => r.id)).toEqual(['b']);
    expect(filtrarPorPeriodo([a, b], null, '2026-10-01').map((r) => r.id)).toEqual(['a']);
    expect(filtrarPorPeriodo([a, b], null, null).map((r) => r.id)).toEqual(['a', 'b']);
    expect(filtrarPorPeriodo([a, b], '', '').map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('filtro por período: início após o fim = vazio; inválido = sem limite', () => {
    const a = { ...base, id: 'a', criadoEm: 'x', dataDoc: '05/10/2026' } as OrcamentoSalvo;
    expect(filtrarPorPeriodo([a], '2026-10-07', '2026-10-01')).toEqual([]);
    expect(filtrarPorPeriodo([a], 'invalida', '2026-10-31').map((r) => r.id)).toEqual(['a']);
    expect(filtrarPorPeriodo([a], '2026-02-30', null).map((r) => r.id)).toEqual(['a']);
    expect(inicioDoDiaMs('2026-02-30')).toBeNull();
    expect(fimDoDiaMs('2026-13-01')).toBeNull();
  });

  it('filtro por período: cai para a data de processamento e ignora sem-data', () => {
    const proc = { ...base, id: 'p', criadoEm: '05/10/2026 18:00:00', dataDoc: '' } as OrcamentoSalvo;
    const sem = { ...base, id: 's', criadoEm: 'sem-data', dataDoc: '' } as OrcamentoSalvo;
    expect(filtrarPorPeriodo([proc, sem], '2026-10-01', '2026-10-31').map((r) => r.id)).toEqual(['p']);
    expect(filtrarPorPeriodo([proc, sem], null, null).map((r) => r.id)).toEqual(['p', 's']);
    // hora do processamento entra no dia cheio
    const cedo = { ...base, id: 'c', criadoEm: '05/10/2026 00:00:00', dataDoc: '' } as OrcamentoSalvo;
    const tarde = { ...base, id: 't', criadoEm: '05/10/2026 23:59:59', dataDoc: '' } as OrcamentoSalvo;
    expect(filtrarPorPeriodo([cedo, tarde], '2026-10-05', '2026-10-05').map((r) => r.id)).toEqual(['c', 't']);
  });

  it('filtro por período: combina com o mês (E lógico) e o copiar leva só o intervalo', () => {
    const a = { ...base, id: 'a', criadoEm: 'x', dataDoc: '28/09/2026', nome: 'SET' } as OrcamentoSalvo;
    const b = { ...base, id: 'b', criadoEm: 'x', dataDoc: '02/10/2026', nome: 'OUT1' } as OrcamentoSalvo;
    const c = { ...base, id: 'c', criadoEm: 'x', dataDoc: '20/10/2026', nome: 'OUT2' } as OrcamentoSalvo;
    const soOut = [a, b, c].filter((r) => mesDoRegistro(r) === '10/2026');
    const intervalo = filtrarPorPeriodo(soOut, '2026-10-01', '2026-10-07');
    expect(intervalo.map((r) => r.id)).toEqual(['b']);
    const texto = relatorioParaExcel(ordenarPorData(intervalo, 'antigos'));
    expect(texto).toContain('OUT1');
    expect(texto).not.toContain('OUT2');
    expect(texto).not.toContain('SET');
  });
});
