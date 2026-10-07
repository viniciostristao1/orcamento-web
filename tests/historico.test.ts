// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  type OrcamentoSalvo,
  adicionarAoHistorico,
  atualizarCorHistorico,
  contarItensDaDescricao,
  destacarTermo,
  filtrarHistorico,
  filtrarPorAba,
  importarBackup,
  limparHistorico,
  listarHistorico,
  removerDoHistorico,
  temNaoRealizados,
} from '../src/utils/historico';
import { filtrarPorCor } from '../src/utils/corCliente';

const base = {
  descReparo: '1 X',
  orcamentoRaw: '1 Peça X 1 10,00',
  ajustesManuais: '',
  revAprovadaInput: '100,00',
  revPecasInput: '50,00',
  desconto: 5,
  parcelas: 3,
  totalPecasGeral: 60,
  totalServicosGeral: 50,
  valorDescontoTotal: 3,
  valorLiquidoFinal: 107,
  totalGeral: 110,
};

describe('histórico (localStorage)', () => {
  beforeEach(() => limparHistorico());

  it('salva, lista e remove', () => {
    expect(listarHistorico()).toEqual([]);
    adicionarAoHistorico(base);
    const lista = listarHistorico();
    expect(lista.length).toBe(1);
    expect(lista[0].revAprovadaInput).toBe('100,00');
    const depois = removerDoHistorico(lista[0].id);
    expect(depois).toEqual([]);
  });

  it('filtra por item do orçamento (ex.: "freio")', () => {
    const lista: OrcamentoSalvo[] = [
      { ...base, id: 'a', criadoEm: '24/09/2026 10:00:00', descReparo: '01 PASTILHAS DE FREIO' },
      { ...base, id: 'b', criadoEm: '24/09/2026 11:00:00', descReparo: '01 BORRACHA DAS PALHETAS' },
    ];
    expect(filtrarHistorico(lista, 'freio')).toHaveLength(1);
    expect(filtrarHistorico(lista, 'FREIO')).toHaveLength(1);
    expect(filtrarHistorico(lista, 'pastilhas')).toHaveLength(1);
    expect(filtrarHistorico(lista, 'inexistente')).toHaveLength(0);
  });

  it('filtra por aba (Todos / Aprovados / Não Aprovados)', () => {
    adicionarAoHistorico({ ...base, naoRealizados: [1] }); // sem marca: cai em Não Aprovados
    adicionarAoHistorico({ ...base, desconto: 10 }); // comuns não entram nas abas
    const lista = listarHistorico();
    const comDesmarcados = lista[1];
    expect(temNaoRealizados(comDesmarcados)).toBe(true);
    expect(filtrarPorAba(lista, 'todos')).toHaveLength(2);
    expect(filtrarPorAba(lista, 'aprovados')).toHaveLength(0);
    expect(filtrarPorAba(lista, 'naoAprovados')).toEqual([comDesmarcados]);
  });

  it('abas de aprovação: V puro = Aprovados, V com desmarque = Não Aprovados', () => {
    localStorage.clear();
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([
        { ...base, id: 'ra', criadoEm: 'x', aprovacao: 'aprovado' },
        { ...base, id: 'rb', criadoEm: 'x', aprovacao: 'aprovado', naoRealizados: [1] },
        { ...base, id: 'rc', criadoEm: 'x', aprovacao: 'naoAprovado', naoRealizados: [1, 2] },
        { ...base, id: 'rd', criadoEm: 'x' },
      ]),
    );
    const lista = listarHistorico();
    expect(filtrarPorAba(lista, 'aprovados').map((r) => r.id)).toEqual(['ra']);
    expect(filtrarPorAba(lista, 'naoAprovados').map((r) => r.id)).toEqual(['rb', 'rc']);
    expect(filtrarPorAba(lista, 'todos')).toHaveLength(4);
  });

  it('não duplica quando o mais recente tem os mesmos dados', () => {
    adicionarAoHistorico(base);
    adicionarAoHistorico(base);
    adicionarAoHistorico({ ...base, desconto: 10 });
    expect(listarHistorico().length).toBe(2); // o 1º repetido não duplicou
  });

  it('mais recente primeiro', () => {
    adicionarAoHistorico(base);
    adicionarAoHistorico({ ...base, descReparo: '2 Y' });
    const lista = listarHistorico();
    expect(lista[0].descReparo).toBe('2 Y');
  });

  it('filtra por data ou placa (ignora separadores)', () => {
    const a: OrcamentoSalvo = { ...base, id: '1', criadoEm: '24/09/2026 12:30:00', placa: 'ABC1D23' };
    const b: OrcamentoSalvo = { ...base, id: '2', criadoEm: '01/08/2026 09:00:00', placa: 'XYZ9A87' };
    const lista = [a, b];
    expect(filtrarHistorico(lista, '')).toEqual(lista); // vazio = tudo
    expect(filtrarHistorico(lista, 'abc-1d23').map((r) => r.id)).toEqual(['1']); // placa sem separador
    expect(filtrarHistorico(lista, '24/09').map((r) => r.id)).toEqual(['1']); // data BR
    expect(filtrarHistorico(lista, '2026').length).toBe(2); // ano
    expect(filtrarHistorico(lista, 'zzz')).toEqual([]); // nada
  });

  it('filtra por telefone (ignora máscara: espaços, traços, parênteses)', () => {
    const a: OrcamentoSalvo = { ...base, id: '1', criadoEm: '24/09/2026 12:30:00', telefone: '51 99999-9999' };
    const b: OrcamentoSalvo = { ...base, id: '2', criadoEm: '01/08/2026 09:00:00', telefone: '51 3333-4444' };
    const lista = [a, b];
    expect(filtrarHistorico(lista, '99999-9999').map((r) => r.id)).toEqual(['1']);
    expect(filtrarHistorico(lista, '(51) 33334444').map((r) => r.id)).toEqual(['2']);
    expect(filtrarHistorico(lista, '51').length).toBe(2);
  });

  it('telefone: mesmo número com máscara diferente substitui; número diferente vira outro registro', () => {
    adicionarAoHistorico({ ...base, telefone: '51 99999-9999' });
    adicionarAoHistorico({ ...base, telefone: '(51) 99999-9999' });
    expect(listarHistorico().length).toBe(1);
    adicionarAoHistorico({ ...base, telefone: '51 3333-4444' });
    expect(listarHistorico().length).toBe(2);
  });

  it('placa: mesma placa substitui; placa diferente vira outro registro', () => {
    adicionarAoHistorico({ ...base, placa: 'ABC1D23' });
    adicionarAoHistorico({ ...base, placa: 'ABC1D23' });
    expect(listarHistorico().length).toBe(1);
    adicionarAoHistorico({ ...base, placa: 'XYZ9A87' });
    const lista = listarHistorico();
    expect(lista.length).toBe(2);
    expect(lista[0].placa).toBe('XYZ9A87');
  });

  it('cor: marca/desmarca e filtra por cor (botões + busca textual)', () => {
    // ids explícitos: dois adicionar() no mesmo milissegundo gerariam o mesmo id
    const a: OrcamentoSalvo = { ...base, id: 'a', criadoEm: '24/09/2026 12:30:00', placa: 'AAA' };
    const b: OrcamentoSalvo = { ...base, id: 'b', criadoEm: '01/08/2026 09:00:00', placa: 'BBB' };
    localStorage.setItem('orcamentos_historico_v1', JSON.stringify([a, b]));
    // marca verde no 1º, vermelho no 2º
    atualizarCorHistorico('a', 'verde');
    atualizarCorHistorico('b', 'vermelho');
    const lista = listarHistorico();
    expect(filtrarPorCor(lista, 'todas')).toHaveLength(2);
    expect(filtrarPorCor(lista, 'verde').map((r) => r.id)).toEqual(['a']);
    expect(filtrarPorCor(lista, 'vermelho').map((r) => r.id)).toEqual(['b']);
    // busca textual também acha pela cor
    expect(filtrarHistorico(lista, 'verde').map((r) => r.id)).toEqual(['a']);
    expect(filtrarHistorico(lista, 'vermelho').map((r) => r.id)).toEqual(['b']);
    expect(filtrarHistorico(lista, 'vermelha').map((r) => r.id)).toEqual(['b']);
    // clicar de novo limpa (volta a sem cor: some dos dois filtros)
    atualizarCorHistorico('a', undefined);
    expect(filtrarPorCor(listarHistorico(), 'verde')).toHaveLength(0);
    expect(filtrarPorCor(listarHistorico(), 'todas')).toHaveLength(2);
  });

  it('cor: reprocessar o mesmo orçamento não apaga a cor marcada', () => {
    adicionarAoHistorico(base);
    const id = listarHistorico()[0].id;
    atualizarCorHistorico(id, 'verde');
    adicionarAoHistorico(base); // mesmos dados → substitui, sem duplicar
    const lista = listarHistorico();
    expect(lista).toHaveLength(1);
    expect(lista[0].cor).toBe('verde');
  });

  it('nome: entra na busca e no anti-duplicado', () => {
    adicionarAoHistorico({ ...base, nome: 'JOAO' });
    adicionarAoHistorico({ ...base, nome: 'JOAO' });
    expect(listarHistorico().length).toBe(1);
    adicionarAoHistorico({ ...base, nome: 'MARIA' });
    const lista = listarHistorico();
    expect(lista.length).toBe(2);
    expect(filtrarHistorico(lista, 'maria').length).toBe(1);
  });

  it('numero/data do documento: entram na busca e no anti-duplicado', () => {    adicionarAoHistorico({ ...base, numeroOrcamento: '4471', dataDoc: '24/09/2026' });
    adicionarAoHistorico({ ...base, numeroOrcamento: '4471', dataDoc: '24/09/2026' });
    expect(listarHistorico().length).toBe(1); // mesmo nº substitui
    adicionarAoHistorico({ ...base, numeroOrcamento: '4472', dataDoc: '24/09/2026' });
    const lista = listarHistorico();
    expect(lista.length).toBe(2);
    expect(filtrarHistorico(lista, '4471').length).toBe(1);
    expect(filtrarHistorico(lista, '4472').length).toBe(1);
  });

  it('conta os itens da descrição (linhas que começam com número)', () => {
    expect(contarItensDaDescricao('01 TR PASTILHAS\n02 OXI\n03 TR BORRACHA')).toBe(3);
    expect(contarItensDaDescricao('sem numero\n\n 4 COM ESPACO')).toBe(1);
    expect(contarItensDaDescricao('')).toBe(0);
  });

  it('importa backup mesclando por id (não duplica)', async () => {
    const existente = listarHistorico();
    const rec = {
      ...base,
      id: '111',
      criadoEm: '01/01/2026 10:00:00',
      descReparo: '3 Z',
    };
    const arquivo = new File([JSON.stringify([rec])], 'backup.json', { type: 'application/json' });
    const n = await importarBackup(arquivo);
    expect(n).toBe(1);
    expect(listarHistorico().length).toBe(existente.length + 1);
    // Importar de novo não duplica (mesmo id).
    const n2 = await importarBackup(new File([JSON.stringify([rec])], 'backup.json', { type: 'application/json' }));
    expect(n2).toBe(0);
  });

  it('destaca o termo no lugar certo mesmo com acentos antes dele', () => {
    // acento ANTES do termo não pode deslocar o grifo
    expect(destacarTermo('ÓLEO VAZANDO', 'vaz')).toEqual(['ÓLEO ', 'VAZ', 'ANDO']);
    // acento DENTRO do termo também casa (sem acento, minúsculo)
    expect(destacarTermo('TROCA FÁCIL', 'facil')).toEqual(['TROCA ', 'FÁCIL', '']);
    expect(destacarTermo('PASTILHA FREIO', 'freio')).toEqual(['PASTILHA ', 'FREIO', '']);
    // regressão "FACIL(FACIL)": termo inteiro, sem acento, no cabeçalho
    expect(destacarTermo('FACILITADA', 'FACILITADA')).toEqual(['', 'FACILITADA', '']);
    expect(destacarTermo('CONDICAO FACILITADA PAGTO', 'facilitada')).toEqual([
      'CONDICAO ',
      'FACILITADA',
      ' PAGTO',
    ]);
    expect(destacarTermo('NADA AQUI', 'freio')).toBeNull();
    expect(destacarTermo('QUALQUER', '')).toBeNull();
  });
});
