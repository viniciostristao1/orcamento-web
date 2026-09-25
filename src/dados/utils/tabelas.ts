export type AbaDados = 'pecas' | 'os';

export interface TabelaDados {
  id: string;
  criadoEm: string;
  colunas: number;
  /** Títulos (primeira linha, em negrito). */
  titulos: string[];
  /** Linhas de conteúdo (mesma quantidade de colunas). */
  linhas: string[][];
}

export interface DadosTabelas {
  pecas: TabelaDados[];
  os: TabelaDados[];
}

export const DADOS_KEY = 'dados_tabelas_v1';

export const ROTULO_ABA: Record<AbaDados, string> = { pecas: 'Peças', os: "O.S's" };

export const MAX_COLUNAS = 12;

export const estadoInicial = (): DadosTabelas => ({ pecas: [], os: [] });

const normalizarTabela = (t: unknown): TabelaDados | null => {
  const d = t as TabelaDados;
  if (!d || typeof d !== 'object') return null;
  const colunas = Math.max(1, Math.min(MAX_COLUNAS, Number(d.colunas) || 1));
  const titulos = Array.from({ length: colunas }, (_, i) => String(d.titulos?.[i] ?? `Coluna ${i + 1}`));
  const linhas = (Array.isArray(d.linhas) ? d.linhas : []).map((linha) =>
    Array.from({ length: colunas }, (_, i) => String(linha?.[i] ?? '')),
  );
  return {
    id: String(d.id ?? Date.now()),
    criadoEm: String(d.criadoEm ?? ''),
    colunas,
    titulos,
    linhas,
  };
};

const normalizarLista = (lista: unknown): TabelaDados[] =>
  (Array.isArray(lista) ? lista : []).map(normalizarTabela).filter((t): t is TabelaDados => t !== null);

export const lerDados = (storage: Storage = localStorage): DadosTabelas => {
  try {
    const bruto = storage.getItem(DADOS_KEY);
    if (!bruto) return estadoInicial();
    const d = JSON.parse(bruto);
    return { pecas: normalizarLista(d?.pecas), os: normalizarLista(d?.os) };
  } catch {
    return estadoInicial();
  }
};

export const salvarDados = (dados: DadosTabelas, storage: Storage = localStorage): void => {
  try {
    storage.setItem(DADOS_KEY, JSON.stringify(dados));
  } catch {
    /* cota/privacidade: ignora */
  }
};

export const criarTabela = (dados: DadosTabelas, aba: AbaDados, colunas: number): DadosTabelas => {
  const n = Math.max(1, Math.min(MAX_COLUNAS, Math.floor(colunas) || 1));
  const nova: TabelaDados = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criadoEm: new Date().toLocaleString('pt-BR'),
    colunas: n,
    titulos: Array.from({ length: n }, (_, i) => `Coluna ${i + 1}`),
    linhas: [],
  };
  return { ...dados, [aba]: [...dados[aba], nova] };
};

export const removerTabela = (dados: DadosTabelas, aba: AbaDados, id: string): DadosTabelas => ({
  ...dados,
  [aba]: dados[aba].filter((t) => t.id !== id),
});

const atualizarTabela = (
  dados: DadosTabelas,
  aba: AbaDados,
  id: string,
  fn: (t: TabelaDados) => TabelaDados,
): DadosTabelas => ({
  ...dados,
  [aba]: dados[aba].map((t) => (t.id === id ? fn(t) : t)),
});

export const atualizarTitulo = (
  dados: DadosTabelas,
  aba: AbaDados,
  id: string,
  coluna: number,
  valor: string,
): DadosTabelas =>
  atualizarTabela(dados, aba, id, (t) => ({
    ...t,
    titulos: t.titulos.map((v, i) => (i === coluna ? valor : v)),
  }));

export const atualizarCelula = (
  dados: DadosTabelas,
  aba: AbaDados,
  id: string,
  linha: number,
  coluna: number,
  valor: string,
): DadosTabelas =>
  atualizarTabela(dados, aba, id, (t) => ({
    ...t,
    linhas: t.linhas.map((l, r) => (r === linha ? l.map((v, c) => (c === coluna ? valor : v)) : l)),
  }));

export const adicionarLinha = (dados: DadosTabelas, aba: AbaDados, id: string): DadosTabelas =>
  atualizarTabela(dados, aba, id, (t) => ({ ...t, linhas: [...t.linhas, Array.from({ length: t.colunas }, () => '')] }));

export const removerLinha = (dados: DadosTabelas, aba: AbaDados, id: string, linha: number): DadosTabelas =>
  atualizarTabela(dados, aba, id, (t) => ({ ...t, linhas: t.linhas.filter((_, r) => r !== linha) }));

/** Normaliza para busca: sem acentos e minúsculo. */
export const normalizarBusca = (s: string): string =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const celulaContem = (valor: string, termo: string): boolean => {
  const t = normalizarBusca(termo);
  return t.length > 0 && normalizarBusca(valor).includes(t);
};

/** Quantas células (títulos + linhas) de cada aba contêm o termo. */
export const encontrar = (dados: DadosTabelas, termo: string): Record<AbaDados, number> => {
  const t = normalizarBusca(termo);
  const contar = (lista: TabelaDados[]): number => {
    if (!t) return 0;
    let total = 0;
    for (const tabela of lista) {
      for (const v of [...tabela.titulos, ...tabela.linhas.flat()]) {
        if (celulaContem(v, termo)) total++;
      }
    }
    return total;
  };
  return { pecas: contar(dados.pecas), os: contar(dados.os) };
};
