// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  adicionarAoFlyerHistorico,
  filtrarFlyerHistorico,
  limparFlyerHistorico,
  listarFlyerHistorico,
  removerDoFlyerHistorico,
} from '../src/tire/utils/historicoFlyer';

const base = {
  contato: 'JOÃO ABC1D23',
  medida: '265/60R18',
  inputText: '265/60R18\tMARCA\tÀ PRAZO\n1\tFirestone\tR$ 1.000,00',
  numPneus: 1,
};

describe('histórico do Tire Flyer (localStorage)', () => {
  beforeEach(() => limparFlyerHistorico());

  it('salva, lista e remove', () => {
    adicionarAoFlyerHistorico(base);
    const lista = listarFlyerHistorico();
    expect(lista).toHaveLength(1);
    expect(lista[0].contato).toBe('JOÃO ABC1D23');
    expect(lista[0].numPneus).toBe(1);
    expect(removerDoFlyerHistorico(lista[0].id)).toEqual([]);
  });

  it('não duplica quando a tabela e o contato são os mesmos', () => {
    adicionarAoFlyerHistorico(base);
    adicionarAoFlyerHistorico(base);
    expect(listarFlyerHistorico()).toHaveLength(1);
    // contato diferente = novo registro
    adicionarAoFlyerHistorico({ ...base, contato: 'MARIA' });
    expect(listarFlyerHistorico()).toHaveLength(2);
  });

  it('filtra por contato, data ou medida', () => {
    adicionarAoFlyerHistorico(base);
    adicionarAoFlyerHistorico({ ...base, contato: 'MARIA', inputText: 'outra', medida: '205/55R16' });
    const lista = listarFlyerHistorico();

    expect(filtrarFlyerHistorico(lista, 'joao')).toHaveLength(1);
    expect(filtrarFlyerHistorico(lista, 'abc-1d23')).toHaveLength(1);
    expect(filtrarFlyerHistorico(lista, '205/55')).toHaveLength(1);
    expect(filtrarFlyerHistorico(lista, '265/60R18')).toHaveLength(1);
    expect(filtrarFlyerHistorico(lista, '')).toHaveLength(2);
    expect(filtrarFlyerHistorico(lista, 'zzz')).toHaveLength(0);
  });
});
