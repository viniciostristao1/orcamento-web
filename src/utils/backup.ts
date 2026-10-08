import { TEMA_KEY } from './tema';
import { RASCUNHO_KEY } from './rascunho';
import { ULTIMO_KEY } from './ultimoOrcamento';
import { SENHA_KEY } from './bloqueio';
import { RAPIDOS_KEY } from './lembretesRapidos';

/** Chaves legadas da aba Whats (removida na v0.117.0): só para restaurar backups antigos. */
export const SCRIPT_PNEUS_KEY = 'zap_script_pneus_v1';
export const SCRIPT_REVISAO_KEY = 'zap_script_revisao_v1';
export const CONTATOS_KEY = 'zap_contacts';

/** Chave do histórico de orçamentos (a mesma usada em utils/historico.ts). */
export const HISTORICO_KEY = 'orcamentos_historico_v1';
/** Chave do histórico do Tire Flyer (a mesma usada em tire/utils/historicoFlyer.ts). */
export const FLYER_KEY = 'flyer_historico_v1';

/** Quando foi feito o último backup (ISO; atualizado a cada download). */
export const BACKUP_DATA_KEY = 'backup_ultimo_v1';
/** Dias sem backup até a engrenagem acender o aviso. */
export const DIAS_AVISO_BACKUP = 30;

/**
 * Tudo o que o app guarda no navegador entra no backup. São dados locais
 * (localStorage) — nada vai para nuvem/servidor; o backup é a rede de segurança
 * contra limpar os dados do navegador.
 */
export const CHAVES_BACKUP = [
  HISTORICO_KEY,
  ULTIMO_KEY,
  RASCUNHO_KEY,
  TEMA_KEY,
  CONTATOS_KEY,
  SCRIPT_PNEUS_KEY,
  SCRIPT_REVISAO_KEY,
  'zap_template', // chave antiga: mantém compatibilidade na restauração
  FLYER_KEY,
  'flyer_layout_v1',
  'dados_tabelas_v1',
  'rotulos_v1',
  SENHA_KEY, // a senha do cadeado acompanha o backup (restaurar mantém a senha)
  RAPIDOS_KEY, // lembretes rápidos do sino
  BACKUP_DATA_KEY, // data do último backup (restaurar não reacende o aviso à toa)
] as const;

/** Marca agora como data do último backup (chamar após cada download). */
export function registrarBackup(agora: Date = new Date()): void {
  try {
    localStorage.setItem(BACKUP_DATA_KEY, agora.toISOString());
  } catch {
    /* ignora */
  }
}

/** ISO do último backup, ou null se nunca fez. */
export function lerUltimoBackup(): string | null {
  try {
    return localStorage.getItem(BACKUP_DATA_KEY);
  } catch {
    return null;
  }
}

/** Dias (cheios) desde o último backup; null se nunca fez. */
export function diasDesdeBackup(agora: Date = new Date()): number | null {
  const ultimo = lerUltimoBackup();
  if (!ultimo) return null;
  const t = new Date(ultimo).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((agora.getTime() - t) / 86400000);
}

