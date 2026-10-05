/**
 * Bloqueio da tela com senha (privacidade local: esconde orçamentos, flyers,
 * contatos e tabelas de olhares curiosos). A senha fica no localStorage
 * (`app_bloqueio_senha_v1`) e entra no backup geral — restaurar o backup
 * mantém a senha. É proteção contra acesso casual, não cofre criptografado.
 */
export const SENHA_KEY = 'app_bloqueio_senha_v1';

/** Tamanho mínimo da senha. */
export const SENHA_MIN = 4;

/** Senha atual guardada (null quando ainda não foi criada). */
export function lerSenha(): string | null {
  try {
    return localStorage.getItem(SENHA_KEY);
  } catch {
    return null;
  }
}

/** Já existe senha criada? */
export function temSenha(): boolean {
  return lerSenha() !== null;
}

/** A tentativa confere com a senha guardada? */
export function conferirSenha(tentativa: string): boolean {
  const atual = lerSenha();
  return atual !== null && tentativa === atual;
}

function validarNova(nova: string, confirmar: string): string | null {
  if (nova.length < SENHA_MIN) return `A senha precisa de pelo menos ${SENHA_MIN} caracteres.`;
  if (nova !== confirmar) return 'A confirmação não confere com a nova senha.';
  return null;
}

/** Cria a primeira senha (usado na tela de bloqueio). */
export function criarSenha(nova: string, confirmar: string): { ok: true } | { ok: false; erro: string } {
  const erro = validarNova(nova, confirmar);
  if (erro) return { ok: false, erro };
  try {
    localStorage.setItem(SENHA_KEY, nova);
  } catch {
    return { ok: false, erro: 'Não consegui salvar a senha neste navegador.' };
  }
  return { ok: true };
}

/** Troca a senha (usado nas Configurações; pede a atual). */
export function trocarSenha(
  atual: string,
  nova: string,
  confirmar: string,
): { ok: true } | { ok: false; erro: string } {
  if (!conferirSenha(atual)) return { ok: false, erro: 'A senha atual não confere.' };
  return criarSenha(nova, confirmar);
}
