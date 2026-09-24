# Aprendizados — Gerador de Orçamentos

Diário técnico do projeto: cada bloco de trabalho anexa aqui **o que foi feito, decisões e
gotchas** (para não repetir). Topo = mais recente. Ler antes de mexer em build/config.

---

## 2026-09-24 — Publicação (repo público + Release) — v0.2.0

**Feito:** repo público **`viniciostristao1/orcamento-web`** criado e código enviado
(`gh repo create ... --source=. --push`). Release **`v0.2.0`** com **dois assets**:
`Orcamento-v0.2.0.html` (nome com versão, escolha do usuário) e `Orcamento.html`
(nome estável, para o link fixo). Links verificados (200):
- Página: `https://github.com/viniciostristao1/orcamento-web/releases/latest`
- Arquivo: `https://github.com/viniciostristao1/orcamento-web/releases/latest/download/Orcamento.html`

**Gotcha:** no `file://`, o `localStorage` é atrelado à origem do navegador — abrir sempre o
**mesmo caminho/arquivo** mantém o histórico; trocar o nome do arquivo pode perdê-lo (por isso
o asset de nome estável + o backup JSON).

## 2026-09-24 — Componentes reais + Exportar PNG + Histórico (v0.2.0)

**Feito:**
- `components/QuoteTable.tsx` e `components/NeonCard.tsx` colados 1:1 do AI Studio. Dependência
  nova: **`html-to-image`** (o export PNG já existia no app original: botão "BAIXAR IMAGEM
  (ALTA QUALIDADE)", `pixelRatio: 3`, `backgroundColor: #ffffff`).
- `tw-animate-css` instalado e importado no `index.css` para as classes `animate-in fade-in
  zoom-in-95` (do `tailwindcss-animate`) continuarem funcionando no Tailwind 4.
- **Histórico** (`utils/historico.ts` + `components/HistoryModal.tsx`): salva a cada
  "Processar Tudo" em `localStorage["orcamentos_historico_v1"]` (máx. 100; **substitui** se o
  último tiver dados idênticos — não duplica), lista (mais recente primeiro), abre de volta
  (recalcula a partir dos textos), excluir, limpar tudo e **backup/restaurar JSON** (merge por
  `id`). Botão "Histórico" no header; modal `print:hidden` → **não aparece no PNG impressão**.
- Testes: **17** (`quote_logic` 11 · `historico` 4 · `app_smoke` 2 em jsdom). O smoke renderiza
  o App, clica em "Processar Tudo" e confere os valores na tela + o registro salvo no
  localStorage. Build único: 294,67 kB.

**Gotchas:**
- `localStorage` funciona no `file://` do Chrome, mas some se limpar dados do navegador → por
  isso o **backup JSON** é obrigatório.
- `baixarBackup` usa `URL.createObjectURL` (não roda no jsdom; por isso o teste cobre só
  adicionar/remover/importar).
- Em `html-to-image`, o nó capturado é `#printable-quote` (o documento branco) — os botões
  ficam fora dele, então não saem na imagem.

## 2026-09-24 — quoteLogic integrado + testes de lógica (exemplo Hilux)

**Feito:** `src/utils/quoteLogic.ts` colado **1:1** do AI Studio (parse de número BR, ajustes
manuais, agrupamento por ID, desconto **só em peças**, parcelas). `types.ts` provisório
(inferido do uso) até o original chegar. Testes com **vitest**: `tests/quote_logic.test.ts`,
11 casos, usando o exemplo que já vinha embutido no `App.tsx`.

**Resultado do exemplo (conferência):** peças **R$ 2.821,94** · serviços **R$ 1.573,93** ·
desconto 5% **R$ 141,10** · líquido **R$ 4.254,77**.
Itens: `01 PASTILHAS DE FREIO DIANT + RETIFICA DOS DISCOS` (peças 1.438,24 / serviço 764,80),
`02 HIGIENIZAÇÃO DO AR CONDICIONADO` (peças 209,60) e `03 BORRACHA DAS PALHETAS`
(peças 174,10 / serviço 42,90). `npm run typecheck` e `npm run build` limpos (build único
254,86 kB).

**Gotchas:**
- `parseBrazilianNumber` **prioriza o formato BR quando há vírgula**: `"1,799.75"` vira
  `1,79975` (o comentário da própria função assume BR). O teste registra o comportamento real
  — **não "corrigir" sem pedido**; as entradas do PDF vêm no formato BR.
- `npm test` = **vitest** (roda TS direto; `node --test` do Node 20 não roda TS).
- Ajuste manual soma em **peças** do ID: `valoresPorItem[id].pecas += extra` (mesmo para
  serviço — comportamento do app original, mantido).
- Descrição: `removerPalavras` tira `TR `/`TROCAR `/`TROCA ` e `substituicoesCondicionais`
  normaliza `OXI`, `RET`, pastilhas etc. — é aí que o texto "bonito" da saída é montado.

## 2026-09-24 — Scaffold do projeto web + build de arquivo único (base do AI Studio)

**Contexto:** app gerado no Google AI Studio (React+TS+Tailwind+lucide-react) que gera
orçamentos a partir de dois textos colados; o usuário quer rodar **local no Chrome** e
**exportar PNG** para mandar no WhatsApp. Sem IA, sem servidor.

**Feito:**
- Projeto criado com Vite (`react-ts`) em `/root/orcamento_web`: React 19, Vite 8, TS 6,
  `oxlint`, Tailwind 4 (`@tailwindcss/vite`) e `lucide-react`.
- `src/App.tsx` = tela original do AI Studio (copy/paste fiel).
- `vite.config.ts` com `vite-plugin-singlefile` + `base: './'` + `cssCodeSplit: false` →
  **`dist/index.html` único** (CSS+JS embutidos). Build de teste: 253 kB, **0 scripts/styles
  externos**.
- Stubs temporários (`types.ts`, `utils/quoteLogic.ts`, `components/NeonCard.tsx`,
  `components/QuoteTable.tsx`) só para validar o pipeline até colar os arquivos reais.
- `.gitignore` (node_modules/dist) e docs (`AGENTS.md` + este arquivo).

**Gotchas / decisões:**
- O template Vite atual liga `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters` e
  `erasableSyntaxOnly` — o código do AI Studio usa `import { QuoteSummary }` (tipo) e imports
  não usados (`X`, `Calculator`), o que **dá erro no `tsc`**. Solução: relaxar essas flags no
  `tsconfig.app.json` e deixar `npm run build` = **`vite build`** (sem `tsc`), com
  `npm run typecheck` separado. Assim o código original entra 1:1.
- `file://` no Chrome: script inline funciona; **qualquer** asset externo (CDN/fonte/imagem
  remota) quebra offline. Regra do projeto: tudo embutido.
- Tailwind 4 não tem `scrollbar-hide`; virou `@utility scrollbar-hide { &::-webkit-scrollbar {...} }`
  no `index.css` (classe usada no textarea do orçamento).
- Export do AI Studio: o usuário não achou "exportar tudo"; a migração está sendo feita por
  **colagem arquivo a arquivo** no chat.
- **Decisão do usuário:** exportar em **PNG** (não PDF/Excel) — é o formato que ele manda no
  WhatsApp. Histórico deve ser salvo a cada "Processar Tudo".
