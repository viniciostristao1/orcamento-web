// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  adicionarAoHistorico,
  atualizarAprovacaoHistorico,
  listarHistorico,
  type OrcamentoSalvo,
} from '../src/utils/historico';
import { linhaRelatorio, relatorioParaExcel } from '../src/utils/relatorio';

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
};

describe('relatório para Excel (aprovados)', () => {
  it('linha no formato do modelo (TAB separa as 6 células)', () => {
    const r = { ...base, id: '1', criadoEm: 'x', aprovacao: 'aprovado' } as OrcamentoSalvo;
    expect(linhaRelatorio(r)).toEqual([
      '25/08/2026',
      'ELTON JOSE LORENZI',
      'CSP',
      '19715',
      'Sim',
      'Vinícios',
    ]);
    expect(relatorioParaExcel([r])).toBe(
      '25/08/2026\tELTON JOSE LORENZI\tCSP\t19715\tSim\tVinícios',
    );
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
});
