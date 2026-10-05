// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  agruparLinhasPdf,
  extrairCabecalho,
  normalizarTextoExtraido,
} from '../src/sistema/extracao';

describe('extração do orçamento do sistema (puro)', () => {
  it('agrupa fragmentos por linha (Y) e respeita hasEOL', () => {
    const itens = [
      { str: 'ORÇAMENTO ', transform: [1, 0, 0, 1, 72, 720] },
      { str: 'Nº 4471', transform: [1, 0, 0, 1, 200, 720] },
      { str: '1 Peça 044650K401 JOGO PASTILHAS 1.245,00', transform: [1, 0, 0, 1, 72, 700] },
    ];
    expect(agruparLinhasPdf(itens)).toBe(
      'ORÇAMENTO Nº 4471\n1 Peça 044650K401 JOGO PASTILHAS 1.245,00',
    );
  });

  it('resolve o "colou tudo numa linha só" (sem hasEOL, só por Y)', () => {
    const itens = [
      { str: 'A', transform: [1, 0, 0, 1, 72, 720] },
      { str: 'B', transform: [1, 0, 0, 1, 90, 720] },
      { str: 'C', transform: [1, 0, 0, 1, 72, 700] },
    ];
    expect(agruparLinhasPdf(itens)).toBe('AB\nC');
  });

  it('normaliza: apara, tira vazias e colapsa espaços', () => {
    expect(normalizarTextoExtraido('  A   B  \n\n   \nC ')).toBe('A B\nC');
  });

  it('extrai número, placa, nome e data rotulados', () => {
    const cab = extrairCabecalho(
      [
        'ORÇAMENTO Nº 4471',
        'CLIENTE: JOÃO DA SILVA',
        'PLACA: ABC1D23',
        'DATA EMISSÃO: 24/09/2026',
        '1 Peça X 1 10,00',
      ].join('\n'),
    );
    expect(cab).toEqual({ numero: '4471', placa: 'ABC1D23', nome: 'JOÃO DA SILVA', data: '24/09/2026' });
  });

  it('acha placa e data avulsas sem rótulo', () => {
    const cab = extrairCabecalho('REVISÃO HILUX\nABC1D23\n24/09/2026\n1 Peça X 1 10,00');
    expect(cab.placa).toBe('ABC1D23');
    expect(cab.data).toBe('24/09/2026');
    expect(cab.numero).toBe('');
  });

  it('placa antiga com hífen também vale', () => {
    expect(extrairCabecalho('PLACA ABC-1234').placa).toBe('ABC-1234');
  });
});
