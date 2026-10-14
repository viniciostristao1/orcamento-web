/** Cor de texto/barra de cada fabricante (regras do flyer original). */
export const getBrandStyle = (brandName: string) => {
  const name = brandName.toUpperCase();

  if (name.includes('DUNLOP')) {
    return { textColor: '#f97316', sideBarColor: '#000000' }; // Laranja / Barra Preta
  }
  if (name.includes('BF GOODRICH') || name.includes('BFGOODRICH')) {
    return { textColor: '#1e3a8a', sideBarColor: '#ef4444' }; // Azul Escuro / Barra Vermelha
  }
  if (name.includes('MICHELIN')) {
    return { textColor: '#2563eb', sideBarColor: '#000000' }; // Azul / Barra Preta
  }
  if (name.includes('BRIDGESTONE')) {
    return { textColor: '#000000', sideBarColor: '#ef4444' }; // Preto / Barra Vermelha
  }

  return { textColor: '#1e293b', sideBarColor: '#cbd5e1' }; // Padrão
};

// ───────────────────── marcas do layout Vitrine ─────────────────────

export interface MarcaPresente {
  /** Chave normalizada (sem acento/maiúscula) para deduplicar. */
  id: string;
  /** Nome para exibir na faixa de logos. */
  rotulo: string;
}

/** Marcas conhecidas, na ordem canônica da faixa de logos da Vitrine. */
const MARCAS_CONHECIDAS: { id: string; rotulo: string; padroes: string[] }[] = [
  { id: 'MICHELIN', rotulo: 'MICHELIN', padroes: ['MICHELIN'] },
  { id: 'BRIDGESTONE', rotulo: 'BRIDGESTONE', padroes: ['BRIDGESTONE'] },
  { id: 'PIRELLI', rotulo: 'PIRELLI', padroes: ['PIRELLI'] },
  { id: 'YOKOHAMA', rotulo: 'YOKOHAMA', padroes: ['YOKOHAMA'] },
  { id: 'DUNLOP', rotulo: 'DUNLOP', padroes: ['DUNLOP'] },
  { id: 'BFGOODRICH', rotulo: 'BFGoodrich', padroes: ['BF GOODRICH', 'BFGOODRICH'] },
  { id: 'FIRESTONE', rotulo: 'FIRESTONE', padroes: ['FIRESTONE'] },
  { id: 'GOODYEAR', rotulo: 'GOODYEAR', padroes: ['GOODYEAR'] },
];

const normalizarMarca = (t: string) =>
  (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

/**
 * Separa a marca conhecida do modelo na coluna "MARCA/MODELO" da tabela
 * (ex.: "Michelin SUV HT" → marca MICHELIN + modelo "SUV HT"). Marca
 * desconhecida vira ela mesma (o texto inteiro, cortado em 40 chars).
 */
export function separarMarcaModelo(brand: string): { marca: MarcaPresente | null; modelo: string } {
  const bruto = (brand || '').trim();
  if (!bruto) return { marca: null, modelo: '' };
  const norm = normalizarMarca(bruto);
  for (const m of MARCAS_CONHECIDAS) {
    for (const p of m.padroes) {
      if (!norm.includes(p)) continue;
      const re = new RegExp(p.replace(/ /g, '\\s+'), 'i');
      const modelo = bruto.replace(re, ' ').replace(/\s+/g, ' ').trim();
      return { marca: { id: m.id, rotulo: m.rotulo }, modelo };
    }
  }
  return { marca: { id: norm.slice(0, 40), rotulo: bruto.slice(0, 40) }, modelo: '' };
}

/**
 * Marcas presentes na lista de pneus (deduplicadas, ordem canônica primeiro e
 * desconhecidas depois, na ordem de aparição). Usada nos testes/labels:
 * sem Dunlop na lista, sem Dunlop no flyer.
 */
export function marcasPresentes(brands: string[]): MarcaPresente[] {
  const vistas = new Set<string>();
  const saida: MarcaPresente[] = [];
  for (const b of brands) {
    const m = separarMarcaModelo(b).marca;
    if (!m || vistas.has(m.id)) continue;
    vistas.add(m.id);
    saida.push(m);
  }
  const ordem = new Map(MARCAS_CONHECIDAS.map((m, i) => [m.id, i]));
  return saida.sort((a, b) => (ordem.get(a.id) ?? 1000) - (ordem.get(b.id) ?? 1000));
}

/** Cores de "logo" (texto estilizado) por marca na Vitrine. */
export const LOGO_MARCA: Record<string, { bg: string; fg: string; italico?: boolean; underline?: string }> = {
  MICHELIN: { bg: '#ffffff', fg: '#002FA7', italico: true, underline: '#FFE600' },
  BRIDGESTONE: { bg: '#ffffff', fg: '#111111', underline: '#d40000' },
  PIRELLI: { bg: '#FFD500', fg: '#d40000', italico: true },
  YOKOHAMA: { bg: '#ffffff', fg: '#d40000', italico: true },
  DUNLOP: { bg: '#FFD500', fg: '#111111', italico: true },
  BFGOODRICH: { bg: '#ffffff', fg: '#003DA5', underline: '#d40000' },
  FIRESTONE: { bg: '#ffffff', fg: '#d40000' },
  GOODYEAR: { bg: '#ffffff', fg: '#003DA5', underline: '#FFD500' },
};

export const logoDaMarca = (id: string) =>
  LOGO_MARCA[id] ?? { bg: '#ffffff', fg: '#334155' };
