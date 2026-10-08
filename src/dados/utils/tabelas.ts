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
  /** Mostra a caixinha de seleção no fim de cada linha (risca a linha quando marcada). */
  comCaixas: boolean;
  /** Estado das caixinhas, alinhado com `linhas`. */
  marcados: boolean[];
}

/** Caixa de anotação da sub-aba (tamanho ajustável arrastando as bordas). */
export interface NotaDados {
  id: string;
  criadoEm: string;
  texto: string;
  largura: number;
  altura: number;
}

export interface AbaDados {
  id: string;
  rotulo: string;
  tabelas: TabelaDados[];
  notas: NotaDados[];
  /**
   * Ordem dos blocos na tela (ids de tabelas e notas misturados) — permite
   * deixar uma nota acima/entre tabelas arrastando pela alça de 6 pontinhos.
   */
  ordem: string[];
}

export interface DadosTabelas {
  abas: AbaDados[];
}

export const DADOS_KEY = 'dados_tabelas_v1';

/**
 * Evento disparado na window a cada salvamento — os atalhos de sub-abas (na aba
 * Orçamentos) se atualizam na mesma hora (`storage` sozinho só avisa outras
 * janelas, não a própria).
 */
export const DADOS_EVENTO = 'dados:atualizados';

/**
 * Disparado ao limpar a busca na aba Dados (X do "Pesquisar nas tabelas") — o
 * campo da lupa do MENU DADOS (aba Orçamentos) limpa junto.
 */
export const DADOS_BUSCA_LIMPA_EVENTO = 'dados:busca-limpa';

/**
 * A busca da lupa ("Pesquisar nas tabelas" + BUSCAR do MENU DADOS) limpa
 * sozinha após este tempo sem digitar (1 min) — evita grifo velho na tela.
 */
export const BUSCA_AUTO_LIMPA_MS = 60_000;

export const MAX_COLUNAS = 12;
export const LARGURA_COLUNA_PADRAO = 170;
export const LARGURA_MIN = 80;
export const LARGURA_MAX = 600;

export const NOTA_LARGURA_PADRAO = 340;
export const NOTA_ALTURA_PADRAO = 150;
export const NOTA_LARGURA_MIN = 160;
export const NOTA_LARGURA_MAX = 1200;
export const NOTA_ALTURA_MIN = 80;
export const NOTA_ALTURA_MAX = 800;

export const ABA_PECAS = 'pecas';
export const ABA_OS = 'os';

export const estadoInicial = (): DadosTabelas => ({
  abas: [
    { id: ABA_PECAS, rotulo: 'PEÇAS', tabelas: [], notas: [], ordem: [] },
    { id: ABA_OS, rotulo: "O.S'S", tabelas: [], notas: [], ordem: [] },
  ],
});

export const limitarLargura = (valor: number): number =>
  Math.max(LARGURA_MIN, Math.min(LARGURA_MAX, Math.round(valor) || LARGURA_COLUNA_PADRAO));

export const limitarNotaLargura = (valor: number): number =>
  Math.max(NOTA_LARGURA_MIN, Math.min(NOTA_LARGURA_MAX, Math.round(valor) || NOTA_LARGURA_PADRAO));

export const limitarNotaAltura = (valor: number): number =>
  Math.max(NOTA_ALTURA_MIN, Math.min(NOTA_ALTURA_MAX, Math.round(valor) || NOTA_ALTURA_PADRAO));

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
  const marcados = Array.from({ length: linhas.length }, (_, i) => Boolean(d.marcados?.[i]));
  return {
    id: String(d.id ?? Date.now()),
    criadoEm: String(d.criadoEm ?? ''),
    colunas,
    titulos,
    linhas,
    larguras,
    comCaixas: d.comCaixas !== false,
    marcados,
  };
};

const normalizarLista = (lista: unknown): TabelaDados[] =>
  (Array.isArray(lista) ? lista : []).map(normalizarTabela).filter((t): t is TabelaDados => t !== null);

const normalizarNota = (n: unknown): NotaDados | null => {
  const x = n as NotaDados;
  if (!x || typeof x !== 'object') return null;
  return {
    id: String(x.id ?? Date.now()),
    criadoEm: String(x.criadoEm ?? ''),
    texto: String(x.texto ?? ''),
    largura: limitarNotaLargura(Number(x.largura)),
    altura: limitarNotaAltura(Number(x.altura)),
  };
};

const normalizarNotas = (lista: unknown): NotaDados[] =>
  (Array.isArray(lista) ? lista : []).map(normalizarNota).filter((n): n is NotaDados => n !== null);

