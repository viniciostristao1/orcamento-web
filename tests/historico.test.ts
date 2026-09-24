// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  adicionarAoHistorico,
  contarItensDaDescricao,
  importarBackup,
  limparHistorico,
  listarHistorico,
  removerDoHistorico,
} from '../src/utils/historico';

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
});
