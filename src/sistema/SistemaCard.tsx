import React, { useRef, useState } from 'react';
import { ClipboardPaste, History, Plus } from 'lucide-react';
import NeonCard from '../components/NeonCard';
import ClearButton from '../components/ClearButton';
import {
  extrairCabecalho,
  extrairSistemaToyota,
  normalizarTextoExtraido,
  type CabecalhoOrcamento,
} from './extracao';
import { extrairTextoPdf } from './pdf';
import { lerPrints } from './ocr';

interface SistemaCardProps {
  numero: string;
  dataDoc: string;
  telefone: string;
  nome: string;
  placa: string;
  chassi: string;
  onNumero: (v: string) => void;
  onDataDoc: (v: string) => void;
  onTelefone: (v: string) => void;
  onNome: (v: string) => void;
  onPlaca: (v: string) => void;
  onChassi: (v: string) => void;
  /** Preenche placa (se vazia) com placa/nome extraídos. */
  onCabecalho: (c: CabecalhoOrcamento) => void;
  /** Limpa PLACA, NOME, CHASSI e TELEFONE (borracha do card). */
  onLimparContato: () => void;
  /** Limpa revisão, ajustes, DADOS e DESCRIÇÃO (borracha do card). */
  onLimparValores: () => void;
  /** Abre o histórico de orçamentos. */
  onAbrirHistorico: () => void;
  /** Texto em revisão (controlado pelo app: o play usa quando os campos vazios). */
  revDesc: string;
  revDados: string;
  onRevDesc: (v: string) => void;
  onRevDados: (v: string) => void;
  /** Avisa que chegou extração nova (revisão fresca de novo). */
  onExtraido: () => void;
  /** Preenche os campos 1. DESCRIÇÃO e 2. DADOS com o texto revisado. */
  onUsarTextos: (descReparo: string, orcamentoRaw: string) => void;
}

const ehPdf = (f: File) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf';

/**
 * ORÇAMENTO DO SISTEMA (PDF/PRINT): fluxo alternativo aos demais campos.
 * Anexar já extrai sozinho (PDF via pdf.js, imagens via OCR) e o resultado
 * SUBSTITUI o anterior — nunca soma com outro orçamento. Separa por seção
 * (itens → DADOS, reclamações → DESCRIÇÃO, resto ignorado), mostra para revisão
 * com o cabeçalho detectado (número, data, telefone, nome) e, no clique,
 * preenche DESCRIÇÃO e DADOS. A soma continua a mesma lógica.
 */