/** Há dados que valem backup? (sem histórico/contatos, o aviso não faz sentido). */
function temDadosParaBackup(): boolean {
  try {
    for (const chave of [HISTORICO_KEY, FLYER_KEY, CONTATOS_KEY]) {
      const bruto = localStorage.getItem(chave);
      if (bruto && bruto !== '[]') return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** Acende o aviso: tem dados e nunca fez backup, ou o último tem 30+ dias. */
export function precisaLembreteBackup(agora: Date = new Date()): boolean {
  if (!temDadosParaBackup()) return false;
  const dias = diasDesdeBackup(agora);
  return dias === null || dias >= DIAS_AVISO_BACKUP;
}

/**
 * Chaves que guardam LISTAS de itens com `id` (históricos + contatos): ao
 * restaurar, mesclam por id em vez de sobrescrever — o que já está no navegador
 * nunca é apagado. As demais chaves são "estado atual" e seguem sobrescritas.
 */
const CHAVES_LISTA: readonly string[] = [HISTORICO_KEY, FLYER_KEY, CONTATOS_KEY, RAPIDOS_KEY];

export interface ResumoBackup {
  orcamentos: number;
  flyers: number;
  contatos: number;
}

// Alguns valores são texto puro (tema, template) e não JSON — tenta JSON e,
// se falhar, guarda a string como está.
const lerValor = (storage: Storage, chave: string): unknown => {
  const bruto = storage.getItem(chave);
  if (bruto === null) return null;
  try {
    return JSON.parse(bruto);
  } catch {
    return bruto;
  }
};

/** Monta o JSON de backup com todos os dados do app. */
export const montarBackup = (storage: Storage = localStorage): string => {
  const dados: Record<string, unknown> = {};
  for (const chave of CHAVES_BACKUP) {
    const valor = lerValor(storage, chave);
    if (valor !== null) dados[chave] = valor;
  }
  return JSON.stringify(
    {
      app: 'toyota-orcamentos-whats',
      versao: 2,
      exportadoEm: new Date().toISOString(),
      dados,
    },
    null,
    2,
  );
};

/** Nome sugerido do arquivo, ex.: backup-toyota-24-09-2026.json */
export const nomeArquivoBackup = (agora: Date = new Date()): string => {
  const data = agora.toLocaleDateString('pt-BR').replace(/\//g, '-');
  return `backup-toyota-${data}.json`;
};

/** União de duas listas por `id`: mantém os atuais (na ordem) e acrescenta no fim
 * só os do backup com id inédito. Em conflito de id, vale o atual do navegador. */
const mesclarPorId = (atuais: unknown, novas: unknown): unknown => {
  if (!Array.isArray(atuais) || !Array.isArray(novas)) return novas;
  const temId = (i: unknown): i is { id: string } =>
    !!i && typeof (i as { id?: unknown }).id === 'string';
  const vistos = new Set(atuais.filter(temId).map((i) => i.id));
  return [...atuais, ...novas.filter((i) => !(temId(i) && vistos.has(i.id)))];
};

/**
 * Restaura um backup no localStorage. Aceita o formato novo (com `dados` vindo
 * de todas as abas) e o do histórico antigo (lista de orçamentos direto, ou
 * `{ orcamentos: [...] }`) — assim backups antigos continuam funcionando.
 * Listas (históricos + contatos) mesclam por id; o resto sobrescreve.
 */
export const restaurarBackup = (
  conteudo: string,
  storage: Storage = localStorage,
): { ok: true; resumo: ResumoBackup } | { ok: false; erro: string } => {
  let json: any;
  try {
    json = JSON.parse(conteudo);
  } catch {
    return { ok: false, erro: 'Arquivo corrompido (não é JSON válido).' };
  }

  const dados = json?.dados ?? null;
  if (dados && typeof dados === 'object') {
    let gravadas = 0;
    for (const chave of CHAVES_BACKUP) {
      if (!(chave in dados)) continue;
      try {
        const valor = CHAVES_LISTA.includes(chave)
          ? mesclarPorId(lerValor(storage, chave), dados[chave])
          : dados[chave];
        storage.setItem(chave, typeof valor === 'string' ? valor : JSON.stringify(valor));
        gravadas++;
      } catch {
        // ignora chave problemática e segue com as demais
      }
    }
    if (gravadas === 0) return { ok: false, erro: 'Backup sem nenhum dado reconhecido.' };
    return {
      ok: true,
      resumo: {
        orcamentos: Array.isArray(dados[HISTORICO_KEY]) ? dados[HISTORICO_KEY].length : 0,
        flyers: Array.isArray(dados[FLYER_KEY]) ? dados[FLYER_KEY].length : 0,
        contatos: Array.isArray(dados[CONTATOS_KEY]) ? dados[CONTATOS_KEY].length : 0,
      },
    };
  }

  // Formato antigo (backup só do histórico): também mescla por id.
  const lista = Array.isArray(json) ? json : Array.isArray(json?.orcamentos) ? json.orcamentos : null;
  if (lista) {
    const final = mesclarPorId(lerValor(storage, HISTORICO_KEY), lista);
    storage.setItem(HISTORICO_KEY, JSON.stringify(final));
    return { ok: true, resumo: { orcamentos: lista.length, flyers: 0, contatos: 0 } };
  }

  return { ok: false, erro: 'Arquivo de backup inválido.' };
};
