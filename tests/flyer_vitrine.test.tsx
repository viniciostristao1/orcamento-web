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
  it('faixa fixa de marcas no topo (uma linha, 6 logos) e banner com a medida', () => {
    const { container } = renderVitrine(
      promoCom([{ brand: 'Michelin SUV HT' }, { brand: 'Bridgestone Dueler HT' }]),
    );
    expect(container.querySelector('[data-layout="vitrine"]')).toBeTruthy();
    // Topo: SEMPRE as 6 marcas fixas, na ordem pedida (independe da tabela).
    const topo = container.querySelectorAll('[data-faixa-marcas] img');
    expect([...topo].map((el) => el.getAttribute('data-logo-topo'))).toEqual([
      'MICHELIN',
      'BFGOODRICH',
      'BRIDGESTONE',
      'PIRELLI',
      'YOKOHAMA',
      'DUNLOP',
    ]);
    // Logos OFICIAIS na linha (imagem), um por linha de pneu.
    const linhas = '[data-linhas-pneu]';
    expect(container.querySelectorAll(`${linhas} img[alt="MICHELIN"]`)).toHaveLength(1);
    expect(container.querySelectorAll(`${linhas} img[alt="BRIDGESTONE"]`)).toHaveLength(1);
    expect(container.querySelector(`${linhas} img[alt="DUNLOP"]`)).toBeNull();
    expect(container.textContent).toContain('235/60R18');
    expect(container.textContent).toContain('OFERTAS');
  });

  it('a faixa do topo não some nem muda quando a tabela não tem aquelas marcas', () => {
    const { container } = renderVitrine(promoCom([{ brand: 'Xing Ling LT' }]));
    const topo = container.querySelectorAll('[data-faixa-marcas] img');
    expect(topo).toHaveLength(6);
  });

  it('tarja-título das colunas aparece UMA vez (fora das linhas), estilo 10x/PIX', () => {
    const { container } = renderVitrine(
      promoCom([{ brand: 'Michelin SUV HT' }, { brand: 'Bridgestone Dueler HT' }]),
    );
    const titulos = container.querySelectorAll('[data-titulo-colunas]');
    expect(titulos).toHaveLength(1);
    expect(titulos[0].textContent).toContain('Em até 10x no cartão');
    expect(titulos[0].textContent).toContain('Pix/Dinheiro/Débito');
    // As linhas ficam só com os valores (sem etiquetas repetidas).
    const linhas = container.querySelector('[data-linhas-pneu]');
    expect(linhas?.textContent).not.toContain('Em até');
    expect(linhas?.textContent).not.toContain('Pix/Dinheiro');
    expect(linhas?.textContent).not.toContain('À vista');
  });

  it('valores por linha: 10x e PIX/à vista, com o à vista em fonte MAIOR', () => {
    const { container } = renderVitrine(promoCom([{ brand: 'Michelin' }, { brand: 'Bridgestone' }]));
    const linhas = '[data-linhas-pneu]';
    const dez = container.querySelectorAll(`${linhas} [data-preco="10x"]`);
    const vista = container.querySelectorAll(`${linhas} [data-preco="vista"]`);
    expect(dez).toHaveLength(2);
    expect(vista).toHaveLength(2);
    expect(dez[0].querySelector('.text-\\[37px\\]')).toBeTruthy();
    expect(vista[0].querySelector('.text-\\[39px\\]')).toBeTruthy();
  });

  it('cada linha tem a foto do pneu; BFGoodrich usa a banda off-road', () => {
    const { container } = renderVitrine(
      promoCom([{ brand: 'Michelin SUV HT' }, { brand: 'BF Goodrich All-Terrain' }]),
    );
    const pneus = container.querySelectorAll('[data-linhas-pneu] img[data-pneu]');
    expect(pneus).toHaveLength(2);
    expect([...pneus].map((el) => el.getAttribute('data-pneu'))).toEqual([
      'regular',
      'bfgoodrich',
    ]);
  });

  it('com Dunlop na lista, o logo Dunlop aparece; sem Dunlop, não aparece', () => {
    const linhas = '[data-linhas-pneu]';
    const comDunlop = renderVitrine(promoCom([{ brand: 'Dunlop' }, { brand: 'Michelin' }]));
    expect(comDunlop.container.querySelectorAll(`${linhas} img[alt="DUNLOP"]`)).toHaveLength(1);
    expect(comDunlop.container.querySelectorAll(`${linhas} img[alt="MICHELIN"]`)).toHaveLength(1);
    cleanup();
    const semDunlop = renderVitrine(promoCom([{ brand: 'Michelin' }]));
    expect(semDunlop.container.querySelector(`${linhas} img[alt="DUNLOP"]`)).toBeNull();
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
