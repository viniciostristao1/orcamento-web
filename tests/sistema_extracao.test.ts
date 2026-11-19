// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  agruparLinhasPdf,
  decidirFontePlay,
  ehLayoutComplementar,
  extrairCabecalho,
  extrairComplementar,
  extrairSistemaToyota,
  normalizarTextoExtraido,
  vinDigitoOk,
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
    expect(cab).toEqual({ numero: '4471', placa: 'ABC1D23', nome: 'JOÃO DA SILVA', data: '24/09/2026', telefone: '', chassi: '' });
  });

  it('acha o chassi rotulado (CHASSI / Nr.Fab / VIN)', () => {
    expect(extrairCabecalho('CHASSI: 9BRKC3F33R8269071').chassi).toBe('9BRKC3F33R8269071');
    expect(extrairCabecalho('Nr.Fab 9BRKC3F33R8269071').chassi).toBe('9BRKC3F33R8269071');
    expect(extrairCabecalho('VIN: 9BRKC3F33R8269071').chassi).toBe('9BRKC3F33R8269071');
  });

  it('acha o chassi avulso no layout Toyota (rótulos numa linha, valores noutra)', () => {
    const cab = extrairCabecalho(
      [
        'Veículo Produto/Modelo: TOY YARIS HATCH / YARIS HB XLS AT TSS Nr.Fab Cor Externa: Linha: Placa: Ano/Modelo: KM: Hr: Combustivel:',
        '23/24 JCH7I07 29872 0 9BRKC3F33R8269071',
        '1 Peça X 1 10,00',
      ].join('\n'),
    );
    expect(cab.chassi).toBe('9BRKC3F33R8269071');
    expect(cab.placa).toBe('JCH7I07');
  });

  it('não inventa chassi (curto demais ou só dígitos longos não valem)', () => {
    expect(extrairCabecalho('CHASSI: ABC123').chassi).toBe('');
    expect(extrairCabecalho('1 Peça 044650K401 JOGO PASTILHAS 1.245,00').chassi).toBe('');
  });

  it('ignora palavra de 17 letras (ex.: RESPONSABILIZAMOS) e pega o VIN depois', () => {
    const cab = extrairCabecalho(
      [
        'NOS RESPONSABILIZAMOS PELA QUALIDADE',
        'Nr.Fab Cor Externa: Linha: Placa: Ano/Modelo: KM:',
        '23/24 JCH7I07 29872 0 8AJYY59G4F6528539',
      ].join('\n'),
    );
    expect(cab.chassi).toBe('8AJYY59G4F6528539');
    expect(extrairCabecalho('CHASSI: RESPONSABILIZAMOS').chassi).toBe('');
  });

  it('acha o VIN fragmentado com um espaço no meio (corte do PDF/OCR)', () => {    expect(extrairCabecalho('KM: 135396 Hr: 0\n8AJYY59G4 F6528539').chassi).toBe('8AJYY59G4F6528539');
    // pedaço curto + resto não vale ("0 8AJYY59G4F65285" não é VIN)
    expect(extrairCabecalho('Hr: 0 8AJYY59G4F65285').chassi).toBe('');
    // com o VIN inteiro na linha, vale ele (não a junção com a palavra ao lado)
    expect(extrairCabecalho('0 8AJYY59G4F6528539 PRETO').chassi).toBe('8AJYY59G4F6528539');
    // dois espaços (OCR) e palavra colada depois também valem
    expect(extrairCabecalho('VIN 8AJY Y59G4 F6528539').chassi).toBe('8AJYY59G4F6528539');
    expect(extrairCabecalho('0 8AJYY59G4 F6528539 PRETO').chassi).toBe('8AJYY59G4F6528539');
  });

  it('linha de item não vira chassi (código + palavras somam 17 à toa)', () => {
    expect(
      extrairCabecalho('2 Peça CARE040703 AUTO AIR CLEANER (GRANADA) 1 110,600000 110,60').chassi,
    ).toBe('');
  });

  it('dígito verificador do VIN (ISO 3779, posição 9)', () => {
    expect(vinDigitoOk('9BRBY3BE1T4079731')).toBe(true);
    expect(vinDigitoOk('8AJYY59G4F6528539')).toBe(true);
    expect(vinDigitoOk('9BRKC3F33R8269071')).toBe(true);
    // colado com dígito vizinho não valida (nem como está)
    expect(vinDigitoOk('09BRBY3BE1T407973')).toBe(false);
    expect(vinDigitoOk('09BRBY3BE1T4079731')).toBe(false);
    expect(vinDigitoOk('RESPONSABILIZAMOS')).toBe(false);
    expect(vinDigitoOk('ABC123')).toBe(false);
  });

  it('VIN colado com dígito do campo vizinho: vale o que tem dígito válido', () => {
    // Hr "0" grudado no VIN (extração real do Print-5.pdf); o RG+MOINHOS das
    // linhas de cima não pode vencer
    const cab = extrairCabecalho(
      [
        'RG: 4027856436',
        'MOINHOS',
        '25/26',
        'TRD0I70',
        '9677',
        '09BRBY3BE1T4079731',
        '2 Peça CARE040703 AUTO AIR CLEANER (GRANADA) 1 99,73',
      ].join('\n'),
    );
    expect(cab.chassi).toBe('9BRBY3BE1T4079731');
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

describe('extrairComplementar — ORÇAMENTO DE SERVIÇOS COMPLEMENTARES (JBG-6E46)', () => {
  // Trecho normalizado do PDF real (JBG-6E46.pdf): 5 blocos + inicial aprovado.
  const TEXTO_COMPL = [
    'TOYOTA WEIAND LAJEADO',
    'ORÇAMENTO DE SERVIÇOS COMPLEMENTARES',
    'Nº: 19384736944',
    'Nome Cliente: LISANDRA CRISTINE FRANCK HARRES',
    'Placa: JBG-6E46 KM: 65330 Data Aprovação: 17/11/2026 15:47:51',
    'Data de Criação: 17/11/2026 15:13:47',
    'Serviços contratados inicialmente e aprovados pelo orçamento inicial R$ 3.040,92',
    'Serviços Complementares Aprovados',
    'Bucha da barra',
    'Código Peça Descrição Qtd Preço Unit Estoque Total Peças',
    '488150K090|1 BUCHA BARRA ESTABILI 2 R$ 155,00 Sim R$ 310,00',
    'Código MO Descrição Tempo MO Custo MO',
    'GUN126L43021 BUCHA DA BARRA ESTABILIZADORA DIANTEIRA 0.50/h R$ 114,75',
    'Total Peças: R$ 310,00 | Total MO: R$ 114,75 | Total do Serviço: R$ 424,75',
    'Bateria',
    'Código Peça Descrição Qtd Preço Unit Estoque Total Peças',
    '388000M475|1 BATERIA 12V / 75AH, 1 R$ 856,70 Sim R$ 856,70',
    'Código MO Descrição Tempo MO Custo MO',
    'GUN126L19001 BATERIA UMA 0.10/h R$ 4,59',
    'Total Peças: R$ 856,70 | Total MO: R$ 4,59 | Total do Serviço: R$ 861,29',
    'Oxi',
    'Código Peça Descrição Qtd Preço Unit Estoque Total Peças',
    'CARE010701 OXY-SANITIZATION APP 1 R$ 115,00 Sim R$ 115,00',
    'CARE040703 AUTO AIR CLEANER (GRANADA) 1 R$ 109,73 Sim R$ 109,73',
    'Código MO Descrição Tempo MO Custo MO',
    'HIGMOTO HIGIENIZACAO AR CONDICIONADO 0.05/h R$ 22,95',
    'Total Peças: R$ 224,73 | Total MO: R$ 22,95 | Total do Serviço: R$ 247,68',
    'Limpeza bico dpf',
    'Código Peça Descrição Qtd Preço Unit Estoque Total Peças',
    'CARE040501 LIMPADOR DPF TUNAP 1 R$ 309,47 Sim R$ 309,47',
    'Código MO Descrição Tempo MO Custo MO',
    'LIMPDPF LIMPEZA DO DPF 1.00/h R$ 459,00',
    'Total Peças: R$ 423,13 | Total MO: R$ 459,00 | Total do Serviço: R$ 882,13',
    'Borachinha do limpador',
    'Código Peça Descrição Qtd Preço Unit Estoque Total Peças',
    '8521428090|1 BORRACHA LIMPADOR DI 1 R$ 69,00 Sim R$ 69,00',
    'Código MO Descrição Tempo MO Custo MO',
    'GUN156L85009 BORRACHA DO LIMPADOR DIANTEIRO AMBOS OS 0.10/h R$ 4,59',
    'Total Peças: R$ 148,00 | Total MO: R$ 4,59 | Total do Serviço: R$ 152,59',
    'Total Orçamento Inicial + Serviços Complementares Aprovados',
    '1 x R$ 5.609,36',
  ].join('\n');

  it('detecta o layout complementar (e não o Toyota antigo)', () => {
    expect(ehLayoutComplementar(TEXTO_COMPL)).toBe(true);
    expect(ehLayoutComplementar('It Tipo Código Descrição\n1 Peça X 1 10,00')).toBe(false);
  });

  it('inicial aprovado, número, placa, cliente e data de criação', () => {
    const c = extrairComplementar(TEXTO_COMPL);
    expect(c.revisaoInicial).toBe('3.040,92');
    expect(c.numero).toBe('19384736944');
    expect(c.placa).toBe('JBG-6E46');
    expect(c.cliente).toBe('LISANDRA CRISTINE FRANCK HARRES');
    expect(c.data).toBe('17/11/2026');
  });

  it('DESCRIÇÃO numerada na ordem do PDF (layout novo não numera)', () => {
    const c = extrairComplementar(TEXTO_COMPL);
    expect(c.descReparo.split('\n')).toEqual([
      '01 Bucha da barra',
      '02 Bateria',
      '03 HIGIENIZAÇÃO DO AR CONDICIONADO',
      '04 Limpeza bico dpf',
      '05 Borachinha do limpador',
    ]);
  });

  it('DADOS com 1 Serviço por item usando o Total do Serviço', () => {
    const c = extrairComplementar(TEXTO_COMPL);
    const linhas = c.dados.split('\n');
    expect(linhas).toHaveLength(5);
    expect(linhas[0]).toContain('424,75');
    expect(linhas[1]).toContain('861,29');
    expect(linhas[2]).toContain('247,68');
    expect(linhas[3]).toContain('882,13');
    expect(linhas[4]).toContain('152,59');
    expect(linhas[0]).toMatch(/^1 Serviço /);
    expect(linhas[4]).toMatch(/^5 Serviço /);
  });

  it('soma dos 5 Serviços + inicial = total do rodapé', () => {
    const c = extrairComplementar(TEXTO_COMPL);
    const totais = c.dados
      .split('\n')
      .map((l) => l.trim().split(/\s+/).pop() ?? '0');
    const soma = totais.reduce((acc, v) => acc + parseFloat(v.replace(/\./g, '').replace(',', '.')), 0);
    expect(soma).toBeCloseTo(2568.44, 2);
    expect(soma + 3040.92).toBeCloseTo(5609.36, 2);
  });

  it('aguenta o texto cru (rótulo e valor em linhas separadas)', () => {
    const CRU = [
      'ORÇAMENTO DE SERVIÇOS COMPLEMENTARES',
      'Nº: 19384736944',
      'Nome Cliente:',
      'LISANDRA CRISTINE FRANCK HARRES',
      'Placa: JBG-6E46',
      'Data de Criação: 17/11/2026 15:13:47',
      'Serviços contratados inicialmente e aprovados pelo orçamento inicial R$ 3.040,92',
      'Serviços Complementares Aprovados',
      'Bucha da barra',
      'Código Peça',
      'Descrição',
      '488150K090|1',
      'BUCHA BARRA ESTABILI',
      'Código MO',
      'Descrição',
      'GUN126L43021',
      'BUCHA DA BARRA ESTABILIZADORA DIANTEIRA',
      'Total Peças: R$ 310,00 | Total MO: R$ 114,75 | Total do Serviço: R$ 424,75',
    ].join('\n');
    expect(ehLayoutComplementar(CRU)).toBe(true);
    const c = extrairComplementar(CRU);
    expect(c.cliente).toBe('LISANDRA CRISTINE FRANCK HARRES');
    expect(c.descReparo).toBe('01 Bucha da barra');
    expect(c.dados).toMatch(/^1 Serviço GUN126L43021 Bucha da barra 424,75$/);
  });

  it('4376: bloco sem "Total do Serviço" vale Total Peças + Total MO', () => {
    // 2º bloco (VIA TANQUE, MO zerada) traz só "Total Peças: R$ 209,89".
    const TEXTO_4376 = [
      'TOYOTA WEIAND LAJEADO',
      'ORÇAMENTO DE SERVIÇOS COMPLEMENTARES',
      'Nº: 19384739535',
      'Nome Cliente: SALETE POZZEBON SCHOTT',
      'Placa: KM: 4375 Data de Criação: 18/11/2026 09:07:07',
      'Serviços contratados inicialmente e aprovados pelo orçamento inicial R$ 1.065,45',
      'Serviços Complementares Orçados',
      'Oxi, granada e via tanque',
      'Código Peça Descrição Qtd Preço Unit Estoque Total Peças',
      'CARE010701|1 OXY-SANITIZATION APP 1 R$ 115,00 Sim R$ 115,00',
      'Código MO Descrição Tempo MO Custo MO',
      'HIGMOTO HIGIENIZACAO AR CONDICIONADO 0.05/h R$ 22,95',
      'Total Peças: R$ 224,73 | Total MO: R$ 22,95 | Total do Serviço: R$ 247,68',
      'VIA TANQUE',
      'Código Peça Descrição Qtd Preço Unit Estoque Total Peças',
      'CARE042501|1 LIMPADOR SISTEMA GASOLINA TUNAP 1 R$ 209,89 Sim R$ 209,89',
      'Código MO Descrição Tempo MO Custo MO',
      'REQ REQUISICAO DE PECAS 0.00/h R$ 0,00',
      'Total Peças: R$ 209,89',
      'Total Orçamento Inicial + Serviços Complementares Aprovados',
      '1 x R$ 1.523,02',
    ].join('\n');
    expect(ehLayoutComplementar(TEXTO_4376)).toBe(true);
    const c = extrairComplementar(TEXTO_4376);
    expect(c.revisaoInicial).toBe('1.065,45');
    expect(c.numero).toBe('19384739535');
    expect(c.cliente).toBe('SALETE POZZEBON SCHOTT');
    expect(c.data).toBe('18/11/2026');
    expect(c.descReparo.split('\n')).toEqual([
      '01 HIGIENIZAÇÃO DO AR CONDICIONADO, granada e via tanque',
      '02 VIA TANQUE',
    ]);
    const linhas = c.dados.split('\n');
    expect(linhas).toHaveLength(2);
    expect(linhas[0]).toContain('247,68');
    expect(linhas[1]).toMatch(/^2 Serviço REQ VIA TANQUE 209,89$/);
  });
});

describe('18503 Giordano — complementar com telefone mascarado e sem VIN', () => {
  // Cabeçalho real do 18503.pdf como sai do pdf.js (rótulo e valor do
  // telefone na mesma linha; Nº e marca em linhas seguidas).
  const TEXTO_18503 = [
    'ORÇAMENTO DE SERVIÇOS COMPLEMENTARES',
    'Nº: 19384747853',
    'TOYOTA WEIAND LAJEADO',
    '94.674.934/0001-52',
    'Rodovia ERS-130, São Cristóvão N*2388 - KM72,8',
    '(51) 99743-0519',
    'Nome Cliente: GIORDANO WAGNER BRANDELLI',
    'Telefone: (51) *******-0333',
    'E-mail: gio*********@***mail.com',
    'Modelo Veículo: COROLLA - FLEX 2023 - 2023 OS: 173057',
    'Placa: JCH-1B08 KM: 18503 Data de Criação: 19/11/2026 09:15:53',
    'Consultor: Vinicios Tristão Mecânico: Arthur Delavy Nyland',
  ].join('\n');

  it('não junta Nº + marca no chassi (sem VIN → vazio)', () => {
    expect(extrairCabecalho(TEXTO_18503).chassi).toBe('');
  });

  it('telefone mascarado não vale (nem o da loja, sem rótulo)', () => {
    expect(extrairCabecalho(TEXTO_18503).telefone).toBe('');
    expect(extrairCabecalho('Telefone: (51) ******-9538').telefone).toBe('');
  });

  it('número, placa e data do complementar continuam', () => {
    const cab = extrairCabecalho(TEXTO_18503);
    expect(cab.numero).toBe('19384747853');
    expect(cab.placa).toBe('JCH-1B08');
    expect(cab.data).toBe('19/11/2026');
  });
});

describe('chassi só com formato VIN (17, sem I/O/Q)', () => {
  it('rotulado com O (ex.: Nº + marca) não vale', () => {
    expect(extrairCabecalho('CHASSI: 19384747853TOYOTA').chassi).toBe('');
    expect(extrairCabecalho('CHASSI: 19384736944TOYOTA').chassi).toBe('');
  });

  it('VIN real sem I/O/Q continua valendo (rotulado e avulso)', () => {
    expect(extrairCabecalho('CHASSI: 9BRBY3BE1T4079731').chassi).toBe('9BRBY3BE1T4079731');
    const cab = extrairCabecalho(
      [
        'Celular: 51-997831108',
        'Veículo Produto/Modelo: COROLLA / COROLLA ALTIS Nr.Fab Cor Externa: Linha: Placa: Ano/Modelo: KM: Hr:',
        '25/26 TRD0I70 9677 0 9BRBY3BE1T4079731',
        '2 Peça CARE042501 LIMPADOR SISTEMA GASOLINA TUNAP 1 199,89',
      ].join('\n'),
    );
    expect(cab.chassi).toBe('9BRBY3BE1T4079731');
    expect(cab.telefone).toBe('5551997831108');
  });

  it('layout antigo com Celular + VIN (caso Cleides) segue intacto', () => {
    const cab = extrairCabecalho(
      [
        'Fone: 51-37411469',
        'Celular: 51-999960699',
        'Veículo Produto/Modelo: TOY HILUX Nr.Fab Cor Externa: Linha: Placa: Ano/Modelo: KM: Hr:',
        '12/12 ITE-8995 100099 0 8AJFY29G0C8504809',
      ].join('\n'),
    );
    expect(cab.telefone).toBe('5551999960699');
    expect(cab.chassi).toBe('8AJFY29G0C8504809');
  });
});
