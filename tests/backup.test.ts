// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  BACKUP_DATA_KEY,
  diasDesdeBackup,
  HISTORICO_KEY,
  montarBackup,
  nomeArquivoBackup,
  precisaLembreteBackup,
  registrarBackup,
  restaurarBackup,
} from '../src/utils/backup';

describe('backup de tudo (Configurações)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('monta o backup só com o que existe no storage', () => {
    localStorage.setItem(HISTORICO_KEY, JSON.stringify([{ id: '1' }]));
    localStorage.setItem('zap_contacts', JSON.stringify([{ id: 'c1' }, { id: 'c2' }]));
    const json = JSON.parse(montarBackup());
    expect(json.app).toBe('toyota-orcamentos-whats');
    expect(json.dados[HISTORICO_KEY]).toHaveLength(1);
    expect(json.dados.zap_contacts).toHaveLength(2);
    expect(json.dados.orcamentos_tema_v1).toBeUndefined();
  });

  it('inclui valores de texto puro (tema e template do Whats)', () => {
    localStorage.setItem('orcamentos_tema_v1', 'claude');
    localStorage.setItem('zap_template', 'Oi, tudo bem?');
    const json = JSON.parse(montarBackup());
    expect(json.dados.orcamentos_tema_v1).toBe('claude');
    expect(json.dados.zap_template).toBe('Oi, tudo bem?');
  });

  it('restaura o backup nas chaves certas e resume os dados', () => {
    const conteudo = JSON.stringify({
      app: 'toyota-orcamentos-whats',
      versao: 2,
      dados: {
        [HISTORICO_KEY]: [{ id: '1' }],
        flyer_historico_v1: [{ id: 'f1' }],
        zap_contacts: [{ id: 'c1' }],
        zap_template: 'Oi',
        orcamentos_tema_v1: 'claude',
        orcamento_rascunho_v1: { descReparo: 'X', orcamentoRaw: 'Y' },
      },
    });
    const r = restaurarBackup(conteudo);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.resumo).toEqual({ orcamentos: 1, flyers: 1, contatos: 1 });
    expect(JSON.parse(localStorage.getItem('zap_contacts') ?? '[]')).toHaveLength(1);
    expect(localStorage.getItem('zap_template')).toBe('Oi');
    expect(localStorage.getItem('orcamentos_tema_v1')).toBe('claude');
  });

  it('restaurar mescla listas por id (não apaga o que já está no navegador)', () => {
    localStorage.setItem(HISTORICO_KEY, JSON.stringify([{ id: '1', placa: 'ATUAL' }]));
    const r = restaurarBackup(
      JSON.stringify({
        app: 'toyota-orcamentos-whats',
        versao: 2,
        dados: { [HISTORICO_KEY]: [{ id: '1', placa: 'BACKUP' }, { id: '2' }] },
      }),
    );
    expect(r.ok).toBe(true);
    const lista = JSON.parse(localStorage.getItem(HISTORICO_KEY) ?? '[]');
    expect(lista).toHaveLength(2); // união, sem duplicar o id 1
    expect(lista.find((i: { id: string }) => i.id === '1').placa).toBe('ATUAL'); // conflito: vale o atual
    expect(lista.find((i: { id: string }) => i.id === '2')).toBeTruthy(); // id novo entra
  });

  it('formato antigo também mescla (não sobrescreve o histórico atual)', () => {
    localStorage.setItem(HISTORICO_KEY, JSON.stringify([{ id: 'atual' }]));
    const r = restaurarBackup(JSON.stringify([{ id: 'atual' }, { id: 'novo' }]));
    expect(r.ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(HISTORICO_KEY) ?? '[]')).toHaveLength(2);
  });

  it('aceita backup antigo (só histórico) e rejeita arquivo inválido', () => {
    const antigo = restaurarBackup(JSON.stringify([{ id: 'a' }, { id: 'b' }]));
    expect(antigo.ok).toBe(true);
    expect(JSON.parse(localStorage.getItem(HISTORICO_KEY) ?? '[]')).toHaveLength(2);

    expect(restaurarBackup('{{{').ok).toBe(false);
    expect(restaurarBackup(JSON.stringify({ dados: { nada: 1 } })).ok).toBe(false);
    expect(restaurarBackup(JSON.stringify({ outra: 'coisa' })).ok).toBe(false);
  });

  it('nome do arquivo leva a data', () => {
    expect(nomeArquivoBackup(new Date(2026, 8, 24, 12))).toBe('backup-toyota-24-09-2026.json');
  });

  it('lembrete de backup: sem dados não avisa; com dados e sem backup avisa', () => {
    expect(precisaLembreteBackup()).toBe(false); // nada salvo: nada a proteger
    localStorage.setItem(HISTORICO_KEY, JSON.stringify([{ id: '1' }]));
    expect(precisaLembreteBackup()).toBe(true); // tem dados e nunca fez
  });

  it('lembrete de backup: feito hoje não avisa; há 30+ dias avisa', () => {
    localStorage.setItem(HISTORICO_KEY, JSON.stringify([{ id: '1' }]));
    registrarBackup(new Date(2026, 9, 7, 12));
    expect(localStorage.getItem(BACKUP_DATA_KEY)).toBeTruthy();
    expect(diasDesdeBackup(new Date(2026, 9, 7, 18))).toBe(0);
    expect(precisaLembreteBackup(new Date(2026, 9, 7, 18))).toBe(false);
    expect(diasDesdeBackup(new Date(2026, 9, 20))).toBe(12);
    expect(precisaLembreteBackup(new Date(2026, 9, 20))).toBe(false);
    expect(precisaLembreteBackup(new Date(2026, 10, 7))).toBe(true); // 31 dias
  });
});
