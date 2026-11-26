import { QuoteItem, QuoteSummary } from '../types';

const removerPalavras = (descricao: string): string => {
  const palavrasParaRemover = ["TR ", "TROCAR ", "TROCA "];
  let result = descricao;
  palavrasParaRemover.forEach(palavra => {
    result = result.split(palavra).join("");
  });
  return result;
};

/**
 * "OXI" (palavra inteira, qualquer caixa) vira a higienização; dentro de
 * outra palavra (ex.: "OXIDAÇÃO", "OXY") não troca.
 */
export const normalizarOxi = (texto: string): string =>
  texto.replace(/\bOXI\b/gi, 'HIGIENIZAÇÃO DO AR CONDICIONADO');

const substituicoesCondicionais = (descricao: string): string => {
  const d = descricao.trim();
  const comOxi = normalizarOxi(d);
  if (comOxi !== d) return comOxi;
  if (d.includes("PASTILHA DE FREIO Diant + RETIFICA")) return "PASTILHA DE FREIO DIANT + RETIFICA DOS DISCOS";
  if (d.includes("PASTILHA DE FREIO Diant + RET")) return "PASTILHA DE FREIO DIANT + RETIFICA DOS DISCOS";
  if (d.includes("PASTILHA DE FREIO TRAS + RET")) return "PASTILHA DE FREIO TRAS + RETIFICA DOS DISCOS";
  if (d.includes('PAST') && !d.includes("RETIFICA DOS DISCOS")) return d.replace("RETIFICA", "RETIFICA DOS DISCOS");
  if (d === "RET") return "RETIFICA DOS DISCOS";
  return d;
};

/**
 * Converte strings formatadas (ex: "1.799,75" ou "1,799.75") para float.
 * Prioriza o formato brasileiro se houver vírgula.
 */
