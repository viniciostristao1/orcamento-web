import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Phone,
  CheckCircle2,
  Copy,
  Check,
  Edit2,
  List,
  Hash,
  StickyNote,
  MessageSquare,
  Pencil,
  X,
} from 'lucide-react';
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
  // Campo recém-copiado ("id:phone" / "id:chassis") e contato com os detalhes abertos.
  const [copiadoCampo, setCopiadoCampo] = useState<string | null>(null);
  const [detalhesId, setDetalhesId] = useState<string | null>(null);
  // Janelinha da observação (`note`) ou da mensagem (`message`) de um contato.
  const [popup, setPopup] = useState<{ id: string; campo: 'note' | 'message' } | null>(null);
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState('');
  const [copiadoPopup, setCopiadoPopup] = useState(false);
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

  const handleCopy = (text: string, id: string, campo: 'phone' | 'chassis') => {
    navigator.clipboard.writeText(text);
    const chave = `${id}:${campo}`;
    setCopiadoCampo(chave);
    setTimeout(() => setCopiadoCampo((c) => (c === chave ? null : c)), 2000);
  };

  // Abre/fecha a janelinha da observação ou da mensagem (uma por vez).
  const abrirPopup = (id: string, campo: 'note' | 'message') => {
    setPopup((p) => (p && p.id === id && p.campo === campo ? null : { id, campo }));
    setEditando(false);
    setCopiadoPopup(false);
  };

  const copiarPopup = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoPopup(true);
    setTimeout(() => setCopiadoPopup(false), 2000);
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
            const popupAqui = popup?.id === contact.id ? popup : null;
            const popupTexto = popupAqui
              ? popupAqui.campo === 'note'
                ? contact.internalNote || ''
                : contact.customMessage || ''
              : '';
            return (
              <div
                key={contact.id}
                className={`bg-slate-950/60 border border-slate-800 rounded-2xl p-4 transition-colors hover:border-slate-700 ${sent ? 'opacity-70' : ''}`}
              >
                {/* Cliente + situação + ações + dia (data editável clicando nela) */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className={`text-lg font-black tracking-tight truncate ${sent ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                    {contact.name}
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
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
                      type="button"
                      onClick={() => abrirPopup(contact.id, 'note')}
                      aria-label="Observação"
                      title="Observação"
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        popupAqui?.campo === 'note'
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                          : contact.internalNote
                            ? 'campo-tema border-slate-700 text-blue-300 hover:text-blue-200 hover:border-slate-600'
                            : 'campo-tema border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <StickyNote size={14} strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      onClick={() => abrirPopup(contact.id, 'message')}
                      aria-label="Mensagem"
                      title="Mensagem"
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        popupAqui?.campo === 'message'
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                          : contact.customMessage
                            ? 'campo-tema border-slate-700 text-emerald-400 hover:text-emerald-300 hover:border-slate-600'
                            : 'campo-tema border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <MessageSquare size={14} strokeWidth={2} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDetalhesId((d) => (d === contact.id ? null : contact.id))}
                      aria-label="Telefone e chassi"
                      title="Telefone e chassi"
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        detalhesId === contact.id
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                          : 'campo-tema border-slate-800 text-slate-500 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <List size={14} strokeWidth={2} />
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

                    <label
                      className={`relative shrink-0 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg font-black border text-sm cursor-pointer transition-all overflow-hidden ${
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
                  </span>
                </div>

                {/* Janelinha da observação/mensagem: ler, editar (lápis), confirmar
                    (v), copiar e fechar (x) — botõezinhos pequenos. */}
                {popupAqui && (
                  <div className="ml-auto mt-2 w-80 max-w-full bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        {popupAqui.campo === 'note' ? 'Observação' : 'Mensagem'}
                      </span>
                      <span className="flex items-center gap-1">
                        {editando ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (popupAqui.campo === 'note') onUpdateNote(contact.id, rascunho);
                              else onUpdateMessage(contact.id, rascunho);
                              setEditando(false);
                            }}
                            aria-label="Confirmar"
                            title="Confirmar"
                            className="p-1 rounded-md text-green-500 hover:text-green-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditando(true);
                              setRascunho(popupTexto);
                            }}
                            aria-label="Editar"
                            title="Editar"
                            className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            copiarPopup(popupAqui.campo === 'note' ? popupTexto : popupTexto || messageTemplate)
                          }
                          aria-label={popupAqui.campo === 'note' ? 'Copiar observação' : 'Copiar mensagem'}
                          title={popupAqui.campo === 'note' ? 'Copiar observação' : 'Copiar mensagem'}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            copiadoPopup ? 'text-green-500' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {copiadoPopup ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPopup(null);
                            setEditando(false);
                          }}
                          aria-label="Fechar"
                          title="Fechar"
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    </div>
                    {editando ? (
                      <textarea
                        autoFocus
                        value={rascunho}
                        onChange={(e) => setRascunho(e.target.value)}
                        aria-label={popupAqui.campo === 'note' ? 'Texto da observação' : 'Texto da mensagem'}
                        className="w-full text-sm bg-slate-900 px-2.5 py-2 rounded-lg border border-slate-700 focus:border-slate-500 outline-none resize-none h-24 leading-tight text-slate-200 font-bold overflow-y-auto"
                      />
                    ) : (
                      <p className="text-sm text-slate-300 font-bold whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                        {popupTexto ||
                          (popupAqui.campo === 'note' ? 'Sem observação.' : 'Se vazio, usa o script de revisão…')}
                      </p>
                    )}
                  </div>
                )}

                {/* Detalhes (ícone de lista): telefone e chassi, cada um com copiar */}
                {detalhesId === contact.id && (
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleCopy(contact.phone, contact.id, 'phone')}
                      aria-label="Copiar telefone"
                      title="Copiar telefone"
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        copiadoCampo === `${contact.id}:phone`
                          ? 'bg-green-600 border-green-700 text-white'
                          : 'campo-tema border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      <Phone size={12} className="shrink-0" />
                      {contact.phone}
                      {copiadoCampo === `${contact.id}:phone` ? (
                        <Check size={12} strokeWidth={3} className="shrink-0" />
                      ) : (
                        <Copy size={12} className="opacity-40 shrink-0" />
                      )}
                    </button>

                    {contact.chassis ? (
                      <button
                        type="button"
                        onClick={() => handleCopy(contact.chassis!, contact.id, 'chassis')}
                        aria-label="Copiar chassi"
                        title="Copiar chassi"
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          copiadoCampo === `${contact.id}:chassis`
                            ? 'bg-green-600 border-green-700 text-white'
                            : 'campo-tema border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        <Hash size={12} className="shrink-0" />
                        {contact.chassis}
                        {copiadoCampo === `${contact.id}:chassis` ? (
                          <Check size={12} strokeWidth={3} className="shrink-0" />
                        ) : (
                          <Copy size={12} className="opacity-40 shrink-0" />
                        )}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-600">Sem chassi</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactList;
