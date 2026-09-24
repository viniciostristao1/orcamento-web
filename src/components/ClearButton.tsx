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
    aria-label={label}
    title={label}
    className="relative z-50 flex items-center justify-center p-3 bg-slate-800 hover:bg-red-600 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
  >
    <Trash2 size={18} />
  </button>
);

export default ClearButton;
