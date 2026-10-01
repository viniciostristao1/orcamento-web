import type { Contact } from '../types';

/** Chave dos contatos no localStorage (a mesma usada na aba Whats). */
export const CONTATOS_KEY = 'zap_contacts';

/**
 * Evento disparado na window sempre que a aba Whats salva os contatos — assim o
 * lembrete global (no App, fora da aba Whats) se atualiza na mesma hora (`storage`
 * sozinho só avisa outras abas/janelas, não a própria).
 */
export const CONTATOS_EVENTO = 'zap:contatos';

/** Data de hoje no mesmo formato dos contatos (`YYYY-MM-DD`). */
export const hojeStr = (agora: Date = new Date()): string => agora.toISOString().split('T')[0];

/** Lê os contatos salvos no navegador (fora da aba Whats, sem depender do state dela). */
export const lerContatos = (storage: Storage = localStorage): Contact[] => {
  try {
    const bruto = storage.getItem(CONTATOS_KEY);
    if (!bruto) return [];
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
};

/** "Concluído" = NOTIFICAR clicado neste mês (mesma regra do Relatório de Envios). */
export const enviadoEsteMes = (contact: Contact, agora: Date = new Date()): boolean => {
  if (!contact.lastSentTimestamp) return false;
  const envio = new Date(contact.lastSentTimestamp);
  return envio.getMonth() === agora.getMonth() && envio.getFullYear() === agora.getFullYear();
};

/**
 * Contatos que disparam o lembrete: data marcada para HOJE e ainda não
 * concluídos. Ordenados por nome para a lista do pop-up ficar estável.
 */
export const contatosParaHoje = (contacts: Contact[], agora: Date = new Date()): Contact[] =>
  contacts
    .filter((c) => c.targetDate === hojeStr(agora) && !enviadoEsteMes(c, agora))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
