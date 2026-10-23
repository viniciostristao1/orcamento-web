// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  calcularRitmo,
  diferencaDias,
  extrairNumeroRevisao,
  formatarKmPorDia,
  limparDescricaoRevisao,
  ordenarPorData,
  parseTextoRevisoes,
  projetarProxima,
  somarMeses,
  textoPassagensParaCopiar,
  parseDataPtBr,
} from '../src/revisoes/utils/parseRevisoes';
import {
  adicionarAhistoricoRevisoes,
  atualizarChamadoRevisao,
  atualizarContatoRevisao,
  atualizarDataPrevista,
  atualizarLembreteRevisao,
  atualizarNotaRevisao,
  dataPtBrParaInput,
  dataPtBrParaISOManha,
  inputParaDataPtBr,
  isoParaDataPtBr,
  lerUltimaBusca,
  listarHistoricoRevisoes,
  ordenarPorPrevisao,
  removerDoHistoricoRevisoes,
  salvarUltimaBusca,
  textoListaParaExcel,
  REVISOES_HISTORICO_KEY,
  REVISOES_ULTIMA_BUSCA_KEY,
} from '../src/revisoes/utils/historicoRevisoes';
import { CHAVES_BACKUP } from '../src/utils/backup';

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

const EXEMPLO_SW4 = `Chassi: 8AJBA3FS9R0361321\tAno Fab./Mod.: 2024/2024\tProdução: 14/03/2024\tTipo de uso(venda): Comercial
Veículo: SW4 SUV HIGH + Diamond\tKatashiki: GUN156L-SGTHXG\tVenda: 28/03/2024\tEntrega: 12/04/2024
Distribuidor de venda: 1437507 - SAVAR 2000 LTDA\t
Posição
Abertura
KM
Distribuidor
OS
Sts
Item
Tipo
Descrição
2\t11/06/2026\t70805\t1421420 - WEIAND VEICULOS LTDA\t168948\tF\t1\tCSP\t6 REVISAO 60 000 GUN15640B1D33
Outros\t\t\t2\tCSD\tCLIENTE SOLICITA BALANCEAMENTO
Outros\t\t\t3\tCSD\tCLIENTE SOLICITA ALINHAMENTO
Outros\t\t\t4\tCSD\tTR PASTILHAS DE FREIO TRAS RETIFICA DO
3\t25/03/2026\t60419\t1421420 - WEIAND VEICULOS LTDA\t166846\tF\t1\tCSP\t5 REVISAO 50 000 GUN15640B1C83
Outros\t\t\t2\tCSD\tCLIENTE SOLICITA ALINHAMENTO
Outros\t\t\t3\tCSD\tKIT REVISAO
Outros\t\t\t4\tCSD\tCLIENTE SOLICITA BALANACEAMENTO
Outros\t\t\t5\tCSR\tCLIENTE ALEGA TREPIDACAO AO FREAR
4\t05/12/2025\t48469\t1421420 - WEIAND VEICULOS LTDA\t164130\tF\t1\tCSP\t4 REVISAO 40 000 GUN15640B1C23
Outros\t\t\t2\tCSD\tCLIENTE SOLICITA BALANCEAMENTO
Outros\t\t\t3\tCSD\tCLIENTE SOLICITA ALINHAMENTO`;

