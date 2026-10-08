import React, { useEffect, useRef, useState } from 'react';
import { Settings, Download, Upload, ChevronDown } from 'lucide-react';
import type { Tema } from '../utils/tema';
import { diasDesdeBackup, montarBackup, nomeArquivoBackup, precisaLembreteBackup, registrarBackup, restaurarBackup } from '../utils/backup';
import { temSenha, trocarSenha } from '../utils/bloqueio';

interface ConfiguracoesTemaProps {
  tema: Tema;
  onChange: (tema: Tema) => void;
}

// `fundo`/`acento` alimentam a mini-amostra de cor ao lado de cada tema.
const OPCOES: { id: Tema; nome: string; descricao: string; fundo: string; acento: string }[] = [
  { id: 'azul', nome: 'Azul', descricao: 'Visual clássico (azul e cinza-escuro)', fundo: '#0f172a', acento: '#3b82f6' },
  { id: 'papel', nome: 'Claro', descricao: 'Modo claro, fundo papel', fundo: '#eef0f3', acento: '#2563eb' },
  { id: 'whatsapp', nome: 'Verde WhatsApp', descricao: 'Escuro com o verde do Zap', fundo: '#0b141a', acento: '#25d366' },
  { id: 'tecnico', nome: 'Monocromático Técnico', descricao: 'Cinza com laranja, bem sóbrio', fundo: '#101012', acento: '#ff6a00' },
  { id: 'grafite', nome: 'Grafite', descricao: 'Tabelas estilo Claude — quase-preto, grade sutil', fundo: '#0c0c0c', acento: '#4c7ef3' },
];

