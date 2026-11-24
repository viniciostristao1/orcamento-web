// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import RevisoesApp from '../src/revisoes/RevisoesApp';
import {
  REVISOES_HISTORICO_KEY,
  REVISOES_ULTIMA_BUSCA_KEY,
  type RevisaoAgendada,
} from '../src/revisoes/utils/historicoRevisoes';

Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});

const item = (id: string, chassi: string, dataPrevista: string): RevisaoAgendada => ({
  id,
  criadoEm: '20/11/2026 10:00:00',
  chassi,
  veiculo: 'HILUX',
  nome: 'JOAO',
  telefone: '51999999999',
  ultimaAbertura: '20/11/2025',
  ultimoKm: 10000,
  kmAlvo: 20000,
  revisaoProxima: 2,
  dataPrevista,
  motivoPrevisao: 'limite',
  ritmoKmPorDia: null,
  lembreteEm: null,
  chamado: false,
  nota: '',
  observacao: '',
});

const CHASSI_A = '8AJYY59G4F6528539'; // prevista 10/12/2026
const CHASSI_B = '9BRBY3BE1T4079731'; // prevista 15/01/2027

const semear = (busca: string | null) => {
  localStorage.setItem(
    REVISOES_HISTORICO_KEY,
    JSON.stringify([item('a', CHASSI_A, '10/12/2026'), item('b', CHASSI_B, '15/01/2027')]),
  );
  if (busca === null) localStorage.removeItem(REVISOES_ULTIMA_BUSCA_KEY);
  else localStorage.setItem(REVISOES_ULTIMA_BUSCA_KEY, busca);
};

const cartoes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-revisao]')).map(
    (d) => d.querySelector('p')?.textContent?.slice(0, 17),
  );

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('destaque sem apagar a data (aba Revisões)', () => {
  it('data setada + destaque em item filtrado: campo e storage intactos, card visível e contador correto', () => {
    semear('20/01/2027'); // esconde A e B
    const { container, rerender } = render(<RevisoesApp destaqueId={null} destaqueVez={0} />);
    expect(cartoes(container)).toEqual([]);
    // destaca B (fora do filtro): entra na lista com o anel, sem tocar na data
    rerender(<RevisoesApp destaqueId="b" destaqueVez={1} />);
    const campo = screen.getByLabelText('Data inicial') as HTMLInputElement;
    expect(campo.value).toBe('2027-01-20');
    expect(localStorage.getItem(REVISOES_ULTIMA_BUSCA_KEY)).toBe('20/01/2027');
    expect(cartoes(container)).toEqual([CHASSI_B]);
    expect(container.querySelector('[data-destaque="1"]')).not.toBeNull();
    // contador reflete o pin: 1 visível de 1 (0 no período + 1 pinado)
    fireEvent.click(screen.getByRole('button', { name: 'Buscar na lista' }));
    expect(screen.getByText('1 de 1')).toBeTruthy();
  });

  it('o pin solta quando a data muda (volta a filtrar normal)', () => {
    semear('20/01/2027');
    const { container, rerender } = render(<RevisoesApp destaqueId={null} destaqueVez={0} />);
    rerender(<RevisoesApp destaqueId="b" destaqueVez={1} />);
    expect(cartoes(container)).toEqual([CHASSI_B]);
    // usuário muda a data: B volta a passar no filtro por conta própria
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-12-01' } });
    expect((screen.getByLabelText('Data inicial') as HTMLInputElement).value).toBe('2026-12-01');
    expect(localStorage.getItem(REVISOES_ULTIMA_BUSCA_KEY)).toBe('01/12/2026');
    expect(cartoes(container)).toEqual([CHASSI_A, CHASSI_B]);
  });

  it('o pin solta quando a busca muda (sem ficar fixo)', () => {
    semear('20/01/2027');
    const { container, rerender } = render(<RevisoesApp destaqueId={null} destaqueVez={0} />);
    rerender(<RevisoesApp destaqueId="b" destaqueVez={1} />);
    expect(cartoes(container)).toEqual([CHASSI_B]);
    fireEvent.click(screen.getByRole('button', { name: 'Buscar na lista' }));
    fireEvent.change(screen.getByLabelText('Buscar por nome ou chassi'), { target: { value: 'ZZZ' } });
    expect(cartoes(container)).toEqual([]);
    expect(screen.getByText(/Nenhuma previsão com “ZZZ”/)).toBeTruthy();
  });

  it('destaque de id inexistente não quebra a lista', () => {
    semear('01/12/2026');
    const { container, rerender } = render(<RevisoesApp destaqueId={null} destaqueVez={0} />);
    expect(cartoes(container)).toEqual([CHASSI_A, CHASSI_B]);
    rerender(<RevisoesApp destaqueId="fantasma" destaqueVez={1} />);
    expect(cartoes(container)).toEqual([CHASSI_A, CHASSI_B]);
    expect((screen.getByLabelText('Data inicial') as HTMLInputElement).value).toBe('2026-12-01');
  });
});
