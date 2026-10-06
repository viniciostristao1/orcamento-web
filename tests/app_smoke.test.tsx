// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import HistoryModal from '../src/components/HistoryModal';
import type { OrcamentoSalvo } from '../src/utils/historico';
import { VERSAO } from '../src/utils/versao';
import { RASCUNHO_KEY } from '../src/utils/rascunho';
import { ULTIMO_KEY } from '../src/utils/ultimoOrcamento';

// PDF mockado (sem worker): o texto varia pelo nome do arquivo.
vi.mock('../src/sistema/pdf', () => ({
  extrairTextoPdf: async (arquivo: File) => ({
    paginas: 1,
    texto: arquivo.name.includes('segundo')
      ? 'It Tipo Codigo\n2 Peca P2 1 20,00\nFechamento\nReclamacoes Originais\n02 SEGUNDO\nSugestao'
      : 'It Tipo Codigo\n1 Peca P1 1 10,00\nFechamento\nReclamacoes Originais\n01 PRIMEIRO\nSugestao',
  }),
}));

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

// O jsdom não implementa scrollIntoView, mas o app chama num setTimeout
// (rolagem até o resultado) — sem o stub, o timer vira erro "unhandled".
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});

afterEach(() => {
  cleanup();
  localStorage.removeItem(RASCUNHO_KEY);
  localStorage.removeItem(ULTIMO_KEY);
  localStorage.removeItem('flyer_layout_v1');
});

