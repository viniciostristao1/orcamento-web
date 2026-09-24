import React, { useState, useMemo } from 'react';
import { Trash2, Phone, CheckCircle2, Copy, Check, ClipboardCopy, Edit2 } from 'lucide-react';
import { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  onRemove: (id: string) => void;
  onMarkAsSent: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onUpdateDate: (id: string, date: string) => void;
  messageTemplate: string;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onRemove, onMarkAsSent, onUpdateNote, onUpdateDate, messageTemplate }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedChassisId, setCopiedChassisId] = useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => a.targetDate.localeCompare(b.targetDate));
  }, [contacts]);
  
  const formatPhone = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10 || clean.length === 11) {
      return `55${clean}`;
    }
    return clean;
  };

  const handleSend = (contact: Contact) => {
    const finalMessage = contact.customMessage || messageTemplate;
    const encodedMsg = encodeURIComponent(finalMessage);
    const phone = formatPhone(contact.phone);
    const url = `https://wa.me/${phone}?text=${encodedMsg}`;
    window.open(url, '_blank');
    onMarkAsSent(contact.id);
  };

  const handleCopy = (text: string, id: string, type: 'msg' | 'chassis') => {
    navigator.clipboard.writeText(text);
    if (type === 'msg') {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedChassisId(id);
      setTimeout(() => setCopiedChassisId(null), 2000);
    }
  };

  const wasSentThisMonth = (contact: Contact) => {
    if (!contact.lastSentTimestamp) return false;
    const lastSentDate = new Date(contact.lastSentTimestamp);
    const now = new Date();
    return lastSentDate.getMonth() === now.getMonth() && 
           lastSentDate.getFullYear() === now.getFullYear();
  };

  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-slate-900/60 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden mb-12">
      <div className="px-8 sm:px-12 py-8 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-slate-800/30 gap-6">
        <div className="flex flex-col text-center sm:text-left">
          <h2 className="titulo-tema text-3xl font-black text-slate-100 uppercase tracking-tight">Relatório de Envios</h2>
          <span className="text-[10px] text-slate-500 font-extrabold flex items-center gap-2 uppercase tracking-[0.2em] mt-2 px-4 py-1.5 bg-slate-800/60 text-slate-200 rounded-full border border-slate-700/60 w-fit mx-auto sm:mx-0">
            Acompanhamento de Revisões
          </span>
        </div>
        <div className="bg-slate-950 px-8 py-4 rounded-3xl border border-slate-800 shadow-inner flex items-center gap-5">
           <div className="flex flex-col">
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">PROCESSO MENSAL</span>
             <div className="text-3xl font-black text-slate-100 tracking-tighter">
              {contacts.filter(wasSentThisMonth).length} <span className="text-slate-600 text-lg">/ {contacts.length}</span>
             </div>
           </div>
           <div className="h-10 w-px bg-slate-800"></div>
           <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-blue-500 flex items-center justify-center">
             <span className="text-[10px] font-black text-slate-100">
               {contacts.length > 0 ? Math.round((contacts.filter(wasSentThisMonth).length / contacts.length) * 100) : 0}%
             </span>
           </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left table-fixed border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-950/50 text-[10px] uppercase text-slate-500 tracking-[0.2em] font-bold">
              <th className="px-10 py-5 w-[82%] border-b border-slate-800">Clientes e Agendamentos</th>
              <th className="px-10 py-5 text-right w-[18%] border-b border-slate-800">Controles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedContacts.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-10 py-28 text-center border-b border-slate-800/60">
                  <div className="flex flex-col items-center opacity-30">
                    <CheckCircle2 size={48} className="text-slate-400 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Base de dados vazia para este mês.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedContacts.map((contact) => {
                const sent = wasSentThisMonth(contact);
                const isToday = contact.targetDate === todayStr;
                const isPast = contact.targetDate < todayStr && !sent;
                               return (
                  <tr key={contact.id} className={`group hover:bg-slate-800/40 transition-all duration-300 ${sent ? 'bg-slate-900/40 opacity-60' : ''}`}>
                    <td className="px-6 py-1.5 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-[110px] shrink-0">
                          <div className={`relative flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg font-black border transition-all cursor-pointer group/date overflow-hidden ${
                            sent ? 'bg-slate-800/40 text-slate-500 border-slate-700/60' :
                            isToday ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' :
                            isPast ? 'bg-rose-600 text-white border-rose-700 shadow-sm' :
                            'bg-slate-800/60 text-slate-200 border-slate-700'
                          }`}>
                            <span className="text-[11px] z-10">{formatDateDisplay(contact.targetDate)}</span>
                            <Edit2 size={8} className={`z-10 transition-opacity ${sent ? 'opacity-0' : 'opacity-40 group-hover/date:opacity-100'}`} />
                            <input
                              type="date"
                              value={contact.targetDate}
                              onChange={(e) => onUpdateDate(contact.id, e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer z-20 [color-scheme:dark]"
                            />
                          </div>
                        </div>
                        
                        <div className="w-[220px] shrink-0">
                          <span className={`font-extrabold text-base tracking-tight truncate block ${sent ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                            {contact.name}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-0.5 w-[140px] shrink-0">
                          <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 campo-tema px-2 py-0.5 rounded-md border border-slate-800">
                            <Phone size={9} className="text-slate-500 shrink-0" /> {contact.phone}
                          </span>
                          {contact.chassis && (
                            <button 
                              onClick={() => handleCopy(contact.chassis!, contact.id, 'chassis')}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[8px] font-bold transition-all ${
                                copiedChassisId === contact.id 
                                ? 'bg-green-600 border-green-700 text-white' 
                                : 'campo-tema border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-600'
                              }`}
                            >
                              <span className="truncate flex-1 text-left">{contact.chassis}</span>
                              <ClipboardCopy size={8} className="opacity-30 shrink-0" />
                            </button>
                          )}
                        </div>

                        <div className="relative group/note flex-1">
                          <textarea
                            placeholder="Notas..."
                            value={contact.internalNote || ''}
                            onChange={(e) => onUpdateNote(contact.id, e.target.value)}
                            className="w-full text-xs campo-tema px-3 py-1 rounded-lg border border-slate-800 focus:border-slate-600 outline-none transition-all resize-none h-7 leading-tight text-slate-100 font-bold"
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-1.5 text-right align-middle">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(contact.customMessage || messageTemplate, contact.id, 'msg')}
                          className={`p-2 rounded-lg border transition-all ${
                            copiedId === contact.id 
                            ? 'bg-green-600 border-green-700 text-white' 
                            : 'campo-tema border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-600'
                          }`}
                        >
                          {copiedId === contact.id ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2} />}
                        </button>

                        <button
                          onClick={() => handleSend(contact)}
                          aria-label={sent ? 'Concluído' : (isPast ? 'Atrasado — notificar' : 'Notificar')}
                          title={sent ? 'Concluído' : (isPast ? 'Atrasado — notificar' : 'Notificar')}
                          className={`p-2 rounded-lg transition-all flex items-center justify-center active:scale-95 cursor-pointer ${
                            sent 
                            ? 'text-green-500 bg-green-600/10 border border-green-600/30' 
                            : isPast 
                              ? 'text-white bg-rose-600 hover:bg-rose-700'
                              : 'text-white bg-blue-600 hover:bg-blue-500'
                          }`}
                        >
                          {sent ? <CheckCircle2 size={16} strokeWidth={3} /> : <Phone size={16} strokeWidth={2} />}
                        </button>

                        <button
                          onClick={() => onRemove(contact.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactList;
