// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../src/App';

afterEach(() => cleanup());

describe('App — smoke test (render + processar)', () => {
  it('renderiza a tela com os textos principais', () => {
    render(<App />);
    expect(screen.getByText(/Toyota Weiand/i)).toBeTruthy();
    expect(screen.getByText('1. Descrição do Reparo')).toBeTruthy();
    expect(screen.getByText('2. DADOS DO ORÇAMENTO')).toBeTruthy();
    expect(screen.getByText('APROVADO E DESCONTO')).toBeTruthy();
    expect(screen.getByText(/Processar Tudo/i)).toBeTruthy();
    expect(screen.getByText(/Histórico/i)).toBeTruthy();
  });

  it('ao processar, mostra o resumo com os valores calculados', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Processar Tudo/i));

    // Resumo líquido (nos cartões) e a tabela de saída
    expect(screen.getByText('RESUMO LÍQUIDO')).toBeTruthy();
    expect(screen.getByText('Orçamento Adicional')).toBeTruthy();
    expect(screen.getAllByText(/4\.254,77/).length).toBeGreaterThan(0); // valor líquido
    expect(screen.getAllByText(/2\.821,94/).length).toBeGreaterThan(0); // total peças
    expect(screen.getAllByText(/1\.573,93/).length).toBeGreaterThan(0); // total serviços
    // Itens com descrição tratada
    expect(screen.getByText('PASTILHAS DE FREIO DIANT + RETIFICA DOS DISCOS')).toBeTruthy();
    expect(screen.getByText('HIGIENIZAÇÃO DO AR CONDICIONADO')).toBeTruthy();
    expect(screen.getByText('BORRACHA DAS PALHETAS')).toBeTruthy();

    // Salvou no histórico local automaticamente
    const salvo = JSON.parse(localStorage.getItem('orcamentos_historico_v1') ?? '[]');
    expect(salvo.length).toBe(1);
    expect(salvo[0].descReparo).toContain('PASTILHAS');
    expect(salvo[0].numItens).toBe(3);
  });
});
