// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { VERSAO } from '../src/utils/versao';
import pkg from '../package.json';

/**
 * O selo "vX.Y.Z" do cabeçalho (VERSAO) precisa acompanhar a `version` do
 * package.json — já saiu release com o selo defasado (v0.78.0/v0.79.0
 * mostraram "v0.77.0"). Este teste impede a repetição.
 */
describe('versão do selo (utils/versao.ts)', () => {
  it('VERSAO é igual à version do package.json', () => {
    expect(VERSAO).toBe(pkg.version);
    expect(VERSAO).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
