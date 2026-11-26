// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { RASCUNHO_KEY } from '../src/utils/rascunho';
import { ULTIMO_KEY } from '../src/utils/ultimoOrcamento';

const HIST_KEY = 'orcamentos_historico_v1';

// O jsdom não implementa scrollIntoView, mas o app chama num setTimeout.
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});

afterEach(() => {
  cleanup();
  localStorage.removeItem(RASCUNHO_KEY);
  localStorage.removeItem(ULTIMO_KEY);
  localStorage.removeItem(HIST_KEY);
  vi.unstubAllGlobals();
});

const processarExemplo = () => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Itens do adicional'), {
    target: { value: 'Filtro\tR$ 10,00\nPastilha\tR$ 20,00' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
};

describe('segundo × (apagar de vez)', () => {
  it('primeiro × risca (reversível); segundo × apaga; Desfazer volta ao "–"', () => {
    processarExemplo();
    // Primeiro ×: linha sai do PNG (vira "–", restaurável com um toque).
    fireEvent.click(screen.getByRole('button', { name: 'Excluir linha 1' }));
    expect(screen.getByTitle('Toque para restaurar a linha na posição original')).toBeTruthy();
    // Segundo × só aparece na linha já excluída.
    const apagar = screen.getByRole('button', { name: 'Apagar linha definitivamente' });
    expect(apagar.getAttribute('data-ui')).toBe('1');
    fireEvent.click(apagar);
    // Linha sumiu da tabela + toast com Desfazer.
    expect(screen.queryByTitle('Toque para restaurar a linha na posição original')).toBeNull();
    expect(screen.getByRole('button', { name: 'Desfazer' })).toBeTruthy();
    // Desfazer reinsere na posição original como excluída (volta ao "–").
    fireEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(screen.getByTitle('Toque para restaurar a linha na posição original')).toBeTruthy();
    // E a posição foi preservada: o item 2 continua numerado como 1.
    expect(screen.getByRole('button', { name: 'Excluir linha 1' })).toBeTruthy();
  });

  it('os dois × ficam fora do PNG (data-ui + print:hidden)', () => {
    processarExemplo();
    const x1 = screen.getByRole('button', { name: 'Excluir linha 2' });
    expect(x1.getAttribute('data-ui')).toBe('1');
    expect(x1.className).toContain('print:hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Excluir linha 1' }));
    const x2 = screen.getByRole('button', { name: 'Apagar linha definitivamente' });
    expect(x2.getAttribute('data-ui')).toBe('1');
    expect(x2.className).toContain('print:hidden');
  });
});

describe('botão "+" (orçamento manual)', () => {
  it('com documento em tela: abre limpo direto e avisa que o anterior foi salvo', () => {
    processarExemplo();
    fireEvent.click(screen.getByRole('button', { name: 'Novo orçamento manual' }));
    expect(screen.getByText('Orçamento anterior salvo no histórico')).toBeTruthy();
    // Documento limpo: só o item 1, vazio, com o aviso de linha vazia.
    expect(screen.getByText('linhas vazias não saem no PNG')).toBeTruthy();
    const vazio = document.querySelector('#printable-quote tbody tr[data-ui="1"]');
    expect(vazio).not.toBeNull();
    // Linha vazia fora do PNG; com conteúdo, volta ao PNG.
    fireEvent.click(screen.getByText('…'));
    fireEvent.change(screen.getByLabelText('Descrição do item 1'), { target: { value: 'PASTILHA' } });
    expect(document.querySelector('#printable-quote tbody tr[data-ui="1"]')).toBeNull();
  });

  it('sem documento em tela: abre limpo sem aviso', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Novo orçamento manual' }));
    expect(screen.queryByText('Orçamento anterior salvo no histórico')).toBeNull();
    expect(screen.getByText('linhas vazias não saem no PNG')).toBeTruthy();
  });

  it('manual entra no histórico com a marca Manual', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Novo orçamento manual' }));
    const lista = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    expect(lista).toHaveLength(1);
    expect(lista[0].manual).toBe(true);
  });

  it('documento totalmente vazio: baixar imagem avisa em vez de gerar PNG em branco', () => {
    const alertas: string[] = [];
    vi.stubGlobal('alert', (m: string) => { alertas.push(m); });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Novo orçamento manual' }));
    fireEvent.click(screen.getByRole('button', { name: 'Baixar imagem (alta qualidade)' }));
    expect(alertas).toHaveLength(1);
    expect(alertas[0]).toMatch(/vazio/);
  });
});

describe('telefone à direita + botão WhatsApp', () => {
  it('número válido habilita o botão; inválido mostra erro e mantém desabilitado', () => {
    processarExemplo();
    const campo = screen.getByLabelText('Telefone do cliente (WhatsApp)') as HTMLInputElement;
    const zap = screen.getByRole('button', { name: 'Conversar no WhatsApp' }) as HTMLButtonElement;
    expect(zap.disabled).toBe(true);
    // Espelha o mesmo estado do card do sistema (o campo de lá mostra o
    // mesmo valor digitado aqui).
    fireEvent.change(campo, { target: { value: '(51) 99999-9999' } });
    expect(campo.value).toBe('(51) 99999-9999');
    expect((screen.getByPlaceholderText('Ex.: 51 99999-9999') as HTMLInputElement).value).toBe('(51) 99999-9999');
    expect((screen.getByRole('button', { name: 'Conversar no WhatsApp' }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.change(campo, { target: { value: '9999' } });
    expect((screen.getByRole('button', { name: 'Conversar no WhatsApp' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Telefone incompleto/)).toBeTruthy();
  });

  it('telefone não aparece no nó imprimível do PNG', () => {
    processarExemplo();
    const campo = screen.getByLabelText('Telefone do cliente (WhatsApp)') as HTMLInputElement;
    fireEvent.change(campo, { target: { value: '51999999999' } });
    const imprimivel = document.querySelector('#printable-quote')?.textContent ?? '';
    expect(imprimivel).not.toContain('51999999999');
    expect(imprimivel).not.toContain('99999');
  });
});
