// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  type OrcamentoSalvo,
  adicionarAoHistorico,
  contarItensDaDescricao,
  filtrarHistorico,
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

  it('placa: mesma placa substitui; placa diferente vira outro registro', () => {
    adicionarAoHistorico({ ...base, placa: 'ABC1D23' });
    adicionarAoHistorico({ ...base, placa: 'ABC1D23' });
    expect(listarHistorico().length).toBe(1);
    adicionarAoHistorico({ ...base, placa: 'XYZ9A87' });
    const lista = listarHistorico();
    expect(lista.length).toBe(2);
    expect(lista[0].placa).toBe('XYZ9A87');
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
