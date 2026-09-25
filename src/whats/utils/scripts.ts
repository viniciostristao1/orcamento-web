export const SCRIPT_PNEUS_KEY = 'zap_script_pneus_v1';
export const SCRIPT_REVISAO_KEY = 'zap_script_revisao_v1';
/** Chave antiga (antes da divisão em dois scripts) — serve para migrar. */
export const SCRIPT_LEGADO_KEY = 'zap_template';

export const SCRIPT_REVISAO_PADRAO =
  'Boa tarde, é o Vinícios da Weiand Toyota Lajeado. Tudo bem? Quando se aproximar de 60 mil km já podes agendar a próxima revisão. Fico à disposição!';

export interface ScriptsWhats {
  pneus: string;
  revisao: string;
}

/**
 * Lê os dois scripts do localStorage. Na primeira vez, o script antigo
 * (`zap_template`) vira o de revisão; o de pneus começa vazio.
 */
export const lerScripts = (storage: Storage = localStorage): ScriptsWhats => {
  const antigo = storage.getItem(SCRIPT_LEGADO_KEY);
  return {
    pneus: storage.getItem(SCRIPT_PNEUS_KEY) ?? '',
    revisao: storage.getItem(SCRIPT_REVISAO_KEY) ?? antigo ?? SCRIPT_REVISAO_PADRAO,
  };
};

export const salvarScriptPneus = (texto: string, storage: Storage = localStorage): void => {
  try {
    storage.setItem(SCRIPT_PNEUS_KEY, texto);
  } catch {
    /* ignorado */
  }
};

export const salvarScriptRevisao = (texto: string, storage: Storage = localStorage): void => {
  try {
    storage.setItem(SCRIPT_REVISAO_KEY, texto);
  } catch {
    /* ignorado */
  }
};
