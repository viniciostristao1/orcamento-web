import { converterBrutoParaLista } from './quoteLogic';

export interface RascunhoOrcamento {
  listaAdicional: string;
  listaRevisao: string;
  ajustesManuais: string;
  revAprovadaInput: string;
  revPecasInput: string;
  desconto: number;
  parcelas: number;
  placa: string;
  telefone: string;
  numero: string;
  dataDoc: string;
  nome: string;
  chassi: string;
}

export const RASCUNHO_KEY = 'orcamento_rascunho_v1';

/**
 * Último orçamento em edição (fica no localStorage do navegador, local).
 * Serve para reabrir o app com o que o usuário estava fazendo, em vez de
 * começar do zero. Não substitui o histórico (que guarda os processados).
 * Formato antigo (`descReparo`/`orcamentoRaw` crus) migra uma vez para listas.
 */
export const lerRascunho = (): RascunhoOrcamento | null => {
  try {
    const bruto = localStorage.getItem(RASCUNHO_KEY);
    if (!bruto) return null;
    const d = JSON.parse(bruto);
    const base = {
      ajustesManuais: typeof d?.ajustesManuais === 'string' ? d.ajustesManuais : '',
      revAprovadaInput: typeof d?.revAprovadaInput === 'string' ? d.revAprovadaInput : '1766,23',
      revPecasInput: typeof d?.revPecasInput === 'string' ? d.revPecasInput : '1000,00',
      desconto: typeof d?.desconto === 'number' ? d.desconto : 5,
      parcelas: typeof d?.parcelas === 'number' ? d.parcelas : 6,
      placa: typeof d?.placa === 'string' ? d.placa : '',
      telefone: typeof d?.telefone === 'string' ? d.telefone : '',
      numero: typeof d?.numero === 'string' ? d.numero : '',
      dataDoc: typeof d?.dataDoc === 'string' ? d.dataDoc : '',
      nome: typeof d?.nome === 'string' ? d.nome : '',
      chassi: typeof d?.chassi === 'string' ? d.chassi : '',
    };
    if (typeof d?.listaAdicional === 'string' && typeof d?.listaRevisao === 'string') {
      return { listaAdicional: d.listaAdicional, listaRevisao: d.listaRevisao, ...base };
    }
    // Rascunho do formato antigo: converte o bruto uma vez para a lista.
    if (typeof d?.descReparo === 'string' && typeof d?.orcamentoRaw === 'string') {
      return {
        listaAdicional: converterBrutoParaLista(d.descReparo, d.orcamentoRaw),
        listaRevisao: '',
        ...base,
      };
    }
    return null;
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