const SistemaCard: React.FC<SistemaCardProps> = ({
  numero,
  dataDoc,
  telefone,
  nome,
  placa,
  chassi,
  onNumero,
  onDataDoc,
  onTelefone,
  onNome,
  onPlaca,
  onChassi,
  onCabecalho,
  onLimparContato,
  onLimparValores,
  onAbrirHistorico,
  revDesc,
  revDados,
  onRevDesc,
  onRevDados,
  onExtraido,
  onUsarTextos,
}) => {
  const [estado, setEstado] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const temTexto = revDesc.trim() || revDados.trim();

  const limpar = () => {
    onRevDesc('');
    onRevDados('');
    onNumero('');
    onDataDoc('');
    onLimparContato();
    onLimparValores();
    setMsg('');
  };

  /** Separa por seção, preenche as revisões e o cabeçalho. */
  const aplicarTexto = (texto: string) => {
    const limpo = normalizarTextoExtraido(texto);
    const sis = extrairSistemaToyota(limpo);
    const cab = extrairCabecalho(limpo);
    if (sis.dados || sis.descReparo) {
      onRevDados(sis.dados);
      onRevDesc(sis.descReparo);
    } else {
      // Layout desconhecido: tudo vai para DADOS revisar.
      onRevDados(limpo);
      onRevDesc('');
    }
    const numeroDoc = sis.numero || cab.numero;
    onNumero(numeroDoc.trim());
    onDataDoc(sis.data.trim());
    onCabecalho({ numero: numeroDoc, placa: cab.placa, nome: sis.cliente || cab.nome, data: sis.data, telefone: cab.telefone, chassi: cab.chassi });
    onExtraido();
  };

  const extrairArquivos = async (arquivos: File[]) => {
    if (arquivos.length === 0 || ocupado) return;
    setOcupado(true);
    setMsg('');
    try {
      const pdfs = arquivos.filter(ehPdf);
      const imagens = arquivos.filter((f) => !ehPdf(f));
      const partes: string[] = [];
      for (let i = 0; i < pdfs.length; i++) {
        setEstado(`Lendo PDF ${i + 1} de ${pdfs.length}…`);
        const r = await extrairTextoPdf(pdfs[i]);
        partes.push(r.texto);
      }
      if (imagens.length > 0) {
        const texto = await lerPrints(imagens, (etapa, fracao) =>
          setEstado(`OCR: ${etapa} (${Math.round(fracao * 100)}%)`),
        );
        partes.push(texto);
      }
      aplicarTexto(partes.join('\n'));
      setMsg(
        imagens.length > 0
          ? 'Texto lido e separado — confira com atenção (OCR pode errar).'
          : '',
      );
    } catch {
      setMsg('Não consegui ler. Tente de novo ou cole o texto à mão no campo 2.');
    } finally {
      setEstado('');
      setOcupado(false);
    }
  };

  const escolher = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivos = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (arquivos.length === 0) return;
    void extrairArquivos(arquivos);
  };

  return (
    <NeonCard
      title="ORÇAMENTO DO SISTEMA"
      borderColor="blue-500"
      compact
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={ocupado}
            aria-label="Novo arquivo"
            title="Novo arquivo (extrai na hora)"
            className="flex items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
          >
            <Plus size={18} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            className="hidden"
            onChange={escolher}
          />
          <button
            type="button"
            onClick={onAbrirHistorico}
            aria-label="Histórico"
            title="Histórico"
            className="relative z-50 flex items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95"
          >
            <History size={18} />
          </button>
          <ClearButton onClick={limpar} label="Limpar extração" />
        </div>
      }
    >
      <div className="space-y-3">
        {(estado || msg) && (
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {estado || msg}
          </p>
        )}

        {/* Cabeçalho detectado (editável; vai para o histórico na hora de processar) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Nº orçamento</label>
            <input
              type="text"
              value={numero}
              onChange={(e) => onNumero(e.target.value)}
              placeholder="Ex.: 4471"
              maxLength={20}
              className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Data</label>
            <input
              type="text"
              value={dataDoc}
              onChange={(e) => onDataDoc(e.target.value)}
              placeholder="Ex.: 24/09/2026"
              maxLength={10}
              className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Telefone</label>
            <input
              type="tel"
              inputMode="numeric"
              value={telefone}
              onChange={(e) => onTelefone(e.target.value)}
              placeholder="Ex.: 51 99999-9999"
              maxLength={20}
              className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Placa | Nome | Chassi nas MESMAS larguras da fileira de cima
            (Placa = Nº, Nome = Data, Chassi = Telefone). */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Placa</label>
            <input
              type="text"
              value={placa}
              onChange={(e) => onPlaca(e.target.value.toUpperCase())}
              placeholder="Ex.: ABC1D23"
              maxLength={10}
              className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-white uppercase tracking-wide focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1 min-w-0">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => onNome(e.target.value.toUpperCase())}
              placeholder="Ex.: JOÃO DA SILVA"
              maxLength={60}
              className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-white uppercase tracking-wide focus:border-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1 min-w-0">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Chassi</label>
            <input
              type="text"
              value={chassi}
              onChange={(e) => onChassi(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="Ex.: 9BRKC3F33R8269071"
              maxLength={17}
              className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-white uppercase tracking-wide focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">DESCRIÇÃO</label>
          <textarea
            value={revDesc}
            onChange={(e) => onRevDesc(e.target.value)}
            placeholder="As reclamações do cliente aparecem aqui para revisão…"
            aria-label="Descrição extraída para revisão"
            wrap="off"
            className="w-full h-[138px] campo-tema border border-slate-800 rounded-2xl p-4 text-base font-medium leading-relaxed focus:border-blue-500 outline-none resize-none overflow-x-auto whitespace-pre scrollbar-hide"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">DADOS</label>
          {/* Altura medida para o card terminar junto do RESUMO LÍQUIDO
              (medido em tela a 1600px; zoom .75 da interface incluso;
              compensa a DESCRIÇÃO acima para o total não mudar). */}
          <textarea
            value={revDados}
            onChange={(e) => onRevDados(e.target.value)}
            placeholder="Os itens (peças/serviços) aparecem aqui para revisão…"
            aria-label="Dados extraídos para revisão"
            wrap="off"
            className="w-full h-[251px] campo-tema border border-slate-800 rounded-2xl p-4 text-base font-mono leading-relaxed focus:border-blue-500 outline-none resize-none overflow-x-auto whitespace-pre scrollbar-hide"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (!temTexto) return;
            onUsarTextos(revDesc, revDados);
            setMsg('Preenchido na DESCRIÇÃO e nos DADOS — confira e clique em Processar Tudo.');
          }}
          disabled={!temTexto || ocupado}
          aria-label="Usar no orçamento manual"
          title="Usar no orçamento manual"
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-black py-3 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
        >
          <ClipboardPaste size={20} />
          Usar no orçamento manual
        </button>
      </div>
    </NeonCard>
  );
};

export default SistemaCard;
