# Gerador de Orçamentos — Toyota Weiand Lajeado

App local (arquivo `.html` único, sem servidor e sem internet) para gerar orçamentos de
oficina, flyers de promoção de pneus, acompanhar contatos de WhatsApp e tabelas de apoio.
O resultado é exportado como **PNG** e enviado ao cliente pelo WhatsApp.

> Documentação de trabalho (leitura obrigatória antes de mexer no código):
> [`AGENTS.md`](AGENTS.md) — o que é, como rodar/entregar e o que não pode quebrar.
> [`APRENDIZADOS.md`](APRENDIZADOS.md) — diário técnico de cada versão.

## Abas

- **Orçamentos** — cola a descrição do reparo + os dados do orçamento, aplica desconto em
  peças, parcela, exporta o PNG e guarda no histórico (placa, telefone e cor do cliente).
- **Tire Flyer** — cola a tabela de pneus e gera o flyer de promoção (6 layouts) em PNG.
- **Whats** — contatos, scripts de mensagem e relatório de envios.
- **Dados** — tabelas e notas de apoio (peças, O.S's etc.).

## Comandos

```bash
npm install          # dependências
npm run dev          # servidor de desenvolvimento
npm run typecheck    # tsc -b (cobre só `src/`)
npm run lint         # oxlint
npm test             # vitest run
npm run build        # gera dist/index.html (arquivo único entregue ao usuário)
```

## Entrega

Cada versão sai em `Orcamento-vX.Y.Z.html` + cópia estável `Orcamento.html` na
[página de releases](https://github.com/viniciostristao1/orcamento-web/releases/latest).
Link fixo do usuário:
`https://github.com/viniciostristao1/orcamento-web/releases/latest/download/Orcamento.html`
(baixar e substituir o arquivo **na mesma pasta**, para manter o `localStorage`).
