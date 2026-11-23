// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  COLAPSADOS_KEY,
  lerColapsados,
  salvarColapsados,
} from '../src/utils/colapsados';
import { CHAVES_BACKUP } from '../src/utils/backup';

beforeEach(() => {
  localStorage.clear();
});

describe('colapsados das 4 áreas do orçamento', () => {
  it('começa tudo aberto', () => {
    expect(lerColapsados()).toEqual({
      descricao: false,
      dados: false,
      ajuste: false,
      resumo: false,
    });
  });

  it('salva e restaura (lembra ao recarregar)', () => {
    salvarColapsados({ descricao: true, dados: false, ajuste: true, resumo: false });
    expect(JSON.parse(localStorage.getItem(COLAPSADOS_KEY)!)).toEqual({
      descricao: true,
      dados: false,
      ajuste: true,
      resumo: false,
    });
    expect(lerColapsados()).toEqual({
      descricao: true,
      dados: false,
      ajuste: true,
      resumo: false,
    });
  });

  it('corrompido volta ao padrão (tudo aberto)', () => {
    localStorage.setItem(COLAPSADOS_KEY, 'não-é-json');
    expect(lerColapsados().descricao).toBe(false);
    localStorage.setItem(COLAPSADOS_KEY, JSON.stringify({ descricao: true }));
    expect(lerColapsados()).toEqual({
      descricao: false,
      dados: false,
      ajuste: false,
      resumo: false,
    });
  });

  it('entra no backup geral', () => {
    expect(CHAVES_BACKUP).toContain(COLAPSADOS_KEY);
  });
});
