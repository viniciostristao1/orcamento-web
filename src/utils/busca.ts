/**
 * Normaliza para busca: sem acentos, maiúsculas e só letras/números
 * (ignora / - . : e espaços) — "JOÃO" casa com "joao".
 * Definição única, usada pelos dois históricos (antes duplicada em cada um).
 */
export const normalizarBusca = (s: string): string =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
