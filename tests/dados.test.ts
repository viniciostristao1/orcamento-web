// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ABA_PECAS,
  alternarMarcada,
  DADOS_KEY,
  adicionarColuna,
  adicionarLinha,
  atualizarCelula,
  atualizarLargura,
  atualizarTamanhoNota,
  atualizarTextoNota,
  atualizarTitulo,
  celulaContem,
  criarAba,
  criarNota,
  criarTabela,
  encontrar,
  estadoInicial,
  extrairDataPtBr,
  lerDados,
  listarOcorrencias,
  removerAba,
  removerColuna,
  removerLinha,
  renomearAba,
  removerTabela,
  colarBloco,
  limparBloco,
  limitarNotaAltura,
  limitarNotaLargura,
  moverNota,
  NOTA_ALTURA_PADRAO,
  NOTA_LARGURA_PADRAO,
  ordenarPorColuna,
  removerNota,
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

  it('cola bloco em grade: cria linhas quando precisa e ignora colunas além da tabela', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 3);
    const id = d.abas[0].tabelas[0].id;

    // cola 2 linhas x 3 colunas numa tabela vazia (cria as linhas)
    d = colarBloco(d, ABA_PECAS, id, 0, 0, [
      ['CARE042501', 'VIA TANQUE FLEX', 'TUNAP 939'],
      ['CARE042502', 'FILTRO DE AR', 'MANN'],
    ]);
    let t = d.abas[0].tabelas[0];
    expect(t.linhas).toHaveLength(2);
    expect(t.linhas[0]).toEqual(['CARE042501', 'VIA TANQUE FLEX', 'TUNAP 939']);
    expect(t.linhas[1][0]).toBe('CARE042502');
    expect(t.marcados).toEqual([false, false]);

    // bloco mais largo que a tabela: o que passa das colunas é ignorado
    d = colarBloco(d, ABA_PECAS, id, 2, 1, [['X', 'Y', 'Z', 'W']]);
    t = d.abas[0].tabelas[0];
    expect(t.linhas[2]).toEqual(['', 'X', 'Y']);
    expect(t.linhas).toHaveLength(3);

    // bloco no meio não cria linhas extras
    d = colarBloco(d, ABA_PECAS, id, 0, 1, [['ok']]);
    expect(d.abas[0].tabelas[0].linhas[0][1]).toBe('ok');
    expect(d.abas[0].tabelas[0].linhas).toHaveLength(3);
  });

  it('limpa um bloco de células (Ctrl+X / Delete) sem tocar no resto', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 3);
    const id = d.abas[0].tabelas[0].id;
    d = colarBloco(d, ABA_PECAS, id, 0, 0, [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
      ['G', 'H', 'I'],
    ]);

    // retângulo no meio + coordenadas invertidas (como vem da seleção)
    d = limparBloco(d, ABA_PECAS, id, 0, 2, 1, 1);
    let t = d.abas[0].tabelas[0];
    expect(t.linhas).toEqual([
      ['A', '', ''],
      ['D', '', ''],
      ['G', 'H', 'I'],
    ]);
    // não mexe nos títulos nem nas caixinhas
    expect(t.titulos).toEqual(['Coluna 1', 'Coluna 2', 'Coluna 3']);
    expect(t.marcados).toEqual([false, false, false]);

    // bloco fora dos limites é ignorado
    d = limparBloco(d, ABA_PECAS, id, 9, 9, 12, 12);
    expect(d.abas[0].tabelas[0].linhas[2]).toEqual(['G', 'H', 'I']);
  });

  it('notas: cria, escreve, redimensiona (com limites), limpa e remove', () => {
    let d = estadoInicial();
    expect(d.abas[0].notas).toEqual([]);
    d = criarNota(d, ABA_PECAS);
    const nota = d.abas[0].notas[0];
    expect(nota.texto).toBe('');
    expect(nota.largura).toBe(NOTA_LARGURA_PADRAO);
    expect(nota.altura).toBe(NOTA_ALTURA_PADRAO);
    expect(d.abas[0].ordem).toEqual([nota.id]);

    d = atualizarTextoNota(d, ABA_PECAS, nota.id, 'Trocar óleo na próxima visita');
    expect(d.abas[0].notas[0].texto).toBe('Trocar óleo na próxima visita');

    d = atualizarTamanhoNota(d, ABA_PECAS, nota.id, 500, 260);
    expect(d.abas[0].notas[0].largura).toBe(500);
    expect(d.abas[0].notas[0].altura).toBe(260);
    // limites
    d = atualizarTamanhoNota(d, ABA_PECAS, nota.id, 10, 9999);
    expect(d.abas[0].notas[0].largura).toBe(limitarNotaLargura(10));
    expect(d.abas[0].notas[0].altura).toBe(limitarNotaAltura(9999));

    // borracha
    d = atualizarTextoNota(d, ABA_PECAS, nota.id, '');
    expect(d.abas[0].notas[0].texto).toBe('');

    d = removerNota(d, ABA_PECAS, nota.id);
    expect(d.abas[0].notas).toEqual([]);
    expect(d.abas[0].ordem).toEqual([]);
  });

  it('arrastar a nota muda a ordem dos blocos (acima/entre tabelas)', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 1);
    const t1 = d.abas[0].tabelas[0].id;
    d = criarTabela(d, ABA_PECAS, 1);
    const t2 = d.abas[0].tabelas[1].id;
    d = criarNota(d, ABA_PECAS);
    const n1 = d.abas[0].notas[0].id;
    expect(d.abas[0].ordem).toEqual([t1, t2, n1]);

    // arrastando para cima e soltando na 1ª tabela → nota acima de tudo
    d = moverNota(d, ABA_PECAS, n1, t1);
    expect(d.abas[0].ordem).toEqual([n1, t1, t2]);

    // solta na 1ª tabela de novo (agora abaixo dela) → nota entre as duas
    d = moverNota(d, ABA_PECAS, n1, t1);
    expect(d.abas[0].ordem).toEqual([t1, n1, t2]);

    // arrastando para baixo e soltando na 2ª tabela → nota depois das duas
    d = moverNota(d, ABA_PECAS, n1, t2);
    expect(d.abas[0].ordem).toEqual([t1, t2, n1]);

    // destino inexistente não muda nada
    expect(moverNota(d, ABA_PECAS, n1, 'x').abas[0].ordem).toEqual([t1, t2, n1]);
  });

  it('adiciona coluna no fim (e respeita o limite de 12)', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 2);
    const id = d.abas[0].tabelas[0].id;
    d = adicionarLinha(d, ABA_PECAS, id);
    d = atualizarCelula(d, ABA_PECAS, id, 0, 0, 'A');

    d = adicionarColuna(d, ABA_PECAS, id);
    const t = d.abas[0].tabelas[0];
    expect(t.colunas).toBe(3);
    expect(t.titulos).toEqual(['Coluna 1', 'Coluna 2', 'Coluna 3']);
    expect(t.larguras).toHaveLength(3);
    expect(t.linhas[0]).toEqual(['A', '', '']);

    // no limite não faz nada
    let cheia = criarTabela(estadoInicial(), ABA_PECAS, 12);
    const idCheia = cheia.abas[0].tabelas[0].id;
    cheia = adicionarColuna(cheia, ABA_PECAS, idCheia);
    expect(cheia.abas[0].tabelas[0].colunas).toBe(12);
  });

  it('ordena por coluna (numérico, vazios por último) e a caixinha acompanha a linha', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 2);
    const id = d.abas[0].tabelas[0].id;
    d = adicionarLinha(d, ABA_PECAS, id);
    d = adicionarLinha(d, ABA_PECAS, id);
    d = adicionarLinha(d, ABA_PECAS, id);
    d = atualizarCelula(d, ABA_PECAS, id, 0, 0, '10 UN');
    d = atualizarCelula(d, ABA_PECAS, id, 2, 0, '8 UN');
    d = alternarMarcada(d, ABA_PECAS, id, 2); // "8 UN" marcada

    let t = ordenarPorColuna(d, ABA_PECAS, id, 0, 'asc').abas[0].tabelas[0];
    expect(t.linhas.map((l) => l[0])).toEqual(['8 UN', '10 UN', '']);
    expect(t.marcados).toEqual([true, false, false]);

    t = ordenarPorColuna(d, ABA_PECAS, id, 0, 'desc').abas[0].tabelas[0];
    expect(t.linhas.map((l) => l[0])).toEqual(['10 UN', '8 UN', '']);
  });

  it('ordena datas pt-BR pelo calendário (ano/mês/dia, não pelo dia)', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 1);
    const id = d.abas[0].tabelas[0].id;
    const valores = [
      '03/09/2025',
      '02/09/2026',
      '10/08/2026',
      '',
      '03/09/2026 12:30:00',
      '03/09/2026 08:00:00',
    ];
    valores.forEach(() => { d = adicionarLinha(d, ABA_PECAS, id); });
    valores.forEach((v, i) => { d = atualizarCelula(d, ABA_PECAS, id, i, 0, v); });

    // crescente = mais antiga primeiro (03/09/2025 antes de 02/09/2026,
    // mesmo com o dia maior); vazio por último
    let t = ordenarPorColuna(d, ABA_PECAS, id, 0, 'asc').abas[0].tabelas[0];
    expect(t.linhas.map((l) => l[0])).toEqual([
      '03/09/2025',
      '10/08/2026',
      '02/09/2026',
      '03/09/2026 08:00:00',
      '03/09/2026 12:30:00',
      '',
    ]);

    // decrescente = mais recente primeiro; vazio continua por último
    t = ordenarPorColuna(d, ABA_PECAS, id, 0, 'desc').abas[0].tabelas[0];
    expect(t.linhas.map((l) => l[0])).toEqual([
      '03/09/2026 12:30:00',
      '03/09/2026 08:00:00',
      '02/09/2026',
      '10/08/2026',
      '03/09/2025',
      '',
    ]);
  });

  it('extrairDataPtBr aceita DD/MM, hora e ISO; rejeita inválidas', () => {
    expect(extrairDataPtBr('02/09')).not.toBeNull();
    expect(extrairDataPtBr('03/09')).toBeGreaterThan(extrairDataPtBr('02/09')!);
    expect(extrairDataPtBr('2026-09-03')).toBe(extrairDataPtBr('03/09/2026'));
    expect(extrairDataPtBr('PEDRO')).toBeNull();
    expect(extrairDataPtBr('31/02/2026')).toBeNull();
    expect(extrairDataPtBr('')).toBeNull();
  });

  it('remove coluna (título, largura e células) e nunca deixa a tabela sem colunas', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 3);
    const id = d.abas[0].tabelas[0].id;
    d = adicionarLinha(d, ABA_PECAS, id);
    d = atualizarCelula(d, ABA_PECAS, id, 0, 0, 'A');
    d = atualizarCelula(d, ABA_PECAS, id, 0, 1, 'B');
    d = atualizarCelula(d, ABA_PECAS, id, 0, 2, 'C');

    d = removerColuna(d, ABA_PECAS, id, 1);
    let t = d.abas[0].tabelas[0];
    expect(t.colunas).toBe(2);
    expect(t.titulos).toEqual(['Coluna 1', 'Coluna 3']);
    expect(t.larguras).toHaveLength(2);
    expect(t.linhas[0]).toEqual(['A', 'C']);

    // a última coluna não sai
    d = removerColuna(d, ABA_PECAS, id, 0);
    t = d.abas[0].tabelas[0];
    expect(t.colunas).toBe(1);
    expect(t.titulos).toEqual(['Coluna 3']);
    d = removerColuna(d, ABA_PECAS, id, 0);
    expect(d.abas[0].tabelas[0].titulos).toEqual(['Coluna 3']);
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
    // registros antigos (sem `notas`) viram lista vazia
    expect(lerDados().abas[0].notas).toEqual([]);
    // e sem `ordem` o bloco entra no fim (as tabelas primeiro)
    expect(lerDados().abas[0].ordem).toEqual(['t']);
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

  it('lista as ocorrências da busca na ordem da tela (títulos antes das linhas)', () => {
    let d = criarTabela(estadoInicial(), ABA_PECAS, 2);
    const idPecas = d.abas[0].tabelas[0].id;
    d = adicionarLinha(d, ABA_PECAS, idPecas);
    d = adicionarLinha(d, ABA_PECAS, idPecas);
    d = atualizarTitulo(d, ABA_PECAS, idPecas, 0, 'FREIO');
    d = atualizarCelula(d, ABA_PECAS, idPecas, 0, 0, 'pastilha de freio');
    d = atualizarCelula(d, ABA_PECAS, idPecas, 1, 1, 'Freio traseiro');
    d = criarNota(d, ABA_PECAS);
    const idNota = d.abas[0].notas[0].id;
    d = atualizarTextoNota(d, ABA_PECAS, idNota, 'checar freio de mão');
    d = criarTabela(d, 'os', 2);
    const idOs = d.abas[1].tabelas[0].id;
    d = adicionarLinha(d, 'os', idOs);
    d = atualizarCelula(d, 'os', idOs, 0, 0, 'FREIO os 123');

    expect(listarOcorrencias(d, 'freio')).toEqual([
      { abaId: 'pecas', tabelaId: idPecas, tipo: 'titulo', linha: -1, coluna: 0 },
      { abaId: 'pecas', tabelaId: idPecas, tipo: 'celula', linha: 0, coluna: 0 },
      { abaId: 'pecas', tabelaId: idPecas, tipo: 'celula', linha: 1, coluna: 1 },
      { abaId: 'pecas', tipo: 'nota', notaId: idNota },
      { abaId: 'os', tabelaId: idOs, tipo: 'celula', linha: 0, coluna: 0 },
    ]);
    expect(encontrar(d, 'freio')).toEqual({ pecas: 4, os: 1 });
    expect(listarOcorrencias(d, '')).toEqual([]);
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
