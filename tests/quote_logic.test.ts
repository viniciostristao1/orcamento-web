import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatarValorInput,
  itensNaoRealizados,
  parseBrazilianNumber,
  processQuote,
  recalcularComSelecao,
} from '../src/utils/quoteLogic';

const DESC = `01 TR PASTILHAS DE FREIO DIANT + RETIFICA DOS DISCOS
02 OXI
03 TR BORRACHA DAS PALHETAS`;

const ORCAMENTO = `1 Serviço GUN126L473025 DISCO DIANTEIRO UM LADO NO VEICULO 1,20000 514,800000 514,80
1 Peça 142142GC133 *GRAXA COBREADA ALTA TEMPERATURA 1 36,640000 36,64
1 Peça CARE040201 LIMPADOR PREMIUM UNIVERSAL 1 156,600000 156,60
1 Peça 044650K401 JOGO PASTILHAS FREIO DIANT.HILUX AP.2016 1 1.245,000000 1.245,00
3 Serviço GUN126L850091 BORRACHA DO LIMPADOR DIANTEIRO AMBOS OS 0,10000 42,900000 42,90
3 Peça CARE044907 CAR CONJUNTO VISIB. DO PARABRISA, H20 PARA VEICULOS1 27,100000 27,10
3 Peça 8521428090 BORRACHA LIMPADOR DI 1 65,000000 65,00
3 Peça 8521453080 BORRACHA LIMPADOR PA 1 82,000000 82,00
2 Serviço HIGMOTO HIGIENIZACAO AR CONDICIONADO 0,05000 0,000000 0,00
2 Peça CARE040703 AUTO AIR CLEANER (GRANADA) 1 110,600000 110,60
2 Peça CARE010701 OXY-SANITIZATION APP 1 99,000000 99,00
1 Serviço RETDISCD1 RETIFICA DISCO FREIO DIANTEIRO 1,00000 250,000000 250,00`;

describe('formatarValorInput (colar/digitar nos campos de valor)', () => {
  it('inteiro vira reais com centavos', () => {
    expect(formatarValorInput('1000')).toBe('1.000,00');
    expect(formatarValorInput('100')).toBe('100,00');
  });
  it('mantém o formato brasileiro já colado', () => {
    expect(formatarValorInput('2.188,92')).toBe('2.188,92');
    expect(formatarValorInput('2188,92')).toBe('2.188,92');
  });
  it('vazio ou sem dígito fica como veio', () => {
    expect(formatarValorInput('')).toBe('');
    expect(formatarValorInput('abc')).toBe('abc');
  });
});

describe('parseBrazilianNumber', () => {
  it('formato BR com milhar', () => {
    expect(parseBrazilianNumber('1.245,00')).toBe(1245);
  });
  it('várias casas decimais do PDF', () => {
    expect(parseBrazilianNumber('36,640000')).toBeCloseTo(36.64, 6);
  });
  it('formato US sem vírgula', () => {
    expect(parseBrazilianNumber('1799.75')).toBeCloseTo(1799.75, 6);
  });
  it('havendo vírgula, trata como BR (ponto de milhar US é ignorado)', () => {
    expect(parseBrazilianNumber('1,799.75')).toBeCloseTo(1.79975, 6);
  });
  it('vazio/inválido = 0', () => {
    expect(parseBrazilianNumber('')).toBe(0);
    expect(parseBrazilianNumber('abc')).toBe(0);
  });
});

