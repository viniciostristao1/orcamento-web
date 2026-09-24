import React, { useState, useEffect } from 'react';
import { MessageSquare, Copy, Check } from 'lucide-react';

interface MessageEditorProps {
  initialTemplate: string;
  onSave: (template: string) => void;
}

const MessageEditor: React.FC<MessageEditorProps> = ({ initialTemplate, onSave }) => {
  const [template, setTemplate] = useState(initialTemplate);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTemplate(initialTemplate);
  }, [initialTemplate]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
    onSave(e.target.value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-slate-800 flex-1 flex flex-col min-h-[400px] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-all duration-1000"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-900/30 border border-blue-500/30">
            <MessageSquare className="text-white" size={24} />
          </div>
          <div>
            <h2 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-tight">Script de Prospecção</h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Template de Atendimento</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Copiado' : 'Copiar'}
          title={copied ? 'Copiado' : 'Copiar'}
          className={`p-3 rounded-2xl border transition-all flex items-center justify-center shadow-sm cursor-pointer ${
            copied 
            ? 'bg-green-600 border-green-700 text-white' 
            : 'campo-tema border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-600'
          }`}
        >
          {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={2} />}
        </button>
      </div>
      
      <div className="flex-1 flex flex-col space-y-4 relative z-10">
        <div className="flex-1 relative">
          <textarea
            value={template}
            onChange={handleChange}
            className="w-full h-full min-h-[220px] px-8 py-6 campo-tema text-slate-100 border border-slate-800 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none resize-none transition-all text-xl leading-relaxed font-bold placeholder:text-slate-700 shadow-inner"
            placeholder="Escreva aqui a mensagem padrão..."
          />
        </div>
        <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-[0.15em] flex items-center gap-3 px-6">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          Sincronizado com WhatsApp Web
        </div>
      </div>
    </div>
  );
};

export default MessageEditor;
