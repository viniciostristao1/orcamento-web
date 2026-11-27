// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { RASCUNHO_KEY } from '../src/utils/rascunho';
import { ULTIMO_KEY } from '../src/utils/ultimoOrcamento';

const HIST_KEY = 'orcamentos_historico_v1';

const SETE_LINHAS = [
  '1\tFiltro de ar\tR$ 195,90',
  '2\tLimpeza de bicos\tR$ 725,95',
  '3\tRetifica discos\tR$ 150,00',
  '4\tPastilhas D.D\tR$ 1.600,50',
  '5\tOxi\tR$ 247,68',
  '6\tBorracha do limpador\tR$ 240,90',
  '7\t2 rolamentos diant\tR$ 5.419,12',
].join('\n');

// PDF mockado (sem worker): layout Toyota antigo com 1 item.
vi.mock('../src/sistema/pdf', () => ({
  extrairTextoPdf: async () => ({
    paginas: 1,
    texto: [
      'ORÇAMENTO Nº 5566',
      'CLIENTE: FULANO DE TAL',
      'It Tipo Codigo',
      '1 Peca P1 1 10,00',
      'Fechamento',
      'Reclamacoes Originais',
      '01 TESTE NORMAL',
      'Sugestao',
    ].join('\n'),
  }),
}));

// O jsdom não implementa scrollIntoView, mas o app chama num setTimeout.
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});

afterEach(() => {
  cleanup();
  localStorage.removeItem(RASCUNHO_KEY);
  localStorage.removeItem(ULTIMO_KEY);
  localStorage.removeItem(HIST_KEY);
  vi.unstubAllGlobals();
});

const colarAdicional = (texto: string) => {
  fireEvent.change(screen.getByLabelText('Itens do adicional'), { target: { value: texto } });
};

const gerar = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Gerar orçamento' }));
};

const doc = () => within(document.querySelector('#printable-quote') as HTMLElement);

describe('CLAUDE — card único no lugar dos manuais', () => {
  it('mostra CLAUDE e remove DESCRIÇÃO MANUAL', () => {
    render(<App />);
    expect(screen.getByText('CLAUDE')).toBeTruthy();
    expect(screen.queryByText('DESCRIÇÃO MANUAL')).toBeNull();
    expect(screen.queryByText('PEÇAS MANUAL')).toBeNull();
    expect(screen.queryByLabelText('Itens da revisão aprovada')).toBeNull();
  });

  it('resumo vivo: conta e soma as 7 linhas do exemplo', () => {
    render(<App />);
    colarAdicional(SETE_LINHAS);
    expect(screen.getByText('7 itens · R$ 8.580,05')).toBeTruthy();
  });

  it('lista inteira no campo A + revisão zerada: tudo vai ao adicional (total 8.580,05)', () => {
    render(<App />);
    colarAdicional(SETE_LINHAS);
    const rev = screen.getAllByPlaceholderText('0,00')[0] as HTMLInputElement;
    fireEvent.change(rev, { target: { value: '0,00' } });
    fireEvent.blur(rev);
    gerar();
    // Total Revisão NÃO foi alterado (campo B vazio): continua 0,00.
    expect((screen.getAllByPlaceholderText('0,00')[0] as HTMLInputElement).value).toBe('0,00');
    expect(doc().getAllByText('8.580,05').length).toBeGreaterThan(0);
    expect(doc().getByText('2 ROLAMENTOS DIANT')).toBeTruthy();
    // OXI fica literal (sem expandir para a higienização).
    expect(doc().getByText('OXI')).toBeTruthy();
    const salvos = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    expect(salvos).toHaveLength(1);
    expect(salvos[0].listaAdicional).toBe(SETE_LINHAS);
    expect(salvos[0].oxiLiteral).toBe(true);
    expect(salvos[0].numItens).toBe(7);
  });

  it('Total Revisão manual não muda ao gerar pela lista (tudo vai ao adicional)', () => {
    render(<App />);
    const rev = screen.getAllByPlaceholderText('0,00')[0] as HTMLInputElement;
    fireEvent.change(rev, { target: { value: '500,00' } });
    fireEvent.blur(rev);
    colarAdicional(SETE_LINHAS);
    gerar();
    // O campo continua como digitado; o doc usa a revisão manual + adicional.
    expect((screen.getAllByPlaceholderText('0,00')[0] as HTMLInputElement).value).toBe('500,00');
    expect(doc().getAllByText('500,00').length).toBeGreaterThan(0);
    expect(doc().getAllByText('8.580,05').length).toBeGreaterThan(0);
    expect(doc().getAllByText('9.080,05').length).toBeGreaterThan(0);
  });

  it('linha inválida: pede confirmação; sem confirmar não gera', () => {
    const confirms: string[] = [];
    vi.stubGlobal('confirm', (m: string) => {
      confirms.push(m);
      return false;
    });
    render(<App />);
    colarAdicional('Filtro de ar R$ 100,00\nSó texto sem valor');
    expect(screen.getByText(/Linha 2: sem valor legível/)).toBeTruthy();
    gerar();
    expect(confirms).toHaveLength(1);
    expect(confirms[0]).toContain('Linha 2');
    expect(document.querySelector('#printable-quote')).toBeNull();
  });

  it('linha inválida: confirmando, gera só com as válidas', () => {
    vi.stubGlobal('confirm', () => true);
    render(<App />);
    colarAdicional('Filtro de ar R$ 100,00\nSó texto sem valor');
    gerar();
    expect(doc().getByText('FILTRO DE AR')).toBeTruthy();
    expect(doc().getAllByText('100,00').length).toBeGreaterThan(0);
  });
});

