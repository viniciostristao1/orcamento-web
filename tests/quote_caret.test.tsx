// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { RASCUNHO_KEY } from '../src/utils/rascunho';
import { ULTIMO_KEY } from '../src/utils/ultimoOrcamento';

Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});

afterEach(() => {
  cleanup();
  localStorage.removeItem(RASCUNHO_KEY);
  localStorage.removeItem(ULTIMO_KEY);
  localStorage.removeItem('orcamentos_historico_v1');
});

/** Abre a edição da descrição do item 1 e devolve o input já focado no fim. */
const abrirEdicaoDescricao = () => {
  fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
  fireEvent.click(screen.getByText('PASTILHAS DE FREIO DIANT + RETIFICA DOS DISCOS'));
  const input = screen.getByLabelText('Descrição do item 1') as HTMLInputElement;
  expect(document.activeElement).toBe(input);
  expect(input.selectionStart).toBe(input.value.length);
  return input;
};

describe('cursor na edição direta do documento (ORÇAMENTO ADICIONAL)', () => {
  it('digitar a 2ª tecla no meio do texto não joga o caret ao fim', () => {
    const { container } = render(<App />);
    const input = abrirEdicaoDescricao();
    const base = input.value;
    // usuário posiciona no meio ("PASTILHAS|S DE ...") e digita a 1ª tecla
    input.setSelectionRange(9, 9);
    const uma = `${base.slice(0, 9)}S${base.slice(9)}`;
    expect(uma.startsWith('PASTILHASS ')).toBe(true);
    fireEvent.change(input, { target: { value: uma } });
    expect(input.value).toBe(uma);
    // 1ª tecla inserida no meio: o caret segue o usuário (posição 10)
    input.setSelectionRange(10, 10);
    // qualquer re-render do pai (aqui: desmarcar o item 2, como todo commit
    // faz) NÃO pode mover o caret — era o bug (a ref re-disparava e ia ao fim)
    const checks = container.querySelectorAll<HTMLInputElement>('#printable-quote input[type="checkbox"]');
    fireEvent.click(checks[1]);
    expect(input.selectionStart).toBe(10);
    expect(input.value).toBe(uma);
    // 2ª tecla no meio cai no meio, não no fim
    const duas = `${uma.slice(0, 10)}X${uma.slice(10)}`;
    fireEvent.change(input, { target: { value: duas } });
    expect(input.value).toBe(duas);
    expect(input.value.startsWith('PASTILHASSX ')).toBe(true);
  });

  it('fechar e reabrir foca de novo no fim (flag zerada ao terminar)', () => {
    render(<App />);
    let input = abrirEdicaoDescricao();
    fireEvent.blur(input);
    expect(screen.queryByLabelText('Descrição do item 1')).toBeNull();
    fireEvent.click(screen.getByText('PASTILHAS DE FREIO DIANT + RETIFICA DOS DISCOS'));
    input = screen.getByLabelText('Descrição do item 1') as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(input.value.length);
  });

  it('valor do item: re-render do pai também não move o caret', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
    fireEvent.click(screen.getByText('2.203,04'));
    const input = screen.getByLabelText('Valor do item 1') as HTMLInputElement;
    input.setSelectionRange(1, 1);
    const checks = container.querySelectorAll<HTMLInputElement>('#printable-quote input[type="checkbox"]');
    fireEvent.click(checks[1]);
    expect(input.selectionStart).toBe(1);
  });
});