/**
 * Normaliza a ordem dos blocos: mantém só ids que existem e acrescenta no fim
 * o que ficou de fora (registros antigos não tinham `ordem`).
 */
const normalizarOrdem = (bruta: unknown, tabelas: TabelaDados[], notas: NotaDados[]): string[] => {
  const validos = new Set<string>([...tabelas.map((t) => t.id), ...notas.map((n) => n.id)]);
  const ordem = (Array.isArray(bruta) ? bruta : []).map(String).filter((id) => validos.has(id));
  const vistos = new Set(ordem);
  for (const t of tabelas) if (!vistos.has(t.id)) { ordem.push(t.id); vistos.add(t.id); }
  for (const n of notas) if (!vistos.has(n.id)) { ordem.push(n.id); vistos.add(n.id); }
  return ordem;
};

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
          const tabelas = normalizarLista(x.tabelas);
          const notas = normalizarNotas(x.notas);
          return {
            id: String(x.id ?? slug(String(x.rotulo ?? 'aba'))),
            rotulo: String(x.rotulo ?? 'ABA').toUpperCase(),
            tabelas,
            notas,
            ordem: normalizarOrdem(x.ordem, tabelas, notas),
          };
        })
        .filter((a: AbaDados | null): a is AbaDados => a !== null);
      // respeita o que está salvo (o usuário pode apagar sub-abas) — mas nunca
      // devolve uma lista vazia
      return { abas: abas.length > 0 ? abas : estadoInicial().abas };
    }

    // Formato antigo { pecas: [], os: [] } — migra para as abas
    if (d && (Array.isArray(d.pecas) || Array.isArray(d.os))) {
      const base = estadoInicial();
      return {
        abas: base.abas.map((a) => {
          const tabelas = normalizarLista(a.id === ABA_PECAS ? d.pecas : d.os);
          return { ...a, tabelas, ordem: normalizarOrdem(undefined, tabelas, []) };
        }),
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
    abas: [...dados.abas, { id: `${slug(rotulo)}-${Date.now().toString(36)}`, rotulo: nome, tabelas: [], notas: [], ordem: [] }],
  };
};

/** Apaga uma sub-aba (e as tabelas dela). Nunca deixa a lista vazia. */
export const removerAba = (dados: DadosTabelas, id: string): DadosTabelas => {
  const abas = dados.abas.filter((a) => a.id !== id);
  return { abas: abas.length > 0 ? abas : estadoInicial().abas };
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

export const criarTabela = (
  dados: DadosTabelas,
  abaId: string,
  colunas: number,
  comCaixas = true,
): DadosTabelas => {
  const n = Math.max(1, Math.min(MAX_COLUNAS, Math.floor(colunas) || 1));
  const nova: TabelaDados = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criadoEm: new Date().toLocaleString('pt-BR'),
    colunas: n,
    titulos: Array.from({ length: n }, (_, i) => `Coluna ${i + 1}`),
    linhas: [],
    larguras: Array.from({ length: n }, () => LARGURA_COLUNA_PADRAO),
    comCaixas,
    marcados: [],
  };
  return {
    ...dados,
    abas: dados.abas.map((a) =>
      a.id === abaId ? { ...a, tabelas: [...a.tabelas, nova], ordem: [...a.ordem, nova.id] } : a,
    ),
  };
};

export const removerTabela = (dados: DadosTabelas, abaId: string, id: string): DadosTabelas => ({
  ...dados,
  abas: dados.abas.map((a) =>
    a.id === abaId
      ? { ...a, tabelas: a.tabelas.filter((t) => t.id !== id), ordem: a.ordem.filter((b) => b !== id) }
      : a,
  ),
});

/** Cria uma nota vazia na sub-aba (tamanho padrão, ajustável depois). */
export const criarNota = (dados: DadosTabelas, abaId: string): DadosTabelas => {
  const nota: NotaDados = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criadoEm: new Date().toLocaleString('pt-BR'),
    texto: '',
    largura: NOTA_LARGURA_PADRAO,
    altura: NOTA_ALTURA_PADRAO,
  };
  return {
    ...dados,
    abas: dados.abas.map((a) =>
      a.id === abaId ? { ...a, notas: [...a.notas, nota], ordem: [...a.ordem, nota.id] } : a,
    ),
  };
};

const atualizarNota = (
  dados: DadosTabelas,
  abaId: string,
  notaId: string,
  fn: (n: NotaDados) => NotaDados,
): DadosTabelas => ({
  ...dados,
  abas: dados.abas.map((a) =>
    a.id === abaId ? { ...a, notas: a.notas.map((n) => (n.id === notaId ? fn(n) : n)) } : a,
  ),
});