describe('CLAUDE — relação com o manual e com o histórico', () => {
  it('GERAR com manual vazio em tela preenche o registro aberto (sem duplicar)', () => {
    render(<App />);
    // sem doc há dois ("CLAUDE" + estado vazio): o do header vem antes no DOM
    fireEvent.click(screen.getAllByRole('button', { name: 'Novo orçamento manual' })[0]);
    colarAdicional('Filtro\tR$ 10,00');
    gerar();
    const salvos = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    expect(salvos).toHaveLength(1);
    expect(salvos[0].manual).toBe(true);
    expect(salvos[0].descReparo).toBe('01 FILTRO');
  });

  it('GERAR com conteúdo em tela cria registro novo', () => {
    render(<App />);
    colarAdicional('Filtro\tR$ 10,00');
    gerar();
    colarAdicional('Filtro\tR$ 10,00\nPastilha\tR$ 20,00');
    gerar();
    const salvos = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    expect(salvos).toHaveLength(2);
  });

  it('transferência do SistemaCard preenche a lista A (convertida)', async () => {
    render(<App />);
    const input = screen.getAllByRole('button', { name: 'Novo arquivo' })[0];
    const fileInput = input.nextElementSibling as HTMLInputElement;
    const arquivo = new File(['x'], 'orc.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', { value: [arquivo] });
    fireEvent.change(fileInput);
    const usar = screen.getByRole('button', { name: 'Usar no orçamento manual' });
    await waitFor(() => expect((usar as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(usar);
    expect((screen.getByLabelText('Itens do adicional') as HTMLTextAreaElement).value).toContain('TESTE NORMAL');
  });

  it('rascunho antigo (bruto) migra para a lista ao abrir', () => {
    localStorage.setItem(
      RASCUNHO_KEY,
      JSON.stringify({
        descReparo: '01 OXI',
        orcamentoRaw: '1 Serviço X 1 10,00',
        ajustesManuais: '',
        revAprovadaInput: '0,00',
        revPecasInput: '0,00',
        desconto: 5,
        parcelas: 6,
        placa: '',
        telefone: '',
        numero: '',
        dataDoc: '',
        nome: '',
        chassi: '',
      }),
    );
    render(<App />);
    expect((screen.getByLabelText('Itens do adicional') as HTMLTextAreaElement).value).toBe(
      'HIGIENIZAÇÃO DO AR CONDICIONADO\tR$ 10,00',
    );
  });

  it('rascunho com listaRevisao antiga não quebra e o dado passa intacto', () => {
    localStorage.setItem(
      RASCUNHO_KEY,
      JSON.stringify({
        listaAdicional: 'Filtro\tR$ 10,00',
        listaRevisao: 'Revisao\tR$ 20,00',
        ajustesManuais: '',
        revAprovadaInput: '0,00',
        revPecasInput: '0,00',
        desconto: 5,
        parcelas: 6,
        placa: '',
        telefone: '',
        numero: '',
        dataDoc: '',
        nome: '',
        chassi: '',
      }),
    );
    render(<App />);
    // sem campo B na tela, mas a lista A abre normal
    expect((screen.getByLabelText('Itens do adicional') as HTMLTextAreaElement).value).toBe(
      'Filtro\tR$ 10,00',
    );
    expect(screen.queryByLabelText('Itens da revisão aprovada')).toBeNull();
    // digitar salva o rascunho sem apagar o campo antigo
    fireEvent.change(screen.getByLabelText('Itens do adicional'), {
      target: { value: 'Filtro\tR$ 10,00\nPastilha\tR$ 5,00' },
    });
    expect(JSON.parse(localStorage.getItem(RASCUNHO_KEY) ?? '{}').listaRevisao).toBe(
      'Revisao\tR$ 20,00',
    );
  });

  it('registro com listaRevisao abre normal e o voto preserva o campo', () => {
    localStorage.setItem(
      HIST_KEY,
      JSON.stringify([
        {
          id: 'r1',
          criadoEm: '26/11/2026, 10:00:00',
          descReparo: '01 FILTRO',
          orcamentoRaw: '1 Serviço GERADO FILTRO 10,00',
          listaAdicional: 'Filtro\tR$ 10,00',
          listaRevisao: 'Revisao\tR$ 20,00',
          ajustesManuais: '',
          revAprovadaInput: '0,00',
          revPecasInput: '0,00',
          desconto: 5,
          parcelas: 6,
          totalPecasGeral: 0,
          totalServicosGeral: 10,
          valorDescontoTotal: 0,
          valorLiquidoFinal: 10,
          totalGeral: 10,
          numItens: 1,
        },
      ]),
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir orçamento' }));
    // lista A preenchida, sem campo B, documento na tela
    expect((screen.getByLabelText('Itens do adicional') as HTMLTextAreaElement).value).toBe(
      'Filtro\tR$ 10,00',
    );
    expect(document.querySelector('#printable-quote')).toBeTruthy();
    // votar preserva o campo antigo no registro (ignora na tela, não apaga)
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como aprovado' }));
    const salvos = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    expect(salvos).toHaveLength(1);
    expect(salvos[0].listaRevisao).toBe('Revisao\tR$ 20,00');
  });
});

describe('CLAUDE — telefone espelhado e borracha só na lista', () => {
  it('digitar no CLAUDE atualiza o Telefone do sistema, e vice-versa', () => {
    render(<App />);
    const campoClaude = screen.getByLabelText('Telefone do cliente (WhatsApp)') as HTMLInputElement;
    const campoSistema = screen.getByPlaceholderText('Ex.: 51 99999-9999') as HTMLInputElement;
    // CLAUDE → sistema
    fireEvent.change(campoClaude, { target: { value: '(51) 99999-9999' } });
    expect(campoSistema.value).toBe('(51) 99999-9999');
    // sistema → CLAUDE
    fireEvent.change(campoSistema, { target: { value: '51988887777' } });
    expect(campoClaude.value).toBe('51988887777');
    // o botão do WhatsApp continua usando esse número
    colarAdicional('Filtro\tR$ 10,00');
    gerar();
    const zap = screen.getByRole('button', { name: 'Conversar no WhatsApp' }) as HTMLButtonElement;
    expect(zap.disabled).toBe(false);
    expect(zap.title).toContain('51988887777');
  });

  it('registro ANTIGO (sem flag, texto já expandido) reabre e recalcula idêntico', () => {
    // Registro gerado antes da regra do OXI literal: desc + prévia expandidos, sem flag.
    localStorage.setItem(
      HIST_KEY,
      JSON.stringify([
        {
          id: 'r-antigo',
          criadoEm: '20/11/2026, 10:00:00',
          descReparo: '05 HIGIENIZAÇÃO DO AR CONDICIONADO',
          orcamentoRaw: '5 Serviço X 1 247,68',
          ajustesManuais: '',
          revAprovadaInput: '0,00',
          revPecasInput: '0,00',
          desconto: 0,
          parcelas: 6,
          totalPecasGeral: 0,
          totalServicosGeral: 247.68,
          valorDescontoTotal: 0,
          valorLiquidoFinal: 247.68,
          totalGeral: 247.68,
          numItens: 1,
          previa: {
            itens: [{ id: 5, descricao: 'HIGIENIZAÇÃO DO AR CONDICIONADO', valor: 247.68, excluido: false }],
            revisaoAprovada: 0,
            original: null,
          },
        },
      ]),
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir orçamento' }));
    // Reabre com o texto expandido (nada muda).
    expect(screen.getByText('HIGIENIZAÇÃO DO AR CONDICIONADO')).toBeTruthy();
    expect(screen.queryByText('OXI')).toBeNull();
    // V/X recalculam igual (soma e total intactos).
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como não aprovado' }));
    const salvos = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    expect(salvos).toHaveLength(1);
    expect(salvos[0].aprovacao).toBe('naoAprovado');
    expect(salvos[0].naoRealizados).toEqual([5]);
    expect(salvos[0].totalGeral).toBeCloseTo(247.68, 2);
    // Ver itens mostra a linha expandida com o valor.
    fireEvent.click(screen.getByRole('button', { name: 'Histórico' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver itens do orçamento' }));
    expect(document.querySelector('[data-janela-itens="1"]')?.textContent).toContain('HIGIENIZAÇÃO DO AR CONDICIONADO');
    expect(document.querySelector('[data-janela-itens="1"]')?.textContent).toContain('247,68');
  });

  it('registro NOVO com "Oxi" mantém OXI literal no documento e no histórico', () => {
    render(<App />);
    colarAdicional('Oxi\tR$ 247,68');
    gerar();
    expect(doc().getByText('OXI')).toBeTruthy();
    expect(doc().queryByText('HIGIENIZAÇÃO DO AR CONDICIONADO')).toBeNull();
    const salvos = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    expect(salvos[0].oxiLiteral).toBe(true);
    expect(salvos[0].descReparo).toBe('01 OXI');
  });

  it('botão + do CLAUDE limpa lista, revisão e WhatsApp (e nada mais)', () => {
    render(<App />);
    colarAdicional('Filtro\tR$ 10,00');
    fireEvent.change(screen.getByLabelText('Telefone do cliente (WhatsApp)'), {
      target: { value: '(51) 99999-9999' },
    });
    const rev = screen.getAllByPlaceholderText('0,00')[0] as HTMLInputElement;
    fireEvent.change(rev, { target: { value: '111,00' } });
    fireEvent.blur(rev);
    fireEvent.change(screen.getByPlaceholderText('Ex.: JOÃO DA SILVA'), { target: { value: 'JOAO' } });
    fireEvent.click(screen.getByRole('button', { name: 'Limpar lista, revisão e WhatsApp' }));
    expect((screen.getByLabelText('Itens do adicional') as HTMLTextAreaElement).value).toBe('');
    expect((screen.getByLabelText('Revisão aprovada (R$)') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Telefone do cliente (WhatsApp)') as HTMLInputElement).value).toBe('');
    // Nome (e o resto) ficam.
    expect((screen.getByPlaceholderText('Ex.: JOÃO DA SILVA') as HTMLInputElement).value).toBe('JOAO');
  });
});