export const parseBrazilianNumber = (value: string): number => {
  if (!value) return 0;
  // Remove espaços
  let cleanValue = value.trim();
  
  // Se houver vírgula, assumimos formato BR (1.234,56)
  if (cleanValue.includes(',')) {
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  } 
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Item colado na lista nova (COLAR ITENS): descrição final + valor.
 * Tudo entra como serviço (a lista não tem coluna de tipo) — o desconto em
 * peças passa a valer só na parte da revisão.
 */
export interface ItemLista {
  descricao: string;
  valor: number;
}

export interface LinhaListaProblema {
  /** Nº da linha crua na textarea (1-based, para achar fácil). */
  linha: number;
  motivo: string;
}

export interface ResultadoLista {
  itens: ItemLista[];
  invalidas: LinhaListaProblema[];
  /** Cabeçalhos/totais/rótulos ignorados em silêncio (não são erro). */
  ignoradas: number;
  soma: number;
}

const ehInteiro = (t: string): boolean => /^\d+$/.test(t);

/** Início de linha que é cabeçalho/total, não item (ignora sem consumir posição). */
const ehCabecalhoLista = (t: string): boolean =>
  /^(TOTAL|SUBTOTAL|ORÇAMENTO|ORCAMENTO|DESCONTO|TROCO|CLIENTE|DATA|PLACA|NOME|CHASSI|REVISÃO|REVISAO)\b/i.test(t.trim());

/** Último token/coluna precisa ter dígito para ser valor legível. */
const limparTokenValor = (t: string): string => t.trim().replace(/^R\$/i, '').trim();

/**
 * Lê a lista colada (COLAR ITENS): `nº ⇥ descrição ⇥ valor`, TABs ou espaços.
 * - Com TAB: colunas explícitas (`[nº, descrição, valor]`; 2 cols = desc+valor;
 *   1ª coluna só-dígitos em 3+ colunas é sempre o nº — descarta sem olhar posição).
 * - Sem TAB: `número? descrição… valor`; o 1º inteiro vale como nº SÓ se for
 *   igual à posição esperada (ordem entre as não-brancas) — senão faz parte
 *   da descrição (ex.: "2 rolamentos" na posição 1 mantém o 2).
 * Ignora brancas, linhas sem dígitos e cabeçalhos/totais; o resto sem valor
 * ou sem descrição volta em `invalidas` com o motivo (nada some em silêncio).
 */
export const parseListaItens = (texto: string): ResultadoLista => {
  const itens: ItemLista[] = [];
  const invalidas: LinhaListaProblema[] = [];
  let ignoradas = 0;
  let candidatos = 0;
  texto.split('\n').forEach((bruta, idx) => {
    const linha = idx + 1;
    const t = bruta.trim();
    if (!t) return;
    if (ehCabecalhoLista(t)) { ignoradas += 1; return; }
    // Sem nenhum dígito e sem ser cabeçalho conhecido: item sem valor —
    // avisa em vez de descartar em silêncio (pode ser valor esquecido).
    if (!/\d/.test(t)) {
      invalidas.push({ linha, motivo: 'sem valor legível' });
      return;
    }
    candidatos += 1;
    const esperada = candidatos;
    let corpo = '';
    let valorToken = '';
    if (t.includes('\t')) {
      const cols = t.split('\t').map((c) => c.trim()).filter((c) => c !== '');
      if (cols.length <= 1) {
        invalidas.push({ linha, motivo: 'sem valor legível' });
        return;
      }
      valorToken = cols[cols.length - 1];
      const resto = cols.slice(0, -1);
      if (resto.length === 1) {
        if (ehInteiro(resto[0])) {
          invalidas.push({ linha, motivo: 'sem descrição (só número e valor)' });
          return;
        }
        corpo = resto[0];
      } else {
        const [c0, ...meio] = resto;
        corpo = (ehInteiro(c0) ? meio : resto).join(' ');
      }
    } else {
      const tokens = t.split(/\s+/);
      if (tokens.length === 1) {
        invalidas.push({ linha, motivo: 'sem descrição' });
        return;
      }
      valorToken = tokens[tokens.length - 1];
      if (tokens.length === 2) {
        if (ehInteiro(tokens[0])) {
          invalidas.push({ linha, motivo: 'sem descrição (só número e valor)' });
          return;
        }
        corpo = tokens[0];
      } else {
        const t0 = tokens[0];
        const meio = tokens.slice(1, -1);
        corpo = (ehInteiro(t0) && parseInt(t0, 10) === esperada ? meio : tokens.slice(0, -1)).join(' ');
      }
    }
    const limpo = limparTokenValor(valorToken);
    if (!/[\d]/.test(limpo)) {
      invalidas.push({ linha, motivo: 'sem valor legível' });
      return;
    }
    const valor = parseBrazilianNumber(limpo);
    if (!Number.isFinite(valor)) {
      invalidas.push({ linha, motivo: 'sem valor legível' });
      return;
    }
    // "R$" solto antes do valor (ex.: "Filtro R$ 195,90") não é descrição.
    corpo = corpo.replace(/\s*R\$\s*$/i, '').trim();
    if (ehCabecalhoLista(corpo)) { ignoradas += 1; return; }
    const descricao = normalizarOxi(corpo).trim().toUpperCase();
    if (!descricao || !/[A-Za-zÀ-ÿ]/.test(descricao)) {
      invalidas.push({ linha, motivo: 'sem descrição legível' });
      return;
    }
    itens.push({ descricao, valor });
  });
  return { itens, invalidas, ignoradas, soma: itens.reduce((acc, i) => acc + i.valor, 0) };
};

/**
 * Converte os itens da lista para o formato bruto interno (`desc` + `dados`
 * no estilo do PDF), alimentando o pipeline existente (`processQuote`):
 * ids 1..N na ordem (o AJUSTE continua valendo pelo número exibido), tudo
 * como serviço, valor com milhar/vírgula (o parse aceita de volta).
 */
export const converterListaParaBruto = (itens: ItemLista[]): { desc: string; dados: string } => ({
  desc: itens.map((it, i) => `${String(i + 1).padStart(2, '0')} ${it.descricao}`).join('\n'),
  dados: itens.map((it, i) => `${i + 1} Serviço GERADO ${it.descricao} ${formatCurrency(it.valor)}`).join('\n'),
});

/**
 * Emite itens como linhas de lista (`DESCRIÇÃO ⇥ R$ VALOR`), sem números
 * (o app renumera na leitura).
 */
export const itensParaLista = (itens: { descricao: string; valor: number }[]): string =>
  itens.map((i) => `${i.descricao}\tR$ ${formatCurrency(i.valor)}`).join('\n');

/**
 * Converte textos brutos (revisão do SistemaCard / rascunho antigo) para
 * linhas de lista: parseia pelo caminho de sempre (tirando verbos, como o
 * Play fazia) e emite sem números (o app renumera).
 */
export const converterBrutoParaLista = (descReparo: string, orcamentoRaw: string): string =>
  itensParaLista(
    processQuote(descReparo, orcamentoRaw, 0, 0, 0, 1).items.map((i) => ({
      descricao: i.description,
      valor: i.value,
    })),
  );

/** Opções do `processQuote` (só o caminho da lista nova usa). */
export interface OpcoesProcessQuote {
  /**
   * Mantém verbos (TR/TROCAR/TROCA) nas descrições: a lista nova já traz o
   * texto final — pula `removerPalavras`/`substituicoesCondicionais` (o OXI
   * continua expandindo). Padrão `false` = comportamento de sempre.
   */
  manterVerbos?: boolean;
}

export const processQuote = (
  descricaoReparo: string,
  orcamentoRaw: string,
  revisaoAprovada: number,
  revisaoAprovadaPecas: number,
  descontoPercentual: number,
  numParcelas: number,
  ajustesManuais: string = "",
  opts?: OpcoesProcessQuote
): QuoteSummary => {
  const valoresPorItem: Record<string, { pecas: number, servicos: number }> = {};
  
  // 1. Processar dados brutos distinguindo Peça/Serviço
  orcamentoRaw.split(/\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/\s+/).filter(p => p.length > 0);
    if (parts.length < 3) return;
    
    const idNum = parseInt(parts[0], 10);
    if (isNaN(idNum)) return; // cabeçalho do sistema (nº, cliente…) não é item
    const id = idNum.toString();
    // Sem acento também vale ("Peca" do OCR = "Peça").
    const tipo = parts[1].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const valorStr = parts[parts.length - 1]; 
    const valor = parseBrazilianNumber(valorStr);
    
    if (!isNaN(valor)) {
      if (!valoresPorItem[id]) valoresPorItem[id] = { pecas: 0, servicos: 0 };
      if (tipo.includes('peca')) valoresPorItem[id].pecas += valor;
      else valoresPorItem[id].servicos += valor;
    }
  });

  // 1.1 Ajustes Manuais
  ajustesManuais.split(/\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/\s+/).filter(p => p.length > 0);
    if (parts.length >= 2) {
      const id = parseInt(parts[0], 10).toString();
      const extra = parseBrazilianNumber(parts[parts.length - 1]);
      if (!isNaN(extra)) {
        if (!valoresPorItem[id]) valoresPorItem[id] = { pecas: 0, servicos: 0 };
        valoresPorItem[id].pecas += extra;
      }
    }
  });

  // 2. Montar itens processados
  const processedItems: QuoteItem[] = [];
  descricaoReparo.split(/\n/).filter(l => l.trim()).forEach(line => {
    const parts = line.trim().split(/\s+/);
    const id = parseInt(parts[0], 10);
    if (isNaN(id)) return;
    // Lixo de cabeçalho do PDF (ITE repete empresa/CEP/endereço em toda página
    // e a extração por seção pode trazer junto): linha só com número ("20723")
    // ou id gigante ("95913000 ... RODOVIA...") nunca é reclamação real (são
    // "NN texto", ids pequenos) — ignora em vez de virar item 0,00.
    if (id > 9999) return;
    
    let desc = parts.slice(1).join(" ");
    if (!desc.trim()) return;
    // Caminho da lista nova: texto final — só OXI + maiúsculas, sem tirar verbos.
    desc = opts?.manterVerbos ? normalizarOxi(desc) : substituicoesCondicionais(removerPalavras(desc));
    
    const data = valoresPorItem[id.toString()] || { pecas: 0, servicos: 0 };
    processedItems.push({
      id,
      description: desc.trim().toUpperCase(),
      pecasValue: data.pecas,
      servicosValue: data.servicos,
      value: data.pecas + data.servicos
    });
  });

  const totalOrcamento = processedItems.reduce((acc, i) => acc + i.value, 0);
  const totalGeral = revisaoAprovada + totalOrcamento;
  
  // Cálculos Internos de Margem
  const pecasAdicional = processedItems.reduce((acc, i) => acc + i.pecasValue, 0);
  const servicosAdicional = processedItems.reduce((acc, i) => acc + i.servicosValue, 0);
  
  const totalPecasGeral = revisaoAprovadaPecas + pecasAdicional;
  const totalServicosGeral = (revisaoAprovada - revisaoAprovadaPecas) + servicosAdicional;
  
  const fatorDesc = (100 - descontoPercentual) / 100;
  const valorLiquidoFinal = (totalPecasGeral * fatorDesc) + totalServicosGeral;
  const valorDescontoTotal = (totalPecasGeral + totalServicosGeral) - valorLiquidoFinal;

  return {
    items: processedItems,
    totalOrcamento,
    revisaoAprovada,
    totalGeral,
    numParcelas,
    valorParcela: totalGeral / numParcelas,
    currentTime: new Date().toLocaleString('pt-BR'),
    totalPecasGeral,
    totalServicosGeral,
    valorDescontoTotal,
    valorLiquidoFinal,
    descontoPercentual
  };
};

