// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ABA_PECAS,
  alternarMarcada,
  DADOS_KEY,
  adicionarLinha,
  atualizarCelula,
  atualizarLargura,
  atualizarTitulo,
  celulaContem,
  criarAba,
  criarTabela,
  encontrar,
  estadoInicial,
  lerDados,
  removerAba,
  removerLinha,
  renomearAba,
  removerTabela,
  salvarDados,
} from '../src/dados/utils/tabelas';

describe('aba Dados — tabelas de Peças e O.S\'s', () => {
  beforeEach(() => localStorage.clear());

  it('cria tabela com o número de colunas escolhido (primeira linha = títulos)', () => {
    const d = criarTabela(estadoInicial(), ABA_PECAS, 3);
    const t = d.abas[0].tabelas[0];
    expect(d.abas[0].tabelas).toHaveLength(1);
    expect(t.colunas).toBe(3);
    expect(t.titulos).toEqual(['Coluna 1', 'Coluna 2', 'Coluna 3']);
    expect(t.linhas).toHaveLength(0);
  });

  it('limita as colunas entre 1 e 12', () => {
    expect(criarTabela(estadoInicial(), 'os', 99).abas[1].tabelas[0].colunas).toBe(12);
    expect(criarTabela(estadoInicial(), 'os', 0).abas[1].tabelas[0].colunas).toBe(1);
  });

  it('adiciona e remove linhas, e edita títulos/células', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 2);
    const id = d.abas[0].tabelas[0].id;
    d = adicionarLinha(d, ABA_PECAS, id);
    expect(d.abas[0].tabelas[0].linhas).toHaveLength(1);
    expect(d.abas[0].tabelas[0].linhas[0]).toEqual(['', '']);

    d = atualizarCelula(d, ABA_PECAS, id, 0, 1, 'ABC123');
    expect(d.abas[0].tabelas[0].linhas[0][1]).toBe('ABC123');
    d = atualizarTitulo(d, ABA_PECAS, id, 0, 'CÓDIGO');
    expect(d.abas[0].tabelas[0].titulos[0]).toBe('CÓDIGO');

    d = adicionarLinha(d, ABA_PECAS, id);
    d = removerLinha(d, ABA_PECAS, id, 0);
    expect(d.abas[0].tabelas[0].linhas).toHaveLength(1);

    d = removerTabela(d, ABA_PECAS, id);
    expect(d.abas[0].tabelas).toHaveLength(0);
  });

  it('ajusta a largura das colunas (com limites) e guarda', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 2);
    const id = d.abas[0].tabelas[0].id;
    expect(d.abas[0].tabelas[0].larguras).toEqual([170, 170]);
    d = atualizarLargura(d, ABA_PECAS, id, 0, 260);
    expect(d.abas[0].tabelas[0].larguras[0]).toBe(260);
    d = atualizarLargura(d, ABA_PECAS, id, 1, 20); // abaixo do mínimo
    expect(d.abas[0].tabelas[0].larguras[1]).toBe(80);
    d = atualizarLargura(d, ABA_PECAS, id, 0, 9999); // acima do máximo
    expect(d.abas[0].tabelas[0].larguras[0]).toBe(600);
    salvarDados(d);
    expect(lerDados().abas[0].tabelas[0].larguras).toEqual([600, 80]);
  });

  it('cria sub-abas novas (depois de Peças e O.S\'s)', () => {
    const d = criarAba(estadoInicial(), 'Preventiva');
    expect(d.abas).toHaveLength(3);
    expect(d.abas[2].rotulo).toBe('PREVENTIVA');
    expect(d.abas[2].tabelas).toEqual([]);
    // tabela criada na sub-aba nova
    const d2 = criarTabela(d, d.abas[2].id, 2);
    expect(d2.abas[2].tabelas).toHaveLength(1);
    expect(d2.abas[0].tabelas).toHaveLength(0);
  });

  it('caixinhas de seleção: com/sem e riscar a linha', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 2, true);
    const id = d.abas[0].tabelas[0].id;
    expect(d.abas[0].tabelas[0].comCaixas).toBe(true);
    d = adicionarLinha(d, ABA_PECAS, id);
    expect(d.abas[0].tabelas[0].marcados).toEqual([false]);
    d = alternarMarcada(d, ABA_PECAS, id, 0);
    expect(d.abas[0].tabelas[0].marcados).toEqual([true]);
    d = alternarMarcada(d, ABA_PECAS, id, 0);
    expect(d.abas[0].tabelas[0].marcados).toEqual([false]);

    const sem = criarTabela(estadoInicial(), 'os', 2, false);
    expect(sem.abas[1].tabelas[0].comCaixas).toBe(false);

    // registros antigos (sem o campo) assumem com caixinhas
    localStorage.setItem(DADOS_KEY, JSON.stringify({ abas: [{ id: 'x', rotulo: 'X', tabelas: [{ id: 't', colunas: 1, titulos: ['A'], linhas: [] }] }] }));
    expect(lerDados().abas[0].tabelas[0].comCaixas).toBe(true);
  });

  it('renomeia sub-abas', () => {
    const d = renomearAba(estadoInicial(), ABA_PECAS, 'freios');
    expect(d.abas[0].rotulo).toBe('FREIOS');
    expect(renomearAba(d, ABA_PECAS, '   ').abas[0].rotulo).toBe('FREIOS');
  });

  it('exclui sub-abas (e nunca deixa a lista vazia)', () => {
    let d = criarAba(estadoInicial(), 'Preventiva');
    const idNova = d.abas[2].id;
    d = removerAba(d, idNova);
    expect(d.abas.map((a) => a.rotulo)).toEqual(['PEÇAS', "O.S'S"]);

    // apagando tudo volta o estado inicial
    d = removerAba(d, 'pecas');
    d = removerAba(d, 'os');
    expect(d.abas.map((a) => a.rotulo)).toEqual(['PEÇAS', "O.S'S"]);
  });

  it('persiste no formato novo e migra o antigo { pecas, os }', () => {
    let d = criarTabela(estadoInicial(), 'os', 2);
    d = adicionarLinha(d, 'os', d.abas[1].tabelas[0].id);
    d = atualizarCelula(d, 'os', d.abas[1].tabelas[0].id, 0, 0, 'JOAO');
    salvarDados(d);
    expect(localStorage.getItem(DADOS_KEY)).toBeTruthy();
    expect(lerDados().abas[1].tabelas[0].linhas[0][0]).toBe('JOAO');

    // formato antigo continua sendo lido
    localStorage.setItem(
      DADOS_KEY,
      JSON.stringify({ pecas: [{ id: 't1', criadoEm: '', colunas: 2, titulos: ['A', 'B'], linhas: [['x', 'y']] }], os: [] }),
    );
    const migrado = lerDados();
    expect(migrado.abas[0].tabelas).toHaveLength(1);
    expect(migrado.abas[0].tabelas[0].linhas[0]).toEqual(['x', 'y']);
    expect(migrado.abas[0].tabelas[0].larguras).toEqual([170, 170]);
  });

  it('busca ignorando acento e acha em qual aba está', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 2);
    d = adicionarLinha(d, ABA_PECAS, d.abas[0].tabelas[0].id);
    d = atualizarCelula(d, ABA_PECAS, d.abas[0].tabelas[0].id, 0, 0, 'Pastilha de Freio');
    d = criarTabela(d, 'os', 2);
    d = adicionarLinha(d, 'os', d.abas[1].tabelas[0].id);
    d = atualizarCelula(d, 'os', d.abas[1].tabelas[0].id, 0, 0, 'OS 4471 · João');

    expect(celulaContem('Pastilha de Freio', 'pastilha')).toBe(true);
    expect(encontrar(d, 'PASTILHA')).toEqual({ pecas: 1, os: 0 });
    expect(encontrar(d, 'joao')).toEqual({ pecas: 0, os: 1 });
    expect(encontrar(d, '')).toEqual({ pecas: 0, os: 0 });
  });
});