/** Edita o texto da nota (a borracha usa com texto vazio). */
export const atualizarTextoNota = (
  dados: DadosTabelas,
  abaId: string,
  notaId: string,
  texto: string,
): DadosTabelas => atualizarNota(dados, abaId, notaId, (n) => ({ ...n, texto }));

/** Ajusta o tamanho da nota (arrastar as bordas), com limites. */
export const atualizarTamanhoNota = (
  dados: DadosTabelas,
  abaId: string,
  notaId: string,
  largura: number,
  altura: number,
): DadosTabelas =>
  atualizarNota(dados, abaId, notaId, (n) => ({
    ...n,
    largura: limitarNotaLargura(largura),
    altura: limitarNotaAltura(altura),
  }));

export const removerNota = (dados: DadosTabelas, abaId: string, notaId: string): DadosTabelas => ({
  ...dados,
  abas: dados.abas.map((a) =>
    a.id === abaId
      ? {
          ...a,
          notas: a.notas.filter((n) => n.id !== notaId),
          ordem: a.ordem.filter((b) => b !== notaId),
        }
      : a,
  ),
});

/**
 * Move a nota `notaId` para a posição de outro bloco (`destinoId` pode ser uma
 * nota OU uma tabela) na ordem da tela — assim dá para soltar a nota acima ou
 * entre tabelas. Sem mexer nos demais blocos.
 */
export const moverNota = (
  dados: DadosTabelas,
  abaId: string,
  notaId: string,
  destinoId: string,
): DadosTabelas => {
  if (notaId === destinoId) return dados;
  return {
    ...dados,
    abas: dados.abas.map((a) => {
      if (a.id !== abaId || !a.notas.some((n) => n.id === notaId)) return a;
      const de = a.ordem.indexOf(notaId);
      const para = a.ordem.indexOf(destinoId);
      if (de < 0 || para < 0) return a;
      const ordem = [...a.ordem];
      const [movida] = ordem.splice(de, 1);
      ordem.splice(para, 0, movida);
      return { ...a, ordem };
    }),
  };
};

/**
 * Move QUALQUER bloco (tabela ou nota) para a posição de outro bloco
 * (`destinoId` pode ser nota ou tabela) na ordem da tela — a alça de
 * 6 pontinhos das tabelas usa esta (a das notas usa `moverNota`, mesma lógica).
 * Sem mexer nos demais blocos.
 */
export const moverBlocoPara = (
  dados: DadosTabelas,
  abaId: string,
  origemId: string,
  destinoId: string,
): DadosTabelas => {
  if (origemId === destinoId) return dados;
  return {
    ...dados,
    abas: dados.abas.map((a) => {
      if (a.id !== abaId) return a;
      const de = a.ordem.indexOf(origemId);
      const para = a.ordem.indexOf(destinoId);
      if (de < 0 || para < 0) return a;
      const ordem = [...a.ordem];
      const [movido] = ordem.splice(de, 1);
      ordem.splice(para, 0, movido);
      return { ...a, ordem };
    }),
  };
};

/**
 * Move um bloco (tabela ou nota) uma posição para cima (-1) ou para baixo (+1)
 * na ordem da tela, trocando de lugar com o vizinho. Nas bordas não faz nada.
 */
export const moverBloco = (
  dados: DadosTabelas,
  abaId: string,
  blocoId: string,
  direcao: 1 | -1,
): DadosTabelas => ({
  ...dados,
  abas: dados.abas.map((a) => {
    if (a.id !== abaId) return a;
    const de = a.ordem.indexOf(blocoId);
    const para = de + direcao;
    if (de < 0 || para < 0 || para >= a.ordem.length) return a;
    const ordem = [...a.ordem];
    [ordem[de], ordem[para]] = [ordem[para], ordem[de]];
    return { ...a, ordem };
  }),
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
    marcados: [...t.marcados, false],
  }));

export const removerLinha = (dados: DadosTabelas, abaId: string, id: string, linha: number): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => ({
    ...t,
    linhas: t.linhas.filter((_, r) => r !== linha),
    marcados: t.marcados.filter((_, r) => r !== linha),
  }));

/**
 * Adiciona uma coluna no fim (título "Coluna N", largura padrão e célula vazia
 * em cada linha). Respeita o limite de `MAX_COLUNAS`.
 */
export const adicionarColuna = (dados: DadosTabelas, abaId: string, id: string): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => {
    if (t.colunas >= MAX_COLUNAS) return t;
    return {
      ...t,
      colunas: t.colunas + 1,
      titulos: [...t.titulos, `Coluna ${t.colunas + 1}`],
      larguras: [...t.larguras, LARGURA_COLUNA_PADRAO],
      linhas: t.linhas.map((l) => [...l, '']),
    };
  });

