import React, { useEffect, useState } from 'react';
import { MessageSquare, Copy, Check } from 'lucide-react';

interface MessageEditorProps {
  initialPneus: string;
  initialRevisao: string;
  onSavePneus: (texto: string) => void;
  onSaveRevisao: (texto: string) => void;
}

interface ScriptBoxProps {
  titulo: string;
  subtitulo: string;
  placeholder: string;
  valorInicial: string;
  onSave: (texto: string) => void;
}

const ScriptBox: React.FC<ScriptBoxProps> = ({ titulo, subtitulo, placeholder, valorInicial, onSave }) => {
  const [texto, setTexto] = useState(valorInicial);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setTexto(valorInicial);
  }, [valorInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTexto(e.target.value);
    onSave(e.target.value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-slate-800 relative overflow-hidden">
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-900/30 border border-blue-500/30">
            <MessageSquare className="text-white" size={20} />
          </div>
          <div>
            <h2 className="titulo-tema text-lg font-black text-slate-100 uppercase tracking-tight">{titulo}</h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{subtitulo}</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          aria-label={copiado ? 'Copiado' : 'Copiar'}
          title={copiado ? 'Copiado' : 'Copiar'}
          className={`p-3 rounded-2xl border transition-all flex items-center justify-center shadow-sm cursor-pointer ${
            copiado
              ? 'bg-green-600 border-green-700 text-white'
              : 'campo-tema border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600'
          }`}
        >
          {copiado ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={2} />}
        </button>
      </div>

      <textarea
        value={texto}
        onChange={handleChange}
        className="w-full min-h-[140px] px-6 py-5 campo-tema text-slate-100 border border-slate-800 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none resize-none transition-all text-lg leading-relaxed font-bold placeholder:text-slate-700 shadow-inner"
        placeholder={placeholder}
      />
    </div>
  );
};

const MessageEditor: React.FC<MessageEditorProps> = ({ initialPneus, initialRevisao, onSavePneus, onSaveRevisao }) => (
  <div className="space-y-6">
    <ScriptBox
      titulo="Script Pneus"
      subtitulo="Ofertas de pneus"
      placeholder="Escreva aqui o script de pneus…"
      valorInicial={initialPneus}
      onSave={onSavePneus}
    />
    <ScriptBox
      titulo="Script Revisão"
      subtitulo="Mensagem padrão dos contatos"
      placeholder="Escreva aqui o script de revisão…"
      valorInicial={initialRevisao}
      onSave={onSaveRevisao}
    />
  </div>
);

export default MessageEditor;
