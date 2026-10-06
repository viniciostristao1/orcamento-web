# Aprendizados — Gerador de Orçamentos

Diário técnico do projeto: cada bloco de trabalho anexa aqui **o que foi feito, decisões e
gotchas** (para não repetir). Topo = mais recente. Ler antes de mexer em build/config.
O [índice de versões](#indice-de-versoes) lista todos os blocos.

---
<!-- INDICE-VERSOES-INICIO -->
<a id="indice-de-versoes"></a>

## Índice de versões

- [v0.100.0](#v10000) — 2026-10-06 — Play prefere extração nova (v0.100.0)
- [v0.99.1](#v09901) — 2026-10-06 — Fonte do MENU DADOS igual à dos campos (v0.99.1)
- [v0.99.0](#v09900) — 2026-10-06 — Observação no lembrete + menu e filtro (v0.99.0)
- [v0.98.0](#v09800) — 2026-10-06 — MENU DADOS à esquerda (ideia 03) (v0.98.0)
- [v0.97.0](#v09700) — 2026-10-05 — Selo de vencidos, lembrete no histórico, menu (v0.97.0)
- [v0.96.0](#v09600) — 2026-10-05 — Sino: lembretes rápidos + lista geral (v0.96.0)
- [v0.95.0](#v09500) — 2026-10-05 — Detalhes do flyer + colunas alinhadas (v0.95.0)
- [v0.94.0](#v09400) — 2026-10-05 — Escopo das borrachas + RESUMO colado (v0.94.0)
- [v0.93.0](#v09300) — 2026-10-05 — Play usa revisão + PLACA no card 1 (v0.93.0)
- [v0.92.0](#v09200) — 2026-10-05 — Card redondo: +, sem números, telefone/nome (v0.92.0)
- [v0.91.0](#v09100) — 2026-10-05 — Lembretes com data/hora nos históricos (v0.91.0)
- [v0.90.0](#v09000) — 2026-10-05 — Bug: play silencioso com campo vazio (v0.90.0)
- [v0.89.0](#v08900) — 2026-10-05 — Padrão 5%/6x, renumeração e Histórico no SISTEMA (v0.89.0)
- [v0.88.0](#v08800) — 2026-10-05 — Nova ordem dos cards + borrachas (v0.88.0)
- [v0.87.0](#v08700) — 2026-10-05 — Card 3 automático: extrai ao anexar, substitui (v0.87.0)
- [v0.86.0](#v08600) — 2026-10-05 — Borrachas e sobrescrita do card 3 (v0.86.0)
- [v0.85.0](#v08500) — 2026-10-05 — PDF real: separação por seção (v0.85.0)
- [v0.84.0](#v08400) — 2026-10-05 — Orçamento do sistema em PDF/print (v0.84.0)
- [v0.83.0](#v08300) — 2026-10-05 — Abas em âmbar só no tema grafite (v0.83.0)
- [Ideias de cor das abas superiores (sem versão — mockups)](#bloco-ideias-abas) — Ideias de cor das abas superiores (sem versão — mockups)
- [v0.82.0](#v08200) — 2026-10-05 — Cadeado com senha + históricos mais altos (v0.82.0)
- [v0.81.0](#v08100) — 2026-10-05 — Execução das melhorias da varredura (v0.81.0)
- [v0.80.0](#v08000) — 2026-10-05 — Varredura: pontas soltas, limpeza e docs (v0.80.0)
- [v0.79.0](#v07900) — 2026-10-05 — Cor do cliente nos históricos: verde/vermelho (v0.79.0)
- [v0.78.0](#v07800) — 2026-10-05 — Telefone + botão WhatsApp nos históricos (v0.78.0)
- [v0.77.0](#v07700) — 2026-10-02 — Whats: Novo Contato + Relatório um pouco mais largos (v0.77.0)
- [v0.76.0](#v07600) — 2026-10-02 — Relatório de Envios mais largo (v0.76.0)
- [v0.75.0](#v07500) — 2026-10-02 — Whats mais estreito (v0.75.0)
- [v0.74.0](#v07400) — 2026-10-02 — Abas superiores iguais às sub-abas (v0.74.0)
- [v0.73.0](#v07300) — 2026-10-02 — Logo Toyota azul no tema claro (v0.73.0)
- [v0.72.0](#v07200) — 2026-10-02 — Tire Flyer: COPIAR PNEUS abaixo do CONTATO (v0.72.0)
- [v0.71.0](#v07100) — 2026-10-02 — Sub-abas: minimizada fantasma azul (v0.71.0)
- [v0.70.0](#v07000) — 2026-10-02 — Excluir pede confirmação no histórico (v0.70.0)
- [v0.69.0](#v06900) — 2026-10-02 — Clique simples sem pintar a célula (v0.69.0)
- [v0.68.0](#v06800) — 2026-10-02 — Sub-abas mais baixas (v0.68.0)
- [v0.67.0](#v06700) — 2026-10-02 — Scripts Pneus/Revisão sem negrito (v0.67.0)
- [v0.66.0](#v06600) — 2026-10-02 — Sub-abas na medida dos títulos + botões proporcionais (v0.66.0)
- [v0.65.0](#v06500) — 2026-10-02 — Ordenar entende data + autocompletar na coluna (v0.65.0)
- [v0.64.0](#v06400) — 2026-10-02 — Lupa limpa sozinha após 1 min (v0.64.0)
- [v0.63.0](#v06300) — 2026-10-02 — Grifo do cabeçalho alinhado + grifo na nota (v0.63.0)
- [v0.62.0](#v06200) — 2026-10-01 — Resumos dos históricos em branco (v0.62.0)
- [v0.61.0](#v06100) — 2026-10-01 — Grifo no lugar certo com acentos + mesma fonte do input (v0.61.0)
- [v0.60.0](#v06000) — 2026-10-01 — X de Dados limpa atalho + DESCRIÇÃO sem scrollbar (v0.60.0)
- [v0.59.0](#v05900) — 2026-10-01 — Grifo sem pintar a célula (v0.59.0)
- [v0.58.0](#v05800) — 2026-10-01 — Lupa leva o foco para os Dados (v0.58.0)
- [v0.57.0](#v05700) — 2026-10-01 — Lupa pula ao digitar, X limpa, grifo só no termo (v0.57.0)
- [v0.56.0](#v05600) — 2026-10-01 — Lupa do atalho avança no Enter + feedback ao digitar (v0.56.0)
- [v0.55.0](#v05500) — 2026-10-01 — Faixa 164px + lupa pesquisa nos Dados (v0.55.0)
- [v0.54.0](#v05400) — 2026-10-01 — Esquerda ~425px + faixa 148px (v0.54.0)
- [v0.53.0](#v05300) — 2026-10-01 — Tabela preenche o cartão, sem vão à direita (v0.53.0)
- [v0.52.0](#v05200) — 2026-10-01 — Botões subir/descer tabela na aba Dados (v0.52.0)
- [v0.51.0](#v05100) — 2026-10-01 — Esquerda ~461px (v0.51.0)
- [v0.50.0](#v05000) — 2026-10-01 — Esquerda ~501px + faixa 132px (v0.50.0)
- [v0.49.0](#v04900) — 2026-10-01 — Coluna esquerda bem mais estreita (v0.49.0)
- [v0.48.0](#v04800) — 2026-10-01 — Selo de versão no cabeçalho (v0.48.0)
- [v0.47.0](#v04700) — 2026-10-01 — Coluna esquerda mais estreita + botões de atalho maiores (v0.47.0)
- [v0.46.0](#v04600) — 2026-10-01 — Faixa de atalhos fora da largura dos cards (v0.46.0)
- [v0.45.0](#v04500) — 2026-10-01 — APROVADO E DESCONTO com largura original + faixa ao lado (v0.45.0)
- [v0.44.0](#v04400) — 2026-10-01 — SUB ATALHOS ao lado do APROVADO E DESCONTO (v0.44.0)
- [v0.43.0](#v04300) — 2026-10-01 — Lembrete menor/todo clicável + SUB ATALHOS p/ sub-abas de Dados (v0.43.0)
- [v0.42.0](#v04200) — 2026-10-01 — Lembrete global vinculado aos contatos de hoje (v0.42.0)
- [v0.41.0](#v04100) — 2026-10-01 — Lembrete de disparo configurável na aba Whats (v0.41.0)
- [v0.40.0](#v04000) — 2026-10-01 — Histórico mostra os itens em duas linhas (v0.40.0)
- [v0.39.0](#v03900) — 2026-10-01 — Títulos internos padrão NeonCard + sub-abas Dados padrão cabeçalho (v0.39.0)
- [v0.38.0](#v03800) — 2026-09-29 — Títulos das abas menores + lista desliga removendo a bolinha (v0.38.0)
- [v0.37.0](#v03700) — 2026-09-29 — Lista da nota na linha do cursor + barra maior (v0.37.0)
- [v0.36.0](#v03600) — 2026-09-29 — Clique edita a nota e alça de 6 pontinhos reordena (até entre tabelas) (v0.36.0)
- [v0.35.0](#v03500) — 2026-09-29 — Nota sem negrito, ícone de lista e DESCRIÇÃO = DADOS DO ORÇAMENTO (v0.35.0)
- [v0.34.0](#v03400) — 2026-09-29 — Notas na aba Dados, data antes do nome e fonte da descrição (v0.34.0)
- [v0.33.0](#v03300) — 2026-09-29 — Enter na última linha da tabela cria linha nova (v0.33.0)
- [v0.32.0](#v03200) — 2026-09-29 — Itens do orçamento com valores/resumo e descrição do flyer (v0.32.0)
- [v0.31.0](#v03100) — 2026-09-29 — Abas sem contagem, títulos no tamanho do orçamento e células menores (v0.31.0)
- [v0.30.0](#v03000) — 2026-09-29 — Whats: janelinhas de observação e mensagem no cartão (v0.30.0)
- [v0.29.0](#v02900) — 2026-09-28 — Flyer "MARCAS", temas removidos, técnico sem negrito e TAB/Enter (v0.29.0)
- [v0.28.0](#v02800) — 2026-09-28 — Dados: contador na busca; Whats: cartão compacto com lista (v0.28.0)
- [v0.27.0](#v02700) — 2026-09-28 — Dados: busca com Enter (N de M) + células na fonte do orçamento (v0.27.0)
- [v0.26.0](#v02600) — 2026-09-28 — Dados: Ctrl+X/Delete no bloco + barra de baixo sob a última coluna (v0.26.0)
- [v0.25.1](#v02501) — 2026-09-28 — Dados: excluir tabela na barra de baixo + dica removida (v0.25.1)
- [v0.25.0](#v02500) — 2026-09-28 — Dados: adicionar coluna no cabeçalho + espaçamento das ações da linha (v0.25.0)
- [v0.24.1](#v02401) — 2026-09-28 — Ajustes de texto nos flyers (v0.24.1)
- [v0.24.0](#v02400) — 2026-09-28 — Dados: ordenar por coluna + ajustes na seleção (v0.24.0)
- [v0.23.0](#v02300) — 2026-09-28 — Dados: selecionar várias células (arrastar/Ctrl+C) e colar de planilha (v0.23.0)
- [v0.22.1](#v02201) — 2026-09-28 — Botões "Limpar" com borracha (v0.22.1)
- [v0.22.0](#v02200) — 2026-09-28 — Aba Dados: ações por linha/coluna + excluir tabela no cabeçalho + TAB (v0.22.0)
- [v0.21.0](#v02100) — 2026-09-27 — Tire Flyer: +3 layouts coloridos (laranja, racing, encarte) (v0.21.0)
- [v0.20.0](#v02000) — 2026-09-27 — Tire Flyer: seletor de layout de saída (clássico + tabela + etiqueta) (v0.20.0)
- [v0.19.2](#v01902) — 2026-09-27 — Ícone Borracha nos "limpar" + Desfazer na exclusão de sub-aba (v0.19.2)
- [v0.19.1](#v01901) — 2026-09-27 — Ajustes Grafite: negrito nos títulos + botão "+" (v0.19.1)
- [v0.19.0](#v01900) — 2026-09-27 — 8º tema "Grafite" (estilo das tabelas do Claude.ai) (v0.19.0)
- [v0.18.1](#v01801) — 2026-09-27 — Busca do histórico também por item (v0.18.1)
- [v0.18.0](#v01800) — 2026-09-26 — 5 temas novos + renomear os 2 antigos (v0.18.0)
- [v0.17.0](#v01700) — 2026-09-24 — Excluir cada sub-aba, caixinhas por linha e renomear abas/títulos (v0.17.0)
- [v0.16.1](#v01601) — 2026-09-24 — Dados: proporção fonte/célula, excluir sub-aba e header ajustado (v0.16.1)
- [v0.16.0](#v01600) — 2026-09-24 — Dados: sub-abas dinâmicas, copiar célula, largura de coluna e fontes maiores (v0.16.0)
- [v0.15.0](#v01500) — 2026-09-24 — Nova aba "DADOS" (tabelas de Peças e O.S's) (v0.15.0)
- [v0.14.6](#v01406) — 2026-09-24 — Whats em 2 colunas: contato+scripts à esquerda, relatório à direita (v0.14.6)
- [v0.14.5](#v01405) — 2026-09-24 — Títulos menores + observação e mensagem lado a lado no contato (v0.14.5)
- [v0.14.4](#v01404) — 2026-09-24 — Relatório de Envios: layout "Foco na observação" (v0.14.4)
- [v0.14.3](#v01403) — 2026-09-24 — RESUMO LÍQUIDO compacto e rente ao card 2 (v0.14.3)
- [v0.14.2](#v01402) — 2026-09-24 — Coluna direita mais junta e Ajustes com 2 linhas (v0.14.2)
- [v0.14.1](#v01401) — 2026-09-24 — Vassoura/formatador nos valores e Ajustes na coluna direita (v0.14.1)
- [v0.14.0](#v01400) — 2026-09-24 — Campos em pares no orçamento + scripts Pneus/Revisão no Whats (v0.14.0)
- [v0.13.5](#v01305) — 2026-09-24 — Formulário do Whats mais compacto (v0.13.5)
- [v0.13.4](#v01304) — 2026-09-24 — Títulos dos históricos em maiúsculas e popup menor (v0.13.4)
- [v0.13.3](#v01303) — 2026-09-24 — Contagem das abas segue a pesquisa (v0.13.3)
- [v0.13.2](#v01302) — 2026-09-24 — "Aprovado/Não aprovado" só nos registros salvos + título maior (v0.13.2)
- [v0.13.1](#v01301) — 2026-09-24 — Título do popup maior + data/hora do histórico no documento (v0.13.1)
- [v0.13.0](#v01300) — 2026-09-24 — Busca por nome, itens aprovados/recusados no histórico + zoom do modal (v0.13.0)
- [v0.12.0](#v01200) — 2026-09-24 — Histórico do Tire Flyer + card CONTATO (v0.12.0)
- [v0.11.0](#v01100) — 2026-09-24 — Histórico com abas + salvar não realizados + ver itens (v0.11.0)
- [v0.10.0](#v01000) — 2026-09-24 — Último orçamento gerado fica salvo ao reabrir (v0.10.0)
- [v0.9.1](#v00901) — 2026-09-24 — Histórico com valor bruto (v0.9.1)
- [v0.9.0](#v00900) — 2026-09-24 — Backup geral dentro de Configurações (v0.9.0)
- [v0.8.5](#v00805) — 2026-09-24 — TOTAL no resumo + caixa TOTAL GERAL + correção da fonte gigante (v0.8.5)
- [v0.8.4](#v00804) — 2026-09-24 — Lembrar o último orçamento digitado (v0.8.4)
- [v0.8.3](#v00803) — 2026-09-24 — Claude mais escuro + títulos das abas sem a linha embaixo (v0.8.3)
- [v0.8.2](#v00802) — 2026-09-24 — Impressão idêntica ao PNG + RESUMO LÍQUIDO compacto (v0.8.2)
- [v0.8.1](#v00801) — 2026-09-24 — Menos espaço acima do título ORÇAMENTOS (v0.8.1)
- [v0.8.0](#v00800) — 2026-09-24 — Botões só com ícone + fundo do Claude atrás dos cards em preto (v0.8.0)
- [v0.7.8](#v00708) — 2026-09-24 — Títulos centralizados, cards compactos e botão play (v0.7.8)
- [v0.7.7](#v00707) — 2026-09-24 — Títulos das abas, maiúsculas no orçamento, histórico maior, Claude mais escuro (v0.7.7)
- [v0.7.6](#v00706) — 2026-09-24 — Aba Whats com o título colado no topo (v0.7.6)
- [v0.7.5](#v00705) — 2026-09-24 — Ajustes de layout do Orçamentos + Claude mais escuro (v0.7.5)
- [v0.7.4](#v00704) — 2026-09-24 — Aba Whats sem a "Agenda de Tarefas" + Limpar nos Ajustes Manuais (v0.7.4)
- [v0.7.3](#v00703) — 2026-09-24 — Fonte do campo de pneus = campo do orçamento + Histórico fora da caixa (v0.7.3)
- [v0.7.2](#v00702) — 2026-09-24 — Cabeçalho padrão nas 3 abas + Histórico ao lado do APROVADO E DESCONTO (v0.7.2)
- [v0.7.1](#v00701) — 2026-09-24 — Tire Flyer mais compacto (campo, preview e topo) (v0.7.1)
- [v0.7.0](#v00700) — 2026-09-24 — Nova aba "Whats" (contatos/agenda do WhatsApp) (v0.7.0)
- [v0.6.3](#v00603) — 2026-09-24 — Tema Claude: textos em branco (v0.6.3)
- [v0.6.2](#v00602) — 2026-09-24 — Tema Claude ainda mais escuro + "Limpar Texto" sem confirmação (v0.6.2)
- [v0.6.1](#v00601) — 2026-09-24 — Tema Claude: fonte no conteúdo dos campos + fundo mais escuro (v0.6.1)
- [v0.6.0](#v00600) — 2026-09-24 — Tema Claude com tipografia e acabamento do Claude (v0.6.0)
- [v0.5.0](#v00500) — 2026-09-24 — Temas Original/Claude + logo Toyota + aba de pneus unificada (v0.5.0)
- [v0.4.2](#v00402) — 2026-09-24 — Tire Flyer: largura do campo ajustada (v0.4.2)
- [v0.4.1](#v00401) — 2026-09-24 — Tire Flyer: campo "Dados da Tabela" mais largo (v0.4.1)
- [v0.4.0](#v00400) — 2026-09-24 — Nova aba "TIRE FLYER" (promoção de pneus) (v0.4.0)
- [v0.3.2](#v00302) — 2026-09-24 — PNG: último item não realizado longe do "Total Não Realizado" (v0.3.2)
- [v0.3.1](#v00301) — 2026-09-24 — Desmarcados riscados no PNG + caixa "Itens Não Realizados" (v0.3.1)
- [v0.3.0](#v00300) — 2026-09-24 — Interface a 75% + caixinhas para escolher os itens (v0.3.0)
- [v0.2.5](#v00205) — 2026-09-24 — Pesquisar no histórico por data ou placa (v0.2.5)
- [v0.2.4](#v00204) — 2026-09-24 — Sem espaço acima dos campos da direita (v0.2.4)
- [v0.2.3](#v00203) — 2026-09-24 — Campo Placa (só no histórico) + card direito compacto (v0.2.3)
- [v0.2.2](#v00202) — 2026-09-24 — Histórico: nº de itens + fonte maior (v0.2.2)
- [v0.2.1](#v00201) — 2026-09-24 — Fonte igual à do AI Studio: Inter + JetBrains Mono embutidas (v0.2.1)
- [v0.2.0](#v00200-1) — 2026-09-24 — Publicação (repo público + Release) — v0.2.0
- [v0.2.0](#v00200) — 2026-09-24 — Componentes reais + Exportar PNG + Histórico (v0.2.0)
- [2026-09-24 — quoteLogic integrado + testes de lógica (exemplo Hilux)](#bloco-2026-09-24-quotelogic-integrado-testes-de-logica-exemplo-hil) — 2026-09-24 — quoteLogic integrado + testes de lógica (exemplo Hilux)
- [2026-09-24 — Scaffold do projeto web + build de arquivo único (base do AI Studio)](#bloco-2026-09-24-scaffold-do-projeto-web-build-de-arquivo-unico-ba) — 2026-09-24 — Scaffold do projeto web + build de arquivo único (base do AI Studio)

<!-- INDICE-VERSOES-FIM -->

<a id="v10000"></a>
## 2026-10-06 — Play prefere extração nova (v0.100.0)

**Bug:** anexar o 2º orçamento + play gerava os itens do 1º (campos ainda com o
anterior). **Feito:** `decidirFontePlay` pura + fiação (nonce da extração, dirty dos
campos, limpa ao abrir histórico); anexar + play direto gera o novo; edição manual
vence. Smoke com PDF mockado (sem worker) reproduz o cenário. MENU DADOS em
`text-base`.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**193/193 (16 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.100.0`.

---

<a id="v09901"></a>
## 2026-10-06 — Fonte do MENU DADOS igual à dos campos (v0.99.1)

**Pedido:** a fonte do menu não parecia a do conteúdo de DADOS.

**Causa:** o CSS global força `textarea/input/select` em `var(--tema-fonte-conteudo)`
(Inter) — o `font-mono` do menu destoava. **Feito:** itens do menu com a mesma fonte
via inline style (padrão das abas superiores), brancos e sem negrito. Screenshot
conferido.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**187/187 (16 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.99.1`.

---

<a id="v09900"></a>
## 2026-10-06 — Observação no lembrete + menu e filtro (v0.99.0)

**Pedido:** (1) data/hora maior + observação na mesma linha, buscável nos dois
históricos; (2) MENU DADOS branco, mono, sem negrito; (3) filtro de cor na linha,
entre lupa e limpar.

**Feito:** `EditorLembrete` com inputs `text-lg` + campo observação (120 máx.);
`observacao` nos dois registros (busca, cartão, limpar junto); menu em
`font-mono font-normal text-slate-100`; `FiltroCorCliente compacto` na linha de ações
do `HistoricoBase` (vale nos dois modais). Screenshots headless conferidos.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**187/187 (16 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.99.0`.

---

<a id="v09800"></a>
## 2026-10-06 — MENU DADOS à esquerda (ideia 03) (v0.98.0)

**Pedido:** ideia 03 (barra âmbar) no lugar do SUB ATALHOS, em menu lateral esquerdo.

**Feito:** `AtalhosDados.tsx` virou `MenuDados.tsx` (mesma lógica/busca/aria-labels;
visual: painel quase-preto, linhas de texto, barra âmbar no hover, busca com foco
âmbar); grade com sidebar `210px` fixa no topo ao rolar; página de orçamentos em
`max-w-[1400px]`; comentários SUB ATALHOS renomeados. Screenshot headless conferido.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**186/186 (16 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.98.0`.

---

<a id="v09700"></a>
## 2026-10-05 — Selo de vencidos, lembrete no histórico, menu (v0.97.0)

**Pedido:** (1) selo só com atrasados/na tela; (2) +1 linha na DESCRIÇÃO da revisão;
(3) link com 8 menus MENU DADOS; (4) clique no lembrete leva ao histórico, sem gerar.

**Feito:** selo = `vencido` (não total); DESCRIÇÃO `h-28`→`h-[138px]` com review-DADOS
compensado (`277→251`, alinhamentos intactos); clique abre o modal no cartão com ring
âmbar + scroll (`destaqueId`, `data-hist-id`; `abrirLembrete` removido das duas abas);
`ideias/menu-dados.md` + 8 PNGs (link enviado, sem implementar).

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**186/186 (16 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.97.0`.

---

<a id="v09600"></a>
## 2026-10-05 — Sino: lembretes rápidos + lista geral (v0.96.0)

**Pedido:** tirar a frase do PDF; sino entre cadeado e engrenagem com campo de lembrete
rápido + lista de todos os lembretes dos históricos.

**Feito:** sem a frase de sucesso do PDF (OCR mantém a sua); `lembretesRapidos.ts`
(CRUD, máx. 100, chave no backup com merge); `SinoLembretes.tsx` (criar + listar tudo
com excluir + selo de quantidade); vencidos rápidos no popup (clique conclui);
`listarTodosLembretes` para o sino. Nomes do popup por origem (área + botão iguais com
1 item, como no aviso do Whats).

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**185/185 (16 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.96.0`.

**Gotchas / decisões:**
- Rápidos não têm orçamento: no popup o clique só conclui (nome "Concluir…").
- Teste do sino isola as 3 chaves (vazamento do teste do X do flyer quebrava a contagem).

---

<a id="v09500"></a>
## 2026-10-05 — Detalhes do flyer + colunas alinhadas (v0.95.0)

**Pedido:** (1) janelinha de detalhes no histórico do flyer sem reabrir; (2) card vira
só ORÇAMENTO DO SISTEMA; (3) esquerda terminar junto do RESUMO (mais linhas em DADOS)
e DADOS DO ORÇAMENTO junto da DESCRIÇÃO.

**Feito:** `data-janela-flyer` com contato/telefone/medida + marcas (preço prazo/vista,
estoque) via `parseInput`; alturas medidas no Chrome headless a 1600px já com zoom .75
(review `h-[277px]`, campo `h-[216px]`): SISTEMA 688 vs RESUMO 689, DADOS 946 vs
DESCRIÇÃO 946. Precisão varia com conteúdo/tela — aproximado, não cravado.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**179/179 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.95.0`.

---

<a id="v09400"></a>
## 2026-10-05 — Escopo das borrachas + RESUMO colado (v0.94.0)

**Pedido:** APROVADO limpa só revisão+ajustes; SISTEMA limpa também revisão, ajustes,
DADOS e DESCRIÇÃO; PLACA com a largura do Nº e NOME no resto; sem vão entre AJUSTES
e RESUMO.

**Feito:** escopos trocados (`onLimparValores` no card); grade PLACA (1 col) + NOME
(2 cols) na mesma grade do Nº; `mt-auto` fora do RESUMO. Smoke dos dois escopos.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**178/178 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.94.0`.

---

<a id="v09300"></a>
## 2026-10-05 — Play usa revisão + PLACA no card 1 (v0.93.0)

**Pedido:** (1) anexou + play deu alerta mesmo com texto extraído; (2) PLACA ao lado
do NOME no card do sistema.

**Feito:** revisão virou estado do app (`revDesc`/`revDados` controlados): play vazio usa
o extraído (só alerta sem nada em nenhum lugar) e preenche os campos junto; PLACA saiu
do APROVADO para o card (lado do NOME). Smoke do fallback direto.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**178/178 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.93.0`.

---

<a id="v09200"></a>
## 2026-10-05 — Card redondo: +, sem números, telefone/nome (v0.92.0)

**Pedido:** + ícone no lugar de "Novo arquivo", sem frase; Nº/Data/Telefone/Nome no
card; "Usar no orçamento manual"; RESUMO abaixo do AJUSTES; sem números nos títulos.

**Feito:** ações do card = [+][Histórico][borracha]; grid Nº/Data/Telefone + NOME abaixo;
TELEFONE e NOME saíram do APROVADO (placa ficou só PLACA); NOME é campo próprio
(histórico, busca, dedup, rascunho, borrachas); títulos sem números; direita =
APROVADO, AJUSTES, RESUMO, DESCRIÇÃO. Rótulos da revisão viraram só DESCRIÇÃO e
DADOS. Smoke e unidade atualizados.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**177/177 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.92.0`.

---

<a id="v09100"></a>
## 2026-10-05 — Lembretes com data/hora nos históricos (v0.91.0)

**Pedido:** botão relógio nos dois históricos para programar data/hora; no cartão, data
do orçamento + data do lembrete (sem contagem de itens); vencidos piscam no canto
inferior direito e o clique leva ao orçamento.

**Feito:** `lembreteEm` (ISO) nos dois registros + `atualizarLembrete*` (avisa por evento)
+ `utils/lembretes.ts` (vencidos, formatos, rótulos) — reprocessar preserva, backup leva
junto. `LembreteRelogio.tsx` (botão + editor datetime-local) nos dois modais; cartões
sem "N itens/marcas". `LembreteHistorico.tsx` âmbar pulsante empilhado com o aviso do
Whats (casca única no App); clique abre o registro e conclui, X dispensa até mudar.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**176/176 (15 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.91.0`.

**Gotchas / decisões:**
- Área + botão do popup têm o mesmo nome com 1 vencido (padrão herdado do aviso do
  Whats): nos testes, `getAllByRole` + índice.
- ids iguais no mesmo ms quebram testes de atualização: semear ids explícitos.

---

<a id="v09000"></a>
## 2026-10-05 — Bug: play silencioso com campo vazio (v0.90.0)

**Bug:** anexar o PDF e dar play sem nada gerava: sem scroll e sem imagem — porque o
`handleGenerate` saía em silêncio com campo vazio. Reproduzido o fluxo fiel no Chrome
headless (PDF com seções → extração, Usar, play: total 409,52 e scroll OK) — o fluxo
nominal estava são; a falha era o retorno mudo.

**Feito:** alerta orientando (preencher campos 2/3 ou usar o card 1) + smoke que zera os
campos, clica e confere alerta + ausência de `#printable-quote`.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**169/169 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.90.0`.

---

<a id="v08900"></a>
## 2026-10-05 — Padrão 5%/6x, renumeração e Histórico no SISTEMA (v0.89.0)

**Pedido:** borracha mantém desconto 5 e 6x (padrão, só manual alterna); SISTEMA vira 1,
DADOS segue 2 (no lugar da DESCRIÇÃO, mais espaço), DESCRIÇÃO vira 3 (no lugar do DADOS);
botão Histórico ao lado da borracha do SISTEMA.

**Feito:** borracha geral restaura desconto 5/parcelas 6 (padrão novo também na abertura);
cards movidos de coluna (só posição) e renomeados; `onAbrirHistorico` no `SistemaCard`,
botão saiu da DESCRIÇÃO (import `History` removido). Smoke atualizado (nomes, ordem,
6x/5); 2 testes antigos de "primeira textarea" já miravam o campo certo.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**168/168 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.89.0`.

---

<a id="v08800"></a>
## 2026-10-05 — Nova ordem dos cards + borrachas (v0.88.0)

**Pedido:** (1) borracha do card 3 limpa PLACA/NOME/TELEFONE; (2) 3. SISTEMA no topo,
1. DESCRIÇÃO abaixo dele, 2. DADOS abaixo de 3. AJUSTES.

**Feito:** `onLimparContato` no card 3 (zera placa+telefone); esquerda =
SISTEMA + DESCRIÇÃO; direita = APROVADO + AJUSTES + DADOS + RESUMO (só posição,
títulos e lógica intactos). Smoke cobre a ordem (`compareDocumentPosition`) e a
borracha; 2 testes antigos que indexavam "primeira textarea" passaram a mirar o
campo certo.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**168/168 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.88.0`.

---

<a id="v08700"></a>
## 2026-10-05 — Card 3 automático: extrai ao anexar, substitui (v0.87.0)

**Pedido:** botão Novo arquivo que já importa ao anexar (sem botão extrair);
novo anexo sobrepõe o anterior (estava somando conteúdos).

**Feito:** `escolher` dispara `extrairArquivos` direto (PDFs + imagens no mesmo lote);
`aplicarTexto` substitui textos e nº/data; botões manuais removidos (foco some junto).
CDP refeito sem cliques manuais: auto-extração, substituição e 0 erros JS.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**167/167 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.87.0`.

---

<a id="v08600"></a>
## 2026-10-05 — Borrachas e sobrescrita do card 3 (v0.86.0)

**Pedido:** (1) borracha do card 3 apaga Nº e Data; (2) borracha geral no APROVADO;
(3) "Usar" sobrescreve PLACA/NOME e TELEFONE com 55+DDD do Celular.

**Feito:** `limpar` do card 3 chama `onNumero('')`/`onDataDoc('')`; `ClearButton` no
`APROVADO E DESCONTO` (zera revisão/peças, desconto 0, parcelas 1x, limpa placa e
telefone); `extrairCabecalho` ganha `telefone` (prefere `Celular:`, cai para Fone/Tel,
só preenche se válido) e `aplicarCabecalho` sobrescreve placa/telefone com conteúdo.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**167/167 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB, 0 refs externas).
Selo `v0.86.0`.

---

<a id="v08500"></a>
## 2026-10-05 — PDF real: separação por seção (v0.85.0)

**Pedido:** com o PDF de verdade, DADOS = só itens após "It Tipo Código…", DESCRIÇÃO =
reclamações, cliente após "Cliente Cadastro", nº = 1º do documento, resto ignorado.

**Feito:** `extrairSistemaToyota` (seções por marcadores + filtro de linha de item;
cliente sem o "Cadastro" colado; número = 1ª linha só-dígitos; data do cabeçalho).
Card 3 com duas revisões (descrição + dados) e botão único que preenche os campos 1 e 2
(só preenche o não-vazio, sem apagar o digitado). Testes com o texto real colado.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**164/164 (14 arquivos)**, CDP com o fluxo novo OK, `npm run build` OK
(`dist/index.html` ~16 MB, 0 refs externas). Selo `v0.85.0`.

**Gotchas / decisões:**
- Sem os marcadores (layout desconhecido), cai no fluxo integral em DADOS (v0.84.0).
- "NºOrçamento Interno05/10/2026" é a DATA; o número é o solto no topo (20234).

---

<a id="v08400"></a>
## 2026-10-05 — Orçamento do sistema em PDF/print (v0.84.0)

**Pedido:** anexar PDF ou prints do orçamento do sistema, somando como os campos 1 e 2;
transição com os dois fluxos funcionando.

**Feito:** card 3 opcional (`sistema/`): pdf.js embutido (linhas por Y) + OCR tesseract
embutido (1+ prints, português inline) + cabeçalho auto (nº/placa/nome/data, editável;
nº e data no histórico com busca) + revisão antes de virar DADOS. Transição garantida:
campos 1 e 2 intactos. Verificação ponta a ponta de verdade (CDP + Chrome headless +
PDF/PNG gerados): PDF com 2 páginas, OCR do print, soma, nº no histórico, 0 erros JS.

**Achados da verificação (corrigidos):**
- `Peca` sem acento caía em Serviços (zerava peças/desconto) → parser aceita sem
  acento; linhas sem ID numérico (cabeçalho) são ignoradas.
- Fetch do idioma no worker com URL relativa quebrava o OCR → idioma via Blob
  (vale no dev e no build).
- Rolldown/Vite 8 não trata `.gz` como asset → `assetsInclude` no `vite.config.ts`.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**161/161 (14 arquivos)**, `npm run build` OK (`dist/index.html` ~16 MB — pdf.js +
tesseract + português embutidos — 0 refs externas). Selo `v0.84.0`.

**Gotchas / decisões:**
- Sem PDF real do sistema em mãos: cabeçalho por rótulos genéricos + revisão obrigatória;
  mandar exemplo real se nº/placa/nome/data desalinharem (itera na próxima).
- OCR é lento na 1ª vez (parse do wasm+idioma); prints limpos e grandes leem melhor.
- `?raw` (workers/núcleo como string) + asset base64 (idioma) + Blob URLs = offline total.
- Teste do nº com "No" (sem º): regex com lookbehind para não casar "PLANO 123".

---

<a id="v08300"></a>
## 2026-10-05 — Abas em âmbar só no tema grafite (v0.83.0)

**Pedido:** aplicar a ideia 01 (âmbar + preta) apenas no tema grafite.

**Feito:** `App.tsx` escolhe as classes das abas superiores pelo tema
(`abaAtiva`/`abaNormal`/`abaEditandoBorda`): grafite = ativa `bg-amber-500 text-black`,
demais `text-amber-200` em fantasma; outros temas seguem azuis como antes. Teste smoke
confere as classes nos dois temas.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**151/151 (13 arquivos)**, `npm run build` OK (`dist/index.html` autocontido). Selo `v0.83.0`.

---

<a id="bloco-ideias-abas"></a>
## Ideias de cor das abas superiores (sem versão — mockups)

**Pedido:** link com 10 ideias de cor para os botões das abas superiores (usuário sugeriu
âmbar + fonte preta).

**Feito:** `ideias/abas-cores.md` + 10 PNGs (`abas-c01..c10`, PIL + Inter ExtraBold, fundo
`#020617`): 01 âmbar+preta (sugestão do usuário), 02 verde, 03 vermelho, 04 violeta,
05 grafite claro, 06 laranja, 07 ciano, 08 rosa, 09 lima+preta, 10 papel. Cada imagem mostra
a aba ativa preenchida + demais em fantasma. Link enviado (blob do GitHub, sem release —
app não mudou, versão continua `0.82.0`).

---

<a id="v08200"></a>
## 2026-10-05 — Cadeado com senha + históricos mais altos (v0.82.0)

**Pedido:** (1) dúvida: telefone digitado depois de gerar vai ao histórico? (2) históricos
mais altos; (3) botão Sair com senha + lugar para trocar.

**Feito:**
- Telefone: nada a mudar — `Processar` e `Salvar com itens não realizados` leem os campos
  na hora do clique (`OrcamentosApp` nas chamadas de `adicionarAoHistorico`; `TireFlyerApp`
  no `handleProcess`). Comportamento documentado no AGENTS §6.
- Históricos `max-h-[85vh]` → `93vh` (só no `HistoricoBase`, vale para os dois).
- Cadeado: `utils/bloqueio.ts` (criar/trocar/conferir, mín. 4; chave
  `app_bloqueio_senha_v1` no backup geral) + `components/Bloqueio.tsx` (overlay `z-[300]`,
  sem desmontar o app; sem senha o 1º bloqueio cadastra) + botão **Sair** (cadeado) no
  header + troca em Configurações → Bloqueio por senha.
- Testes: `tests/bloqueio.test.ts` (4) + 2 smoke (bloquear/desbloquear, trocar senha).

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**150/150 (13 arquivos)**, `npm run build` OK (`dist/index.html` ~1,30 MB, 0 refs externas).
Selo `v0.82.0`.

**Gotchas / decisões:**
- Privacidade casual (olhar por cima do ombro), não cofre: senha em texto puro no
  localStorage, como o resto dos dados; entra no backup de propósito.
- Overlay em vez de desmontar: o `inputText` do flyer não tem rascunho — se o app
  desmontasse ao bloquear, a tabela digitada e não processada se perderia.

---

<a id="v08100"></a>
## 2026-10-05 — Execução das melhorias da varredura (v0.81.0)

**Pedido:** executar as 8 melhorias sugeridas na v0.80.0 (sem implementar features novas).

**Feito:**
- `utils/busca.ts`: `normalizarBusca` em definição única; `historico.ts` e
  `historicoFlyer.ts` importam de lá (antes duplicada).
- Telefone unificado: `ContactList.formatPhone` (aba Whats) removido — `handleSend` usa
  `normalizarTelefoneParaWhats` (regra idêntica, agora num lugar só).
- Backup mescla listas por id: `restaurarBackup` não apaga mais o que já está no
  navegador — orçamentos, flyers e contatos fazem união por `id` (conflito: vale o
  atual); resto segue sobrescrevendo. `CHAVES_LISTA` marca as chaves-lista;
  `CONTATOS_KEY` reutilizado de `contatosHoje.ts` (antes duplicado). `ResumoBackup`
  ganhou `flyers` (mensagem de restaurado + testes atualizados).
- Modais unificados: novo `components/HistoricoBase.tsx` (overlay, cabeçalho, ações,
  busca, filtro de cor, lista) — `HistoryModal` (485→~440 linhas) e `FlyerHistoryModal`
  (239→~200) entram com título/botões/faixas/cartões. `SeloCor` + `classeBordaCor` em
  `CorCliente.tsx` (borda/bolinha antes inline nos dois). DOM, classes, aria-labels e
  placeholders intactos (é o que o smoke cobre).
- Smoke do selo: header `vX.Y.Z` conferido na tela (`title="Versão do arquivo"`).
- `tsconfig.app.json` inclui `tests/` + `resolveJsonModule` (typecheck agora cobre os
  testes; `@ts-expect-error` do teste de versão removido — passou limpo de primeira).
- Índice de versões no topo deste arquivo (âncoras `<a id>` + marcadores de regeneração;
  rerodar o gerador após cada release).
- `ideias/`: verificado — 63 arquivos, 11 MB, todos os PNGs referenciados pelos 5 `.md`
  (que o AGENTS.md cita por caminho). Zipar quebraria os links das imagens e não
  enxugaria o clone (histórico git mantém tudo): mantido como está, por decisão.

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**144/144 (12 arquivos)**, `npm run build` OK (`dist/index.html` ~1,29 MB, 0 refs externas).
Selo `v0.81.0`.

**Gotchas / decisões:**
- Mesclar backup: conflito de `id` mantém o ATUAL do navegador (nunca apaga dado novo);
  backup inédito entra no fim da lista.
- Unificar modal por render-props/slots em vez de herança: cada modal continua dono do
  estado/pipeline; a base só renderiza a casca.
- Typecheck em `tests/`: `vitest`, `@testing-library` e DOM já tipados; único ajuste foi
  `resolveJsonModule` para o `package.json`.

---

<a id="v08000"></a>
## 2026-10-05 — Varredura: pontas soltas, limpeza e docs (v0.80.0)

**Pedido:** ler o projeto inteiro, achar pontas soltas e coisas por documentar, organizar
arquivos/pastas; sugestões de melhoria só listadas, sem executar.

**Pontas soltas encontradas e corrigidas:**
- `utils/versao.ts` parado em `0.77.0` (package em `0.79.0`): v0.78.0/v0.79.0 saíram com o
  selo do header defasado. Corrigido + travado por `tests/versao.test.ts` (VERSAO ===
  package.json; o tsconfig cobre só `src/`, então o teste importa o JSON com
  `@ts-expect-error` — vitest resolve em runtime).
- Arquivos mortos apagados (eram só peso no repo; nada os importava): `src/assets/hero.png`,
  `react.svg`, `vite.svg`, `logo_toyota.PNG` (duplicata do `.png` usado no header) e
  `public/` inteiro (`favicon.svg`, `icons.svg` — template Vite; `index.html` não referencia).
  Único asset restante: `src/assets/logo_toyota.png`. Build sem `public/` passa normal.
- Tipos mortos em `whats/types.ts` (`Task`, `AppState`, `CampaignStatus` — agenda removida
  na v0.7.4, nada os usava). Ficou só `Contact`.
- Lint: import `Download` sem uso (`QuoteTable.tsx`) e states `revAprovada`/`revPecas`
  escritos mas nunca lidos (`OrcamentosApp.tsx` — saíram os states e as 2 linhas de
  "consistência" no `handleGenerate`; os `*Input` continuam donos do valor). Restam só
  warnings conhecidos (`set-state-in-effect` nos modais/listas = reset ao abrir, padrão
  aceito; `only-export-components` no `RotulosContext`).
- `tire/utils/historicoFlyer.ts`: imports estavam após a interface — movidos para o topo.

**Documentação:**
- `AGENTS.md`: §1"quatro abas" listava 3 → 4 (faltava Dados); §2 testes 94 → 142 + bullets
  v0.78.0/v0.79.0/v0.80.0; §3 árvore reescrita (faltavam ~20 arquivos; `BackupManager`
  listado não existe — backup mora em `ConfiguracoesTema`); §4 `npm test` corrigido para
  `vitest run` + `lint` + aviso de que o typecheck cobre só `src/`; §5 checklist com
  `versao.ts` + lint; §6 regras de telefone/cor/VERSAO; §7 decisões registradas.
- `README.md` era template do Vite — virou resumo do projeto com abas, comandos e entrega.
- `ideias/` mantido (mockups já implementados; histórico das escolhas de layout).

**Validação:** `npm run typecheck` limpo, `npm run lint` sem erros, `npm test`
**142/142 (12 arquivos)**, `npm run build` OK (`dist/index.html` ~1,29 MB, 0 refs externas).
Selo `v0.80.0`.

**Gotchas / decisões:**
- Organização aqui = só remoção de mortos + docs; nenhum arquivo `.tsx/.ts` mudou de pasta
  (mover quebraria ~40 imports por ganho zero — ver sugestões).
- `public/` não faz falta: com `vite-plugin-singlefile` + `assetsInlineLimit` alto, tudo vai
  embutido; nada referencia a pasta.

---

<a id="v07900"></a>
## 2026-10-05 — Cor do cliente nos históricos: verde/vermelho (v0.79.0)

**Pedido:** no histórico (orçamentos e tire flyer), marcar cada contato de verde
(quer fazer em breve) ou vermelho (só orçamento/pesquisou), e filtrar por cor
(clicar no verde mostra só verdes; no vermelho, só vermelhos).

**Feito:**
- Novo `src/utils/corCliente.ts`: `CorCliente` (`verde`|`vermelho`), `FiltroCor`
  (`todas`|cor), `filtrarPorCor`, `corDaBusca` ("verde"/"vermelho"/"vermelha" na busca
  textual) e `ROTULO_COR` (legendas).
- `OrcamentoSalvo.cor?` + `FlyerSalvo.cor?` (só histórico, fora do PNG): entram na busca
  textual e ganham `atualizarCorHistorico`/`atualizarCorFlyer` (salva na hora). A cor NÃO
  entra no anti-duplicado e o reprocessamento preserva a cor marcada
  (`novo.cor ?? antiga`).
- Novo `src/components/CorCliente.tsx`: `MarcadorCor` (2 bolinhas por cartão, clicar na
  ativa limpa, `aria-pressed`) + `FiltroCorCliente` (linha `Cor: Todas | Verdes (N) |
  Vermelhos (N)`, contagens seguem a busca). Nos dois modais; cartão marcado ganha borda
  e bolinha na cor; mensagem de vazio por cor ("Nenhum cliente verde.").
- Testes: +2 unidade (marca/filtra/preserva, nas duas abas) +2 smoke (marcar, filtrar e
  limpar nos dois modais).

**Validação:** `npm run typecheck` limpo, `npm test` **141/141 (11 arquivos)**,
`npm run build` OK (`dist/index.html` ~1,29 MB, 0 refs externas). Selo `v0.79.0`.

**Gotchas / decisões:**
- `String(Date.now())` como id colide se dois `adicionar*` caem no mesmo ms — nos testes
  novos, semear o localStorage com ids explícitos em vez de dois adicionar seguidos.
- Filtro de cor combina com busca textual e com as abas Todos/Não Realizados (tudo
  conjuntivo); sem cor = só aparece em "Todas".

---

<a id="v07800"></a>
## 2026-10-05 — Telefone + botão WhatsApp nos históricos (v0.78.0)

**Pedido:** (1) botão WhatsApp com símbolo nos históricos de Orçamentos e Tire Flyer
(alargar o histórico se preciso); (2) novo campo Telefone nos dois, buscável no histórico,
e o botão abre o WhatsApp Web para chamar o cliente. Decisões do usuário: telefone só
números DDD+número; botão abre só a conversa (`wa.me/<numero>`, sem texto); sem telefone
= botão desabilitado.

**Feito:**
- Novo `src/utils/telefone.ts`: `somenteDigitos` / `normalizarTelefoneParaWhats`
  (10–11 dígitos ganham `55`, igual ao `formatPhone` da aba Whats) / `temTelefoneValido`
  (12–13 dígitos) / `urlWhats` / `abrirWhats` (`window.open`, nova aba).
- `OrcamentoSalvo.telefone?` + `FlyerSalvo.telefone?`: entram na busca
  (`filtrarHistorico`, `filtrarFlyerHistorico` — `normalizarBusca` já ignora máscara) e no
  anti-duplicado (dígitos normalizados; máscara diferente não duplica).
- Entradas: `OrcamentosApp` ganha `TELEFONE (DDD + NÚMERO)` abaixo de PLACA/NOME/CONTATO
  (`type=tel`, `maxLength 20`, salva no rascunho/histórico/não-realizados, restaura ao abrir,
  fora do PNG); `TireFlyerApp` ganha TELEFONE no card CONTATO (mesmo padrão).
  Placeholder da placa voltou a `Ex.: ABC1D23 / JOÃO` (telefone tem campo próprio).
- Novo `src/components/BotaoWhats.tsx` (ícone-only, `aria-label="Chamar no WhatsApp"`):
  SVG da marca WhatsApp (lucide não tem brand icon), verde quando válido, `disabled` +
  `opacity-40` sem número. Nos dois modais, antes do Abrir; telefone exibido em verde no
  cartão; modais `max-w-3xl` → `max-w-4xl`.
- Testes: novo `tests/telefone.test.ts` (5); `historico.test.ts` +2 (busca/dedup por
  telefone); `flyer_historico.test.ts` +2; `app_smoke.test.tsx` +3 (salva/busca/wa.me nas
  duas abas, desabilitado sem número) + correção de 5 placeholders antigos
  (`placa ou item` → prefixo, por causa do novo texto com "telefone").

**Validação:** `npm run typecheck` limpo, `npm test` **136/136 (11 arquivos)**,
`npm run build` OK (`dist/index.html` ~1,29 MB, 0 refs externas). Selo `v0.78.0`.

**Gotchas / decisões:**
- `getByPlaceholderText(/51 99999-9999/)` casa 2 inputs (orçamento + flyer montados juntos)
  — no smoke usar o placeholder exato `Ex.: 51 99999-9999` do orçamento.
- Registros/backups antigos sem `telefone` = `undefined` → botão desabilitado; nada migra.
- `wa.me` é link runtime (precisa internet na hora) — não quebra a regra offline do arquivo único.

---

<a id="v07700"></a>
## 2026-10-02 — Whats: Novo Contato + Relatório um pouco mais largos (v0.77.0)

**Pedido:** Novo Contato um pouco mais largo e Relatório de Envios bem pouquinho.

**Feito:** tela `max-w-[1200px]` → `1300px` e grade `[1fr_1.3fr]` → `[1fr_1.25fr]`:
esquerda ~510px → ~567px (+57), direita ~665px → ~709px (+44). Selo `v0.77.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **124/124**, `npm run build` OK.

---

<a id="v07600"></a>
## 2026-10-02 — Relatório de Envios mais largo (v0.76.0)

**Pedido:** aumentar um pouco a largura da parte Relatório de Envios (Whats).

**Feito:** grade do Whats `lg:grid-cols-2` → `lg:grid-cols-[1fr_1.3fr]` (direita ~665px,
esquerda ~510px em 1200px). Selo `v0.76.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **124/124**, `npm run build` OK.

---

<a id="v07500"></a>
## 2026-10-02 — Whats mais estreito (v0.75.0)

**Pedido:** diminuir a largura das caixas da aba Whats (Novo Contato, Relatório, scripts).

**Feito:** `WhatsApp` `max-w-[1700px]` → `max-w-[1200px]` (o 1700 era resíduo antigo, sem
pedido de largura); `ContactForm` `xl:grid-cols-4` → 2x2 (`sm:grid-cols-2`), senão os 4
campos espremiam (~135px cada, o `date` cortava). Selo `v0.75.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **124/124**, `npm run build` OK.

---

<a id="v07400"></a>
## 2026-10-02 — Abas superiores iguais às sub-abas (v0.74.0)

**Pedido:** botões das abas superiores (Orçamentos/Tire Flyer/Whats/Dados) com o mesmo
layout e tamanhos das sub-abas.

**Feito:** abas do header `px-5 py-2.5 text-sm tracking-[0.15em]` (cinza/blue) →
`px-4 py-1 text-lg font-black uppercase` com o mesmo esquema fantasma/forte
(minimizada `bg-blue-500/10 text-blue-200 border-blue-500/20`, aberta `bg-blue-600`
branca) e `fontFamily conteudo` inline; sombra do ativo removida; renomear acompanha
(`px-3 py-1 text-lg`). Selo `v0.74.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **124/124**, `npm run build` OK.

---

<a id="v07300"></a>
## 2026-10-02 — Logo Toyota azul no tema claro (v0.73.0)

**Pedido:** no tema claro o logo branco sumia no fundo papel; trocar para azul.

**Feito:** `[data-tema='papel'] .logo-toyota` com `filter` que mapeia branco → `#2563eb`
(exato: `brightness(0)` vira preto + cadeia invert/sepia/saturate/hue-rotate/brightness/
contrast resolvida numericamente; núcleo medido (38,100,229), contraste 4.56:1 no papel).
Só vale no papel (nos escuros segue branco); sem asset novo, `img` ganhou a classe
`logo-toyota`. Smoke confere a classe. Selo `v0.73.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **124/124**, `npm run build` OK.

---

<a id="v07200"></a>
## 2026-10-02 — Tire Flyer: COPIAR PNEUS abaixo do CONTATO (v0.72.0)

**Pedido:** "Descrição para WhatsApp" com a largura e logo abaixo do CONTATO (ordem:
DADOS DA TABELA → CONTATO → descrição), no mesmo tipo de janela dos demais, chamada
"COPIAR PNEUS".

**Feito:** descrição virou `NeonCard` "COPIAR PNEUS" (`compact`, botão copiar no `actions`
com `aria-label` "Copiar pneus"/"Pneus copiados") empilhado após o CONTATO na coluna
esquerda; caixinha antiga de 750px abaixo do flyer removida (a coluna do flyer segue
só com preview + layout + download). Smoke: ordem dos títulos + copiar. Selo `v0.72.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **123/123**, `npm run build` OK.

---

<a id="v07100"></a>
## 2026-10-02 — Sub-abas: minimizada fantasma azul (v0.71.0)

**Pedido:** das 12 prévias (`ideias/sub-abas-*.png`), a escolhida foi a **03** (fantasma azul).

**Feito:** sub-aba minimizada `bg-slate-800 text-slate-300 border-slate-700` →
`bg-blue-500/10 text-blue-200 hover:bg-blue-500/20` (moldura `border-blue-500/20`, X
`text-blue-400` sem fundo); aberta segue azul forte preenchido. Selo `v0.71.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **123/123**, `npm run build` OK.

---

<a id="v07000"></a>
## 2026-10-02 — Excluir pede confirmação no histórico (v0.70.0)

**Pedido:** excluir um orçamento no histórico (Todos ou Não Realizados) deve perguntar
antes, como no Tire Flyer.

**Feito:** `handleExcluir` com `window.confirm` no `HistoryModal` (as duas abas usam a
mesma lista, então um ponto cobre as duas; botão ganhou `aria-label="Excluir orçamento"`)
e, por coerência, no `FlyerHistoryModal` (só o "Limpar tudo" confirmava lá). Smoke novo:
negar mantém, confirmar remove (nas duas abas). Selo `v0.70.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **123/123**, `npm run build` OK.

---

<a id="v06900"></a>
## 2026-10-02 — Clique simples sem pintar a célula (v0.69.0)

**Pedido:** clicar numa célula pintava ela inteira na cor do tema (estilo Excel); não
quer mais esse comportamento.

**Feito:** tinta azul (`bg-blue-600/35` + `ring`) só quando a seleção abrange 2+
células (`pintarSelecao`: arrastar/Shift+clique); clique simples/TAB/Enter = só cursor
no texto (+ anel âmbar se for a ocorrência atual da busca). Seleção lógica,
`data-selecionada`, copiar/recortar/apagar em bloco e testes de TAB intactos.
Smoke novo: clique = sem `bg-blue-600/35`; arrastar = bloco pintado. Selo `v0.69.0`
(leva junto a v0.68.0 — sub-abas mais baixas — ainda não publicada).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **122/122**, `npm run build` OK.

---

<a id="v06800"></a>
## 2026-10-02 — Sub-abas mais baixas (v0.68.0)

**Pedido:** botões das sub-abas mais curtos — menos espaço em cima/embaixo.

**Feito:** botões das sub-abas e campo renomear `py-1.5` → `py-1` (fonte `text-lg`
mantida; botão "+" `p-2.5`/ícone 16 já fica na mesma altura final). Selo `v0.68.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **121/121**, `npm run build` OK.

---

<a id="v06700"></a>
## 2026-10-02 — Scripts Pneus/Revisão sem negrito (v0.67.0)

**Pedido:** o conteúdo dentro de Script Pneus e Script Revisão não deve ficar em negrito.

**Feito:** `MessageEditor` (textarea dos dois `ScriptBox`): `font-bold` → `font-normal`
(só o conteúdo; títulos seguem `font-black`). Smoke da aba Whats confere `font-normal`
nos dois textareas. Selo `v0.67.0` (leva junto a v0.66.0 — sub-abas na medida —
ainda não publicada).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **121/121**, `npm run build` OK.

---

<a id="v06600"></a>
## 2026-10-02 — Sub-abas na medida dos títulos + botões proporcionais (v0.66.0)

**Pedido:** sub-abas com a mesma fonte/tamanho da 1ª linha das colunas; botões sem
desproporção (grandes demais para a fonte).

**Feito:** botões das sub-abas `px-6 py-2.5` → `px-4 py-1.5` (mesmo `text-lg font-black
uppercase` e vertical dos títulos `py-1.5`); renomear `px-5 py-2.5` → `px-3 py-1.5`;
"+" criar sub-aba `p-3`/Plus 18 → `p-2.5`/Plus 16 (altura próxima à dos botões).
Selo `v0.66.0` (leva junto a v0.65.0 — ordenar data + autocompletar — ainda não publicada).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **121/121**, `npm run build` OK.

---

<a id="v06500"></a>
## 2026-10-02 — Ordenar entende data + autocompletar na coluna (v0.65.0)

**Pedidos:** (1) ordenar por data saía pelo dia (`02/09` na frente de `03/09` pedindo a
mais recente); (2) ao digitar "PED" numa célula, sugerir "PEDRO" já presente na tabela.

**Feito:**
- `extrairDataPtBr` em `tabelas.ts` (DD/MM[/AAAA] [HH:MM[:SS]] e ISO; ano 2 dígitos →
  20xx; `31/02` dá null): `ordenarPorColuna` compara calendário quando os dois lados
  são data (crescente = mais antiga, decrescente = mais recente — o "mais recente" do
  usuário) e cai no `Intl.Collator numeric` caso contrário; vazios por último nos dois
  sentidos (mantido). Dicas do `OrdenarTabela` citam "data mais antiga/recente".
- Autocompletar via `<datalist>` nativo por coluna (sem JS/overlay: funciona offline,
  filtra ao digitar, Enter/click completa): `sugestoesPorColuna` (distintos da coluna,
  sem case-dup) no `th`, `list=` no input do corpo; uma datalist por coluna.
- Testes: sort cronológico (anos/meses/horas/vazio), `extrairDataPtBr` (DD/MM, ISO,
  inválidas) e smoke do datalist (2ª célula lista `PEDRO`). Selo `v0.65.0` (leva junto
  a v0.64.0 — lupa limpa sozinha — ainda não publicada).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **121/121**, `npm run build` OK.

---

<a id="v06400"></a>
## 2026-10-02 — Lupa limpa sozinha após 1 min (v0.64.0)

**Pedido:** o termo da lupa deve sumir sozinho após 1 min, no BUSCAR (Orçamentos) e no
Pesquisar nas tabelas (Dados).

**Feito:** `BUSCA_AUTO_LIMPA_MS = 60_000` em `tabelas.ts`; `DadosApp` limpa `busca` +
avisa o atalho via `dados:busca-limpa`; `AtalhosDados` limpa só o campo local (sem
`onBuscar`, para o timer nunca trocar de aba sozinho — os Dados têm o próprio timer e
limpam quase junto). Timer é por inatividade (volta a cada letra); Enter não renova.
Testes com fake timers (59s mantém, +1s limpa) nos dois campos. Selo `v0.64.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **118/118**, `npm run build` OK.

---

<a id="v06300"></a>
## 2026-10-02 — Grifo do cabeçalho alinhado + grifo na nota (v0.63.0)

**Pedido:** buscar "FACILITADA" mostrava `FACIL(FACIL)` no título da coluna (5 letras
atrasado); nas células o grifo estava correto; nas notas não grifava nada.

**Causa:** o overlay `data-grifo` é transparente com texto invisível e só o `<mark>`
aparece sobre o input. Três divergências acumulavam no cabeçalho (`text-lg font-black
uppercase`, o mais largo):
- `mark` com `px-0.5` (+4px): o texto do mark nascia 2px à direita do texto de baixo
  e empurrava o sufixo — fantasma/duplicação;
- temas Grafite/Técnico sobrescreviam `thead th input` / `tbody td input` (peso,
  `text-transform`, `letter-spacing`) mas nunca o `div[data-grifo]` — overlay mais
  largo/estreito que o input;
- input rolado (`scrollLeft/scrollTop`) sem espelhar no overlay (texto longo).

**Feito:**
- `grifarTermo` sem `px-0.5`/`rounded` no mark (largura exata do termo) + regra
  `[data-grifo] mark { padding:0; font:inherit; text-transform:inherit }` no `index.css`;
- seletores Grafite/Técnico estendidos ao `[data-grifo]` (mesmo peso/transform do input);
- `sincronizarRolagemGrifo` no `onScroll` dos inputs e textareas (overlay acompanha);
- notas ganharam overlay `data-grifo` (`whitespace-pre-wrap`, primeira ocorrência via
  `destacarTermo`, igual às células) — antes só a borda do card acendia;
- `aria-hidden="true"` nos overlays (decorativos, `pointer-events-none`).
- Regressão: `destacarTermo('FACILITADA','FACILITADA')` + smoke "cabeçalho cobre o termo
  inteiro + nota grifa o termo" (overlay do título tem `textContent` e `mark` exatos;
  mark sem `px-0.5`).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **116/116**, `npm run build` OK
(`dist/index.html` ~1,28 MB, 0 refs externas).

---

<a id="v06200"></a>
## 2026-10-01 — Resumos dos históricos em branco (v0.62.0)

**Pedido:** itens do resumo no Histórico de Orçamentos (Todos/Não Realizados) em branco e sem
negrito; conteúdo do HISTÓRICO — TIRE FLYER em branco.

**Feito:** `HistoryModal` (descrição do cartão): `text-slate-300 font-bold` →
`text-slate-100 font-normal` (grifo de busca âmbar mantido); `FlyerHistoryModal` (linha da
tabela): `text-slate-300` → `text-slate-100` (negrito mantido, como pedido). Selo `v0.62.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **114/114**, `npm run build` OK.

---

<a id="v06100"></a>
## 2026-10-01 — Grifo no lugar certo com acentos + mesma fonte do input (v0.61.0)

**Bug:** com acento antes do termo (ex.: "ÓLEO FÁCIL" buscando "facil"), o grifo saía
deslocado — `destacarTermo` usava o índice da string NFD direto no original (o comentário
"NFD mantém o comprimento" é falso: 'Ó' vira 2 unidades).

**Feito:**
- `destacarTermo` reescrito: monta a base sem acento carregando, em cada unidade, o índice
  de origem (`mapa`) e fatia o ORIGINAL por ele — vale para acento antes E dentro do termo.
  Melhora também o grifo da busca no Histórico (mesma função).
- Overlay do grifo com `font-family: var(--tema-fonte-conteudo)` inline (a regra global só
  cobre `textarea/input/select` — em temas não-Inter a sobreposição descolava do texto).
- Testes unitários com acentos + screenshot headless ("FÁCIL" exato). Selo `v0.61.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **115/115**, `npm run build` OK.

---

<a id="v06000"></a>
## 2026-10-01 — X de Dados limpa atalho + DESCRIÇÃO sem scrollbar (v0.60.0)

**Pedidos:** (1) X do "Pesquisar nas tabelas" limpar também o "buscar" dos Orçamentos;
(2) tirar a barra de rolagem de 1. DESCRIÇÃO DO REPARO (rolar só no mouse).

**Feito:**
- Novo evento `dados:busca-limpa` (tabelas.ts): X de Dados dispara, `AtalhosDados` ouve e
  zera o termo. Sem prop drilling (mesmo padrão dos outros eventos).
- DESCRIÇÃO: `scrollbar-hide` no textarea (igual ao de DADOS DO ORÇAMENTO) — a rolagem por
  mouse/roda continua, só some a barra. Selo `v0.60.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **114/114**, `npm run build` OK.

---

<a id="v05900"></a>
## 2026-10-01 — Grifo sem pintar a célula (v0.59.0)

**Pedido:** clicar na célula mostrava a célula pintada (âmbar da busca + azul da seleção em
camada dupla pelo overlay) em vez do cursor na palavra.

**Feito:** overlay 100% transparente com texto invisível (só o `<mark>` amarelo-opaco aparece,
cobrindo o termo de baixo sem fantasma); input e célula **sem nenhum fundo de busca** (só
`data-*`); ocorrência atual = só contorno `ring` + mark; overlay sem `tabIndex`/handlers
(antes o Tab parava 2x por célula e o azul duplicava). Clique = cursor no texto + tênue azul
de seleção (modelo planilha, mantido). Validado em screenshot headless.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **112/112**, `npm run build` OK.

---

<a id="v05800"></a>
## 2026-10-01 — Lupa leva o foco para os Dados (v0.58.0)

**Bug:** a lupa só pulava na 1ª letra — ao trocar de aba o campo do atalho sumia e o foco
caía no vazio: continuar digitando e dar Enter não iam para lugar nenhum.

**Feito:** efeito de `buscaDados` foca o campo "Pesquisar nas tabelas" (`refBusca`, +60ms
para a aba estar visível) — o fluxo volta a ser contínuo: digita na lupa, pula, segue
digitando e Enter avança. Teste da lupa cobre foco (`document.activeElement`) e continuação.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **112/112**, `npm run build` OK.

---

<a id="v05700"></a>
## 2026-10-01 — Lupa pula ao digitar, X limpa, grifo só no termo (v0.57.0)

**Pedidos:** (1) X do atalho não limpava; (2) atalho não pulava ao digitar como o campo de lá;
(3) célula inteira grifada — grifar só o termo.

**Feito:**
- X: era race `blur` (input) × `click` (o `setBuscando(false)` do blur desmontava o botão
  antes do clique) → `onMouseDown preventDefault` no X (mantém o foco e o clique dispara).
- Pulo ao digitar: `onBuscar(termo, passo, repor)` — `onChange` do atalho chama com
  `repor: true` (efeito em `DadosApp` sempre `handleBusca`, recomeça do 1º); Enter usa
  `repor: false` (mesmo termo avança). Validado em screenshot headless.
- Grifo no termo: overlay `absolute inset-0 pointer-events-none` (`data-grifo`) com `<mark>`
  (via `destacarTermo`, sem quebrar acentos) sobre o input — o input segue montado e
  funcional (editar, TAB, seleção, copiar, `data-marcado/atual` intactos); atual mantém fundo
  forte. Testes do smoke quase intactos (só o fluxo da lupa, que mudou de propósito).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **112/112**, `npm run build` OK.

---

<a id="v05600"></a>
## 2026-10-01 — Lupa do atalho avança no Enter + feedback ao digitar (v0.56.0)

**Pedidos:** (1) Enter na lupa ficava só no 1º termo (no "Pesquisar nas tabelas" o Enter pula
para o próximo); (2) sem feedback ao digitar se o termo existe.

**Feito:**
- `buscaDados` ganhou `passo` (`App.buscarNosDados(termo, passo)`; atalho manda Shift+Enter
  como −1); o campo do atalho **não fecha mais no Enter** (só Esc/blur; X limpa) e a lupa
  **não apaga o termo ao abrir** — fluxo de Enter repetido.
- Efeito em `DadosApp`: termo **novo** (por `normalizarBusca`) = `handleBusca` (vai ao 1º);
  **mesmo termo** = `irParaOcorrencia(passo)` (avança/volta, igual ao campo de lá).
- Contador ao vivo no atalho (`listarOcorrencias` no `dados` já assinado): `N · X em ABA`
  em verde, ou "Nada encontrado" em cinza.
- Teste da lupa estendido (2 ocorrências, contador, Enter avança, Shift+Enter volta).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **111/111**, `npm run build` OK.

---

<a id="v05500"></a>
## 2026-10-01 — Faixa 164px + lupa pesquisa nos Dados (v0.55.0)

**Pedidos:** (1) botões do atalho só um pouco mais largos; (2) lupa como 1º botão, fazendo o
mesmo que "Pesquisar nas tabelas" e levando da aba Orçamentos ao termo nos Dados.

**Feito:**
- Faixa 148px → **164px** (grade `1fr 569px` → **`1fr 601px`**, `main` 1110px → **1125px**;
  esquerda segue ~424px).
- `AtalhosDados` com `onBuscar`: 1º botão (**BUSCAR** + lupa) vira campo inline (Enter confirma
  e navega, Esc/blur cancela, X limpa); `App.buscarNosDados` troca para `dados` e passa
  `buscaDados {termo, vez}` → `DadosApp` aplica `handleBusca` (abre a sub-aba do 1º resultado,
  grifa, e o termo fica no campo de lá para percorrer com Enter). Gotcha: `aria-label`
  "Pesquisar nas tabelas" colidia com o botão do histórico do flyer (`/Pesquisar/i` casa com
  abas montadas mas ocultas) — virou **"Buscar termo nos Dados"**.
- Teste novo cobre o fluxo (termo só em O.S's, estando em PEÇAS: abre O.S's + `data-atual`).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **111/111**, `npm run build` OK.

---

<a id="v05400"></a>
## 2026-10-01 — Esquerda ~425px + faixa 148px (v0.54.0)

**Pedido:** esquerda mais estreita de novo; botões de atalho mais largos de novo.

**Feito:** faixa 132px → **148px** (grade `1fr 569px` → **`1fr 585px`**), `main` 1130px →
**1110px**; esquerda vai de ~461px para **~425px**. Selo `v0.54.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **110/110**, `npm run build` OK.

---

<a id="v05300"></a>
## 2026-10-01 — Tabela preenche o cartão, sem vão à direita (v0.53.0)

**Bug:** com poucas colunas, a tabela (largura fixa = soma das colunas) era mais estreita que
o cartão e a sobra à direita parecia "uma coluna fantasma".

**Feito:** tabela e barra de baixo com `width: 100%` + `minWidth: larguraTotal` (soma das
colunas + 92px de ações) — preenchem o cartão; se passar, rola como antes. `table-layout`
segue `fixed` (testei `auto` no Chrome headless: render idêntico aqui, e o `fixed` mantém o
resize por arrasto exato). Efeito colateral conhecido: com poucas colunas a coluna de ações
também estica (células continuam centralizadas).
Validado com screenshot headless (playwright-core + chromium do cache, seed via
`addInitScript`, depois removidos): tabela 860px = cartão 862px (antes 432px).
Teste da barra agora confere `width: 100%` + `minWidth 432px`. Selo `v0.53.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **110/110**, `npm run build` OK.

---

<a id="v05200"></a>
## 2026-10-01 — Botões subir/descer tabela na aba Dados (v0.52.0)

**Pedido:** botão para mover as tabelas para cima/baixo, mudando a ordem (as notas já tinham
arrastar pela alça; tabelas não tinham como trocar de lugar).

**Feito:**
- Novo `moverBloco(dados, abaId, blocoId, ±1)` puro em `tabelas.ts` (troca com o vizinho na
  `ordem`; nas bordas não faz nada; vale para tabela ou nota).
- Barra de baixo da tabela: `+` à esquerda e, à direita, **subir / descer / excluir**
  (`ChevronUp`/`ChevronDown`, `aria-label` "Mover tabela para cima/baixo", `disabled` com
  `opacity-30` nas bordas). A barra segue com a largura da tabela.
- Testes: ajuste no da barra (botões agora num `span` dentro dela + presença do subir/descer)
  e novo teste (2 tabelas, trava nas bordas, sobe a 2ª, desce de volta). Gotcha: `textContent`
  de `tbody` não inclui valor de `<input>` — ler `.value` dos inputs.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **110/110**, `npm run build` OK.

---

<a id="v05100"></a>
## 2026-10-01 — Esquerda ~461px (v0.51.0)

**Pedido:** estreitar mais um pouco 1. DESCRIÇÃO / 2. DADOS.

**Feito:** `main` de orçamentos 1170px → **1130px** (grade segue `1fr 569px`); esquerda vai de
~501px para **~461px**. Selo `v0.51.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **109/109**, `npm run build` OK.

---

<a id="v05000"></a>
## 2026-10-01 — Esquerda ~501px + faixa 132px (v0.50.0)

**Pedido:** esquerda um pouco mais estreita; botões de atalho um pouco mais largos.

**Feito:** faixa 116px → **132px** (botões `px-4`), grade `1fr 553px` → **`1fr 569px`**,
`main` 1190px → **1170px**; esquerda vai de ~537px para **~501px**. Selo `v0.50.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **109/109**, `npm run build` OK.

---

<a id="v04900"></a>
## 2026-10-01 — Coluna esquerda bem mais estreita (v0.49.0)

**Contexto:** o selo v0.48.0 provou que o usuário estava no arquivo novo — as diferenças de
20px (v0.47.0) eram sutis demais para perceber. Pedido: estreitar de forma visível.

**Feito:** `main` de orçamentos 1280px → **1190px** (grade segue `1fr 553px`); coluna
1. DESCRIÇÃO / 2. DADOS vai de ~627px para **~537px** (−90px). Selo agora `v0.49.0`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **109/109**, `npm run build` OK.

---

<a id="v04800"></a>
## 2026-10-01 — Selo de versão no cabeçalho (v0.48.0)

**Contexto:** usuário reportou 2x que "não mudou nada" (v0.47.0) mesmo com o release correto
(conferido: bytes idênticos ao build, com as mudanças dentro). Hipótese: abrindo arquivo
antigo/cache — sem versão visível, impossível confirmar.

**Feito:**
- Novo `utils/versao.ts` (`VERSAO`, espelho manual do package.json) + selo `vX.Y.Z` discreto
  no header ao lado de "Gestão de Vendas" (`text-[10px] text-slate-600`, com `title`).
- Regra: bump de versão = package.json + `VERSAO` juntos.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **109/109**, `npm run build` OK.

---

<a id="v04700"></a>
## 2026-10-01 — Coluna esquerda mais estreita + botões de atalho maiores (v0.47.0)

**Pedido:** diminuir a largura de 1. DESCRIÇÃO DO REPARO / 2. DADOS DO ORÇAMENTO e aumentar um
pouquinho os botões do SUB ATALHOS.

**Feito:**
- Grade: `1fr 533px` → **`1fr 553px`** (faixa 96px → **116px**); coluna esquerda vai de ~647px
  para **~627px** (main segue 1280px).
- Botões: `px-2 py-2 text-xs` → **`px-3 py-2.5 text-sm`**, ícone 12 → 14, título `text-[10px]`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **109/109**, `npm run build` OK.

---

<a id="v04600"></a>
## 2026-10-01 — Faixa de atalhos fora da largura dos cards (v0.46.0)

**Pedido:** APROVADO E DESCONTO com a **mesma largura do 3. AJUSTES MANUAIS**; a faixa não pode
roubar largura do card (a página tem que acomodar, não o card).

**Feito:**
- Coluna direita virou linha: **pilha** `xl:w-[425px]` (APROVADO + AJUSTES + RESUMO, todos com
  a mesma largura) + **faixa de 96px ao lado** da pilha (top-alinhada). `self-stretch` na pilha
  mantém o `mt-auto` do RESUMO funcionando.
- Página de orçamentos: `main 1180px` → **1280px**, grade `1fr 425px` → **`1fr 533px`**
  (425 + 12 + 96); coluna esquerda vai de ~633px para ~647px (diferença irrelevante).
- Abaixo de `xl` continua fluido/empilhado como antes.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **109/109**, `npm run build` OK.

---

<a id="v04500"></a>
## 2026-10-01 — APROVADO E DESCONTO com largura original + faixa ao lado (v0.45.0)

**Pedido:** os atalhos ao lado estreitaram o card; o card deve manter a largura original.

**Feito:**
- Página de orçamentos: `main max-w-[1050px]` → **`1180px`** e grade da direita
  `xl:grid-cols-12 (8/4)` → **`xl:grid-cols-[minmax(0,1fr)_425px]`**; card APROVADO fixo em
  **`xl:w-[317px]`** (= os 4/12 de antes) e faixa de atalhos em 96px — o espaço extra veio do
  alargamento da página, não do card (a coluna esquerda vai de ~633px para ~655px).
- Abaixo de `xl` (empilhado) continua fluido como antes.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **109/109**, `npm run build` OK.

---

<a id="v04400"></a>
## 2026-10-01 — SUB ATALHOS ao lado do APROVADO E DESCONTO (v0.44.0)

**Pedido:** atalhos à **direita** do card APROVADO E DESCONTO (estavam abaixo dele), podendo
diminuir a largura dos botões.

**Feito:**
- `OrcamentosApp`: card APROVADO + `AtalhosDados` numa linha `flex` (`flex-1 min-w-0` no card,
  faixa `w-[104px] shrink-0` nos atalhos, `items-start`).
- `AtalhosDados`: botões compactos (`px-2 py-2 text-xs`, ícone 12, título `text-[9px]`);
  nomes longos truncam com `title` (tooltip) — `aria-label`s inalterados, testes intactos.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **109/109**, `npm run build` OK.

---

<a id="v04300"></a>
## 2026-10-01 — Lembrete menor/todo clicável + SUB ATALHOS p/ sub-abas de Dados (v0.43.0)

**Pedidos:** (1) janelinha do lembrete menor e inteiramente clicável; (2) na aba Orçamentos,
botões de atalho (lado do APROVADO E DESCONTO, fora das caixas) para cada sub-aba de Dados.

**Feito:**
- `LembreteContatos`: menor (`p-4`, ícone 24, nomes `text-lg`, `max-w-[240px]`) e a área toda
  virou `role="button"` (com Enter/Espaço) levando ao 1º contato da lista; cada nome continua
  levando ao seu (`stopPropagation`; a área externa é `div`, então sem botão aninhado). O X
  dispensa como antes.
- `SUB ATALHOS` (`components/AtalhosDados.tsx`, sem caixa — só titulozinho `text-[10px]` +
  botões `w-full` empilhados com `aria-label="Ir para sub-aba X"`): lê `lerDados()` e se
  atualiza via evento `dados:atualizados` (novo em `tabelas.ts`, disparado no persist do
  `DadosApp`) + `storage` entre janelas — nova sub-aba (ex.: SENHAS, MEMÓRIA) vira botão sozinha.
- Navegação: `App.irParaSubAbaDados` troca para `dados` e passa `subAba {id, vez}` →
  `DadosApp` abre a sub-aba (com guarda para id inexistente). Fica logo abaixo do card
  APROVADO E DESCONTO, antes de AJUSTES MANUAIS.
- Testes: ajuste nos 2 do lembrete (agora 2 botões por contato) + novo dos atalhos (3 sub-abas
  semeadas, clica MEMÓRIA e confere ativa em azul).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **109/109**, `npm run build` OK.

---

<a id="v04200"></a>
## 2026-10-01 — Lembrete global vinculado aos contatos de hoje (v0.42.0)

**Pedido:** descartar o lembrete mensal (v0.41.0); o aviso deve (1) disparar pela **data do
contato** no Relatório de Envios, (2) **levar até o contato** ao clicar e (3) aparecer em
**todas as abas**.

**Feito:**
- Novo `whats/utils/contatosHoje.ts`: `lerContatos` (lê `zap_contacts` sem depender do state
  da aba), `contatosParaHoje` (data = hoje e não concluído no mês) e evento `zap:contatos`
  (o `storage` event não avisa a própria janela, então a aba Whats o dispara ao salvar).
- Novo `components/LembreteContatos.tsx` renderizado no `App` (fora das abas): lista cada
  contato de hoje como botão + X que dispensa até a lista mudar.
- Clique: `App` troca para `whats` e passa `destaque {id, vez}` → `ContactList` rola até
  `[data-contato-id]` e acende o cartão em azul por ~4s (`data-destaque="1"`).
- Removidos `whats/utils/lembrete.ts`, `LembreteDisparo.tsx` e `zap_lembrete_v1` do backup
  (backups antigos que tenham a chave são ignorados sem erro).
- Testes: 2 novos (avisa em qualquer aba + navega/destaca; concluído/outra data não dispara
  + dispensar) e ajuste no "cadastra contato" (nome aparece no cartão e no aviso).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **108/108**, `npm run build` OK.

---

<a id="v04100"></a>
## 2026-10-01 — Lembrete de disparo configurável na aba Whats (v0.41.0)

**Pedido:** o aviso "HOJE É DIA 01 · Disparar Agora!" era fixo no dia 01; tornar configurável
(dia + texto + liga/desliga).

**Feito:**
- Novo `whats/utils/lembrete.ts` (`zap_lembrete_v1`): `{ dia, titulo, mensagem, ativo }`
  (padrão = dia 1, textos atuais, ativo); `lerLembrete` mescla salvo + padrão e limita o dia a
  1–31.
- Novo cartão `whats/components/LembreteDisparo.tsx` na coluna esquerda da aba Whats (abaixo
  dos scripts): Dia do mês (number 1–31), Título, Mensagem e checkbox Ativo (padrão `Caixinhas`).
- `WhatsApp.tsx`: pop-up usa `lembrete.ativo && hoje === lembrete.dia` e os textos salvos;
  persiste via `salvarLembrete` e sincroniza entre abas (`storage` event, como os scripts).
- `zap_lembrete_v1` entrou no backup geral (`CHAVES_BACKUP`).
- 2 testes novos no smoke (config salva no localStorage; pop-up aparece no dia com `vi.setSystemTime`
  e some quando desligado).

**Gotchas:** dia 29–31 não existe em todo mês — nesses meses o aviso simplesmente não pula;
a dica está no próprio cartão. `getByLabelText` com `<label htmlFor>` + `aria-label` no mesmo
input resolve para um único controle (sem duplicidade).

**Validação:** `npm run typecheck` limpo, `npx vitest run` **108/108**, `npm run build` OK.

---

<a id="v04000"></a>
## 2026-10-01 — Histórico mostra os itens em duas linhas (v0.40.0)

**Pedido:** no Histórico da aba Orçamentos (abas TODOS e NÃO REALIZADOS), o resumo dos itens
aparecia numa linha só; mostrar em **duas linhas**.

**Feito:**
- `HistoryModal.tsx`: resumo da descrição no cartão (`descReparo` unida com ` · `):
  `truncate` (1 linha) → **`line-clamp-2`** (até 2 linhas, com reticências). Preços
  (Revisão/Peças/Serviços/Bruto) continuam logo abaixo, inalterados.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **106/106**, `npm run build` OK.

---

<a id="v03900"></a>
## 2026-10-01 — Títulos internos padrão NeonCard + sub-abas Dados padrão cabeçalho (v0.39.0)

**Pedido:** títulos **ORÇAMENTOS, TIRE FLYER, PAINEL WHATSAPP, DADOS** no mesmo tamanho/fonte de
**DESCRIÇÃO DO REPARO**; sub-abas da aba **DADOS** no mesmo tamanho/fonte dos títulos das colunas
das tabelas.

**Feito:**
- 4 `TituloEditavel` internos (`OrcamentosApp`, `TireFlyerApp`, `WhatsApp`, `DadosApp`):
  `text-2xl tracking-tighter` → **`text-xl tracking-widest`** (igual ao `h3` do `NeonCard`
  "1. DESCRIÇÃO DO REPARO"; ambos já usam `titulo-tema`, então a fonte do tema continua igual;
  só tamanho/tracking mudaram — cor/estilo `acento`/`duas-cores`/`simples` preservados).
- Sub-abas em `DadosApp`: botão `text-base tracking-widest` → **`text-lg` sem tracking** +
  `style={{ fontFamily: 'var(--tema-fonte-conteudo)' }}` (igual ao `input` do `thead th`:
  `text-lg font-black uppercase` com a fonte de conteúdo do tema; botões não herdam a regra
  global `textarea,input,select`, por isso o inline). Input de renomear da sub-aba também
  `text-base tracking-widest` → `text-lg` (input já tem a fonte de conteúdo via CSS global).
- Teste `app_smoke`: expectativa do título `text-2xl` → `text-xl`.

**Validação:** `npm run typecheck` limpo, `npx vitest run` **106/106**, `npm run build` OK
(dist/index.html ~1,27 MB autocontido).

---

<a id="v03800"></a>
## 2026-09-29 — Títulos das abas menores + lista desliga removendo a bolinha (v0.38.0)

**Pedidos:** (1) os títulos **ORÇAMENTOS, TIRE FLYER, PAINEL WHATSAPP e DADOS** com fonte menor;
(2) clicar de novo no **ícone de lista** numa linha que já tem a bolinha deve **removê-la**.

**Feito:**
- Títulos das 4 abas (os `TituloEditavel` de cada tela): `text-3xl` → **`text-2xl`** (30 → 24px).
- `alternarListaNota`: quando o modo lista está ativo e a linha do cursor já tem `•`, o clique
  agora **tira a bolinha** (`linha.replace(/^(\s*)•\s?/, '$1')`) e desliga o modo, em vez de só
  desligar; o caret fica em `pos - 2` (ou no começo da linha) e o textarea volta ao foco.

**Validação:** typecheck/lint limpos; **106 testes** (o smoke confere `text-2xl` no título e a
sequência clicar-lista → `• conferir freio`, clicar de novo → `conferir freio`, reativar → `• …`);
build autocontido; Chromium headless: títulos **24px** nas 4 abas e `COM LISTA "• conferir freio"`
/ `SEM LISTA "conferir freio"`.

<a id="v03700"></a>
## 2026-09-29 — Lista da nota na linha do cursor + barra maior (v0.37.0)

**Pedidos:** (1) o ícone de lista deve criar a bolinha **na linha onde está o cursor** (não numa
linha abaixo); (2) **com uma linha selecionada**, a bolinha tem que entrar **nessa linha** (estava
aparecendo duas linhas abaixo da última); (3) **aumentar minimamente** a barra de ferramentas da
nota (rótulo "NOTA …" + botões).

**Feito (`DadosApp.tsx`):**
- `alternarListaNota` agora lê `selectionStart` do textarea (mesmo sem foco, o valor persiste),
  acha a **linha do cursor/seleção** (`lastIndexOf('\n', pos-1)+1` até o próximo `\n`) e insere
  `• ` **no começo dessa linha**; o caret vai para depois da bolinha (`inicioLinha + 2`, com
  `focus()`). Se a linha já é um item, o clique só garante o modo lista (ou **desliga**, se já
  estiver ativo). O Enter continua criando o próximo item e o item vazio encerra.
- Barra da nota: `px-2.5 py-2` (era `px-2 py-1.5`), alça `p-1` e botões `p-1.5` (eram `p-0.5`/
  `p-1`) — só engorda a barra, sem mexer nos ícones de 12px.

**Validação:** typecheck/lint limpos; **106 testes** (o smoke da nota agora seleciona a 1ª linha
e clica na lista esperando `• conferir freio` na própria linha, deixa o Enter criar o item de
baixo e encerrar no item vazio; copiar confere o texto da lista); build autocontido; Chromium
headless: cursor na 2ª linha → `primeira linha\n• segunda linha`; seleção da 1ª → `• primeira
linha\n• segunda linha`; Enter no fim → `…\n• `; barra com **31px** de altura.

<a id="v03600"></a>
## 2026-09-29 — Clique edita a nota e alça de 6 pontinhos reordena (até entre tabelas) (v0.36.0)

**Pedidos:** (1) clicar dentro da nota deve colocar o **cursor de edição no ponto clicado**;
(2) um botão/ícone de **6 pontinhos** para arrastar a nota e trocar a ordem, inclusive
**colocando entre duas tabelas ou acima de uma tabela**.

**Feito:**
- **Clique edita**: a nota agora tem **um textarea sempre montado** (`readOnly={!editando}` +
  `onFocus → setEditandoNota`), então o clique posiciona o caret nativamente no ponto clicado e
  já libera a digitação (validado: clique no fim de "Primeira nota" → `selectionStart 13` e o
  texto digitado entrou ali). O lápis continua alternando (foca/desfoca) e o `<p>` de leitura
  saiu; o vazio virou `placeholder="(vazia)"`.
- **Reordenação por blocos**: `AbaDados` ganhou **`ordem: string[]`** (ids de tabelas + notas
  misturados). `criarTabela`/`criarNota` acrescentam o id, `removerTabela`/`removerNota` tiram,
  e `normalizarOrdem` no `lerDados` descarta ids mortos e anexa o que não tem posição
  (compatível com dados antigos). O `DadosApp` agrupa blocos consecutivos de notas numa linha
  `flex-wrap` (tabelas viram cards entre eles).
- **Arrastar**: alça `GripVertical` (`data-alca-nota`, `draggable`) no header da nota; o card
  inteiro é imagem do drag (`setDragImage`). Cada bloco (nota **e tabela**) tem
  `onDragOver/onDragLeave/onDrop` (destaque `ring` azul; a nota arrastada fica `opacity-50`).
  `moverNota(dados, abaId, notaId, destinoId)` reordena `ordem` por splice — arrastar para cima
  solta antes do alvo, para baixo solta depois (DnD clássico), permitindo acima/entre tabelas.

**Validação:** typecheck/lint limpos; **106 testes** (+1 puro do `moverNota` cobrindo acima/entre
as duas tabelas, ids inexistentes e `ordem` no criar/remover/migrar; smoke reescrito: clique →
`readOnly=false` e edição, lista, copiar, resize, **drag da 1ª nota na 2ª**, **drop da nota na
tabela** (nota passa a vir antes no DOM), busca com `data-atual`, borracha, fechar); build
autocontido; Chromium headless: clique no fim da linha deixou o caret em 13 e digitou ali, e o
`dragTo` da 2ª nota na tabela resultou em `["n2","TABELA","n1"]`.

**Gotchas:**
- Ao reordenar, o grupo `flex-wrap` das notas troca de key (primeiro id) e o DOM remonta — em
  teste, **re-consultar** o textarea/botões depois de arrastar (referências antigas ficam
  destacadas). Sem perda de dados (o estado mora no React).
- `dragTo` do Playwright não funciona no meio da cadeia se o alvo casar um card escondido da
  outra aba — usar um alvo visível (ex.: `table`) e deixar o evento borbulhar até o card.

<a id="v03500"></a>
## 2026-09-29 — Nota sem negrito, ícone de lista e DESCRIÇÃO = DADOS DO ORÇAMENTO (v0.35.0)

**Pedidos:** (1) o texto da **nota** sem negrito, como as células das tabelas; (2) novo **ícone
de lista** na nota (bolinha no início dos itens; clicar mostra a bolinha e **Enter cria o item
de baixo**); (3) o conteúdo de **DESCRIÇÃO DO REPARO** com o **mesmo tamanho de fonte** de DADOS
DO ORÇAMENTO (“são parentes”).

**Feito:**
- **Notas**: tirei o `font-bold` do `<textarea>` e do `<p>` (leitura e edição) — texto em peso
  normal (400), igual às células do tema Técnico.
- **Lista na nota**: botão `List` no header (antes do lápis, verde quando ativo). Ao clicar,
  entra em edição e **acrescenta `• `** no fim (nova linha se preciso); com o modo lista ligado,
  o `onKeyDown` do textarea intercepta Enter e insere `\n• ` no cursor (cursor reposicionado com
  `setTimeout(0)`); Enter num item vazio (`•`) remove a bolinha e **encerra o modo lista**.
  Estado `listaNota` (uma nota por vez), limpo no fechar da nota; Shift+Enter segue normal.
- **Orçamentos**: textarea de DESCRIÇÃO DO REPARO `text-xl` → **`text-lg`**, o mesmo de DADOS DO
  ORÇAMENTO (18px).

**Validação:** typecheck/lint limpos; **105 testes** (o smoke da nota confere `font-bold` fora,
`Conferir freio de mão\n• ` ao clicar na lista, Enter criando `\n• ` e Enter no item vazio
encerrando; o smoke inicial confere os dois textareas com `text-lg`); build autocontido; Chromium
headless: 18px = 18px nos dois campos, peso 400 na nota e a sequência de itens
(`• trocar óleo`, `• alinhar pneus`, bolinha extra removida no fim).

<a id="v03400"></a>
## 2026-09-29 — Notas na aba Dados, data antes do nome e fonte da descrição (v0.34.0)

**Pedidos:** (1) a **descrição para WhatsApp** deve usar a mesma fonte (nome/estilo/tamanho) do
conteúdo de **DADOS DA TABELA**; (2) no Relatório de Envios a **data vem antes do nome**;
(3) **"CRIAR TABELA"** vira botão **ícone-only** e nasce um botão ao lado para criar uma **nota**
(caixa), redimensionável **arrastando as bordas**, com **copiar, editar, borracha (limpar) e
fechar**, e o conteúdo das notas **entra na lupa**.

**Feito:**
- **Descrição**: `<pre>` com `text-lg leading-relaxed` e `fontFamily: var(--tema-fonte-conteudo)`
  inline. ⚠️ O CSS global (sem `@layer`) de `textarea/input/select` vence o `.font-mono` do
  Tailwind 4 — por isso a textarea de DADOS DA TABELA renderiza **Inter**, não mono; medido
  **18px / 400 / Inter** iguais nos dois.
- **Whats**: a badge de data (com o `input date`) virou o **primeiro item da linha 1**, antes do
  nome ("10/10/2026JOAO DA SILVA").
- **Dados — notas**: `NotaDados` em `AbaDados.notas` (dentro de `dados_tabelas_v1`, já no
  backup): `criarNota`, `atualizarTextoNota` (borracha = texto vazio), `atualizarTamanhoNota`
  (limites `NOTA_LARGURA_*`/`NOTA_ALTURA_*`), `removerNota` + normalização no `lerDados`
  (registros antigos viram `notas: []`). UI: botão **StickyNote** ao lado do "Criar tabela"
  (agora **ícone-only**, `aria-label` mantém os testes), caixas com `data-nota`, header com
  **copiar/editar (vira v)/borracha/x**, edição em `textarea` (salva a cada mudança) e leitura em
  `<p>`, **handles** de borda direita/baixo/canto (cursor resize; delta `/0.75` pelo `ui-compacta`)
  e destaque `data-atual`/âmbar quando a lupa acha. `listarOcorrencias` ganhou o tipo `nota`
  (`tabelaId/linha/coluna` agora opcionais) — a busca conta, o Enter navega e rola até ela.

**Validação:** typecheck/lint limpos; **105 testes** (+1 puro: criar/escrever/redimensionar com
limites/limpar/remover, `listarOcorrencias` com nota e `notas: []` na migração; +1 smoke: criar,
escrever, copiar, redimensionar (340→440px com zoom compensado), buscar (1 de 1 + `data-atual`),
limpar e fechar); build autocontido (1.265 kB); Chromium headless: botões de 30px sem texto, nota
seguindo o mouse no resize, `data-atual=1` na busca e fontes Inter/18/400 idênticas.

**Gotchas:**
- CSS sem `@layer` vence as utilities do Tailwind 4 — para a fonte "idêntica", usei o mesmo token
  `--tema-fonte-conteudo` inline em vez de classes.
- O resize da nota compensa o zoom .75 igual ao das colunas: a borda acompanha o ponteiro 1:1.

<a id="v03300"></a>
## 2026-09-29 — Enter na última linha da tabela cria linha nova (v0.33.0)

**Pedido:** na tabela Dados, dar **Enter na última linha** (em qualquer coluna) deve **abrir uma
linha nova** (antes não fazia nada, pois `moverSelecao('baixo')` parava na borda).

**Feito (`DadosApp.tsx`)**: no handler do Enter, se `!shiftKey && r === tabela.linhas.length - 1`,
faz `setDados(adicionarLinha)`, `setSelecao` para `(r+1, c)` e foca o input novo via
`setTimeout(0)` + `refsCelulas` (o ref só existe depois do render). Shift+Enter na última linha
continua apenas voltando (não cria).

**Validação:** typecheck/lint limpos; **103 testes** (o smoke do TAB/Enter ficou `async` e agora
dá Enter na última linha esperando 8 células (4×2) e o foco na nova (coluna 2) com
`data-selecionada`); build autocontido (1.258 kB); Chromium headless: 2 → 3 linhas e a célula
nova focada (linha 2, coluna 1, vazia).

**Gotcha:** o `vi.waitFor` deixou o arquivo vivo além dos `setTimeout` do app e apareceram 6
erros "unhandled" de `scrollIntoView` (jsdom não implementa) — resolvido com o stub
`Element.prototype.scrollIntoView ??= () => {}` no topo do `app_smoke.test.tsx`.

<a id="v03200"></a>
## 2026-09-29 — Itens do orçamento com valores/resumo e descrição do flyer (v0.32.0)

**Pedidos:** (1) no histórico (não realizados), embaixo da janela de itens, a soma de
**aprovado, não aprovado, percentual (aprovado) e total**; (2) **valor de cada id no canto
direito da descrição** em ITENS DO ORÇAMENTO; (3) ITENS DO ORÇAMENTO com a **mesma fonte do
título HISTÓRICO**; (4) no Tire Flyer, abaixo do flyer e **na mesma largura do PNG (750px)**,
uma **caixinha com a descrição** (medida + marcas com 10x e à vista) e **botão copiar** para
mandar no WhatsApp — com a bolinha **•**.

**Feito:**
- **`resumoAprovacao` (puro, `quoteLogic`)**: valor por id + aprovado, não aprovado, percentual
  e total (ids em `naoRealizados` = não aprovados). O `HistoryModal` recalcula o registro aberto
  com `processQuote` (useMemo) e usa no rodapé do `data-janela-itens`; cada linha ganhou o valor
  `R$ …` com `ml-auto` (riscado/vermelho quando não aprovado) e o título virou `text-xl` (igual
  ao "HISTÓRICO"; era `text-[26px]`).
- **`montarDescricaoWhats` (puro, `tire/utils/descricaoWhats.ts`)**: `MEDIDA PNEU: …`, linha em
  branco e uma linha por marca no formato `• MARCA - R$ 10x (em até 10x no Cartão) ou R$ à
  vista (Dinheiro, Pix, Débito).` (preços com `formatarPreco`). A caixinha no `TireFlyerApp`
  (`max-w-[750px]`, título "Descrição para WhatsApp") tem botão de copiar com feedback verde.

**Validação:** typecheck/lint limpos; **103 testes** (+2 puros do `resumoAprovacao`, +1 do
`montarDescricaoWhats`, +1 smoke do histórico conferindo valores 2.203,04 / 209,60 / 217,00 e
resumo 426,60 · 2.203,04 · 16% · 2.629,64, +descrição/copiar no smoke do flyer); build
autocontido (1.258 kB); Chromium headless: título 20px = HISTÓRICO 20px, resumo correto, caixinha
com **562px na tela = 750px CSS** (zoom .75) e clipboard com o texto da descrição.

<a id="v03100"></a>
## 2026-09-29 — Abas sem contagem, títulos no tamanho do orçamento e células menores (v0.31.0)

**Pedidos:** (1) na aba Dados, **tirar a quantidade de tabelas** do lado do nome da sub-aba
("PEÇAS (1)" → "PEÇAS"); (2) **Novo Contato** e **Relatório de Envios** com a mesma fonte do
título **"DESCRIÇÃO DO REPARO"**; (3) **diminuir um pouco a fonte do conteúdo das células** e,
junto, a altura das células (sem espaços em branco).

**Feito:**
- **Dados**: o botão da sub-aba mostra só `{a.rotulo}` (saiu `({a.tabelas.length})`).
- **Whats**: `<h2>` do Novo Contato `text-2xl` → **`text-xl`** e o do Relatório de Envios
  `text-3xl` → **`text-xl`** — igual ao `h3` do NeonCard ("1. DESCRIÇÃO DO REPARO", 20px).
- **Células**: input do corpo `text-lg`/`px-3 pr-9` → **`text-base`/`px-2.5 pr-8`** (cabeçalho
  fica `text-lg`). Linha real caiu de ~37px para ~33px; 16px de fonte.

**Validação:** typecheck/lint limpos; **99 testes** (o smoke da aba Dados agora exige "PEÇAS"/
"O.S'S" sem contagem — `queryByRole(/PEÇAS \(/)` nulo — e o da célula confere `text-base`);
build autocontido (1.254 kB); Chromium headless: fontes medidas **20px = 20px = 20px**
(DESCRIÇÃO DO REPARO / Novo Contato / Relatório de Envios), abas `["PEÇAS","O.S'S"]` e célula
16px com linha 25px no zoom (33 reais).

<a id="v03000"></a>
## 2026-09-29 — Whats: janelinhas de observação e mensagem no cartão (v0.30.0)

**Pedido:** no Relatório de Envios, criar um **ícone para a observação** e um **ícone para a
mensagem**, entre o status (Agendado/Hoje/…) e o botão de telefone/chassi; clicando, abre uma
**janelinha** com o conteúdo, com **lápis** (editar), **v** (confirmar), **x** (fechar) e
**copiar** — todos bem pequenos.

**Feito (`ContactList.tsx`):**
- Ícones `StickyNote` (observação) e `MessageSquare` (mensagem) na linha 1, **entre o badge de
  situação e o `List` (telefone/chassi)**; ficam coloridos quando o campo tem conteúdo (azul /
  esmeralda) e com moldura azul quando a janelinha está aberta.
- **Janelinha** inline alinhada à direita (`ml-auto w-80`, borda + sombra): modo leitura mostra o
  texto (ou "Sem observação." / "Se vazio, usa o script de revisão…") e um header com os
  botõezinhos `p-1`/ícones `size 12`: **Pencil** → textarea (autoFocus) com **Check** para salvar
  via `onUpdateNote`/`onUpdateMessage`, **Copy** (verde por 2s; na mensagem vazia copia o
  `messageTemplate`) e **X** para fechar. Estado `popup {id, campo}`, `editando`, `rascunho`,
  `copiadoPopup` — uma janelinha por vez, abrir de novo alterna.
- **Saíram** os dois textareas inline de observação/mensagem (o cartão fechado agora tem só a
  linha 1: nome + situação + ícones + data). O `data-neon-box`/overflow do painel não atrapalha
  porque a janelinha é inline (não é dropdown absoluto, que seria cortado pelo `overflow-hidden`).

**Validação:** typecheck/lint limpos; **99 testes** (o smoke do Whats agora confere: sem campos
inline, ícones na linha, janelinha vazia → edita → confirma → copia → fecha, mensagem vazia copia
o script com "revisão", e `internalNote` salvo no localStorage); build autocontido (1.254 kB);
Chromium headless: ordem dos botões = status · observação · mensagem · lista · telefone · excluir ·
data, clipboard com a observação copiada, edição visível e fechamento funcionando.

**Gotchas:**
- Os botões de copiar ficaram com `aria-label` específico (**"Copiar observação"** / **"Copiar
  mensagem"**) porque já existe um "Copiar" no editor de scripts — nomes genéricos quebravam os
  testes `getByRole`.
- A janelinha é **inline** (não `absolute`): o painel do relatório tem `overflow-hidden` e cortaria
  um dropdown nas últimas linhas.

<a id="v02900"></a>
## 2026-09-28 — Flyer "MARCAS", temas removidos, técnico sem negrito e TAB/Enter (v0.29.0)

**Pedidos:** (1) no histórico do Tire Flyer, trocar "N PNEUS" por **"N MARCAS"** (a contagem é a
quantidade de marcas cotadas); (2) **remover os temas Terracota e Executivo Premium**; (3) no
**Monocromático Técnico**, tirar o **negrito do conteúdo digitado nas células**; (4) **TAB/Enter**
na tabela Dados devem levar o **destaque** junto com o foco (hoje o grifado ficava parado e só o
foco andava).

**Feito:**
- **Flyer**: campo renomeado `numPneus` → `numMarcas` (migração ao ler em
  `listarFlyerHistorico`: `numMarcas ?? numPneus ?? 0`); o modal mostra `N marca(s)`.
- **Temas**: `terracota`/`executivo` saíram do type, da lista do `ConfiguracoesTema` e os blocos
  CSS (+ imports `source-serif-4` e `fraunces`); quem tinha um deles salvo cai no **azul**
  (`TEMAS_VALIDOS`) e `claude` legado mapeia para `azul`.
- **Técnico**: `[data-tema='tecnico'] tbody td input[type='text'] { font-weight: 400 }` — só o
  corpo da tabela Dados (cabeçalho continua negrito; saídas não mudam).
- **TAB/Enter**: `moverSelecao` (direita/esquerda com quebra de linha, baixo/cima) + mapa
  `refsCelulas` (`id:linha:coluna` → input): TAB/Shift+Tab e Enter/Shift+Enter levam `setSelecao`
  de célula única **e** `.focus()`; nas bordas da tabela não move. O handler virou
  `aoTeclarCelula(e, tabela, r, c)`.

**Validação:** typecheck/lint limpos; **99 testes** (+2: migração `numPneus→numMarcas`; smoke do
TAB/Enter conferindo foco + `data-selecionada`, quebra de linha e Shift); build caiu de 1.546 kB
para **1.251 kB** (as fontes serifadas embutidas saíram); Chromium headless: menu com os **6
temas**, célula do técnico `font-weight: 400`, TAB/Enter movendo destaque + `activeElement`, e
histórico semeado com `numPneus: 4` exibindo **"4 MARCAS"**.

**Gotchas:**
- Tipo do registro antigo: `Omit<FlyerSalvo,'numMarcas'> & { numMarcas?: number; numPneus?: number }`
  — **não** usar `Partial` (deixa `id`/`criadoEm` opcionais e o TS quebra).
- O destaque e o foco agora são sempre movidos juntos; o `focus:bg-slate-900` continua para
  indicar onde se edita.

<a id="v02800"></a>
## 2026-09-28 — Dados: contador na busca; Whats: cartão compacto com lista (v0.28.0)

**Pedidos:** (1) Dados: mostrar a **quantidade de termos dentro do próprio campo de pesquisa**,
no canto direito antes do X; (2) Whats/Relatório de Envios: **remover o copiar mensagem**,
acrescentar um **ícone de lista**, mover **Agendado + lista + ligar + excluir para cima, ao lado
da data**, abrir **telefone e chassi** (copiáveis) pelo ícone de lista e **tirar telefone/chassi
de baixo da Observação**, deixando o cartão mais baixo; (3) Novo Contato: "Mensagem Especial"
vira só **"Mensagem"**. Pergunta respondida: o backup leva **tudo da aba Dados**
(`dados_tabelas_v1` está em `CHAVES_BACKUP` — sub-abas, tabelas, linhas, larguras e caixinhas).

**Feito:**
- **Dados**: o `<span>` do contador saiu de fora do campo e virou `absolute right-10` (antes do
  X, que fica em `right-3`) dentro do `div.relative` da busca; input com `pr-24`; contador com
  `max-w-[55%] truncate` e `pointer-events-none` (só `1 de 2 · 2 em PEÇAS`/“Nenhum resultado”).
  O span externo que mostrava o resumo foi removido (não duplica).
- **Whats — cartão do relatório** (`ContactList.tsx`): linha 1 ganhou o `span` de ações
  (situação, lista, notificar, excluir, data — data editável como antes); o bloco de baixo
  (telefone/chassi + copiar mensagem) saiu; `copiedId` deu lugar a `copiadoCampo`
  (`id:phone`/`id:chassis`) e ao estado `detalhesId`; o **ícone de lista** (`List`,
  `aria-label="Telefone e chassi"`) abre um painel com **telefone** e **chassi** (ou "Sem
  chassi") em botões que **copiam** com feedback verde de 2s. Cartão fechado = 2 linhas
  (nome/ações + observação/mensagem), bem mais baixo.
- **Whats — rótulos**: "Mensagem Especial" → **"Mensagem"** no formulário
  (`ContactForm.tsx`) e no cartão; o campo continua `customMessage` (dados antigos intactos).
- **Backup**: conferido que `utils/backup.ts` exporta/restaura `dados_tabelas_v1` — o backup
  geral **inclui tudo da aba Dados** (e demais chaves).

**Validação:** typecheck/lint limpos; **97 testes** (o smoke do Whats agora: sem "Mensagem
especial", sem "Copiar mensagem", lista abre e copia telefone/chassi com o clipboard mockado e
fecha de novo); build autocontido (1.546 kB); Chromium headless (1600px): cartões curtos com
ações na linha do nome, painel lista visível, `navigator.clipboard.readText()` devolveu
`51999999999`, e o contador da busca lido direto do campo = `1 de 2 · 2 em PEÇAS`.

**Gotchas:**
- O painel de detalhes usa os MESMOS botões para ver/copiar (sem modal) — mais simples e não
  quebra o tema; o chassi ausente mostra "Sem chassi" em vez de some (evita cartão “vazio”).
- O contador dentro do campo precisa de `pointer-events-none`, senão rouba o clique do X.

<a id="v02700"></a>
## 2026-09-28 — Dados: busca com Enter (N de M) + células na fonte do orçamento (v0.27.0)

**Pedidos:** (1) na busca, **Enter deve pular para a próxima ocorrência**, rolando até ela e
deixando-a evidente, com contador estilo "1 de 2"; (2) o **conteúdo das tabelas** deve ter a
**mesma fonte do conteúdo do campo "2. DADOS DO ORÇAMENTO"** (`text-lg` = 18px) — e as células
devem encolher junto (senão sobra espaço em branco ao redor do texto).

**Feito:**
- **`listarOcorrencias` (puro, `dados/utils/tabelas.ts`)**: lista as células com o termo na
  ordem da tela (títulos da tabela, depois linhas; por sub-aba e tabela) —
  `{ abaId, tabelaId, tipo, linha, coluna }`. `encontrar` passou a contar a partir dela (mesmo
  resultado de antes).
- **Enter/Shift+Enter no campo de busca** (`irParaOcorrencia`): avança/volta com wrap; se a
  ocorrência está em outra sub-aba, **troca a sub-aba**. Contador ao lado da busca:
  `N de M · X em PEÇAS · …`; sem resultado continua "Nenhum resultado". Clicar numa sub-aba
  pula para a 1ª ocorrência dela (quando há busca ativa).
- **Destaque da ocorrência atual**: `data-atual="1"` + `bg-amber-400/80 text-slate-950` com
  `ring` âmbar (bem mais forte que o grifo normal `bg-amber-500/20`); a rolagem antiga
  (`[data-marcado]`) passou a mirar `[data-atual]`.
- **Células compactas**: input das células `text-lg` (`px-3 py-1 pr-9`), cabeçalho `text-lg`
  com `px-3 py-1.5` (era `text-xl`/`px-4 py-2` e `px-4 py-2.5`), botão de copiar célula
  `right-1 p-1`. Medido no headless: fonte da célula = 18px = fonte do textarea do orçamento;
  linha 37px reais (era ~46) — o mesmo `text-lg` nas duas telas porque ambas estão sob o
  `ui-compacta` (zoom .75).

**Validação:** typecheck/lint limpos; **97 testes** (+1 puro de `listarOcorrencias` com ordem e
coordenadas; +1 smoke: digita "freio" → "1 de 2", Enter → "2 de 2" com `[data-atual]` na 2ª
célula, Enter de novo volta e Shift+Enter desfaz); build autocontido (1.546 kB); Chromium
headless: contador `1 de 2 · 2 em PEÇAS` → Enter → `2 de 2` com "FREIO TRASEIRO COMPLETO",
fontes 18px = 18px, linha 28px no zoom (37 reais) e screenshot com o destaque forte na atual.

**Gotchas:**
- O índice é **modular** (`ocorrenciaAtual % length`): editar uma célula durante a busca pode
  encurtar a lista sem quebrar a tela.
- `getByPlaceholderText` não funcionou no playwright-core 1.63 usado no teste visual (cache
  chromium-1243) — usar `locator('input[placeholder*=…]')`.

<a id="v02600"></a>
## 2026-09-28 — Dados: Ctrl+X/Delete no bloco + barra de baixo sob a última coluna (v0.26.0)

**Pedidos:** (1) **Ctrl+X não funcionava** quando havia várias células selecionadas, assim como
**deletar várias células** (Delete/Backspace); (2) o **botão de excluir tabela** deve ficar
sempre **abaixo da última coluna e linha** (não lá na direita do card quando a tabela é estreita).

**Feito:**
- **`limparBloco` (puro, `dados/utils/tabelas.ts`)**: apaga o conteúdo de um retângulo de células
  existentes; aceita coordenadas invertidas (como vêm da seleção), **não** mexe nos títulos, nas
  caixinhas nem fora do bloco, e ignora retângulos fora dos limites.
- **`aoTeclarCelula` (DadosApp)**: além do Ctrl+C, agora trata **Ctrl+X** (escreve no clipboard o
  mesmo texto do Ctrl+C e chama `limparBloco`) e **Delete/Backspace** (limpa o bloco). Com **uma
  célula só** nada é interceptado — Ctrl+C/X e Backspace/Delete continuam nativos para editar o
  texto dentro da célula. O texto do bloco saiu para o helper `textoDoBloco` (TAB entre colunas,
  Enter entre linhas).
- **Barra de baixo**: saiu de baixo do card e entrou **dentro do `overflow-x-auto`**, com
  `style={{ width: larguraTotal }}` (mesma largura da `<table>`, `border-x border-b`): o **+**
  fica sob a 1ª coluna e a **lixeira sob a última coluna**, logo abaixo da última linha; quando a
  tabela é mais larga que o card, a barra **rola junto** com ela.

**Validação:** `typecheck` + `lint` limpos (só warnings antigos); **95 testes** (+1 puro do
`limparBloco`; o smoke da seleção agora cobre Delete e Ctrl+X e garante que célula única segue
editável, e o smoke da barra confere que a largura da barra = largura da tabela); build
`dist/index.html` autocontido (1.545 kB); conferido no **Chromium headless** (Playwright por CDP
com o chromium-1243 do cache): tabela 452 / barra 451 px (1px de borda colapsada), `barTop ===
tableBottom`, lixeira **dentro** do intervalo da última coluna, e arrastar 2×2 + Delete /
2 células + Ctrl+X apagam exatamente o bloco.

**Gotchas:**
- O input é sempre "edição": por isso os atalhos só valem para **bloco com mais de uma célula** —
  senão o usuário não conseguiria apagar/cortar parte do texto de uma célula.
- `navigator.clipboard.writeText` no headless pode rejeitar (sem permissão) — o recorte **continua
  limpando** as células (a rejeição não é awaitada, igual ao Ctrl+C existente).
- A barra com `width: larguraTotal` pode ficar ~1px menor que a `<table>` no modelo de bordas
  colapsadas — imperceptível (medido: 451 vs 452).

<a id="v02501"></a>
## 2026-09-28 — Dados: excluir tabela na barra de baixo + dica removida (v0.25.1)

**Pedidos:** (1) remover a frase "Arraste sobre as células para selecionar · Ctrl+C copia · cole
uma planilha que o TAB distribui"; (2) tirar o **excluir tabela** do cabeçalho e colocá-lo na
**mesma barra do adicionar linha, no lado oposto** (à direita).

**Feito:** a barra inferior virou `flex items-center justify-between` com o **+** (adicionar
linha) à esquerda e a **lixeira** (excluir tabela) à direita — o botão continua com
`aria-label`/`title` "Excluir tabela" e `tabIndex={-1}`. O `<th>` de opções ficou só com
**adicionar coluna +** e **ordenar**. O `span` da dica foi removido.

**Validação:** typecheck limpo; **94 testes** (o smoke do excluir tabela agora confere que ele
**não** está no `thead` e que divide a barra com o adicionar linha); build ok; screenshot do
`dist` confirma **+** à esquerda e lixeira à direita, sem a frase.

<a id="v02500"></a>
## 2026-09-28 — Dados: adicionar coluna no cabeçalho + espaçamento das ações da linha (v0.25.0)

**Pedidos:** (1) botão para **adicionar coluna** ao lado do ordenar e do excluir tabela;
(2) **distribuir melhor** os botões da linha (caixinha, copiar e excluir) — o excluir parecia mais
afastado do copiar do que a caixinha.

**Feito:**
- `adicionarColuna` (puro, em `dados/utils/tabelas.ts`): acrescenta **título "Coluna N" +
  largura padrão + célula vazia** em cada linha; respeita `MAX_COLUNAS` (12). Botão **`+`** no
  `<th>` de opções (mesmo estilo dos outros), escondido quando a tabela já tem 12 colunas.
- **Espaçamento das ações:** o copiar e o excluir agora são **quadradinhos `w-6 h-6`** com
  `gap-1.5` (e o excluir ganhou o mesmo `hover:bg-slate-800` do copiar) — os três ficam com o
  mesmo tamanho e mesmo vão. A largura da coluna de ações virou **92px fixos** (antes 92/64),
  que comporta os 3 botões do cabeçalho (86px) e as ações da linha (76px com caixinha).

**Validação:** typecheck limpo; **94 testes** (+1 puro de `adicionarColuna` incluindo o limite;
+1 smoke clicando no "+" e conferindo 2→3 colunas em `thead`/`tbody`); build ok; screenshot do
`dist` mostra os 3 botões no cabeçalho (+, ordenar, excluir), a coluna nova criada e as ações da
linha alinhadas.

**Gotchas:**
- `larguraAcoes` fixo em 92 simplifica o cálculo (as tabelas antigas não guardam essa largura;
  só as `larguras[]` das colunas de dados são persistidas).
- Os botões novos também levam `tabIndex={-1}` (TAB continua indo de célula em célula).

<a id="v02401"></a>
## 2026-09-28 — Ajustes de texto nos flyers (v0.24.1)

**Pedidos do usuário:**
1. **Tabela de ofertas** e **Amarelo Encarte**: o título da coluna já diz "EM ATÉ 10X", então a
   célula não deve repetir "10x de R$ …" — deve mostrar **só o valor**, como a coluna do à vista.
2. **Etiqueta de preço**: na plaquinha azul-escura, o "10x" deve ficar **na mesma linha do
   "OU EM ATÉ"** (senão parece "10x de um valor que é unidade").

**Feito:**
- `FlyerTabela.tsx` e `FlyerEncarte.tsx`: célula do 10x agora imprime só
  `formatarPreco(tire.priceInstallment)`.
- `FlyerEtiqueta.tsx`: plaquinha ficou com a 1ª linha **"ou em até 10x"** e a 2ª com o valor.

**Validação:** typecheck limpo; 92 testes passando; build ok; screenshots do `dist` conferidos nos
3 layouts (tabela, etiqueta e encarte) — as alturas caíram um pouco porque o texto encurtou
(tabela 897→852, encarte 953→928).

<a id="v02400"></a>
## 2026-09-28 — Dados: ordenar por coluna + ajustes na seleção (v0.24.0)

**Pedidos:** (1) um botão **ao lado do excluir tabela** para **ordenar uma coluna** (ex.: ordem
alfabética); (2) **bug**: ao arrastar a seleção, o destaque começava da **2ª coluna em diante** (a
1ª só aparecia no que era copiado); (3) ao **clicar numa célula já selecionada**, deixar só ela
marcada (**desmarcar as demais**).

**Feito:**
- **Ordenar** (`ordenarPorColuna` em `dados/utils/tabelas.ts`): `Intl.Collator('pt-BR',
  { numeric: true, sensitivity: 'base' })` — compara "8 UN" < "10 UN" (numérico), ignora
  acentos/caixa e joga vazios para o fim; reordena `linhas` e `marcados` **juntos**; direção
  `asc`/`desc`.
- **UI** (`dados/components/OrdenarTabela.tsx`): botão `ArrowUpDown` no `<th>` de opções (ao lado
  da lixeira; a lixeira virou `p-1.5` para caberem os dois) que abre a janelinha **"Ordenar por
  coluna"** com **↑AZ / ↓AZ** por coluna. Como o `.overflow-x-auto` da tabela **cliparia** um
  dropdown, o painel é **fixo e centrado**, renderizado **fora do `ui-compacta`** (mesmo padrão do
  toast do Desfazer — o zoom 75% deformaria um `position: fixed` dentro). Fecha no X, no overlay
  e no Esc.
- **Bug do destaque:** o `<td>` ficava com `bg-blue-600/30`, mas o input focado tem
  `focus:bg-slate-900` opaco por cima → a célula âncora (a focada) parecia não selecionada.
  Passei o destaque para **o próprio input**: quando `selecionada`, ele usa
  `bg-blue-600/35 ring-2 ring-inset ring-blue-500` (e não aplica o `focus:bg-slate-900`).
- **Clique desmarca as demais:** `iniciarSelecao` agora sempre faz seleção de **uma célula**
  (antes, clicar dentro do bloco mantinha o bloco); Shift+clique continua estendendo. Para copiar
  o bloco: arrastar e logo Ctrl+C (sem clicar de novo).

**Validação:** typecheck limpo; **92 testes** (+1 puro de `ordenarPorColuna` com numérico/vazio/
caixinha acompanhando; +1 smoke abrindo a janelinha e conferindo A–Z/Z–A; o smoke de seleção
ganhou o "clicar numa desmarca as demais"); build ok; no Chromium: arrastar marcou **3 células
com a 1ª destacada** (fundo computado azul 35%), clicar numa deixou **1**, e ordenar a coluna 1
deu **ARROZ, MORANGO, ZEBRA**.

**Gotchas:**
- Painel de ordenação dentro do `overflow-x-auto` **não funciona** (clip): fixo + fora do
  `ui-compacta` resolve sem portal.
- O destaque tem de ficar no **input**, não no `<td>`: o input preenche a célula e cobre o fundo
  do `<td>` quando focado (era a causa do "bug" relatado).

<a id="v02300"></a>
## 2026-09-28 — Dados: selecionar várias células (arrastar/Ctrl+C) e colar de planilha (v0.23.0)

**Pedido:** não dava para **selecionar várias células** para copiar; e ao **colar de uma planilha
do Notion** (`CARE042501\tVIA TANQUE FLEX\tTUNAP 939\tR$ 199,89\t R$ 5,00`) tudo caía numa
célula só — cada item deveria ir para uma célula.

**Feito:**
- **Colar bloco:** novo **`colarBloco`** em `dados/utils/tabelas.ts` (puro): recebe a matriz,
  começa na célula do paste, **cria linhas** quando o bloco passa do fim (com `marcados: false`),
  escreve o que couber nas colunas existentes e **apara** cada valor. No `DadosApp`, o `onPaste`
  só intercepta quando o texto tem **TAB/CR/LF** (senão deixa o paste normal, ex.: valor único).
- **Seleção de bloco:** estado `selecao { tabelaId, r1,c1,r2,c2 }` + `arrastandoSelecao` (ref):
  `onMouseDown` na célula ancora (Shift+clique estende; clicar **dentro** da seleção **mantém** o
  bloco — sem isso, focar a célula para copiar zerava a seleção), `onMouseEnter` no `<td>` estende
  enquanto arrasta, `mouseup` na janela encerra. Destaque `bg-blue-600/30 ring-2 ring-inset` +
  `data-selecionada` (testes). **Ctrl+C** com +1 célula copia `linhas.slice(...).map(join('\t')).join('\n')`
  (uma célula só continua sendo o copiar normal do navegador); **Esc** limpa.
- **Dica** embaixo da tabela: "Arraste sobre as células para selecionar · Ctrl+C copia · cole uma
  planilha que o TAB distribui".

**Validação:** typecheck limpo; **90 testes** (+1 puro de `colarBloco` cobrindo criação de linha,
coluna a mais ignorada e paste no meio; +1 smoke com o texto real do Notion, arrastar 3 células e
Ctrl+C); build ok; no Chromium (Ctrl+V de verdade via clipboard): a linha colou em **5 células**,
o arrastar marcou **3 células** e o Ctrl+C devolveu `"CARE042501\tVIA TANQUE FLEX\tTUNAP 939"`.

**Gotchas:**
- `mouseenter` não borbulha; o React trata via delegação e o `fireEvent.mouseEnter` do Testing
  Library funciona com `onMouseEnter` (usado no teste).
- `document.getSelection()?.removeAllRanges()` durante o arrastar evita a seleção azul de texto
  atravessando os inputs.
- A seleção é por tabela (`tabelaId`); em outra tabela nada fica marcado.

<a id="v02201"></a>
## 2026-09-28 — Botões "Limpar" com borracha (v0.22.1)

**Pedido:** trocar a **lixeira** pelo **ícone de borracha** nos cards **DESCRIÇÃO DO REPARO**,
**DADOS DO ORÇAMENTO** e **DADOS DA TABELA** (Tire Flyer).

**Feito:** como os três (e também o **AJUSTES MANUAIS**, que usa o mesmo botão) vêm do
`components/ClearButton.tsx`, bastou trocar `Trash2` → **`Eraser`** lá dentro — os quatro
botões "Limpar" ficam iguais, no mesmo padrão já adotado na v0.19.2 para os limpadores de
campo. `aria-label`/`title` não mudaram (testes e Playwright seguem iguais).

**Validação:** typecheck limpo; 88 testes passando; build ok; no Chromium, os 4 botões
(Limpar ×3 + Limpar Texto do Tire Flyer) renderizam o `path` do `Eraser`.

<a id="v02200"></a>
## 2026-09-28 — Aba Dados: ações por linha/coluna + excluir tabela no cabeçalho + TAB (v0.22.0)

**Pedido (4 itens):** (1) excluir linha deve pedir **"tem certeza?"**; (2) botão do lado da
caixinha/excluir para **copiar a linha toda** de uma vez; (3) o **excluir tabela** deve subir
para a **célula do cabeçalho da coluna de opções** (como se fosse o título dela), sumindo com a
barra que existia só para ele; (4) por fim, uma opção para **excluir coluna**. Depois: (5) com
**TAB** dentro da célula o foco ia para o **botão copiar** da célula — deve ir para a **célula ao
lado**.

**Feito (`src/dados/`):**
- **Excluir linha** (`excluirLinha` no `DadosApp`): `window.confirm('Tem certeza que deseja
  excluir esta linha?')` antes de `removerLinha`.
- **Copiar linha** (`copiarLinha`): junta as células com **TAB** (`linha.join('\t').trim()`) e usa
  o mesmo feedback verde (✓) do copiar célula; botão na célula de ações, entre a caixinha e o X.
- **Excluir tabela** saiu da barra superior (a `div` inteira foi removida) e virou o conteúdo do
  `<th>` da coluna de opções (`thead button[aria-label="Excluir tabela"]`).
- **Excluir coluna** (novo `removerColuna` em `utils/tabelas.ts`): remove título, largura e a
  célula correspondente em cada linha; **nunca deixa 0 colunas** (guarda `colunas <= 1`); botão
  X no hover do `<th>` (só aparece com >1 coluna) com `window.confirm` antes.
- **TAB célula → célula:** todos os botões-ícone de ação (copiar célula, excluir coluna, copiar
  linha, excluir linha e excluir tabela) receberam **`tabIndex={-1}`** — o TAB agora segue o fluxo
  natural dos inputs (cabeçalho → linhas). A caixinha continua tabulável.
- Largura da coluna de ações subiu de 88/44 para **92 (com caixinhas) / 64 (sem)** para caber o
  terceiro botão.

**Validação:** typecheck limpo; **88 testes** (+1 puro de `removerColuna`; o smoke cobre
TAB fora da ordem (`tabIndex -1`), copiar linha com TAB, confirmação de linha/coluna e o botão
de excluir tabela no `thead`); build ok; no Chromium, TAB na 1ª célula foca a 2ª célula
(`INPUT` com o valor ao lado), copiar linha devolve `"PNEU A\tR$ 100"`, excluir coluna pede
confirmação e remove (2→1 colunas), e o diário de diálogos registrou só
`"Tem certeza que deseja excluir esta coluna?"`.

**Gotchas:**
- Os botões com `opacity-0 group-hover:opacity-100` **continuam clicáveis mesmo invisíveis** —
  por isso o `<th>` ganhou `pr-10` no input de título (o X de excluir coluna não cobre o texto).
- `removerColuna` devolve a mesma tabela quando `colunas <= 1` (referência igual): o `setDados`
  não muda nada, evitando estado inconsistente com o botão escondido.
- Nos testes jsdom, `navigator.clipboard` não existe: o teste define
  `Object.defineProperty(navigator, 'clipboard', ...)` antes de clicar em copiar.

<a id="v02100"></a>
## 2026-09-27 — Tire Flyer: +3 layouts coloridos (laranja, racing, encarte) (v0.21.0)

**Pedido:** o usuário aprovou 3 ideias da galeria de cores nova
(`ideias/tire-flyer-cores.md`) para entrarem nas opções que já existiam (clássico, tabela e
etiqueta): **01 Laranja Queima-Estoque**, **02 Vermelho Racing** e **09 Amarelo Encarte**.

**Feito:**
- `layoutFlyer.ts`: `LayoutFlyer` agora é `atual | tabela | etiqueta | laranja | racing |
  encarte` (a validação de valor salvo continua: desconhecido cai em `atual`).
- **Layouts coloridos são flyers completos** (`FlyerLaranja.tsx`, `FlyerRacing.tsx`,
  `FlyerEncarte.tsx`): cada um traz **cabeçalho, corpo e rodapé próprios** (paleta fixa em
  valores hexadecimais/arbitrários — não usam as variáveis de tema, então o tema não vaza e o
  PNG sai sempre igual). O `Flyer.tsx` virou dispatcher: `LAYOUTS_COLORIDOS` decide entre o
  corpo colorido (com `data.tires.length > 0`) e o fluxo clássico (Header/Footer compartilhados
  + `FlyerAtual`/`FlyerTabela`/`FlyerEtiqueta`).
- `SeletorLayoutFlyer.tsx`: 6 opções com ícones `Flame`/`Flag`/`Newspaper` (+ lista com
  `max-h-[52vh] overflow-y-auto`, pois agora não cabe tudo sem rolar).
- Port fiel dos mockups: laranja com dois quadros (10x branco/borda e à vista laranja cheio);
  racing com listra quadriculada (`repeating-linear-gradient` inline), faixa vermelha do à vista
  e faixa preta do 10x; encarte com listra hazard, tabela de borda preta, carimbos de estoque e
  chamada "Consulte disponibilidade".

**Validação:** typecheck limpo; **86 testes** (+1 de leitura dos 3 layouts novos; o smoke agora
percorre as 6 opções); build single-file ok; no Chromium as 3 saídas batem com os mockups
aprovados e o clássico segue **pixel-idêntico** (0 diferenças, 1500×3632).

**Gotchas:**
- Os coloridos **não podem usar as variáveis `--tema-*`** (nem classes que o `@theme inline`
  remapeia, tipo `bg-emerald-600`): como eles trocam `--acc`/`--hdr` etc. por conta própria,
  o jeito seguro foi hex literal (`bg-[#ea580c]`, `text-[#b91c1c]`…). O reset de
  `[data-saida='flyer']` continua valendo para o que sobrou de slate/emerald.
- O smoke do jsdom não renderiza gradiente/quebra de linha, então a checagem visual desses 3
  depende do Playwright (feito) — o teste de tela checa `data-layout` + persistência.

<a id="v02000"></a>
## 2026-09-27 — Tire Flyer: seletor de layout de saída (clássico + tabela + etiqueta) (v0.20.0)

**Pedido:** dos 10 mockups publicados em `ideias/tire-flyer-valores.md`, o usuário escolheu as
ideias **4 (Tabela de ofertas)** e **7 (Etiqueta de preço)** — mas **sem substituir o layout
atual**: um **ícone** troca o layout de saída entre **Clássico (atual) + os dois novos**.

**Feito:**
- `tire/utils/layoutFlyer.ts` (`flyer_layout_v1`): `LayoutFlyer = 'atual' | 'tabela' | 'etiqueta'`;
  sem nada salvo (ou valor inválido) cai em `atual` — o comportamento de sempre é o padrão.
  Entrou no `CHAVES_BACKUP`.
- `Flyer.tsx` virou dispatcher: header/footer extraídos (`Header`/`Footer`), `data-layout` no nó
  de saída (é o que os testes usam) e o clássico isolado em `FlyerAtual` **sem tocar em nenhuma
  classe**.
- `FlyerTabela.tsx` (ideia 4: `Pneu · Em até 10x · À vista · Estoque`, zebrada — o layout mais
  compacto) e `FlyerEtiqueta.tsx` (ideia 7: etiqueta com furo, à vista em destaque e plaquinha
  escura do 10x). O `getBrandStyle` saiu do `Flyer.tsx` para `tire/utils/marcas.ts`
  (compartilhado pelos 3 layouts, evita import circular).
- `SeletorLayoutFlyer.tsx`: botão **ícone-only** (`LayoutTemplate`, `aria-label="Layout do
  flyer"`) com menu no padrão do `ConfiguracoesTema` (abre para cima, fecha clicando fora/Esc,
  opções com nome + descrição). Fica **ao lado do download** (linha `flex`, o download virou
  `flex-1`, mesma altura). A escolha é salva no navegador e vale para o PNG exportado.

**Validação:** typecheck limpo; **85 testes** (+3 de `layoutFlyer` em jsdom, +1 smoke trocando
os 3 layouts e conferindo a persistência); build single-file ok; no Chromium: troca os 3
layouts, persiste após reload e o clássico continua **pixel-idêntico** (diff de **0 pixels**,
1500×3632, contra a captura da v0.19.2).

**Gotchas:**
- Neste headless Linux, o `font-sans` do flyer caiu no fallback e o **Noto Color Emoji** (instalado
  no dia) "rouba" os dígitos: saem espaçados, como se fosse fonte monoespaçada larga. É só do
  fontconfig da VPS — para validar visualmente, injetar `Inter` no nó do flyer (mesma substituição
  da captura de referência); no Chrome/Windows a stack resolve em Segoe UI e não acontece.
- O menu do seletor abre **para cima** (`bottom-full`) de propósito: o botão fica embaixo do
  preview, que pode ser mais alto que a viewport.

<a id="v01902"></a>
## 2026-09-27 — Ícone Borracha nos "limpar" + Desfazer na exclusão de sub-aba (v0.19.2)

Escolhas do usuário (após a galeria de ícones):
- **Ícone "limpar campo" = Borracha (`Eraser`)** no lugar da vassoura (`Broom`). Aplicado em:
  Total Revisão e Peças na Revisão (`OrcamentosApp`), **novo botão** em PLACA/NOME/CONTATO
  (`OrcamentosApp`) e **novo botão** no **Contato do Tire Flyer** (`TireFlyerApp`) — todos com o
  mesmo padrão (botão absoluto à direita do input, `pr-10`, `text-slate-600 hover:text-red-400`).
- **Desfazer na exclusão de sub-aba (Dados):** troquei o `window.confirm` por **exclusão imediata
  + toast "Desfazer"** (~6s), no padrão dos outros apps VinyApps (Taskix: sem diálogo, com undo).
  `excluirAba` captura `{aba, idx}` e `removerAba`; `restaurarAba` reinsere na posição original
  (`abas.slice(0,idx)+aba+slice(idx)`). Toast renderizado **fora do `ui-compacta`** (fragmento no
  return) p/ o `zoom:0.75` não encolher/reposicionar o `position:fixed`. Timer limpo no unmount.

<a id="v01901"></a>
## 2026-09-27 — Ajustes Grafite: negrito nos títulos + botão "+" (v0.19.1)

Feedback do usuário sobre o tema Grafite:
- **Tabela (aba Dados):** estava "célula em negrito, título não" (estranho). Invertido SÓ no
  grafite: `[data-tema='grafite'] thead th input { font-weight:700 }` (títulos das colunas em
  **negrito**, caixa normal) + `tbody td input { font-weight:400 }` (células em peso normal).
- **Botão "Adicionar linha"** virou só um **"+"** (ícone, `w-9 h-9`, `aria-label`), sem o texto.
- **Item 3 (dúvida do usuário):** excluir sub-aba em Dados **tem confirmação** (`window.confirm`
  em `excluirAba`) mas **NÃO tem desfazer** (exclusão direta). Oferecido adicionar undo se quiser.
- **Item 2 (ícone de vassoura):** o usuário não gostou do `Broom` (Total Revisão/Peças na Revisão)
  e quer ver opções + aplicar um ícone de limpar em PLACA/NOME/CONTATO e no Contato do Tire Flyer.
  Entregue como **galeria-Artifact de opções de ícone** ([[feedback-ideias-layout-link-imagens]]);
  aplicar após a escolha.

<a id="v01900"></a>
## 2026-09-27 — 8º tema "Grafite" (estilo das tabelas do Claude.ai) (v0.19.0)

**Pedido:** copiar o estilo de tabela do Claude.ai (print que o usuário mandou: dashboard
CSV→tabela) para um NOVO tema — "principalmente nas tabelas": quase-preto, **barra de título/
cabeçalho mais claro**, linhas de grade sutis, fonte limpa, texto claro.

**Feito:**
- Novo tema **`grafite`** (8º) — `tema.ts` (type + lista válida), `ConfiguracoesTema.tsx`
  (opção + amostra), bloco `[data-tema='grafite']` no `index.css` com a paleta amostrada do
  print: fundo `#0c0c0c`, painel/cabeçalho `#161616` (mais claro), bordas `#242424` (grade
  sutil), texto `#ecece8`/`#f7f5f6`, muted `#8c8c88`, acento **azul suave `#4c7ef3`** (a
  referência é grayscale, mas os botões precisam de contraste com texto branco).
- **Fonte `Plus Jakarta Sans`** (nova, `@fontsource`, latin 400/500/700) — a mais próxima do
  Google-Sans do print (comparada headless contra Manrope/Figtree antes de escolher).
- **Tabela (aba Dados) igual ao Claude:** as células já usavam `border-slate-800`
  (`--tema-borda-forte`) → grade sutil automática; adicionei regras SÓ do grafite:
  `thead th { background: var(--tema-painel) }` (cabeçalho mais claro) e
  `thead th input { color: muted; font-weight:500; text-transform:none }` (cabeçalho **cinza,
  peso normal, caixa normal** — a marca do estilo Claude, vs. o branco/bold/maiúsculo dos
  outros temas).
- Estrutural chapado (sem neon/sombra) como os demais temas novos.

**Validação:** typecheck limpo; **81 testes** (o smoke de troca de tema cobre `grafite`);
**preview headless** do `dist` com uma tabela semeada (Dimensão | Valores) no `localStorage`
→ bateu com o print (cabeçalho claro, grade sutil, cabeçalho cinza sentence-case).

**Gotchas:**
- Regra base `textarea,input,select { font-family: var(--tema-fonte-conteudo) }` já aplica a
  fonte do tema nos campos comuns E preserva o **mono** dos dados (`.font-mono-data`, spec maior).
  ⚠️ NÃO adicionar `[data-tema='x'] textarea` (spec (0,1,1) > `.font-mono-data` (0,1,0)) senão os
  dados colados perdem o alinhamento mono (foi o que quase fiz e removi).
- **O tema NÃO vaza para as saídas** segue valendo — o PNG do cliente (`#printable-quote`) e o
  flyer resetam os tokens; este tema muda só a INTERFACE (a tabela estilizada é a da aba Dados).

<a id="v01801"></a>
## 2026-09-27 — Busca do histórico também por item (v0.18.1)

**Pedido:** na lupa do histórico, além de data/placa, poder procurar pelo **item** — ex.:
buscar "freio" e achar todos os orçamentos com pastilhas de freio (útil na aba **Não
Realizados**, para saber quem já recusou/tem aquele serviço).

**Feito:**
- **`utils/historico.ts`:** `filtrarHistorico` agora também testa `r.descReparo` (era só placa
  + `criadoEm`) — mesma normalização sem acentos/separadores (`normalizarBusca`), então
  "pastilhas"/"PASTILHAS" e "retifica"/"retífica" funcionam.
- **`destacarTermo`** (novo, puro): divide o texto em `[antes, termo, depois]` para grifar a
  parte encontrada. Comparação com `normalize('NFD').toLowerCase()` nos **dois** lados — o NFD
  **preserva o comprimento**, então os índices do texto original batem (extrair por índice
  funciona, sem regex/split problemático).
- **`HistoryModal.tsx`:** o cartão grifa o termo na descrição (`<mark>` âmbar) e o placeholder
  virou "Pesquisar por data, placa ou item… (ex.: 24/09, ABC1D23, freio)". Os testes que
  procuravam o placeholder antigo foram atualizados.
- **Testes:** 81 passando — novo teste puro em `historico.test.ts` (acha por "freio"/"FREIO",
  não acha termo inexistente) e smoke com fixture de pastilhas conferindo contador + `<mark>`.

**Gotchas / decisões:**
- O grifo usa comparação NFD (índices alinhados com o original); o **filtro** normaliza mais
  forte (remove separadores), então uma busca com hífen ("abc-1d23") filtra mas pode não
  grifar — comportamento aceitável (grifo é dica visual).
- Validação no Chromium (`valida_busca_item.mjs`, no dir de repro): busca "freio" → "1 de 2"
  com `<mark>FREIO</mark>`; "palhetas" → "1 de 2" com `PALHETAS` grifado.

<a id="v01800"></a>
## 2026-09-26 — 5 temas novos + renomear os 2 antigos (v0.18.0)

**Pedido:** integrar 5 temas da galeria de mockups (Claro Papel, Executivo Premium, Verde
WhatsApp, Monocromático Técnico, Suave Arredondado) ao seletor de Configurações, ao lado dos
dois atuais — que passam a se chamar **Azul** (era "Original") e **Terracota** (era "Claude").

**Feito:**
- **`utils/tema.ts`:** o type `Tema` virou união de 7 (`azul`, `terracota`, `papel`,
  `executivo`, `whatsapp`, `tecnico`, `suave`). `lerTemaSalvo` agora **migra** os nomes antigos
  (`original→azul`, `claude→terracota`) e valida contra a lista — quem já tinha um tema salvo
  não perde nada.
- **`index.css`:** renomeei todos os `[data-tema='claude']` → `[data-tema='terracota']` e
  acrescentei **5 blocos de paleta** novos (os mesmos ~26 tokens `--tema-*` de sempre), mais
  regras estruturais: interface chapada (sem brilho neon / sem sombra de botão) nos 5 temas
  novos; Executivo com títulos serifados em caixa normal (como o Terracota); Suave com cantos
  1,5rem e Técnico com 0,375rem. Regra base nova `textarea,input,select { font-family:
  var(--tema-fonte-conteudo) }` — os campos de dados **mono continuam mono** porque
  `.font-mono-data` tem especificidade maior; as saídas resetam a fonte (PNG do cliente igual).
- **Fontes:** 5 famílias novas via `@fontsource` (space-grotesk, fraunces, manrope, poppins,
  chivo), pesos 400–700 — **embutidas no build** (regra de offline mantida). O `dist` cresceu de
  ~0,68 MB para ~1,4 MB por causa disso (aceitável p/ uso local).
- **`ConfiguracoesTema.tsx`:** 7 opções com **mini-amostra de cor** (quadradinho do fundo +
  ponto do acento) e lista com **rolagem** (`max-h-[46vh] overflow-y-auto`), já que agora são 7.
- **Contraste no tema claro (Papel):** único ponto que quebrava era o textarea "mensagem
  especial" (Whats) com `text-emerald-100` (verde claríssimo, some no branco) — não passava
  pelos tokens. Troquei por `text-emerald-600`, que É remapeado p/ `--tema-sucesso` e fica
  legível em todos os temas.

**Gotchas / decisões:**
- **`text-emerald-100` não é remapeado** pelo `@theme inline` (só 600/500/400/900 são). Literais
  fora da lista não seguem o tema — cuidado ao introduzir modo claro.
- **Validação por screenshot headless** do `dist` (sem Playwright): script injeta
  `document.documentElement.dataset.tema` num `setInterval` + clica a aba, e renderiza com
  `chrome-headless-shell --virtual-time-budget`. Conferido: os 5 temas nas abas Orçamentos/Whats
  + Papel também no Tire Flyer. Sem branco-no-branco nem placeholder ilegível.
- **O tema NÃO vaza para as saídas** segue valendo (o reset de `#printable-quote` e
  `[data-saida='flyer']` já cobre todos os tokens + as fontes).
- Testes: **79** (o smoke de tema foi atualizado p/ os nomes novos + teste de migração).

---

<a id="v01700"></a>
## 2026-09-24 — Excluir cada sub-aba, caixinhas por linha e renomear abas/títulos (v0.17.0)

**Pedidos:** excluir **uma** sub-aba por vez (o botão antigo parecia apagar tudo); caixinha de
seleção que **risca a linha** (tabelas com e sem — "até poderia ser sempre"); poder **renomear
sub-abas**; e **renomear também as abas/títulos principais** (ORÇAMENTOS, TIRE FLYER, PAINEL
WHATSAPP etc.).

**Feito:**
- **Excluir sub-aba:** agora cada sub-aba tem o seu próprio **X** (ao lado do nome) — apaga
  exatamente aquela (com `confirm`); o botão único de lixeira foi removido. `removerAba` nunca
  deixa a lista vazia.
- **Caixinhas de seleção:** opção **"Caixinhas"** na criação da tabela (`comCaixas`, padrão
  ligado) e `marcados: boolean[]` por linha; ao marcar, a **linha fica riscada** (cinza
  `line-through`). A caixinha fica **no fim da linha**, junto do X de excluir. Registros antigos
  assumem `comCaixas: true`.
- **Renomear sub-abas:** **duplo clique** no nome abre um campo (Enter confirma, Esc cancela) —
  `renomearAba()` em maiúsculas.
- **Renomear abas e títulos:** novo `utils/rotulos.ts` (`rotulos_v1`) +
  `RotulosProvider/useRotulos` + `<TituloEditavel>` (duplo clique no título, com o mesmo visual:
  tudo azul, duas cores ou simples). O shell usa os rótulos nos botões das abas; os títulos
  internos das 4 telas são editáveis. Entrou no **backup geral**.
- Testes: **78** (caixinhas com/sem/riscar/legado, renomear sub-aba, exclusão por aba).
  Validado no Chromium: renomear aba do topo, sub-aba, título interno; marcar linha risca; e
  excluir apenas a sub-aba escolhida (as outras ficam).

<a id="v01601"></a>
## 2026-09-24 — Dados: proporção fonte/célula, excluir sub-aba e header ajustado (v0.16.1)

**Pedidos:** o aumento da v0.16.0 foi só de fonte — o usuário queria a **relação fonte/altura**
(a letra preenchendo a célula/botão, sem tanto espaço acima e abaixo); e poder **excluir
sub-abas**.

**Feito:**
- **Células:** corpo `text-lg py-3` → **`text-xl py-2`** (a fonte passou a ocupar ~59% da altura
  da célula, medido no Chromium) e títulos `text-base py-3` → `text-lg py-2.5`.
- **Botões:** sub-abas `text-base py-2.5`; "Criar tabela"/"Adicionar linha" `text-sm px-5 py-2.5`;
  abas do topo `text-sm px-5 py-2.5` (com `whitespace-nowrap`). O header voltou a caber
  (container 1050px físicos, sem sobrepor a marca em 1366/1600/1920 — medido).
- **Excluir sub-aba:** botão de lixeira ao lado do "+" apaga a sub-aba aberta (com `confirm`),
  selecionando a primeira restante. `removerAba()` nunca deixa a lista vazia (se apagar todas,
  volta PEÇAS/O.S's) e o loader deixou de "ressuscitar" abas apagadas.
- Testes: **76** (novo caso de `removerAba` + exclusão no smoke com `confirm` mockado).

<a id="v01600"></a>
## 2026-09-24 — Dados: sub-abas dinâmicas, copiar célula, largura de coluna e fontes maiores (v0.16.0)

**Pedidos (em sequência):** tirar o texto "Tabela 1 · O.S's / data · colunas · linhas"; aumentar
a letra dentro das células; **ajustar a largura de cada coluna**; aumentar as letras das abas e
sub-abas; **criar mais sub-abas** por um botão ao lado das existentes; e um **botão de copiar**
dentro de cada célula.

**Feito:**
- Removido o cabeçalho com texto de cada tabela (ficou só o botão de excluir, à direita).
- Células: `text-sm` → **`text-lg`** (corpo) e **`text-base`** (títulos), `px-3 py-2` →
  `px-4 py-3`, coluna mínima 150 → **170px**.
- **Largura por coluna**: `larguras: number[]` na tabela (padrão 170, limites 80–600),
  `<colgroup>` + `table-layout: fixed` e uma **alça de arrastar** na borda direita de cada
  cabeçalho (`data-redimensionar`, delta do mouse dividido pelo zoom 0.75).
- **Abas e sub-abas maiores**: shell `text-xs px-6 py-3` → `text-sm px-7 py-3.5` (+
  `whitespace-nowrap` para não quebrar linha); sub-abas `text-xs` → `text-sm px-6 py-3`.
- **Sub-abas dinâmicas**: modelo mudou para `{ abas: [{ id, rotulo, tabelas }] }` (PEÇAS e O.S's
  fixas + criadas), com **migração automática** do formato antigo `{ pecas, os }`; botão **“+”**
  ao lado das sub-abas abre um campo de nome e cria a nova aba. A busca e o contador passaram a
  considerar todas as abas (ex.: `2 em PREVENTIVA`).
- **Copiar célula**: botãozinho (aparece no hover/foco) dentro de cada célula com conteúdo,
  com ✓ por 2s — copia só o valor daquela célula.
- Testes: **75** (novos: larguras, sub-abas, migração, copiar célula); validado no Chromium
  (arrastar a coluna 170→330 e persistir, criar sub-aba, copiar "FILTRO DE OLEO", busca
  trocando de aba). O backup das Configurações inclui `dados_tabelas_v1` (todas as sub-abas).

<a id="v01500"></a>
## 2026-09-24 — Nova aba "DADOS" (tabelas de Peças e O.S's) (v0.15.0)

**Pedido:** uma aba **DADOS** com sub-abas **PEÇAS** e **O.S's**; botão **Criar tabela** no alto
com escolha do **número de colunas**; **adicionar linhas** por um botão embaixo da tabela; a
**primeira linha é o cabeçalho em negrito**; e uma **lupa** no alto que abre a sub-aba onde o
termo está, com o termo **grifado**.

**Feito:**
- `src/dados/utils/tabelas.ts` (`dados_tabelas_v1`): modelo `{ pecas: TabelaDados[], os: [...] }`
  com `colunas/titulos/linhas`; funções puras `criarTabela` (colunas 1–12), `adicionarLinha`,
  `removerLinha`, `atualizarTitulo/Celula`, `removerTabela`, `lerDados/salvarDados` e
  **`encontrar()`** (conta células/títulos que contêm o termo, **sem acento**).
- `src/dados/DadosApp.tsx`: barra com a **lupa** (+contador "N em Peças · M em O.S's"), seletor
  de **colunas** e **Criar tabela**; sub-abas com contagem; tabelas com cabeçalho editável em
  **negrito**, células editáveis, botão **Adicionar linha** embaixo (e X para excluir a linha);
  ao pesquisar, **troca sozinho para a sub-aba que tem o termo**, **grifa** a célula
  (`data-marcado="1"` + fundo âmbar) e rola até ela.
- Aba **Dados** adicionada ao shell (4ª aba); a chave entrou no **backup geral**.
- Testes: **73** (6 novos em `tests/dados.test.ts` + caso de UI no smoke); validado no Chromium
  (criar 4 colunas, títulos em peso 900, busca "pastilhas" grifa 1 célula e "maria" troca para
  O.S's).

<a id="v01406"></a>
## 2026-09-24 — Whats em 2 colunas: contato+scripts à esquerda, relatório à direita (v0.14.6)

**Pedidos:** observação/mensagem com **1 linha** (estavam com 3) e novo layout: **NOVO CONTATO à
esquerda**, **RELATÓRIO DE ENVIOS à direita** (lado a lado), com o relatório em **uma coluna só**
(um contato por linha); **SCRIPT PNEUS/REVISÃO abaixo do NOVO CONTATO**, na mesma largura.

**Feito (`WhatsApp` + `ContactList`):**
- Grid do topo virou `lg:grid-cols-2` (antes 12 colunas com 4/8): esquerda = `ContactForm` +
  `MessageEditor` (empilhados), direita = `ContactList` (agora dentro da coluna, sem a linha
  separada abaixo).
- Cartões do relatório: `lg:grid-cols-2` → **`grid-cols-1`** (uma coluna).
- Campos Observação/Mensagem Especial: `h-20` → **`h-9`** (1 linha, com `overflow-y-auto`).
- Validado no Chromium: colunas lado a lado (629px cada), um cartão por linha (603px) e os dois
  campos com 27px de altura (1 linha). Testes: 67.

<a id="v01405"></a>
## 2026-09-24 — Títulos menores + observação e mensagem lado a lado no contato (v0.14.5)

**Pedidos:** (1) diminuir a fonte dos títulos **ORÇAMENTOS / TIRE FLYER / PAINEL WHATSAPP**;
(2) no Relatório de Envios, **Observação e Mensagem Especial lado a lado** (abaixo do nome),
podendo ler/escrever várias linhas com **barra de rolagem** aparecendo quando passar da altura.

**Feito:**
- Títulos das abas: `text-4xl` → **`text-3xl`** (36px → 30px) nas três telas.
- Cartão do contato: abaixo do nome agora tem **dois campos** (`grid-cols-2`), cada um com
  rótulo discreto: **Observação** (internalNote) e **Mensagem especial** (`customMessage`),
  ambos `h-20` com `overflow-y-auto` (a barra lateral aparece ao passar das linhas).
- `WhatsApp.tsx` ganhou `updateContactMessage` (não existia: só a observação era editável) e
  passou `onUpdateMessage` para o `ContactList`. O copiar/notificar já usava
  `customMessage || script de revisão`, então a mensagem salva continua sendo a usada.
- Validado no Chromium: campos no mesmo `top` (lado a lado), valores carregados do
  localStorage e `overflow-y: auto`. Testes: 67.

<a id="v01404"></a>
## 2026-09-24 — Relatório de Envios: layout "Foco na observação" (v0.14.4)

**Pedido:** o usuário escolheu, entre 10 mockups publicados em `ideias/relatorio-2colunas.md`, a
**opção 7 — Foco na observação** para a lista de contatos da aba Whats.

**Feito (`ContactList`):** a tabela de linha comprida virou **cartões em 2 colunas**
(`grid lg:grid-cols-2`), cada contato com:
- **nome** (18px, riscado quando concluído) + **data editável** (chip com input `date` invisível);
- **observação em destaque** (caixa editável, mesmo comportamento de antes);
- rodapé com **telefone**, chip de **chassi copiável**, selo de situação
  (Concluído/Hoje/Atrasado/Agendado) e as ações (copiar mensagem, notificar, excluir) — todas
  ícone-only com `aria-label`/`title`, como no resto do app.
Cabeçalho (Processo mensal / %) e estado vazio mantidos; ordenação por data mantida.
Os mockups ficaram em `ideias/` com um `.md` para navegação. Testes: 67 (o smoke já cobria
cadastro/busca do contato); validado no Chromium com 6 contatos em situações diferentes.

<a id="v01403"></a>
## 2026-09-24 — RESUMO LÍQUIDO compacto e rente ao card 2 (v0.14.3)

**Pedidos:** diminuir a altura dos valores do RESUMO LÍQUIDO, deixá-lo **rente ao final do
card 2. DADOS DO ORÇAMENTO** e diminuir um pouco a altura do botão play.

**Feito:** caixas do RESUMO com `p-4` → **`px-3 py-2`** (e label `mb-1.5` → `mb-0.5`); play com
`py-5` → **`py-3`** (ícone 26). A coluna direita virou `flex flex-col gap-4` e o RESUMO ganhou
**`mt-auto`** — ele encosta no fim da coluna; medido no Chromium, o rodapé do RESUMO ficou a
**6px** do fim do card 2 (praticamente rente). Testes: 67.

<a id="v01402"></a>
## 2026-09-24 — Coluna direita mais junta e Ajustes com 2 linhas (v0.14.2)

**Pedido:** menos espaço do card **3. AJUSTES MANUAIS (ID VALOR)** em relação ao APROVADO E
DESCONTO e ao RESUMO LÍQUIDO; e o campo dos ajustes com espaço para **duas linhas**.

**Feito:** coluna direita `space-y-8` → **`space-y-4`** (vão entre os cards caiu de 24px para
**12px físicos**, medido) e o textarea dos ajustes de `rows={3}` → **`rows={2}`** (altura 68px
físicos, 2 linhas). Testes: 67.

<a id="v01401"></a>
## 2026-09-24 — Vassoura/formatador nos valores e Ajustes na coluna direita (v0.14.1)

**Pedidos:** (1) botãozinho de **vassoura** para limpar "Total Revisão (R$)" e "Peças na
Revisão (R$)"; (2) ao colar, o valor vira milhar com ponto e centavos com vírgula
("1000" → "1.000,00"; "2.188,92" → "2.188,92"); (3) o card **3. AJUSTES MANUAIS (ID VALOR)**
entre o APROVADO E DESCONTO e o RESUMO LÍQUIDO, com o campo mostrando **só 3 linhas**.

**Feito:**
- `formatarValorInput()` em `quoteLogic.ts` (reusa `parseBrazilianNumber` + `formatCurrency`;
  vazio/sem dígito fica como veio). Aplicado no **onPaste** e no **onBlur** dos dois campos
  (digitar continua livre, como antes).
- Botão **vassoura** (`Broom` da lucide) dentro de cada campo, ícone-only com
  `aria-label`/`title` ("Limpar Total Revisão"/"Limpar Peças na Revisão").
- Card dos ajustes movido para a coluna direita (entre APROVADO E DESCONTO e RESUMO LÍQUIDO) e
  o textarea trocou `h-32` por **`rows={3}`** + `p-4` — conferido no Chromium: 3 linhas visíveis
  (altura 89px) e a ordem certa na coluna.
- Testes: **67** (4 novos de formatação/paste/vassoura).

<a id="v01400"></a>
## 2026-09-24 — Campos em pares no orçamento + scripts Pneus/Revisão no Whats (v0.14.0)

**Pedidos:** (1) no orçamento, **Total Revisão | Peças na Revisão** lado a lado, **Desconto |
Parcelas** lado a lado e, no RESUMO LÍQUIDO, **Total Peças | Total Serviços** e **Desc. | Valor
Líquido** lado a lado; (2) na aba Whats, **Nome, WhatsApp, Dia do Envio e Chassi na mesma
linha** e o "Script de Prospecção" dividido em **SCRIPT PNEUS** e **SCRIPT REVISÃO** (estreitando
a coluna dos scripts se preciso).

**Feito:**
- Orçamentos: pares em `grid-cols-2` (cards APROVADO E DESCONTO e RESUMO LÍQUIDO) — conferido
  no Chromium que os pares ficam na mesma linha.
- Whats: formulário em `xl:grid-cols-4` (uma linha); coluna dos scripts de `col-span-5` → **4**
  e a do formulário de `7` → **8**; `MessageEditor` virou **dois blocos** (cada um com o seu
  copiar): `src/whats/utils/scripts.ts` (`zap_script_pneus_v1`/`zap_script_revisao_v1`,
  **migrando** o `zap_template` antigo para o de revisão). O contato (copiar/NOTIFICAR) usa o
  **script de revisão**; o de pneus é para copiar no editor.
- Backup geral ganhou as duas chaves (mantendo `zap_template` para compatibilidade).
- Testes: **63** (`tests/whats_scripts.test.ts` novo, com migração e persistência);
  flyer segue **0 diferenças**.

<a id="v01305"></a>
## 2026-09-24 — Formulário do Whats mais compacto (v0.13.5)

**Pedido:** na aba Whats, WhatsApp ao lado direito de **Nome Completo**, **Número do Chassi**
ao lado direito de **Dia do Envio**, e remover o máximo de espaço entre os campos.

**Feito (`ContactForm`):** dois grids de 2 colunas — `[Nome | WhatsApp]` e
`[Dia do Envio | Chassi]`; formulário `space-y-6` → **`space-y-3`**, `gap-6` → `gap-3`,
inputs `px-5 py-4` → `px-4 py-3`, rótulo `mb-1.5 ml-4` → `mb-1 ml-2` e cabeçalho `mb-10` →
`mb-5`. Validado no Chromium (campos na mesma linha e vão entre linhas ~23px). Testes: 60.

<a id="v01304"></a>
## 2026-09-24 — Títulos dos históricos em maiúsculas e popup menor (v0.13.4)

**Pedido:** onde diz "Histórico" em maiúsculas; e reduzir a fonte de "ITENS DO ORÇAMENTO".

**Feito:** títulos em maiúsculas **no texto-fonte** (o tema Claude tira o `text-transform` do
`.titulo-tema`): `HISTÓRICO` e `HISTÓRICO — TIRE FLYER`. O título do popup foi de 30px →
**26px** (`text-[26px]`). Testes: 60.

<a id="v01303"></a>
## 2026-09-24 — Contagem das abas segue a pesquisa (v0.13.3)

**Pedido:** ao pesquisar no histórico, as abas mostravam o total geral (`Todos (N)`); o correto
é mostrar a quantidade de resultados da pesquisa.

**Feito:** `HistoryModal` calcula por aba **já com o filtro da busca**
(`porAba.todos` / `porAba.naoRealizados`) e os rótulos usam essas contagens — sem busca, os
números continuam sendo os totais. O indicador `N de M` do campo de busca foi mantido.
Validado no Chromium: 3 registros → `Todos (3) / Não Realizados (2)`; busca "abc" →
`Todos (1) / Não Realizados (1)`; busca "zzz" → `(0) / (0)`. Testes: 60.

<a id="v01302"></a>
## 2026-09-24 — "Aprovado/Não aprovado" só nos registros salvos + título maior (v0.13.2)

**Pedido:** no "Ver itens do orçamento" da aba **Todos** não deve aparecer "Aprovado pelo
cliente"/"Não aprovado" (o orçamento recém-gerado ainda não foi aprovado) — só nos registros
salvos em **Não Realizados**; e aumentar/maiúscular o título.

**Feito:**
- `temSelecao = (itensDe?.naoRealizados?.length ?? 0) > 0`: a legenda e os ícones ✓/✕ só
  aparecem quando o registro foi salvo pelo botão âmbar; nos demais os itens ficam
  `data-situacao="neutro"` (lista simples, texto claro).
- Título **ITENS DO ORÇAMENTO**: `text-2xl` → **`text-3xl`** (30px) e texto-fonte em maiúsculas
  (novamente: no tema Claude o `.titulo-tema` tira o `text-transform`).
- Testes: **60** (o caso das abas agora confere os dois cenários); flyer com PNG idêntico.

<a id="v01301"></a>
## 2026-09-24 — Título do popup maior + data/hora do histórico no documento (v0.13.1)

**Pedidos:** (1) no "Ver itens do orçamento", título **ITENS DO ORÇAMENTO** maior e tudo em
maiúsculas; (2) ao abrir um orçamento do histórico, o documento deve mostrar a **data/hora do
registro** (de quando foi criado), não a de agora.

**Feito:**
- Título do popup: `text-lg` → **`text-2xl`** e texto-fonte em maiúsculas (no tema Claude o
  `.titulo-tema` tira o `text-transform`, então precisa estar maiúsculo no código).
- `abrirDoHistorico` faz `setSummary({ ...result, currentTime: r.criadoEm })` — o "Data:" do
  documento (e o nome do arquivo do PNG) passam a refletir a criação. O registro **não** é
  re-salvo com a data atual.
- Testes: **60** (novo caso conferindo a data do registro no documento); flyer com PNG idêntico.

<a id="v01300"></a>
## 2026-09-24 — Busca por nome, itens aprovados/recusados no histórico + zoom do modal (v0.13.0)

**Pedidos:** (1) no orçamento, o campo "PLACA" vira **PLACA, NOME, CONTATO** com limite maior,
para puxar qualquer coisa na lupa do histórico; (2) no "Ver itens do orçamento", **sinalizar os
itens aprovados e não aprovados** pelo cliente. (3) bônus: o histórico do Flyer estava com a
fonte menor que o dos orçamentos.

**Feito:**
- Campo: rótulo **PLACA, NOME, CONTATO**, `maxLength` 8 → **60**, placeholder
  "Ex.: ABC1D23 / JOÃO / 51 99999-9999" (continua indo só para o histórico, não muda o PNG).
- `filtrarHistorico` ficou **à prova de acento** (`normalize('NFD')`): buscar `joao` acha
  **JOÃO** (antes só placa/data não tinham acento, então não aparecia).
- Janelinha "Ver itens do orçamento": cada linha ganhou **ícone + cor** por situação
  (`data-situacao="aprovado|naoAprovado"`), com legenda "✓ Aprovado pelo cliente ·
  ✕ Não aprovado"; quem está em `naoRealizados` sai em vermelho/riscado.
- **Zoom do histórico do Flyer:** o modal estava DENTRO do `ui-compacta` da aba e recebia o
  zoom duas vezes (0,75 × 0,75). Agora ele fica fora do container (como no de orçamentos) —
  fonte igual à do histórico de orçamentos (16px/zoom 1, conferido no Chromium).
- Testes: **59** (asserts novos no popup e no campo); flyer segue **0 diferenças** no PNG.

<a id="v01200"></a>
## 2026-09-24 — Histórico do Tire Flyer + card CONTATO (v0.12.0)

**Pedidos:** (1) botão **Histórico** no card "DADOS DA TABELA" do Tire Flyer; (2) trocar
"LAYOUT DE EXPORTAÇÃO" por um card **CONTATO** com campo livre (número, placa, nome do cliente);
(3) esse contato fica **ao lado de data/hora** para pesquisar no histórico do Tire Flyer.

**Feito:**
- `src/tire/utils/historicoFlyer.ts` (`flyer_historico_v1`, máx. 100): guarda
  `criadoEm · contato · medida · inputText · numPneus`; **não duplica** se a tabela e o contato
  forem os mesmos; `filtrarFlyerHistorico` busca por **contato, data ou medida** e é
  **à prova de acento** (`normalize('NFD')`, "JOÃO" casa com "joao").
- `TireFlyerApp`: botão **Histórico** (ícone, ao lado do Limpar Texto) no card da tabela; card
  **CONTATO** no lugar do LAYOUT (campo livre + aviso "fica só no histórico"); o "Processar e
  Atualizar Flyer" salva automaticamente no histórico; "Abrir" do histórico restaura tabela e
  contato (sem re-salvar).
- `FlyerHistoryModal` (mesmo padrão do histórico de orçamentos, sem abas): lista
  `data/hora · contato · medida · N pneus`, Pesquisar (contato/data/medida), Abrir, Excluir e
  Limpar tudo — tudo ícone-only.
- Backup geral ganhou a chave `flyer_historico_v1`.
- Testes: **59** (3 novos de histórico + 1 de UI); validado no Chromium (busca "joao" e
  "265/60" acham; backup lista a chave). Flyer segue **0 diferenças** no PNG.

<a id="v01100"></a>
## 2026-09-24 — Histórico com abas + salvar não realizados + ver itens (v0.11.0)

**Pedidos:** (1) no histórico, duas abas: **Todos** e **Não Realizados**; (2) um botão ao lado
do PDF/PNG para **salvar** um orçamento que contém itens desmarcados, que vai para a aba "Não
Realizados"; (3) um botão ao lado de **Abrir orçamento** que abre uma **janelinha com os itens**
(a descrição do reparo, linha a linha).

**Feito:**
- `OrcamentoSalvo.naoRealizados?: number[]` (ids desmarcados) + `temNaoRealizados()` e
  `filtrarPorAba()` em `utils/historico.ts`; `abrirDoHistorico` **restaura a marcação** salva.
- `HistoryModal`: abas **Todos (N)** / **Não Realizados (M)**; selo vermelho
  "N não realizado(s)" no cartão; estado vazio próprio por aba.
- `QuoteTable`: botão novo (âmbar, ícone-only) ao lado de PDF/PNG —
  **"Salvar com itens não realizados"** (desabilitado sem desmarcados; vira ✓ por 2s).
  `OrcamentosApp` monta o registro com `naoRealizados` e o retrato do resumo atual.
- `HistoryModal`: botão **"Ver itens do orçamento"** (ícone `List`) ao lado do "Abrir" →
  janelinha sobreposta (z-210) com as linhas de `descReparo` uma embaixo da outra; fecha no X
  ou clicando fora.
- Testes: **55** (3 novos) — inclui salvar com desmarcados indo para a aba e a janelinha.
  Flyer segue **0 diferenças**; o orçamento já tinha mudado na v0.8.5 (pedido).

<a id="v01000"></a>
## 2026-09-24 — Último orçamento gerado fica salvo ao reabrir (v0.10.0)

**Pedido:** o visual do orçamento gerado sumia ao reabrir o app ("tenho que gerar sempre para
ver"); o último deve ficar salvo.

**Feito:** `src/utils/ultimoOrcamento.ts` (`orcamento_ultimo_v1`) guarda o **resumo gerado +
a marcação dos itens** (`selecionados`). O `OrcamentosApp` inicializa `summary`/`selecionados`
por ele e re-salva a cada mudança (`summary`/`selecionados`) — o documento aparece ao abrir,
sem clicar em play. A chave entrou no **backup geral** (`CHAVES_BACKUP`).
Validado no Chromium: processar → desmarcar item → recarregar → documento presente e com o
item desmarcado; backup lista `orcamento_ultimo_v1`. Testes: **52**; flyer segue com PNG
idêntico.

<a id="v00901"></a>
## 2026-09-24 — Histórico com valor bruto (v0.9.1)

**Pedido:** no resumo que aparece nos cartões do histórico, não mostrar valor líquido — mostrar
**bruto**.

**Feito:** o item "Líquido" (`valorLiquidoFinal`) virou **"Bruto"** usando `totalGeral`
(revisão aprovada + orçamento adicional, sem o desconto). Os outros itens (Revisão, Peças,
Serviços) já eram brutos. Testes: 51; nada mudou nos PNGs de saída.

<a id="v00900"></a>
## 2026-09-24 — Backup geral dentro de Configurações (v0.9.0)

**Pedido:** o "Centro de Dados" (backup) deve ficar na engrenagem **Configurações**, depois do
tema, e salvar **tudo de todas as abas** — histórico de orçamentos, contatos do Painel Whats,
etc.

**Feito:**
- `src/utils/backup.ts`: `montarBackup()` junta num único JSON **todas** as chaves locais —
  `orcamentos_historico_v1`, `orcamento_rascunho_v1`, `orcamentos_tema_v1`, `zap_contacts`,
  `zap_template`; `restaurarBackup()` valida e grava de volta (e ainda aceita o **backup antigo**
  do histórico, lista direta ou `{ orcamentos }`); `nomeArquivoBackup()` gera
  `backup-toyota-DD-MM-AAAA.json`.
- `ConfiguracoesTema`: seção **"BACKUP DOS DADOS"** logo abaixo do tema, com botões
  (ícone-only) **Exportar** e **Importar**; a importação avisa o resumo e **recarrega o app**
  para aplicar tudo.
- O card **"Centro de Dados" foi removido da aba Whats** (o backup agora é global) — o
  `BackupManager.tsx` foi apagado.
- **Gotcha corrigido no teste:** o tema e o template são **texto puro** no localStorage (não
  JSON); o `JSON.parse` falhava e a chave ficava de fora do backup. Agora tenta JSON e cai para
  a string crua (teste cobre).
- Testes: **51** (4 de backup + asserts no smoke); flyer continua **0 diferenças** no PNG.

<a id="v00805"></a>
## 2026-09-24 — TOTAL no resumo + caixa TOTAL GERAL + correção da fonte gigante (v0.8.5)

**Pedido:** no documento gerado, o "TOTAL GERAL" do Resumo Financeiro vira **"TOTAL"** = itens
**marcados** + revisão aprovada; e **abaixo da caixa "Itens Não Realizados"** criar uma caixa
**"TOTAL GERAL"** (só quando houver item desmarcado) com **tudo** (todos os itens + revisão).

**Feito (`QuoteTable`):**
- `totalSelecionado = revisaoAprovada + totalOrcamento` (marcados) → **"TOTAL:"** no Resumo
  Financeiro.
- `totalCompleto = revisaoAprovada + soma de todos os itens` → nova caixa **"TOTAL GERAL:"**
  (fundo `slate-50`, borda `slate-300`) depois da caixa de não realizados, condicional a
  `naoRealizados.itens.length > 0`.
- O **Parcelamento** passa a usar `totalSelecionado / numParcelas` (antes vinha do valor cheio e
  destoava do TOTAL). Com tudo marcado, o valor é idêntico ao de antes.
- **⚠️ Bug pego no teste (e corrigido):** o valor do novo TOTAL GERAL saiu **gigante** no PNG.
  Causa: `restaurarFontesReduzidas` trocava por substring e o reduzido de 10px (`9.9px`) casava
  dentro do de 30px (`29.9px`), virando **210px**. Fix: regex com limite numérico
  (`(?<![\d.])`) + teste de colisão 10px/30px.
- O **PNG do orçamento mudou de propósito** (rótulo "TOTAL" + caixa nova); o **flyer segue
  0 diferenças**. Testes: **46**.

**Gotcha:** a checagem "PNG idêntico à v0.4.2" deixa de valer para o orçamento a partir daqui —
foi uma mudança pedida no layout de saída.

<a id="v00804"></a>
## 2026-09-24 — Lembrar o último orçamento digitado (v0.8.4)

**Pedido:** ao reabrir o app, em vez do exemplo embutido, vir o **último orçamento** que o
usuário estava fazendo. (Também perguntou se algo vai para VPS/Firebase/nuvem: **não** — tudo é
`localStorage` do navegador, local.)

**Feito:** `src/utils/rascunho.ts` (`orcamento_rascunho_v1`) lê/salva os campos em edição
(descrição, dados do orçamento, ajustes, revisão/peças, desconto, parcelas e placa).
O `OrcamentosApp` inicializa os estados pelo rascunho (com fallback no exemplo) e salva a cada
mudança. Comportamento validado no Chromium: 1ª abertura sem rascunho mostra o exemplo;
digitar + recarregar restaura o que foi digitado; **"Limpar" + recarregar fica vazio** (não
volta o exemplo). É leve (poucos KB) e independente do histórico e do backup JSON.
Testes: **45** (1 novo); PNGs do orçamento/flyer: **0 diferenças**.

**Resposta ao usuário (memória):** nada sai do PC — o app é um HTML offline; histórico,
rascunho, tema e contatos ficam no `localStorage` do Chrome (típico 5–10 MB por arquivo/origem;
o histórico guarda até 100 orçamentos). Limpar dados do navegador apaga → usar o backup JSON.

<a id="v00803"></a>
## 2026-09-24 — Claude mais escuro + títulos das abas sem a linha embaixo (v0.8.3)

**Pedidos:** (1) o fundo do Claude (o que fica atrás das caixinhas) um pouco mais escuro;
(2) tirar a **linha horizontal** que corria embaixo dos títulos das abas e o espaço — o conteúdo
deve vir logo abaixo do título (como nos cards "1. DESCRIÇÃO DO REPARO"/"DADOS DA TABELA").

**Feito:**
- A **página já estava `#000000`** desde a v0.8.0 (quando o pedido foi "o que está atrás das
  caixinhas") — não dá para escurecer mais. O que ainda tinha folga era o **painel dos cards**
  (o cinza atrás dos campos) e as bordas: `--tema-painel #0a0a09 → #060605`,
  `--tema-borda-forte #171715 → #141412`, `--tema-borda-media #262624 → #212120`.
- Headers das três abas: removidos o `border-b border-slate-800` e o `pb-6`; agora são
  `mb-4 text-center` (vão de ~12px até o conteúdo). O subtítulo "Automação mensal de contatos"
  da aba Whats também saiu, para as três ficarem iguais.
- PNGs do orçamento/flyer: **0 diferenças**; testes: 44.

<a id="v00802"></a>
## 2026-09-24 — Impressão idêntica ao PNG + RESUMO LÍQUIDO compacto (v0.8.2)

**Pedidos:** (1) a **impressão** saía em formato diferente do PNG — maior, colunas com
proporção diferente e "HIGIENIZAÇÃO DO AR CONDICIONADO" quebrava em 2 linhas; (2) diminuir o
espaço **acima e abaixo** do RESUMO LÍQUIDO.

**Causa da impressão:** o navegador re-renderiza o HTML na largura do papel (o layout muda →
reflui o texto e as colunas), enquanto o PNG é capturado na largura fixa do documento (896px).

**Fix (impressão = imagem do PNG):** o botão IMPRIMIR/PDF agora gera o PNG (via `exportarPng`,
`pixelRatio: 3`) e imprime **essa imagem a 100% da largura da folha** — mesmo layout, mesmas
quebras e proporções; a única mudança é a escala para o papel. Implementação:
`QuoteTable` guarda o data URL em estado, mostra um `.area-impressao` (só `display:block` no
`@media print`) com a `<img>`, esconde o documento ao vivo
(`[data-impressao='imagem'] .preview-orcamento-holder { display:none }`) e chama
`window.print()` após o `img.decode()`; limpa no `afterprint`. Se a geração falhar, cai no
`window.print()` antigo.
- `@page { margin: 10mm }`; no print, `main`/`#result-section`/wrapper perdem `max-width` e
  padding para a imagem ocupar a largura útil; `.min-h-screen` vira branco (senão o fundo
  escuro do app pintava a folha, mesmo com o body branco).
- Validado gerando o PDF no Chromium e renderizando a página (pymupdf): 1 página A4, branca,
  "HIGIENIZAÇÃO DO AR CONDICIONADO" em **uma linha**, colunas idênticas ao PNG.

**RESUMO LÍQUIDO:** ganhou `compact` (era o único card da coluna direita sem) — o vão
título→1ª caixa caiu de ~42px para **18px** e o de baixo para **13px**.

**Testes:** 44; PNGs do orçamento/flyer: **0 diferenças**.

<a id="v00801"></a>
## 2026-09-24 — Menos espaço acima do título ORÇAMENTOS (v0.8.1)

**Pedido:** reduzir o espaço acima do título "ORÇAMENTOS".

**Feito:** o `main` do shell usava `pt-8` na aba de orçamentos; agora é **`pt-3` para as três
abas** (o Tire Flyer/Whats já somavam o `pt-1` do root). Gap medido: **32px → 12px**. PNGs:
0 diferenças. Testes: 44.

<a id="v00800"></a>
## 2026-09-24 — Botões só com ícone + fundo do Claude atrás dos cards em preto (v0.8.0)

**Pedidos:** (1) os botões devem ser **apenas ícone** (Histórico, Limpar, Limpar Texto,
Imprimir/PDF, Baixar imagem etc.); (2) o fundo do tema Claude — o que fica **atrás das
caixinhas** — mais escuro.

**Feito:**
- Todos os botões de ação ficaram **ícone-only**, com `aria-label` + `title` mantendo o texto
  (acessibilidade, tooltip e testes/Playwright por `getByRole('button', { name })`):
  ClearButton ("Limpar"/"Limpar Texto"), Histórico, Configurações, Imprimir/PDF, Baixar imagem,
  play do processar (orçamento e flyer), Confirmar e Baixar Imagem, Salvar Cliente, Exportar
  base, Importar, Copiar/Copiado, Pesquisar, Backup (JSON), Restaurar backup, Fechar,
  Limpar tudo e Abrir orçamento. O "NOTIFICAR" da aba Whats virou ícone com rótulo por estado
  (Notificar / Atrasado — notificar / Concluído).
- Abas e opções de tema (que são escolha, não ação) continuam com texto.
- Testes atualizados para clicar por `getByRole` — **44**; PNGs: **0 diferenças**.
- Claude: `--tema-fundo` → **`#000000`** (o que aparece atrás dos cards); painel `#0a0a09` e
  bordas `#171715/#262624` mantêm os cards visíveis.

<a id="v00708"></a>
## 2026-09-24 — Títulos centralizados, cards compactos e botão play (v0.7.8)

**Pedidos (em sequência):** (1) remover o subtítulo "Painel de Controle de Ofertas";
(2) padronizar os títulos **ORÇAMENTOS / PAINEL WHATSAPP / TIRE FLYER** no centro e com o mesmo
tamanho; (3) **remover o espaço** entre o título dos cards 1, 2 e 3 e o campo (rolar menos);
(4) trocar o texto **"PROCESSAR TUDO"** por um **ícone play**.

**Feito:**
- Headers das 3 abas com `text-center` e `text-4xl` (mesmo tamanho); subtítulo do Tire Flyer
  removido. **Mantive "ORÇAMENTOS" no plural** (como pedido na v0.7.7) — se quiser "ORÇAMENTO",
  é trocar uma palavra.
- Cards 1, 2 e 3 com **`compact`** (e o "DADOS DA TABELA" do Tire Flyer também). No `NeonCard`
  o `compact` passou a `px-6 py-3` (cabeçalho) e `px-6 pt-2 pb-4` (conteúdo) — o vão
  título→campo caiu de ~46px para **22px**. A coluna esquerda também foi de `space-y-10` → `space-y-6`.
- Botão de processar virou **ícone de play** (`Play` do lucide, preenchido), com
  `aria-label`/`title` "Processar Tudo" (o nome acessível é o que os testes e o Playwright usam).
  Testes atualizados de `getByText` para `getByRole('button', { name: … })`.
- Testes: **44**; PNGs do orçamento/flyer: **0 diferenças**.

<a id="v00707"></a>
## 2026-09-24 — Títulos das abas, maiúsculas no orçamento, histórico maior, Claude mais escuro (v0.7.7)

**Pedidos (em sequência):** (1) "TIRE FLYER" no lugar de "DASHBOARD TIRE FLYER" (TIRE branco,
FLYER na cor do tema); (2) título **"ORÇAMENTOS"** acima do card 1, na cor do tema;
(3) cards **"1. DESCRIÇÃO DO REPARO"** e **"3. AJUSTES MANUAIS (ID VALOR)"** só em maiúsculas
como o card 2; (4) **fonte maior dentro do histórico**; (5) fundo do **Claude mais escuro**.

**Feito:**
- Tire Flyer: `<h1>TIRE <span class="text-blue-500">FLYER</span></h1>` (o acento vira laranja no
  tema Claude via remap).
- Orçamentos: header interno `ORÇAMENTOS` (texto todo na cor de acento) dentro de `.ui-compacta`,
  com a mesma borda inferior das outras abas.
- Títulos dos cards 1 e 3 passaram a ser **maiúsculos no código-fonte** — o tema Claude remove o
  `text-transform` dos títulos (`.titulo-tema`), então só o texto-fonte garante maiúsculas nos
  dois temas.
- Histórico: data `13px→16px`, descrição `base→lg`, linha de valores `sm→base` (Líquido `base→lg`),
  busca/mensagens `sm→base`.
- Claude: fundo `#0a0a09 → #070706`, campo `#030303`, painel `#0e0e0d`, bordas
  `#1c1c1a/#2b2b28`.
- Testes atualizados (título da aba com `getByRole('heading', …)` e título do card 1 maiúsculo):
  **44**. PNGs do orçamento/flyer: **0 diferenças**.

<a id="v00706"></a>
## 2026-09-24 — Aba Whats com o título colado no topo (v0.7.6)

**Pedido:** reduzir o espaço entre "PAINEL WHATSAPP" e a barra superior (Toyota Weiand Lajeado).

**Feito:** root da aba Whats de `py-10` → **`pt-1 pb-20`** e o cabeçalho interno de
`mb-10 pb-8` → `mb-8 pb-6` — mesmo padrão do Tire Flyer. Gap medido no Chromium: **15px**
(antes ~42px). PNGs do orçamento/flyer: **0 diferenças**. Testes: 44.

<a id="v00705"></a>
## 2026-09-24 — Ajustes de layout do Orçamentos + Claude mais escuro (v0.7.5)

**Pedidos (em sequência):** (1) Histórico no cabeçalho do card **1. Descrição do Reparo**, ao
lado do "Limpar"; (2) **fundo do tema Claude mais escuro**; (3) o **visual** do orçamento gerado
com **metade do tamanho** (PNG igual); (4) **RESUMO LÍQUIDO na coluna da direita**, logo abaixo
do APROVADO E DESCONTO, com os valores **empilhados**.

**Feito:**
- Histórico agora fica no `actions` do card 1 (`[Histórico] [Limpar]`), saiu de cima do card
  APROVADO E DESCONTO.
- Claude: fundo `#0f0f0e → #0a0a09`, campo `#050504`, painel `#121211`, bordas
  `#222220/#333330` (mais escuro, mantendo o contraste painel > página > campo).
- **Preview do orçamento:** `.preview-orcamento { transform: scale(.5); transform-origin: top
  center }` com a altura do container medida por `ResizeObserver` (mesma técnica do flyer);
  `@media print` reseta o transform/altura → **impressão/PDF saem no tamanho normal** e o
  **PNG continua idêntico** (validado: 0 diferenças).
- **RESUMO LÍQUIDO** foi para dentro da coluna direita (`xl:col-span-4`), condicional ao
  `visivel`, com `space-y-3` (Total Peças, Total Serviços, Desc., Valor Líquido um abaixo do
  outro; padding `p-4` por causa da coluna estreita). Medido: mesma coluna/largura do APROVADO
  e gap de 24px físicos.
- Testes: 44. PNGs do orçamento/flyer: **0 diferenças** nos dois temas.

<a id="v00704"></a>
## 2026-09-24 — Aba Whats sem a "Agenda de Tarefas" + Limpar nos Ajustes Manuais (v0.7.4)

**Pedidos:** (1) remover toda a parte de **Agenda de Tarefas** (Controle Operacional Weiand,
cronômetros, "Pátio limpo: Sem tarefas pendentes"); (2) o card **3. Ajustes Manuais (ID VALOR)**
também precisa do botão "Limpar".

**Feito:**
- Card dos ajustes ganhou o mesmo **`ClearButton`** dos cards 1 e 2 (`actions=`, limpa só aquele
  campo).
- `TaskManager.tsx` **apagado**; saíram o estado `tasks`, os efeitos/handlers de tarefa e a
  chave `zap_tasks` do `localStorage` (a antiga fica no navegador, sem uso).
- `BackupManager`: backup/restauração agora só com **contatos + mensagem padrão** (arquivos
  antigos com `tasks` importam normalmente, o campo é ignorado; o alerta não fala mais em
  tarefas).
- Textos ajustados: subtítulo "Automação mensal de contatos" e "contatos e da mensagem padrão"
  no Centro de Dados.
- Testes: os 2 casos da aba Whats foram atualizados (um deles agora garante que não existe mais
  "Agenda de Tarefas"). Seguem **44** e os PNGs do orçamento/flyer com **0 diferenças**.

<a id="v00703"></a>
## 2026-09-24 — Fonte do campo de pneus = campo do orçamento + Histórico fora da caixa (v0.7.3)

**Pedido:** (1) o conteúdo de "DADOS DA TABELA" (pneus) com a **mesma fonte/tamanho** do campo
de "DADOS DO ORÇAMENTO"; (2) o botão **Histórico** estava atrás do card APROVADO E DESCONTO —
deixá-lo à direita, fora da caixinha.

**Feito:**
- Textarea dos pneus: `text-base` → **`text-lg leading-relaxed`** (agora igual ao do orçamento:
  mono 18px, line-height 29,25px — conferido por `getComputedStyle`).
- Histórico: removido o `-mb-4` que puxava o card por cima do botão (o card pinta depois e
  cobria a borda inferior). Agora fica **acima e à direita** do card, fora da caixa (vão ~25px).
- PNGs do orçamento/flyer seguem **0 diferenças**. Testes: 44.

<a id="v00702"></a>
## 2026-09-24 — Cabeçalho padrão nas 3 abas + Histórico ao lado do APROVADO E DESCONTO (v0.7.2)

**Pedido:** padronizar o cabeçalho das abas (no Orçamentos o botão Histórico fazia o título
"TOYOTA WEIAND LAJEADO" quebrar em duas linhas, diferente do Flyer/Whats) e, como o botão
Histórico cabe ao lado da tabela **APROVADO E DESCONTO**, tirá-lo do topo.

**Feito:**
- Botão **Histórico saiu do header** (que agora é idêntico nas três abas) e foi para a coluna
  da direita, **logo acima do card APROVADO E DESCONTO** (`OrcamentosApp`, prop nova
  `onAbrirHistorico`). O modal continua o mesmo.
- Marca do header com `whitespace-nowrap` — nunca mais quebra em duas linhas.
- Validado no Chromium: nas 3 abas a marca tem 1 linha e não há botão de histórico no header;
  o botão novo abre o modal. PNGs do orçamento/flyer seguem **0 diferenças**. Testes: 44.
- (Aba Tire Flyer também ganhou o conteúdo centralizado com margens laterais na v0.7.2 —
  largura útil do painel ~pela metade, `max-w-[1150px] mx-auto`.)

<a id="v00701"></a>
## 2026-09-24 — Tire Flyer mais compacto (campo, preview e topo) (v0.7.1)

**Pedido:** (1) reduzir pela metade a altura do campo "DADOS DA TABELA"; (2) reduzir pela
metade o **visual** do flyer (o PNG não); (3) deixar pouco espaço entre "DASHBOARD TIRE FLYER"
e a barra de cima.

**Feito:**
- Textarea `h-[500px]` → **`h-[250px]`** (altura do campo pela metade).
- Preview: coluna passou de `w-[750px]` → **`w-[375px]`** e o flyer visual com
  **`transform: scale(0.5)`** (transform não afeta a captura). A altura do container é medida
  com `ResizeObserver` (`alturaFlyer * 0.5`) para não sobrar buraco no layout.
- Topo: `main` usa `pt-3` nas abas que não são orçamentos e o root do Tire Flyer `pt-1` →
  **gap de ~68px para 15px** entre o header e o título.
- **⚠️ Pegadinha resolvida:** a primeira tentativa usou `zoom: 0.5` aninhado (0,75 × 0,5) e o
  **PNG saiu 1500x3724** (4px menor) — o zoom aninhado arredonda o `clientHeight` que o
  html-to-image usa. Com `transform` + altura medida, o PNG voltou a **1500x3728 com 0
  diferenças** (nos dois temas). Testes: 44.

<a id="v00700"></a>
## 2026-09-24 — Nova aba "Whats" (contatos/agenda do WhatsApp) (v0.7.0)

**Pedido:** terceira aba (ao lado de Tire Flyer) com o app **ZapZap Manager** do AI Studio —
gerenciador de contatos, template de mensagem, agenda com cronômetros por tarefa e
backup/restauração JSON. Nome da aba: **Whats**. Visual unificado às outras abas.

**Feito:**
- Portado 1:1 para `src/whats/` (`WhatsApp.tsx` + `types.ts` + `components/`
  `TaskManager`, `ContactForm`, `MessageEditor`, `BackupManager`, `ContactList`) — só as
  classes mudaram.
- **Visual**: cartões `bg-slate-900/60 border-slate-800`, campos `campo-tema` (mais escuros no
  Claude), textos `slate-*`, títulos com `titulo-tema` (serifada no Claude), acento do app
  azul → **laranja no tema Claude** (via remap). Status "concluído" em `green-*` (não remapeado,
  senão viraria laranja no Claude e confundiria com o "NOTIFICAR").
- **Logica intacta**: localStorage `zap_contacts`/`zap_tasks`/`zap_template` (separado do
  histórico/tema), sincronização entre abas, `wa.me` abre em nova aba, backup JSON por
  Blob/FileReader. `@google/genai` do template **não** foi trazido (nenhum componente usa).
- Testes: **44** (2 novos: render dos painéis; cadastrar contato e tarefa com persistência).
  E2E no Chromium: copiar (clipboard ok em `file://`), `wa.me` abre com telefone formatado,
  "CONCLUÍDO" após notificar; PNGs do orçamento/flyer seguem **0 diferenças**.

**Gotchas:**
- `navigator.clipboard` funciona no `file://` (contexto seguro no Chrome) — validado.
- Cuidado ao usar `emerald-*` em estados semânticos: no Claude ele é remapeado para o laranja
  do tema; use `green-*` quando precisar de verde de verdade.

<a id="v00603"></a>
## 2026-09-24 — Tema Claude: textos em branco (v0.6.3)

**Pedido:** no tema Claude, as fontes devem ser de cor **branca**.

**Feito:** `--tema-texto`/`--tema-titulo` (texto principal, títulos e valores) passaram para
`#ffffff` e a escala secundária ficou em cinzas neutros (`#ededed`/`#cccccc`/`#a1a1a1`/`#787878`)
em vez dos tons quentes — mantém a hierarquia (rótulos um pouco mais apagados) com o texto
branco. Saídas revalidadas pixel a pixel vs v0.4.2: **0 diferenças**. Testes: 42.

<a id="v00602"></a>
## 2026-09-24 — Tema Claude ainda mais escuro + "Limpar Texto" sem confirmação (v0.6.2)

**Pedidos:** (1) fundo do Claude mais escuro; (2) o que acontece no "Limpar Texto" da tabela de
pneus — por que aparece a janela de confirmação?

**Feito:**
- Paleta do Claude escurecida de novo: fundo `#191918 → #0f0f0e`, campo `#111110 → #080807`,
  painel `#232321 → #171716`, bordas `#343430/#45443e → #292926/#3b3b36`.
- **Limpar Texto:** o `window.confirm` tinha vindo do app original do AI Studio e, ao confirmar,
  apagava o campo **e** o flyer. Agora é igual à aba de orçamentos: **sem janela**, limpa só o
  texto e mantém o flyer (que só muda no "Processar e Atualizar Flyer") — evita perder o último
  preview por engano. Validado no Chromium (nenhum diálogo; campo vazio; flyer intacto).
- Saídas revalidadas pixel a pixel vs v0.4.2: **0 diferenças**. Testes: 42.

<a id="v00601"></a>
## 2026-09-24 — Tema Claude: fonte no conteúdo dos campos + fundo mais escuro (v0.6.1)

**Pedido:** (1) o que é digitado/colado nos campos também com as fontes do Claude; (2) o fundo
do Claude mais escuro.

**Feito:**
- `--tema-fonte-conteudo` (Original = Inter; Claude = Source Serif 4) + regra
  `[data-tema='claude'] textarea, input, select { font-family: var(--tema-fonte-conteudo) }`.
  A serifada entra em tudo que se digita/cola: descrição, **DADOS DO ORÇAMENTO**, ajustes,
  tabela de pneus, placa e busca do histórico. Na tabela de pneus as colunas continuam
  alinhadas porque os TABs viram paradas fixas (não depende da fonte ser mono).
- **Fundo mais escuro** (a pedido): Claude passou de `#262624` → **`#191918`** no fundo,
  `#111110` no campo, `#232321` no painel; bordas/textos reajustados para manter contraste.
- Saídas revalidadas pixel a pixel contra a v0.4.2: **0 diferenças** (a regra dos campos só
  existe sob `[data-tema='claude']`, e os documentos de saída não têm campos). Testes: 42.

**Gotcha:** se algum dia quiser a tabela de pneus em fonte mono no tema Claude, é só remover
`textarea` da regra (o campo continua com a classe `font-mono` no tema Original).

<a id="v00600"></a>
## 2026-09-24 — Tema Claude com tipografia e acabamento do Claude (v0.6.0)

**Pedido:** o tema Claude não devia ser só cores — "quero letras e estilo Claude".

**Feito:**
- **Serifada:** `@fontsource/source-serif-4` (400/600/700, embutida) importada no `index.css` —
  aproximação livre da **Tiempos** do Claude (paga, não dá para embutir). Variável
  `--tema-fonte-titulo` (Original = Inter; Claude = Source Serif 4) aplicada pela classe
  `.titulo-tema` nos títulos da interface: `NeonCard`, marca do header, "DASHBOARD TIRE FLYER",
  os 4 valores do resumo e o título do histórico. No Claude a classe também tira o caixa-alta e o
  peso 900 (`text-transform: none; font-weight: 600; letter-spacing: -0.01em`) — a marca vira
  **"Toyota Weiand Lajeado"** em serifada, no espírito do Claude.
- **Espaçamento das maiúsculas:** `--tracking-widest` remapeado por `@theme inline` (Claude =
  0.05em) e **resetado nas saídas** (o rótulo do orçamento e as tags do flyer usam a classe).
- **Acabamento chapado (estilo Claude):** sem glow nos `NeonCard` (`data-neon-glow` oculto),
  bolinha laranja sem brilho, **sem sombra em botões** no Claude e cantos dos cards 24px → 20px
  (`data-neon-card`/`data-neon-box`, também no painel do histórico).
- **Saídas intactas:** revalidado pixel a pixel contra a v0.4.2 — **0 diferenças** no PNG do
  orçamento (2688x2736) e do flyer (1500x3728), nos **dois** temas. Testes: 42.

**Gotchas:**
- `[data-tema='claude'] button { box-shadow: none }` é seguro porque os **documentos de saída
  não têm botões** (as ações ficam fora do `#printable-quote` e do flyer).
- Ao marcar um título novo da interface, usar `.titulo-tema`; **não** usar a classe dentro das
  saídas (mudaria o PNG).
- Build subiu de ~715 kB para ~901 kB por causa da serifada embutida (aceitável para uso local).

<a id="v00500"></a>
## 2026-09-24 — Temas Original/Claude + logo Toyota + aba de pneus unificada (v0.5.0)

**Pedido (3 partes):** (1) as duas abas com o **mesmo estilo**; (2) **botão de configurações**
para trocar o tema entre **Original** e um segundo estilo que é **cópia do visual do Claude
(tema escuro: cinzas + laranja)**, com contraste de cinzas entre a "barra" do card e o campo;
(3) trocar o carrinho do header pelo **logo novo** (`logo_toyota.PNG`, enviado no repo).

**Decisões do usuário:** o tema muda **só a interface** (os PNGs enviados ao cliente continuam
iguais); **dois** temas (Original/Claude); no Original a aba de pneus **iguala aos orçamentos**.

**Feito:**
- **Logo:** o PNG do repo é branco com **fundo preto opaco** (viraria um retângulo no header).
  Gerei `src/assets/logo_toyota.png` com fundo transparente (alpha = luminância, RGB branco) e
  usei no lugar do `<Car>` (`h-11 w-auto`). O original ficou em `src/assets/logo_toyota.PNG`.
- **Aba de pneus unificada:** `TireFlyerApp` agora usa `NeonCard`, tipografia e botões da aba de
  orçamentos (acento azul); `ClearButton` extraído para componente compartilhado. O **flyer
  (output) não mudou**.
- **Sistema de tema:** `data-tema` no `<html>` + `@theme inline` no `index.css` remapeando os
  tokens do Tailwind para variáveis `--tema-*` (`--color-slate-950: var(--tema-fundo)` etc.).
  `src/utils/tema.ts` (tipo/leitura/persistência em `localStorage["orcamentos_tema_v1"]`,
  aplicado **antes do primeiro render** no `main.tsx` para não piscar). Componente
  `ConfiguracoesTema` (engrenagem no header; fecha com clique fora/Esc).
- **Saídas intactas (regra dura):** `#printable-quote` e o flyer (`data-saida="flyer"`)
  **resetam as variáveis** para os valores originais do Tailwind, então o remap global não os
  atinge. Validado pixel a pixel contra a v0.4.2: **0 pixels diferentes** no orçamento
  (2688x2736) e no flyer (1500x3728), nos **dois** temas.
- **Contraste pedido:** campos usam `.campo-tema` (`--tema-campo`) — no Claude (#1f1f1e) ficam
  mais escuros que o painel (#30302e); o cabeçalho do NeonCard e o fundo do card têm cinzas
  distintos. `NeonCard` ganhou `data-neon-glow`/`data-neon-dot` para o Claude trocar o brilho
  colorido por laranja neutro.
- Testes: **42** (2 novos: alterna e persiste o tema; documentos de saída marcados com os
  atributos que o CSS usa para o reset).

**Gotchas:**
- `@theme inline` com `var()` faz a utility emitir `var(--tema-...)` (inclusive nos modificadores
  de opacidade, via `color-mix`) — é isso que permite resolver o tema por cascata e "resetar"
  por subtree. Sem o `inline`, a utility usaria o valor resolvido e a troca de tema não pegaria.
- Ao remapear um token novo, **incluir o token no bloco de reset** de `#printable-quote,
  [data-saida='flyer']` (valores originais em oklch), senão a saída muda de cor.
- `body` usa `var(--tema-fundo)`; o `@media print` continua forçando fundo branco.

<a id="v00402"></a>
## 2026-09-24 — Tire Flyer: largura do campo ajustada (v0.4.2)

**Pedido:** a v0.4.1 deixou a largura "um pouco exagerada"; reduzir um pouco.

**Feito:** `main` do Tire Flyer de `max-w-[1600px]` → **`max-w-[1400px]`**. Textarea fica com
**~927px** lógicos em telas 1600+ (era ~1194) e **882px em 1366** (igual, o viewport limita
antes) — segue **sem rolagem lateral** (`scrollWidth == clientWidth`) e as duas colunas
continuam. Flyer (750px) e PNG (1500px) inalterados. Testes: 40.

<a id="v00401"></a>
## 2026-09-24 — Tire Flyer: campo "Dados da Tabela" mais largo (v0.4.1)

**Pedido:** o textarea da tabela de pneus era estreito — tinha que rolar para o lado para ver
as colunas.

**Feito:** o `main` do shell virou condicional por aba: **orçamentos seguem `max-w-[1050px]`**
(nada muda) e o **Tire Flyer usa `max-w-[1600px]`** (como o app original do AI Studio). Com o
`zoom: .75` da seção, o textarea passou de ~490px para **~882px** (tela 1366) / **~1194px**
(1600+) de largura lógica; medido `scrollWidth == clientWidth` em 1366/1600/1920 → a tabela
padrão aparece **sem rolagem horizontal**. As duas colunas (entrada + preview) continuam.

**Sem regressão:** flyer segue 750px lógicos e o PNG segue **1500x3728** (`pixelRatio: 2`);
main da aba de orçamentos continua 1050. Testes: 40 (nenhum novo — só layout).

<a id="v00400"></a>
## 2026-09-24 — Nova aba "TIRE FLYER" (promoção de pneus) (v0.4.0)

**Pedido:** uma nova aba no header (onde está "Toyota Weiand Lajeado") com o app **Tire Flyer**
(feito no AI Studio): cola a tabela de pneus e gera um flyer 750px para WhatsApp. Arquivos
recebidos: `App.tsx`, `types.ts`, `utils/parser.ts`, `components/Flyer.tsx`, `index.html`
(CDN do Tailwind/html-to-image + Inter), `index.tsx`, `package.json` (**não existe `index.css`**
— a base é o `<style>` do `index.html`).

**Feito:**
- `src/App.tsx` virou **shell**: header compartilhado + abas **Orçamentos** / **Tire Flyer**
  (azul/verde). O botão "Histórico" aparece só na aba de orçamentos. As duas abas ficam
  **montadas** (a inativa com `hidden`) para trocar de aba **sem perder** o que foi digitado.
- Orçamentos movido 1:1 para `src/components/OrcamentosApp.tsx` (recebe
  `historicoAberto`/`onFecharHistorico` do shell; o resto intacto).
- Tire Flyer em `src/tire/` 1:1 (`types.ts`, `utils/parser.ts`, `components/Flyer.tsx`,
  `TireFlyerApp.tsx`); única troca: o `window.htmlToImage` (CDN) virou o `exportarPng` local
  (`../utils/exportImage`), então o flyer também não sofre a **redução de 0,1px** de fonte na
  captura (mesma causa do vão corrigido na v0.3.2).
- Aba com `.ui-compacta` (75%) como o resto do app; o preview fica com 562px, mas o `zoom`
  **não afeta a captura** (testado: `clientWidth` continua 750 → PNG **1500px** com
  `pixelRatio: 2`, igual ao original).
- `DEFAULT_INPUT` usa **TABs de verdade** entre colunas (conferido com `cat -A`).
- Testes: **40** (6 novos de `parsePreco`/`formatarPreco`/`parseInput` + 2 de UI da aba).

**Validação (Playwright no build):** troca de abas, "Histórico" some/volta, "Processar e
Atualizar Flyer" atualiza o preview, download `Promocao-265-60R18.png` = **1500x3728**
(750 × 2), e o PNG de orçamento segue 2688 de largura (nada mexido).

**Gotchas:**
- O flyer usa `font-sans` (stack do sistema) e emojis 🎁/🛡️ — igual ao app original; no Linux
  headless o emoji vira quadradinho, no Windows renderiza normal. **Não** trocar para Inter sem
  pedido (muda o layout do PNG que o cliente já recebe).
- Como `getImageSize` do html-to-image usa `clientWidth`, o `zoom: .75` do wrapper não deforma
  o PNG. Não "consertar" isso pondo zoom no `body`.
- `Flyer` tipado com `React.RefObject<HTMLDivElement | null>` (React 19).

<a id="v00302"></a>
## 2026-09-24 — PNG: último item não realizado longe do "Total Não Realizado" (v0.3.2)

**Pedido:** ao gerar o PNG, o último item da caixa "Itens Não Realizados" ficava **longe**
(um vão de uma linha inteira) do divisor/"Total Não Realizado"; na tela do navegador o
espaçamento era normal. Só no PNG.

**Causa (reproduzida em Chromium headless com o build real):** o `html-to-image` grava no
clone os estilos computados, mas **reduz todo `font-size` em 0,1px**
(`Math.floor(px) - 0.1`, ver `node_modules/html-to-image/lib/clone-node.js` → `cloneCSSStyle`,
caminho de fallback quando `getComputedStyle().cssText` é vazio — o caso do Chrome). Medido no
clone: `font: 700 23.9px / 32px Inter` onde o navegador usa 24px. Numa descrição que fica **no
limite da quebra**, o texto quebra em 2 linhas no navegador e **cabe em 1 linha no SVG**;
como a altura da linha vai **fixa** no clone (copiada do navegador), sobra o vão de uma linha
(32px) exatamente antes do divisor — o sintoma do usuário. Confirmado por experimento:
restaurando `23.9px` → `24px` no SVG antes de virar canvas, o vão volta ao normal
(caso `PASTILHAS DE FREIO DIANTEIRAS E TR`: vão 49px → 17px).

**Fix:** novo `src/utils/exportImage.ts` — `exportarPng()` chama `htmlToImage.toSvg()`,
**restaura os font-sizes reais** (`restaurarFontesReduzidas()`; a lista de tamanhos é medada no
documento e o valor reduzido de cada um é `floor(px) - 0.1`) e desenha o SVG no canvas
(`pixelRatio`, `backgroundColor`, limite de 16384px do canvas). O `QuoteTable` passou a usar
`exportarPng` no botão BAIXAR IMAGEM, com o mesmo `filter` (`data-ui`) de antes. Testes: **32**
(5 novos do `restaurarFontesReduzidas`, incluindo atalho `font` e tamanhos fracionários).

**Validação no build (Playwright + Chromium headless, clique no botão real e download
interceptado):** varredura de 28 a 100 caracteres de descrição (`n` par): **37/37 casos com o
nº de linhas do PNG igual ao do navegador**; antes, `n=34` (2→1 linha) e `n=56` (3→2) davam o
vão. Documento completo do caso padrão conferido visualmente: tabela, resumo e caixa corretos.

**Gotchas:**
- O HTML final é autocontido e as fontes vão embutidas no SVG gerado pelo `toSvg` — o desenho
  manual no canvas mantém o PNG offline e sem recursos externos.
- O `checkCanvasDimensions` do html-to-image foi replicado (escala máx. 16384px) para não
  quebrar com orçamentos muito altos no `pixelRatio 3`.
- Nunca "consertar" isso mexendo no CSS da linha (altura fixa continua sendo copiada): o
  problema é a métrica da fonte na captura, não o layout do navegador.

<a id="v00301"></a>
## 2026-09-24 — Desmarcados riscados no PNG + caixa "Itens Não Realizados" (v0.3.1)

**Pedido (3 partes):** (1) ao desmarcar um item, o PNG saía com linhas mais altas/distorcidas;
(2) os desmarcados devem **aparecer** no orçamento (fonte mais clara + riscado), em vez de
sumir; (3) nova caixa **"Itens Não Realizados"** fora do Resumo Financeiro, com a soma dos
desmarcados — e **só** quando houver algum.

**Feito:**
- **Altura das linhas:** removido o `opacity-45` da `<tr>` (opacidade na linha + filtro
  removendo linhas eram os suspeitos da distorção na captura) e removido o `data-fora` e o
  filtro correspondente — as linhas agora são **sempre** capturadas. O desmarcado troca só
  cor/decoração: descrição e valor em `text-slate-400 line-through` (não mexe em métrica de
  layout). Regra `@media print [data-fora]` também removida.
- **Caixa "Itens Não Realizados":** novo `itensNaoRealizados(summary, selecionados)` em
  `quoteLogic.ts` (puro; devolve itens + total). Renderizada **dentro do documento**, depois do
  Resumo Financeiro, em vermelho claro, com cada item riscado e `Total Não Realizado:`; some
  quando todos estão marcados.
- Testes: **26** (caso do total dos não realizados + UI: caixa aparece ao desmarcar, some ao
  remarcar, e não existe com tudo marcado).

**Lição:** para "apagado" em documento que vira imagem, usar **cor de texto** (não `opacity`
na linha) e **nunca** filtrar a linha inteira — o html-to-image captura a tela e pequenas
diferenças de estilo podem alterar a métrica das linhas.

<a id="v00300"></a>
## 2026-09-24 — Interface a 75% + caixinhas para escolher os itens (v0.3.0)

**Pedidos:** (1) a interface ficava confortável só com o Chrome a 75% → deixar o app já nesse
tamanho (fonte, campos etc.); (2) caixinhas ao lado dos itens para marcar/desmarcar — só as
marcadas entram no orçamento.

**Feito (1) — escala 75% sem tocar no documento de saída:**
- `index.css`: `.ui-compacta { zoom: 0.75 }`. Aplicada **por seção** (header, grade de
  entrada, cartão de resumo, botões da tabela e **painel** do histórico). O
  `#printable-quote` fica **fora** de propósito: o PNG que vai ao cliente não muda.
- `main` → `max-w-[1050px] px-[30px]` (1400/0.75 e 40/0.75) para o conteúdo ocupar a mesma
  largura/posição que o usuário via com o navegador a 75%. Gaps externos ajustados
  (`pt-8`, `mt-14`, `space-y-8`, `pb-24`).
- No modal, o zoom foi no **painel**, não no overlay `fixed inset-0` (evita quirks de
  `position: fixed` + `zoom`); `max-h-[85vh]` dentro do zoom fica ~64vh físicos — ok.

**Feito (2) — seleção de itens:**
- `recalcularComSelecao(summary, selecionados)` em `quoteLogic.ts` (pura e testada): deriva as
  peças da revisão (`totalPecasGeral − soma das peças adicionais`) e refaz peças/serviços/
  desconto/líquido/adicional só com os marcados. `items` continua completo para a tabela.
- `App`: estado `selecionados: Set<number>` (reset para todos ao processar/abrir do
  histórico); cartões e tabela usam o resumo recalculado.
- `QuoteTable`: checkbox na célula "Item" (`data-ui="1"`), linha desmarcada com `opacity-45` +
  riscado e `data-fora="1"`.
- **Tirar do PNG/impressão:** `print:hidden` **não** resolve a captura (html-to-image é da
  tela, não de impressão) → usados `data-fora`/`data-ui` + regra `@media print { [data-fora],
  [data-ui] { display:none } }` **e** `filter` no `toPng` (ignora esses nós). O PNG sai
  exatamente como antes quando tudo está marcado.

**Testes: 25** (3 novos do recálculo + 1 de UI desmarcando um item e vendo o total cair).

**Gotcha:** `Set` no estado do React → sempre criar um `new Set(prev)` ao alternar; mutar o
mesmo Set não re-renderiza.

<a id="v00205"></a>
## 2026-09-24 — Pesquisar no histórico por data ou placa (v0.2.5)

**Pedido:** botão de busca no histórico (entre "Restaurar backup" e "Limpar tudo") por **data
ou placa**.

**Feito:**
- `filtrarHistorico(lista, termo)` + `normalizarBusca` em `utils/historico.ts`: compara em
  **maiúsculas sem separadores** (`/[^A-Z0-9]/`), então `24/09`, `2026` e `abc-1d23` funcionam;
  termo vazio devolve tudo. Lógica fora do componente → testável.
- `HistoryModal`: botão **Pesquisar** (azul quando ativo) revela um campo com lupa e ✕; filtra
  ao digitar; mostra `N de M`; "Nenhum orçamento encontrado." quando não bate; a busca é
  resetada ao abrir/fechar. Backup/limpar continuam agindo no histórico **inteiro** (não no
  filtro).
- Testes: **21** (casos de `filtrarHistorico` + teste de UI do modal pesquisando por placa e
  por data).

**Gotcha:** no teste de UI, **não** usar `adicionarAoHistorico` para semear datas — a função
gera `id`/`criadoEm` próprios (sempre "agora"). Para testar busca por data, gravar direto no
`localStorage["orcamentos_historico_v1"]` com os registros desejados.

<a id="v00204"></a>
## 2026-09-24 — Sem espaço acima dos campos da direita (v0.2.4)

**Pedido:** remover o espaço acima de Total Revisão, Peças na Revisão, etc. (a v0.2.3 já tinha
compactado os inputs, mas ainda sobrava respiro).

**Feito:**
- `NeonCard` ganhou o prop opcional **`compact`** (`px-6 py-4` no cabeçalho e `px-6 py-4` no
  conteúdo, em vez de `px-8 py-6`/`p-8`). Usado só no card **APROVADO E DESCONTO**.
- No card direito, grupos de campos de `space-y-4` → **`space-y-2`**.
- `compact` é opcional (default `false`) — os cards da esquerda e o resumo ficam como eram.

**Gotcha:** para reduzir espaçamento de um card só sem mexer nos outros, prop com default é
melhor que alterar o `NeonCard` global (o mesmo componente veste as 3 seções da esquerda).

<a id="v00203"></a>
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

<a id="v00202"></a>
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

<a id="v00201"></a>
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

<a id="v00200-1"></a>
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

<a id="v00200"></a>
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

<a id="bloco-2026-09-24-quotelogic-integrado-testes-de-logica-exemplo-hil"></a>
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

<a id="bloco-2026-09-24-scaffold-do-projeto-web-build-de-arquivo-unico-ba"></a>
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
