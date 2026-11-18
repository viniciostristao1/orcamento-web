// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { RASCUNHO_KEY } from '../src/utils/rascunho';
import { ULTIMO_KEY } from '../src/utils/ultimoOrcamento';

// PDF mockado (sem worker): "complementar" cai no layout novo (4376,
// sem telefone/placa no documento), o resto no Toyota antigo (sem contato).
vi.mock('../src/sistema/pdf', () => ({
  extrairTextoPdf: async (arquivo: File) => ({
    paginas: 1,
    texto: arquivo.name.includes('complementar')
      ? [
          'TOYOTA WEIAND LAJEADO',
          'ORÇAMENTO DE SERVIÇOS COMPLEMENTARES',
          'Nº: 19384739535',
          'Nome Cliente: SALETE POZZEBON SCHOTT',
          'Placa: KM: 4375 Data de Criação: 18/11/2026 09:07:07',
          'Serviços contratados inicialmente e aprovados pelo orçamento inicial R$ 1.065,45',
          'Serviços Complementares Orçados',
          'Oxi, granada e via tanque',
          'Código Peça Descrição Qtd Preço Unit Estoque Total Peças',
          'CARE010701|1 OXY-SANITIZATION APP 1 R$ 115,00 Sim R$ 115,00',
          'Código MO Descrição Tempo MO Custo MO',
          'HIGMOTO HIGIENIZACAO AR CONDICIONADO 0.05/h R$ 22,95',
          'Total Peças: R$ 224,73 | Total MO: R$ 22,95 | Total do Serviço: R$ 247,68',
          'VIA TANQUE',
          'Código Peça Descrição Qtd Preço Unit Estoque Total Peças',
          'CARE042501|1 LIMPADOR SISTEMA GASOLINA TUNAP 1 R$ 209,89 Sim R$ 209,89',
          'Código MO Descrição Tempo MO Custo MO',
          'REQ REQUISICAO DE PECAS 0.00/h R$ 0,00',
          'Total Peças: R$ 209,89',
        ].join('\n')
      : [
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

afterEach(() => {
  cleanup();
  localStorage.removeItem(RASCUNHO_KEY);
  localStorage.removeItem(ULTIMO_KEY);
});

/** Dispara a escolha de arquivo no input escondido ao lado do botão. */
const anexar = (nomeBotao: string, nomeArquivo: string) => {
  const btn = screen.getByRole('button', { name: nomeBotao });
  const input = btn.nextElementSibling as HTMLInputElement;
  expect(input?.tagName).toBe('INPUT');
  const arquivo = new File(['x'], nomeArquivo, { type: 'application/pdf' });
  Object.defineProperty(input, 'files', { value: [arquivo] });
  fireEvent.change(input);
};

const campoTelefone = () =>
  screen.getByPlaceholderText('Ex.: 51 99999-9999') as HTMLInputElement;
const campoPlaca = () =>
  screen.getByPlaceholderText('Ex.: ABC1D23') as HTMLInputElement;

describe('SistemaCard — contato do anexo e ordem dos botões', () => {
  it('complementar (novo layout) vem à esquerda do layout antigo', () => {
    render(<App />);
    const btnCompl = screen.getByRole('button', {
      name: 'Anexar complementar (novo layout)',
    });
    const btnAntigo = screen.getByRole('button', { name: 'Novo arquivo' });
    expect(
      Boolean(
        btnCompl.compareDocumentPosition(btnAntigo) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);
  });

  it('anexo complementar limpa telefone/placa antigos e preenche os do documento', async () => {
    render(<App />);
    // Estado "sujo" de um orçamento anterior (o bug: vazava para o novo).
    fireEvent.change(campoTelefone(), { target: { value: '519984579790' } });
    fireEvent.change(campoPlaca(), { target: { value: 'TQW0F85' } });
    expect(campoTelefone().value).toBe('519984579790');

    anexar('Anexar complementar (novo layout)', 'orc-complementar.pdf');

    // 4376 não tem telefone/placa → os campos zeram (não herdam o anterior).
    await waitFor(() => expect(campoTelefone().value).toBe(''));
    expect(campoPlaca().value).toBe('');
    // Revisão inicial do documento preenche o Total Revisão.
    const revisoes = screen.getAllByPlaceholderText(
      '0,00',
    ) as HTMLInputElement[];
    expect(revisoes[0].value).toBe('1.065,45');
    // Os 2 itens (inclui o VIA TANQUE sem "Total do Serviço").
    const revDados = screen.getByLabelText(
      'Dados extraídos para revisão',
    ) as HTMLTextAreaElement;
    expect(revDados.value.split('\n')).toHaveLength(2);
  });

  it('anexo do layout antigo também limpa o contato anterior', async () => {
    render(<App />);
    fireEvent.change(campoTelefone(), { target: { value: '519984579790' } });
    fireEvent.change(campoPlaca(), { target: { value: 'TQW0F85' } });

    anexar('Novo arquivo', 'orc-antigo.pdf');

    await waitFor(() => expect(campoTelefone().value).toBe(''));
    expect(campoPlaca().value).toBe('');
    const revDados = screen.getByLabelText(
      'Dados extraídos para revisão',
    ) as HTMLTextAreaElement;
    expect(revDados.value).toContain('1 Peca P1 1 10,00');
  });
});
