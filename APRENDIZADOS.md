# Aprendizados — Gerador de Orçamentos

Diário técnico do projeto: cada bloco de trabalho anexa aqui **o que foi feito, decisões e
gotchas** (para não repetir). Topo = mais recente. Ler antes de mexer em build/config.

---

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
