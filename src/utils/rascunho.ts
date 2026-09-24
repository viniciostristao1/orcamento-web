export interface RascunhoOrcamento {
  descReparo: string;
  orcamentoRaw: string;
  ajustesManuais: string;
  revAprovadaInput: string;
  revPecasInput: string;
  desconto: number;
  parcelas: number;
  placa: string;
}

export const RASCUNHO_KEY = 'orcamento_rascunho_v1';

/**
 * Último orçamento em edição (fica no localStorage do navegador, local).
 * Serve para reabrir o app com o que o usuário estava fazendo, em vez do
 * exemplo embutido. Não substitui o histórico (que guarda os processados).
 */
export const lerRascunho = (): RascunhoOrcamento | null => {
  try {
    const bruto = localStorage.getItem(RASCUNHO_KEY);
    if (!bruto) return null;
    const d = JSON.parse(bruto);
    if (typeof d?.descReparo !== 'string' || typeof d?.orcamentoRaw !== 'string') return null;
    return {
      descReparo: d.descReparo,
      orcamentoRaw: d.orcamentoRaw,
      ajustesManuais: typeof d.ajustesManuais === 'string' ? d.ajustesManuais : '',
      revAprovadaInput: typeof d.revAprovadaInput === 'string' ? d.revAprovadaInput : '1766,23',
      revPecasInput: typeof d.revPecasInput === 'string' ? d.revPecasInput : '1000,00',
      desconto: typeof d.desconto === 'number' ? d.desconto : 5,
      parcelas: typeof d.parcelas === 'number' ? d.parcelas : 3,
      placa: typeof d.placa === 'string' ? d.placa : '',
    };
  } catch {
    return null;
  }
};

export const salvarRascunho = (dados: RascunhoOrcamento): void => {
  try {
    localStorage.setItem(RASCUNHO_KEY, JSON.stringify(dados));
  } catch {
    // localStorage indisponível — o rascunho vale só nesta sessão
  }
};
