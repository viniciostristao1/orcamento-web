export type Tema = 'azul' | 'papel' | 'whatsapp' | 'tecnico' | 'suave' | 'grafite';

export const TEMA_KEY = 'orcamentos_tema_v1';

const TEMAS_VALIDOS: readonly Tema[] = ['azul', 'papel', 'whatsapp', 'tecnico', 'suave', 'grafite'];

/**
 * Nomes antigos → novos (usuários que já tinham um tema salvo não perdem nada).
 * Temas removidos na v0.29.0 (`terracota`, `executivo`) caem no padrão `azul`
 * pela validação de `TEMAS_VALIDOS`.
 */
const LEGADO: Record<string, Tema> = {
  original: 'azul',
  claude: 'azul',
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
