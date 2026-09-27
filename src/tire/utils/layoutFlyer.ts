/** Layouts de saída do flyer de pneus (o PNG exportado segue o escolhido). */
export type LayoutFlyer = 'atual' | 'tabela' | 'etiqueta';

export const LAYOUT_FLYER_KEY = 'flyer_layout_v1';

const LAYOUTS_VALIDOS: readonly LayoutFlyer[] = ['atual', 'tabela', 'etiqueta'];

/**
 * Lê o layout salvo. Sem nada salvo (ou valor inválido) cai no `atual`, que é
 * o layout clássico — o comportamento de sempre continua sendo o padrão.
 */
export const lerLayoutFlyer = (): LayoutFlyer => {
  try {
    const bruto = localStorage.getItem(LAYOUT_FLYER_KEY) ?? '';
    return (LAYOUTS_VALIDOS as readonly string[]).includes(bruto) ? (bruto as LayoutFlyer) : 'atual';
  } catch {
    return 'atual';
  }
};

export const salvarLayoutFlyer = (layout: LayoutFlyer): void => {
  try {
    localStorage.setItem(LAYOUT_FLYER_KEY, layout);
  } catch {
    // localStorage indisponível (modo privado) — o layout vale só nesta sessão
  }
};