export const formatCurrency = (value: number): string => 
  value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 

/**
 * Formata o que o usuário colou/digitou num campo de valor: milhar com ponto e
 * centavos com vírgula ("1000" → "1.000,00"; "2.188,92" → "2.188,92").
 * Sem nenhum dígito devolve como veio (para não zerar um texto em edição).
 */
export const formatarValorInput = (valor: string): string => {
  if (!valor.trim() || !/\d/.test(valor)) return valor;
  return formatCurrency(parseBrazilianNumber(valor));
};

/**
 * Itens DESMARCADOS (não realizados) e a soma deles — usado na caixa
 * "Itens Não Realizados" do documento (só aparece se houver algum).
 */
export const itensNaoRealizados = (
  summary: QuoteSummary,
  selecionados: Set<number>
): { itens: QuoteItem[]; total: number } => {
  const itens = summary.items.filter(i => !selecionados.has(i.id));
  return { itens, total: itens.reduce((acc, i) => acc + i.value, 0) };
};

/**
 * Resumo de aprovação dos itens (janela "Itens do orçamento" do histórico):
 * valor de cada id, soma dos aprovados, soma dos não aprovados (ids em
 * `naoRealizados`), percentual aprovado e total.
 */
export const resumoAprovacao = (
  summary: QuoteSummary,
  naoRealizados: number[] = [],
): {
  valoresPorId: Record<number, number>;
  aprovado: number;
  naoAprovado: number;
  percentual: number;
  total: number;
} => {
  const nao = new Set(naoRealizados);
  const valoresPorId: Record<number, number> = {};
  let aprovado = 0;
  let naoAprovado = 0;
  for (const item of summary.items) {
    valoresPorId[item.id] = item.value;
    if (nao.has(item.id)) naoAprovado += item.value;
    else aprovado += item.value;
  }
  const total = aprovado + naoAprovado;
  return {
    valoresPorId,
    aprovado,
    naoAprovado,
    percentual: total > 0 ? (aprovado / total) * 100 : 0,
    total,
  };
};