/**
 * Remove uma coluna: o título, a largura e a célula correspondente em cada
 * linha. Nunca deixa a tabela sem colunas.
 */
export const removerColuna = (
  dados: DadosTabelas,
  abaId: string,
  id: string,
  coluna: number,
): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => {
    if (t.colunas <= 1) return t;
    const semColuna = <T,>(arr: T[]): T[] => arr.filter((_, i) => i !== coluna);
    return {
      ...t,
      colunas: t.colunas - 1,
      titulos: semColuna(t.titulos),
      larguras: semColuna(t.larguras),
      linhas: t.linhas.map((l) => semColuna(l)),
    };
  });

/**
 * Cola um bloco (matriz de strings) começando na célula `(linha, coluna)`:
 * cria linhas quando o bloco passa do fim e ignora colunas além das existentes
 * (mesmo comportamento de planilha). As linhas novas entram com caixinha
 * desmarcada.
 */
export const colarBloco = (
  dados: DadosTabelas,
  abaId: string,
  id: string,
  linha: number,
  coluna: number,
  bloco: string[][],
): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => {
    if (bloco.length === 0) return t;
    const linhas = t.linhas.map((l) => [...l]);
    const marcados = [...t.marcados];
    bloco.forEach((valores, i) => {
      const r = linha + i;
      while (linhas.length <= r) {
        linhas.push(Array.from({ length: t.colunas }, () => ''));
        marcados.push(false);
      }
      valores.forEach((v, j) => {
        const c = coluna + j;
        if (c < t.colunas) linhas[r][c] = v;
      });
    });
    return { ...t, linhas, marcados };
  });

/**
 * Apaga o conteúdo de um bloco retangular de células existentes (recortar com
 * Ctrl+X ou apagar com Delete/Backspace). Não mexe nos títulos, nas caixinhas
 * nem em nada fora do retângulo; as coordenadas podem vir invertidas.
 */
export const limparBloco = (
  dados: DadosTabelas,
  abaId: string,
  id: string,
  linha1: number,
  coluna1: number,
  linha2: number,
  coluna2: number,
): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => {
    const rA = Math.max(0, Math.min(linha1, linha2));
    const rB = Math.min(t.linhas.length - 1, Math.max(linha1, linha2));
    const cA = Math.max(0, Math.min(coluna1, coluna2));
    const cB = Math.min(t.colunas - 1, Math.max(coluna1, coluna2));
    if (rA > rB || cA > cB) return t;
    return {
      ...t,
      linhas: t.linhas.map((l, r) =>
        r >= rA && r <= rB ? l.map((v, c) => (c >= cA && c <= cB ? '' : v)) : l,
      ),
    };
  });

/**
 * Extrai data como número comparável; null se o texto não for data.
 * Aceita pt-BR `DD/MM[/AAAA] [HH:MM[:SS]]` (o formato que o usuário digita e o
 * `criadoEm` do histórico) e ISO `AAAA-MM-DD [HH:MM[:SS]]`. Ano de 2 dígitos
 * vira 20xx; sem ano, compara só MMDDHHMMSS (vale entre si; fica antes de quem
 * tem ano na crescente). Dia/mês/hora inválidos (ex.: 31/02) dão null.
 */
export const extrairDataPtBr = (s: string): number | null => {
  const t = (s ?? '').trim();
  let m = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const dia = parseInt(m[1], 10);
    const mes = parseInt(m[2], 10);
    let ano = m[3] !== undefined ? parseInt(m[3], 10) : 0;
    if (m[3] !== undefined && m[3].length === 2) ano += 2000;
    const hora = m[4] !== undefined ? parseInt(m[4], 10) : 0;
    const min = m[5] !== undefined ? parseInt(m[5], 10) : 0;
    const seg = m[6] !== undefined ? parseInt(m[6], 10) : 0;
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || hora > 23 || min > 59 || seg > 59)
      return null;
    if (ano === 0) return (((((mes * 100 + dia) * 100 + hora) * 100 + min) * 100 + seg) * 1000);
    const d = new Date(ano, mes - 1, dia, hora, min, seg);
    if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null;
    return d.getTime();
  }
  m = t.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return null;
  const ano = parseInt(m[1], 10);
  const mes = parseInt(m[2], 10);
  const dia = parseInt(m[3], 10);
  const hora = m[4] !== undefined ? parseInt(m[4], 10) : 0;
  const min = m[5] !== undefined ? parseInt(m[5], 10) : 0;
  const seg = m[6] !== undefined ? parseInt(m[6], 10) : 0;
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31 || hora > 23 || min > 59 || seg > 59)
    return null;
  const d = new Date(ano, mes - 1, dia, hora, min, seg);
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) return null;
  return d.getTime();
};

