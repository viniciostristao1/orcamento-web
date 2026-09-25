// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import HistoryModal from '../src/components/HistoryModal';
import type { OrcamentoSalvo } from '../src/utils/historico';
import { RASCUNHO_KEY } from '../src/utils/rascunho';
import { ULTIMO_KEY } from '../src/utils/ultimoOrcamento';

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

afterEach(() => {
  cleanup();
  localStorage.removeItem(RASCUNHO_KEY);
  localStorage.removeItem(ULTIMO_KEY);
});

describe('App — smoke test (render + processar)', () => {
  it('renderiza a tela com os textos principais', () => {
    render(<App />);
    expect(screen.getByText(/Toyota Weiand/i)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'ORÇAMENTOS' })).toBeTruthy();
    expect(screen.getByText('1. DESCRIÇÃO DO REPARO')).toBeTruthy();
    expect(screen.getByText('2. DADOS DO ORÇAMENTO')).toBeTruthy();
    expect(screen.getByText('APROVADO E DESCONTO')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Processar Tudo/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Histórico' })).toBeTruthy();
  });

  it('ao processar, mostra o resumo com os valores calculados', () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText(/ABC1D23 \/ JOÃO/i), { target: { value: 'ABC1D23' } });
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));

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
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
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

  it('mantém o último documento gerado ao reabrir (sem processar de novo)', () => {
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
    expect(document.querySelector('#printable-quote')).toBeTruthy();
    const checks = screen.getAllByRole('checkbox');
    fireEvent.click(checks[0]); // desmarca um item (marcação também é salva)
    unmount();

    render(<App />);
    // o documento aparece na tela sem clicar em Processar Tudo
    expect(document.querySelector('#printable-quote')).toBeTruthy();
    expect(screen.getByText('RESUMO LÍQUIDO')).toBeTruthy();
    expect(screen.getByText(/Itens Não Realizados/i)).toBeTruthy();
    expect(document.querySelectorAll('#printable-quote input[type="checkbox"]')[0]).toHaveProperty('checked', false);
  });

  it('lembra o último orçamento digitado (rascunho no localStorage)', () => {
    const { unmount, container } = render(<App />);
    const primeiroTextarea = container.querySelector('textarea') as HTMLTextAreaElement;
    fireEvent.change(primeiroTextarea, { target: { value: '01 TESTE PERSISTIDO' } });
    unmount();

    const { container: novo } = render(<App />);
    const textareaDepois = novo.querySelector('textarea') as HTMLTextAreaElement;
    expect(textareaDepois.value).toBe('01 TESTE PERSISTIDO');
  });

  it('configurações: troca o tema (Original/Claude) e salva a escolha', () => {
    localStorage.removeItem('orcamentos_tema_v1');
    render(<App />);
    expect(document.documentElement.dataset.tema).toBe('original');

    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }));
    // backup fica no mesmo menu, depois do tema
    expect(screen.getByRole('button', { name: /Exportar backup/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Importar backup/i })).toBeTruthy();
    fireEvent.click(screen.getByText('Claude'));
    expect(document.documentElement.dataset.tema).toBe('claude');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('claude');

    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }));
    fireEvent.click(screen.getByText('Original'));
    expect(document.documentElement.dataset.tema).toBe('original');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('original');
  });

  it('documentos de saída são marcados para não seguir o tema', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
    expect(document.querySelector('#printable-quote')).toBeTruthy();
    expect(document.querySelector('[data-saida="flyer"]')).toBeTruthy();
  });

  it('aba Tire Flyer: renderiza o flyer com os dados padrão', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));

    expect(screen.getByRole('heading', { name: 'TIRE FLYER' })).toBeTruthy();
    expect(screen.getByText('265/60R18')).toBeTruthy();
    expect(screen.getByText('Firestone')).toBeTruthy();
    expect(screen.getByText('Michelin LTX Trail')).toBeTruthy();
    expect(screen.getByText('ESTOQUE: 12 UN')).toBeTruthy();
    expect(screen.getAllByText('SOB ENCOMENDA').length).toBe(3); // Firestone, BF Goodrich e Dunlop
  });

  it('aba Tire Flyer: contato vai para o histórico (com data/hora) e a busca acha', () => {
    localStorage.removeItem('flyer_historico_v1');
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));

    fireEvent.change(screen.getByPlaceholderText(/Nome, placa, telefone/i), { target: { value: 'JOAO ABC1D23' } });
    fireEvent.click(screen.getByRole('button', { name: /Processar e Atualizar Flyer/i }));

    const salvos = JSON.parse(localStorage.getItem('flyer_historico_v1') ?? '[]');
    expect(salvos).toHaveLength(1);
    expect(salvos[0].contato).toBe('JOAO ABC1D23');
    expect(salvos[0].medida).toBe('265/60R18');
    expect(salvos[0].criadoEm).toMatch(/\d{2}\/\d{2}\/\d{4}/);

    // abre o histórico e pesquisa pelo contato
    fireEvent.click(screen.getByRole('button', { name: 'Histórico do Tire Flyer' }));
    expect(screen.getByText('JOAO ABC1D23')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Pesquisar/i }));
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por contato, data ou medida/i), {
      target: { value: 'abc-1d23' },
    });
    expect(screen.getByText(/1 de 1/)).toBeTruthy();
  });

  it('aba Tire Flyer: processar atualiza o flyer', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));
    fireEvent.change(screen.getByPlaceholderText('Cole aqui a tabela de pneus...'), {
      target: {
        value: `${['205/55R16', 'MARCA', 'À PRAZO', 'À VISTA', 'ESTOQUE'].join('\t')}\n${['1', 'Pirelli', 'R$ 500,00', 'R$ 450,00', '3'].join('\t')}`,
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Processar e Atualizar Flyer/i }));

    expect(screen.getByText('205/55R16')).toBeTruthy();
    expect(screen.getByText('Pirelli')).toBeTruthy();
    expect(screen.getByText('ESTOQUE: 3 UN')).toBeTruthy();
  });

  it('aba Whats: renderiza os painéis principais', () => {
    localStorage.removeItem('zap_contacts');
    render(<App />);
    fireEvent.click(screen.getByText('Whats'));

    expect(screen.getByText('PAINEL')).toBeTruthy();
    expect(screen.getByText('Novo Contato')).toBeTruthy();
    expect(screen.getByText('Script Pneus')).toBeTruthy();
    expect(screen.getByText('Script Revisão')).toBeTruthy();
    expect(screen.getByText('Relatório de Envios')).toBeTruthy();
    // Agenda de Tarefas e Centro de Dados saíram da aba (backup foi p/ Configurações)
    expect(screen.queryByText('Agenda de Tarefas')).toBeNull();
    expect(screen.queryByText('Centro de Dados')).toBeNull();
  });

  it('aba Whats: cadastra contato (e salva no localStorage)', () => {
    localStorage.removeItem('zap_contacts');
    render(<App />);
    fireEvent.click(screen.getByText('Whats'));

    fireEvent.change(screen.getByPlaceholderText('Ex: WEIAND VEICULOS LTDA'), { target: { value: 'JOAO DA SILVA' } });
    fireEvent.change(screen.getByPlaceholderText('555199999999'), { target: { value: '51999999999' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Cliente/i }));

    expect(screen.getByText('JOAO DA SILVA')).toBeTruthy();
    const salvos = JSON.parse(localStorage.getItem('zap_contacts') ?? '[]');
    expect(salvos.length).toBe(1);
    expect(salvos[0].name).toBe('JOAO DA SILVA');
  });

  it('salva com itens não realizados (vai para a aba do histórico)', () => {
    localStorage.removeItem('orcamentos_historico_v1');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
    fireEvent.click(screen.getAllByRole('checkbox')[0]); // desmarca o item 1
    fireEvent.click(screen.getByRole('button', { name: /Salvar com itens não realizados/i }));

    const salvo = JSON.parse(localStorage.getItem('orcamentos_historico_v1') ?? '[]');
    expect(salvo).toHaveLength(1);
    expect(salvo[0].naoRealizados).toEqual([1]);
  });

  it('histórico: ao abrir, o documento usa a data/hora do registro (não a atual)', () => {
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([registro('9', 'ABC1D23', '01/08/2026 09:00:00')]),
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir orçamento' }));

    expect(screen.getByText('01/08/2026 09:00:00')).toBeTruthy();
    const salvo = JSON.parse(localStorage.getItem('orcamentos_historico_v1') ?? '[]');
    expect(salvo[0].criadoEm).toBe('01/08/2026 09:00:00'); // não re-salvou com a data de agora
  });

  it('histórico: abas Todos | Não Realizados', () => {
    const comDesmarcados = { ...registro('1', 'ABC1D23', '24/09/2026 12:30:00'), naoRealizados: [1, 2] };
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([comDesmarcados, registro('2', 'XYZ9A87', '01/08/2026 09:00:00')]),
    );
    render(<HistoryModal aberto onFechar={() => {}} onAbrir={() => {}} />);

    expect(screen.getByText('ABC1D23')).toBeTruthy();
    expect(screen.getByText('XYZ9A87')).toBeTruthy();
    expect(screen.getByText(/2 não realizado\(s\)/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Não Realizados \(1\)/i }));
    expect(screen.getByText('ABC1D23')).toBeTruthy();
    expect(screen.queryByText('XYZ9A87')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Todos \(2\)/i }));
    expect(screen.getByText('XYZ9A87')).toBeTruthy();

    // janelinha "Ver itens" do registro salvo: item 1 está em naoRealizados
    fireEvent.click(screen.getAllByRole('button', { name: /Ver itens do orçamento/i })[0]);
    expect(screen.getByText('ITENS DO ORÇAMENTO')).toBeTruthy();
    expect(screen.getAllByText('01 TESTE').length).toBeGreaterThan(1);
    expect(screen.getByText(/Aprovado pelo cliente/i)).toBeTruthy();
    expect(document.querySelectorAll('[data-situacao="naoAprovado"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-situacao="aprovado"]')).toHaveLength(0);
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar' }).at(-1)!);
    expect(screen.queryByText('ITENS DO ORÇAMENTO')).toBeNull();

    // registro comum (sem seleção salva): lista simples, sem aprovado/não aprovado
    fireEvent.click(screen.getAllByRole('button', { name: /Ver itens do orçamento/i })[1]);
    expect(screen.getByText('ITENS DO ORÇAMENTO')).toBeTruthy();
    expect(screen.queryByText(/Aprovado pelo cliente/i)).toBeNull();
    expect(document.querySelectorAll('[data-situacao="neutro"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-situacao="aprovado"], [data-situacao="naoAprovado"]')).toHaveLength(0);
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar' }).at(-1)!);

    // contagens das abas acompanham a pesquisa
    fireEvent.click(screen.getByRole('button', { name: /Pesquisar/i }));
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data ou placa/i), { target: { value: 'xyz' } });
    expect(screen.getByRole('button', { name: /Todos \(1\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Não Realizados \(0\)/i })).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data ou placa/i), { target: { value: 'abc' } });
    expect(screen.getByRole('button', { name: /Todos \(1\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Não Realizados \(1\)/i })).toBeTruthy();
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

    fireEvent.click(screen.getByRole('button', { name: /Pesquisar/i }));
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
