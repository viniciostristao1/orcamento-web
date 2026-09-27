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
