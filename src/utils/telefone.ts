/** Telefone do cliente (só histórico): normalização para o WhatsApp. */

/** Só os dígitos do que foi digitado (tira espaços, traços, parênteses, +). */
export function somenteDigitos(valor: string | undefined | null): string {
  return (valor ?? '').replace(/\D/g, '');
}

/**
 * Normaliza para abrir no WhatsApp (`wa.me/<digitos>`).
 * Mesma regra da aba Whats (`formatPhone`): DDD+numero (10/11 dígitos)
 * ganha o `55`; quem já veio com `55` (12/13 dígitos) fica como está.
 */
export function normalizarTelefoneParaWhats(valor: string | undefined | null): string {
  const digitos = somenteDigitos(valor);
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  return digitos;
}

/** Tem número suficiente para habilitar o botão (55 + DDD + número). */
export function temTelefoneValido(valor: string | undefined | null): boolean {
  const n = normalizarTelefoneParaWhats(valor);
  return n.length === 12 || n.length === 13;
}

/**
 * URL da conversa no WhatsApp (só abre o chat, sem texto pronto).
 * Null quando não há telefone válido — o botão fica desabilitado.
 */
export function urlWhats(valor: string | undefined | null): string | null {
  if (!temTelefoneValido(valor)) return null;
  return `https://wa.me/${normalizarTelefoneParaWhats(valor)}`;
}

/** Abre a conversa no WhatsApp Web/app em nova aba. Não faz nada sem número. */
export function abrirWhats(valor: string | undefined | null): void {
  const url = urlWhats(valor);
  if (url) window.open(url, '_blank', 'noopener');
}
