import { describe, expect, it } from 'vitest';
import { formatarPreco, parseInput, parsePreco } from '../src/tire/utils/parser';
import { montarDescricaoWhats } from '../src/tire/utils/descricaoWhats';

const TABELA = [
  ['265/60R18', 'MARCA/MODELO', 'À PRAZO 10x', 'À VISTA (10%)', 'ESTOQUE'],
  ['4265292105', 'Firestone', 'R$ 1.115,48', 'R$ 1.004,28', '0'],
  ['4265292105', 'Bridgestone Dueler HT', 'R$ 1.146,72', 'R$ 1.032,40', '12'],
  ['4265262205', 'Michelin SUV HT', 'R$ 1.488,20', 'R$ 1.339,73', '5'],
].map((linha) => linha.join('\t')).join('\n');

describe('parsePreco', () => {
  it('converte preço BR com R$ e milhar', () => {
    expect(parsePreco('R$ 1.115,48')).toBeCloseTo(1115.48, 6);
    expect(parsePreco('R$ 2.855,64')).toBeCloseTo(2855.64, 6);
  });
  it('vazio/inválido = 0', () => {
    expect(parsePreco('')).toBe(0);
    expect(parsePreco('abc')).toBe(0);
  });
});

describe('formatarPreco', () => {
  it('formata em BRL', () => {
    expect(formatarPreco(1115.48).replace(/\s/g, ' ')).toBe('R$ 1.115,48');
    expect(formatarPreco(0).replace(/\s/g, ' ')).toBe('R$ 0,00');
  });
});

describe('parseInput', () => {
  it('lê medida e pneus da tabela colada com TABs', () => {
    const promo = parseInput(TABELA);
    expect(promo.measure).toBe('265/60R18');
    expect(promo.tires).toHaveLength(3);
    expect(promo.tires[0]).toEqual({
      sku: '4265292105',
      brand: 'Firestone',
      priceInstallment: 1115.48,
      priceCash: 1004.28,
      stock: 0,
    });
    expect(promo.tires[1].brand).toBe('Bridgestone Dueler HT');
    expect(promo.tires[1].stock).toBe(12);
  });

  it('menos de 2 linhas = flyer vazio', () => {
    expect(parseInput('')).toEqual({ measure: '', tires: [] });
    expect(parseInput('265/60R18')).toEqual({ measure: '', tires: [] });
  });

  it('campos faltando não quebram', () => {
    const promo = parseInput('205/55R16\n4265\tFirestone');
    expect(promo.measure).toBe('205/55R16');
    expect(promo.tires[0]).toEqual({
      sku: '4265',
      brand: 'Firestone',
      priceInstallment: 0,
      priceCash: 0,
      stock: 0,
    });
  });
});

describe('montarDescricaoWhats', () => {
  it('monta a medida e uma linha por marca (10x no cartão e à vista)', () => {
    const texto = montarDescricaoWhats(parseInput(TABELA)).replace(/\u00a0/g, ' ');
    const linhas = texto.split('\n');
    expect(linhas[0]).toBe('MEDIDA PNEU: 265/60R18');
    expect(linhas[1]).toBe('');
    expect(linhas[2]).toBe(
      '• FIRESTONE - R$ 1.115,48 (em até 10x no Cartão) ou R$ 1.004,28 (Dinheiro, Pix, Débito).',
    );
    expect(linhas[3]).toBe('');
    expect(linhas[4]).toBe(
      '• BRIDGESTONE DUELER HT - R$ 1.146,72 (em até 10x no Cartão) ou R$ 1.032,40 (Dinheiro, Pix, Débito).',
    );
    expect(texto.endsWith('.')).toBe(true);
    expect(texto.endsWith('\n')).toBe(false);
  });
});
