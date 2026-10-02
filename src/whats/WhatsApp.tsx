import React, { useState, useEffect } from 'react';
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
import { CONTATOS_EVENTO, CONTATOS_KEY, lerContatos } from './utils/contatosHoje';

interface WhatsAppProps {
  /** Contato vindo do clique no lembrete global (a lista rola até ele e destaca). */
  destaque?: { id: string; vez: number } | null;
}

const WhatsApp: React.FC<WhatsAppProps> = ({ destaque = null }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => lerContatos());

  // Dois scripts: pneus (ofertas) e revisão (usado no NOTIFICAR/copiar contato).
  const [scriptPneus, setScriptPneus] = useState(() => lerScripts().pneus);
  const [scriptRevisao, setScriptRevisao] = useState(() => lerScripts().revisao);

  useEffect(() => {
    localStorage.setItem(CONTATOS_KEY, JSON.stringify(contacts));
    // Avisa o lembrete global (no App) para se atualizar na mesma hora.
    window.dispatchEvent(new Event(CONTATOS_EVENTO));
  }, [contacts]);

  useEffect(() => {
    salvarScriptPneus(scriptPneus);
    salvarScriptRevisao(scriptRevisao);
  }, [scriptPneus, scriptRevisao]);

  // Sincronizar dados entre abas para evitar perda de dados
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CONTATOS_KEY && e.newValue) setContacts(JSON.parse(e.newValue));
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

  return (
    <div className="ui-compacta pt-1 pb-20 text-slate-200">
      <header className="mb-4 text-center">
        <TituloEditavel id="whats" estilo="duas-cores" className="titulo-tema text-xl font-black tracking-widest uppercase" />
      </header>

      {/* Esquerda: NOVO CONTATO + scripts. Direita: RELATÓRIO DE ENVIOS
          (uma coluna de contatos, um pouco mais larga). O lembrete de hoje é
          global (no App). */}
      <main className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 items-start">
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
            destaque={destaque}
          />
        </div>
      </main>
    </div>
  );
};

export default WhatsApp;
