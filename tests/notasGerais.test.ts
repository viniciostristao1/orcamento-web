// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  NOTAS_GERAIS_KEY,
  criarNotaGeral,
  excluirNotaGeral,
  listarNotasGerais,
  salvarNotaGeral,
} from '../src/utils/notasGerais';
import { CHAVES_BACKUP, montarBackup, restaurarBackup } from '../src/utils/backup';

describe('notas gerais (bloco ao lado do sino)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('cria, salva, limpa (via salvar vazio) e exclui', () => {
    expect(listarNotasGerais()).toEqual([]);
    const lista = criarNotaGeral();
    expect(lista).toHaveLength(1);
    const id = lista[0].id;
    expect(lista[0].texto).toBe('');

    salvarNotaGeral(id, 'Melhorar o texto do flyer');
    expect(listarNotasGerais()[0].texto).toBe('Melhorar o texto do flyer');
    expect(listarNotasGerais()[0].atualizadoEm).toBeTruthy();

    salvarNotaGeral(id, '');
    expect(listarNotasGerais()[0].texto).toBe('');

    excluirNotaGeral(id);
    expect(listarNotasGerais()).toEqual([]);
  });

  it('nova nota entra no topo', () => {
    const a = criarNotaGeral()[0].id;
    salvarNotaGeral(a, 'primeira');
    const b = criarNotaGeral()[0].id;
    expect(listarNotasGerais().map((n) => n.id)).toEqual([b, a]);
  });

  it('entra no backup e restaura mesclando por id', () => {
    criarNotaGeral();
    const id = listarNotasGerais()[0].id;
    salvarNotaGeral(id, 'Lembrar de revisar preços');
    expect(CHAVES_BACKUP).toContain(NOTAS_GERAIS_KEY);
    const json = JSON.parse(montarBackup());
    expect(json.dados[NOTAS_GERAIS_KEY]).toHaveLength(1);

    localStorage.clear();
    const r = restaurarBackup(
      JSON.stringify({ app: 'x', versao: 2, dados: { [NOTAS_GERAIS_KEY]: [{ id, texto: 'BACKUP' }] } }),
    );
    expect(r.ok).toBe(true);
    expect(listarNotasGerais()[0].texto).toBe('BACKUP');
  });
});
