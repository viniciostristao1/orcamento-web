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

- Projeto em `/root/orcamento_web/` (Vite + React 19 + TS + Tailwind 4 + `lucide-react`).
- `src/App.tsx` = tela original do AI Studio (ainda com **stubs temporários** em
  `types.ts`, `utils/quoteLogic.ts`, `components/NeonCard.tsx`, `components/QuoteTable.tsx`
  até o usuário colar os arquivos reais).
- Build de arquivo único **validado** (`dist/index.html` com CSS+JS embutidos, sem
  referências externas).
- **Ainda não publicado** (repo GitHub + Release com o `.html` a definir).

## 3. Arquitetura / estrutura

```
orcamento_web/
  index.html                 (lang pt-BR; título "Gerador de Orçamentos")
  vite.config.ts             react + @tailwindcss/vite + vite-plugin-singlefile; base './'
  src/
    main.tsx                 entrada (StrictMode)
    index.css                @import "tailwindcss"; @utility scrollbar-hide; @media print
    App.tsx                  tela (entradas + resumo + tabela + export)
    types.ts                 tipos (QuoteSummary, itens...)
    utils/quoteLogic.ts      LÓGICA PURA: parse do texto, agrupar, somar, descontos
    components/NeonCard.tsx  card com borda neon
    components/QuoteTable.tsx tabela de saída
  tests/                     testes de lógica com node --test (casos reais do usuário)
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
7. Publicar o `dist/index.html` renomeado (ex.: `orcamento.html`) no **Release** do repo e
   mandar ao usuário o **link fixo (latest)**; ele substitui o arquivo local. **Nunca** mandar
   link versionado.

## 6. Regras duras (não quebrar)

- **Arquivo único e offline**: nada de CDN, fonte externa, imagem remota ou `fetch` em
  runtime — senão não abre no `file://` / sem internet.
- **Export = PNG** (decisão do usuário: é o formato que ele manda no WhatsApp). PDF/Excel não
  são necessários; não trocar o fluxo sem pedido.
- **Layout de saída é contrato**: a tabela/resumo devem continuar iguais aos do AI Studio
  (o cliente recebe esse print).
- **Histórico**: `localStorage` + **backup/restaurar JSON** (o usuário pode limpar o navegador
  ou trocar de PC). Salvar a cada "Processar Tudo".
- **Sem IA, sem servidor, sem login, sem nuvem.**

## 7. Decisões do usuário (registradas)

- Lógica **pura** (sem Gemini/IA).
- Uso **local no PC** (arquivo no Chrome), não precisa hospedar.
- **Histórico + exportar PNG** (o app original só exporta PNG; suficiente para o WhatsApp).
- Manter o layout de saída do AI Studio.

## 8. Pendências

- Receber e integrar os arquivos reais: `utils/quoteLogic.ts`, `types.ts`,
  `components/QuoteTable.tsx`, `components/NeonCard.tsx`, `package.json`/CSS originais.
- Testes de lógica com 1–2 exemplos reais do usuário (entrada → saída esperada).
- Botão **Exportar PNG** (ex.: `html-to-image`/`html2canvas`, empacotado no arquivo único).
- Histórico (localStorage) + backup/restaurar JSON.
- Criar repo GitHub + Release com link fixo.
