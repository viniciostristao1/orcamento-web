import { describe, expect, it } from 'vitest';
import {
  extrairNumeroRevisao,
  ordenarPorData,
  parseTextoRevisoes,
  projetarProxima,
  proximoMultiplo10k,
  somarMeses,
  parseDataPtBr,
} from '../src/revisoes/utils/parseRevisoes';

const EXEMPLO = `Chassi: 9BRKC9F35M8127574\tAno Fab./Mod.: 2020/2021\tProdução: 14/12/2020\tTipo de uso(venda): Particular
Veículo: YARIS HB XL PLUS CON AT\tKatashiki: NSP151L-HHXRGG\tVenda: 12/01/2021\tEntrega: 15/01/2021
Distribuidor de venda: 1421420 - WEIAND VEICULOS LTDA\t
Ciclo Toyota:\t
 Não\t Sim
Restrição de Garantia:\t
Revisão Facilitada: *\t
 Não\t Sim
Campanha de Serviço: Não existente\t
Seminovo certificado: *\t
 Não\t Sim
Toyota 10 - Vigência: 15/01/2026 a 30/12/2026 Km: 52260 a 62260
* Consultar elegibilidade em "(ver detalhes)"
Posição
Abertura
KM
Distribuidor
OS
Sts
Item
Tipo
Descrição
2\t14/10/2026\t60306\t1421420 - WEIAND VEICULOS LTDA\t172129\tF\t1\tCSP\tREVISAO 06 60000 NSP151LHHXR06
Outros\t\t\t2\tCSD\tCAR LUBRIFICACAO PARTES MOVEIS
Outros\t\t\t3\tCSD\tCAR ADITIVO SHAMPOO PARABRISA TODOS OS
Outros\t\t\t4\tCSD\tCLIENTE SOLICITA ALINHAMENTO
Outros\t\t\t5\tCSD\tCLIENTE SOLICITA BALANCEAMENTO
Outros\t\t\t6\tCSR\tTR FILTRO AR DO MOTOR
Outros\t\t\t7\tCSR\tOXI
Outros\t\t\t8\tCSR\tREALIZAR LIMPEZA DE VALVULAS
3\t30/12/2025\t52260\t1421420 - WEIAND VEICULOS LTDA\t164853\tF\t1\tCSP\t5 REVISAO 50 000 NSP15110B3C83
Outros\t\t\t2\tCSR\tTR FILTRO AC OXI
Outros\t\t\t3\tCSR\tVIA TANQUE
Outros\t\t\t4\tCSR\tTR BORRACHA DAS PALHETAS
4\t08/01/2025\t43066\t1421420 - WEIAND VEICULOS LTDA\t155651\tF\t1\tCSP\t4 REVISAO 40 000 NSP15110B3C23
5\t10/01/2024\t29980\t1421420 - WEIAND VEICULOS LTDA\t147148\tF\t1\tCSP\t3 REVISAO 30000 NSP15110B3B73`;

describe('revisões — parse do portal Toyota', () => {
  it('extrai chassi, veículo e Toyota 10', () => {
    const d = parseTextoRevisoes(EXEMPLO);
    expect(d.chassi).toBe('9BRKC9F35M8127574');
    expect(d.anoFabMod).toBe('2020/2021');
    expect(d.producao).toBe('14/12/2020');
    expect(d.veiculo).toContain('YARIS');
    expect(d.katashiki).toBe('NSP151L-HHXRGG');
    expect(d.venda).toBe('12/01/2021');
    expect(d.entrega).toBe('15/01/2021');
    expect(d.distribuidorVenda).toContain('WEIAND');
    expect(d.toyota10).toEqual({
      vigenciaInicio: '15/01/2026',
      vigenciaFim: '30/12/2026',
      kmDe: 52260,
      kmAte: 62260,
    });
  });

  it('extrai as 4 passagens com data, km, OS e descrição', () => {
    const d = parseTextoRevisoes(EXEMPLO);
    expect(d.passagens).toHaveLength(4);
    const porData = ordenarPorData(d.passagens);
    expect(porData.map((p) => p.abertura)).toEqual([
      '10/01/2024',
      '08/01/2025',
      '30/12/2025',
      '14/10/2026',
    ]);
    expect(porData.map((p) => p.km)).toEqual([29980, 43066, 52260, 60306]);
    expect(porData[3].os).toBe('172129');
    expect(porData[3].descricao).toContain('REVISAO 06');
    expect(porData[3].extras.length).toBeGreaterThanOrEqual(7);
    expect(porData[2].extras.length).toBeGreaterThanOrEqual(3);
  });

  it('projeta a próxima: 70.000 km ou 14/10/2027', () => {
    const d = parseTextoRevisoes(EXEMPLO);
    const p = projetarProxima(d.passagens);
    expect(p).not.toBeNull();
    expect(p!.baseAbertura).toBe('14/10/2026');
    expect(p!.baseKm).toBe(60306);
    expect(p!.kmAlvo).toBe(70000);
    expect(p!.dataLimite).toBe('14/10/2027');
    expect(p!.revisaoAtual).toBe(6);
    expect(p!.revisaoProxima).toBe(7);
  });

  it('km alvo é o próximo múltiplo de 10k', () => {
    expect(proximoMultiplo10k(60306)).toBe(70000);
    expect(proximoMultiplo10k(52260)).toBe(60000);
    expect(proximoMultiplo10k(60000)).toBe(70000);
    expect(proximoMultiplo10k(10000)).toBe(20000);
  });

  it('data limite soma 12 meses (29/02 vira 28/02)', () => {
    expect(parseDataPtBr('30/12/2025')).not.toBeNull();
    expect(parseDataPtBr('99/99/9999')).toBeNull();
    const base = parseDataPtBr('14/10/2026')!;
    const soma = somarMeses(base, 12);
    expect(`${String(soma.getDate()).padStart(2, '0')}/${String(soma.getMonth() + 1).padStart(2, '0')}/${soma.getFullYear()}`).toBe(
      '14/10/2027',
    );
  });

  it('nº da revisão em formatos variados', () => {
    expect(extrairNumeroRevisao('CSP REVISAO 06 60000 NSP151LHHXR06')).toBe(6);
    expect(extrairNumeroRevisao('5 REVISAO 50 000 NSP15110B3C83')).toBe(5);
    expect(extrairNumeroRevisao('3 REVISAO 30000 NSP15110B3B73')).toBe(3);
    expect(extrairNumeroRevisao('TROCA DE OLEO')).toBeNull();
  });

  it('sem passagem não há projeção', () => {
    expect(projetarProxima([])).toBeNull();
    expect(parseTextoRevisoes('nada aqui').passagens).toHaveLength(0);
  });
});
