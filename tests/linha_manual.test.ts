// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import {
  aplicarPrevia,
  calcularPrevia,
  construirPrevia,
  criarPreviaManual,
  ehLinhaVazia,
  numeroExibicaoPrevia,
  previaComOriginal,
  previaVazia,
  processQuote,
  recalcularComSelecao,
  removerItemDefinitivo,
} from '../src/utils/quoteLogic';
import {
  adicionarAoHistorico,
  filtrarHistorico,
  limparHistorico,
  listarHistorico,
  type OrcamentoSalvo,
} from '../src/utils/historico';

const RES = processQuote('01 A\n02 B\n03 C', '1 Serviço X 1 10,00\n2 Serviço Y 1 20,00\n3 Serviço Z 1 30,00', 100, 0, 0, 6);

const novoBase = (descReparo: string, manual?: boolean): Omit<OrcamentoSalvo, 'id' | 'criadoEm'> => ({
  descReparo,
  orcamentoRaw: '',
  ajustesManuais: '',
  revAprovadaInput: '100,00',
  revPecasInput: '50,00',
  desconto: 5,
  parcelas: 6,
  manual,
  totalPecasGeral: 50,
  totalServicosGeral: 50,
  valorDescontoTotal: 5,
  valorLiquidoFinal: 95,
  totalGeral: 100,
});

beforeEach(() => {
  limparHistorico();
});

describe('segundo × — apagar a linha de vez', () => {
  it('tira o item do array e renumera o resto (3 vira 2)', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    const nova = removerItemDefinitivo(p, 2);
    expect(nova.itens.map((i) => i.id)).toEqual([1, 3]);
    expect(nova.itens.filter((i) => !i.excluido).map((i) => numeroExibicaoPrevia(nova.itens, i.id))).toEqual([1, 2]);
  });

  it('não toca no original (o ↺ continua restaurando tudo)', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    const nova = removerItemDefinitivo(p, 2);
    expect(nova.original?.itens).toHaveLength(3);
  });

  it('os totais caem junto (adicional, total e Total Geral)', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    const nova = removerItemDefinitivo(p, 2);
    const c = calcularPrevia(nova, new Set([1, 3]));
    expect(c.adicional).toBeCloseTo(40, 2);
    expect(c.total).toBeCloseTo(140, 2);
    expect(c.totalGeralPrevia).toBeCloseTo(140, 2);
  });

  it('o resumo sincronizado perde a linha apagada', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    const nova = removerItemDefinitivo(p, 1);
    const s = aplicarPrevia({ ...RES, items: RES.items.map((i) => ({ ...i })) }, nova);
    expect(s.items.map((i) => i.id)).toEqual([2, 3]);
  });

  it('RESUMO/relatório não negativam depois do apagar (totais acompanham)', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    const nova = removerItemDefinitivo(p, 1);
    const s = aplicarPrevia({ ...RES, items: RES.items.map((i) => ({ ...i })) }, nova);
    expect(s.totalOrcamento).toBeCloseTo(50, 2);
    expect(s.totalGeral).toBeCloseTo(150, 2);
    const r = recalcularComSelecao(s, new Set([2, 3]));
    expect(r.totalPecasGeral).toBeCloseTo(0, 2);
    expect(r.totalServicosGeral).toBeCloseTo(150, 2);
    expect(r.valorLiquidoFinal).toBeCloseTo(150, 2);
    expect(r.totalOrcamento).toBeCloseTo(50, 2);
  });

  it('excluir (primeiro ×) continua reversível e independente', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    p.itens[0].excluido = true;
    expect(numeroExibicaoPrevia(p.itens, 1)).toBeNull();
    const nova = removerItemDefinitivo(p, 1);
    expect(nova.itens).toHaveLength(2);
    // A outra linha excluída segue excluída (não foi afetada).
    p.itens[1].excluido = true;
    const nova2 = removerItemDefinitivo(p, 1);
    expect(nova2.itens[0].excluido).toBe(true);
  });
});

describe('orçamento manual (botão "+")', () => {
  it('cria só o item 1, vazio, com revisão zerada', () => {
    const p = previaComOriginal(criarPreviaManual());
    expect(p.itens).toEqual([{ id: 1, descricao: '', valor: 0, excluido: false }]);
    expect(p.revisaoAprovada).toBe(0);
    expect(p.original?.itens).toHaveLength(1);
  });

  it('parcelamento 6x com teto continua valendo no manual', () => {
    const p = previaComOriginal(criarPreviaManual());
    p.itens[0].descricao = 'PASTILHA';
    p.itens[0].valor = 100;
    const c = calcularPrevia(p, new Set([1]), 6);
    expect(c.numParcelas).toBe(6);
    expect(c.total).toBeCloseTo(100, 2);
  });

  it('linha vazia é detectada; com conteúdo não é', () => {
    expect(ehLinhaVazia({ descricao: '', valor: 0 })).toBe(true);
    expect(ehLinhaVazia({ descricao: '   ', valor: 0 })).toBe(true);
    expect(ehLinhaVazia({ descricao: 'A', valor: 0 })).toBe(false);
    expect(ehLinhaVazia({ descricao: '', valor: 10 })).toBe(false);
  });

  it('previaVazia: tudo vazio + revisão 0 = vazio; resto = com conteúdo', () => {
    expect(previaVazia(previaComOriginal(criarPreviaManual()))).toBe(true);
    const comRevisao = previaComOriginal({ ...criarPreviaManual(), revisaoAprovada: 500 });
    expect(previaVazia(comRevisao)).toBe(false);
    const comLinha = previaComOriginal(construirPrevia(RES.items, 0));
    expect(previaVazia(comLinha)).toBe(false);
    // Só excluídas + revisão 0 também é vazio (nada imprimível).
    const soExcluidas = previaComOriginal(construirPrevia(RES.items, 0));
    soExcluidas.itens.forEach((i) => { i.excluido = true; });
    expect(previaVazia(soExcluidas)).toBe(true);
  });
});

describe('manual no histórico', () => {
  it('forcarNovo sempre cria registro novo (mesmo vazio/duplicado)', () => {
    adicionarAoHistorico(novoBase('', true), true);
    adicionarAoHistorico(novoBase('', true), true);
    expect(listarHistorico()).toHaveLength(2);
    expect(listarHistorico().every((r) => r.manual === true)).toBe(true);
  });

  it('buscar "manual" acha os orçamentos manuais', () => {
    adicionarAoHistorico(novoBase('', true), true);
    adicionarAoHistorico(novoBase('01 FREIO'), true);
    const achados = filtrarHistorico(listarHistorico(), 'manual');
    expect(achados).toHaveLength(1);
    expect(achados[0].manual).toBe(true);
  });

  it('sem forcarNovo, o anti-duplicado continua valendo', () => {
    adicionarAoHistorico(novoBase('01 TESTE'));
    adicionarAoHistorico(novoBase('01 TESTE'));
    expect(listarHistorico()).toHaveLength(1);
  });
});
