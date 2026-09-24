// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import HistoryModal from '../src/components/HistoryModal';
import type { OrcamentoSalvo } from '../src/utils/historico';

const registro = (id: string, placa: string, criadoEm: string): OrcamentoSalvo => ({
  id,
  criadoEm,
  descReparo: '01 TESTE',
  orcamentoRaw: '',
  ajustesManuais: '',
  revAprovadaInput: '100,00',
  revPecasInput: '50,00',
  desconto: 5,
  parcelas: 3,
  placa,
  numItens: 1,
  totalPecasGeral: 50,
  totalServicosGeral: 50,
  valorDescontoTotal: 5,
  valorLiquidoFinal: 95,
  totalGeral: 100,
});

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
    fireEvent.change(screen.getByPlaceholderText('Ex.: ABC1D23'), { target: { value: 'ABC1D23' } });
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
    expect(salvo[0].placa).toBe('ABC1D23');
  });

  it('caixinhas: desmarcar um item recalcula os totais', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Processar Tudo/i));
    expect(screen.getAllByText(/2\.821,94/).length).toBeGreaterThan(0); // total peças cheio

    const checks = screen.getAllByRole('checkbox');
    expect(checks.length).toBe(3); // um por item
    fireEvent.click(checks[0]); // desmarca o item 1 (peças 1.438,24)

    expect(screen.getAllByText(/1\.383,70/).length).toBeGreaterThan(0); // 2.821,94 − 1.438,24
  });

  it('histórico: Pesquisar filtra por placa (e some com quem não bate)', () => {
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([
        registro('1', 'ABC1D23', '24/09/2026 12:30:00'),
        registro('2', 'XYZ9A87', '01/08/2026 09:00:00'),
      ]),
    );
    render(<HistoryModal aberto onFechar={() => {}} onAbrir={() => {}} />);

    expect(screen.getByText('ABC1D23')).toBeTruthy();
    expect(screen.getByText('XYZ9A87')).toBeTruthy();

    fireEvent.click(screen.getByText(/Pesquisar/i));
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data ou placa/i), {
      target: { value: 'abc-1d23' },
    });
    expect(screen.getByText('ABC1D23')).toBeTruthy();
    expect(screen.queryByText('XYZ9A87')).toBeNull();

    // Busca por data também
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data ou placa/i), {
      target: { value: '01/08' },
    });
    expect(screen.getByText('XYZ9A87')).toBeTruthy();
    expect(screen.queryByText('ABC1D23')).toBeNull();
  });
});
