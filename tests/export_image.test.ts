// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
// @ts-ignore: fs só existe no runtime de teste (vitest roda em node)
import { readFileSync } from 'fs';
import {
  PNG_COMPACTO_CLASS,
  prepararClonePng,
  restaurarFontesReduzidas,
} from '../src/utils/exportImage';

declare const process: { cwd(): string };

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

  it('gêmeo off-screen: classe só no clone, mesma largura, fora da tela', () => {
    document.body.innerHTML =
      '<div id="printable-quote" style="width: 896px;"><p>oi</p></div>';
    const original = document.querySelector('#printable-quote') as HTMLElement;
    const { clone, limpar } = prepararClonePng(original);
    // o original não muda (tela e preview intactos)
    expect(original.classList.contains(PNG_COMPACTO_CLASS)).toBe(false);
    expect(original.style.position).not.toBe('fixed');
    expect(document.body.contains(original)).toBe(true);
    // o gêmeo mantém o id (seletores do CSS compacto); o original segue
    // primeiro no documento e é o que o app enxerga
    expect(clone.getAttribute('id')).toBe('printable-quote');
    expect(document.querySelector('#printable-quote')).toBe(original);
    // o gêmeo vai para o body, fora da viewport, com a mesma largura;
    // o esconderijo fica no invólucro (nunca no gêmeo, senão vaza para o SVG)
    expect(clone.classList.contains(PNG_COMPACTO_CLASS)).toBe(true);
    expect(clone.getAttribute('aria-hidden')).toBe('true');
    expect(clone.style.width).toBe('896px');
    expect(clone.style.position).not.toBe('fixed');
    const involucro = clone.parentElement as HTMLElement;
    expect(involucro.style.position).toBe('fixed');
    expect(involucro.style.left).toBe('-10000px');
    expect(document.body.contains(clone)).toBe(true);
    limpar();
    expect(document.body.contains(clone)).toBe(false);
    expect(document.body.contains(involucro)).toBe(false);
    document.body.innerHTML = '';
  });

  it('gêmeo off-screen: sincroniza o estado digitado (textarea/checked)', () => {
    document.body.innerHTML =
      '<div id="printable-quote"><textarea>atual</textarea>' +
      '<input type="checkbox" checked /><input type="text" value="a" /></div>';
    const original = document.querySelector('#printable-quote') as HTMLElement;
    // estado atual (propriedade) diferente do atributo inicial
    const area = original.querySelector('textarea') as HTMLTextAreaElement;
    area.value = 'editado na tela';
    const { clone, limpar } = prepararClonePng(original);
    expect((clone.querySelector('textarea') as HTMLTextAreaElement).value).toBe(
      'editado na tela',
    );
    const check = clone.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(check.checked).toBe(true);
    expect(check.getAttribute('checked')).not.toBeNull();
    limpar();
    document.body.innerHTML = '';
  });

  it('CSS compacto: só respiros, sem altura fixa/min-height/fonte', () => {
    const css = readFileSync(`${process.cwd()}/src/index.css`, 'utf8');
    const bloco = (css as unknown as string).match(
      /#printable-quote\.png-compacto[\s\S]*?\.sm\\:py-4\s*\{[^}]*\}/,
    );
    expect(bloco).not.toBeNull();
    const regras = bloco![0];
    expect(regras).toContain('padding: 24px');
    expect(regras).not.toMatch(/min-height/i);
    expect(regras).not.toMatch(/(?<!min-)height\s*:/i);
    expect(regras).not.toMatch(/font-size/i);
  });

  it('não confunde 10px com 30px (substring)', () => {
    const svg = 'a{font-size: 9.9px} b{font-size: 29.9px}';
    // ordem de 10px antes de 30px: antes virava "210px" no 30px
    expect(restaurarFontesReduzidas(svg, ['10px', '30px'])).toBe('a{font-size: 10px} b{font-size: 30px}');
    expect(restaurarFontesReduzidas(svg, ['30px', '10px'])).toBe('a{font-size: 10px} b{font-size: 30px}');
  });
});
