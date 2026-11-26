// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  converterBrutoParaLista,
  converterListaParaBruto,
  parseListaItens,
  processQuote,
} from '../src/utils/quoteLogic';
import { processQuoteDoRegistro, type OrcamentoSalvo } from '../src/utils/historico';

/** As 7 linhas do exemplo do usuário (TAB entre nº, descrição e valor). */
const EXEMPLO_7 = [
  '1\tFiltro de ar\tR$ 195,90',
  '2\tLimpeza de bicos\tR$ 725,95',
  '3\tRetifica discos\tR$ 150,00',
  '4\tPastilhas D.D\tR$ 1.600,50',
  '5\tOxi\tR$ 247,68',
  '6\tBorracha do limpador\tR$ 240,90',
  '7\t2 rolamentos diant\tR$ 5.419,12',
].join('\n');

describe('parseListaItens — exemplo das 7 linhas', () => {
  it('lê tudo: descrições em maiúsculas, OXI expandido, soma 8.580,05', () => {
    const r = parseListaItens(EXEMPLO_7);
    expect(r.invalidas).toEqual([]);
    expect(r.itens.map((i) => i.descricao)).toEqual([
      'FILTRO DE AR',
      'LIMPEZA DE BICOS',
      'RETIFICA DISCOS',
      'PASTILHAS D.D',
      'HIGIENIZAÇÃO DO AR CONDICIONADO',
      'BORRACHA DO LIMPADOR',
      '2 ROLAMENTOS DIANT',
    ]);
    expect(r.itens.map((i) => i.valor)).toEqual([195.9, 725.95, 150, 1600.5, 247.68, 240.9, 5419.12]);
    expect(r.soma).toBeCloseTo(8580.05, 2);
  });

  it('somas por grupo: aprovados (1-4) 2.672,35; reprovados (5-7) 5.907,70', () => {
    const linhas = EXEMPLO_7.split('\n');
    const aprov = parseListaItens(linhas.slice(0, 4).join('\n'));
    const repro = parseListaItens(linhas.slice(4).join('\n'));
    expect(aprov.soma).toBeCloseTo(2672.35, 2);
    expect(repro.soma).toBeCloseTo(5907.7, 2);
  });

  it('conversão gera ids 1..N e o pipeline soma igual', () => {
    const { desc, dados } = converterListaParaBruto(parseListaItens(EXEMPLO_7).itens);
    expect(desc.split('\n')[0]).toBe('01 FILTRO DE AR');
    const s = processQuote(desc, dados, 0, 0, 0, 6, '', { manterVerbos: true });
    expect(s.items.map((i) => i.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(s.totalOrcamento).toBeCloseTo(8580.05, 2);
  });
});

describe('parseListaItens — regra posicional do número', () => {
  it('descarta o 1º número só quando é igual à posição esperada', () => {
    const Mantem = parseListaItens('2 rolamentos diant R$ 5.419,12');
    expect(Mantem.itens).toHaveLength(1);
    expect(Mantem.itens[0].descricao).toBe('2 ROLAMENTOS DIANT');
    const linhas = Array.from({ length: 6 }, (_, i) => `x R$ 1,00`).join('\n');
    const tira = parseListaItens(`${linhas}\n7 2 rolamentos diant R$ 5.419,12`);
    expect(tira.itens).toHaveLength(7);
    expect(tira.itens[6].descricao).toBe('2 ROLAMENTOS DIANT');
    expect(tira.itens[6].valor).toBeCloseTo(5419.12, 2);
  });

  it('com TAB e 3 colunas, 1ª coluna só-dígitos sempre sai (mesmo fora da posição)', () => {
    const r = parseListaItens('5\tOxi\tR$ 247,68');
    expect(r.invalidas).toEqual([]);
    expect(r.itens).toHaveLength(1);
    expect(r.itens[0].descricao).toBe('HIGIENIZAÇÃO DO AR CONDICIONADO');
    expect(r.itens[0].valor).toBeCloseTo(247.68, 2);
  });

  it('sem TAB e sem número, a descrição vale (posição irrelevante)', () => {
    const r = parseListaItens('Filtro de ar\tR$ 195,90');
    expect(r.itens[0].descricao).toBe('FILTRO DE AR');
  });
});

describe('parseListaItens — formatos de valor e linhas', () => {
  it('aceita R$ grudado, milhar, um decimal e valor puro', () => {
    expect(parseListaItens('a\tR$195,90').itens[0].valor).toBeCloseTo(195.9, 2);
    expect(parseListaItens('a\t1.600,50').itens[0].valor).toBeCloseTo(1600.5, 2);
    expect(parseListaItens('a\t195,9').itens[0].valor).toBeCloseTo(195.9, 2);
    expect(parseListaItens('a\t1600,50').itens[0].valor).toBeCloseTo(1600.5, 2);
  });

  it('inválidas: sem valor, só número, sem descrição — com nº da linha e motivo', () => {
    const r = parseListaItens(['Filtro de ar', '12345', '2 195,90', '', 'Pastilha\tR$ 10,00'].join('\n'));
    expect(r.itens).toHaveLength(1);
    expect(r.invalidas).toEqual([
      { linha: 1, motivo: 'sem valor legível' },
      { linha: 2, motivo: 'sem descrição' },
      { linha: 3, motivo: 'sem descrição (só número e valor)' },
    ]);
    expect(r.ignoradas).toBe(0);
  });

  it('ignora brancas, cabeçalhos e totais sem reclamar', () => {
    const r = parseListaItens(['', 'ORÇAMENTO Nº 4471', 'TOTAL R$ 8.580,05', 'Filtro\tR$ 10,00', '   '].join('\n'));
    expect(r.itens).toHaveLength(1);
    expect(r.invalidas).toEqual([]);
    expect(r.ignoradas).toBe(2);
  });

  it('texto vazio não gera nada nem reclama', () => {
    expect(parseListaItens('   \n ')).toEqual({ itens: [], invalidas: [], ignoradas: 0, soma: 0 });
  });
});

describe('manterVerbos — caminho novo x caminho antigo', () => {
  const desc = '01 KIT TROCA RAPIDA';
  const dados = '1 Serviço X 1 10,00';

  it('caminho antigo (padrão) tira o verbo no meio da descrição', () => {
    expect(processQuote(desc, dados, 0, 0, 0, 1).items[0]?.description).toBe('KIT RAPIDA');
  });

  it('caminho da lista nova mantém o verbo', () => {
    const s = processQuote(desc, dados, 0, 0, 0, 1, '', { manterVerbos: true });
    expect(s.items[0]?.description).toBe('KIT TROCA RAPIDA');
    expect(s.items[0]?.value).toBeCloseTo(10, 2);
  });

  it('processQuoteDoRegistro: com lista mantém; sem lista (antigo) tira', () => {
    const base: OrcamentoSalvo = {
      id: 'x',
      criadoEm: '26/11/2026, 10:00:00',
      descReparo: desc,
      orcamentoRaw: dados,
      ajustesManuais: '',
      revAprovadaInput: '0,00',
      revPecasInput: '0,00',
      desconto: 0,
      parcelas: 6,
      totalPecasGeral: 0,
      totalServicosGeral: 10,
      valorDescontoTotal: 0,
      valorLiquidoFinal: 10,
      totalGeral: 10,
    };
    expect(processQuoteDoRegistro({ ...base, listaAdicional: 'x' }).items[0]?.description).toBe('KIT TROCA RAPIDA');
    expect(processQuoteDoRegistro(base).items[0]?.description).toBe('KIT RAPIDA');
  });
});

describe('conversores bruto <-> lista', () => {
  it('bruto vira lista sem números (migração do rascunho)', () => {
    const lista = converterBrutoParaLista('01 FILTRO DE AR', '1 Serviço X 1 195,90');
    expect(lista).toBe('FILTRO DE AR\tR$ 195,90');
  });
});
