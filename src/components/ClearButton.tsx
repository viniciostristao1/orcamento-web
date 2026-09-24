import React from 'react';
import { Trash2 } from 'lucide-react';

interface ClearButtonProps {
  onClick: () => void;
  label?: string;
}

const ClearButton: React.FC<ClearButtonProps> = ({ onClick, label = 'Limpar' }) => (
  <button
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
    type="button"
    className="relative z-50 flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-red-600 text-slate-200 rounded-xl transition-all text-xs font-black uppercase border border-slate-700 cursor-pointer active:scale-95"
  >
    <Trash2 size={16} /> {label}
  </button>
);

export default ClearButton;