const EXEMPLO_UMA = `Chassi: 8AJBA3FS9R0361321
Veículo: SW4 SUV HIGH + Diamond\tKatashiki: GUN156L-SGTHXG
2\t11/06/2026\t70805\t1421420 - WEIAND VEICULOS LTDA\t168948\tF\t1\tCSP\t6 REVISAO 60 000 GUN15640B1D33`;

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

  it('projeta a próxima: 70.306 km (última + 10 mil exatos)', () => {
    const d = parseTextoRevisoes(EXEMPLO);
    const p = projetarProxima(d.passagens);
    expect(p).not.toBeNull();
    expect(p!.baseAbertura).toBe('14/10/2026');
    expect(p!.baseKm).toBe(60306);
    expect(p!.kmAlvo).toBe(70306);
    expect(p!.dataLimite).toBe('14/10/2027');
    expect(p!.revisaoAtual).toBe(6);
    expect(p!.revisaoProxima).toBe(7);
    // ritmo: com 4 passagens há média (previsão = mais próxima entre ritmo e limite)
    expect(p!.kmPorDia).not.toBeNull();
    expect(p!.dataPrevista).toBeTruthy();
  });

  it('SW4: ritmo prevê setembro/2026 bem antes do limite 11/06/2027', () => {
    const d = parseTextoRevisoes(EXEMPLO_SW4);
    expect(d.chassi).toBe('8AJBA3FS9R0361321');
    expect(d.passagens).toHaveLength(3);
    const ritmo = calcularRitmo(d.passagens);
    expect(ritmo).not.toBeNull();
    expect(ritmo!.numIntervalos).toBe(2);
    expect(ritmo!.diasTotais).toBe(188);
    expect(ritmo!.kmTotais).toBe(22336);
    expect(ritmo!.kmPorDia).toBeCloseTo(118.8, 1);
    expect(diferencaDias('05/12/2025', '25/03/2026')).toBe(110);
    expect(diferencaDias('25/03/2026', '11/06/2026')).toBe(78);
    const p = projetarProxima(d.passagens);
    expect(p!.kmAlvo).toBe(80805);
    expect(p!.dataLimite).toBe('11/06/2027');
    expect(p!.dataEstimadaPorRitmo).toBe('04/09/2026');
    expect(p!.dataPrevista).toBe('04/09/2026');
    expect(p!.motivoPrevisao).toBe('ritmo');
    expect(formatarKmPorDia(p!.kmPorDia!)).toContain('118,');
  });

  it('sem 2 passagens não há ritmo (vale o limite)', () => {
    const d = parseTextoRevisoes(EXEMPLO_UMA);
    const p = projetarProxima(d.passagens);
    expect(p!.kmPorDia).toBeNull();
    expect(p!.dataEstimadaPorRitmo).toBeNull();
    expect(p!.dataPrevista).toBe(p!.dataLimite);
    expect(p!.motivoPrevisao).toBe('limite');
    expect(calcularRitmo([])).toBeNull();
  });

  it('km alvo é a última + 10.000 exatos (sem arredondar)', () => {
    const d = parseTextoRevisoes(EXEMPLO);
    expect(projetarProxima(d.passagens)!.kmAlvo).toBe(60306 + 10000);
    const sw4 = parseTextoRevisoes(EXEMPLO_SW4);
    expect(projetarProxima(sw4.passagens)!.kmAlvo).toBe(70805 + 10000);
  });

  it('copiar passagens: "DATA - KM km - REVISÃO", sem OS e sem extras', () => {
    const d = parseTextoRevisoes(EXEMPLO_SW4);
    const texto = textoPassagensParaCopiar(ordenarPorData(d.passagens).reverse());
    const linhas = texto.split('\n');
    expect(linhas).toHaveLength(3);
    expect(linhas[0]).toBe('11/06/2026 - 70.805 km - REVISAO 60 000');
    expect(linhas[2]).toBe('05/12/2025 - 48.469 km - REVISAO 40 000');
    expect(texto).not.toContain('168948');
    expect(texto).not.toContain('164130');
    expect(texto).not.toContain('item(ns) extra');
    expect(textoPassagensParaCopiar([])).toBe('');
  });

  it('descrição curta: sem tipo (CSP/CSR/...) e sem código final', () => {
    expect(limparDescricaoRevisao('CSP REVISAO 06 60000 NSP151LHHXR06')).toBe('REVISAO 06 60000');
    expect(limparDescricaoRevisao('CSP 5 REVISAO 50 000 NSP15110B3C83')).toBe('REVISAO 50 000');
    expect(limparDescricaoRevisao('CSP 6 REVISAO 60 000 GUN15640B1D33')).toBe('REVISAO 60 000');
    expect(limparDescricaoRevisao('GSE REVISAO 07 70000 GUN15640B1D44')).toBe('REVISAO 07 70000');
    // números puros e palavras no fim ficam
    expect(limparDescricaoRevisao('CSP REVISAO 06 60000')).toBe('REVISAO 06 60000');
    expect(limparDescricaoRevisao('CSD TROCA DE OLEO')).toBe('CSD TROCA DE OLEO');
    // nunca volta vazio
    expect(limparDescricaoRevisao('CSP')).toBe('CSP');
  });

  it('copiar lista: cabeçalho + TABs para o Excel', () => {
    const texto = textoListaParaExcel([
      {
        id: 'r1',
        criadoEm: '23/10/2026',
        chassi: '8AJBA3FS9R0361321',
        veiculo: 'SW4 SUV HIGH + Diamond',
        nome: 'JOAO',
        telefone: '51 99999-9999',
        ultimaAbertura: '11/06/2026',
        ultimoKm: 70805,
        kmAlvo: 80805,
        revisaoProxima: 7,
        dataPrevista: '04/09/2026',
      },
    ]);
    const linhas = texto.split('\n');
    expect(linhas[0]).toBe('CHASSI\tVEÍCULO\tNOME\tWHATSAPP\tPREVISÃO\tKM ALVO\tREV\tÚLTIMA\tÚLTIMO KM');
    expect(linhas[1]).toBe(
      '8AJBA3FS9R0361321\tSW4 SUV HIGH + Diamond\tJOAO\t51 99999-9999\t04/09/2026\t80805\t07\t11/06/2026\t70805',
    );
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

describe('revisões — lista de previsões (chassi + data)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const item = (chassi: string, dataPrevista: string, lembreteEm: string | null = null) => ({
    chassi,
    veiculo: 'YARIS HB XL PLUS CON AT',
    nome: '',
    telefone: '',
    ultimaAbertura: '14/10/2026',
    ultimoKm: 60306,
    kmAlvo: 70000,
    revisaoProxima: 7,
    dataPrevista,
    lembreteEm,
    observacao: '',
  });

  it('conversões de data (lista, input e lembrete)', () => {
    expect(dataPtBrParaInput('14/10/2027')).toBe('2027-10-14');
    expect(dataPtBrParaInput('lixo')).toBe('');
    expect(dataPtBrParaInput('99/99/9999')).toBe('');
    expect(inputParaDataPtBr('2027-10-14')).toBe('14/10/2027');
    expect(inputParaDataPtBr('2027-13-40')).toBe('');
    expect(isoParaDataPtBr('2027-10-14T09:00')).toBe('14/10/2027');
    expect(isoParaDataPtBr(null)).toBe('');
    expect(dataPtBrParaISOManha('14/10/2027')).toBe('2027-10-14T09:00');
    // mantém a hora ao mover a data
    expect(dataPtBrParaISOManha('15/11/2027', '2027-10-14T15:30')).toBe('2027-11-15T15:30');
    expect(dataPtBrParaISOManha('lixo')).toBeNull();
  });

  it('adiciona chassi + previsão com nome/telefone e lembrete', () => {
    const out = adicionarAhistoricoRevisoes({
      ...item('9BRKC9F35M8127574', '14/10/2027', '2027-10-14T09:00'),
      nome: 'JOAO',
      telefone: '51 99999-9999',
    });
    expect(out).toHaveLength(1);
    expect(out[0].chassi).toBe('9BRKC9F35M8127574');
    expect(out[0].nome).toBe('JOAO');
    expect(out[0].telefone).toBe('51 99999-9999');
    expect(out[0].dataPrevista).toBe('14/10/2027');
    expect(listarHistoricoRevisoes()).toHaveLength(1);
    // persiste na chave própria (entra no backup)
    expect(JSON.parse(localStorage.getItem(REVISOES_HISTORICO_KEY) ?? '[]')).toHaveLength(1);
  });

  it('mesmo chassi atualiza em vez de duplicar (nome vazio mantém)', () => {
    adicionarAhistoricoRevisoes({ ...item('ABC123', '14/10/2027'), nome: 'JOAO', telefone: '51 1111-1111' });
    const out = adicionarAhistoricoRevisoes({ ...item('abc123', '15/11/2027'), nome: '', telefone: '' });
    expect(out).toHaveLength(1);
    expect(out[0].dataPrevista).toBe('15/11/2027');
    expect(out[0].nome).toBe('JOAO');
    expect(out[0].telefone).toBe('51 1111-1111');
  });

  it('editar a data move o lembrete junto (mantém a hora)', () => {
    const [criado] = adicionarAhistoricoRevisoes(item('ABC123', '14/10/2027', '2027-10-14T15:30'));
    const out = atualizarDataPrevista(criado.id, '20/12/2027');
    expect(out[0].dataPrevista).toBe('20/12/2027');
    expect(out[0].lembreteEm).toBe('2027-12-20T15:30');
    // data inválida não salva
    expect(atualizarDataPrevista(criado.id, 'lixo')[0].dataPrevista).toBe('20/12/2027');
  });

  it('contato, lembrete e remoção', () => {
    const [criado] = adicionarAhistoricoRevisoes(item('ABC123', '14/10/2027'));
    expect(atualizarContatoRevisao(criado.id, 'MARIA', '51 98888-7777')[0]).toMatchObject({
      nome: 'MARIA',
      telefone: '51 98888-7777',
    });
    expect(atualizarLembreteRevisao(criado.id, '2027-10-14T09:00', 'chamar')[0]).toMatchObject({
      lembreteEm: '2027-10-14T09:00',
      observacao: 'chamar',
    });
    expect(atualizarLembreteRevisao(criado.id, null)[0].lembreteEm).toBeNull();
    expect(removerDoHistoricoRevisoes(criado.id)).toHaveLength(0);
  });

  it('chamado: marca/desmarca e recolar o chassi não apaga', () => {
    const [criado] = adicionarAhistoricoRevisoes(item('ABC123', '14/10/2027'));
    expect(listarHistoricoRevisoes()[0].chamado).toBeFalsy();
    atualizarChamadoRevisao(criado.id, true);
    expect(listarHistoricoRevisoes()[0].chamado).toBe(true);
    adicionarAhistoricoRevisoes(item('ABC123', '15/11/2027')); // mesmo chassi → atualiza
    expect(listarHistoricoRevisoes()).toHaveLength(1);
    expect(listarHistoricoRevisoes()[0].chamado).toBe(true);
    atualizarChamadoRevisao(criado.id, false);
    expect(listarHistoricoRevisoes()[0].chamado).toBe(false);
  });

  it('nota: salva e recolar o chassi não apaga', () => {
    const [criado] = adicionarAhistoricoRevisoes(item('ABC123', '14/10/2027'));
    expect(listarHistoricoRevisoes()[0].nota ?? '').toBe('');
    atualizarNotaRevisao(criado.id, 'Trocar pastilhas na próxima');
    expect(listarHistoricoRevisoes()[0].nota).toBe('Trocar pastilhas na próxima');
    adicionarAhistoricoRevisoes(item('ABC123', '15/11/2027')); // mesmo chassi → atualiza
    expect(listarHistoricoRevisoes()[0].nota).toBe('Trocar pastilhas na próxima');
    atualizarNotaRevisao(criado.id, '');
    expect(listarHistoricoRevisoes()[0].nota).toBe('');
  });

  it('ordena pela previsão (mais próxima primeiro)', () => {
    adicionarAhistoricoRevisoes(item('C2', '20/12/2027'));
    adicionarAhistoricoRevisoes(item('C1', '14/10/2027'));
    expect(ordenarPorPrevisao(listarHistoricoRevisoes()).map((r) => r.chassi)).toEqual(['C1', 'C2']);
  });

  it('lembrete da revisão entra no sino global', async () => {
    adicionarAhistoricoRevisoes(item('ABC123', '14/10/2027', '2020-01-01T09:00'));
    const { listarLembretesVencidos, listarTodosLembretes } = await import('../src/utils/lembretes');
    expect(listarLembretesVencidos().some((l) => l.origem === 'revisao')).toBe(true);
    expect(listarTodosLembretes().some((l) => l.origem === 'revisao')).toBe(true);
  });

  it('última busca: salva, lê, ignora inválida e entra no backup', () => {
    expect(lerUltimaBusca()).toBe('');
    salvarUltimaBusca('20/10/2026');
    expect(lerUltimaBusca()).toBe('20/10/2026');
    expect(localStorage.getItem(REVISOES_ULTIMA_BUSCA_KEY)).toBe('20/10/2026');
    salvarUltimaBusca('lixo');
    expect(lerUltimaBusca()).toBe('20/10/2026');
    salvarUltimaBusca('');
    expect(lerUltimaBusca()).toBe('');
    expect(localStorage.getItem(REVISOES_ULTIMA_BUSCA_KEY)).toBeNull();
    expect(CHAVES_BACKUP).toContain(REVISOES_ULTIMA_BUSCA_KEY);
  });
});
