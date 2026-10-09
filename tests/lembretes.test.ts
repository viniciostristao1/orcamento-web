// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  atualizarLembreteHistorico,
} from '../src/utils/historico';
import {
  adicionarAoFlyerHistorico,
  atualizarLembreteFlyer,
  listarFlyerHistorico,
} from '../src/tire/utils/historicoFlyer';
import {
  dataDoRegistro,
  formatarLembrete,
  hojeHoraInput,
  listarLembretesVencidos,
  paraInputDatetime,
} from '../src/utils/lembretes';
import { adicionarAoHistorico, listarHistorico } from '../src/utils/historico';

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

const PASSADO = '2020-01-01T09:00';
const FUTURO = '2999-01-01T09:00';

describe('lembretes com data/hora (botão relógio)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('formatações', () => {
    expect(formatarLembrete('2026-10-12T09:00')).toBe('12/10/2026 09:00');
    expect(formatarLembrete('')).toBeNull();
    expect(formatarLembrete(null)).toBeNull();
    expect(formatarLembrete('lixo')).toBeNull();
    expect(paraInputDatetime('2026-10-12T09:00:00')).toBe('2026-10-12T09:00');
    expect(paraInputDatetime(null)).toBe('');
    expect(dataDoRegistro('05/10/2026 18:17:04')).toBe('05/10/2026');
    expect(dataDoRegistro('05/10/2026, 18:17:04')).toBe('05/10/2026');
  });

  it('agenda/limpa no orçamento e lista só os vencidos', () => {
    // ids explícitos: dois adicionar() no mesmo milissegundo gerariam o mesmo id
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([
        { ...base, id: 'a', criadoEm: '24/09/2026 12:30:00', placa: 'AAA' },
        { ...base, id: 'b', criadoEm: '01/08/2026 09:00:00', placa: 'BBB' },
      ]),
    );
    atualizarLembreteHistorico('a', PASSADO);
    atualizarLembreteHistorico('b', FUTURO);

    const vencidos = listarLembretesVencidos();
    expect(vencidos.map((v) => v.id)).toEqual(['a']);
    expect(vencidos[0].origem).toBe('orcamento');
    expect(vencidos[0].rotulo).toBe('AAA');

    atualizarLembreteHistorico('a', null);
    expect(listarLembretesVencidos()).toHaveLength(0);
  });

  it('flyer entra na mesma lista de vencidos', () => {
    adicionarAoFlyerHistorico({
      contato: 'JOAO',
      medida: '265/60R18',
      inputText: 'x',
      numMarcas: 1,
    });
    const [flyer] = listarFlyerHistorico();
    atualizarLembreteFlyer(flyer.id, PASSADO);
    const vencidos = listarLembretesVencidos();
    expect(vencidos).toHaveLength(1);
    expect(vencidos[0]).toMatchObject({ origem: 'flyer', rotulo: 'JOAO' });
  });

  it('reprocessar preserva o lembrete (não entra no anti-duplicado)', () => {
    adicionarAoHistorico(base);
    const [rec] = listarHistorico();
    atualizarLembreteHistorico(rec.id, PASSADO);
    adicionarAoHistorico(base); // mesmos dados → substitui sem duplicar
    expect(listarHistorico()).toHaveLength(1);
    expect(listarHistorico()[0].lembreteEm).toBe(PASSADO);
    expect(listarLembretesVencidos()).toHaveLength(1);
  });

  it('hojeHoraInput devolve hoje com a hora local (formato do datetime-local)', () => {
    // 5 de outubro de 2026, 09:07 locais (mês zero-based do Date)
    expect(hojeHoraInput(new Date(2026, 9, 5, 9, 7))).toBe('2026-10-05T09:07');
    expect(hojeHoraInput(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01T00:00');
  });
});
