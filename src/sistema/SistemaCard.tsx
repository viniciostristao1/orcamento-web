import React, { useRef, useState } from 'react';
import { ClipboardPaste } from 'lucide-react';
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
  onNumero: (v: string) => void;
  onDataDoc: (v: string) => void;
  /** Preenche placa (se vazia) com placa/nome extraídos. */
  onCabecalho: (c: CabecalhoOrcamento) => void;
  /** Limpa PLACA, NOME, CONTATO e TELEFONE (borracha do card). */
  onLimparContato: () => void;
  /** Preenche os campos 1. DESCRIÇÃO e 2. DADOS com o texto revisado. */
  onUsarTextos: (descReparo: string, orcamentoRaw: string) => void;
}

const ehPdf = (f: File) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf';

/**
 * 3. ORÇAMENTO DO SISTEMA (PDF/PRINT): fluxo alternativo aos campos 1 e 2.
 * Anexar já extrai sozinho (PDF via pdf.js, imagens via OCR) e o resultado
 * SUBSTITUI o anterior — nunca soma com outro orçamento. Separa por seção
 * (itens → DADOS, reclamações → DESCRIÇÃO, resto ignorado), mostra para revisão
 * com o cabeçalho detectado (número, placa, nome, data) e, no clique, preenche
 * os campos 1 e 2. A soma continua a mesma lógica — nada muda no cálculo nem no PNG.
 */
const SistemaCard: React.FC<SistemaCardProps> = ({
  numero,
  dataDoc,
  onNumero,
  onDataDoc,
  onCabecalho,
  onLimparContato,
  onUsarTextos,
}) => {
  const [extraidoDesc, setExtraidoDesc] = useState('');
  const [extraidoDados, setExtraidoDados] = useState('');
  const [estado, setEstado] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const temTexto = extraidoDesc.trim() || extraidoDados.trim();

  const limpar = () => {
    setExtraidoDesc('');
    setExtraidoDados('');
    onNumero('');
    onDataDoc('');
    onLimparContato();
    setMsg('');
  };

  /** Separa por seção, preenche as revisões e o cabeçalho. */
  const aplicarTexto = (texto: string) => {
    const limpo = normalizarTextoExtraido(texto);
    const sis = extrairSistemaToyota(limpo);
    const cab = extrairCabecalho(limpo);
    if (sis.dados || sis.descReparo) {
      setExtraidoDados(sis.dados);
      setExtraidoDesc(sis.descReparo);
    } else {
      // Layout desconhecido: tudo vai para DADOS revisar.
      setExtraidoDados(limpo);
      setExtraidoDesc('');
    }
    const numeroDoc = sis.numero || cab.numero;
    onNumero(numeroDoc.trim());
    onDataDoc(sis.data.trim());
    onCabecalho({ numero: numeroDoc, placa: cab.placa, nome: sis.cliente || cab.nome, data: sis.data, telefone: cab.telefone });
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
          : 'Texto extraído e separado — confira abaixo e use no orçamento.',
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
      title="3. ORÇAMENTO DO SISTEMA (PDF/PRINT)"
      borderColor="blue-500"
      compact
      actions={<ClearButton onClick={limpar} label="Limpar extração" />}
    >
      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">
          Alternativa aos campos 1 e 2: anexe o PDF do sistema ou prints e o texto é extraído na hora.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={ocupado}
            aria-label="Novo arquivo"
            title="Novo arquivo (extrai na hora)"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95 text-xs font-black uppercase tracking-widest"
          >
            Novo arquivo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            className="hidden"
            onChange={escolher}
          />
        </div>

        {(estado || msg) && (
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {estado || msg}
          </p>
        )}

        {/* Cabeçalho detectado (editável; vai para o histórico na hora de processar) */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Nº orçamento</label>
            <input
              type="text"
              value={numero}
              onChange={(e) => onNumero(e.target.value)}
              placeholder="Ex.: 4471"
              maxLength={20}
              className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2 text-base font-bold text-white focus:border-blue-500 outline-none"
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
              className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2 text-base font-bold text-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Descrição extraída (vai para o campo 1)</label>
          <textarea
            value={extraidoDesc}
            onChange={(e) => setExtraidoDesc(e.target.value)}
            placeholder="As reclamações do cliente aparecem aqui para revisão…"
            aria-label="Descrição extraída para revisão"
            wrap="off"
            className="w-full h-28 campo-tema border border-slate-800 rounded-2xl p-4 text-base font-medium leading-relaxed focus:border-blue-500 outline-none resize-none overflow-x-auto whitespace-pre scrollbar-hide"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-black uppercase text-slate-500 tracking-widest">Dados extraídos (vão para o campo 2)</label>
          <textarea
            value={extraidoDados}
            onChange={(e) => setExtraidoDados(e.target.value)}
            placeholder="Os itens (peças/serviços) aparecem aqui para revisão…"
            aria-label="Dados extraídos para revisão"
            wrap="off"
            className="w-full h-56 campo-tema border border-slate-800 rounded-2xl p-4 text-base font-mono leading-relaxed focus:border-blue-500 outline-none resize-none overflow-x-auto whitespace-pre scrollbar-hide"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (!temTexto) return;
            onUsarTextos(extraidoDesc, extraidoDados);
            setMsg('Preenchido nos campos 1 e 2 — confira e clique em Processar Tudo.');
          }}
          disabled={!temTexto || ocupado}
          aria-label="Usar no orçamento"
          title="Usar no orçamento"
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-black py-3 rounded-xl shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
        >
          <ClipboardPaste size={20} />
          Usar no orçamento
        </button>
      </div>
    </NeonCard>
  );
};

export default SistemaCard;
