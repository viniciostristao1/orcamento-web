import React, { useState } from 'react';
import { PlusCircle, Users, Hash } from 'lucide-react';
import { Contact } from '../types';

interface ContactFormProps {
  onAdd: (contact: Omit<Contact, 'id'>) => void;
  count: number;
}

const ContactForm: React.FC<ContactFormProps> = ({ onAdd, count }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [chassis, setChassis] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [customMessage, setCustomMessage] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setPhone(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (count >= 200) return alert('Limite de 200 contatos atingido!');
    if (!name || !phone || !targetDate) return alert('Preencha nome, telefone e data!');
    
    onAdd({ 
      name, 
      phone, 
      targetDate,
      chassis: chassis.trim() || undefined,
      customMessage: customMessage.trim() || undefined 
    });
    
    setName('');
    setPhone('');
    setChassis('');
    setCustomMessage('');
  };

  const inputClasses = "w-full px-5 py-4 campo-tema text-slate-100 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 outline-none transition-all text-lg font-bold placeholder:text-slate-700 tracking-tight shadow-inner";
  const labelClasses = "block text-[10px] font-bold text-slate-500 group-focus-within:text-slate-200 transition-colors uppercase mb-1.5 ml-4 tracking-[0.2em]";

  return (
    <div className="bg-slate-900/60 p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-slate-800 flex-1 flex flex-col relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-800/40 via-slate-700/50 to-slate-800/40"></div>
      
      <div className="flex items-center justify-between mb-10 mt-2">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-900/30 border border-blue-500/30">
              <Users className="text-white" size={28} />
          </div>
          <div>
            <h2 className="titulo-tema text-2xl font-black text-slate-100 tracking-tight uppercase">Novo Contato</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Cadastro de Clientes</p>
          </div>
        </div>
        <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-tighter mr-2">Ocupação</span>
          <span className="text-slate-100 font-black text-lg">{count}<span className="text-slate-600 text-xs font-bold">/200</span></span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
        <div className="group">
          <label className={labelClasses}>Nome Completo</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClasses} uppercase`}
            placeholder="Ex: WEIAND VEICULOS LTDA"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="group font-sans">
            <label className={labelClasses}>
              WhatsApp <span className="text-[10px] text-slate-600 lowercase italic ml-1">({phone.length}/12)</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={handlePhoneChange}
              className={inputClasses}
              placeholder="555199999999"
            />
          </div>
          <div className="group">
            <label className={labelClasses}>Dia do Envio</label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={`${inputClasses} [color-scheme:dark]`}
            />
          </div>
        </div>

        <div className="group">
          <label className={labelClasses}>Número do Chassi</label>
          <div className="relative">
            <Hash size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={chassis}
              onChange={(e) => setChassis(e.target.value.toUpperCase())}
              className={`${inputClasses} uppercase pl-12`}
              placeholder="OPCIONAL"
            />
          </div>
        </div>

        <div className="group">
          <label className={labelClasses}>Mensagem Especial</label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className={`${inputClasses} h-28 resize-none leading-relaxed text-base font-medium placeholder:font-bold`}
            placeholder="Se vazio, usa a padrão..."
          />
        </div>

        <button
          type="submit"
          disabled={count >= 200}
          className="w-full mt-auto bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:bg-slate-800 disabled:text-slate-600 shadow-lg shadow-blue-900/30 active:scale-[0.98] text-lg uppercase tracking-tight cursor-pointer"
        >
          <PlusCircle size={24} strokeWidth={3} />
          Salvar Cliente
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
