// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  aplicarPrevia,
  calcularPrevia,
  construirPrevia,
  numeroExibicaoPrevia,
  previaComOriginal,
  processQuote,
} from '../src/utils/quoteLogic';

const RES = processQuote('01 A\n02 B\n03 C', '1 Serviço X 1 10,00\n2 Serviço Y 1 20,00\n3 Serviço Z 1 30,00', 100, 0, 0, 6);
const TODOS = new Set([1, 2, 3]);

describe('prévia interativa do documento', () => {
  it('constrói do resultado (tudo aprovado, nada excluído, original guardado)', () => {
    const p = previaComOriginal(construirPrevia(RES.items, RES.revisaoAprovada));
    expect(p.itens.map((i) => [i.id, i.descricao, i.valor, i.excluido])).toEqual([
      [1, 'A', 10, false],
      [2, 'B', 20, false],
      [3, 'C', 30, false],
    ]);
    expect(p.revisaoAprovada).toBe(100);
    expect(p.original?.itens).toHaveLength(3);
  });

  it('adicional = marcados; total = revisão + adicional; parcela com teto', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 90));
    const c = calcularPrevia(p, new Set([1, 3]), 3);
    expect(c.adicional).toBeCloseTo(40, 2);
    expect(c.total).toBeCloseTo(130, 2);
    expect(c.numParcelas).toBe(3);
    expect(c.parcela).toBeCloseTo(43.34, 2); // 130 / 3 = 43,333… → 43,34
  });

  it('parcela arredonda para cima; divisão exata usa o valor exato', () => {
    const p = previaComOriginal(construirPrevia([{ id: 1, description: 'A', value: 100 }], 0));
    expect(calcularPrevia(p, new Set([1]), 3).parcela).toBeCloseTo(33.34, 2);
    const exato = previaComOriginal(construirPrevia([{ id: 1, description: 'A', value: 90 }], 0));
    expect(calcularPrevia(exato, new Set([1]), 3).parcela).toBeCloseTo(30, 2);
  });

  it('casos do contrato: 4395,87 e 4395,88 em 3x; padrão 6x', () => {
    const base = (total: number) =>
      previaComOriginal(construirPrevia([{ id: 1, description: 'A', value: total }], 0));
    expect(calcularPrevia(base(4395.87), new Set([1]), 3).parcela).toBeCloseTo(1465.29, 2);
    expect(calcularPrevia(base(4395.88), new Set([1]), 3).parcela).toBeCloseTo(1465.3, 2);
    const c6 = calcularPrevia(base(4395.87), new Set([1]), 6);
    expect(c6.numParcelas).toBe(6);
    expect(c6.parcela).toBeCloseTo(732.65, 2); // 4395,87 / 6 = 732,645 → 732,65
  });

  it('item desmarcado sai dos totais e volta ao marcar', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    expect(calcularPrevia(p, new Set([1, 2])).adicional).toBeCloseTo(30, 2);
    expect(calcularPrevia(p, TODOS).adicional).toBeCloseTo(60, 2);
  });

  it('excluído sai de tudo (inclusive Não Aprovados e Total Geral)', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    p.itens[1].excluido = true;
    const c = calcularPrevia(p, TODOS);
    expect(c.adicional).toBeCloseTo(40, 2);
    expect(c.totalGeralPrevia).toBeCloseTo(140, 2);
    expect(c.naoAprovados).toHaveLength(0);
    expect(numeroExibicaoPrevia(p.itens, 2)).toBeNull();
  });

  it('excluir o 2 faz o 3 virar 2; restaurar volta à posição original', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    p.itens[1].excluido = true;
    expect(p.itens.filter((i) => !i.excluido).map((i) => numeroExibicaoPrevia(p.itens, i.id))).toEqual([1, 2]);
    p.itens[1].excluido = false;
    expect(p.itens.filter((i) => !i.excluido).map((i) => numeroExibicaoPrevia(p.itens, i.id))).toEqual([1, 2, 3]);
  });

  it('aplicarPrevia sincroniza o resumo (RESUMO, relatório, V/X coerentes)', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    p.itens[0].descricao = 'A EDITADO';
    p.itens[0].valor = 20;
    p.revisaoAprovada = 200;
    const s = aplicarPrevia({ ...RES, items: RES.items.map((i) => ({ ...i })) }, p);
    expect(s.items[0].description).toBe('A EDITADO');
    expect(s.items[0].value).toBeCloseTo(20, 2);
    expect(s.items[0].pecasValue + s.items[0].servicosValue).toBeCloseTo(20, 2);
    expect(s.revisaoAprovada).toBe(200);
  });

  it('editar revisão muda total e parcelas', () => {
    const p = previaComOriginal(construirPrevia(RES.items, 100));
    p.revisaoAprovada = 40;
    const c = calcularPrevia(p, TODOS, 3);
    expect(c.total).toBeCloseTo(100, 2);
    expect(c.parcela).toBeCloseTo(33.34, 2);
  });
});
