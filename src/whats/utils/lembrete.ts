/** Lembrete pop-up do disparo mensal (aba Whats). */
export const LEMBRETE_KEY = 'zap_lembrete_v1';

export interface LembreteDisparo {
  /** Dia do mês em que o aviso aparece (1–31). */
  dia: number;
  /** Linha pequena do aviso (ex.: "HOJE É DIA 01"). */
  titulo: string;
  /** Linha grande do aviso (ex.: "Disparar Agora!"). */
  mensagem: string;
  /** Desligado = o aviso nunca aparece. */
  ativo: boolean;
}

export const LEMBRETE_PADRAO: LembreteDisparo = {
  dia: 1,
  titulo: 'HOJE É DIA 01',
  mensagem: 'Disparar Agora!',
  ativo: true,
};

const limitarDia = (n: number): number =>
  Number.isFinite(n) ? Math.min(31, Math.max(1, Math.trunc(n))) : LEMBRETE_PADRAO.dia;

/** Lê o lembrete do localStorage (sem nada salvo, vale o padrão do dia 01). */
export const lerLembrete = (storage: Storage = localStorage): LembreteDisparo => {
  try {
    const bruto = storage.getItem(LEMBRETE_KEY);
    if (!bruto) return LEMBRETE_PADRAO;
    const d = JSON.parse(bruto);
    return {
      dia: limitarDia(d?.dia ?? LEMBRETE_PADRAO.dia),
      titulo: typeof d?.titulo === 'string' && d.titulo.trim() ? d.titulo : LEMBRETE_PADRAO.titulo,
      mensagem:
        typeof d?.mensagem === 'string' && d.mensagem.trim() ? d.mensagem : LEMBRETE_PADRAO.mensagem,
      ativo: d?.ativo ?? LEMBRETE_PADRAO.ativo,
    };
  } catch {
    return LEMBRETE_PADRAO;
  }
};

export const salvarLembrete = (lembrete: LembreteDisparo, storage: Storage = localStorage): void => {
  try {
    storage.setItem(
      LEMBRETE_KEY,
      JSON.stringify({ ...lembrete, dia: limitarDia(lembrete.dia) }),
    );
  } catch {
    /* cota/privacidade: ignora */
  }
};
