import { describe, expect, it } from 'vitest';
import { restaurarFontesReduzidas } from '../src/utils/exportImage';

describe('restaurarFontesReduzidas', () => {
  it('devolve o font-size original (24px) a partir do reduzido pelo html-to-image (23.9px)', () => {
    const svg = '<span style="font-size: 23.9px; line-height: 32px">x</span>';
    expect(restaurarFontesReduzidas(svg, ['24px'])).toBe(
      '<span style="font-size: 24px; line-height: 32px">x</span>',
    );
  });

  it('corrige também o atalho font (usado no clone)', () => {
    const svg = '<span style="font: 700 23.9px / 32px Inter, sans-serif">x</span>';
    expect(restaurarFontesReduzidas(svg, ['24px'])).toBe(
      '<span style="font: 700 24px / 32px Inter, sans-serif">x</span>',
    );
  });

  it('corrige vários tamanhos de uma vez', () => {
    const svg = 'a{font-size: 23.9px} b{font-size: 15.9px} c{font-size: 12.9px}';
    expect(restaurarFontesReduzidas(svg, ['24px', '16px', '13px'])).toBe(
      'a{font-size: 24px} b{font-size: 16px} c{font-size: 13px}',
    );
  });

  it('não mexe em tamanhos que não foram reduzidos', () => {
    const svg = 'a{font-size: 20px} b{font-size: 10px}';
    expect(restaurarFontesReduzidas(svg, ['20px', '10px'])).toBe(svg);
  });

  it('ignora valores inválidos e duplicados', () => {
    const svg = 'a{font-size: 23.9px}';
    expect(restaurarFontesReduzidas(svg, ['', 'normal', '24px', '24px'])).toBe(
      'a{font-size: 24px}',
    );
  });

  it('restaura tamanhos fracionários (floor - 0.1)', () => {
    const svg = 'a{font-size: 11.9px}';
    expect(restaurarFontesReduzidas(svg, ['12.5px'])).toBe('a{font-size: 12.5px}');
  });
});
