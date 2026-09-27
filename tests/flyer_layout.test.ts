// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { LAYOUT_FLYER_KEY, lerLayoutFlyer, salvarLayoutFlyer } from '../src/tire/utils/layoutFlyer';

describe('layout de saída do Tire Flyer (localStorage)', () => {
  beforeEach(() => localStorage.clear());

  it('sem nada salvo cai no clássico (atual)', () => {
    expect(lerLayoutFlyer()).toBe('atual');
  });

  it('salva e lê a escolha', () => {
    salvarLayoutFlyer('tabela');
    expect(lerLayoutFlyer()).toBe('tabela');
    expect(localStorage.getItem(LAYOUT_FLYER_KEY)).toBe('tabela');

    salvarLayoutFlyer('etiqueta');
    expect(lerLayoutFlyer()).toBe('etiqueta');
  });

  it('valor inválido cai no clássico', () => {
    localStorage.setItem(LAYOUT_FLYER_KEY, 'quadrado');
    expect(lerLayoutFlyer()).toBe('atual');
  });
});