describe('App — smoke test (render + processar)', () => {
  it('renderiza a tela com os textos principais', () => {
    const { container } = render(<App />);
    expect(screen.getByText(/Toyota Weiand/i)).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'ORÇAMENTOS' })).toBeTruthy();
    // selo de versão do header acompanha o package.json (trava contra selo defasado)
    expect(screen.getByTitle('Versão do arquivo').textContent).toBe(`v${VERSAO}`);
    // títulos das abas no mesmo tamanho/fonte de DESCRIÇÃO DO REPARO (text-xl)
    expect(screen.getByRole('heading', { name: 'ORÇAMENTOS' }).className).toContain('text-xl');
    expect(screen.getByText('DESCRIÇÃO DO REPARO')).toBeTruthy();
    expect(screen.getByText('DADOS DO ORÇAMENTO')).toBeTruthy();
    // DESCRIÇÃO DO REPARO e DADOS DO ORÇAMENTO com a mesma fonte (text-lg)
    const grandes = container.querySelectorAll('textarea.text-lg');
    expect(grandes.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('APROVADO E DESCONTO')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Processar Tudo/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Histórico' })).toBeTruthy();
  });

  it('ao processar, mostra o resumo com os valores calculados', () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('Ex.: ABC1D23'), { target: { value: 'ABC1D23' } });
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
    const primeiroTextarea = Array.from(container.querySelectorAll('textarea')).find((t) =>
      (t as HTMLTextAreaElement).value.includes('PASTILHAS'),
    ) as HTMLTextAreaElement;
    fireEvent.change(primeiroTextarea, { target: { value: '01 TESTE PERSISTIDO' } });
    unmount();

    const { container: novo } = render(<App />);
    const textareaDepois = Array.from(novo.querySelectorAll('textarea')).find((t) =>
      (t as HTMLTextAreaElement).value.includes('TESTE PERSISTIDO'),
    ) as HTMLTextAreaElement;
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

    // temas removidos na v0.29.0 não aparecem mais
    expect(screen.queryByText('Terracota')).toBeNull();
    expect(screen.queryByText('Executivo Premium')).toBeNull();

    fireEvent.click(screen.getByText('Claro Papel'));
    expect(document.documentElement.dataset.tema).toBe('papel');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('papel');

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

  it('abas superiores: âmbar + preta só no tema grafite', () => {
    localStorage.removeItem('orcamentos_tema_v1');
    render(<App />);
    const abaOrc = () => screen.getByRole('button', { name: 'Orçamentos' });
    const abaDados = () => screen.getByRole('button', { name: 'Dados' });

    // padrão (azul): ativa azul com letra branca, demais em fantasma azul
    expect(abaOrc().className).toContain('bg-blue-600');
    expect(abaOrc().className).toContain('text-white');
    expect(abaDados().className).toContain('text-blue-200');

    // grafite: ativa âmbar com letra preta, demais em fantasma âmbar
    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }));
    fireEvent.click(screen.getByText('Grafite'));
    expect(abaOrc().className).toContain('bg-amber-500');
    expect(abaOrc().className).toContain('text-black');
    expect(abaDados().className).toContain('text-amber-200');

    // voltou ao azul: volta ao azul
    fireEvent.click(screen.getByRole('button', { name: 'Configurações' }));
    fireEvent.click(screen.getByText('Azul'));
    expect(abaOrc().className).toContain('bg-blue-600');
    expect(abaDados().className).toContain('text-blue-200');
  });

  it('logo Toyota tem classe própria (o tema claro o tinge de azul via CSS)', () => {
    render(<App />);
    const logo = screen.getByAltText('Toyota');
    expect(logo.className).toContain('logo-toyota');
  });

  it('migra nomes antigos e descarta os temas removidos (claude/terracota/executivo → azul)', () => {
    for (const antigo of ['claude', 'terracota', 'executivo']) {
      localStorage.setItem('orcamentos_tema_v1', antigo);
      const { unmount } = render(<App />);
      expect(document.documentElement.dataset.tema).toBe('azul');
      unmount();
    }

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

    // COPIAR PNEUS (logo abaixo do CONTATO, mesma janela dos demais) + copiar
    expect(screen.getByText(/MEDIDA PNEU: 265\/60R18/)).toBeTruthy();
    expect(screen.getByText(/• FIRESTONE - R\$ 1\.115,48/)).toBeTruthy();
    // ordem na tela: DADOS DA TABELA → CONTATO → COPIAR PNEUS
    const hDados = screen.getByRole('heading', { name: 'DADOS DA TABELA' });
    const hContato = screen.getByRole('heading', { name: 'CONTATO' });
    const hCopiar = screen.getByRole('heading', { name: 'COPIAR PNEUS' });
    expect(hDados.compareDocumentPosition(hContato) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hContato.compareDocumentPosition(hCopiar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const escrever = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: escrever }, configurable: true });
    fireEvent.click(screen.getByRole('button', { name: 'Copiar pneus' }));
    const copiado = String(escrever.mock.calls[0][0]).replace(/\u00a0/g, ' ');
    expect(copiado).toContain('MEDIDA PNEU: 265/60R18');
    expect(copiado).toContain(
      '• FIRESTONE - R$ 1.115,48 (em até 10x no Cartão) ou R$ 1.004,28 (Dinheiro, Pix, Débito).',
    );
  });

  it('aba Tire Flyer: contato vai para o histórico (com data/hora) e a busca acha', () => {
    localStorage.removeItem('flyer_historico_v1');
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));

    fireEvent.change(screen.getByPlaceholderText(/Nome, placa/i), { target: { value: 'JOAO ABC1D23' } });
    fireEvent.click(screen.getByRole('button', { name: /Processar e Atualizar Flyer/i }));

    const salvos = JSON.parse(localStorage.getItem('flyer_historico_v1') ?? '[]');
    expect(salvos).toHaveLength(1);
    expect(salvos[0].contato).toBe('JOAO ABC1D23');
    expect(salvos[0].medida).toBe('265/60R18');
    expect(salvos[0].criadoEm).toMatch(/\d{2}\/\d{2}\/\d{4}/);

    // abre o histórico e pesquisa pelo contato
    fireEvent.click(screen.getByRole('button', { name: 'Histórico do Tire Flyer' }));
    expect(screen.getByText('JOAO ABC1D23')).toBeTruthy();
    expect(screen.getAllByText('265/60R18').length).toBeGreaterThanOrEqual(2); // flyer + cartão
    fireEvent.click(screen.getByRole('button', { name: /Pesquisar/i }));
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por contato/i), {
      target: { value: 'abc-1d23' },
    });
    expect(screen.getByText(/1 de 1/)).toBeTruthy();
  });

  it('telefone + WhatsApp: orçamentos salva, busca acha e o botão abre wa.me', () => {
    localStorage.removeItem('orcamentos_historico_v1');
    const abertas: string[] = [];
    const original = window.open;
    (window as any).open = (url: string) => {
      abertas.push(url);
      return null;
    };
    try {
      render(<App />);
      fireEvent.change(screen.getByPlaceholderText('Ex.: 51 99999-9999'), { target: { value: '51 99999-9999' } });
      fireEvent.change(screen.getByPlaceholderText('Ex.: JOÃO DA SILVA'), { target: { value: 'JOAO' } });
      fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));

      const salvos = JSON.parse(localStorage.getItem('orcamentos_historico_v1') ?? '[]');
      expect(salvos).toHaveLength(1);
      expect(salvos[0].telefone).toBe('51 99999-9999');
      expect(salvos[0].nome).toBe('JOAO');

      fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
      // telefone aparece no cartão + botão habilitado abre a conversa (sem texto)
      expect(screen.getByText('51 99999-9999')).toBeTruthy();
      expect(screen.getByText('JOAO')).toBeTruthy();
      const botao = screen.getByRole('button', { name: 'Chamar no WhatsApp' });
      expect((botao as HTMLButtonElement).disabled).toBe(false);
      fireEvent.click(botao);
      expect(abertas).toEqual(['https://wa.me/5551999999999']);

      // busca por telefone acha o registro
      fireEvent.click(screen.getByRole('button', { name: /Pesquisar/i }));
      fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), {
        target: { value: '99999-9999' },
      });
      expect(screen.getByText(/1 de 1/)).toBeTruthy();

      // busca por nome também acha
      fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), {
        target: { value: 'joao' },
      });
      expect(screen.getByText(/1 de 1/)).toBeTruthy();
    } finally {
      window.open = original;
    }
  });

  it('telefone + WhatsApp: sem telefone o botão fica desabilitado', () => {
    localStorage.removeItem('orcamentos_historico_v1');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    const botao = screen.getByRole('button', { name: 'Chamar no WhatsApp' });
    expect((botao as HTMLButtonElement).disabled).toBe(true);
  });

  it('telefone + WhatsApp: tire flyer salva e o botão abre wa.me', () => {
    localStorage.removeItem('flyer_historico_v1');
    const abertas: string[] = [];
    const original = window.open;
    (window as any).open = (url: string) => {
      abertas.push(url);
      return null;
    };
    try {
      render(<App />);
      fireEvent.click(screen.getByText('Tire Flyer'));
      fireEvent.change(screen.getByPlaceholderText(/Telefone \(DDD/i), { target: { value: '(51) 3333-4444' } });
      fireEvent.click(screen.getByRole('button', { name: /Processar e Atualizar Flyer/i }));

      const salvos = JSON.parse(localStorage.getItem('flyer_historico_v1') ?? '[]');
      expect(salvos).toHaveLength(1);
      expect(salvos[0].telefone).toBe('(51) 3333-4444');

      fireEvent.click(screen.getByRole('button', { name: 'Histórico do Tire Flyer' }));
      expect(screen.getByText('(51) 3333-4444')).toBeTruthy();
      fireEvent.click(screen.getByRole('button', { name: 'Chamar no WhatsApp' }));
      expect(abertas).toEqual(['https://wa.me/555133334444']);
    } finally {
      window.open = original;
    }
  });

  it('aba Tire Flyer: processar atualiza o flyer', () => {    render(<App />);
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
    // conteúdo dos scripts sem negrito (só os títulos são em destaque)
    const areas = screen.getAllByPlaceholderText(/Escreva aqui o script/i);
    expect(areas).toHaveLength(2);
    areas.forEach((a) => {
      expect(a.className).toContain('font-normal');
      expect(a.className).not.toContain('font-bold');
    });
    // Agenda de Tarefas e Centro de Dados saíram da aba (backup foi p/ Configurações)
    expect(screen.queryByText('Agenda de Tarefas')).toBeNull();
    expect(screen.queryByText('Centro de Dados')).toBeNull();
  });

  it('lembrete global: contato com data de hoje avisa em qualquer aba e leva até ele', () => {
    const hoje = new Date().toISOString().split('T')[0];
    localStorage.setItem(
      'zap_contacts',
      JSON.stringify([{ id: 'c1', name: 'MARIA HOJE', phone: '51999999999', targetDate: hoje }]),
    );
    try {
      // abre na aba Orçamentos: mesmo assim o aviso pula (vale para todas as abas)
      render(<App />);
      expect(screen.getByText('DESCRIÇÃO DO REPARO')).toBeTruthy();
      // área toda clicável: janelinha + nome levam ao contato (2 botões)
      const botoes = screen.getAllByRole('button', { name: 'Ir para contato MARIA HOJE' });
      expect(botoes).toHaveLength(2);

      // clicar na área leva para a aba Whats e destaca o cartão do contato
      fireEvent.click(botoes[0]);
      expect(screen.getByText('Relatório de Envios')).toBeTruthy();
      expect(document.querySelector('[data-destaque="1"]')).toBeTruthy();
      expect(document.querySelector('[data-destaque="1"]')?.textContent).toContain('MARIA HOJE');
    } finally {
      localStorage.removeItem('zap_contacts');
    }
  });

  it('lembrete global: contato concluído ou com outra data não dispara (e dá para dispensar)', () => {
    const hoje = new Date().toISOString().split('T')[0];
    const amanha = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    // concluído hoje (NOTIFICAR clicado) + agendado para amanhã: sem aviso
    localStorage.setItem(
      'zap_contacts',
      JSON.stringify([
        { id: 'c1', name: 'FEITO HOJE', phone: '51999999999', targetDate: hoje, lastSentTimestamp: Date.now() },
        { id: 'c2', name: 'AMANHÃ', phone: '51888888888', targetDate: amanha },
      ]),
    );
    try {
      const { unmount } = render(<App />);
      expect(screen.queryByRole('button', { name: /Ir para contato/i })).toBeNull();
      unmount();
    } finally {
      localStorage.removeItem('zap_contacts');
    }

    // com contato para hoje, o X dispensa o aviso
    localStorage.setItem(
      'zap_contacts',
      JSON.stringify([{ id: 'c3', name: 'PEDRO HOJE', phone: '51777777777', targetDate: hoje }]),
    );
    try {
      render(<App />);
      expect(screen.getAllByRole('button', { name: 'Ir para contato PEDRO HOJE' })).toHaveLength(2);
      fireEvent.click(screen.getByRole('button', { name: 'Dispensar lembrete' }));
      expect(screen.queryByRole('button', { name: /Ir para contato/i })).toBeNull();
    } finally {
      localStorage.removeItem('zap_contacts');
    }
  });

  it('orçamentos: MENU DADOS leva até a sub-aba da aba Dados', () => {
    localStorage.removeItem('dados_tabelas_v1');
    localStorage.setItem(
      'dados_tabelas_v1',
      JSON.stringify({
        abas: [
          { id: 'pecas', rotulo: 'PEÇAS', tabelas: [], notas: [], ordem: [] },
          { id: 'os', rotulo: "O.S'S", tabelas: [], notas: [], ordem: [] },
          { id: 'mem', rotulo: 'MEMÓRIA', tabelas: [], notas: [], ordem: [] },
        ],
      }),
    );
    try {
      render(<App />);
      // titulozinho + um botão por sub-aba, um abaixo do outro
      expect(screen.getByText('Menu Dados')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Ir para sub-aba PEÇAS' })).toBeTruthy();
      expect(screen.getByRole('button', { name: "Ir para sub-aba O.S'S" })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Ir para sub-aba MEMÓRIA' })).toBeTruthy();

      // clicar abre a aba Dados já na sub-aba (MEMÓRIA fica ativa em azul)
      fireEvent.click(screen.getByRole('button', { name: 'Ir para sub-aba MEMÓRIA' }));
      const subAba = screen
        .getAllByRole('button', { name: 'MEMÓRIA' })
        .find((b) => b.className.includes('bg-blue-600'));
      expect(subAba).toBeTruthy();
    } finally {
      localStorage.removeItem('dados_tabelas_v1');
    }
  });

  it('aba Whats: cadastra contato (e salva no localStorage)', () => {
    localStorage.removeItem('zap_contacts');
    render(<App />);
    fireEvent.click(screen.getByText('Whats'));

    fireEvent.change(screen.getByPlaceholderText('Ex: WEIAND VEICULOS LTDA'), { target: { value: 'JOAO DA SILVA' } });
    fireEvent.change(screen.getByPlaceholderText('555199999999'), { target: { value: '51999999999' } });
    fireEvent.change(screen.getByPlaceholderText('OPCIONAL'), { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Cliente/i }));

    // a data padrão do contato é hoje: o lembrete global também mostra o nome
    // (cartão + botão do aviso)
    expect(screen.getAllByText('JOAO DA SILVA')).toHaveLength(2);
    // "Mensagem especial" virou só "Mensagem" (no formulário; no cartão virou janelinha)
    expect(screen.queryByText(/Mensagem especial/i)).toBeNull();
    expect(screen.getAllByText('Mensagem')).toHaveLength(1);
    // o copiar mensagem saiu do cartão e os campos inline de observação/mensagem também
    expect(screen.queryByRole('button', { name: /Copiar mensagem/i })).toBeNull();
    expect(screen.queryByPlaceholderText('Anotações sobre o cliente…')).toBeNull();
    expect(screen.queryByPlaceholderText('Se vazio, usa o script de revisão…')).toBeNull();

    // o ícone de lista abre telefone e chassi, cada um com copiar
    expect(screen.queryByRole('button', { name: 'Copiar telefone' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Telefone e chassi' }));
    const escrever = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: escrever }, configurable: true });
    fireEvent.click(screen.getByRole('button', { name: 'Copiar telefone' }));
    expect(escrever).toHaveBeenCalledWith('51999999999');
    fireEvent.click(screen.getByRole('button', { name: 'Copiar chassi' }));
    expect(escrever).toHaveBeenCalledWith('ABC123');
    // clicar de novo fecha os detalhes
    fireEvent.click(screen.getByRole('button', { name: 'Telefone e chassi' }));
    expect(screen.queryByRole('button', { name: 'Copiar telefone' })).toBeNull();

    // janelinha da observação: lê, edita (lápis), confirma (v), copia e fecha (x)
    fireEvent.click(screen.getByRole('button', { name: 'Observação' }));
    expect(screen.getByText('Sem observação.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Texto da observação'), { target: { value: 'Cliente prefere manhã' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(screen.getByText('Cliente prefere manhã')).toBeTruthy();
    escrever.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Copiar observação' }));
    expect(escrever).toHaveBeenCalledWith('Cliente prefere manhã');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByText('Cliente prefere manhã')).toBeNull();

    // janelinha da mensagem: vazia mostra o aviso e copia o script de revisão
    fireEvent.click(screen.getByRole('button', { name: 'Mensagem' }));
    expect(screen.getByText(/Se vazio, usa o script de revisão/)).toBeTruthy();
    escrever.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Copiar mensagem' }));
    expect(escrever).toHaveBeenCalledWith(expect.stringContaining('revisão'));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    const salvos = JSON.parse(localStorage.getItem('zap_contacts') ?? '[]');
    expect(salvos.length).toBe(1);
    expect(salvos[0].name).toBe('JOAO DA SILVA');
    expect(salvos[0].chassis).toBe('ABC123');
    expect(salvos[0].internalNote).toBe('Cliente prefere manhã');
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

  it('histórico: itens mostram o valor por id e o resumo aprovado/não aprovado', () => {
    localStorage.removeItem('orcamentos_historico_v1');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
    fireEvent.click(screen.getAllByRole('checkbox')[0]); // desmarca o item 1
    fireEvent.click(screen.getByRole('button', { name: /Salvar com itens não realizados/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    fireEvent.click(screen.getByRole('button', { name: /Não Realizados/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver itens do orçamento' }));

    const janela = document.querySelector('[data-janela-itens="1"]') as HTMLElement;
    expect(janela).toBeTruthy();
    // título no mesmo tamanho do HISTÓRICO
    expect(janela.querySelector('h3')?.className).toContain('text-xl');
    // valor de cada id no canto direito (item 1 não aprovado; 2 e 3 aprovados)
    expect(within(janela).getAllByText('R$ 2.203,04')).toHaveLength(2); // linha do item 1 + resumo
    expect(within(janela).getByText('R$ 209,60')).toBeTruthy();
    expect(within(janela).getByText('R$ 217,00')).toBeTruthy();
    // resumo: aprovado, não aprovado, % aprovado e total
    expect(within(janela).getByText('R$ 426,60')).toBeTruthy();
    expect(within(janela).getByText('R$ 2.629,64')).toBeTruthy();
    expect(within(janela).getByText('16%')).toBeTruthy();
  });

  it('aba Dados: cria tabela com N colunas, adiciona linha e a busca grifa o termo', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    // sub-abas (sem a quantidade de tabelas ao lado do nome)
    expect(screen.getByRole('button', { name: 'PEÇAS' })).toBeTruthy();
    expect(screen.getByRole('button', { name: "O.S'S" })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /PEÇAS \(/i })).toBeNull();

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
    expect(screen.getByRole('button', { name: 'PREVENTIVA' })).toBeTruthy();

    // excluir a sub-aba (com confirmação)
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Excluir sub-aba PREVENTIVA' }));
    expect(screen.queryByRole('button', { name: 'PREVENTIVA' })).toBeNull();
    confirmar.mockRestore();

    // termo que só existe em O.S's troca de sub-aba
    fireEvent.click(screen.getByRole('button', { name: "O.S'S" }));
    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.change(container.querySelectorAll('tbody input[type="text"]')[0], { target: { value: 'OS 4471 MARIA' } });
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar nas tabelas/i), { target: { value: 'maria' } });
    expect(screen.getByRole('button', { name: "O.S'S" })).toBeTruthy();
    expect(document.querySelectorAll('[data-marcado="1"]').length).toBeGreaterThan(0);
  });

  it('aba Dados: excluir tabela fica na barra de baixo e a linha tem copiar + excluir com confirmação', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    const celulas = container.querySelectorAll('tbody input[type="text"]');
    fireEvent.change(celulas[0], { target: { value: 'PNEU A' } });
    fireEvent.change(celulas[1], { target: { value: 'R$ 100' } });

    // o excluir tabela fica na barra de baixo, do lado oposto ao adicionar linha
    const excluirTabela = screen.getByRole('button', { name: 'Excluir tabela' });
    expect(container.querySelector('thead button[aria-label="Excluir tabela"]')).toBeNull();
    const barra = excluirTabela.parentElement?.parentElement as HTMLElement;
    expect(barra.contains(screen.getByRole('button', { name: 'Adicionar linha' }))).toBe(true);
    // subir/descer a tabela ficam na mesma barra, ao lado do excluir
    expect(barra.contains(screen.getByRole('button', { name: 'Mover tabela para cima' }))).toBe(true);
    expect(barra.contains(screen.getByRole('button', { name: 'Mover tabela para baixo' }))).toBe(true);
    // a barra tem a largura da tabela: o excluir fica sob a última coluna/linha
    expect(barra.style.width).toBe(
      (container.querySelector('table') as HTMLTableElement).style.width,
    );
    // tabela e barra preenchem o cartão (sem vão à direita com poucas colunas),
    // com mínimo = soma das colunas (2×170 + 92 de ações)
    const tabela = container.querySelector('table') as HTMLTableElement;
    expect(tabela.style.width).toBe('100%');
    expect(tabela.style.minWidth).toBe('432px');
    expect(barra.style.minWidth).toBe('432px');

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

  it('aba Dados: botões sobem/descem a tabela na ordem (com trava nas bordas)', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.change(container.querySelectorAll('tbody input[type="text"]')[0], { target: { value: 'PRIMEIRA' } });

    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /Adicionar linha/i })[1]);
    const celulas = () => container.querySelectorAll<HTMLInputElement>('tbody input[type="text"]');
    fireEvent.change(celulas()[1], { target: { value: 'SEGUNDA' } });

    const subir = () => screen.getAllByRole('button', { name: 'Mover tabela para cima' });
    const descer = () => screen.getAllByRole('button', { name: 'Mover tabela para baixo' });
    const valoresPrimeiraTabela = () =>
      Array.from(container.querySelectorAll('tbody')[0].querySelectorAll('input'))
        .map((i) => (i as HTMLInputElement).value)
        .join('|');
    expect(valoresPrimeiraTabela()).toContain('PRIMEIRA');
    // nas bordas o botão trava: 1ª não sobe, última não desce
    expect((subir()[0] as HTMLButtonElement).disabled).toBe(true);
    expect((descer()[1] as HTMLButtonElement).disabled).toBe(true);

    // sobe a 2ª: ela passa para cima
    fireEvent.click(subir()[1]);
    expect(valoresPrimeiraTabela()).toContain('SEGUNDA');
    expect((subir()[0] as HTMLButtonElement).disabled).toBe(true);

    // desce de volta: volta ao original
    fireEvent.click(descer()[0]);
    expect(valoresPrimeiraTabela()).toContain('PRIMEIRA');
  });

  it('orçamentos: lupa do MENU DADOS pesquisa nos Dados e abre no resultado', async () => {
    localStorage.removeItem('dados_tabelas_v1');
    localStorage.setItem(
      'dados_tabelas_v1',
      JSON.stringify({
        abas: [
          { id: 'pecas', rotulo: 'PEÇAS', tabelas: [], notas: [], ordem: [] },
          {
            id: 'os',
            rotulo: "O.S'S",
            tabelas: [
              {
                id: 't1',
                criadoEm: '',
                colunas: 1,
                titulos: ['SERVICO'],
                linhas: [['FREIO A'], ['FREIO B']],
                larguras: [170],
                comCaixas: true,
                marcados: [false, false],
              },
            ],
            notas: [],
            ordem: ['t1'],
          },
        ],
      }),
    );
    const valorAtual = () => {
      const el = document.querySelector('[data-atual="1"]') as HTMLInputElement | null;
      return el?.value ?? el?.textContent ?? '';
    };
    try {
      render(<App />);
      // a lupa é o primeiro botão dos atalhos
      fireEvent.click(screen.getByRole('button', { name: 'Buscar termo nos Dados' }));
      const campo = screen.getByLabelText('Buscar nas tabelas') as HTMLInputElement;
      fireEvent.change(campo, { target: { value: 'freio' } });
      // feedback ao digitar: quantos e onde (sem precisar dar Enter)
      expect(screen.getAllByText(/2 em O\.S'S/).length).toBeGreaterThanOrEqual(1);
      fireEvent.change(campo, { target: { value: 'xyzqq' } });
      expect(screen.getByText('Nada encontrado')).toBeTruthy();
      fireEvent.change(campo, { target: { value: 'freio' } });

      // já pulou ao digitar: foi para a aba Dados, abriu O.S's e grifou a 1ª
      // (só o termo fica grifado, não a célula inteira)
      const subAba = screen
        .getAllByRole('button', { name: "O.S'S" })
        .find((b) => b.className.includes('bg-blue-600'));
      expect(subAba).toBeTruthy();
      expect(valorAtual()).toContain('FREIO A');
      expect(document.querySelector('[data-grifo="1"] mark')).toBeTruthy();
      // o termo ficou no campo de busca da aba Dados (dá para dar Enter e percorrer)
      expect(
        (screen.getByPlaceholderText(/Pesquisar nas tabelas/i) as HTMLInputElement).value,
      ).toBe('freio');

      // o foco foi junto para o campo de lá: dá para continuar digitando direto
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(
          screen.getByPlaceholderText(/Pesquisar nas tabelas/i),
        );
      });
      fireEvent.change(screen.getByPlaceholderText(/Pesquisar nas tabelas/i), {
        target: { value: 'freio b' },
      });
      expect(valorAtual()).toContain('FREIO B');

      // Enter no atalho avança para a próxima ocorrência
      fireEvent.keyDown(campo, { key: 'Enter' });
      expect(valorAtual()).toContain('FREIO B');

      // volta aos Orçamentos: reabre a lupa (o termo segue lá) e Enter avança
      fireEvent.click(screen.getByText('Orçamentos'));
      fireEvent.click(screen.getByRole('button', { name: 'Buscar termo nos Dados' }));
      const campo2 = screen.getByLabelText('Buscar nas tabelas') as HTMLInputElement;
      expect(campo2.value).toBe('freio');
      fireEvent.keyDown(campo2, { key: 'Enter' });
      expect(valorAtual()).toContain('FREIO A');
      // Shift+Enter volta para a anterior
      fireEvent.keyDown(campo2, { key: 'Enter', shiftKey: true });
      expect(valorAtual()).toContain('FREIO B');
    } finally {
      localStorage.removeItem('dados_tabelas_v1');
    }
  });

  it('orçamentos: X da lupa limpa o termo digitado', () => {
    localStorage.removeItem('dados_tabelas_v1');
    try {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Buscar termo nos Dados' }));
      const campo = screen.getByLabelText('Buscar nas tabelas') as HTMLInputElement;
      fireEvent.change(campo, { target: { value: 'freio' } });
      expect(campo.value).toBe('freio');
      fireEvent.click(screen.getByRole('button', { name: 'Limpar busca do atalho' }));
      expect(campo.value).toBe('');
      expect(screen.queryByText('Nada encontrado')).toBeNull();
    } finally {
      localStorage.removeItem('dados_tabelas_v1');
    }
  });

  it('orçamentos: X do Pesquisar nas tabelas limpa a lupa do atalho junto', () => {
    localStorage.removeItem('dados_tabelas_v1');
    try {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Buscar termo nos Dados' }));
      const campo = screen.getByLabelText('Buscar nas tabelas') as HTMLInputElement;
      fireEvent.change(campo, { target: { value: 'freio' } });
      // pulou para Dados com o termo; o X de lá limpa os dois campos
      fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
      expect(
        (screen.getByPlaceholderText(/Pesquisar nas tabelas/i) as HTMLInputElement).value,
      ).toBe('');
      fireEvent.click(screen.getByText('Orçamentos'));
      // o campo segue com o termo limpo (no navegador real o blur fecha a lupa;
      // ao reabrir, o termo já foi zerado pelo evento)
      expect(
        (screen.getByLabelText('Buscar nas tabelas') as HTMLInputElement).value,
      ).toBe('');
    } finally {
      localStorage.removeItem('dados_tabelas_v1');
    }
  });

  it('orçamentos: DESCRIÇÃO DO REPARO sem barra de rolagem (só mouse)', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('textarea')[0].className).toContain('scrollbar-hide');
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

    // Delete apaga o bloco todo (sem tocar nas células fora dele)
    fireEvent.keyDown(celulas()[0], { key: 'Delete' });
    expect(Array.from(celulas()).slice(0, 5).map((i) => i.value)).toEqual([
      '',
      '',
      '',
      'R$ 199,89',
      'R$ 5,00',
    ]);

    // recoloca e Ctrl+X recorta (copia e apaga)
    fireEvent.paste(celulas()[0], {
      clipboardData: { getData: () => 'CARE042501\tVIA TANQUE FLEX\tTUNAP 939' },
    });
    escrever.mockClear();
    fireEvent.keyDown(celulas()[0], { key: 'x', ctrlKey: true });
    expect(escrever).toHaveBeenCalledWith('CARE042501\tVIA TANQUE FLEX\tTUNAP 939');
    expect(Array.from(celulas()).slice(0, 3).map((i) => i.value)).toEqual(['', '', '']);

    // clicar numa célula da seleção deixa só ela marcada (desmarca as demais)
    fireEvent.mouseDown(celulas()[1]);
    expect(container.querySelectorAll('[data-selecionada="1"]')).toHaveLength(1);

    // com uma célula só, Backspace/Delete continuam editando o texto da célula
    fireEvent.change(celulas()[1], { target: { value: 'R$ 100' } });
    fireEvent.keyDown(celulas()[1], { key: 'Backspace' });
    fireEvent.keyDown(celulas()[1], { key: 'Delete' });
    expect(celulas()[1].value).toBe('R$ 100');
  });

  it('aba Dados: TAB/Enter levam o destaque junto com o foco (como planilha)', async () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));

    const celulas = () => container.querySelectorAll<HTMLInputElement>('tbody input[type="text"]');
    const destaque = () => Array.from(celulas()).findIndex((i) => i.closest('td')?.dataset.selecionada === '1');

    fireEvent.mouseDown(celulas()[0]);
    expect(destaque()).toBe(0);

    // TAB anda para a direita (o destaque acompanha o foco)
    fireEvent.keyDown(celulas()[0], { key: 'Tab' });
    expect(document.activeElement).toBe(celulas()[1]);
    expect(destaque()).toBe(1);

    // TAB na última coluna desce para a 1ª da linha de baixo
    fireEvent.keyDown(celulas()[1], { key: 'Tab' });
    expect(document.activeElement).toBe(celulas()[2]);
    expect(destaque()).toBe(2);

    // Enter desce uma linha e Shift+Enter volta
    fireEvent.keyDown(celulas()[2], { key: 'Enter' });
    expect(document.activeElement).toBe(celulas()[4]);
    expect(destaque()).toBe(4);
    fireEvent.keyDown(celulas()[4], { key: 'Enter', shiftKey: true });
    expect(document.activeElement).toBe(celulas()[2]);

    // Shift+Tab volta da 1ª coluna para a última da linha de cima
    fireEvent.keyDown(celulas()[2], { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(celulas()[1]);
    expect(destaque()).toBe(1);

    // Enter na última linha (qualquer coluna) abre uma linha nova e foca nela
    fireEvent.mouseDown(celulas()[5]); // última linha, 2ª coluna
    fireEvent.keyDown(celulas()[5], { key: 'Enter' });
    const depois = () => container.querySelectorAll<HTMLInputElement>('tbody input[type="text"]');
    expect(depois()).toHaveLength(8); // 4 linhas x 2 colunas
    await vi.waitFor(() => expect(document.activeElement).toBe(depois()[7]));
    expect(depois()[7].closest('td')?.dataset.selecionada).toBe('1');
    expect(depois()[7].value).toBe('');
  });

  it('aba Dados: Enter na busca percorre as ocorrências (1 de N) e destaca a atual', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    const celulas = () => container.querySelectorAll<HTMLInputElement>('tbody input[type="text"]');
    // fonte um pouco menor que a do campo "DADOS DO ORÇAMENTO" (text-base) e célula compacta
    expect(celulas()[0].className).toContain('text-base');
    expect(celulas()[0].className).toContain('py-1');
    fireEvent.change(celulas()[0], { target: { value: 'PASTILHA FREIO' } });
    fireEvent.change(celulas()[3], { target: { value: 'FREIO TRASEIRO' } });

    const buscaInput = screen.getByPlaceholderText(/Pesquisar nas tabelas/i);
    fireEvent.change(buscaInput, { target: { value: 'freio' } });

    const atuais = () => container.querySelectorAll<HTMLInputElement>('[data-atual="1"]');
    expect(screen.getByText(/1 de 2/)).toBeTruthy();
    expect(atuais()).toHaveLength(1);
    expect(atuais()[0].value).toBe('PASTILHA FREIO');

    // Enter vai para a 2ª ocorrência (e o contador acompanha)
    fireEvent.keyDown(buscaInput, { key: 'Enter' });
    expect(screen.getByText(/2 de 2/)).toBeTruthy();
    expect(atuais()[0].value).toBe('FREIO TRASEIRO');

    // Enter de novo volta para a 1ª; Shift+Enter volta
    fireEvent.keyDown(buscaInput, { key: 'Enter' });
    expect(screen.getByText(/1 de 2/)).toBeTruthy();
    fireEvent.keyDown(buscaInput, { key: 'Enter', shiftKey: true });
    expect(screen.getByText(/2 de 2/)).toBeTruthy();
  });

  it('aba Dados: nota (clique edita, lista, copiar, redimensionar, arrastar e busca)', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    // uma tabela + duas notas (para testar o arrastar)
    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar nota' }));
    fireEvent.click(screen.getByRole('button', { name: 'Criar nota' }));

    const notasEls = () => container.querySelectorAll<HTMLElement>('[data-nota]');
    expect(notasEls()).toHaveLength(2);
    expect(notasEls()[0].style.width).toBe('340px');
    expect(notasEls()[0].style.height).toBe('150px');

    // em repouso é somente-leitura; ao clicar (focar) já dá para escrever ali
    const ta0 = screen.getAllByLabelText('Texto da nota')[0] as HTMLTextAreaElement;
    expect(ta0.readOnly).toBe(true);
    expect(ta0.placeholder).toBe('(vazia)');
    fireEvent.focus(ta0);
    expect(ta0.readOnly).toBe(false);
    fireEvent.change(ta0, { target: { value: 'Conferir freio de mão' } });
    expect(ta0.className).not.toContain('font-bold');

    // lista: a bolinha entra na linha do cursor (mesmo com a linha selecionada)
    fireEvent.change(ta0, { target: { value: 'conferir freio\nlinha dois' } });
    ta0.setSelectionRange(0, 14); // seleciona "conferir freio"
    fireEvent.click(screen.getAllByRole('button', { name: 'Lista na nota' })[0]);
    expect(ta0.value).toBe('• conferir freio\nlinha dois');

    // clicar de novo na linha com bolinha remove a bolinha (e desliga a lista)
    ta0.setSelectionRange(2, 2);
    fireEvent.click(screen.getAllByRole('button', { name: 'Lista na nota' })[0]);
    expect(ta0.value).toBe('conferir freio\nlinha dois');
    // reativa para o Enter continuar a lista
    ta0.setSelectionRange(2, 2);
    fireEvent.click(screen.getAllByRole('button', { name: 'Lista na nota' })[0]);
    expect(ta0.value).toBe('• conferir freio\nlinha dois');

    // Enter cria o próximo item na linha de baixo
    fireEvent.change(ta0, { target: { value: '• conferir freio\n• trocar óleo' } });
    ta0.setSelectionRange(ta0.value.length, ta0.value.length);
    fireEvent.keyDown(ta0, { key: 'Enter' });
    expect(ta0.value).toBe('• conferir freio\n• trocar óleo\n• ');
    // Enter num item vazio tira a bolinha e encerra a lista
    ta0.setSelectionRange(ta0.value.length, ta0.value.length);
    fireEvent.keyDown(ta0, { key: 'Enter' });
    expect(ta0.value).toBe('• conferir freio\n• trocar óleo\n');

    // copiar (com os itens da lista)
    const escrever = vi.fn();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: escrever }, configurable: true });
    fireEvent.click(screen.getAllByRole('button', { name: 'Copiar nota' })[0]);
    expect(escrever).toHaveBeenCalledWith('• conferir freio\n• trocar óleo\n');

    // arrastar a borda direita aumenta a largura (compensando o zoom .75)
    fireEvent.mouseDown(screen.getAllByRole('separator', { name: 'Ajustar largura da nota' })[0], { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 175 }); // +75 na tela = +100 na nota
    fireEvent.mouseUp(window);
    expect(notasEls()[0].style.width).toBe('440px');

    // alça de 6 pontinhos: soltar a 1ª nota na 2ª troca a ordem
    const idA = notasEls()[0].dataset.nota!;
    const idB = notasEls()[1].dataset.nota!;
    const dt = {
      setData: vi.fn(),
      setDragImage: vi.fn(),
      getData: () => idA,
      dropEffect: '',
      effectAllowed: '',
    };
    fireEvent.dragStart(notasEls()[0].querySelector('[data-alca-nota]')!, { dataTransfer: dt });
    fireEvent.dragOver(notasEls()[1], { dataTransfer: dt });
    fireEvent.drop(notasEls()[1], { dataTransfer: dt });
    expect(notasEls()[0].dataset.nota).toBe(idB);
    expect(notasEls()[1].dataset.nota).toBe(idA);

    // soltar em cima da tabela coloca a nota acima dela
    const cardTabela = container.querySelector('table')!.closest('div.bg-slate-900\\/60') as HTMLElement;
    expect(cardTabela).toBeTruthy();
    const dt2 = { ...dt, getData: () => idA };
    fireEvent.dragStart(notasEls()[1].querySelector('[data-alca-nota]')!, { dataTransfer: dt2 });
    fireEvent.dragOver(cardTabela, { dataTransfer: dt2 });
    fireEvent.drop(cardTabela, { dataTransfer: dt2 });
    expect(cardTabela.compareDocumentPosition(notasEls()[0]) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();

    // a lupa acha o conteúdo da nota e destaca
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar nas tabelas/i), { target: { value: 'freio' } });
    expect(screen.getByText(/1 de 1/)).toBeTruthy();
    expect(container.querySelectorAll('[data-nota][data-atual="1"]')).toHaveLength(1);

    // borracha limpa e o X fecha (remove) uma nota (re-consultando: a ordem mudou)
    fireEvent.click(screen.getAllByRole('button', { name: 'Limpar nota' })[0]);
    expect((screen.getAllByLabelText('Texto da nota')[0] as HTMLTextAreaElement).value).toBe('');
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar nota' })[0]);
    expect(container.querySelectorAll('[data-nota]')).toHaveLength(1);
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

  it('aba Dados: grifo do cabeçalho cobre o termo inteiro + nota grifa o termo', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    const titulo = container.querySelector('thead input[type="text"]') as HTMLInputElement;
    fireEvent.change(titulo, { target: { value: 'FACILITADA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar nota' }));
    const nota = screen.getAllByLabelText('Texto da nota')[0] as HTMLTextAreaElement;
    fireEvent.focus(nota);
    fireEvent.change(nota, { target: { value: 'pagamento FACILITADA aqui' } });

    fireEvent.change(screen.getByPlaceholderText(/Pesquisar nas tabelas/i), {
      target: { value: 'FACILITADA' },
    });
    // cabeçalho: overlay contém o título inteiro e o mark é o termo inteiro
    const grifoTitulo = container.querySelector('thead [data-grifo="1"]') as HTMLElement;
    expect(grifoTitulo).toBeTruthy();
    expect(grifoTitulo.textContent).toBe('FACILITADA');
    expect(grifoTitulo.querySelector('mark')?.textContent).toBe('FACILITADA');
    // mark sem padding horizontal (padding deslocava o termo de baixo)
    expect(grifoTitulo.querySelector('mark')?.className).not.toContain('px-0.5');
    // nota: agora também tem overlay com o termo grifado (antes só a borda acendia)
    const grifoNota = container.querySelector('[data-nota] [data-grifo="1"]') as HTMLElement;
    expect(grifoNota).toBeTruthy();
    expect(grifoNota.textContent).toBe('pagamento FACILITADA aqui');
    expect(grifoNota.querySelector('mark')?.textContent).toBe('FACILITADA');
  });

  it('aba Dados: célula sugere autocompletar com valores da coluna (PED→PEDRO)', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    const celulas = container.querySelectorAll<HTMLInputElement>('tbody input[type="text"]');
    fireEvent.change(celulas[0], { target: { value: 'PEDRO' } });

    // a 2ª célula aponta para a datalist da coluna, que oferece PEDRO
    const listaId = celulas[1].getAttribute('list');
    expect(listaId).toBeTruthy();
    const lista = container.querySelector(`datalist[id="${listaId}"]`);
    expect(lista).toBeTruthy();
    const opcoes = lista!.querySelectorAll('option');
    expect(Array.from(opcoes).map((o) => (o as HTMLOptionElement).value)).toContain('PEDRO');
  });

  it('aba Dados: clique simples não pinta a célula; arrastar pinta o bloco', () => {
    localStorage.removeItem('dados_tabelas_v1');
    const { container } = render(<App />);
    fireEvent.click(screen.getByText('Dados'));

    fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    fireEvent.click(screen.getByRole('button', { name: /Adicionar linha/i }));
    const celulas = () => container.querySelectorAll<HTMLInputElement>('tbody input[type="text"]');
    const tds = () => container.querySelectorAll<HTMLElement>('tbody td');

    // clique simples: seleção lógica existe, mas sem tinta azul
    fireEvent.mouseDown(celulas()[0]);
    expect(celulas()[0].closest('td')?.dataset.selecionada).toBe('1');
    expect(celulas()[0].className).not.toContain('bg-blue-600/35');

    // arrastar até a vizinha: o bloco fica pintado
    fireEvent.mouseEnter(tds()[1]);
    expect(celulas()[0].className).toContain('bg-blue-600/35');
    expect(celulas()[1].className).toContain('bg-blue-600/35');
    fireEvent.mouseUp(window);
  });

  it('aba Dados: a lupa limpa sozinha após 1 min sem digitar', () => {
    vi.useFakeTimers();
    localStorage.removeItem('dados_tabelas_v1');
    try {
      const { container } = render(<App />);
      fireEvent.click(screen.getByText('Dados'));
      fireEvent.change(screen.getByLabelText('Número de colunas'), { target: { value: '1' } });
      fireEvent.click(screen.getByRole('button', { name: /Criar tabela/i }));
      const titulo = container.querySelector('thead input[type="text"]') as HTMLInputElement;
      fireEvent.change(titulo, { target: { value: 'FACILITADA' } });

      const busca = screen.getByPlaceholderText(/Pesquisar nas tabelas/i) as HTMLInputElement;
      fireEvent.change(busca, { target: { value: 'FACILITADA' } });
      expect(busca.value).toBe('FACILITADA');
      expect(container.querySelector('[data-grifo="1"]')).toBeTruthy();

      // 59s: ainda lá; 1s a mais: limpou o campo e o grifo
      act(() => { vi.advanceTimersByTime(59_000); });
      expect((screen.getByPlaceholderText(/Pesquisar nas tabelas/i) as HTMLInputElement).value).toBe('FACILITADA');
      act(() => { vi.advanceTimersByTime(1_000); });
      expect((screen.getByPlaceholderText(/Pesquisar nas tabelas/i) as HTMLInputElement).value).toBe('');
      expect(container.querySelector('[data-grifo="1"]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('orçamentos: o BUSCAR do atalho limpa sozinho após 1 min sem digitar', () => {
    vi.useFakeTimers();
    localStorage.removeItem('dados_tabelas_v1');
    try {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Buscar termo nos Dados' }));
      const campo = screen.getByLabelText('Buscar nas tabelas') as HTMLInputElement;
      fireEvent.change(campo, { target: { value: 'freio' } });
      // digitou no atalho: pulou para Dados com o termo
      expect((screen.getByPlaceholderText(/Pesquisar nas tabelas/i) as HTMLInputElement).value).toBe('freio');

      act(() => { vi.advanceTimersByTime(59_000); });
      expect((screen.getByPlaceholderText(/Pesquisar nas tabelas/i) as HTMLInputElement).value).toBe('freio');
      act(() => { vi.advanceTimersByTime(1_000); });
      expect((screen.getByPlaceholderText(/Pesquisar nas tabelas/i) as HTMLInputElement).value).toBe('');

      // o campo do atalho esvaziou junto (reabre a lupa para conferir)
      fireEvent.click(screen.getByText('Orçamentos'));
      fireEvent.click(screen.getByRole('button', { name: 'Buscar termo nos Dados' }));
      expect((screen.getByLabelText('Buscar nas tabelas') as HTMLInputElement).value).toBe('');
    } finally {
      vi.useRealTimers();
    }
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
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), { target: { value: 'xyz' } });
    expect(screen.getByRole('button', { name: /Todos \(1\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Não Realizados \(0\)/i })).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), { target: { value: 'abc' } });
    expect(screen.getByRole('button', { name: /Todos \(1\)/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Não Realizados \(1\)/i })).toBeTruthy();
  });

  it('histórico: Pesquisar acha por item (ex.: "freio") e grifa', () => {
    const comFreio = { ...registro('1', 'ABC1D23', '24/09/2026 12:30:00'), descReparo: '01 PASTILHAS DE FREIO' };
    localStorage.setItem('orcamentos_historico_v1', JSON.stringify([comFreio]));
    render(<HistoryModal aberto onFechar={() => {}} onAbrir={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Pesquisar/i }));
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), {
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
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), {
      target: { value: 'abc-1d23' },
    });
    expect(screen.getByText('ABC1D23')).toBeTruthy();
    expect(screen.queryByText('XYZ9A87')).toBeNull();

    // Busca por data também
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), {
      target: { value: '01/08' },
    });
    expect(screen.getByText('XYZ9A87')).toBeTruthy();
    expect(screen.queryByText('ABC1D23')).toBeNull();
  });

  it('histórico: excluir orçamento pede confirmação (Todos e Não Realizados)', () => {
    const comDesmarcados = { ...registro('1', 'ABC1D23', '24/09/2026 12:30:00'), naoRealizados: [1] };
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([comDesmarcados, registro('2', 'XYZ9A87', '01/08/2026 09:00:00')]),
    );
    const confirmar = vi.spyOn(window, 'confirm');
    try {
      render(<HistoryModal aberto onFechar={() => {}} onAbrir={() => {}} />);

      // negou: nada sai
      confirmar.mockReturnValue(false);
      fireEvent.click(screen.getAllByRole('button', { name: 'Excluir orçamento' })[0]);
      expect(screen.getByText('ABC1D23')).toBeTruthy();
      expect(screen.getByText('XYZ9A87')).toBeTruthy();

      // confirmou: sai da aba Todos…
      confirmar.mockReturnValue(true);
      fireEvent.click(screen.getAllByRole('button', { name: 'Excluir orçamento' })[0]);
      expect(screen.queryByText('ABC1D23')).toBeNull();
      expect(screen.getByText('XYZ9A87')).toBeTruthy();

      // …e some na aba Não Realizados quando é de lá
      localStorage.setItem('orcamentos_historico_v1', JSON.stringify([comDesmarcados]));
      cleanup();
      render(<HistoryModal aberto onFechar={() => {}} onAbrir={() => {}} />);
      fireEvent.click(screen.getByRole('button', { name: /Não Realizados \(1\)/i }));
      fireEvent.click(screen.getByRole('button', { name: 'Excluir orçamento' }));
      expect(screen.queryByText('ABC1D23')).toBeNull();
    } finally {
      confirmar.mockRestore();
    }
  });

  it('cor do cliente: marca verde/vermelho no histórico e filtra por cor', () => {
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([
        registro('1', 'ABC1D23', '24/09/2026 12:30:00'),
        registro('2', 'XYZ9A87', '01/08/2026 09:00:00'),
      ]),
    );
    render(<HistoryModal aberto onFechar={() => {}} onAbrir={() => {}} />);

    // marca o 1º de verde (quer fazer) e o 2º de vermelho (só pesquisou)
    fireEvent.click(screen.getAllByRole('button', { name: 'Marcar de verde (quer fazer em breve)' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Marcar de vermelho (só pesquisou)' })[1]);
    const salvos = JSON.parse(localStorage.getItem('orcamentos_historico_v1') ?? '[]');
    expect(salvos.find((r: OrcamentoSalvo) => r.placa === 'ABC1D23').cor).toBe('verde');
    expect(salvos.find((r: OrcamentoSalvo) => r.placa === 'XYZ9A87').cor).toBe('vermelho');

    // filtro verde mostra só o verde
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar só clientes verdes' }));
    expect(screen.getByText('ABC1D23')).toBeTruthy();
    expect(screen.queryByText('XYZ9A87')).toBeNull();

    // filtro vermelho mostra só o vermelho
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar só clientes vermelhos' }));
    expect(screen.queryByText('ABC1D23')).toBeNull();
    expect(screen.getByText('XYZ9A87')).toBeTruthy();

    // busca textual "verde" também filtra pela cor
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar todas as cores' }));
    fireEvent.click(screen.getByRole('button', { name: /Pesquisar/i }));
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), { target: { value: 'verde' } });
    expect(screen.getByText('ABC1D23')).toBeTruthy();
    expect(screen.queryByText('XYZ9A87')).toBeNull();

    // clicar de novo na cor limpa a marcação
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), { target: { value: '' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Marcar de verde (quer fazer em breve)' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar só clientes verdes' }));
    expect(screen.getByText('Nenhum cliente verde.')).toBeTruthy();
  });

  it('cor do cliente: tire flyer marca e filtra por cor', () => {
    localStorage.setItem(
      'flyer_historico_v1',
      JSON.stringify([
        { id: 'f1', criadoEm: '24/09/2026 12:30:00', contato: 'JOAO', medida: '265/60R18', inputText: 'a\nb', numMarcas: 1 },
        { id: 'f2', criadoEm: '01/08/2026 09:00:00', contato: 'MARIA', medida: '205/55R16', inputText: 'c\nd', numMarcas: 1 },
      ]),
    );
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));
    fireEvent.click(screen.getByRole('button', { name: 'Histórico do Tire Flyer' }));

    expect(screen.getByText('JOAO')).toBeTruthy();
    expect(screen.getByText('MARIA')).toBeTruthy();

    // marca o 2º (MARIA) de vermelho e filtra: só ela aparece
    fireEvent.click(screen.getAllByRole('button', { name: 'Marcar de vermelho (só pesquisou)' })[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar só clientes vermelhos' }));
    expect(screen.queryByText('JOAO')).toBeNull();
    expect(screen.getByText('MARIA')).toBeTruthy();

    // nenhum verde marcado
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar só clientes verdes' }));
    expect(screen.getByText('Nenhum cliente verde.')).toBeTruthy();
  });

  it('tire flyer: ver detalhes mostra marcas e preços sem reabrir', () => {
    localStorage.setItem(
      'flyer_historico_v1',
      JSON.stringify([
        { id: 'f1', criadoEm: '24/09/2026 12:30:00', contato: 'JOAO', medida: '265/60R18', inputText: '265/60R18\tMARCA\tÀ PRAZO\n1\tFirestone\tR$ 1.000,00', numMarcas: 1 },
      ]),
    );
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));
    fireEvent.click(screen.getByRole('button', { name: 'Histórico do Tire Flyer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes do flyer' }));

    const janela = document.querySelector('[data-janela-flyer="1"]') as HTMLElement;
    expect(janela).toBeTruthy();
    expect(janela.querySelector('h3')?.className).toContain('text-xl');
    expect(janela.textContent).toContain('Firestone');
    expect(janela.textContent).toContain('1.000,00');
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar' }).at(-1)!);
    expect(document.querySelector('[data-janela-flyer="1"]')).toBeNull();
  });

  it('cadeado: Sair bloqueia, senha errada não entra, certa desbloqueia', () => {
    localStorage.removeItem('app_bloqueio_senha_v1');
    try {
      render(<App />);
      // sem senha: o primeiro bloqueio vira o cadastro
      fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
      expect(screen.getByRole('heading', { name: 'Criar senha' })).toBeTruthy();
      fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: '1234' } });
      fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: '1234' } });
      fireEvent.click(screen.getByRole('button', { name: 'Criar senha' }));
      expect(screen.queryByText('Tela bloqueada')).toBeNull();

      // com senha: Sair pede a senha
      fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
      expect(screen.getByText('Tela bloqueada')).toBeTruthy();
      fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'errada' } });
      fireEvent.click(screen.getByRole('button', { name: 'Desbloquear' }));
      expect(screen.getByText('Senha incorreta.')).toBeTruthy();
      expect(screen.getByText('Tela bloqueada')).toBeTruthy();
      fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '1234' } });
      fireEvent.click(screen.getByRole('button', { name: 'Desbloquear' }));
      expect(screen.queryByText('Tela bloqueada')).toBeNull();
    } finally {
      localStorage.removeItem('app_bloqueio_senha_v1');
    }
  });

  it('cadeado: troca a senha nas Configurações', () => {
    localStorage.setItem('app_bloqueio_senha_v1', '1234');
    try {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Configurações' }));
      fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'errada' } });
      fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: '5678' } });
      fireEvent.change(screen.getByLabelText('Confirmar nova senha'), { target: { value: '5678' } });
      fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
      expect(screen.getByText('A senha atual não confere.')).toBeTruthy();

      fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: '1234' } });
      fireEvent.click(screen.getByRole('button', { name: 'Trocar senha' }));
      expect(screen.getByText('Senha trocada.')).toBeTruthy();
      expect(localStorage.getItem('app_bloqueio_senha_v1')).toBe('5678');
    } finally {
      localStorage.removeItem('app_bloqueio_senha_v1');
    }
  });

  it('orçamento do sistema: card 3 renderiza com PDF/OCR e usar-como-dados', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'ORÇAMENTO DO SISTEMA' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Novo arquivo' })).toBeTruthy();
    // sem texto extraído, usar desabilitado; sem botões manuais de extrair
    expect((screen.getByRole('button', { name: 'Usar no orçamento manual' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Extrair texto do PDF' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ler prints (OCR)' })).toBeNull();
  });

  it('card 3: borracha apaga extração, nº e data', () => {
    const { container } = render(<App />);
    const numInput = screen.getByPlaceholderText('Ex.: 4471') as HTMLInputElement;
    const dataInput = screen.getByPlaceholderText('Ex.: 24/09/2026') as HTMLInputElement;
    fireEvent.change(numInput, { target: { value: '20234' } });
    fireEvent.change(dataInput, { target: { value: '05/10/2026' } });
    fireEvent.change(screen.getByPlaceholderText('Ex.: ABC1D23'), { target: { value: 'ABC1D23' } });
    fireEvent.change(screen.getByPlaceholderText('Ex.: 51 99999-9999'), { target: { value: '51999999999' } });
    fireEvent.change(screen.getByPlaceholderText('Ex.: JOÃO DA SILVA'), { target: { value: 'JOAO' } });
    fireEvent.change(screen.getByLabelText('Descrição extraída para revisão'), { target: { value: '01 X' } });
    fireEvent.change(screen.getByLabelText('Dados extraídos para revisão'), { target: { value: '1 Peça X 1 10,00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Limpar extração' }));
    expect(numInput.value).toBe('');
    expect(dataInput.value).toBe('');
    expect((screen.getByPlaceholderText('Ex.: ABC1D23') as HTMLInputElement).value).toBe('');
    expect((screen.getByPlaceholderText('Ex.: 51 99999-9999') as HTMLInputElement).value).toBe('');
    expect((screen.getByPlaceholderText('Ex.: JOÃO DA SILVA') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Descrição extraída para revisão') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Dados extraídos para revisão') as HTMLInputElement).value).toBe('');
    // revisão, ajustes e textos principais também zeram
    expect(screen.getAllByPlaceholderText('0,00').map((i) => (i as HTMLInputElement).value)).toEqual(['', '']);
    expect((screen.getByPlaceholderText('Ex: 1 50,00') as HTMLInputElement).value).toBe('');
    const livres = Array.from(container.querySelectorAll('textarea')).filter(
      (t) => !t.getAttribute('placeholder') && !t.getAttribute('aria-label'),
    );
    expect(livres.map((t) => t.value)).toEqual(['', '']);
  });

  it('ordem dos cards: sistema, dados, ajustes, resumo, descrição', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i })); // mostra o RESUMO
    const hSistema = screen.getByRole('heading', { name: 'ORÇAMENTO DO SISTEMA' });
    const hDados = screen.getByText('DADOS DO ORÇAMENTO');
    const hDesc = screen.getByText('DESCRIÇÃO DO REPARO');
    const hAjustes = screen.getByText(/AJUSTES MANUAIS/);
    const hResumo = screen.getByText('RESUMO LÍQUIDO');
    expect(hSistema.compareDocumentPosition(hDados) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hAjustes.compareDocumentPosition(hResumo) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hResumo.compareDocumentPosition(hDesc) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('aprovado: borracha limpa só revisão e ajustes (resto fica)', () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('Ex.: ABC1D23'), { target: { value: 'ABC1D23' } });
    fireEvent.change(screen.getByPlaceholderText('Ex.: 51 99999-9999'), { target: { value: '51999999999' } });
    fireEvent.change(screen.getByPlaceholderText('Ex.: JOÃO DA SILVA'), { target: { value: 'JOAO' } });
    fireEvent.change(screen.getByPlaceholderText('Ex: 1 50,00'), { target: { value: '1 50,00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Limpar aprovado e desconto' }));
    expect(screen.getAllByPlaceholderText('0,00').map((i) => (i as HTMLInputElement).value)).toEqual(['', '']);
    expect((screen.getByPlaceholderText('Ex: 1 50,00') as HTMLInputElement).value).toBe('');
    // desconto, parcelas, placa, telefone e nome ficam
    expect(screen.getByDisplayValue('5')).toBeTruthy();
    expect(screen.getByDisplayValue('6x')).toBeTruthy();
    expect((screen.getByPlaceholderText('Ex.: ABC1D23') as HTMLInputElement).value).toBe('ABC1D23');
    expect((screen.getByPlaceholderText('Ex.: 51 99999-9999') as HTMLInputElement).value).toBe('51999999999');
    expect((screen.getByPlaceholderText('Ex.: JOÃO DA SILVA') as HTMLInputElement).value).toBe('JOAO');
  });

  it('play com campo vazio avisa em vez de sair em silêncio (sem scroll/imagem)', () => {
    const { container } = render(<App />);
    const livres = Array.from(container.querySelectorAll('textarea')).filter(
      (t) => !t.getAttribute('placeholder') && !t.getAttribute('aria-label'),
    );
    expect(livres).toHaveLength(2); // DESCRIÇÃO e DADOS
    fireEvent.change(livres[0], { target: { value: '' } });
    fireEvent.change(livres[1], { target: { value: '' } });
    const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
    try {
      fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
      expect(alerta).toHaveBeenCalledWith(expect.stringContaining('Usar no orçamento manual'));
      expect(document.querySelector('#printable-quote')).toBeNull();
    } finally {
      alerta.mockRestore();
    }
  });

  it('play usa o texto em revisão quando os campos estão vazios', () => {
    const { container } = render(<App />);
    const livres = Array.from(container.querySelectorAll('textarea')).filter(
      (t) => !t.getAttribute('placeholder') && !t.getAttribute('aria-label'),
    );
    fireEvent.change(livres[0], { target: { value: '' } });
    fireEvent.change(livres[1], { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Descrição extraída para revisão'), {
      target: { value: '01 TESTE' },
    });
    fireEvent.change(screen.getByLabelText('Dados extraídos para revisão'), {
      target: { value: '1 Peça X 1 10,00' },
    });
    const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
    try {
      fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
      expect(alerta).not.toHaveBeenCalled();
      expect(document.querySelector('#printable-quote')).toBeTruthy();
      expect(screen.getByText('TESTE')).toBeTruthy();
    } finally {
      alerta.mockRestore();
    }
  });

  it('relógio: agenda data/hora no cartão e mostra no lugar da contagem', () => {
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([registro('1', 'ABC1D23', '24/09/2026 12:30:00')]),
    );
    render(<HistoryModal aberto onFechar={() => {}} onAbrir={() => {}} />);

    // sem contagem de itens; data do orçamento sem horário
    expect(screen.queryByText(/1 item/)).toBeNull();
    expect(screen.getByText('24/09/2026')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Lembrete' }));
    fireEvent.change(screen.getByLabelText('Data e hora do lembrete'), {
      target: { value: '2026-10-12T09:00' },
    });
    fireEvent.change(screen.getByLabelText('Observação do lembrete'), {
      target: { value: 'LIGAR DE MANHA' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar lembrete' }));

    const salvos = JSON.parse(localStorage.getItem('orcamentos_historico_v1') ?? '[]');
    expect(salvos[0].lembreteEm).toBe('2026-10-12T09:00');
    expect(salvos[0].observacao).toBe('LIGAR DE MANHA');
    expect(screen.getByText('12/10/2026 09:00')).toBeTruthy();
    expect(screen.getByText('LIGAR DE MANHA')).toBeTruthy();

    // a lupa acha pela observação
    fireEvent.click(screen.getByRole('button', { name: /Pesquisar/i }));
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), { target: { value: 'manha' } });
    expect(screen.getByText(/1 de 1/)).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/Pesquisar por data, placa/i), { target: { value: '' } });

    // limpar tira a data
    fireEvent.click(screen.getByRole('button', { name: 'Lembrete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Limpar lembrete' }));
    expect(JSON.parse(localStorage.getItem('orcamentos_historico_v1') ?? '[]')[0].lembreteEm).toBeNull();
  });

  it('relógio: aviso vencido pisca, clica e abre o histórico no cartão', () => {
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([{ ...registro('1', 'ABC1D23', '24/09/2026 12:30:00'), lembreteEm: '2020-01-01T09:00' }]),
    );
    render(<App />);
    // área + botão do item têm o mesmo nome com 1 vencido (padrão do lembrete)
    expect(screen.getAllByRole('button', { name: 'Ir para orçamento ABC1D23' })).toHaveLength(2);

    fireEvent.click(screen.getAllByRole('button', { name: 'Ir para orçamento ABC1D23' })[1]);
    // abriu o histórico com o cartão destacado (não gera na tela)
    expect(screen.getByText('HISTÓRICO')).toBeTruthy();
    expect(document.querySelector('[data-destaque="1"]')?.textContent).toContain('ABC1D23');
    expect(document.querySelector('#printable-quote')).toBeNull();
    // ...e concluiu o lembrete (não pisca mais)
    expect(screen.queryByRole('button', { name: 'Ir para orçamento ABC1D23' })).toBeNull();
    expect(JSON.parse(localStorage.getItem('orcamentos_historico_v1') ?? '[]')[0].lembreteEm).toBeNull();
  });

  it('relógio: X dispensa o aviso do flyer sem apagar o lembrete', () => {    localStorage.setItem(
      'flyer_historico_v1',
      JSON.stringify([
        { id: 'f1', criadoEm: '24/09/2026 12:30:00', contato: 'MARIA', medida: '205/55R16', inputText: 'a\nb', numMarcas: 1, lembreteEm: '2020-01-01T09:00' },
      ]),
    );
    render(<App />);
    fireEvent.click(screen.getByText('Tire Flyer'));
    expect(screen.getAllByRole('button', { name: 'Ir para orçamento MARIA' })).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Dispensar lembretes' }));
    expect(screen.queryByRole('button', { name: 'Ir para orçamento MARIA' })).toBeNull();
    // dispensar esconde; o lembrete continua salvo
    expect(JSON.parse(localStorage.getItem('flyer_historico_v1') ?? '[]')[0].lembreteEm).toBe('2020-01-01T09:00');
  });

  it('relógio: aviso do flyer abre o histórico na aba Tire Flyer', () => {
    localStorage.removeItem('orcamentos_historico_v1');
    localStorage.removeItem('flyer_historico_v1');
    localStorage.setItem(
      'flyer_historico_v1',
      JSON.stringify([
        { id: 'f1', criadoEm: '24/09/2026 12:30:00', contato: 'MARIA', medida: '205/55R16', inputText: 'a\nb', numMarcas: 1, lembreteEm: '2020-01-01T09:00' },
      ]),
    );
    try {
      render(<App />);
      fireEvent.click(screen.getAllByRole('button', { name: 'Ir para orçamento MARIA' })[1]);
      // trocou para a aba e abriu o histórico com o cartão destacado
      expect(screen.getByText('HISTÓRICO — TIRE FLYER')).toBeTruthy();
      expect(document.querySelector('[data-destaque="1"]')?.textContent).toContain('MARIA');
      expect(screen.queryByRole('button', { name: 'Ir para orçamento MARIA' })).toBeNull();
    } finally {
      localStorage.removeItem('flyer_historico_v1');
    }
  });

  it('sino: cria lembrete rápido e lista junto dos históricos', () => {
    localStorage.removeItem('lembretes_rapidos_v1');
    localStorage.removeItem('flyer_historico_v1');
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([{ ...registro('1', 'ABC1D23', '24/09/2026 12:30:00'), lembreteEm: '2999-01-01T09:00' }]),
    );
    try {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Lembretes' }));
      fireEvent.change(screen.getByLabelText('Texto do lembrete'), { target: { value: 'Ligar cliente' } });
      fireEvent.change(screen.getByLabelText('Data e hora do lembrete rápido'), {
        target: { value: '2999-02-01T10:00' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Salvar lembrete' }));

      const rapidos = JSON.parse(localStorage.getItem('lembretes_rapidos_v1') ?? '[]');
      expect(rapidos).toHaveLength(1);
      expect(rapidos[0].texto).toBe('Ligar cliente');
      // lista o rápido + o do histórico
      expect(screen.getByText('Ligar cliente')).toBeTruthy();
      expect(screen.getByText('ABC1D23')).toBeTruthy();

      // excluir o rápido tira da lista
      fireEvent.click(screen.getByRole('button', { name: 'Excluir lembrete Ligar cliente' }));
      expect(JSON.parse(localStorage.getItem('lembretes_rapidos_v1') ?? '[]')).toHaveLength(0);
      expect(screen.queryByText('Ligar cliente')).toBeNull();
    } finally {
      localStorage.removeItem('lembretes_rapidos_v1');
      localStorage.removeItem('orcamentos_historico_v1');
    }
  });

  it('sino: fechar limpa o que estava escrevendo', () => {
    localStorage.removeItem('lembretes_rapidos_v1');
    try {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: 'Lembretes' }));
      fireEvent.change(screen.getByLabelText('Texto do lembrete'), { target: { value: 'RASCUNHO' } });
      fireEvent.change(screen.getByLabelText('Data e hora do lembrete rápido'), {
        target: { value: '2999-02-01T10:00' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Lembretes' }));
      expect(screen.queryByText('Todos os lembretes (0)')).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'Lembretes' }));
      expect((screen.getByLabelText('Texto do lembrete') as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText('Data e hora do lembrete rápido') as HTMLInputElement).value).toBe('');
      expect(JSON.parse(localStorage.getItem('lembretes_rapidos_v1') ?? '[]')).toHaveLength(0);
    } finally {
      localStorage.removeItem('lembretes_rapidos_v1');
    }
  });

  it('sino: rápido vencido pisca e o clique conclui', () => {
    localStorage.removeItem('orcamentos_historico_v1');
    localStorage.removeItem('flyer_historico_v1');
    localStorage.setItem(
      'lembretes_rapidos_v1',
      JSON.stringify([{ id: 'q1', texto: 'Buscar peças', quando: '2020-01-01T09:00', criadoEm: 'x' }]),
    );
    try {
      render(<App />);
      expect(screen.getAllByRole('button', { name: 'Concluir lembrete Buscar peças' })).toHaveLength(2);
      fireEvent.click(screen.getAllByRole('button', { name: 'Concluir lembrete Buscar peças' })[1]);
      expect(screen.queryByRole('button', { name: 'Concluir lembrete Buscar peças' })).toBeNull();
      expect(JSON.parse(localStorage.getItem('lembretes_rapidos_v1') ?? '[]')).toHaveLength(0);
    } finally {
      localStorage.removeItem('lembretes_rapidos_v1');
    }
  });

  it('segundo anexo vence o primeiro no play (sem precisar do Usar)', async () => {
    localStorage.removeItem('orcamentos_historico_v1');
    try {
      const { container } = render(<App />);
      const input = container.querySelector('input[accept=".pdf,.png,.jpg,.jpeg"]') as HTMLInputElement;
      const pdf = (nome: string) => new File(['x'], nome, { type: 'application/pdf' });

      // 1º anexo + Usar + play = PRIMEIRO
      fireEvent.change(input, { target: { files: [pdf('primeiro.pdf')] } });
      await screen.findByDisplayValue('01 PRIMEIRO');
      fireEvent.click(screen.getByRole('button', { name: 'Usar no orçamento manual' }));
      fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
      expect(screen.getByText('PRIMEIRO')).toBeTruthy();

      // 2º anexo + play direto (sem Usar) = SEGUNDO
      fireEvent.change(input, { target: { files: [pdf('segundo.pdf')] } });
      await screen.findByDisplayValue('02 SEGUNDO');
      fireEvent.click(screen.getByRole('button', { name: /Processar Tudo/i }));
      expect(screen.getByText('SEGUNDO')).toBeTruthy();

      const salvos = JSON.parse(localStorage.getItem('orcamentos_historico_v1') ?? '[]');
      expect(salvos).toHaveLength(2);
      expect(salvos[0].descReparo).toContain('SEGUNDO');
    } finally {
      localStorage.removeItem('orcamentos_historico_v1');
    }
  });
});
