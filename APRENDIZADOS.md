# Aprendizados — Gerador de Orçamentos

Diário técnico do projeto: cada bloco de trabalho anexa aqui **o que foi feito, decisões e
gotchas** (para não repetir). Topo = mais recente. Ler antes de mexer em build/config.

---

## 2026-09-24 — Campo Placa (só no histórico) + card direito compacto (v0.2.3)

**Pedido:** (1) campo de **placa** abaixo de Parcelas; (2) a placa aparece **apenas no
histórico**, depois da quantidade de itens; (3) reduzir a altura/aproveitar melhor o espaço dos
campos da direita (Total Revisão, Peças na Revisão, Desconto, Parcelas).

**Feito:**
- `placa` no `App.tsx` (input `uppercase`, `maxLength={8}`, placeholder `Ex.: ABC1D23`); salva
  `placa: placa.trim()` no histórico e restaura ao "Abrir". **Não** entra no `QuoteTable`/PNG.
- `HistoryModal`: linha `data · N itens · PLACA` (placa em âmbar; some se vazia).
- `OrcamentoSalvo.placa?: string` (opcional → histórico antigo segue ok) e placa incluída no
  `mesmosDados`: mesma placa substitui o topo (evita duplicar), placa diferente = **outro
  registro** (não deixa um carro sobrescrever o outro).
- Card direito compacto: `space-y-6`→`space-y-4`, `space-y-2`→`space-y-1`, inputs
  `p-5 text-2xl`→`px-4 py-2.5 text-xl`, ícone `%` 24→20/`right-6`→`right-4`, botão
  `py-6 mt-6 text-xl`→`py-4 mt-2 text-lg`. Testes: 19.

**Gotcha:** ao comparar registros do histórico, placa vazia (`undefined`/`''`) tem de ser
equivalente — usar `(a.placa ?? '') === (b.placa ?? '')`, senão todo registro antigo (sem o
campo) pareceria diferente após a atualização.

## 2026-09-24 — Histórico: nº de itens + fonte maior (v0.2.2)

**Pedido:** na tela do Histórico, fonte um pouco maior e, ao lado de data/hora, o **número de
itens** do orçamento.

**Feito:**
- `OrcamentoSalvo.numItens?: number`; `retratoDoResumo` agora grava `items.length`. Registros
  antigos (sem o campo) caem no fallback `contarItensDaDescricao()` (conta linhas que começam
  com número — mesmo critério do parser).
- `HistoryModal`: data/hora 11px → **13px** com `· N itens` em azul; descrição `text-sm` →
  `text-base`; linha Revisão/Peças/Serviços/Líquido `text-xs` → `text-sm` (valor do líquido
  `text-base`).
- Testes: 18 (novo caso de `contarItensDaDescricao` + smoke conferindo `numItens: 3` salvo).

**Gotcha:** o campo é **opcional** de propósito — o histórico já salvo no navegador do usuário
não tem `numItens`; sem o fallback a lista mostraria "undefined" após a atualização. Sempre que
adicionar campo ao registro do histórico, prever o fallback dos dados antigos.

## 2026-09-24 — Fonte igual à do AI Studio: Inter + JetBrains Mono embutidas (v0.2.1)

**Problema:** o `.html` saía com a fonte padrão do Tailwind (Segoe UI no Windows), diferente
do AI Studio. **Causa:** a fonte não estava nos componentes — vinha do `index.html`/CSS base,
que não tínhamos.

**Descoberta (index.html do AI Studio):** `body { font-family: 'Inter', sans-serif }`,
`.font-mono-data { font-family: 'JetBrains Mono', monospace }`, fundo `#020617`,
`::selection` azul e `.no-print` no print — com as fontes carregadas por `<link>` do Google
Fonts (Inter 400/700/900 + JetBrains Mono 400/700) e Tailwind via **CDN**.

**Fix (offline, sem CDN):**
- `npm i @fontsource/inter @fontsource/jetbrains-mono` + `@import "@fontsource/inter/latin-400.css"`
  (e 700/900) / `@import "@fontsource/jetbrains-mono/latin-400.css"` (e 700) no `src/index.css`.
  O Vite inlineia os woff2 em **base64** (por causa do `assetsInlineLimit` alto) → continua
  arquivo único e abre sem internet.
- `index.css` replicou a base do original: `body` Inter + `#020617`, `.font-mono-data`,
  `::selection`, `.no-print` e `@media print` com fundo branco.
- Build passou de 294,67 kB → **646,94 kB** (gzip 354 kB) com 5 pesos de fonte em woff2+woff
  embutidos. Aceitável para uso local.

**Gotcha:** `font-mono` do Tailwind (textarea do orçamento) continua sendo o stack do sistema
(Consolas no Windows) — é o mesmo comportamento do original (o `index.html` só definia
`.font-mono-data`, que os componentes não usam). Se o `index.css` do AI Studio (ainda não
recebido) sobrescrever `font-mono`, aí embutimos/trocamos para JetBrains.

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
