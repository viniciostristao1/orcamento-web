import React, { useRef } from 'react';
import { Download, Upload, Cloud } from 'lucide-react';
import { Contact } from '../types';

interface BackupManagerProps {
  contacts: Contact[];
  messageTemplate: string;
  onImport: (data: { contacts: Contact[], messageTemplate: string }) => void;
}

const BackupManager: React.FC<BackupManagerProps> = ({ contacts, messageTemplate, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = {
        contacts,
        messageTemplate,
        exportDate: new Date().toISOString(),
        version: "1.2",
        app: "zapzap-manager"
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      link.href = url;
      link.download = `backup-zapzap-manager-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao gerar backup. Tente novamente.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);
        
        if (json && json.contacts && Array.isArray(json.contacts)) {
          const contactCount = json.contacts.length;
          
          onImport({
            contacts: json.contacts,
            messageTemplate: json.messageTemplate || messageTemplate
          });
          alert(`✅ SUCESSO!\n\n${contactCount} contatos foram restaurados.`);
        } else {
          alert('❌ Erro: Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('❌ Erro crítico: Arquivo corrompido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-900/60 p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-slate-800 transition-all relative overflow-hidden group h-full">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-800/40 via-slate-700/50 to-slate-800/40"></div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10 mt-2">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/30 border border-blue-500/30">
          <Cloud className="text-white" size={28} />
        </div>
        <div>
          <h2 className="titulo-tema text-2xl font-black text-slate-100 uppercase tracking-tight">Centro de Dados</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Segurança & Backups</p>
        </div>
      </div>

      <p className="text-base text-slate-400 mb-10 font-bold leading-relaxed max-w-lg relative z-10">
        Gere uma cópia física dos seus <span className="text-slate-100">contatos e da mensagem padrão</span> para evitar perda de dados localmente.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 mt-auto">
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[13px] font-black tracking-widest transition-all shadow-lg shadow-blue-900/30 active:scale-95 uppercase cursor-pointer"
        >
          <Download size={20} strokeWidth={3} />
          Exportar Base
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-3 py-4 campo-tema hover:bg-slate-800/40 text-slate-400 border border-slate-800 rounded-2xl text-[13px] font-black tracking-widest transition-all active:scale-95 uppercase cursor-pointer"
        >
          <Upload size={20} strokeWidth={3} />
          Importar
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json,application/json"
        className="hidden"
      />
    </div>
  );
};

export default BackupManager;
