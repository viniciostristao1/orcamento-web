import { avisarLembretesMudaram, formatarLembrete } from '../../utils/lembretes';
import { parseDataPtBr } from './parseRevisoes';

/**
 * Lista da aba REVISÕES (v0.161.0): um item por veículo, com a previsão da
 * próxima passagem (chassi + data), nome/telefone do cliente, lembrete global
 * (sino + popup, como orçamentos/flyer) e botão WhatsApp.
 */

/** Uma previsão salva na lista de revisões. */
export interface RevisaoAgendada {
  id: string;
  criadoEm: string;
  /** Chassi do veículo (17 caracteres, maiúsculas). */
  chassi: string;
  veiculo: string;
  /** Nome do cliente (campo livre abaixo da projeção). */
  nome: string;
  /** Telefone do cliente (DDD + número; só abre o wa.me). */
  telefone: string;
  /** Última passagem que gerou a previsão (base do cálculo). */
  ultimaAbertura: string; // dd/mm/aaaa
  ultimoKm: number;
  kmAlvo: number;
  revisaoProxima: number | null;
  /** Data prevista da próxima (dd/mm/aaaa; editável na lista). */
  dataPrevista: string;
  /** Como a previsão foi calculada (ritmo = chega ao km antes do limite). */
  motivoPrevisao?: 'ritmo' | 'limite';
  /** Ritmo médio usado no cálculo (km/dia; para conferir na lista). */
  ritmoKmPorDia?: number | null;
  /** Lembrete com data/hora (botão relógio; ISO "YYYY-MM-DDTHH:mm"). */
  lembreteEm?: string | null;
  /** Já chamei (segundo contato): caixinha da lista que acinzenta o item. */
  chamado?: boolean;
  /** Nota sobre a revisão (texto livre do item). */
  nota?: string;
  /** Observação do lembrete (entra na busca do sino via rótulo? fica no cartão). */
  observacao?: string;
}

export const REVISOES_HISTORICO_KEY = 'revisoes_historico_v1';
/** Data da última busca de clientes para prever revisão (dd/mm/aaaa). */
export const REVISOES_ULTIMA_BUSCA_KEY = 'revisoes_ultima_busca_v1';
const MAX = 200;

/** dd/mm/aaaa → yyyy-mm-dd (para `<input type="date">`). Vazio se inválida. */
export function dataPtBrParaInput(data: string): string {
  const m = data.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m || !parseDataPtBr(data)) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** yyyy-mm-dd (`<input type="date">`) → dd/mm/aaaa. Vazio se inválida. */
export function inputParaDataPtBr(input: string): string {
  const m = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const pt = `${m[3]}/${m[2]}/${m[1]}`;
  return parseDataPtBr(pt) ? pt : '';
}

/** ISO "YYYY-MM-DDTHH:mm" → dd/mm/aaaa (só a data, para exibir). */
export function isoParaDataPtBr(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}/.exec(iso ?? '');
  if (!m) return '';
  const pt = `${m[3]}/${m[2]}/${m[1]}`;
  return parseDataPtBr(pt) ? pt : '';
}

/**
 * dd/mm/aaaa → ISO "YYYY-MM-DDTHH:mm" para o lembrete (09:00 por padrão;
 * mantém a hora atual quando já existe uma).
 */
