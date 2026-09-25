export interface Rotulos {
  /** Nome exibido no botão de cada aba do topo. */
  abas: Record<string, string>;
  /** Título interno de cada tela. */
  titulos: Record<string, string>;
}

export const ROTULOS_KEY = 'rotulos_v1';

export const ROTULOS_PADRAO: Rotulos = {
  abas: {
    orcamentos: 'Orçamentos',
    pneus: 'Tire Flyer',
    whats: 'Whats',
    dados: 'Dados',
  },
  titulos: {
    orcamentos: 'ORÇAMENTOS',
    pneus: 'TIRE FLYER',
    whats: 'PAINEL WHATSAPP',
    dados: 'DADOS',
  },
};

export const lerRotulos = (storage: Storage = localStorage): Rotulos => {
  try {
    const bruto = storage.getItem(ROTULOS_KEY);
    if (!bruto) return ROTULOS_PADRAO;
    const d = JSON.parse(bruto);
    return {
      abas: { ...ROTULOS_PADRAO.abas, ...(d?.abas ?? {}) },
      titulos: { ...ROTULOS_PADRAO.titulos, ...(d?.titulos ?? {}) },
    };
  } catch {
    return ROTULOS_PADRAO;
  }
};

export const salvarRotulos = (rotulos: Rotulos, storage: Storage = localStorage): void => {
  try {
    storage.setItem(ROTULOS_KEY, JSON.stringify(rotulos));
  } catch {
    /* cota/privacidade: ignora */
  }
};
