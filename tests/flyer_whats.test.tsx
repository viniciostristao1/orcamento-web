// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';

// O jsdom não implementa scrollIntoView, mas o app chama num setTimeout.
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

const irParaFlyer = () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Tire Flyer' }));
};

const NOME_BOTAO = 'Conversar no WhatsApp (flyer)';

describe('WhatsApp do Tire Flyer (telefone do CONTATO)', () => {
  it('vazio desabilita; válido abre a conversa em wa.me com DDI 55', () => {
    irParaFlyer();
    const zap = screen.getByRole('button', { name: NOME_BOTAO }) as HTMLButtonElement;
    expect(zap.disabled).toBe(true);
    const abertas: string[] = [];
    const original = window.open;
    (window as any).open = (url: string) => {
      abertas.push(url);
      return null;
    };
    try {
      fireEvent.change(screen.getByPlaceholderText(/Telefone \(DDD \+ número\)/), {
        target: { value: '51 99999-9999' },
      });
      expect((screen.getByRole('button', { name: NOME_BOTAO }) as HTMLButtonElement).disabled).toBe(false);
      fireEvent.click(screen.getByRole('button', { name: NOME_BOTAO }));
      expect(abertas).toEqual(['https://wa.me/5551999999999']);
      // Inválido volta a desabilitar (mesma regra da aba ORÇAMENTOS).
      fireEvent.change(screen.getByPlaceholderText(/Telefone \(DDD \+ número\)/), {
        target: { value: '9999' },
      });
      expect((screen.getByRole('button', { name: NOME_BOTAO }) as HTMLButtonElement).disabled).toBe(true);
      expect(abertas).toHaveLength(1);
    } finally {
      window.open = original;
    }
  });

  it('fica fora do nó de saída do flyer (não sai no PNG)', () => {
    irParaFlyer();
    fireEvent.change(screen.getByPlaceholderText(/Telefone \(DDD \+ número\)/), {
      target: { value: '51 99999-9999' },
    });
    const saida = document.querySelector('[data-saida="flyer"]');
    expect(saida).not.toBeNull();
    expect(saida?.querySelector(`button[aria-label="${NOME_BOTAO}"]`)).toBeNull();
  });
});
