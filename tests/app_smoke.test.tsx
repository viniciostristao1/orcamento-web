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
    // todos marcados: NÃO existe a caixa de não realizados
    expect(screen.queryByText(/Itens Não Realizados/i)).toBeNull();

    const checks = screen.getAllByRole('checkbox');
    expect(checks.length).toBe(3); // um por item
    fireEvent.click(checks[0]); // desmarca o item 1 (peças 1.438,24)

    expect(screen.getAllByText(/1\.383,70/).length).toBeGreaterThan(0); // 2.821,94 − 1.438,24
    // apareceu a caixa com a soma do item desmarcado (2.203,04)
    expect(screen.getByText(/Itens Não Realizados/i)).toBeTruthy();
    expect(screen.getAllByText(/2\.203,04/).length).toBeGreaterThan(0);

    // remarca: a caixa some de novo
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.queryByText(/Itens Não Realizados/i)).toBeNull();
  });

  it('configurações: troca o tema (Original/Claude) e salva a escolha', () => {
    localStorage.removeItem('orcamentos_tema_v1');
    render(<App />);
    expect(document.documentElement.dataset.tema).toBe('original');

    fireEvent.click(screen.getByText('Configurações'));
    fireEvent.click(screen.getByText('Claude'));
    expect(document.documentElement.dataset.tema).toBe('claude');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('claude');

    fireEvent.click(screen.getByText('Configurações'));
    fireEvent.click(screen.getByText('Original'));
    expect(document.documentElement.dataset.tema).toBe('original');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('original');
  });

  it('documentos de saída são marcados para não seguir o tema', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Processar Tudo/i));
    expect(document.querySelector('#printable-quote')).toBeTruthy();
    expect(document.querySelector('[data-saida="flyer"]')).toBeTruthy();
  });

  it('aba Tire Flyer: renderiza o flyer com os dados padrão', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));

    expect(screen.getByText('TIRE FLYER')).toBeTruthy();
    expect(screen.getByText('265/60R18')).toBeTruthy();
    expect(screen.getByText('Firestone')).toBeTruthy();
    expect(screen.getByText('Michelin LTX Trail')).toBeTruthy();
    expect(screen.getByText('ESTOQUE: 12 UN')).toBeTruthy();
    expect(screen.getAllByText('SOB ENCOMENDA').length).toBe(3); // Firestone, BF Goodrich e Dunlop
  });

  it('aba Tire Flyer: processar atualiza o flyer', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));
    fireEvent.change(screen.getByPlaceholderText('Cole aqui a tabela de pneus...'), {
      target: {
        value: `${['205/55R16', 'MARCA', 'À PRAZO', 'À VISTA', 'ESTOQUE'].join('\t')}\n${['1', 'Pirelli', 'R$ 500,00', 'R$ 450,00', '3'].join('\t')}`,
      },
    });
    fireEvent.click(screen.getByText(/Processar e Atualizar Flyer/i));

    expect(screen.getByText('205/55R16')).toBeTruthy();
    expect(screen.getByText('Pirelli')).toBeTruthy();
    expect(screen.getByText('ESTOQUE: 3 UN')).toBeTruthy();
  });

  it('aba Whats: renderiza os painéis principais', () => {
    localStorage.removeItem('zap_contacts');
    localStorage.removeItem('zap_tasks');
    render(<App />);
    fireEvent.click(screen.getByText('Whats'));

    expect(screen.getByText('PAINEL')).toBeTruthy();
    expect(screen.getByText('Agenda de Tarefas')).toBeTruthy();
    expect(screen.getByText('Novo Contato')).toBeTruthy();
    expect(screen.getByText('Script de Prospecção')).toBeTruthy();
    expect(screen.getByText('Centro de Dados')).toBeTruthy();
    expect(screen.getByText('Relatório de Envios')).toBeTruthy();
  });

  it('aba Whats: cadastra contato e tarefa (e salva no localStorage)', () => {
    localStorage.removeItem('zap_contacts');
    localStorage.removeItem('zap_tasks');
    render(<App />);
    fireEvent.click(screen.getByText('Whats'));

    fireEvent.change(screen.getByPlaceholderText('Ex: WEIAND VEICULOS LTDA'), { target: { value: 'JOAO DA SILVA' } });
    fireEvent.change(screen.getByPlaceholderText('555199999999'), { target: { value: '51999999999' } });
    fireEvent.click(screen.getByText('Salvar Cliente'));

    expect(screen.getByText('JOAO DA SILVA')).toBeTruthy();
    const salvos = JSON.parse(localStorage.getItem('zap_contacts') ?? '[]');
    expect(salvos.length).toBe(1);
    expect(salvos[0].name).toBe('JOAO DA SILVA');

    fireEvent.change(screen.getByPlaceholderText('ABC-1234'), { target: { value: 'ABC-1234' } });
    fireEvent.click(screen.getByText('+15m'));
    fireEvent.click(screen.getByText('Gerar Tarefa'));

    expect(screen.getByText('ABC-1234')).toBeTruthy();
    const tarefas = JSON.parse(localStorage.getItem('zap_tasks') ?? '[]');
    expect(tarefas.length).toBe(1);
    expect(tarefas[0].plate).toBe('ABC-1234');
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
