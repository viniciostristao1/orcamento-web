import React, { useEffect, useRef, useState } from 'react';
import { Settings, Check, Download, Upload } from 'lucide-react';
import type { Tema } from '../utils/tema';
import { montarBackup, nomeArquivoBackup, restaurarBackup } from '../utils/backup';

interface ConfiguracoesTemaProps {
  tema: Tema;
  onChange: (tema: Tema) => void;
}

const OPCOES: { id: Tema; nome: string; descricao: string }[] = [
  { id: 'original', nome: 'Original', descricao: 'Visual do app (azul e cinza-escuro)' },
  { id: 'claude', nome: 'Claude', descricao: 'Tema escuro (cinzas quentes e laranja)' },
];

const ConfiguracoesTema: React.FC<ConfiguracoesTemaProps> = ({ tema, onChange }) => {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  // Backup de TUDO (histórico de orçamentos, rascunho, tema, contatos e
  // template do Whats) num único JSON — rede de segurança contra limpar o
  // navegador, já que os dados são locais.
  const exportarBackup = () => {
    try {
      const blob = new Blob([montarBackup()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivoBackup();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert('Não foi possível gerar o backup.');
    }
  };

  const importarBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const resultado = restaurarBackup(String(ev.target?.result ?? ''));
      if (!resultado.ok) {
        alert(`❌ ${resultado.erro}`);
        return;
      }
      alert(
        `✅ Backup restaurado!\n\n${resultado.resumo.orcamentos} orçamentos e ${resultado.resumo.contatos} contatos.\nO app vai recarregar agora.`,
      );
      window.location.reload();
    };
    reader.readAsText(arquivo);
    e.target.value = '';
  };

  useEffect(() => {
    if (!aberto) return;
    const aoClicarFora = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-label="Configurações"
        title="Configurações"
        className={`flex items-center justify-center p-3 rounded-xl transition-all border cursor-pointer active:scale-95 ${
          aberto
            ? 'bg-blue-600 text-white border-blue-500'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
        }`}
      >
        <Settings size={18} />
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-3 z-[120]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-3 pt-2 pb-3">
            Tema da interface
          </p>
          {OPCOES.map((opcao) => {
            const ativo = tema === opcao.id;
            return (
              <button
                key={opcao.id}
                type="button"
                onClick={() => { onChange(opcao.id); setAberto(false); }}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left border transition-colors cursor-pointer ${
                  ativo
                    ? 'bg-blue-600/10 border-blue-500/40'
                    : 'border-transparent hover:bg-slate-900'
                }`}
              >
                <span
                  className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    ativo ? 'border-blue-500 bg-blue-600' : 'border-slate-600'
                  }`}
                >
                  {ativo && <Check size={11} className="text-white" />}
                </span>
                <span>
                  <span className="block text-xs font-black uppercase tracking-widest text-slate-200">
                    {opcao.nome}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1">{opcao.descricao}</span>
                </span>
              </button>
            );
          })}

          <div className="h-px bg-slate-800 my-3"></div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-3 pb-2">
            Backup dos dados
          </p>
          <div className="grid grid-cols-2 gap-2 px-3">
            <button
              type="button"
              onClick={exportarBackup}
              aria-label="Exportar backup"
              title="Exportar backup"
              className="flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <Download size={18} />
            </button>
            <button
              type="button"
              onClick={() => arquivoRef.current?.click()}
              aria-label="Importar backup"
              title="Importar backup"
              className="flex items-center justify-center py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <Upload size={18} />
            </button>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-500 px-3 pt-2">
            Salva histórico de orçamentos, rascunho, tema, contatos e mensagem do Whats num
            arquivo JSON. A importação recarrega o app.
          </p>
          <input
            ref={arquivoRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={importarBackup}
          />
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesTema;