/**
 * Recalcula os totais considerando só os itens MARCADOS (caixinhas da tabela).
 * `items` continua com todos (a tabela mostra as desmarcadas riscadas); os
 * totais, o desconto e o líquido refletem apenas as marcadas.
 */
/**
 * Prévia interativa do documento (edição direta no PNG): os itens guardam a
 * descrição/valor editados e se estão excluídos (riscados na tela, fora do
 * PNG). A APROVAÇÃO continua no `selecionados` de sempre (caixinhas) — aqui
 * só o conteúdo editável. `original` é a 1ª versão gerada do PDF (botão voltar).
 */
export interface ItemPrevia {
  id: number;
  descricao: string;
  valor: number;
  excluido: boolean;
}

export interface PreviaOrcamento {
  itens: ItemPrevia[];
  revisaoAprovada: number;
  /** 1ª versão gerada (null em orçamentos antigos, sem o botão voltar). */
  original: PreviaOrcamentoSemOriginal | null;
}

export interface PreviaOrcamentoSemOriginal {
  itens: ItemPrevia[];
  revisaoAprovada: number;
}

/** Foto da 1ª geração a partir do resultado (tudo aprovado, nada excluído). */
export const construirPrevia = (
  items: { id: number; description: string; value: number }[],
  revisaoAprovada: number,
): PreviaOrcamentoSemOriginal => ({
  itens: items.map((i) => ({ id: i.id, descricao: i.description, valor: i.value, excluido: false })),
  revisaoAprovada,
});

const clonarPrevia = (p: PreviaOrcamentoSemOriginal): PreviaOrcamentoSemOriginal => ({
  itens: p.itens.map((i) => ({ ...i })),
  revisaoAprovada: p.revisaoAprovada,
});

