// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  RAPIDOS_KEY,
  criarRapido,
  listarRapidos,
  removerRapido,
} from '../src/utils/lembretesRapidos';
import { CHAVES_BACKUP } from '../src/utils/backup';
import { listarTodosLembretes, listarLembretesVencidos } from '../src/utils/lembretes';

describe('lembretes rápidos do sino', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('cria com texto + data/hora (valida os dois)', () => {
    expect(criarRapido('', '2026-10-12T09:00').ok).toBe(false);
    expect(criarRapido('Ligar', '').ok).toBe(false);
    const r = criarRapido('Ligar para o João', '2026-10-12T09:00');
    expect(r.ok).toBe(true);
    expect(listarRapidos()).toHaveLength(1);
    expect(listarRapidos()[0].texto).toBe('Ligar para o João');
  });

  it('remove por id', () => {
    const r = criarRapido('A', '2026-10-12T09:00');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    removerRapido(r.item.id);
    expect(listarRapidos()).toHaveLength(0);
  });

  it('rápido vencido entra no popup; futuro, na lista do sino', () => {
    criarRapido('Vencido', '2020-01-01T09:00');
    criarRapido('Futuro', '2999-01-01T09:00');
    expect(listarLembretesVencidos().map((v) => v.rotulo)).toEqual(['Vencido']);
    expect(listarLembretesVencidos()[0].origem).toBe('rapido');
    expect(listarTodosLembretes().map((l) => l.rotulo)).toEqual(['Vencido', 'Futuro']);
  });

  it('entra no backup geral', () => {
    expect(CHAVES_BACKUP).toContain(RAPIDOS_KEY);
  });
});
