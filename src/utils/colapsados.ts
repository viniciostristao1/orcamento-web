/**
 * Recolhimento das 4 áreas do orçamento do sistema (DESCRIÇÃO, DADOS, AJUSTE e
 * RESUMO LÍQUIDO). `true` = recolhida (só o cabeçalho aparece). Persistido em
 * localStorage para lembrar ao recarregar; o conteúdo dos campos continua no
 * estado do app/rascunho (recolher nunca apaga o digitado).
 */

export interface ColapsadosOrcamento {
  descricao: boolean;
  dados: boolean;
  ajuste: boolean;
  resumo: boolean;
}

export const COLAPSADOS_KEY = 'orcamento_colapsados_v1';

const PADRAO: ColapsadosOrcamento = {
  descricao: false,
  dados: false,
  ajuste: false,
  resumo: false,
};

const ehValido = (d: unknown): d is ColapsadosOrcamento =>
  typeof d === 'object' &&
  d !== null &&
  typeof (d as Record<string, unknown>).descricao === 'boolean' &&
  typeof (d as Record<string, unknown>).dados === 'boolean' &&
  typeof (d as Record<string, unknown>).ajuste === 'boolean' &&
  typeof (d as Record<string, unknown>).resumo === 'boolean';

export const lerColapsados = (): ColapsadosOrcamento => {
  try {
    const bruto = localStorage.getItem(COLAPSADOS_KEY);
    if (!bruto) return { ...PADRAO };
    const d: unknown = JSON.parse(bruto);
    if (!ehValido(d)) return { ...PADRAO };
    return { ...d };
  } catch {
    return { ...PADRAO };
  }
};

export const salvarColapsados = (dados: ColapsadosOrcamento): void => {
  try {
    localStorage.setItem(COLAPSADOS_KEY, JSON.stringify(dados));
  } catch {
    // localStorage indisponível — vale só nesta sessão
  }
};
