import React from 'react';

interface NeonCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  borderColor?: string;
  actions?: React.ReactNode;
  /** Menos espaço em volta do conteúdo (cabeçalho e área interna menores). */
  compact?: boolean;
}

const NeonCard: React.FC<NeonCardProps> = ({ children, title, className = "", borderColor = "#3b82f6", actions, compact = false }) => {
  const getGlowColor = (color: string) => {
    if (color.includes('blue-500')) return '#3b82f6';
    if (color.includes('blue-600')) return '#2563eb';
    if (color.includes('emerald-500')) return '#10b981';
    return color;
  };

  const glowColor = getGlowColor(borderColor);

  return (
    <div className={`relative ${className}`}>
      {/* Efeito de brilho de fundo */}
      <div 
        data-neon-glow
        className="absolute -inset-1 rounded-3xl opacity-10 blur-xl pointer-events-none"
        style={{ backgroundColor: glowColor, zIndex: 0 }}
      ></div>
      
      <div data-neon-box className="relative z-10 bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
        {/* Cabeçalho do Card Ampliado */}
        {title && (
          <div className={`relative z-30 flex items-center justify-between ${compact ? 'px-6 py-3' : 'px-8 py-6'} bg-slate-950/60 border-b border-slate-800/50`}>
            <div className="flex items-center gap-4">
              <div 
                data-neon-dot
                className="w-2 h-8 rounded-full"
                style={{ backgroundColor: glowColor, boxShadow: `0 0 20px ${glowColor}` }}
              ></div>
              <h3 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-widest">
                {title}
              </h3>
            </div>
            {actions && <div className="flex items-center">{actions}</div>}
          </div>
        )}

        {/* Área de Conteúdo Ampliada */}
        <div className={`relative z-20 ${compact ? 'px-6 pt-2 pb-4' : 'p-8'} flex-grow`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default NeonCard;
