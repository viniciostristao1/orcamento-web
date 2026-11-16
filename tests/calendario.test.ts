// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import React from 'react';
import CalendarioApp from '../src/calendario/CalendarioApp';
import {
  DIAS_SEMANA,
  agruparPorDia,
  avancarMes,
  fatiaDia,
  gradeMes,
  listarLembretesCalendario,
  partesData,
  textoContador,
  tituloMes,
} from '../src/calendario/calendario';

beforeEach(() => {
  localStorage.clear();
});

describe('calendário: datas', () => {
  it('partesData lê ISO com hora e valida o dia real', () => {
    expect(partesData('2026-11-16T09:00')).toEqual({ ano: 2026, mes: 11, dia: 16, hora: '09:00' });
    expect(partesData('2026-01-05')).toEqual({ ano: 2026, mes: 1, dia: 5, hora: '' });
    expect(partesData('')).toBeNull();
    expect(partesData('lixo')).toBeNull();
    expect(partesData(null)).toBeNull();
    expect(partesData('2026-13-01T09:00')).toBeNull();
    expect(partesData('2026-02-31T09:00')).toBeNull();
    expect(partesData('2026-02-28T09:00')).not.toBeNull();
  });

  it('semana começa na segunda-feira', () => {
    expect(DIAS_SEMANA).toEqual(['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']);
    // Junho/2026 começa numa segunda: sem brancos na 1ª semana.
    const junho = gradeMes(2026, 6, new Date(2026, 5, 15));
    expect(junho[0][0]).toEqual({ dia: 1, hoje: false });
    // Novembro/2026 começa num domingo: 6 brancos + dia 1.
    const novembro = gradeMes(2026, 11, new Date(2026, 10, 15));
    expect(novembro[0].slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(novembro[0][6]).toEqual({ dia: 1, hoje: false });
  });

  it('grade cobre o mês inteiro em semanas de 7', () => {
    // Fevereiro/2026: 28 dias começando no domingo → 5 semanas.
    const fev = gradeMes(2026, 2, new Date(2026, 1, 10));
    expect(fev).toHaveLength(5);
    for (const semana of fev) expect(semana).toHaveLength(7);
    expect(fev.flat().filter(Boolean)).toHaveLength(28);
  });

  it('marca o dia de hoje', () => {
    const grade = gradeMes(2026, 11, new Date(2026, 10, 16));
    expect(grade.flat().find((c) => c?.dia === 16)).toEqual({ dia: 16, hoje: true });
    expect(grade.flat().find((c) => c?.dia === 15)).toEqual({ dia: 15, hoje: false });
  });

  it('atravessa o ano nos dois sentidos', () => {
    expect(avancarMes(2026, 12, 1)).toEqual({ ano: 2027, mes: 1 });
    expect(avancarMes(2026, 1, -1)).toEqual({ ano: 2025, mes: 12 });
    expect(avancarMes(2026, 6, 1)).toEqual({ ano: 2026, mes: 7 });
    expect(avancarMes(2026, 6, -1)).toEqual({ ano: 2026, mes: 5 });
    expect(tituloMes(2026, 11)).toBe('Novembro 2026');
  });
});

describe('calendário: fontes de dados (só leitura)', () => {
  const semear = (): void => {
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([
        { id: 'o1', criadoEm: '01/11/2026 10:00:00', placa: 'ABC1D23', lembreteEm: '2026-11-16T09:00' },
        { id: 'o2', criadoEm: '01/12/2026 10:00:00', placa: 'XYZ', lembreteEm: '2026-12-01T09:00' },
        { id: 'o3', criadoEm: '01/11/2026 10:00:00', placa: 'SEM', lembreteEm: 'quebrado' },
      ]),
    );
    localStorage.setItem(
      'flyer_historico_v1',
      JSON.stringify([
        { id: 'f1', criadoEm: '01/11/2026 10:00:00', contato: 'Zé', lembreteEm: '2026-11-16T14:00' },
      ]),
    );
    localStorage.setItem(
      'revisoes_historico_v1',
      JSON.stringify([
        { id: 'r1', criadoEm: '01/11/2026 10:00:00', chassi: '9BW123', lembreteEm: '2026-11-20T08:00' },
      ]),
    );
  };

  it('agrega os três históricos e ignora inválidos e rápidos', () => {
    semear();
    localStorage.setItem(
      'lembretes_rapidos_v1',
      JSON.stringify([
        { id: 'q1', texto: 'avulso', quando: '2026-11-16T09:00', criadoEm: '16/11/2026 09:00:00' },
      ]),
    );
    const lista = listarLembretesCalendario(new Date(2026, 10, 16).getTime());
    expect(lista.map((l) => l.id).sort()).toEqual(['f1', 'o1', 'o2', 'r1']);
    expect(lista.find((l) => l.id === 'o1')).toMatchObject({ tipo: 'orcamento', dia: 16, hora: '09:00' });
    expect(lista.find((l) => l.id === 'f1')).toMatchObject({ tipo: 'pneus' });
    expect(lista.find((l) => l.id === 'r1')).toMatchObject({ tipo: 'revisao' });
  });

  it('agrupa por dia do mês exibido e conta certo', () => {
    semear();
    const lista = listarLembretesCalendario(new Date(2026, 10, 16).getTime());
    const novembro = agruparPorDia(lista, 2026, 11);
    expect([...novembro.values()].reduce((s, itens) => s + itens.length, 0)).toBe(3);
    expect((novembro.get(16) ?? []).map((l) => l.id).sort()).toEqual(['f1', 'o1']);
    expect(agruparPorDia(lista, 2026, 12).get(1)?.map((l) => l.id)).toEqual(['o2']);
    expect(textoContador(0)).toBe('0 lembretes');
    expect(textoContador(1)).toBe('1 lembrete');
    expect(textoContador(3)).toBe('3 lembretes');
  });

  it('mostra os primeiros e indica +N', () => {
    const itens = [1, 2, 3, 4, 5].map((n) => ({
      id: `x${n}`,
      tipo: 'orcamento' as const,
      rotulo: `L${n}`,
      quando: '2026-11-16T09:00',
      ano: 2026,
      mes: 11,
      dia: 16,
      hora: '09:00',
    }));
    expect(fatiaDia(itens)).toEqual({ visiveis: itens.slice(0, 3), extras: 2 });
    expect(fatiaDia(itens.slice(0, 2))).toEqual({ visiveis: itens.slice(0, 2), extras: 0 });
  });
});

