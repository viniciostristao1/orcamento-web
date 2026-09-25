// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  SCRIPT_LEGADO_KEY,
  SCRIPT_PNEUS_KEY,
  SCRIPT_REVISAO_KEY,
  SCRIPT_REVISAO_PADRAO,
  lerScripts,
  salvarScriptPneus,
  salvarScriptRevisao,
} from '../src/whats/utils/scripts';

describe('scripts do Whats (pneus / revisão)', () => {
  beforeEach(() => localStorage.clear());

  it('primeira vez: revisão com o texto padrão e pneus vazio', () => {
    const s = lerScripts();
    expect(s.revisao).toBe(SCRIPT_REVISAO_PADRAO);
    expect(s.pneus).toBe('');
  });

  it('migra o script antigo (zap_template) para o de revisão', () => {
    localStorage.setItem(SCRIPT_LEGADO_KEY, 'Texto antigo');
    expect(lerScripts().revisao).toBe('Texto antigo');
  });

  it('lê e salva os dois scripts separadamente', () => {
    salvarScriptPneus('Oferta de pneus');
    salvarScriptRevisao('Revisão 60 mil km');
    const s = lerScripts();
    expect(s.pneus).toBe('Oferta de pneus');
    expect(s.revisao).toBe('Revisão 60 mil km');
    expect(localStorage.getItem(SCRIPT_PNEUS_KEY)).toBe('Oferta de pneus');
    expect(localStorage.getItem(SCRIPT_REVISAO_KEY)).toBe('Revisão 60 mil km');
  });
});
