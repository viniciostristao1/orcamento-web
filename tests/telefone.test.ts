// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  abrirWhats,
  normalizarTelefoneParaWhats,
  somenteDigitos,
  temTelefoneValido,
  urlWhats,
} from '../src/utils/telefone';

describe('telefone (WhatsApp do histórico)', () => {
  it('tira máscara (espaços, traços, parênteses, +)', () => {
    expect(somenteDigitos('51 99999-9999')).toBe('51999999999');
    expect(somenteDigitos('(51) 99999-9999')).toBe('51999999999');
    expect(somenteDigitos('+55 51 99999-9999')).toBe('5551999999999');
    expect(somenteDigitos(undefined)).toBe('');
  });

  it('normaliza DDD+numero com 55 (mesma regra da aba Whats)', () => {
    expect(normalizarTelefoneParaWhats('51 99999-9999')).toBe('5551999999999');
    expect(normalizarTelefoneParaWhats('5133334444')).toBe('555133334444');
    expect(normalizarTelefoneParaWhats('5551999999999')).toBe('5551999999999');
    expect(normalizarTelefoneParaWhats('')).toBe('');
  });

  it('só libera o botão com número completo (55 + DDD + número)', () => {
    expect(temTelefoneValido('51 99999-9999')).toBe(true);
    expect(temTelefoneValido('(51) 3333-4444')).toBe(true);
    expect(temTelefoneValido('')).toBe(false);
    expect(temTelefoneValido(undefined)).toBe(false);
    expect(temTelefoneValido('9999')).toBe(false);
  });

  it('monta wa.me só com telefone válido (sem texto pronto)', () => {
    expect(urlWhats('51 99999-9999')).toBe('https://wa.me/5551999999999');
    expect(urlWhats('')).toBeNull();
    expect(urlWhats(undefined)).toBeNull();
  });

  it('abrirWhats abre nova aba; sem número não abre nada', () => {
    const abertas: string[] = [];
    const original = window.open;
    (window as any).open = (url: string) => {
      abertas.push(url);
      return null;
    };
    try {
      abrirWhats('51 99999-9999');
      expect(abertas).toEqual(['https://wa.me/5551999999999']);
      abrirWhats('');
      expect(abertas).toHaveLength(1);
    } finally {
      window.open = original;
    }
  });
});
