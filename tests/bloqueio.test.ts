// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  SENHA_KEY,
  conferirSenha,
  criarSenha,
  lerSenha,
  temSenha,
  trocarSenha,
} from '../src/utils/bloqueio';
import { CHAVES_BACKUP } from '../src/utils/backup';

describe('bloqueio com senha (cadeado)', () => {
  beforeEach(() => {
    localStorage.removeItem(SENHA_KEY);
  });

  it('começa sem senha', () => {
    expect(temSenha()).toBe(false);
    expect(lerSenha()).toBeNull();
    expect(conferirSenha('qualquer')).toBe(false);
  });

  it('cria a senha (com confirmação e mínimo de 4)', () => {
    expect(criarSenha('abc', 'abc').ok).toBe(false); // curta
    expect(criarSenha('1234', '4321').ok).toBe(false); // não confere
    const r = criarSenha('1234', '1234');
    expect(r.ok).toBe(true);
    expect(temSenha()).toBe(true);
    expect(conferirSenha('1234')).toBe(true);
    expect(conferirSenha('errada')).toBe(false);
  });

  it('troca a senha pedindo a atual', () => {
    criarSenha('1234', '1234');
    expect(trocarSenha('errada', '5678', '5678').ok).toBe(false);
    expect(trocarSenha('1234', '5678', '8765').ok).toBe(false); // confirmação
    const r = trocarSenha('1234', '5678', '5678');
    expect(r.ok).toBe(true);
    expect(conferirSenha('5678')).toBe(true);
    expect(conferirSenha('1234')).toBe(false);
  });

  it('a senha entra no backup geral', () => {
    expect(CHAVES_BACKUP).toContain(SENHA_KEY);
  });
});
