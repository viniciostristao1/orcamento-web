// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { RASCUNHO_KEY } from '../src/utils/rascunho';
import { ULTIMO_KEY } from '../src/utils/ultimoOrcamento';

// O jsdom não implementa scrollIntoView, mas o app chama num setTimeout.
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});

afterEach(() => {
  cleanup();
  localStorage.removeItem(RASCUNHO_KEY);
  localStorage.removeItem(ULTIMO_KEY);
  localStorage.removeItem('orcamentos_historico_v1');
});

const gerar = (lista: string, revisao: string, parcelas: string) => {
  render(<App />);
  fireEvent.change(screen.getByLabelText('Itens do adicional'), { target: { value: lista } });
  fireEvent.change(screen.getByLabelText('Revisão aprovada (R$)'), { target: { value: revisao } });
  fireEvent.change(screen.getByLabelText('Parcelas'), { target: { value: parcelas } });
  fireEvent.click(screen.getByRole('button', { name: 'Gerar orçamento' }));
};

// O jsdom não resolve as classes do Tailwind (sem motor de CSS): a garantia
// estrutural aqui é a CLASSE aplicada — a mesma que o navegador usa na
// prévia, no clone do PNG e na impressão (nó único, sem estilos por caminho).
const el = (txt: RegExp): HTMLElement => {
  const e = screen.getByText(txt);
  if (!(e instanceof HTMLElement)) throw new Error(`não achado: ${txt}`);
  return e;
};

describe('resumo financeiro nunca sobrepõe (prévia, PNG e impressão)', () => {
  it('rótulos e valores em 1 linha, com respiro e sem leading apertado', () => {
    gerar('1\tPastilha de freio\tR$ 500,00\n2\tMão de obra troca\tR$ 290,26', '1838,52', '10');
    // Rótulos fixos nunca quebram (nowrap + sem encolher no flex).
    for (const r of [/^Revisão Aprovada:$/, /^Orçamento Adicional:$/, /^Parcelamento \(10x\):$/i, /^Total:$/]) {
      expect(el(r).className).toContain('whitespace-nowrap');
    }
    // Valores à direita também não quebram ("10 × 262,88" não se desloca).
    expect(el(/^10 × /).className).toContain('whitespace-nowrap');
    expect(el(/^2\.628,78$/).className).toContain('whitespace-nowrap');
    // Caixas de linha com folga (leading-none estoura em fonte reserva).
    expect(el(/^Total:$/).className).toContain('leading-tight');
    expect(el(/^Total:$/).className).not.toContain('leading-none');
    // Respiro entre as linhas.
    const caixas = [...document.querySelectorAll('#printable-quote .max-w-xl')];
    expect(caixas.length).toBeGreaterThan(0);
    for (const c of caixas) expect((c as HTMLElement).className).not.toMatch(/(^|\s)space-y-0\.5(\s|$)/);
  });

  it('linha de data/loja sem leading apertado', () => {
    gerar('1\tPastilha de freio\tR$ 500,00', '1838,52', '10');
    const doc = document.querySelector('#printable-quote .uppercase.tracking-\\[0\\.2em\\]');
    expect(doc).not.toBeNull();
    // leading-[1.1] vira snug: cabe em qualquer fonte.
    expect((doc as HTMLElement).className).toContain('leading-snug');
  });

  it('totais de não aprovados seguem o mesmo padrão', () => {
    gerar('1\tPastilha de freio\tR$ 500,00\n2\tMão de obra troca\tR$ 290,26', '1838,52', '10');
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como não aprovado' }));
    expect(el(/^Total Não Aprovado:$/).className).toContain('whitespace-nowrap');
    expect(el(/^Total Geral:$/).className).toContain('whitespace-nowrap');
    // Descrições livres continuam podendo quebrar (sem nowrap), valores não.
    expect(el(/^790,26$/).className).toContain('whitespace-nowrap');
  });
});
