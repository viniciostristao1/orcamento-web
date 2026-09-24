export type Tema = 'original' | 'claude';

export const TEMA_KEY = 'orcamentos_tema_v1';

export const lerTemaSalvo = (): Tema => {
  try {
    return localStorage.getItem(TEMA_KEY) === 'claude' ? 'claude' : 'original';
  } catch {
    return 'original';
  }
};

/**
 * O tema vira um atributo no <html> (`data-tema`) e o CSS troca a paleta da
 * interface. Os documentos de saída (PNG do orçamento e do flyer) NÃO mudam —
 * ver o reset das variáveis em index.css.
 */
export const aplicarTema = (tema: Tema): void => {
  document.documentElement.dataset.tema = tema;
};