const ConfiguracoesTema: React.FC<ConfiguracoesTemaProps> = ({ tema, onChange }) => {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);
  // Troca da senha do cadeado (só quando já existe uma criada).
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirma, setSenhaConfirma] = useState('');
  const [senhaMsg, setSenhaMsg] = useState('');
  const [senhaOk, setSenhaOk] = useState(false);
  // Data do último backup (para o lembrete da engrenagem).
  const [backupVez, setBackupVez] = useState(0);
  // Lista de temas escondida atrás da seta (abre só quando precisa).
  const [temasAbertos, setTemasAbertos] = useState(false);
  // Opções de backup escondidas atrás da seta (abre só quando precisa).
  const [backupAberto, setBackupAberto] = useState(false);

  const handleTrocarSenha = () => {
    const r = trocarSenha(senhaAtual, senhaNova, senhaConfirma);
    setSenhaOk(r.ok);
    setSenhaMsg(r.ok ? 'Senha trocada.' : r.erro);
    if (r.ok) {
      setSenhaAtual('');
      setSenhaNova('');
      setSenhaConfirma('');
    }
  };

  // Backup de TUDO (histórico de orçamentos, rascunho, tema, lembretes) num
  // único JSON — rede de segurança contra limpar o navegador, já que os dados
  // são locais (chaves antigas da aba Whats entram só na restauração).
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
      registrarBackup();
      setBackupVez((v) => v + 1);
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
        `✅ Backup restaurado!\n\n${resultado.resumo.orcamentos} orçamentos, ${resultado.resumo.flyers} flyers e ${resultado.resumo.contatos} contatos.\nO app vai recarregar agora.`,
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

  // Lembrete de backup: bolinha âmbar na engrenagem quando há dados e o
  // último backup tem 30+ dias (ou nunca fez). Recarrega ao abrir o menu e
  // após cada exportação (`backupVez`).
  const [backupDias, setBackupDias] = useState<number | null>(null);
  const [backupAviso, setBackupAviso] = useState(false);
  useEffect(() => {
    setBackupDias(diasDesdeBackup());
    setBackupAviso(precisaLembreteBackup());
  }, [aberto, backupVez]);
  const avisoBackup = backupAviso;
  const textoBackup =
    backupDias === null ? 'nunca fez backup' : backupDias === 0 ? 'backup feito hoje' : `último backup há ${backupDias} dias`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setBackupVez((v) => v + 1); setAberto((a) => !a); }}
        aria-label="Configurações"
        title={avisoBackup ? `Configurações — ${textoBackup} (faça um backup!)` : 'Configurações'}
        className={`relative flex items-center justify-center p-3 rounded-xl transition-all border cursor-pointer active:scale-95 ${
          aberto
            ? 'bg-blue-600 text-white border-blue-500'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
        }`}
      >
        <Settings size={18} />
        {avisoBackup && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400"
            style={{ boxShadow: '0 0 8px #fbbf24' }}
          />
        )}
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-3 z-[120]">
          <button
            type="button"
            onClick={() => setTemasAbertos((v) => !v)}
            aria-label={temasAbertos ? 'Ocultar temas' : 'Mostrar temas'}
            aria-expanded={temasAbertos}
            title={temasAbertos ? 'Ocultar temas' : 'Mostrar temas'}
            className="w-full flex items-center justify-between px-3 pt-2 pb-3 cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Tema da interface
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-500 transition-transform ${temasAbertos ? 'rotate-180' : ''}`}
            />
          </button>
          {temasAbertos && (
          <div className="max-h-[46vh] overflow-y-auto pr-1 -mr-1">
            {OPCOES.map((opcao) => {
              const ativo = tema === opcao.id;
              return (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => { onChange(opcao.id); setAberto(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border transition-colors cursor-pointer ${
                    ativo
                      ? 'bg-blue-600/10 border-blue-500/40'
                      : 'border-transparent hover:bg-slate-900'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                      ativo ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-600'
                    }`}
                    style={{ backgroundColor: opcao.fundo }}
                    aria-hidden="true"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opcao.acento }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-black uppercase tracking-widest text-slate-200 truncate">
                      {opcao.nome}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5 truncate">{opcao.descricao}</span>
                  </span>
                </button>
              );
            })}
          </div>
          )}

          <div className="h-px bg-slate-800 my-3"></div>

          <button
            type="button"
            onClick={() => setBackupAberto((v) => !v)}
            aria-label={backupAberto ? 'Ocultar backup' : 'Mostrar backup'}
            aria-expanded={backupAberto}
            title={backupAberto ? 'Ocultar backup' : 'Mostrar backup'}
            className="w-full flex items-center justify-between px-3 pt-2 pb-3 cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Backup dos dados
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-500 transition-transform ${backupAberto ? 'rotate-180' : ''}`}
            />
          </button>
          {backupAberto && (
          <>
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
            Salva os dados do app (histórico de orçamentos, rascunho, tema e
            lembretes) num arquivo JSON. A importação recarrega o app.
          </p>
          <p className={`text-[11px] font-bold px-3 pt-1 ${avisoBackup ? 'text-amber-300' : 'text-slate-500'}`}>
            {textoBackup === 'nunca fez backup' && avisoBackup
              ? '⚠ Nunca fez backup — faça agora!'
              : `Último backup: ${textoBackup}.`}
          </p>
          <input
            ref={arquivoRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={importarBackup}
          />
          </>)}

          <div className="h-px bg-slate-800 my-3"></div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-3 pb-2">
            Bloqueio por senha
          </p>
          {temSenha() ? (
            <div className="space-y-2 px-3">
              <input
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Senha atual"
                aria-label="Senha atual"
                className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-blue-500 outline-none"
              />
              <input
                type="password"
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                placeholder="Nova senha (mín. 4 caracteres)"
                aria-label="Nova senha"
                className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-blue-500 outline-none"
              />
              <input
                type="password"
                value={senhaConfirma}
                onChange={(e) => setSenhaConfirma(e.target.value)}
                placeholder="Confirmar nova senha"
                aria-label="Confirmar nova senha"
                className="w-full campo-tema border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:border-blue-500 outline-none"
              />
              {senhaMsg && (
                <p className={`text-xs font-bold ${senhaOk ? 'text-green-400' : 'text-red-400'}`}>{senhaMsg}</p>
              )}
              <button
                type="button"
                onClick={handleTrocarSenha}
                aria-label="Trocar senha"
                title="Trocar senha"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer text-xs font-black uppercase tracking-widest"
              >
                Trocar senha
              </button>
            </div>
          ) : (
            <p className="text-[10px] leading-relaxed text-slate-500 px-3">
              Nenhuma senha definida. Clique em Sair (cadeado no topo) para criar.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesTema;
