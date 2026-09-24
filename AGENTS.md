# AGENTS — Gerador de Orçamentos (Toyota Weiand Lajeado)

> **Leia este arquivo primeiro** em toda tarefa deste projeto. Ele é o harness: o que é,
> como rodar, como entregar e o que não pode quebrar. O diário técnico/lições fica no
> [`APRENDIZADOS.md`](APRENDIZADOS.md) — **anexe lá todo bloco de trabalho** (o que fez,
> decisões e gotchas).

---

## 1. O que é

Gerador de orçamentos de oficina. O usuário **cola dois textos** (a descrição do reparo e os
dados do orçamento copiados do PDF do sistema) e o app **interpreta, agrupa por item, soma**
peças/serviços, aplica **desconto em peças (%)**, divide em **parcelas** e monta o resumo +
tabela de saída. O resultado é **exportado como PNG** e enviado ao cliente pelo **WhatsApp**.

- **Sem IA / sem backend**: é só lógica determinística em JS (parse + agrupamento + soma).
- **Uso local no PC**: o app final é **UM arquivo `.html`** aberto com duplo clique no Chrome,
  sem servidor e sem internet.
- Origem: migrado de um app gerado no **Google AI Studio** (React + TS + Tailwind), mantendo
  a lógica e o **layout de saída** originais.

## 2. Estado atual

- Projeto em `/root/orcamento_web/` (Vite + React 19 + TS + Tailwind 4 + `lucide-react` +
  `html-to-image`). **Todos os arquivos do AI Studio já integrados 1:1** (`App.tsx`,
  `types.ts`, `utils/quoteLogic.ts`, `components/NeonCard.tsx`, `components/QuoteTable.tsx`,
  `package.json` com `html-to-image`).
- **Exportar PNG**: já no `QuoteTable` (botão "BAIXAR IMAGEM (ALTA QUALIDADE)",
  `html-to-image` em `pixelRatio: 3`) + "IMPRIMIR / PDF" (impressão do Chrome).
- **Histórico implementado**: `utils/historico.ts` (localStorage `orcamentos_historico_v1`,
  salva a cada "Processar Tudo", sem duplicar dados iguais; guarda **até 100** orçamentos e o
  **nº de itens** de cada um) + `components/HistoryModal.tsx` (abrir/excluir/limpar, **backup e
  restaurar JSON**). Botão "Histórico" no header; a lista mostra **data · N itens** ao lado e
  fonte maior (v0.2.2).
- Testes: **32 passando** (`npm test`) — lógica (`tests/quote_logic.test.ts`), histórico
  (`tests/historico.test.ts`), export PNG (`tests/export_image.test.ts`) e smoke de tela
  (`tests/app_smoke.test.tsx`, jsdom).
- Build de arquivo único **validado** (`dist/index.html` ~295 kB, CSS+JS embutidos, sem
  referências externas).
- **Campo Placa** (v0.2.3): input abaixo de **Parcelas** (maiúsculas, máx. 8) que vai para o
  histórico; **não** entra no PNG/tabela de saída (decisão do usuário). No histórico aparece
  depois do nº de itens: `data · N itens · PLACA`.
- **Card direito compacto** (v0.2.3, apertado na v0.2.4): inputs com `px-4 py-2.5 text-xl`,
  grupos com `space-y-2` e `NeonCard` com o prop **`compact`** (`px-6 py-4` no cabeçalho e no
  conteúdo, antes `px-8 py-6`/`p-8`) — praticamente sem espaço acima de Total Revisão/Peças/etc.
- **Busca no histórico** (v0.2.5): botão **Pesquisar** entre "Restaurar backup" e "Limpar
  tudo" → campo que filtra por **data ou placa** (`filtrarHistorico`, ignora `/ - . : e espaços`;
  ex.: `24/09`, `2026`, `abc-1d23`), com contador `N de M`.
