// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Flyer } from '../src/tire/components/Flyer';
import { marcasPresentes, separarMarcaModelo } from '../src/tire/utils/marcas';
import type { PromoInfo } from '../src/tire/types';

afterEach(cleanup);

const promoCom = (
  pneus: { brand: string; installment?: number; cash?: number; stock?: number }[],
): PromoInfo => ({
  measure: '235/60R18',
  tires: pneus.map((p, i) => ({
    sku: `S${i}`,
    brand: p.brand,
    priceInstallment: p.installment ?? 1115.48,
    priceCash: p.cash ?? 1004.28,
    stock: p.stock ?? 8,
  })),
});

const renderVitrine = (data: PromoInfo) => {
  const ref = React.createRef<HTMLDivElement>();
  return render(<Flyer data={data} flyerRef={ref} layout="vitrine" />);
};

describe('separarMarcaModelo', () => {
  it('separa a marca conhecida do modelo', () => {
    expect(separarMarcaModelo('Michelin SUV HT')).toEqual({
      marca: { id: 'MICHELIN', rotulo: 'MICHELIN' },
      modelo: 'SUV HT',
    });
    expect(separarMarcaModelo('Bridgestone Dueler HT').marca?.id).toBe('BRIDGESTONE');
    expect(separarMarcaModelo('Bridgestone Dueler HT').modelo).toBe('Dueler HT');
    expect(separarMarcaModelo('BF Goodrich').marca?.id).toBe('BFGOODRICH');
    expect(separarMarcaModelo('Firestone').modelo).toBe('');
  });

  it('marca desconhecida vira ela mesma (sem modelo)', () => {
    expect(separarMarcaModelo('Xing Ling LT')).toEqual({
      marca: { id: 'XING LING LT', rotulo: 'Xing Ling LT' },
      modelo: '',
    });
    expect(separarMarcaModelo('')).toEqual({ marca: null, modelo: '' });
  });
});

describe('marcasPresentes', () => {
  it('sem Dunlop na tabela, sem Dunlop na faixa (e deduplica Michelin)', () => {
    const marcas = marcasPresentes(['Michelin SUV HT', 'Michelin LTX Trail', 'Bridgestone Dueler HT']);
    expect(marcas.map((m) => m.id)).toEqual(['MICHELIN', 'BRIDGESTONE']);
  });

  it('com Dunlop, a marca aparece na ordem canônica', () => {
    const marcas = marcasPresentes(['Dunlop', 'Firestone', 'Michelin SUV HT']);
    expect(marcas.map((m) => m.rotulo)).toEqual(['MICHELIN', 'DUNLOP', 'FIRESTONE']);
  });

  it('marcas desconhecidas entram no fim, na ordem de aparição', () => {
    const marcas = marcasPresentes(['Xing Ling', 'Michelin', 'Xing Ling LT']);
    expect(marcas.map((m) => m.rotulo)).toEqual(['MICHELIN', 'Xing Ling', 'Xing Ling LT']);
  });
});

describe('FlyerVitrine (layout Vitrine da loja)', () => {
  it('sem faixa de marcas no topo e banner com a medida', () => {
    const { container } = renderVitrine(
      promoCom([{ brand: 'Michelin SUV HT' }, { brand: 'Bridgestone Dueler HT' }]),
    );
    expect(container.querySelector('[data-layout="vitrine"]')).toBeTruthy();
    // Logos OFICIAIS na linha (imagem), um por linha de pneu.
    expect(container.querySelectorAll('img[alt="MICHELIN"]')).toHaveLength(1);
    expect(container.querySelectorAll('img[alt="BRIDGESTONE"]')).toHaveLength(1);
    expect(container.querySelector('img[alt="DUNLOP"]')).toBeNull();
    expect(container.textContent).toContain('235/60R18');
    expect(container.textContent).toContain('OFERTAS');
  });

  it('com Dunlop na lista, o logo Dunlop aparece; sem Dunlop, não aparece', () => {
    const comDunlop = renderVitrine(promoCom([{ brand: 'Dunlop' }, { brand: 'Michelin' }]));
    expect(comDunlop.container.querySelectorAll('img[alt="DUNLOP"]')).toHaveLength(1);
    expect(comDunlop.container.querySelectorAll('img[alt="MICHELIN"]')).toHaveLength(1);
    cleanup();
    const semDunlop = renderVitrine(promoCom([{ brand: 'Michelin' }]));
    expect(semDunlop.container.querySelector('img[alt="DUNLOP"]')).toBeNull();
  });

  it('marca sem arquivo de logo cai no selo de texto', () => {
    const { container } = renderVitrine(promoCom([{ brand: 'Xing Ling LT' }]));
    expect(container.textContent).toContain('Xing Ling LT');
  });

  it('mostra EM ATÉ 10X com o valor INTEGRAL à prazo (não a parcela) e o à vista', () => {
    const { container } = renderVitrine(
      promoCom([{ brand: 'Michelin', installment: 1115.48, cash: 1004.28, stock: 0 }]),
    );
    expect(container.textContent).toContain('Em até 10x');
    // Valor integral à prazo (1.115,48) — nunca a parcela (111,55).
    expect(container.textContent).toContain('1.115');
    expect(container.textContent).toContain(',48');
    expect(container.textContent).not.toContain(',55');
    expect(container.textContent).toContain('1.004');
    expect(container.textContent).toContain(',28');
    expect(container.textContent).toContain('Sob encomenda');
    expect(container.textContent).toContain('Alinhamento cortesia');
    expect(container.textContent).toContain('Parcelamos em');
  });

  it('com estoque não mostra o aviso de encomenda', () => {
    const { container } = renderVitrine(promoCom([{ brand: 'Michelin', stock: 5 }]));
    expect(container.textContent).not.toContain('Sob encomenda');
  });
});