/** Nova prévia com o `original` guardado (chamar uma vez, na 1ª geração). */
export const previaComOriginal = (p: PreviaOrcamentoSemOriginal): PreviaOrcamento => ({
  ...clonarPrevia(p),
  original: clonarPrevia(p),
});

/**
 * Apaga uma linha DE VEZ (segundo ×): tira o item do array (não é só o
 * `excluido` reversível). A renumeração (`numeroExibicaoPrevia`) e os totais
 * (`calcularPrevia`) se ajustam sozinhos, pois derivam dos não excluídos.
 */
export const removerItemDefinitivo = <T extends PreviaOrcamentoSemOriginal>(
  previa: T,
  id: number,
): T => ({
  ...previa,
  itens: previa.itens.filter((i) => i.id !== id),
});

/**
 * Base do orçamento MANUAL (botão "+"): só o item 1, descrição e valor
 * vazios, revisão zerada. Quem chama guarda o `original` com
 * `previaComOriginal` (o ↺ volta ao limpo, como no vindo do PDF).
 */
export const criarPreviaManual = (): PreviaOrcamentoSemOriginal => ({
  itens: [{ id: 1, descricao: '', valor: 0, excluido: false }],
  revisaoAprovada: 0,
});

/** Linha totalmente vazia: sem descrição E valor zerado (não sai no PNG). */
export const ehLinhaVazia = (item: Pick<ItemPrevia, 'descricao' | 'valor'>): boolean =>
  !item.descricao.trim() && item.valor === 0;

/**
 * Documento sem nada imprimível: revisão zerada e nenhuma linha visível
 * (não excluída) com conteúdo — nesse caso o PNG saía em branco, então a
 * exportação avisa em vez de gerar a imagem.
 */
export const previaVazia = (previa: PreviaOrcamentoSemOriginal): boolean =>
  previa.revisaoAprovada === 0 &&
  previa.itens.filter((i) => !i.excluido).every(ehLinhaVazia);

/**
 * Calculadora da prévia (N parcelas): ADICIONAL = soma dos NÃO excluídos e
 * marcados; TOTAL = revisão + adicional (não muda); parcela = TOTAL / N
 * arredondada PARA CIMA no centavo (ex.: 4395,88 / 3 → 1465,30; divisão exata
 * como 4395,87 / 3 usa 1465,29 — o `1e-6` protege o exato do erro de float).
 * A soma das parcelas pode passar do TOTAL em centavos.
 */
export const calcularPrevia = (
  previa: PreviaOrcamentoSemOriginal,
  selecionados: Set<number>,
  numParcelas: number = 3,
): {
  adicional: number;
  total: number;
  parcela: number;
  numParcelas: number;
  naoAprovados: ItemPrevia[];
  totalNaoAprovado: number;
  /** Tudo (revisão + itens não excluídos): base do "Total Geral". */
  totalGeralPrevia: number;
} => {
  const visiveis = previa.itens.filter((i) => !i.excluido);
  const marcados = visiveis.filter((i) => selecionados.has(i.id));
  const adicional = marcados.reduce((acc, i) => acc + i.valor, 0);
  const total = previa.revisaoAprovada + adicional;
  const n = Math.max(1, Math.floor(numParcelas) || 1);
  const parcela = Math.ceil((total / n) * 100 - 1e-6) / 100;
  const naoAprovados = visiveis.filter((i) => !selecionados.has(i.id));
  return {
    adicional,
    total,
    parcela,
    numParcelas: n,
    naoAprovados,
    totalNaoAprovado: naoAprovados.reduce((acc, i) => acc + i.valor, 0),
    totalGeralPrevia: previa.revisaoAprovada + visiveis.reduce((acc, i) => acc + i.valor, 0),
  };
};

/** Posição de exibição (1, 2, …) entre os NÃO excluídos; excluído não numera. */
export const numeroExibicaoPrevia = (itens: ItemPrevia[], id: number): number | null => {
  let n = 0;
  for (const i of itens) {
    if (i.excluido) {
      if (i.id === id) return null;
      continue;
    }
    n += 1;
    if (i.id === id) return n;
  }
  return null;
};

/**
 * Aplica a prévia sobre o resumo (mantém RESUMO LÍQUIDO, relatório, V/X e
 * último orçamento coerentes com o editado): descrições/valores por id,
 * linhas novas anexadas, revisão sobrescrita. A composição peças/serviços de
 * um valor editado acompanha a proporção original (soma continua exata).
 */
