import React, { useEffect, useState } from 'react';
import { Check, Copy, Play } from 'lucide-react';
import NeonCard from '../components/NeonCard';
import ClearButton from '../components/ClearButton';
import {
  formatarKmPtBr,
  lerRascunhoRevisoes,
  ordenarPorData,
  parseTextoRevisoes,
  projetarProxima,
  salvarRascunhoRevisoes,
  type DadosRevisoes,
} from './utils/parseRevisoes';

/** Linha "etiqueta: valor" do cartão de dados do veículo. */
const Linha: React.FC<{ rotulo: string; valor: string }> = ({ rotulo, valor }) => {
  if (!valor) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 border-b border-slate-800/50 last:border-0">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 shrink-0">
        {rotulo}
      </span>
      <span className="text-base font-bold text-slate-100 text-right break-all">{valor}</span>
    </div>
  );
};

const RevisoesApp: React.FC = () => {
  const [texto, setTexto] = useState<string>(lerRascunhoRevisoes);
  const [dados, setDados] = useState<DadosRevisoes | null>(() => {
    const inicial = lerRascunhoRevisoes();
    return inicial.trim() ? parseTextoRevisoes(inicial) : null;
  });
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    salvarRascunhoRevisoes(texto);
  }, [texto]);

  const processar = () => {
    if (!texto.trim()) {
      alert('Cole as passagens copiadas do portal Toyota no campo acima.');
      return;
    }
    const parsed = parseTextoRevisoes(texto);
    setDados(parsed);
    if (parsed.passagens.length === 0) {
      alert('Nenhuma passagem encontrada no texto — confira se colou a tabela com Data e KM.');
    }
  };

  const projecao = dados ? projetarProxima(dados.passagens) : null;
  const passagensRecentes = dados ? ordenarPorData(dados.passagens).reverse() : [];

  const textoProjecao =
    dados && projecao
      ? [
          dados.chassi ? `Chassi: ${dados.chassi}` : '',
          dados.veiculo ? `Veículo: ${dados.veiculo}` : '',
          `Última: ${projecao.baseAbertura} · ${formatarKmPtBr(projecao.baseKm)} km (${projecao.baseDescricao})`,
          projecao.revisaoProxima !== null
            ? `Próxima: revisão ${String(projecao.revisaoProxima).padStart(2, '0')} — ${formatarKmPtBr(projecao.kmAlvo)} km ou ${projecao.dataLimite} (o que ocorrer primeiro)`
            : `Próxima: ${formatarKmPtBr(projecao.kmAlvo)} km ou ${projecao.dataLimite} (o que ocorrer primeiro)`,
        ]
          .filter(Boolean)
          .join('\n')
      : '';

  const copiarProjecao = () => {
    if (!textoProjecao) return;
    navigator.clipboard.writeText(textoProjecao);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="ui-compacta pt-1 pb-16 text-slate-200">
      <div className="max-w-[1150px] mx-auto space-y-6">
        <NeonCard
          title="COLAR PASSAGENS"
          borderColor="blue-600"
          compact
          actions={<ClearButton onClick={() => { setTexto(''); setDados(null); }} label="Limpar passagens" />}
        >
          <textarea
            className="campo-tema w-full h-[280px] p-6 text-lg font-mono leading-relaxed border border-slate-800 rounded-2xl focus:border-blue-500 outline-none transition-colors resize-none overflow-x-auto whitespace-pre scrollbar-hide"
            placeholder="Cole aqui as passagens copiadas do portal Toyota (Chassi, Veículo, Toyota 10 e a tabela Posição/Abertura/KM/OS...)"
            value={texto}
            wrap="off"
            onChange={(e) => setTexto(e.target.value)}
            aria-label="Texto das passagens do portal Toyota"
          />
          <button
            onClick={processar}
            type="button"
            aria-label="Processar revisões"
            title="Processar revisões"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-xl shadow-2xl transition-all flex items-center justify-center active:scale-[0.98] cursor-pointer"
          >
            <Play size={28} fill="currentColor" />
          </button>
          <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase mt-2">
            O texto fica salvo neste navegador (entra no backup geral). Depois me diga o que extrair — por
            enquanto mostro os dados do veículo, as passagens e a próxima revisão.
          </p>
        </NeonCard>

        {dados && (
          <>
            <NeonCard title="DADOS DO VEÍCULO" borderColor="blue-500" compact>
              <Linha rotulo="Chassi" valor={dados.chassi} />
              <Linha rotulo="Veículo" valor={dados.veiculo} />
              <Linha rotulo="Ano Fab./Mod." valor={dados.anoFabMod} />
              <Linha rotulo="Produção" valor={dados.producao} />
              <Linha rotulo="Katashiki" valor={dados.katashiki} />
              <Linha rotulo="Venda" valor={dados.venda} />
              <Linha rotulo="Entrega" valor={dados.entrega} />
              <Linha rotulo="Tipo de uso" valor={dados.tipoUso} />
              <Linha rotulo="Distribuidor" valor={dados.distribuidorVenda} />
              {dados.toyota10 && (
                <Linha
                  rotulo="Toyota 10"
                  valor={`${dados.toyota10.vigenciaInicio} a ${dados.toyota10.vigenciaFim} · ${formatarKmPtBr(dados.toyota10.kmDe)} a ${formatarKmPtBr(dados.toyota10.kmAte)} km`}
                />
              )}
              {!dados.chassi && !dados.veiculo && dados.passagens.length === 0 && (
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest py-4 text-center">
                  Nada reconhecido — confira o texto colado.
                </p>
              )}
            </NeonCard>

            {passagensRecentes.length > 0 && (
              <NeonCard title={`PASSAGENS (${passagensRecentes.length})`} borderColor="#f59e0b" compact>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Data</th>
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">KM</th>
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">OS</th>
                        <th className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Revisão</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passagensRecentes.map((p, i) => (
                        <tr key={`${p.os}-${i}`} className="border-b border-slate-800/50 last:border-0">
                          <td className="px-3 py-2 text-base font-bold text-slate-100 whitespace-nowrap">{p.abertura}</td>
                          <td className="px-3 py-2 text-base font-bold text-slate-100 text-right whitespace-nowrap">
                            {formatarKmPtBr(p.km)}
                          </td>
                          <td className="px-3 py-2 text-base text-slate-400 whitespace-nowrap">{p.os}</td>
                          <td className="px-3 py-2 text-base text-slate-200">
                            {p.descricao}
                            {p.extras.length > 0 && (
                              <span className="block text-xs text-slate-500">+{p.extras.length} item(ns) extra(s)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </NeonCard>
            )}

            {projecao && (
              <NeonCard
                title="PRÓXIMA REVISÃO"
                borderColor="emerald-500"
                compact
                actions={
                  <button
                    type="button"
                    onClick={copiarProjecao}
                    aria-label={copiado ? 'Projeção copiada' : 'Copiar projeção'}
                    title={copiado ? 'Projeção copiada' : 'Copiar projeção'}
                    className={`flex items-center justify-center p-3 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                      copiado
                        ? 'bg-green-600 border-green-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {copiado ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
                  </button>
                }
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">KM alvo</span>
                    <span className="titulo-tema text-xl font-black text-slate-100">
                      {formatarKmPtBr(projecao.kmAlvo)} km
                    </span>
                  </div>
                  <div className="px-3 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Data limite</span>
                    <span className="titulo-tema text-xl font-black text-slate-100">{projecao.dataLimite}</span>
                  </div>
                </div>
                <p
                  className="text-lg leading-relaxed text-slate-200 whitespace-pre-wrap mt-3"
                  style={{ fontFamily: 'var(--tema-fonte-conteudo)' }}
                >
                  {textoProjecao}
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase mt-2">
                  Regra Toyota: 10 mil km ou 12 meses a partir da última ({projecao.baseAbertura} ·{' '}
                  {formatarKmPtBr(projecao.baseKm)} km) — o que ocorrer primeiro.
                </p>
              </NeonCard>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RevisoesApp;