/**
 * Ordena as linhas por uma coluna. Texto usa `Intl.Collator` com `numeric`
 * (então "8 UN" vem antes de "10 UN"); **datas pt-BR/ISO comparam pelo
 * calendário** (então "03/09/2025" vem antes de "02/09/2026" na crescente,
 * mesmo com o dia maior — comparar string punha o dia na frente do ano).
 * Mantém a caixinha de cada linha junto com ela; valores vazios ficam no fim
 * (nas duas direções).
 */
export const ordenarPorColuna = (
  dados: DadosTabelas,
  abaId: string,
  id: string,
  coluna: number,
  direcao: 'asc' | 'desc',
): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => {
    const collator = new Intl.Collator('pt-BR', { numeric: true, sensitivity: 'base' });
    const comparar = (a: string, b: string): number => {
      const va = a.trim();
      const vb = b.trim();
      if (va === '' && vb === '') return 0;
      if (va === '') return 1; // vazios por último
      if (vb === '') return -1;
      const da = extrairDataPtBr(va);
      const db = extrairDataPtBr(vb);
      const c = da !== null && db !== null ? da - db : collator.compare(va, vb);
      return direcao === 'asc' ? c : -c;
    };
    const ordem = t.linhas
      .map((_, i) => i)
      .sort((a, b) => comparar(t.linhas[a][coluna] ?? '', t.linhas[b][coluna] ?? ''));
    return {
      ...t,
      linhas: ordem.map((i) => t.linhas[i]),
      marcados: ordem.map((i) => t.marcados[i] ?? false),
    };
  });

/** Marca/desmarca a caixinha da linha (risca a linha na tela). */
export const alternarMarcada = (dados: DadosTabelas, abaId: string, id: string, linha: number): DadosTabelas =>
  atualizarTabela(dados, abaId, id, (t) => ({
    ...t,
    marcados: t.marcados.map((v, r) => (r === linha ? !v : v)),
  }));

/** Renomeia uma sub-aba. */
export const renomearAba = (dados: DadosTabelas, id: string, rotulo: string): DadosTabelas => {
  const nome = rotulo.trim().toUpperCase();
  if (!nome) return dados;
  return { ...dados, abas: dados.abas.map((a) => (a.id === id ? { ...a, rotulo: nome } : a)) };
};

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

/** Onde o termo buscado está (para o Enter pular de uma em uma). */
export interface OcorrenciaBusca {
  abaId: string;
  tipo: 'titulo' | 'celula' | 'nota';
  /** Tabela/linha/coluna do termo (não se aplicam à nota). */
  tabelaId?: string;
  /** Linha da célula; `-1` quando o termo está num título. */
  linha?: number;
  coluna?: number;
  /** Nota onde o termo está (tipo 'nota'). */
  notaId?: string;
}

/**
 * Lista as células (títulos primeiro, depois as linhas) que contêm o termo, na
 * mesma ordem em que aparecem na tela — é a lista que o Enter percorre.
 */
export const listarOcorrencias = (dados: DadosTabelas, termo: string): OcorrenciaBusca[] => {
  const lista: OcorrenciaBusca[] = [];
  if (!normalizarBusca(termo)) return lista;
  for (const aba of dados.abas) {
    for (const tabela of aba.tabelas) {
      tabela.titulos.forEach((v, coluna) => {
        if (celulaContem(v, termo)) {
          lista.push({ abaId: aba.id, tabelaId: tabela.id, tipo: 'titulo', linha: -1, coluna });
        }
      });
      tabela.linhas.forEach((linha, r) => {
        linha.forEach((v, coluna) => {
          if (celulaContem(v, termo)) {
            lista.push({ abaId: aba.id, tabelaId: tabela.id, tipo: 'celula', linha: r, coluna });
          }
        });
      });
    }
    for (const nota of aba.notas) {
      if (celulaContem(nota.texto, termo)) {
        lista.push({ abaId: aba.id, tipo: 'nota', notaId: nota.id });
      }
    }
  }
  return lista;
};

/** Quantas células (títulos + linhas) de cada aba contêm o termo. */
export const encontrar = (dados: DadosTabelas, termo: string): Record<string, number> => {
  const resultado: Record<string, number> = {};
  for (const aba of dados.abas) resultado[aba.id] = 0;
  for (const oc of listarOcorrencias(dados, termo)) resultado[oc.abaId]++;
  return resultado;
};