- **Interface 25% menor** (v0.3.0): classe **`.ui-compacta { zoom: 0.75 }`** aplicada em
  header, grade de entrada, cartão de resumo, botões da tabela e painel do histórico
  (equivale a usar o Chrome a 75%). `main` = `max-w-[1050px] px-[30px]` para casar as
  larguras. **O documento de saída (`#printable-quote`) NÃO é escalado** — o PNG do cliente
  continua igual.
- **Seleção de itens** (v0.3.0; ajustado na v0.3.1): caixinhas na coluna "Item" da tabela; só
  as marcadas entram nos totais. Totais/desconto/líquido recalculados por
  `recalcularComSelecao`; as **desmarcadas continuam aparecendo no PNG/impressão**, em fonte
  clara (`text-slate-400`) e riscadas — **sem `opacity` na linha** (dava diferença de altura na
  captura). Quando há desmarcados, o documento ganha a caixa **"Itens Não Realizados"** (fora
  do Resumo Financeiro) com os itens e a soma (`itensNaoRealizados`); some quando todos estão
  marcados. Só a **caixinha** é escondida no PNG/print (`data-ui` + `filter` do `html-to-image`
  + CSS `@media print`). Ao processar/abrir do histórico, todas começam marcadas.
- **PNG sem vão no "Total Não Realizado"** (v0.3.2): o html-to-image reduz todo `font-size` em
  0.1px no clone (`clone-node.js`), então uma descrição no limite da quebra ficava com uma
  linha a menos no PNG e a altura fixa deixava um vão antes do divisor. `src/utils/exportImage.ts`
  (`exportarPng`) chama `toSvg`, **restaura os tamanhos reais de fonte** e desenha no canvas —
  ver bloco em `APRENDIZADOS.md`. Validado com Playwright (37/37 casos DOM = PNG).
- **Publicado**: repo público `viniciostristao1/orcamento-web` — Release **`v0.3.2`** com
  `Orcamento-v0.3.2.html` (+ cópia de nome estável `Orcamento.html`). Página fixa:
  `https://github.com/viniciostristao1/orcamento-web/releases/latest`.
- **Fonte idêntica ao AI Studio**: `src/index.css` replica a base do `index.html` original
  (`body` = **Inter**, `.font-mono-data` = **JetBrains Mono**, `::selection`, `.no-print`,
  fundo `#020617`). As duas fontes são **embutidas** via `@fontsource/inter` +
  `@fontsource/jetbrains-mono` (woff2 em base64 no build) — **nunca** usar `<link>` do Google
  Fonts (quebraria o offline).
- **Falta**: o usuário abrir no Chrome e validar com casos reais; feedback → nova versão.

## 3. Arquitetura / estrutura

```
orcamento_web/
  index.html                 (lang pt-BR; título "Gerador de Orçamentos")
  vite.config.ts             react + @tailwindcss/vite + vite-plugin-singlefile; base './'
  src/
    main.tsx                 entrada (StrictMode)
    index.css                @import "tailwindcss"; @utility scrollbar-hide; @media print
    App.tsx                  tela (entradas + resumo + tabela + export)
    types.ts                 tipos (QuoteSummary, QuoteItem)
    utils/quoteLogic.ts      LÓGICA PURA: parse do texto, agrupar, somar, descontos
    utils/historico.ts       HISTÓRICO local (localStorage) + backup/restaurar JSON
    components/NeonCard.tsx  card com borda neon
    components/QuoteTable.tsx tabela de saída + IMPRIMIR/PDF + BAIXAR IMAGEM (PNG)
    components/HistoryModal.tsx painel do histórico (abrir/excluir/limpar/backup)
  tests/                     vitest: quote_logic, historico, app_smoke (jsdom)
  dist/index.html            BUILD = arquivo único entregue ao usuário
```

## 4. Comandos

```bash
npm install          # dependências
npm run dev          # servidor de desenvolvimento (testar no navegador)
npm run typecheck    # tsc -b
npm test             # testes de lógica (node --test tests/)
npm run build        # gera dist/index.html (arquivo único)
```