export const aplicarPrevia = (
  summary: QuoteSummary,
  previa: PreviaOrcamentoSemOriginal,
): QuoteSummary => {
  const porId = new Map(previa.itens.map((i) => [i.id, i]));
  // A prévia manda no conjunto de linhas: id do resumo que não está nela foi
  // apagado de vez (segundo ×) e sai do resumo (RESUMO, relatório e V/X).
  // Os totais acompanham: sem o ajuste, `recalcularComSelecao` derivaria a
  // parte de peças da revisão de um total cheio sobre itens parciais.
  const idsPrev = new Set(previa.itens.map((i) => i.id));
  const removidos = summary.items.filter((item) => !idsPrev.has(item.id));
  const soma = (xs: QuoteItem[], k: 'value' | 'pecasValue' | 'servicosValue'): number =>
    xs.reduce((acc, i) => acc + i[k], 0);
  const items = summary.items.filter((item) => idsPrev.has(item.id)).map((item) => {
    const edit = porId.get(item.id);
    if (!edit) return item;
    if (edit.valor === item.value) return { ...item, description: edit.descricao };
    const proporcao = item.value !== 0 ? edit.valor / item.value : 0;
    return {
      ...item,
      description: edit.descricao,
      value: edit.valor,
      pecasValue: item.value !== 0 ? item.pecasValue * proporcao : 0,
      servicosValue: item.value !== 0 ? item.servicosValue * proporcao : edit.valor,
    };
  });
  const idsBase = new Set(summary.items.map((i) => i.id));
  for (const edit of previa.itens) {
    if (!idsBase.has(edit.id)) {
      // Linha adicionada pelo "+": valor integral como serviços (é mão de obra avulsa).
      items.push({ id: edit.id, description: edit.descricao, value: edit.valor, pecasValue: 0, servicosValue: edit.valor });
    }
  }
  // Totais coerentes com as linhas: soma do que ficou + revisão da prévia
  // (o desconto/parcelas do resumo são preservados).
  const totalOrcamento = soma(items, 'value');
  const revisaoAprovada = previa.revisaoAprovada;
  const totalGeral = revisaoAprovada + totalOrcamento;
  const totalPecasGeral = summary.totalPecasGeral - soma(removidos, 'pecasValue');
  const totalServicosGeral = summary.totalServicosGeral - soma(removidos, 'servicosValue');
  const fatorDesc = (100 - summary.descontoPercentual) / 100;
  const valorLiquidoFinal = totalPecasGeral * fatorDesc + totalServicosGeral;
  const valorDescontoTotal = totalPecasGeral + totalServicosGeral - valorLiquidoFinal;
  const numParcelas = summary.numParcelas;
  return {
    ...summary,
    items,
    revisaoAprovada,
    totalOrcamento,
    totalGeral,
    totalPecasGeral,
    totalServicosGeral,
    valorDescontoTotal,
    valorLiquidoFinal,
    valorParcela: numParcelas ? totalGeral / numParcelas : 0,
  };
};

export const recalcularComSelecao = (
  summary: QuoteSummary,
  selecionados: Set<number>
): QuoteSummary => {
  const marcados = summary.items.filter(i => selecionados.has(i.id));

  const pecasAdicional = marcados.reduce((acc, i) => acc + i.pecasValue, 0);
  const servicosAdicional = marcados.reduce((acc, i) => acc + i.servicosValue, 0);

  // Quanto das peças veio da revisão aprovada (o que NÃO é adicional).
  const pecasDeRevisao =
    summary.totalPecasGeral - summary.items.reduce((acc, i) => acc + i.pecasValue, 0);

  const totalPecasGeral = pecasDeRevisao + pecasAdicional;
  const totalServicosGeral = (summary.revisaoAprovada - pecasDeRevisao) + servicosAdicional;

  const fatorDesc = (100 - summary.descontoPercentual) / 100;
  const valorLiquidoFinal = (totalPecasGeral * fatorDesc) + totalServicosGeral;
  const valorDescontoTotal = (totalPecasGeral + totalServicosGeral) - valorLiquidoFinal;
  const totalOrcamento = marcados.reduce((acc, i) => acc + i.value, 0);

  return {
    ...summary,
    totalOrcamento,
    totalPecasGeral,
    totalServicosGeral,
    valorDescontoTotal,
    valorLiquidoFinal,
  };
};
