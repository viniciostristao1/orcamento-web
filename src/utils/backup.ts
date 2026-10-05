import { TEMA_KEY } from './tema';
import { RASCUNHO_KEY } from './rascunho';
import { ULTIMO_KEY } from './ultimoOrcamento';
import { SCRIPT_PNEUS_KEY, SCRIPT_REVISAO_KEY } from '../whats/utils/scripts';
import { CONTATOS_KEY } from '../whats/utils/contatosHoje';
import { SENHA_KEY } from './bloqueio';

/** Chave do histórico de orçamentos (a mesma usada em utils/historico.ts). */
export const HISTORICO_KEY = 'orcamentos_historico_v1';
/** Chave do histórico do Tire Flyer (a mesma usada em tire/utils/historicoFlyer.ts). */
export const FLYER_KEY = 'flyer_historico_v1';

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
] as const;

/**
 * Chaves que guardam LISTAS de itens com `id` (históricos + contatos): ao
 * restaurar, mesclam por id em vez de sobrescrever — o que já está no navegador
 * nunca é apagado. As demais chaves são "estado atual" e seguem sobrescritas.
 */
const CHAVES_LISTA: readonly string[] = [HISTORICO_KEY, FLYER_KEY, CONTATOS_KEY];

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
