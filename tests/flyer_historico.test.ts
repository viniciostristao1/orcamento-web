// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  adicionarAoFlyerHistorico,
  atualizarCorFlyer,
  atualizarLembreteFlyer,
  filtrarFlyerHistorico,
  limparFlyerHistorico,
  listarFlyerHistorico,
  removerDoFlyerHistorico,
} from '../src/tire/utils/historicoFlyer';
import { filtrarPorCor } from '../src/utils/corCliente';

const base = {
  contato: 'JOÃO ABC1D23',
  medida: '265/60R18',
  inputText: '265/60R18\tMARCA\tÀ PRAZO\n1\tFirestone\tR$ 1.000,00',
  numMarcas: 1,
};

describe('histórico do Tire Flyer (localStorage)', () => {
  beforeEach(() => limparFlyerHistorico());

  it('salva, lista e remove', () => {
    adicionarAoFlyerHistorico(base);
    const lista = listarFlyerHistorico();
    expect(lista).toHaveLength(1);
    expect(lista[0].contato).toBe('JOÃO ABC1D23');
    expect(lista[0].numMarcas).toBe(1);
    expect(removerDoFlyerHistorico(lista[0].id)).toEqual([]);
  });

  it('migra registros antigos (numPneus → numMarcas)', () => {
    localStorage.setItem(
      'flyer_historico_v1',
      JSON.stringify([{ ...base, numPneus: 4, numMarcas: undefined }]),
    );
    const lista = listarFlyerHistorico();
    expect(lista[0].numMarcas).toBe(4);
  });

  it('não duplica quando a tabela e o contato são os mesmos', () => {
    adicionarAoFlyerHistorico(base);
    adicionarAoFlyerHistorico(base);
    expect(listarFlyerHistorico()).toHaveLength(1);
    // contato diferente = novo registro
    adicionarAoFlyerHistorico({ ...base, contato: 'MARIA' });
    expect(listarFlyerHistorico()).toHaveLength(2);
  });

  it('telefone diferente vira outro registro; mesma máscara não duplica', () => {
    adicionarAoFlyerHistorico({ ...base, telefone: '51 99999-9999' });
    adicionarAoFlyerHistorico({ ...base, telefone: '(51) 99999-9999' });
    expect(listarFlyerHistorico()).toHaveLength(1);
    adicionarAoFlyerHistorico({ ...base, telefone: '51 3333-4444' });
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

  it('filtra por telefone (ignora máscara)', () => {
    limparFlyerHistorico();
    adicionarAoFlyerHistorico({ ...base, contato: 'JOAO', telefone: '51 99999-9999' });
    adicionarAoFlyerHistorico({ ...base, contato: 'MARIA', telefone: '51 3333-4444', inputText: 'outra' });
    const lista = listarFlyerHistorico();
    expect(filtrarFlyerHistorico(lista, '99999-9999').map((r) => r.contato)).toEqual(['JOAO']);
    expect(filtrarFlyerHistorico(lista, '(51) 33334444').map((r) => r.contato)).toEqual(['MARIA']);
  });

  it('cor: marca/desmarca e filtra por cor (botões + busca textual)', () => {
    // ids explícitos: dois adicionar() no mesmo milissegundo gerariam o mesmo id
    // (ordem: MARIA em cima, como se tivesse sido salva por último)
    localStorage.setItem(
      'flyer_historico_v1',
      JSON.stringify([
        { ...base, id: 'b', criadoEm: '01/08/2026 09:00:00', contato: 'MARIA', inputText: 'outra' },
        { ...base, id: 'a', criadoEm: '24/09/2026 12:30:00', contato: 'JOAO' },
      ]),
    );
    atualizarCorFlyer('b', 'verde');
    atualizarCorFlyer('a', 'vermelho');
    const lista = listarFlyerHistorico();
    expect(filtrarPorCor(lista, 'todas')).toHaveLength(2);
    expect(filtrarPorCor(lista, 'verde').map((r) => r.contato)).toEqual(['MARIA']);
    expect(filtrarPorCor(lista, 'vermelho').map((r) => r.contato)).toEqual(['JOAO']);
    expect(filtrarFlyerHistorico(lista, 'verde').map((r) => r.contato)).toEqual(['MARIA']);
    expect(filtrarFlyerHistorico(lista, 'vermelha').map((r) => r.contato)).toEqual(['JOAO']);
    // reprocessar o mesmo flyer não apaga a cor marcada
    adicionarAoFlyerHistorico({ ...base, contato: 'MARIA', inputText: 'outra' });
    expect(listarFlyerHistorico()).toHaveLength(2);
    expect(listarFlyerHistorico()[0].cor).toBe('verde');
  });

  it('observação do lembrete entra na busca', () => {
    limparFlyerHistorico();
    adicionarAoFlyerHistorico({ ...base, contato: 'JOAO' });
    const [r] = listarFlyerHistorico();
    atualizarLembreteFlyer(r.id, '2026-10-12T09:00', 'aguardando peca');
    expect(listarFlyerHistorico()[0].observacao).toBe('aguardando peca');
    expect(filtrarFlyerHistorico(listarFlyerHistorico(), 'aguardando')).toHaveLength(1);
    expect(filtrarFlyerHistorico(listarFlyerHistorico(), 'joao')).toHaveLength(1);
  });
});
