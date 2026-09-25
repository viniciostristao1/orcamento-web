import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Rotulos, lerRotulos, salvarRotulos } from '../utils/rotulos';

interface RotulosContextValue {
  rotulos: Rotulos;
  renomearAba: (id: string, valor: string) => void;
  renomearTitulo: (id: string, valor: string) => void;
}

const defaultValue: RotulosContextValue = {
  rotulos: { abas: {}, titulos: {} },
  renomearAba: () => {},
  renomearTitulo: () => {},
};

const RotulosContext = createContext<RotulosContextValue>(defaultValue);

export const RotulosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rotulos, setRotulos] = useState<Rotulos>(lerRotulos);

  useEffect(() => {
    salvarRotulos(rotulos);
  }, [rotulos]);

  const renomear = (campo: 'abas' | 'titulos') => (id: string, valor: string) => {
    const limpo = valor.trim();
    if (!limpo) return;
    setRotulos((r) => ({ ...r, [campo]: { ...r[campo], [id]: limpo } }));
  };

  return (
    <RotulosContext.Provider
      value={{ rotulos, renomearAba: renomear('abas'), renomearTitulo: renomear('titulos') }}
    >
      {children}
    </RotulosContext.Provider>
  );
};

export const useRotulos = (): RotulosContextValue => useContext(RotulosContext);
