import React, { useState } from 'react';
import { KeyRound, Lock } from 'lucide-react';
import { criarSenha, conferirSenha, temSenha } from '../utils/bloqueio';

interface BloqueioProps {
  onDesbloquear: () => void;
}

/**
 * Tela de bloqueio (cadeado): cobre o app inteiro (z-index acima de tudo) sem
 * desmontá-lo — o que estava digitado continua lá ao desbloquear. Sem senha
 * criada, o primeiro bloqueio vira o cadastro da senha.
 */
const Bloqueio: React.FC<BloqueioProps> = ({ onDesbloquear }) => {
  const [modoCriar, setModoCriar] = useState(() => !temSenha());
  const [senha, setSenha] = useState('');
  const [nova, setNova] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');

  const desbloquear = (e: React.FormEvent) => {
    e.preventDefault();
    if (conferirSenha(senha)) {
      onDesbloquear();
    } else {
      setErro('Senha incorreta.');
      setSenha('');
    }
  };

  const criar = (e: React.FormEvent) => {
    e.preventDefault();
    const r = criarSenha(nova, confirmar);
    if (r.ok) {
      onDesbloquear();
    } else {
      setErro(r.erro);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex items-center justify-center p-4 print:hidden">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 mb-4">
            {modoCriar ? <KeyRound size={26} /> : <Lock size={26} />}
          </span>
          <h2 className="titulo-tema text-xl font-black text-slate-100 uppercase tracking-widest">
            {modoCriar ? 'Criar senha' : 'Tela bloqueada'}
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">
            {modoCriar
              ? 'Defina a senha que vai proteger seus dados'
              : 'Digite a senha para continuar'}
          </p>
        </div>

        {modoCriar ? (
          <form onSubmit={criar} className="space-y-3">
            <input
              autoFocus
              type="password"
              value={nova}
              onChange={(e) => setNova(e.target.value)}
              placeholder="Nova senha (mín. 4 caracteres)"
              aria-label="Nova senha"
              className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 text-lg font-bold text-white focus:border-blue-500 outline-none"
            />
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Confirmar senha"
              aria-label="Confirmar senha"
              className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 text-lg font-bold text-white focus:border-blue-500 outline-none"
            />
            {erro && <p className="text-sm font-bold text-red-400">{erro}</p>}
            <button
              type="submit"
              aria-label="Criar senha"
              title="Criar senha"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              Criar senha
            </button>
          </form>
        ) : (
          <form onSubmit={desbloquear} className="space-y-3">
            <input
              autoFocus
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              aria-label="Senha"
              className="w-full campo-tema border border-slate-800 rounded-xl px-4 py-2.5 text-lg font-bold text-white focus:border-blue-500 outline-none"
            />
            {erro && <p className="text-sm font-bold text-red-400">{erro}</p>}
            <button
              type="submit"
              aria-label="Desbloquear"
              title="Desbloquear"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              Desbloquear
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Bloqueio;