describe('processQuote — exemplo do App (Hilux)', () => {
  const s = processQuote(DESC, ORCAMENTO, 1766.23, 1000, 5, 3);

  it('monta um item por linha da descrição, com descrição tratada', () => {
    expect(s.items.map((i) => i.description)).toEqual([
      'PASTILHAS DE FREIO DIANT + RETIFICA DOS DISCOS',
      'HIGIENIZAÇÃO DO AR CONDICIONADO',
      'BORRACHA DAS PALHETAS',
    ]);
  });

  it('agrupa e soma peças/serviços por item', () => {
    const it1 = s.items[0];
    expect(it1.pecasValue).toBeCloseTo(1438.24, 2); // 36,64 + 156,60 + 1.245,00
    expect(it1.servicosValue).toBeCloseTo(764.8, 2); // 514,80 + 250,00
    expect(it1.value).toBeCloseTo(2203.04, 2);

    const it3 = s.items[2];
    expect(it3.pecasValue).toBeCloseTo(174.1, 2); // 27,10 + 65,00 + 82,00
    expect(it3.servicosValue).toBeCloseTo(42.9, 2);
  });

  it('totais gerais e desconto em peças', () => {
    expect(s.totalPecasGeral).toBeCloseTo(2821.94, 2); // 1000 + 1821,94
    expect(s.totalServicosGeral).toBeCloseTo(1573.93, 2); // 766,23 + 807,70
    expect(s.totalOrcamento).toBeCloseTo(2629.64, 2);
    expect(s.valorLiquidoFinal).toBeCloseTo(4254.77, 2); // 2821,94*0,95 + 1573,93
    expect(s.valorDescontoTotal).toBeCloseTo(141.1, 2);
    expect(s.descontoPercentual).toBe(5);
    expect(s.numParcelas).toBe(3);
    expect(s.valorParcela).toBeCloseTo(s.totalGeral / 3, 6);
  });

  it('formata moeda no padrão do app', () => {
    expect(formatCurrency(s.valorLiquidoFinal)).toBe('4.254,77');
  });
});

describe('processQuote — ajustes manuais e descrição solta', () => {
  it('ajuste manual soma em peças do ID', () => {
    const s = processQuote('1 DISCO', '1 Peça X 1 100,00', 0, 0, 0, 1, '1 50,00');
    expect(s.items[0].pecasValue).toBeCloseTo(150, 2);
    expect(s.totalPecasGeral).toBeCloseTo(150, 2);
  });

  it('RET vira RETIFICA DOS DISCOS e OXI vira higienização', () => {
    const s = processQuote('1 RET\n2 OXI', '', 0, 0, 0, 1);
    expect(s.items[0].description).toBe('RETIFICA DOS DISCOS');
    expect(s.items[1].description).toBe('HIGIENIZAÇÃO DO AR CONDICIONADO');
  });
});

describe('recalcularComSelecao — caixinhas por item', () => {
  const s = processQuote(DESC, ORCAMENTO, 1766.23, 1000, 5, 3);
  const todos = new Set(s.items.map((i) => i.id));

  it('todos marcados = resumo original', () => {
    const r = recalcularComSelecao(s, todos);
    expect(r.totalOrcamento).toBeCloseTo(s.totalOrcamento, 2);
    expect(r.totalPecasGeral).toBeCloseTo(s.totalPecasGeral, 2);
    expect(r.totalServicosGeral).toBeCloseTo(s.totalServicosGeral, 2);
    expect(r.valorDescontoTotal).toBeCloseTo(s.valorDescontoTotal, 2);
    expect(r.valorLiquidoFinal).toBeCloseTo(s.valorLiquidoFinal, 2);
  });

  it('desmarcar um item tira o valor dele dos adicionais e dos totais', () => {
    const sem3 = new Set(todos);
    sem3.delete(3);
    const r = recalcularComSelecao(s, sem3);
    // item 3 = peças 174,10 + serviços 42,90
    expect(r.totalPecasGeral).toBeCloseTo(s.totalPecasGeral - 174.1, 2);
    expect(r.totalServicosGeral).toBeCloseTo(s.totalServicosGeral - 42.9, 2);
    expect(r.totalOrcamento).toBeCloseTo(s.totalOrcamento - (174.1 + 42.9), 2);
  });

  it('nenhum marcado = só a revisão aprovada', () => {
    const r = recalcularComSelecao(s, new Set());
    expect(r.totalOrcamento).toBe(0);
    expect(r.totalPecasGeral).toBeCloseTo(1000, 2); // peças da revisão
    expect(r.totalServicosGeral).toBeCloseTo(1766.23 - 1000, 2);
  });

  it('itens não realizados = desmarcados e a soma deles', () => {
    const sem1e3 = new Set(todos);
    sem1e3.delete(1);
    sem1e3.delete(3);
    const r = itensNaoRealizados(s, sem1e3);
    expect(r.itens.map((i) => i.id)).toEqual([1, 3]);
    expect(r.total).toBeCloseTo(2203.04 + 174.1 + 42.9, 2);
    // todos marcados = nenhum não realizado
    expect(itensNaoRealizados(s, todos).total).toBe(0);
    expect(itensNaoRealizados(s, todos).itens).toEqual([]);
  });
});
