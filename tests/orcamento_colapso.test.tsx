// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { RASCUNHO_KEY } from '../src/utils/rascunho';
import { ULTIMO_KEY } from '../src/utils/ultimoOrcamento';
import { COLAPSADOS_KEY } from '../src/utils/colapsados';

Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});

afterEach(() => {
  cleanup();
  localStorage.removeItem(RASCUNHO_KEY);
  localStorage.removeItem(ULTIMO_KEY);
  localStorage.removeItem(COLAPSADOS_KEY);
  localStorage.removeItem('orcamentos_historico_v1');
});

describe('Recolher DESCRIÇÃO, DADOS, AJUSTE e RESUMO', () => {
  it('cada área recolhe e volta sem perder o digitado', () => {
    render(<App />);
    // DESCRIÇÃO (revisão): digita, recolhe, some, volta com o texto
    const desc = screen.getByLabelText('Descrição extraída para revisão') as HTMLTextAreaElement;
    fireEvent.change(desc, { target: { value: '01 TESTE COLAPSO' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar DESCRIÇÃO' }));
    expect(screen.queryByLabelText('Descrição extraída para revisão')).toBeNull();
    expect(screen.getByRole('button', { name: 'Mostrar DESCRIÇÃO' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar DESCRIÇÃO' }));
    expect((screen.getByLabelText('Descrição extraída para revisão') as HTMLTextAreaElement).value).toBe(
      '01 TESTE COLAPSO',
    );

    // DADOS (revisão): mesmo ciclo
    const dados = screen.getByLabelText('Dados extraídos para revisão') as HTMLTextAreaElement;
    fireEvent.change(dados, { target: { value: '1 Peça X 1 10,00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar DADOS' }));
    expect(screen.queryByLabelText('Dados extraídos para revisão')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar DADOS' }));
    expect((screen.getByLabelText('Dados extraídos para revisão') as HTMLTextAreaElement).value).toBe(
      '1 Peça X 1 10,00',
    );

    // AJUSTE: digita, recolhe, volta com o valor
    const ajuste = screen.getByLabelText('Ajuste manual') as HTMLTextAreaElement;
    fireEvent.change(ajuste, { target: { value: '1 50,00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar AJUSTE (ID VALOR)' }));
    expect(screen.queryByLabelText('Ajuste manual')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar AJUSTE (ID VALOR)' }));
    expect((screen.getByLabelText('Ajuste manual') as HTMLTextAreaElement).value).toBe('1 50,00');
  });

  it('resumo recolhido mantém o cálculo certo ao reabrir', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
    expect(screen.getByText('RESUMO LÍQUIDO')).toBeTruthy();
    const liquidoAntes = screen.getAllByText('4.254,77')[0].textContent;
    // recolhe o resumo e o ajuste, processa de novo: o cálculo segue valendo
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar RESUMO LÍQUIDO' }));
    expect(screen.queryByText('Valor Líquido')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar RESUMO LÍQUIDO' }));
    expect(screen.getAllByText('4.254,77')[0].textContent).toBe(liquidoAntes);
  });

  it('seta de DESCRIÇÃO/DADOS tem a mesma cor do rótulo e fica à direita', () => {
    const { container } = render(<App />);
    for (const nome of ['DESCRIÇÃO', 'DADOS'] as const) {
      const btn = screen.getByRole('button', { name: new RegExp(`^(Ocultar|Mostrar) ${nome}$`) });
      // mesma cor do rótulo (text-slate-500) nos estados normal e foco
      expect(btn.className).toContain('text-slate-500');
      expect(btn.className).toContain('focus:text-slate-500');
      const rotulo = btn.parentElement?.querySelector('label');
      expect(rotulo?.textContent).toBe(nome);
      expect(rotulo?.className).toContain('text-slate-500');
      // botão à direita do rótulo (último da linha)
      expect(btn.parentElement?.lastElementChild).toBe(btn);
    }
    // AJUSTE e RESUMO: botão de cabeçalho por último, depois do limpar
    const cardAjuste = screen.getByText('AJUSTE (ID VALOR)').closest('[data-neon-box]')!;
    const botoes = Array.from(cardAjuste.querySelectorAll('button'));
    expect(botoes[botoes.length - 1].getAttribute('aria-label')).toMatch(/AJUSTE/);
    void container;
  });

  it('estado persiste ao recarregar (só individuais, sem botão global)', () => {
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar DESCRIÇÃO' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar AJUSTE (ID VALOR)' }));
    expect(JSON.parse(localStorage.getItem(COLAPSADOS_KEY)!)).toMatchObject({
      descricao: true,
      ajuste: true,
    });
    unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: 'Mostrar DESCRIÇÃO' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mostrar AJUSTE (ID VALOR)' })).toBeTruthy();
    expect(screen.queryByLabelText('Descrição extraída para revisão')).toBeNull();
    // sem controle global
    expect(screen.queryByRole('button', { name: /Recolher tudo|Expandir tudo/i })).toBeNull();
  });
});
