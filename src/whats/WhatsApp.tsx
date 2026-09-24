import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import MessageEditor from './components/MessageEditor';
import BackupManager from './components/BackupManager';
import { Contact } from './types';

const WhatsApp: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('zap_contacts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [messageTemplate, setMessageTemplate] = useState(() => {
    const saved = localStorage.getItem('zap_template');
    return saved || 'Boa tarde, é o Vinícios da Weiand Toyota Lajeado. Tudo bem? Quando se aproximar de 60 mil km já podes agendar a próxima revisão. Fico à disposição!';
  });

  useEffect(() => {
    localStorage.setItem('zap_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('zap_template', messageTemplate);
  }, [messageTemplate]);

  // Sincronizar dados entre abas para evitar perda de dados
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zap_contacts' && e.newValue) setContacts(JSON.parse(e.newValue));
      if (e.key === 'zap_template' && e.newValue) setMessageTemplate(e.newValue);
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

  const updateContactDate = (id: string, date: string) => {
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, targetDate: date } : c
    ));
  };

  const handleImport = (data: { contacts: Contact[], messageTemplate: string }) => {
    setContacts(data.contacts);
    setMessageTemplate(data.messageTemplate);
  };

  const today = new Date();
  const isBroadcastingDay = today.getDate() === 1;

  return (
    <div className="ui-compacta py-10 text-slate-200 pb-20">
      <header className="mb-10 border-b border-slate-800 pb-8">
        <h1 className="titulo-tema text-4xl font-black tracking-tighter uppercase mb-1">
          PAINEL <span className="text-blue-500">WHATSAPP</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Automação mensal de contatos</p>
      </header>

      <main className="max-w-[1700px] mx-auto space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-10 h-full flex flex-col">
            <BackupManager 
              contacts={contacts} 
              messageTemplate={messageTemplate} 
              onImport={handleImport} 
            />
            <MessageEditor initialTemplate={messageTemplate} onSave={setMessageTemplate} />
          </div>
          <div className="lg:col-span-7 h-full flex">
            <ContactForm onAdd={addContact} count={contacts.length} />
          </div>
        </div>
        
        <div className="w-full">
          <ContactList 
            contacts={contacts} 
            onRemove={removeContact} 
            onMarkAsSent={markAsSent}
            onUpdateNote={updateContactNote}
            onUpdateDate={updateContactDate}
            messageTemplate={messageTemplate} 
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