> `npm run build` é **só `vite build`** de propósito: o código vindo do AI Studio tem
> imports/estilos que o `tsc` estrito do template Vite reprovava; o `typecheck` roda separado
> e o que vale para a entrega é o build + os testes.

## 5. Fluxo de entrega (harness)

1. Editar a lógica/tela.
2. `npm run typecheck` e `npm test` limpos (e testar no `npm run dev` quando mexer em UI).
3. `npm run build` → conferir que `dist/index.html` continua **autocontido** (sem
   `<script src=...>`/`<link rel=stylesheet>` externos).
4. Anexar o bloco em [`APRENDIZADOS.md`](APRENDIZADOS.md) (o que mudou + decisões + gotchas).
5. Subir a versão em `package.json`.
6. `git commit && git push`.
7. Publicar no Release do repo público `viniciostristao1/orcamento-web`:
   `cp dist/index.html /tmp/Orcamento-vX.Y.Z.html` →
   `gh release create vX.Y.Z /tmp/Orcamento-vX.Y.Z.html -t "Orçamentos vX.Y.Z" ...` e subir
   também uma cópia `Orcamento.html` (nome estável) no mesmo Release. Mandar ao usuário a
   **página `releases/latest`** + o nome do arquivo novo.

## 6. Regras duras (não quebrar)

- **Arquivo único e offline**: nada de CDN, fonte externa, imagem remota ou `fetch` em
  runtime — senão não abre no `file://` / sem internet. Fontes boas = `@fontsource/*`
  importado no CSS (o Vite inlineia em base64 por causa do `assetsInlineLimit`).
- **Export = PNG** (decisão do usuário: é o formato que ele manda no WhatsApp). PDF/Excel não
  são necessários; não trocar o fluxo sem pedido.
- **Layout de saída é contrato**: a tabela/resumo devem continuar iguais aos do AI Studio
  (o cliente recebe esse print). ⚠️ Por isso a interface usa `zoom: .75` **por seção** e o
  `#printable-quote` fica fora — não usar zoom em `body`/`main` (mudaria a captura do PNG).
- **Item desmarcado APARECE no cliente** em fonte clara + riscado (mesma altura das demais
  linhas — **nunca usar `opacity` na `<tr>`**, distorce a captura) e entra na caixa "Itens Não
  Realizados" (com a soma). Só a **caixinha de seleção** é escondida: `data-ui` + CSS
  `@media print` **e** `filter` no `toPng` (o `print:hidden` sozinho NÃO vale para a captura
  do PNG, que é de tela).
- **Histórico**: `localStorage` + **backup/restaurar JSON** (o usuário pode limpar o navegador
  ou trocar de PC). Salvar a cada "Processar Tudo". O `localStorage` no `file://` é por origem
  do navegador — para não depender disso, o Release publica também o `Orcamento.html` de nome
  estável (abrir sempre do mesmo caminho) e há o backup JSON.
- **Placa** é dado **só do histórico** (não aparece no PNG enviado ao cliente) e **entra na
  comparação de duplicidade**: mesma placa substitui o último; placa diferente = novo registro.
- **Sem IA, sem servidor, sem login, sem nuvem.**

## 7. Decisões do usuário (registradas)

- Lógica **pura** (sem Gemini/IA).
- Uso **local no PC** (arquivo no Chrome), não precisa hospedar.
- **Histórico + exportar PNG** (o app original só exporta PNG; suficiente para o WhatsApp).
- Manter o layout de saída do AI Studio.
- **Interface a 75%** (v0.3.0): o usuário usava o Chrome a 75%; o app já vem nesse tamanho.
- **Seleção de itens no orçamento** (v0.3.0): caixinhas para marcar/desmarcar; desmarcado não
  entra no PNG do cliente.

## 8. Pendências

- Usuário **testar no Chrome** (abrir o `.html` baixado) e validar a lógica com 1–2 casos
  reais (entrada → saída esperada). Feedback → nova versão.
- Se o usuário mandar o `index.css` original do AI Studio, conferir se ele sobrescreve
  `font-mono` (hoje o textarea usa o mono do sistema, igual ao original).
