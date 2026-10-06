// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  agruparLinhasPdf,
  decidirFontePlay,
  extrairCabecalho,
  extrairSistemaToyota,
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
    expect(cab).toEqual({ numero: '4471', placa: 'ABC1D23', nome: 'JOÃO DA SILVA', data: '24/09/2026', telefone: '' });
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

  it('telefone vem do Celular com 55 na frente (cai para Fone)', () => {
    expect(extrairCabecalho('Celular: 51-997831108').telefone).toBe('5551997831108');
    expect(extrairCabecalho('CELULAR 51997831108').telefone).toBe('5551997831108');
    expect(extrairCabecalho('Fone: 51-37485088').telefone).toBe('555137485088');
    // celular tem prioridade sobre o fixo
    expect(extrairCabecalho('Fone: 51-37485088\nCelular: 51-997831108').telefone).toBe('5551997831108');
    // curto demais não vale (não sobrescreve o campo)
    expect(extrairCabecalho('Fone: 1234').telefone).toBe('');
  });
});

describe('decidirFontePlay — qual texto o play soma', () => {
  it('revisão fresca + campos intactos: vale a revisão (2º anexo vence o 1º)', () => {
    expect(
      decidirFontePlay({
        descCampo: '01 VELHO',
        dadosCampo: '1 Peça V 1 10,00',
        revDesc: '01 NOVO',
        revDados: '1 Peça N 1 20,00',
        camposSujos: false,
        revisaoFresca: true,
      }),
    ).toEqual({ desc: '01 NOVO', dados: '1 Peça N 1 20,00', usouRevisao: true });
  });

  it('edição manual nos campos vence a revisão fresca', () => {
    const r = decidirFontePlay({
      descCampo: '01 MANUAL',
      dadosCampo: '1 Peça V 1 10,00',
      revDesc: '01 NOVO',
      revDados: '1 Peça N 1 20,00',
      camposSujos: true,
      revisaoFresca: true,
    });
    expect(r).toEqual({ desc: '01 MANUAL', dados: '1 Peça V 1 10,00', usouRevisao: false });
  });

  it('revisão já usada: vale o campo', () => {
    const r = decidirFontePlay({
      descCampo: '01 VELHO',
      dadosCampo: '1 Peça V 1 10,00',
      revDesc: '01 NOVO',
      revDados: '1 Peça N 1 20,00',
      camposSujos: false,
      revisaoFresca: false,
    });
    expect(r.usouRevisao).toBe(false);
    expect(r.desc).toBe('01 VELHO');
  });

  it('campo vazio cai para a revisão (mesmo já usada)', () => {
    const r = decidirFontePlay({
      descCampo: '',
      dadosCampo: '',
      revDesc: '01 NOVO',
      revDados: '1 Peça N 1 20,00',
      camposSujos: false,
      revisaoFresca: false,
    });
    expect(r).toEqual({ desc: '01 NOVO', dados: '1 Peça N 1 20,00', usouRevisao: false });
  });

  it('sem nada dos dois lados: vazio (play avisa)', () => {
    const r = decidirFontePlay({
      descCampo: '',
      dadosCampo: '',
      revDesc: '',
      revDados: '',
      camposSujos: false,
      revisaoFresca: true,
    });
    expect(r).toEqual({ desc: '', dados: '', usouRevisao: false });
  });
});

describe('extrairSistemaToyota — PDF real do sistema', () => {
  // Trechos do orçamento de verdade (o resto — cabeçalho da empresa, veículo,
  // fechamento, assinaturas — deve ser ignorado).
  const TEXTO = [
    '20234',
    'Empresa: WEIAND VEICULOS LTDA CNPJ: 94.674.934/0001-52',
    'NºOrçamento Interno05/10/2026 Impressão: 09:2309:19Emissao : 05/10/2026',
    'Cliente CadastroCLACI ZANONI RUTHNER',
    'CPF: 466.524.340-91',
    'Reclamações Originais feita pelo Cliente',
    '01 OXI',
    '02 APLICAR VIA TANQUE',
    'Sugestão {peças e serviços}',
    'It Tipo Código Descrição Qtde Preço Unitário Preço TotalDisp',
    '1 Serviço HIGMOTO HIGIENIZACAO AR CONDICIONADO 0,05000 0,000000 0,00',
    '1 Peça CARE010701 OXY-SANITIZATION APP 1 109,900000 109,90',
    '1 Peça CARE040703 AUTO AIR CLEANER (GRANADA) 1 99,730000 99,73',
    '2 Serviço REQ REQUISICAO DE PECAS 0,00000 0,000000 0,00',
    '2 Peça CARE042501 LIMPADOR SISTEMA GASOLINA TUNAP 1 199,890000 199,89',
    'Fechamento (Revisão) (sugestão) (acessórios) (descontos)',
    'Total Líquido',
    '409,52',
  ].join('\n');

  it('DADOS = só os itens (resto ignorado)', () => {
    const sis = extrairSistemaToyota(TEXTO);
    expect(sis.dados.split('\n')).toHaveLength(5);
    expect(sis.dados).toContain('1 Peça CARE010701 OXY-SANITIZATION APP 1 109,900000 109,90');
    expect(sis.dados).toContain('2 Peça CARE042501 LIMPADOR SISTEMA GASOLINA TUNAP 1 199,890000 199,89');
    expect(sis.dados).not.toContain('WEIAND');
    expect(sis.dados).not.toContain('Fechamento');
  });

  it('DESCRIÇÃO = reclamações originais', () => {
    expect(extrairSistemaToyota(TEXTO).descReparo).toBe('01 OXI\n02 APLICAR VIA TANQUE');
  });

  it('cliente sem o "Cadastro" colado, número = 1º do documento, data do cabeçalho', () => {
    const sis = extrairSistemaToyota(TEXTO);
    expect(sis.cliente).toBe('CLACI ZANONI RUTHNER');
    expect(sis.numero).toBe('20234');
    expect(sis.data).toBe('05/10/2026');
  });
});
