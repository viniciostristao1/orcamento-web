export type Tema =
  | 'azul'
  | 'terracota'
  | 'papel'
  | 'executivo'
  | 'whatsapp'
  | 'tecnico'
  | 'suave';

export const TEMA_KEY = 'orcamentos_tema_v1';

const TEMAS_VALIDOS: readonly Tema[] = [
  'azul',
  'terracota',
  'papel',
  'executivo',
  'whatsapp',
  'tecnico',
  'suave',
];

/** Nomes antigos → novos (usuários que já tinham um tema salvo não perdem nada). */
const LEGADO: Record<string, Tema> = {
  original: 'azul',
  claude: 'terracota',
};

export const lerTemaSalvo = (): Tema => {
  try {
    const bruto = localStorage.getItem(TEMA_KEY) ?? '';
    const migrado = LEGADO[bruto] ?? bruto;
    return (TEMAS_VALIDOS as readonly string[]).includes(migrado) ? (migrado as Tema) : 'azul';
  } catch {
    return 'azul';
  }
};

/**
 * O tema vira um atributo no <html> (`data-tema`) e o CSS troca a paleta da
 * interface. Os documentos de saída (PNG do orçamento e do flyer) NÃO mudam —
 * ver o reset das variáveis em index.css.
 */
export const aplicarTema = (tema: Tema): void => {
  document.documentElement.dataset.tema = tema;
};
