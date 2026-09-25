import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import MessageEditor from './components/MessageEditor';
import TituloEditavel from '../components/TituloEditavel';
import { Contact } from './types';
import {
  SCRIPT_PNEUS_KEY,
  SCRIPT_REVISAO_KEY,
  lerScripts,
  salvarScriptPneus,
  salvarScriptRevisao,
} from './utils/scripts';

const WhatsApp: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('zap_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  // Dois scripts: pneus (ofertas) e revisão (usado no NOTIFICAR/copiar contato).
  const [scriptPneus, setScriptPneus] = useState(() => lerScripts().pneus);
  const [scriptRevisao, setScriptRevisao] = useState(() => lerScripts().revisao);

  useEffect(() => {
    localStorage.setItem('zap_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    salvarScriptPneus(scriptPneus);
    salvarScriptRevisao(scriptRevisao);
  }, [scriptPneus, scriptRevisao]);

  // Sincronizar dados entre abas para evitar perda de dados
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zap_contacts' && e.newValue) setContacts(JSON.parse(e.newValue));
      if (e.key === SCRIPT_PNEUS_KEY && e.newValue !== null) setScriptPneus(e.newValue);
      if (e.key === SCRIPT_REVISAO_KEY && e.newValue !== null) setScriptRevisao(e.newValue);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addContact = (newContact: Omit<Contact, 'id'>) => {
    const contact: Contact = {
      ...newContact,
      id: Math.random().toString(36).substr(2, 9)
    };
    setContacts(prev => [...prev, contact]);
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const markAsSent = (id: string) => {
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, lastSentTimestamp: Date.now() } : c
    ));
  };

  const updateContactNote = (id: string, note: string) => {
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, internalNote: note } : c
    ));
  };

  const updateContactMessage = (id: string, message: string) => {
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, customMessage: message } : c
    ));
  };

  const updateContactDate = (id: string, date: string) => {
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, targetDate: date } : c
    ));
  };

  const today = new Date();
  const isBroadcastingDay = today.getDate() === 1;

  return (
    <div className="ui-compacta pt-1 pb-20 text-slate-200">
      <header className="mb-4 text-center">
        <TituloEditavel id="whats" estilo="duas-cores" className="titulo-tema text-3xl font-black tracking-tighter uppercase" />
      </header>

      {/* Esquerda: NOVO CONTATO + scripts. Direita: RELATÓRIO DE ENVIOS
          (uma coluna de contatos). */}
      <main className="max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <ContactForm onAdd={addContact} count={contacts.length} />
            <MessageEditor
              initialPneus={scriptPneus}
              initialRevisao={scriptRevisao}
              onSavePneus={setScriptPneus}
              onSaveRevisao={setScriptRevisao}
            />
          </div>

          <ContactList
            contacts={contacts}
            onRemove={removeContact}
            onMarkAsSent={markAsSent}
            onUpdateNote={updateContactNote}
            onUpdateMessage={updateContactMessage}
            onUpdateDate={updateContactDate}
            messageTemplate={scriptRevisao}
          />
        </div>
      </main>

      {isBroadcastingDay && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-800 flex items-center gap-5 ring-1 ring-slate-700/40">
            <div className="bg-blue-600 p-3.5 rounded-2xl shadow-lg shadow-blue-900/30">
              <Send className="text-white" size={32} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">HOJE É DIA 01</p>
              <p className="font-extrabold text-slate-100 text-xl tracking-tight">Disparar Agora!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsApp;
