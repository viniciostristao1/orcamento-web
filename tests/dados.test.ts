// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  DADOS_KEY,
  adicionarLinha,
  atualizarCelula,
  atualizarTitulo,
  celulaContem,
  criarTabela,
  encontrar,
  estadoInicial,
  lerDados,
  removerLinha,
  removerTabela,
  salvarDados,
} from '../src/dados/utils/tabelas';

describe('aba Dados — tabelas de Peças e O.S\'s', () => {
  beforeEach(() => localStorage.clear());

  it('cria tabela com o número de colunas escolhido (primeira linha = títulos)', () => {
    const d = criarTabela(estadoInicial(), 'pecas', 3);
    expect(d.pecas).toHaveLength(1);
    expect(d.pecas[0].colunas).toBe(3);
    expect(d.pecas[0].titulos).toEqual(['Coluna 1', 'Coluna 2', 'Coluna 3']);
    expect(d.pecas[0].linhas).toHaveLength(0);
  });

  it('limita as colunas entre 1 e 12', () => {
    expect(criarTabela(estadoInicial(), 'os', 99).os[0].colunas).toBe(12);
    expect(criarTabela(estadoInicial(), 'os', 0).os[0].colunas).toBe(1);
  });

  it('adiciona e remove linhas, e edita títulos/células', () => {
    let d = criarTabela(estadoInicial(), 'pecas', 2);
    const id = d.pecas[0].id;
    d = adicionarLinha(d, 'pecas', id);
    expect(d.pecas[0].linhas).toHaveLength(1);
    expect(d.pecas[0].linhas[0]).toEqual(['', '']);

    d = atualizarCelula(d, 'pecas', id, 0, 1, 'ABC123');
    expect(d.pecas[0].linhas[0][1]).toBe('ABC123');
    d = atualizarTitulo(d, 'pecas', id, 0, 'CÓDIGO');
    expect(d.pecas[0].titulos[0]).toBe('CÓDIGO');

    d = adicionarLinha(d, 'pecas', id);
    d = removerLinha(d, 'pecas', id, 0);
    expect(d.pecas[0].linhas).toHaveLength(1);

    d = removerTabela(d, 'pecas', id);
    expect(d.pecas).toHaveLength(0);
  });

  it('persiste e relê do localStorage', () => {
    let d = criarTabela(estadoInicial(), 'os', 2);
    d = adicionarLinha(d, 'os', d.os[0].id);
    d = atualizarCelula(d, 'os', d.os[0].id, 0, 0, 'JOAO');
    salvarDados(d);
    expect(localStorage.getItem(DADOS_KEY)).toBeTruthy();
    const lido = lerDados();
    expect(lido.os[0].linhas[0][0]).toBe('JOAO');
  });

  it('busca ignorando acento e acha em qual aba está', () => {
    let d = criarTabela(estadoInicial(), 'pecas', 2);
    d = adicionarLinha(d, 'pecas', d.pecas[0].id);
    d = atualizarCelula(d, 'pecas', d.pecas[0].id, 0, 0, 'Pastilha de Freio');
    d = criarTabela(d, 'os', 2);
    d = adicionarLinha(d, 'os', d.os[0].id);
    d = atualizarCelula(d, 'os', d.os[0].id, 0, 0, 'OS 4471 · João');

    expect(celulaContem('Pastilha de Freio', 'pastilha')).toBe(true);
    expect(encontrar(d, 'PASTILHA')).toEqual({ pecas: 1, os: 0 });
    expect(encontrar(d, 'joao')).toEqual({ pecas: 0, os: 1 });
    expect(encontrar(d, 'coluna')).toEqual({ pecas: 2, os: 2 }); // títulos também entram
    expect(encontrar(d, '')).toEqual({ pecas: 0, os: 0 });
  });
});
