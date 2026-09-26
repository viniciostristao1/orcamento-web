import React, { useState, useMemo } from 'react';
import { Trash2, Phone, CheckCircle2, Copy, Check, ClipboardCopy, Edit2 } from 'lucide-react';
import { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  onRemove: (id: string) => void;
  onMarkAsSent: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onUpdateMessage: (id: string, message: string) => void;
  onUpdateDate: (id: string, date: string) => void;
  messageTemplate: string;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onRemove, onMarkAsSent, onUpdateNote, onUpdateMessage, onUpdateDate, messageTemplate }) => {
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

      {sortedContacts.length === 0 ? (
        <div className="px-10 py-28 text-center">
          <div className="flex flex-col items-center opacity-30">
            <CheckCircle2 size={48} className="text-slate-400 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Base de dados vazia para este mês.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-4">
          {sortedContacts.map((contact) => {
            const sent = wasSentThisMonth(contact);
            const isToday = contact.targetDate === todayStr;
            const isPast = contact.targetDate < todayStr && !sent;
            return (
              <div
                key={contact.id}
                className={`bg-slate-950/60 border border-slate-800 rounded-2xl p-4 transition-colors hover:border-slate-700 ${sent ? 'opacity-70' : ''}`}
              >
                {/* Cliente + dia do envio (editável clicando na data) */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className={`text-lg font-black tracking-tight truncate ${sent ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                    {contact.name}
                  </span>
                  <label
                    className={`relative shrink-0 flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg font-black border text-sm cursor-pointer transition-all overflow-hidden ${
                      sent ? 'bg-slate-800/40 text-slate-500 border-slate-700/60' :
                      isToday ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' :
                      isPast ? 'bg-rose-600 text-white border-rose-700' :
                      'bg-slate-800/60 text-slate-200 border-slate-700'
                    }`}
                    title="Alterar dia do envio"
                  >
                    <span className="z-10">{formatDateDisplay(contact.targetDate)}</span>
                    <Edit2 size={10} className={`z-10 ${sent ? 'opacity-0' : 'opacity-40'}`} />
                    <input
                      type="date"
                      value={contact.targetDate}
                      onChange={(e) => onUpdateDate(contact.id, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20 [color-scheme:dark]"
                    />
                  </label>
                </div>

                {/* Observação e Mensagem Especial lado a lado (rolam se passar da altura) */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
                      Observação
                    </span>
                    <textarea
                      placeholder="Anotações sobre o cliente…"
                      value={contact.internalNote || ''}
                      onChange={(e) => onUpdateNote(contact.id, e.target.value)}
                      className="w-full text-sm bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 focus:border-slate-600 outline-none transition-all resize-none h-9 leading-tight text-slate-200 font-bold overflow-y-auto"
                    />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
                      Mensagem especial
                    </span>
                    <textarea
                      placeholder="Se vazio, usa o script de revisão…"
                      value={contact.customMessage || ''}
                      onChange={(e) => onUpdateMessage(contact.id, e.target.value)}
                      className="w-full text-sm bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 focus:border-slate-600 outline-none transition-all resize-none h-9 leading-tight text-emerald-600 font-bold overflow-y-auto"
                    />
                  </div>
                </div>

                {/* Contato + situação + ações */}
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 min-w-0 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Phone size={11} className="text-slate-500 shrink-0" /> {contact.phone}
                    </span>
                    {contact.chassis && (
                      <button
                        onClick={() => handleCopy(contact.chassis!, contact.id, 'chassis')}
                        aria-label="Copiar chassi"
                        title="Copiar chassi"
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold transition-all cursor-pointer ${
                          copiedChassisId === contact.id
                            ? 'bg-green-600 border-green-700 text-white'
                            : 'campo-tema border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        <span className="truncate max-w-[110px]">{contact.chassis}</span>
                        <ClipboardCopy size={10} className="opacity-40 shrink-0" />
                      </button>
                    )}
                  </span>

                  <span className="flex items-center gap-2 shrink-0">
                    {sent ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-green-600/10 text-green-500 border-green-600/30">
                        <CheckCircle2 size={12} strokeWidth={3} /> Concluído
                      </span>
                    ) : isToday ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-blue-600/20 text-blue-400 border-blue-500/40">
                        Hoje
                      </span>
                    ) : isPast ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-rose-600 text-white border-rose-700">
                        Atrasado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-slate-800 text-slate-400 border-slate-700">
                        Agendado
                      </span>
                    )}

                    <button
                      onClick={() => handleCopy(contact.customMessage || messageTemplate, contact.id, 'msg')}
                      aria-label={copiedId === contact.id ? 'Mensagem copiada' : 'Copiar mensagem'}
                      title={copiedId === contact.id ? 'Mensagem copiada' : 'Copiar mensagem'}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        copiedId === contact.id
                          ? 'bg-green-600 border-green-700 text-white'
                          : 'campo-tema border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      {copiedId === contact.id ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2} />}
                    </button>

                    <button
                      onClick={() => handleSend(contact)}
                      aria-label={sent ? 'Concluído' : isPast ? 'Atrasado — notificar' : 'Notificar'}
                      title={sent ? 'Concluído' : isPast ? 'Atrasado — notificar' : 'Notificar'}
                      className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
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
                      aria-label="Excluir contato"
                      title="Excluir contato"
                      className="p-2 text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactList;
