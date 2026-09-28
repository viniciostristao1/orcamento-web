// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
  localStorage.removeItem('flyer_layout_v1');
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
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
    expect(screen.getAllByText(/2\.821,94/).length).toBeGreaterThan(0); // total peças cheio
    // todos marcados: NÃO existe a caixa de não realizados
    expect(screen.queryByText(/Itens Não Realizados/i)).toBeNull();

    const checks = () => container.querySelectorAll<HTMLInputElement>('#printable-quote input[type="checkbox"]');
    expect(checks().length).toBe(3); // um por item
    fireEvent.click(checks()[0]); // desmarca o item 1 (peças 1.438,24)

    expect(screen.getAllByText(/1\.383,70/).length).toBeGreaterThan(0); // 2.821,94 − 1.438,24
    // apareceu a caixa com a soma do item desmarcado (2.203,04)
    expect(screen.getByText(/Itens Não Realizados/i)).toBeTruthy();
    expect(screen.getAllByText(/2\.203,04/).length).toBeGreaterThan(0);

    // remarca: a caixa some de novo
    fireEvent.click(checks()[0]);
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

  it('configurações: troca entre os temas e salva a escolha', () => {
    localStorage.removeItem('orcamentos_tema_v1');
    render(<App />);
    expect(document.documentElement.dataset.tema).toBe('azul');

    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }));
    // backup fica no mesmo menu, depois do tema
    expect(screen.getByRole('button', { name: /Exportar backup/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Importar backup/i })).toBeTruthy();

    fireEvent.click(screen.getByText('Terracota'));
    expect(document.documentElement.dataset.tema).toBe('terracota');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('terracota');

    // um dos temas novos
    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }));
    fireEvent.click(screen.getByText('Verde WhatsApp'));
    expect(document.documentElement.dataset.tema).toBe('whatsapp');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('whatsapp');

    // Grafite (estilo tabela Claude)
    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }));
    fireEvent.click(screen.getByText('Grafite'));
    expect(document.documentElement.dataset.tema).toBe('grafite');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('grafite');

    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }));
    fireEvent.click(screen.getByText('Azul'));
    expect(document.documentElement.dataset.tema).toBe('azul');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('azul');
  });

  it('migra os nomes de tema antigos (original→azul, claude→terracota)', () => {
    localStorage.setItem('orcamentos_tema_v1', 'claude');
    const { unmount } = render(<App />);
    expect(document.documentElement.dataset.tema).toBe('terracota');
    unmount();

    localStorage.setItem('orcamentos_tema_v1', 'original');
    render(<App />);
    expect(document.documentElement.dataset.tema).toBe('azul');
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

  it('aba Tire Flyer: ícone troca o layout de saída (clássico/tabela/etiqueta) e salva', () => {
    localStorage.removeItem('flyer_layout_v1');
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));

    const flyer = () => document.querySelector('[data-saida="flyer"]') as HTMLElement;
    // padrão = clássico (como sempre foi), sem tabela
    expect(flyer().dataset.layout).toBe('atual');
    expect(flyer().querySelector('table')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Layout do flyer' }));
    fireEvent.click(screen.getByText('Tabela de ofertas'));
    expect(flyer().dataset.layout).toBe('tabela');
    expect(flyer().querySelector('table')).toBeTruthy();
    expect(localStorage.getItem('flyer_layout_v1')).toBe('tabela');

    fireEvent.click(screen.getByRole('button', { name: 'Layout do flyer' }));
    fireEvent.click(screen.getByText('Etiqueta de preço'));
    expect(flyer().dataset.layout).toBe('etiqueta');
    expect(flyer().querySelector('table')).toBeNull();
    expect(localStorage.getItem('flyer_layout_v1')).toBe('etiqueta');

    // layouts coloridos aprovados (01, 02 e 09 da galeria de cores)
    fireEvent.click(screen.getByRole('button', { name: 'Layout do flyer' }));
    fireEvent.click(screen.getByText('Laranja Queima-Estoque'));
    expect(flyer().dataset.layout).toBe('laranja');
    expect(localStorage.getItem('flyer_layout_v1')).toBe('laranja');

    fireEvent.click(screen.getByRole('button', { name: 'Layout do flyer' }));
    fireEvent.click(screen.getByText('Vermelho Racing'));
    expect(flyer().dataset.layout).toBe('racing');
    expect(localStorage.getItem('flyer_layout_v1')).toBe('racing');

    fireEvent.click(screen.getByRole('button', { name: 'Layout do flyer' }));
    fireEvent.click(screen.getByText('Amarelo Encarte'));
    expect(flyer().dataset.layout).toBe('encarte');
    expect(flyer().querySelector('table')).toBeTruthy();
    expect(flyer().textContent).toContain('Consulte disponibilidade');
    expect(localStorage.getItem('flyer_layout_v1')).toBe('encarte');

    // volta para o clássico
    fireEvent.click(screen.getByRole('button', { name: 'Layout do flyer' }));
    fireEvent.click(screen.getByText('Clássico'));
    expect(flyer().dataset.layout).toBe('atual');
    expect(localStorage.getItem('flyer_layout_v1')).toBe('atual');
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

  it('aba Dados: cria tabela com N colunas, adiciona linha e a busca grifa o termo', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    // sub-abas
    expect(screen.getByRole('button', { name: /PEÇAS \(0\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /O\.S'S \(0\)/i })).toBeTruthy();

    // cria tabela com 3 colunas
    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));

    const tabela = container.querySelector('table')!;
    expect(tabela.querySelectorAll('thead input')).toHaveLength(3); // títulos (negrito)
    expect((tabela.querySelector('thead input') as HTMLInputElement).value).toBe('Coluna 1');

    // adiciona linha e escreve
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    const celulas = container.querySelectorAll('tbody input[type="text"]');
    expect(celulas).toHaveLength(3);
    fireEvent.change(celulas[0], { target: { value: 'JOAO ABC1D23' } });

    // copiar o conteúdo da célula (botão aparece quando a célula tem texto)
    expect(screen.getByRole('button', { name: /Copiar célula 1-1/i })).toBeTruthy();

    // busca: grifa a célula e mostra o resumo
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar nas tabelas/i), { target: { value: 'joao' } });
    expect(screen.getByText(/1 em PEÇAS/i)).toBeTruthy();
    expect(document.querySelectorAll('[data-marcado="1"]')).toHaveLength(1);

    // cria uma sub-aba nova e uma tabela nela
    fireEvent.click(screen.getByRole('button', { name: /Criar sub-aba/i }));
    fireEvent.change(screen.getByLabelText('Nome da nova sub-aba'), { target: { value: 'PREVENTIVA' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmar nova sub-aba/i }));
    expect(screen.getByRole('button', { name: /PREVENTIVA \(0\)/i })).toBeTruthy();

    // excluir a sub-aba (com confirmação)
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir sub-aba PREVENTIVA' }));
    expect(screen.queryByRole('button', { name: /PREVENTIVA \(0\)/i })).toBeNull();
    confirmar.mockRestore();

    // termo que só existe em O.S's troca de sub-aba
    fireEvent.click(screen.getByRole('button', { name: /O\.S'S \(0\)/i }));
    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.change(container.querySelectorAll('tbody input[type="text"]')[0], { target: { value: 'OS 4471 MARIA' } });
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar nas tabelas/i), { target: { value: 'maria' } });
    expect(screen.getByRole('button', { name: /O\.S'S \(1\)/i })).toBeTruthy();
    expect(document.querySelectorAll('[data-marcado="1"]').length).toBeGreaterThan(0);
  });

  it('aba Dados: excluir tabela mora no cabeçalho e a linha tem copiar + excluir com confirmação', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    const celulas = container.querySelectorAll('tbody input[type="text"]');
    fireEvent.change(celulas[0], { target: { value: 'PNEU A' } });
    fireEvent.change(celulas[1], { target: { value: 'R$ 100' } });

    // o excluir tabela agora fica como título da coluna de opções (thead)
    expect(container.querySelector('thead button[aria-label="Excluir tabela"]')).toBeTruthy();

    // os botões de ação ficam fora da ordem do TAB (TAB vai de célula em célula)
    expect(screen.getByRole('button', { name: /Copiar célula 1-1/i }).tabIndex).toBe(-1);
    expect(screen.getByRole('button', { name: 'Copiar linha 1' }).tabIndex).toBe(-1);
    expect(screen.getByRole('button', { name: 'Excluir linha 1' }).tabIndex).toBe(-1);
    expect(screen.getByRole('button', { name: 'Excluir tabela' }).tabIndex).toBe(-1);
    expect(screen.getByRole('button', { name: 'Excluir coluna 1' }).tabIndex).toBe(-1);

    // copiar a linha toda (TAB entre as células)
    const escrever = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: escrever }, configurable: true });
    fireEvent.click(screen.getByRole('button', { name: 'Copiar linha 1' }));
    expect(escrever).toHaveBeenCalledWith('PNEU A\tR$ 100');

    // excluir linha: cancelar mantém, confirmar remove
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir linha 1' }));
    expect(container.querySelectorAll('tbody tr')).toHaveLength(1);
    confirmar.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir linha 1' }));
    expect(container.querySelectorAll('tbody tr')).toHaveLength(0);

    // excluir coluna: cancelar mantém, confirmar remove (com 1 coluna o botão some)
    confirmar.mockReturnValue(false);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir coluna 1' }));
    expect(container.querySelectorAll('thead input')).toHaveLength(2);
    confirmar.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir coluna 1' }));
    expect(container.querySelectorAll('thead input')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Excluir coluna 1' })).toBeNull();
    confirmar.mockRestore();
  });

  it('aba Dados: colar planilha distribui nas células e arrastar seleciona várias para copiar', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));

    const celulas = () => container.querySelectorAll<HTMLInputElement>('tbody input[type="text"]');
    const tds = () => container.querySelectorAll<HTMLElement>('tbody td');

    // colar do Notion: TAB separa colunas (o espaço extra é aparado)
    fireEvent.paste(celulas()[0], {
      clipboardData: { getData: () => 'CARE042501\tVIA TANQUE FLEX\tTUNAP 939\tR$ 199,89\t R$ 5,00' },
    });
    expect(Array.from(celulas()).slice(0, 5).map((i) => i.value)).toEqual([
      'CARE042501',
      'VIA TANQUE FLEX',
      'TUNAP 939',
      'R$ 199,89',
      'R$ 5,00',
    ]);

    // arrastar da célula 1-1 até 1-3 seleciona as três
    fireEvent.mouseDown(celulas()[0]);
    fireEvent.mouseEnter(tds()[1]);
    fireEvent.mouseEnter(tds()[2]);
    expect(container.querySelectorAll('[data-selecionada="1"]')).toHaveLength(3);

    // Ctrl+C copia o bloco (TAB entre colunas)
    const escrever = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: escrever }, configurable: true });
    fireEvent.keyDown(celulas()[0], { key: 'c', ctrlKey: true });
    expect(escrever).toHaveBeenCalledWith('CARE042501\tVIA TANQUE FLEX\tTUNAP 939');

    // clicar numa célula da seleção deixa só ela marcada (desmarca as demais)
    fireEvent.mouseDown(celulas()[1]);
    expect(container.querySelectorAll('[data-selecionada="1"]')).toHaveLength(1);
  });

  it('aba Dados: botão ao lado de ordenar/excluir adiciona uma coluna', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));

    expect(container.querySelectorAll('thead input')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar coluna' }));
    expect(container.querySelectorAll('thead input')).toHaveLength(3);
    expect(container.querySelectorAll('tbody input[type="text"]')).toHaveLength(3);
  });

  it('aba Dados: ordenar a tabela por uma coluna (A–Z / Z–A)', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));

    const celulas = () => container.querySelectorAll<HTMLInputElement>('tbody input[type="text"]');
    fireEvent.change(celulas()[0], { target: { value: 'ZEBRA' } });
    fireEvent.change(celulas()[2], { target: { value: 'ARROZ' } });

    fireEvent.click(screen.getByRole('button', { name: 'Ordenar tabela' }));
    expect(screen.getByText('Ordenar por coluna')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Ordenar Coluna 1 crescente' }));
    expect(celulas()[0].value).toBe('ARROZ');
    expect(celulas()[2].value).toBe('ZEBRA');

    fireEvent.click(screen.getByRole('button', { name: 'Ordenar tabela' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ordenar Coluna 1 decrescente' }));
    expect(celulas()[0].value).toBe('ZEBRA');
  });

  it('valores: colar formata (milhar/centavos) e a vassoura limpa', () => {
    render(<App />);
    const campos = screen.getAllByPlaceholderText('0,00');
    expect(campos).toHaveLength(2);

    fireEvent.paste(campos[0], { clipboardData: { getData: () => '1000' } });
    expect((campos[0] as HTMLInputElement).value).toBe('1.000,00');

    fireEvent.paste(campos[1], { clipboardData: { getData: () => '2.188,92' } });
    expect((campos[1] as HTMLInputElement).value).toBe('2.188,92');

    fireEvent.click(screen.getByRole('button', { name: 'Limpar Total Revisão' }));
    expect((campos[0] as HTMLInputElement).value).toBe('');
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
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa ou item/i), { target: { value: 'xyz' } });
    expect(screen.getByRole('button', { name: /Todos \(1\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Não Realizados \(0\)/i })).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa ou item/i), { target: { value: 'abc' } });
    expect(screen.getByRole('button', { name: /Todos \(1\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Não Realizados \(1\)/i })).toBeTruthy();
  });

  it('histórico: Pesquisar acha por item (ex.: "freio") e grifa', () => {
    const comFreio = { ...registro('1', 'ABC1D23', '24/09/2026 12:30:00'), descReparo: '01 PASTILHAS DE FREIO' };
    localStorage.setItem('orcamentos_historico_v1', JSON.stringify([comFreio]));
    render(<HistoryModal aberto onFechar={() => {}} onAbrir={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Pesquisar/i }));
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa ou item/i), {
      target: { value: 'freio' },
    });
    expect(screen.getByText(/1 de 1/)).toBeTruthy();
    expect(document.querySelector('mark')?.textContent?.toLowerCase()).toBe('freio');
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
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa ou item/i), {
      target: { value: 'abc-1d23' },
    });
    expect(screen.getByText('ABC1D23')).toBeTruthy();
    expect(screen.queryByText('XYZ9A87')).toBeNull();

    // Busca por data também
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa ou item/i), {
      target: { value: '01/08' },
    });
    expect(screen.getByText('XYZ9A87')).toBeTruthy();
    expect(screen.queryByText('ABC1D23')).toBeNull();
  });
});
