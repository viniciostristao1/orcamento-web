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
const APROVADOS_4 = SETE_LINHAS.split('\n').slice(0, 4).join('\n');
const REPROVADOS_3 = SETE_LINHAS.split('\n').slice(4).join('\n');

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

const colarRevisao = (texto: string) => {
  fireEvent.change(screen.getByLabelText('Itens da revisão aprovada'), { target: { value: texto } });
};

const gerar = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Gerar orçamento' }));
};

const doc = () => within(document.querySelector('#printable-quote') as HTMLElement);

describe('COLAR ITENS — card novo no lugar dos manuais', () => {
  it('mostra COLAR ITENS e remove DESCRIÇÃO MANUAL', () => {
    render(<App />);
    expect(screen.getByText('COLAR ITENS')).toBeTruthy();
    expect(screen.queryByText('DESCRIÇÃO MANUAL')).toBeNull();
    expect(screen.queryByText('PEÇAS MANUAL')).toBeNull();
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
    expect(doc().getByText('HIGIENIZAÇÃO DO AR CONDICIONADO')).toBeTruthy();
    const salvos = JSON.parse(localStorage.getItem(HIST_KEY) ?? '[]');
    expect(salvos).toHaveLength(1);
    expect(salvos[0].listaAdicional).toBe(SETE_LINHAS);
    expect(salvos[0].numItens).toBe(7);
  });

  it('A=reprovados + B=aprovados: revisão 2.672,35, adicional 5.907,70, total 8.580,05', () => {
    render(<App />);
    colarAdicional(REPROVADOS_3);
    colarRevisao(APROVADOS_4);
    // A soma de B preenche o Total Revisão automaticamente.
    const rev = screen.getAllByPlaceholderText('0,00')[0] as HTMLInputElement;
    expect(rev.value).toBe('2.672,35');
    gerar();
    expect(doc().getAllByText('5.907,70').length).toBeGreaterThan(0);
    expect(doc().getAllByText('8.580,05').length).toBeGreaterThan(0);
    expect(doc().getAllByText('2.672,35').length).toBeGreaterThan(0);
  });

  it('campo B vazio não altera o Total Revisão (vai tudo ao adicional)', () => {
    render(<App />);
    const rev = screen.getAllByPlaceholderText('0,00')[0] as HTMLInputElement;
    fireEvent.change(rev, { target: { value: '1.000,00' } });
    fireEvent.blur(rev);
    colarAdicional(SETE_LINHAS);
    gerar();
    expect((screen.getAllByPlaceholderText('0,00')[0] as HTMLInputElement).value).toBe('1.000,00');
    expect(doc().getAllByText('8.580,05').length).toBeGreaterThan(0); // 1000 + 8580,05
    expect(doc().getAllByText('9.580,05').length).toBeGreaterThan(0);
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
    expect(confirms[0]).toContain('linha 2');
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

describe('COLAR ITENS — relação com o "+" e com o histórico', () => {
  it('GERAR com manual vazio em tela preenche o registro aberto (sem duplicar)', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Novo orçamento manual' }));
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
});
