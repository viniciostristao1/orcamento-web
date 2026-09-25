export interface TabelaDados {
  id: string;
  criadoEm: string;
  colunas: number;
  /** Títulos (primeira linha, em negrito). */
  titulos: string[];
  /** Linhas de conteúdo (mesma quantidade de colunas). */
  linhas: string[][];
  /** Largura de cada coluna em px (ajustável arrastando a alça no cabeçalho). */
  larguras: number[];
}

export interface AbaDados {
  id: string;
  rotulo: string;
  tabelas: TabelaDados[];
}

export interface DadosTabelas {
  abas: AbaDados[];
}

export const DADOS_KEY = 'dados_tabelas_v1';

export const MAX_COLUNAS = 12;
export const LARGURA_COLUNA_PADRAO = 170;
export const LARGURA_MIN = 80;
export const LARGURA_MAX = 600;

export const ABA_PECAS = 'pecas';
export const ABA_OS = 'os';

export const estadoInicial = (): DadosTabelas => ({
  abas: [
    { id: ABA_PECAS, rotulo: 'PEÇAS', tabelas: [] },
    { id: ABA_OS, rotulo: "O.S'S", tabelas: [] },
  ],
});

export const limitarLargura = (valor: number): number =>
  Math.max(LARGURA_MIN, Math.min(LARGURA_MAX, Math.round(valor) || LARGURA_COLUNA_PADRAO));

const normalizarTabela = (t: unknown): TabelaDados | null => {
  const d = t as TabelaDados;
  if (!d || typeof d !== 'object') return null;
  const colunas = Math.max(1, Math.min(MAX_COLUNAS, Number(d.colunas) || 1));
  const titulos = Array.from({ length: colunas }, (_, i) => String(d.titulos?.[i] ?? `Coluna ${i + 1}`));
  const linhas = (Array.isArray(d.linhas) ? d.linhas : []).map((linha) =>
    Array.from({ length: colunas }, (_, i) => String(linha?.[i] ?? '')),
  );
  const larguras = Array.from({ length: colunas }, (_, i) =>
    limitarLargura(Number(d.larguras?.[i]) || LARGURA_COLUNA_PADRAO),
  );
  return {
    id: String(d.id ?? Date.now()),
    criadoEm: String(d.criadoEm ?? ''),
    colunas,
    titulos,
    linhas,
    larguras,
  };
};

const normalizarLista = (lista: unknown): TabelaDados[] =>
  (Array.isArray(lista) ? lista : []).map(normalizarTabela).filter((t): t is TabelaDados => t !== null);

const slug = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'aba';

export const lerDados = (storage: Storage = localStorage): DadosTabelas => {
  try {
    const bruto = storage.getItem(DADOS_KEY);
    if (!bruto) return estadoInicial();
    const d = JSON.parse(bruto);

    // Formato novo (abas dinâmicas)
    if (Array.isArray(d?.abas)) {
      const abas: AbaDados[] = (d.abas as unknown[])
        .map((a: unknown): AbaDados | null => {
          const x = a as AbaDados;
          if (!x || typeof x !== 'object') return null;
          return {
            id: String(x.id ?? slug(String(x.rotulo ?? 'aba'))),
            rotulo: String(x.rotulo ?? 'ABA').toUpperCase(),
            tabelas: normalizarLista(x.tabelas),
          };
        })
        .filter((a: AbaDados | null): a is AbaDados => a !== null);
      // garante que PEÇAS e O.S's existam sem descartar o que está salvo
      const faltantes = estadoInicial().abas.filter((p) => !abas.some((a) => a.id === p.id));
      return { abas: [...faltantes, ...abas] };
    }

    // Formato antigo { pecas: [], os: [] } — migra para as abas
    if (d && (Array.isArray(d.pecas) || Array.isArray(d.os))) {
      const base = estadoInicial();
      return {
        abas: base.abas.map((a) => ({
          ...a,
          tabelas: normalizarLista(a.id === ABA_PECAS ? d.pecas : d.os),
        })),
      };
    }
    return estadoInicial();
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

export const criarAba = (dados: DadosTabelas, rotulo: string): DadosTabelas => {
  const nome = (rotulo.trim() || 'Nova aba').toUpperCase();
  return {
    ...dados,
    abas: [...dados.abas, { id: `${slug(rotulo)}-${Date.now().toString(36)}`, rotulo: nome, tabelas: [] }],
  };
};

const atualizarTabela = (
  dados: DadosTabelas,
  abaId: string,
  id: string,
  fn: (t: TabelaDados) => TabelaDados,
): DadosTabelas => ({
  ...dados,
  abas: dados.abas.map((a) =>
    a.id === abaId ? { ...a, tabelas: a.tabelas.map((t) => (t.id === id ? fn(t) : t)) } : a,
  ),
});

export const criarTabela = (dados: DadosTabelas, abaId: string, colunas: number): DadosTabelas => {
  const n = Math.max(1, Math.min(MAX_COLUNAS, Math.floor(colunas) || 1));
  const nova: TabelaDados = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criadoEm: new Date().toLocaleString('pt-BR'),
    colunas: n,
    titulos: Array.from({ length: n }, (_, i) => `Coluna ${i + 1}`),
    linhas: [],
    larguras: Array.from({ length: n }, () => LARGURA_COLUNA_PADRAO),
  };
  return {
    ...dados,
    abas: dados.abas.map((a) => (a.id === abaId ? { ...a, tabelas: [...a.tabelas, nova] } : a)),
  };
};

export const removerTabela = (dados: DadosTabelas, abaId: string, id: string): DadosTabelas => ({
  ...dados,
  abas: dados.abas.map((a) => (a.id === abaId ? { ...a, tabelas: a.tabelas.filter((t) => t.id !== id) } : a)),
});

export const atualizarTitulo = (
  dados: DadosTabelas,
  abaId: string,
  id: string,
  coluna: number,
  valor: string,
): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => ({
    ...t,
    titulos: t.titulos.map((v, i) => (i === coluna ? valor : v)),
  }));

export const atualizarCelula = (
  dados: DadosTabelas,
  abaId: string,
  id: string,
  linha: number,
  coluna: number,
  valor: string,
): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => ({
    ...t,
    linhas: t.linhas.map((l, r) => (r === linha ? l.map((v, c) => (c === coluna ? valor : v)) : l)),
  }));

export const atualizarLargura = (
  dados: DadosTabelas,
  abaId: string,
  id: string,
  coluna: number,
  largura: number,
): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => ({
    ...t,
    larguras: t.larguras.map((v, i) => (i === coluna ? limitarLargura(largura) : v)),
  }));

export const adicionarLinha = (dados: DadosTabelas, abaId: string, id: string): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => ({
    ...t,
    linhas: [...t.linhas, Array.from({ length: t.colunas }, () => '')],
  }));

export const removerLinha = (dados: DadosTabelas, abaId: string, id: string, linha: number): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => ({ ...t, linhas: t.linhas.filter((_, r) => r !== linha) }));

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
export const encontrar = (dados: DadosTabelas, termo: string): Record<string, number> => {
  const t = normalizarBusca(termo);
  const resultado: Record<string, number> = {};
  for (const aba of dados.abas) {
    let total = 0;
    if (t) {
      for (const tabela of aba.tabelas) {
        for (const v of [...tabela.titulos, ...tabela.linhas.flat()]) {
          if (celulaContem(v, termo)) total++;
        }
      }
    }
    resultado[aba.id] = total;
  }
  return resultado;
};