export function dataPtBrParaISOManha(dataPtBr: string, manterHora?: string | null): string | null {
  if (!parseDataPtBr(dataPtBr)) return null;
  const mHora = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(manterHora ?? '');
  const hora = mHora ? mHora[2] : '09:00';
  const m = dataPtBr.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}T${hora}`;
}

export function listarHistoricoRevisoes(storage: Storage = localStorage): RevisaoAgendada[] {
  try {
    const raw = storage.getItem(REVISOES_HISTORICO_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as RevisaoAgendada[]) : [];
  } catch {
    return [];
  }
}

function gravar(lista: RevisaoAgendada[], storage: Storage = localStorage): void {
  try {
    storage.setItem(REVISOES_HISTORICO_KEY, JSON.stringify(lista.slice(0, MAX)));
  } catch {
    /* cota/privacidade: ignora */
  }
}

/** Ordena pela data prevista (mais próxima primeiro; sem data vai ao fim). */
export function ordenarPorPrevisao(lista: RevisaoAgendada[]): RevisaoAgendada[] {
  const tempo = (r: RevisaoAgendada): number => {
    const iso = dataPtBrParaISOManha(r.dataPrevista);
    const t = iso ? new Date(iso).getTime() : NaN;
    return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
  };
  return [...lista].sort((a, b) => tempo(a) - tempo(b));
}

/**
 * Salva a previsão na lista. Mesmo chassi atualiza o item (não duplica —
 * um veículo = uma linha): vale o cálculo novo, mas nome/telefone digitados
 * agora vencem quando preenchidos (vazio mantém o anterior).
 */
export function adicionarAhistoricoRevisoes(
  novo: Omit<RevisaoAgendada, 'id' | 'criadoEm'>,
  storage: Storage = localStorage,
): RevisaoAgendada[] {
  const lista = listarHistoricoRevisoes(storage);
  const chave = (novo.chassi ?? '').trim().toUpperCase();
  const idx = lista.findIndex((r) => (r.chassi ?? '').trim().toUpperCase() === chave && chave !== '');
  if (idx >= 0) {
    const atual = lista[idx];
    const atualizado: RevisaoAgendada = {
      ...atual,
      ...novo,
      chassi: chave || novo.chassi,
      nome: novo.nome.trim() || atual.nome,
      telefone: novo.telefone.trim() || atual.telefone,
      chamado: novo.chamado ?? atual.chamado,
      nota: novo.nota ?? atual.nota,
      id: atual.id,
      criadoEm: atual.criadoEm,
    };
    const out = [atualizado, ...lista.slice(0, idx), ...lista.slice(idx + 1)];
    gravar(out, storage);
    avisarLembretesMudaram();
    return out;
  }
  const rec: RevisaoAgendada = {
    ...novo,
    chassi: chave || novo.chassi.trim().toUpperCase(),
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
    criadoEm: new Date().toLocaleString('pt-BR'),
  };
  const out = [rec, ...lista];
  gravar(out, storage);
  avisarLembretesMudaram();
  return out;
}

export function removerDoHistoricoRevisoes(id: string, storage: Storage = localStorage): RevisaoAgendada[] {
  const out = listarHistoricoRevisoes(storage).filter((r) => r.id !== id);
  gravar(out, storage);
  avisarLembretesMudaram();
  return out;
}

/** Edita nome/telefone do item (sem tocar na previsão nem no lembrete). */
export function atualizarContatoRevisao(
  id: string,
  nome: string,
  telefone: string,
  storage: Storage = localStorage,
): RevisaoAgendada[] {
  const out = listarHistoricoRevisoes(storage).map((r) =>
    r.id === id ? { ...r, nome: nome.trim(), telefone: telefone.trim() } : r,
  );
  gravar(out, storage);
  return out;
}

/**
 * Edita a data prevista (dd/mm/aaaa): move o lembrete junto para a nova data
 * (mantém a hora; sem lembrete, cria às 09:00). Data inválida não salva.
 */
export function atualizarDataPrevista(
  id: string,
  dataPrevista: string,
  storage: Storage = localStorage,
): RevisaoAgendada[] {
  if (!parseDataPtBr(dataPrevista)) return listarHistoricoRevisoes(storage);
  const out = listarHistoricoRevisoes(storage).map((r) =>
    r.id === id
      ? {
          ...r,
          dataPrevista,
          lembreteEm: dataPtBrParaISOManha(dataPrevista, r.lembreteEm) ?? r.lembreteEm,
        }
      : r,
  );
  gravar(out, storage);
  avisarLembretesMudaram();
  return out;
}

/**
 * Agenda o lembrete (ISO + observação). `null` conclui (só a data sai).
 * Sem `observacao`, mantém a atual. Salva e avisa o popup/sino global.
 */
export function atualizarLembreteRevisao(
  id: string,
  lembreteEm: string | null,
  observacao?: string,
  storage: Storage = localStorage,
): RevisaoAgendada[] {
  const out = listarHistoricoRevisoes(storage).map((r) =>
    r.id === id
      ? {
          ...r,
          lembreteEm,
          observacao: observacao === undefined ? r.observacao : observacao.trim().slice(0, 120),
        }
      : r,
  );
  gravar(out, storage);
  avisarLembretesMudaram();
  return out;
}

/**
 * Marca/desmarca "já chamei" (segundo contato). Salva na hora;
 * o item fica acinzentado na lista.
 */
export function atualizarChamadoRevisao(
  id: string,
  chamado: boolean,
  storage: Storage = localStorage,
): RevisaoAgendada[] {
  const out = listarHistoricoRevisoes(storage).map((r) =>
    r.id === id ? { ...r, chamado } : r,
  );
  gravar(out, storage);
  return out;
}

/**
 * Salva a nota sobre a revisão (texto livre, até 500 chars). Salva na hora.
 */
export function atualizarNotaRevisao(
  id: string,
  nota: string,
  storage: Storage = localStorage,
): RevisaoAgendada[] {
  const out = listarHistoricoRevisoes(storage).map((r) =>
    r.id === id ? { ...r, nota: nota.slice(0, 500) } : r,
  );
  gravar(out, storage);
  return out;
}

/** Rótulo do lembrete no sino/popup: nome, chassi ou data. */
export function rotuloRevisao(r: { nome?: string; chassi?: string; dataPrevista?: string }): string {
  return (
    r.nome?.trim() ||
    r.chassi?.trim() ||
    r.dataPrevista?.trim() ||
    'Revisão'
  );
}

/** Texto do lembrete já formatado ("12/10/2027 09:00"), ou null. */
export function textoLembreteRevisao(lembreteEm: string | null | undefined): string | null {
  return formatarLembrete(lembreteEm);
}

/**
 * Lista pronta para colar no Excel (TAB entre colunas): cabeçalho + uma linha
 * por previsão, na ordem recebida (a tela manda já ordenada).
 */
export function textoListaParaExcel(itens: RevisaoAgendada[]): string {
  const linhas = itens.map((r) =>
    [
      r.chassi ?? '',
      r.veiculo ?? '',
      r.nome ?? '',
      r.telefone ?? '',
      r.dataPrevista ?? '',
      String(r.kmAlvo ?? ''),
      r.revisaoProxima === null || r.revisaoProxima === undefined
        ? ''
        : String(r.revisaoProxima).padStart(2, '0'),
      r.ultimaAbertura ?? '',
      String(r.ultimoKm ?? ''),
    ].join('\t'),
  );
  return [
    'CHASSI\tVEÍCULO\tNOME\tWHATSAPP\tPREVISÃO\tKM ALVO\tREV\tÚLTIMA\tÚLTIMO KM',
    ...linhas,
  ].join('\n');
}

/**
 * Última busca de clientes para prever revisão (dd/mm/aaaa, ao lado do copiar).
 * Vazio = nunca registrada; inválida não salva.
 */
export function lerUltimaBusca(storage: Storage = localStorage): string {
  try {
    const v = storage.getItem(REVISOES_ULTIMA_BUSCA_KEY) ?? '';
    return parseDataPtBr(v) ? v : '';
  } catch {
    return '';
  }
}

export function salvarUltimaBusca(dataPtBr: string, storage: Storage = localStorage): void {
  try {
    if (!dataPtBr) storage.removeItem(REVISOES_ULTIMA_BUSCA_KEY);
    else if (parseDataPtBr(dataPtBr)) storage.setItem(REVISOES_ULTIMA_BUSCA_KEY, dataPtBr);
  } catch {
    /* cota/privacidade: ignora */
  }
}
