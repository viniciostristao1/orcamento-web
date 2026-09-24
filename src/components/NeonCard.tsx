// STUB TEMPORÁRIO — será substituído pelo components/NeonCard.tsx real do AI Studio.
import React from 'react';

const NeonCard: React.FC<{
  title: string;
  borderColor?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ title, actions, children }) => (
  <div className="border border-slate-800 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">{title}</h2>
      {actions}
    </div>
    {children}
  </div>
);

export default NeonCard;