describe('calendário: tela', () => {
  const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('abre no mês atual com o dia de hoje destacado e troca de mês/volta', () => {
    render(React.createElement(CalendarioApp));
    const hoje = new Date();
    const tituloAtual = `${MESES[hoje.getMonth()]} ${hoje.getFullYear()}`;
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(tituloAtual);
    // Semana começa na segunda.
    const dias = screen.getAllByText(/^(SEG|TER|QUA|QUI|SEX|SÁB|DOM)$/);
    expect(dias.map((d) => d.textContent)).toEqual(['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']);
    // Dia de hoje destacado (círculo).
    const destaques = document.querySelectorAll('[data-calendario] .rounded-full.bg-slate-800');
    expect(destaques.length).toBe(1);
    expect(destaques[0].textContent).toBe(String(hoje.getDate()));
    // Próximo mês e volta com "Hoje".
    fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
    const prox = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(
      `${MESES[prox.getMonth()]} ${prox.getFullYear()}`,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao mês atual' }));
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(tituloAtual);
  });

  it('mostra os lembretes no dia, o contador e o +N', () => {
    const hoje = new Date();
    const p = (n: number): string => String(n).padStart(2, '0');
    const dia = `${hoje.getFullYear()}-${p(hoje.getMonth() + 1)}-15`;
    localStorage.setItem(
      'orcamentos_historico_v1',
      JSON.stringify([
        { id: 'o1', criadoEm: '01/01/2026 10:00:00', placa: 'AAA', lembreteEm: `${dia}T09:00` },
        { id: 'o2', criadoEm: '01/01/2026 10:00:00', placa: 'BBB', lembreteEm: `${dia}T10:00` },
        { id: 'o3', criadoEm: '01/01/2026 10:00:00', placa: 'CCC', lembreteEm: `${dia}T11:00` },
        { id: 'o4', criadoEm: '01/01/2026 10:00:00', placa: 'DDD', lembreteEm: `${dia}T12:00` },
      ]),
    );
    localStorage.setItem(
      'revisoes_historico_v1',
      JSON.stringify([
        { id: 'r1', criadoEm: '01/01/2026 10:00:00', chassi: 'CHASSI', lembreteEm: `${dia}T08:00` },
      ]),
    );
    render(React.createElement(CalendarioApp));
    // Dia 15 do mês atual: 4 de orçamento + 1 de revisão = 5 (3 visíveis + "+2").
    expect(screen.getByText('5 lembretes')).toBeTruthy();
    expect(screen.getByText('+2')).toBeTruthy();
    // Legenda com os três tipos.
    expect(screen.getByText('Orçamento')).toBeTruthy();
    expect(screen.getByText('Pneus')).toBeTruthy();
    expect(screen.getByText('Revisão')).toBeTruthy();
  });
});
