import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Rotulos, lerRotulos, salvarRotulos } from '../utils/rotulos';

interface RotulosContextValue {
  rotulos: Rotulos;
  renomearAba: (id: string, valor: string) => void;
}

const defaultValue: RotulosContextValue = {
  rotulos: { abas: {}, titulos: {} },
  renomearAba: () => {},
};

const RotulosContext = createContext<RotulosContextValue>(defaultValue);

export const RotulosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rotulos, setRotulos] = useState<Rotulos>(lerRotulos);

  useEffect(() => {
    salvarRotulos(rotulos);
  }, [rotulos]);

  const renomearAba = (id: string, valor: string) => {
    const limpo = valor.trim();
    if (!limpo) return;
    setRotulos((r) => ({ ...r, abas: { ...r.abas, [id]: limpo } }));
  };

  return (
    <RotulosContext.Provider value={{ rotulos, renomearAba }}>
      {children}
    </RotulosContext.Provider>
  );
};

export const useRotulos = (): RotulosContextValue => useContext(RotulosContext);
