/**
 * Cor do cliente no histórico (vale para orçamentos e Tire Flyer).
 * - `verde`: o cliente disse que quer fazer em breve.
 * - `vermelho`: só orçamento / o cliente só pesquisou.
 * Registro sem cor = ainda não marcado (aparece só no filtro "todas").
 */
export type CorCliente = 'verde' | 'vermelho';

/** Filtro de cor da lista do histórico. */
export type FiltroCor = 'todas' | CorCliente;

export const ROTULO_COR: Record<CorCliente, string> = {
  verde: 'Verde — quer fazer em breve',
  vermelho: 'Vermelho — só pesquisou',
};

/** Filtra a lista pela cor marcada. "todas" devolve a lista inteira. */
export function filtrarPorCor<T extends { cor?: CorCliente }>(lista: T[], filtro: FiltroCor): T[] {
  if (filtro === 'todas') return lista;
  return lista.filter((r) => r.cor === filtro);
}

/**
 * Termo de busca textual que pede uma cor ("verde", "vermelho", "vermelha").
 * Recebe o termo JÁ normalizado (maiúsculas, sem acentos/separadores).
 */
export function corDaBusca(termoNormalizado: string): CorCliente | null {
  if (termoNormalizado === 'VERDE') return 'verde';
  if (termoNormalizado === 'VERMELHO' || termoNormalizado === 'VERMELHA') return 'vermelho';
  return null;
}
