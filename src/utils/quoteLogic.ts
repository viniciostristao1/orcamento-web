import { QuoteItem, QuoteSummary } from '../types';

const removerPalavras = (descricao: string): string => {
  const palavrasParaRemover = ["TR ", "TROCAR ", "TROCA "];
  let result = descricao;
  palavrasParaRemover.forEach(palavra => {
    result = result.split(palavra).join("");
  });
  return result;
};

const substituicoesCondicionais = (descricao: string): string => {
  const d = descricao.trim();
  if (d === "OXI") return "HIGIENIZAÇÃO DO AR CONDICIONADO";
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

export const processQuote = (
  descricaoReparo: string,
  orcamentoRaw: string,
  revisaoAprovada: number,
  revisaoAprovadaPecas: number,
  descontoPercentual: number,
  numParcelas: number,
  ajustesManuais: string = ""
): QuoteSummary => {
  const valoresPorItem: Record<string, { pecas: number, servicos: number }> = {};
  
  // 1. Processar dados brutos distinguindo Peça/Serviço
  orcamentoRaw.split(/\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/\s+/).filter(p => p.length > 0);
    if (parts.length < 3) return;
    
    const id = parseInt(parts[0], 10).toString();
    const tipo = parts[1].toLowerCase();
    const valorStr = parts[parts.length - 1]; 
    const valor = parseBrazilianNumber(valorStr);
    
    if (!isNaN(valor)) {
      if (!valoresPorItem[id]) valoresPorItem[id] = { pecas: 0, servicos: 0 };
      if (tipo.includes('peça')) valoresPorItem[id].pecas += valor;
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
    
    let desc = parts.slice(1).join(" ");
    desc = substituicoesCondicionais(removerPalavras(desc));
    
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
 * Recalcula os totais considerando só os itens MARCADOS (caixinhas da tabela).
 * `items` continua com todos (a tabela mostra as desmarcadas riscadas); os
 * totais, o desconto e o líquido refletem apenas as marcadas.
 */
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
