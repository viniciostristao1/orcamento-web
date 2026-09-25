import React, { useState } from 'react';
import { useRotulos } from './RotulosContext';

interface TituloEditavelProps {
  id: string;
  /** 'acento' = tudo azul; 'duas-cores' = primeira palavra branca e o resto azul; 'simples' = texto normal. */
  estilo?: 'acento' | 'duas-cores' | 'simples';
  className?: string;
}

const TituloEditavel: React.FC<TituloEditavelProps> = ({ id, estilo = 'simples', className = '' }) => {
  const { rotulos, renomearTitulo } = useRotulos();
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState('');
  const texto = rotulos.titulos[id] ?? '';

  const confirmar = () => {
    renomearTitulo(id, valor);
    setEditando(false);
  };

  if (editando) {
    return (
      <input
        autoFocus
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') confirmar();
          if (e.key === 'Escape') setEditando(false);
        }}
        onBlur={confirmar}
        aria-label="Renomear título"
        className={`${className} bg-transparent border-b-2 border-blue-500 outline-none`}
        style={{ width: `${Math.max(valor.length + 2, 8)}ch` }}
      />
    );
  }

  const partes = texto.split(' ');
  const conteudo =
    estilo === 'duas-cores' && partes.length > 1 ? (
      <>
        {partes[0]} <span className="text-blue-500">{partes.slice(1).join(' ')}</span>
      </>
    ) : estilo === 'acento' ? (
      <span className="text-blue-500">{texto}</span>
    ) : (
      <>{texto}</>
    );

  return (
    <h1
      className={`${className} cursor-text`}
      onDoubleClick={() => {
        setValor(texto);
        setEditando(true);
      }}
      title="Duplo clique para renomear"
    >
      {conteudo}
    </h1>
  );
};

export default TituloEditavel;
