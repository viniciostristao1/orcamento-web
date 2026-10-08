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

O app tem **três abas**: **Orçamentos** (acima), **Tire Flyer** (v0.4.0 — cola a tabela de
pneus em TABs e gera um flyer de promoção **750px**, exportado em PNG) e
**Dados** (v0.15.0 — tabelas e notas de apoio: peças, O.S's etc.). A aba **Whats**
saiu na v0.117.0 (os lembretes de orçamentos, flyer e rápidos cobrem o uso).
As três abas compartilham o mesmo estilo e há um **botão de configurações** (v0.5.0) para alternar o tema
da interface. São **5 temas** (a v0.29.0 removeu o Terracota e o Executivo Premium;
a v0.119.0 removeu o Suave Arredondado):
**Azul** (padrão, era "Original"), **Claro** (modo claro, era "Claro Papel"), **Verde WhatsApp**,
**Monocromático Técnico** (cinza + laranja) e **Grafite**
(v0.19.0 — estilo das tabelas do Claude.ai: quase-preto, cabeçalho mais claro, grade sutil,
fonte Plus Jakarta Sans). O tema vale **só para a interface** — o PNG do cliente não muda.

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
  restaurar JSON**; desde a v0.70.0 excluir um orçamento pede confirmação, nas duas abas). Botão "Histórico" no header; a lista mostra **data · N itens** ao lado e
  fonte maior (v0.2.2). Desde a v0.40.0 o resumo dos itens no cartão ocupa **duas linhas**
  (`line-clamp-2`; era `truncate`, uma linha só).
- **Ajustes Manuais** (v0.7.4) tem o mesmo botão **Limpar** dos cards 1 e 2.
- **Rascunho do orçamento** (v0.8.4): `utils/rascunho.ts` (`orcamento_rascunho_v1`) guarda os
  campos em edição a cada mudança e os restaura ao abrir (sem rascunho, cai no exemplo).
  "Limpar" + reabrir fica vazio. **Tudo é local** (`localStorage`) — nada de VPS/nuvem.
- **Último documento gerado** (v0.10.0): `utils/ultimoOrcamento.ts` (`orcamento_ultimo_v1`)
  guarda o resumo + a marcação dos itens; ao abrir, o orçamento já aparece na tela (sem
  processar de novo). Também entra no backup geral.
- **Layout dos Orçamentos** (sem números nos títulos desde a v0.92.0): botão **Histórico
  no card do SISTEMA** (ao lado do + e da borracha); **MENU DADOS** em lateral esquerda
  fixa (ideia 03: barra âmbar no item, quase-preto; v0.98.0, era a faixa SUB ATALHOS à
  direita); centro na ordem **SISTEMA (Nº, Data, Telefone + Placa e Nome abaixo) →
  DADOS**; direita na ordem **APROVADO E DESCONTO (revisão, desconto, parcelas) →
  AJUSTES → RESUMO LÍQUIDO → DESCRIÇÃO**; página em `max-w-[1400px]`;
- **Play aproveita a revisão** (v0.93.0): com DESCRIÇÃO/DADOS vazios, vale o texto já
  extraído no card (anexar + play direto gera); o alerta só aparece sem nada em nenhum
  dos dois lugares. **preview do orçamento na metade** na tela
  (`.preview-orcamento`, `transform: scale(.5)` + altura medida; `@media print` reseta → a
  impressão sai normal). Título interno **ORÇAMENTOS** na cor de acento (v0.7.7) e títulos dos
  cards em **maiúsculas no texto-fonte**. Desde a v0.35.0 o conteúdo de **DESCRIÇÃO DO REPARO**
  usa `text-lg` — o mesmo tamanho de **DADOS DO ORÇAMENTO** (era `text-xl`; são campos “parentes”).
- **Histórico com fontes maiores** (v0.7.7): data 16px, descrição 18px, valores 16px.
- **Títulos internos removidos** (v0.103.0; antes "Títulos das abas", v0.8.3): as telas
  não têm mais cabeçalho próprio — a aba ativa (sublinhado âmbar) já diz onde estamos.
  As **sub-abas da aba Dados** são `text-lg` sem tracking com
  `font-family: var(--tema-fonte-conteudo)` — igual aos títulos das colunas (`thead th input`).
  Desde a v0.71.0 a sub-aba minimizada é **fantasma azul** (`bg-blue-500/10 text-blue-200`,
  era cinza) e a aberta é azul forte preenchido. Desde a v0.102.0 os **botões das abas
  superiores** são só texto com traço âmbar na ativa (ideia 01; antes pílulas `px-4 py-1`).
- **Botões são ícone-only** (v0.8.0): sempre com `aria-label` + `title` com o texto da ação —
  é o que os testes e o Playwright usam (`getByRole('button', { name: … })`). Abas e opções de
  tema continuam com texto.
- **Totais do documento** (v0.8.5): no Resumo Financeiro o rótulo é **"TOTAL"** =
  itens **marcados** + revisão aprovada (o Parcelamento usa essa mesma base); a caixa
  **"TOTAL GERAL"** (todos os itens + revisão) só aparece **quando há item desmarcado**, logo
  abaixo de "Itens Não Aprovados".
- **Impressão = imagem do PNG** (v0.8.2): o botão IMPRIMIR/PDF gera o PNG e imprime a **imagem a
  100% da largura** (`.area-impressao` só no `@media print`; o documento ao vivo fica
  `display:none` via `[data-impressao='imagem']`) — assim as quebras/proporções são as do PNG.
  `.min-h-screen` precisa virar branco no print (senão o fundo do app pinta a folha).
- Testes: **237 passando** (`npm test` = `vitest run`) — lógica (`tests/quote_logic.test.ts`),
  histórico (`tests/historico.test.ts`), telefone (`tests/telefone.test.ts`), selo de versão
  (`tests/versao.test.ts`), sistema (`tests/sistema_extracao.test.ts`), export PNG (`tests/export_image.test.ts`), pneus
  (`tests/tire_flyer.test.ts`), layout do flyer (`tests/flyer_layout.test.ts`), histórico do
  flyer (`tests/flyer_historico.test.ts`), dados (`tests/dados.test.ts`), backup
  (`tests/backup.test.ts`), cadeado (`tests/bloqueio.test.ts`), lembretes (`tests/lembretes.test.ts`, `tests/lembretesRapidos.test.ts`), relatório (`tests/relatorio.test.ts`) e smoke de tela
  (`tests/app_smoke.test.tsx`, jsdom), incluindo a troca de layout do Tire Flyer.
- **Aba Whats removida** (v0.117.0; existiu da v0.7.0 à v0.116.0): contatos/relatório de
  envios + lembrete global de "contatos para hoje" saíram (os lembretes de orçamentos,
  flyer e rápidos cobrem o uso). `wa.me` dos históricos continua (`utils/telefone.ts` +
  `BotaoWhats`). As chaves `zap_*` continuam no backup **só para restaurar arquivos
  antigos**. A coluna direita de Orçamentos tem **SUB ATALHOS** (v0.43.0):
  titulozinho + um botão por sub-aba de Dados (`components/MenuDados.tsx`, acompanha
  criar/excluir/renomear via evento `dados:atualizados` em `tabelas.ts`) que abre a aba Dados
  já na sub-aba (`App` → `DadosApp subAba`). Desde a v0.44.0 ficam numa **faixa estreita
  à direita** (botões compactos `text-xs`); desde a v0.46.0 a faixa fica **fora da largura dos
  cards** — APROVADO = AJUSTES = RESUMO (`xl:w-[425px]` numa pilha; a faixa vai ao lado
  da pilha, top-alinhada). A página de orçamentos é `main 1125px` com grade `1fr 601px`
  (425 + 12 + 164, desde a v0.55.0); a coluna esquerda fica em **~424px**. O primeiro botão da
  faixa é a **lupa** (v0.55.0): vira campo de busca e o Enter pesquisa o termo na aba Dados
  (igual ao "Pesquisar nas tabelas" — abre a sub-aba do 1º resultado e grifa); desde a v0.56.0
  o Enter **repetido no mesmo termo avança** (Shift+Enter volta) e há **contador ao vivo**
  (`N · X em ABA`, verde; "Nada encontrado" em cinza) enquanto digita; desde a v0.57.0 digitar
  já **pula direto**   (`repor`, igual ao campo de lá), o **X limpa** sem perder o foco
  (`onMouseDown preventDefault` — o `blur` desmontava o botão antes do clique) e o grifo é
  **só no termo** (v0.57.0: sobreposição `data-grifo`; v0.59.0: transparente com texto
  invisível — zero preenchimento na célula, input/edição 100% intactos; a ocorrência atual
  tem só contorno `ring` + mark).
  Desde a v0.58.0 a lupa **leva o foco junto** para o campo de busca dos Dados
  (`refBusca`, pois o do atalho some na troca de aba — sem isso as teclas/Enter iam para o vazio).
  Desde a v0.64.0 os dois campos **limpam sozinhos após 1 min sem digitar**
  (`BUSCA_AUTO_LIMPA_MS`, timer por inatividade; o X de Dados avisa o atalho via
  `dados:busca-limpa`). Desde a v0.98.0 é o **MENU DADOS** na lateral esquerda
  (ideia 03) e a página de orçamentos é `main 1400px`.
  `@google/genai` do template original **não** entrou.
- **Backup geral** (v0.9.0): `utils/backup.ts` exporta/restaura **todas** as chaves
  (`orcamentos_historico_v1`, `orcamento_ultimo_v1`, `orcamento_rascunho_v1`,
  `orcamentos_tema_v1`, `flyer_historico_v1`, `flyer_layout_v1`, `dados_tabelas_v1`,
  `rotulos_v1`, + `zap_*` legados só para restaurar backups da época da aba Whats)
  num JSON; UI na engrenagem
  **Configurações** ("BACKUP DOS DADOS"). A importação recarrega o app. Aceita também o backup
  antigo (só histórico). Atenção: tema e template são string pura no localStorage (não JSON).
- **Temas + logo** (v0.5.0; tipografia na v0.6.0): `data-tema` no `<html>` (`utils/tema.ts`,
  `localStorage` `orcamentos_tema_v1`) com as paletas em `index.css` (`@theme inline` remapeando
  os tokens do Tailwind para `--tema-*`). Botão **Configurações** no header
  (`components/ConfiguracoesTema.tsx`). Logo Toyota transparente no header
  (`src/assets/logo_toyota.png`). **As saídas não seguem o tema** — `#printable-quote` e o flyer (`data-saida="flyer"`)
  resetam as variáveis; validado pixel a pixel contra a v0.4.2 (0 diferenças nos PNGs).
  - **5 temas (v0.18.0 + Grafite na v0.19.0; v0.29.0 removeu `terracota` e `executivo`;
    v0.119.0 removeu `suave`):**
    `claude`/`original` antigos caem em `azul` (`lerTemaSalvo` **migra**/descarta os nomes antigos,
    inclusive quem tinha `terracota`/`executivo`/`suave` salvo). Temas = `azul`, `papel` (modo **claro**),
    `whatsapp` (verde), `tecnico` (cinza+laranja) e **`grafite`**
    (estilo tabela do Claude.ai: `#0c0c0c`, cabeçalho `#161616`, grade `#242424`, Plus Jakarta
    Sans, acento azul) — cada um é um bloco `[data-tema='x']` com os ~26 tokens `--tema-*` +
    fontes `@fontsource` (space-grotesk, poppins, chivo, **plus-jakarta-sans**).
    ⚠️ Ao mexer em modo claro: literais **não** remapeados pelo `@theme inline` (ex.:
    `text-emerald-100`) não seguem o tema e podem sumir no fundo branco — usar tokens (600/500/400/900).
    ⚠️ Estilo de tabela por tema: as células da aba Dados usam `border-slate-800`
    (`--tema-borda-forte`) = grade; `[data-tema='grafite'] thead th{...}` deixa o cabeçalho mais
    claro, títulos em **negrito** e o corpo em peso normal (v0.19.1); no **técnico** o conteúdo
    digitado nas células também fica **sem negrito** (`[data-tema='tecnico'] tbody td input[type='text']`,
    v0.29.0). NÃO usar `[data-tema='x'] textarea{font}` (quebra o mono dos dados).
    "Adicionar linha" = só um "+".
    O seletor tem mini-amostra de cor + rolagem e fica escondido atrás de uma seta
    (abre só no clique). Validado por screenshot headless do `dist`.
- **Histórico do Tire Flyer + CONTATO** (v0.12.0): `tire/utils/historicoFlyer.ts`
  (`flyer_historico_v1`) salva a cada "Processar" (`data/hora · contato · medida · N marcas`;
  era "N pneus" até a v0.29.0 — registros antigos migram `numPneus` → `numMarcas` ao ler);
  busca por contato/data/medida (sem acento); card **CONTATO** (campo livre, só no histórico)
  no lugar do antigo LAYOUT DE EXPORTAÇÃO; modal `FlyerHistoryModal`.
- **Aba Tire Flyer** (v0.4.0): `src/App.tsx` = shell com as abas (as duas ficam montadas, a
  inativa com `hidden`, para não perder o que foi digitado); orçamentos em
  `src/components/OrcamentosApp.tsx`; pneus em `src/tire/` (`TireFlyerApp.tsx`, `types.ts`,
  `utils/parser.ts`, `components/Flyer.tsx` + Tailwind/build 1:1 do AI Studio). O flyer exporta
  com o `exportarPng` local (mesma correção de fontes) em `pixelRatio: 2` → **1500px**; o
  `zoom: .75` do wrapper não afeta a captura (medido). "Histórico" só aparece na aba de
  orçamentos. O `main` é único (`max-w-[1400px]` desde a v0.98.0); o `pt-3` do `main` vale para as três
  (v0.8.1) — o campo "Dados da Tabela"
  fica largo (~882px em 1366, ~927px em 1600+) **sem rolagem lateral**. O campo do flyer tem
  `h-[250px]` e o **preview** aparece na metade (`w-[375px]` + `transform: scale(.5)` com altura
  medida por `ResizeObserver`) — **nunca usar `zoom` no preview**: zoom aninhado arredonda o
  `clientHeight` e muda o PNG (ver v0.7.1).
- **Layouts de saída do Tire Flyer** (v0.20.0; cores na v0.21.0): o usuário escolheu, entre os
  mockups publicados em `ideias/` (`tire-flyer-valores.md` e `tire-flyer-cores.md`), **6 opções**
  trocadas por um **ícone, sem substituir o clássico**: `atual` (padrão), `tabela` (ideia 4),
  `etiqueta` (ideia 7), `laranja` (cores 01 — Queima-Estoque), `racing` (cores 02 — Vermelho) e
  `encarte` (cores 09 — Amarelo jornal). `tire/utils/layoutFlyer.ts` (`flyer_layout_v1`) guarda a
  escolha; `SeletorLayoutFlyer.tsx` é o botão **ícone-only** (`aria-label="Layout do flyer"`,
  menu com rolagem, padrão do `ConfiguracoesTema`) ao lado do download. O `Flyer.tsx` é
  dispatcher (`data-layout` no nó de saída): o clássico fica em `FlyerAtual` **sem mudança**, os
  demais em `FlyerTabela.tsx`/`FlyerEtiqueta.tsx` e os 3 coloridos são flyers completos
  (`FlyerLaranja.tsx`/`FlyerRacing.tsx`/`FlyerEncarte.tsx`, com cabeçalho/rodapé próprios);
  `getBrandStyle` mora em `tire/utils/marcas.ts`.
  ⚠️ O layout `atual` continua sendo **contrato**: validado pixel a pixel contra a v0.19.2
  (0 diferenças) em cada versão; a escolha vale para o PNG e é salva no navegador.
- **COPIAR PNEUS do Tire Flyer** (v0.32.0 como "Descrição para WhatsApp" abaixo do flyer;
  v0.72.0: `NeonCard` logo abaixo do CONTATO, mesma janela/largura dos demais): botão de copiar
  no `actions` — texto montado por `tire/utils/descricaoWhats.ts` (`montarDescricaoWhats`): `MEDIDA PNEU: …`, linha em
  branco e, por marca, `• MARCA - R$ (à prazo) (em até 10x no Cartão) ou R$ (à vista) (Dinheiro,
  Pix, Débito).` — a bolinha é `•` (bullet), não asterisco. O `<pre>` usa a **mesma fonte do
  conteúdo de DADOS DA TABELA** (`text-lg`, peso normal, `leading-relaxed` e
  `font-family: var(--tema-fonte-conteudo)` inline — o CSS global aplica esse token em
  `textarea/input/select`, então `.font-mono` da textarea é sobreposto e vale Inter).
- Build de arquivo único **validado** (`dist/index.html` ~16 MB desde a v0.84.0 —
  pdf.js + tesseract + português embutidos; era ~1,3 MB — CSS+JS+fontes embutidos, sem
  referências externas).
- **Campo Placa** (v0.2.3): input abaixo de **Parcelas** (maiúsculas, máx. 8) que vai para o
  histórico; **não** entra no PNG/tabela de saída (decisão do usuário). No histórico aparece
  depois do nº de itens: `data · N itens · PLACA`.
- **Card direito compacto** (v0.2.3, apertado na v0.2.4): inputs com `px-4 py-2.5 text-xl`,
  grupos com `space-y-2` e `NeonCard` com o prop **`compact`** (`px-6 py-4` no cabeçalho e no
  conteúdo, antes `px-8 py-6`/`p-8`) — praticamente sem espaço acima de Total Revisão/Peças/etc.
- **Busca no histórico** (v0.2.5): botão **Pesquisar** entre "Restaurar backup" e "Limpar
  tudo" → campo que filtra por **data ou placa** (`filtrarHistorico`, ignora `/ - . : e espaços`;
  ex.: `24/09`, `2026`, `abc-1d23`), com contador `N de M`. O resumo de cada cartão mostra
  **valores brutos** (v0.9.1): Revisão, Peças, Serviços e **Bruto** (`totalGeral`, sem desconto).
- **Histórico — abas, salvar e ver itens** (v0.11.0; destaque na v0.13.0; abas atuais
  Todos|Aprovados|Não Aprovados desde a v0.107.0): abas filtradas por `filtrarPorAba`;
  o "Abrir" restaura a marcação salva em `naoRealizados: number[]`; o botão "Ver itens do orçamento" abre uma janelinha (`data-janela-itens`) com as
  linhas de `descReparo` e, desde a v0.32.0, o **valor de cada id no canto direito** (mesmo
  `item.value` da tabela do documento) e um **resumo embaixo** com **Aprovado · Não aprovado ·
  % aprovado · Total** (`resumoAprovacao` em `quoteLogic`, recalculando o registro com
  `processQuote`); o título da janelinha é `text-xl`, igual ao "HISTÓRICO" (era `text-[26px]`).
  A marcação **✓ aprovado / ✕ não aprovado** (`data-situacao`) só aparece nos registros com
  `naoRealizados` salvo; nos comuns os itens ficam `data-situacao="neutro"` (ainda não houve
  aprovação do cliente).
- **Modais ficam FORA do `ui-compacta`** (v0.13.0): dentro de uma aba com zoom, um modal com o
  seu próprio `ui-compacta` ficaria com zoom duplo (fonte menor). Renderizar como irmão do
  container da aba (padrão do `HistoryModal`).
- **Interface 25% menor** (v0.3.0): classe **`.ui-compacta { zoom: 0.75 }`** aplicada em
  header, grade de entrada, cartão de resumo, botões da tabela e painel do histórico
  (equivale a usar o Chrome a 75%). `main` = `max-w-[1400px] px-[30px]` para casar as
  larguras. **O documento de saída (`#printable-quote`) NÃO é escalado** — o PNG do cliente
  continua igual.
- **Seleção de itens** (v0.3.0; ajustado na v0.3.1): caixinhas na coluna "Item" da tabela; só
  as marcadas entram nos totais. Totais/desconto/líquido recalculados por
  `recalcularComSelecao`; as **desmarcadas continuam aparecendo no PNG/impressão**, em fonte
  clara (`text-slate-400`) e riscadas — **sem `opacity` na linha** (dava diferença de altura na
  captura). Quando há desmarcados, o documento ganha a caixa **"Itens Não Aprovados"** (fora
  do Resumo Financeiro) com os itens e a soma (`itensNaoRealizados`); some quando todos estão
  marcados. Só a **caixinha** é escondida no PNG/print (`data-ui` + `filter` do `html-to-image`
  + CSS `@media print`). Ao processar/abrir do histórico, todas começam marcadas.
- **PNG sem vão no "Total Não Aprovado"** (v0.3.2): o html-to-image reduz todo `font-size` em
  0.1px no clone (`clone-node.js`), então uma descrição no limite da quebra ficava com uma
  linha a menos no PNG e a altura fixa deixava um vão antes do divisor. `src/utils/exportImage.ts`
  (`exportarPng`) chama `toSvg`, **restaura os tamanhos reais de fonte** e desenha no canvas —
  ver bloco em `APRENDIZADOS.md`. Validado com Playwright (37/37 casos DOM = PNG).
- **Aba Dados** (v0.15.0; sub-abas dinâmicas v0.16.0; caixinhas/renomear v0.17.0; ações na
  v0.22.0; notas na v0.34.0): `src/dados/` — modelo
  `{ abas: [{ id, rotulo, tabelas, notas, ordem }] }` em `dados_tabelas_v1`. **`ordem`** = ids de
  tabelas e notas misturados, definindo a sequência dos blocos na tela (o `lerDados` a normaliza:
  ids que sumiram saem, o que não tem posição entra no fim — tabelas e depois notas). **Notas** =
  caixas de anotação com copiar/lista/editar/borracha/fechar, redimensionáveis arrastando as
  bordas (`criarNota`/`atualizarTextoNota`/`atualizarTamanhoNota`/`removerNota`, limites
  `NOTA_*`); desde a v0.36.0 o texto está **sempre em textarea** (`readOnly` até o foco —
  clicar já edita e o cursor cai no ponto clicado) e a **alça de 6 pontinhos** (`GripVertical`)
  arrasta a nota com HTML5 DnD para cima de qualquer bloco — nota ou **tabela**
  (`moverNota` reordena `ordem`; tabelas também aceitam o drop e o cartão fica com `ring` azul),
  permitindo nota **acima/entre tabelas**; desde a v0.52.0 a **tabela também se move**: botões
  **subir/descer** (`ChevronUp`/`ChevronDown`, `moverBloco` troca com o vizinho na `ordem`,
  travados nas bordas) na barra de baixo, ao lado do excluir;
  permitindo nota **acima/entre tabelas**; notas seguidas ficam na mesma linha (`flex-wrap`) e o
   texto entra na **busca** via `listarOcorrencias` tipo `nota` (acende `data-atual`). Desde a
   v0.116.0 a **tabela também tem alça de 6 pontinhos** (`data-alca-tabela` na barra de
   baixo; `moverBlocoPara` puro — qualquer bloco para a posição de qualquer bloco;
   o estado de arrasto virou `blocoArrastando/blocoSobre`). O botão
  **Criar tabela** é **ícone-only** (v0.34.0; era “Criar tabela” com texto) ao lado do **Criar
  nota** (`StickyNote` âmbar). Sub-abas =
  **PEÇAS** e **O.S's** + criadas pelo botão “+”, cada uma com **X próprio** para excluir;
  **duplo clique** renomeia; desde a v0.31.0 o nome **não mostra mais a contagem** de tabelas —
  era “PEÇAS (1)”. **Migra** o formato antigo `{ pecas, os }`. Tabelas com colunas 1–12,
  opção **Caixinhas** na criação (`comCaixas`/`marcados` — risca a linha), cabeçalho em negrito,
  **largura de coluna ajustável** (arrastar a alça; `larguras[]`), adicionar/remover linhas,
  **copiar célula** (hover), **copiar a linha toda** (hover, células com TAB), **excluir linha e
  excluir coluna com `window.confirm`**; nas **notas**, além dos 4 botões, desde a v0.35.0 há o
  **ícone de lista** (`List`): a bolinha `• ` entra **na linha do cursor/seleção** (v0.37.0; antes
  criava uma linha nova embaixo) e, no modo lista, **Enter cria o próximo item** (Enter num item
  vazio remove a bolinha e encerra a lista; clicar de novo numa linha que já é item **remove a
  bolinha** e desliga o modo — v0.38.0); o texto da nota é **sem negrito** (leitura e edição),
  como as células do tema Técnico;
  **busca que abre a sub-aba e grifa o termo** — e desde
  a v0.27.0 **Enter/Shift+Enter percorrem as ocorrências** com contador `N de M · X em ABA`
  (`listarOcorrencias`, índice modular) e **destaque forte** (`data-atual`, âmbar cheio) na
  atual, trocando de sub-aba se preciso — desde a v0.28.0 o contador fica **dentro do próprio
  campo de busca**, no canto direito **antes do X**; no
  **cabeçalho da coluna de opções** ficam **adicionar coluna (+)** — escondido no limite de 12 —
  e **ordenar** (v0.24.0), e a **barra de baixo** tem o **+ de adicionar linha à esquerda** e o
  **excluir tabela à direita** (v0.25.1; a dica de arrastar/colar saiu) — desde a v0.26.0 a barra
  acompanha **a largura da tabela** (quando a tabela é mais larga que o card, rolam juntas);
  desde a v0.53.0 tabela e barra preenchem o cartão (`width: 100%`, mínimo `larguraTotal` =
  soma das colunas + 92px de ações) — sem o vão à direita com poucas colunas;
  As ações da linha
  (caixinha, copiar e excluir) usam **o mesmo tamanho de botão e o mesmo vão** (`w-6 h-6` +
  `gap-1.5`); a largura da coluna de ações é fixa em **92px**. As células do corpo usam
  **`text-base`** (16px, v0.31.0 — um pouco menor que o `text-lg` da v0.27.0) com linha
  **compacta** (`px-2.5 py-1`; cabeçalho segue `text-lg` com `py-1.5`) — medir fonte/altura pelo
  `ui-compacta` (as duas telas estão no zoom .75).
  ⚠️ Os botões de ação (copiar/excluir) usam **`tabIndex={-1}`** para o TAB pular de célula em
  célula (pedido do usuário). Entra no backup.
- **Selecionar/colar células em grade** (v0.23.0; ajustes na v0.24.0): **arrastar** com o mouse
  (ou **Shift+clique**) seleciona um bloco de células (destaque azul **no próprio input**, pois o
  `focus:bg-slate-900` cobria o destaque do `<td>` — a 1ª célula parecia não selecionada);
  desde a v0.69.0 a tinta azul aparece **só em bloco (2+ células)** — clique simples/TAB/Enter
  deixam só o cursor no texto, sem pintar a célula;
  **Ctrl+C** copia o bloco com **TAB entre colunas e Enter entre linhas**; **clicar numa célula
  da seleção deixa só ela marcada** (desmarca as demais, pedido do usuário) e **Esc** limpa.
  Desde a v0.26.0 **Ctrl+X recorta** (copia e apaga) e **Delete/Backspace apagam** o bloco
  selecionado via **`limparBloco`** — com **uma célula só** os atalhos continuam nativos (editar
  o texto dentro da célula), e nada fora do retângulo muda.
  Desde a v0.29.0 **TAB/Enter movem o destaque junto com o foco** (`moverSelecao` + mapa de
  `refsCelulas`): TAB anda para a direita e, na última coluna, desce para a 1ª da linha de baixo;
  Enter desce uma linha; Shift+Tab/Shift+Enter voltam — parando nas bordas da tabela. Desde a
  v0.33.0 **Enter na última linha (qualquer coluna) cria uma linha nova** (`adicionarLinha`) e
  foca a mesma coluna nela (Shift+Enter continua só voltando).
  **Colar de planilha/Notion**: se o texto tem TAB/Enter, o `onPaste` distribui o bloco a partir
  da célula via **`colarBloco`** (cria linhas quando passa do fim, ignora colunas além da tabela
  e apara espaços) — colar simples continua normal.
- **Ordenar tabela** (v0.24.0): botão **ao lado do excluir tabela** no cabeçalho da coluna de
  opções (`ArrowUpDown`, `aria-label="Ordenar tabela"`) abre a janelinha **"Ordenar por coluna"**
  (`dados/components/OrdenarTabela.tsx`, renderizada **fora do `ui-compacta`** como o toast do
  Desfazer — dentro do zoom o painel fixo ficaria encolhido). `ordenarPorColuna` (puro) usa
  `Intl.Collator` com `numeric: true` (então "8 UN" < "10 UN"); desde a v0.65.0 **datas
  pt-BR/ISO (`extrairDataPtBr`) comparam pelo calendário** (crescente = mais antiga,
  decrescente = mais recente; "03/09/2025" < "02/09/2026"), vazios por último, e move
  `linhas` e `marcados` juntos (a caixinha acompanha a linha); aceita `asc`/`desc`. As
  células do corpo têm **autocompletar** (v0.65.0): `<datalist>` por coluna com os valores
  distintos já digitados (ex.: "PED" sugere "PEDRO"), nativo do navegador.
- **Rótulos editáveis** (v0.17.0): `utils/rotulos.ts` (`rotulos_v1`) + `RotulosProvider` —
  **duplo clique** renomeia os botões das abas do topo. Os títulos internos das telas
  saíram na v0.103.0 (junto com o `TituloEditavel`). No backup geral.
- **Busca do histórico também por ITEM** (v0.18.1): a lupa procura em **data, placa (nome/
  contato) e descrição dos itens** — ex.: buscar "freio" acha os orçamentos com pastilhas
  (útil na aba **Não Aprovados**); o termo encontrado fica **grifado** na descrição do cartão
  (`destacarTermo`, NFD/case-insensitive, sem quebrar acentos).
- **Telefone + botão WhatsApp nos históricos** (v0.78.0): campo **TELEFONE (DDD + número)**
  nos orçamentos (abaixo de PLACA/NOME/CONTATO) e no Tire Flyer (card CONTATO);
  `utils/telefone.ts` (`somenteDigitos`/`normalizarTelefoneParaWhats` — 10–11 dígitos ganham
  `55`, igual ao `formatPhone` da aba Whats —/`temTelefoneValido`/`urlWhats`/`abrirWhats`).
  Entra na busca e no anti-duplicado (dígitos normalizados); **não** vai para o PNG.
  `components/BotaoWhats.tsx` (ícone-only, SVG da marca — o lucide não tem brand icon;
  verde habilitado, `disabled`+`opacity-40` sem número) abre **só a conversa**
  (`wa.me/<numero>`, sem texto) nos dois modais (`max-w-3xl` → `max-w-4xl` para caber).
- **Cor do cliente nos históricos** (v0.79.0): bolinhas **verde** (quer fazer em breve) /
  **vermelha** (só pesquisou) em cada cartão (`utils/corCliente.ts`:
  `CorCliente`/`FiltroCor`/`filtrarPorCor`/`corDaBusca`; UI em `components/CorCliente.tsx`:
  `MarcadorCor` + `FiltroCorCliente` com contagens). Marcada **depois de gerar, no
  histórico** (salva na hora; clicar na ativa limpa); filtro `Todas | Verdes (N) |
  Vermelhos (N)` combina com busca e abas; buscar "verde"/"vermelho" também filtra.
  A cor **não** entra no anti-duplicado e o reprocessamento a preserva
  (`novo.cor ?? antiga`). Cartão marcado ganha borda/bolinha na cor.
- **Selo de versão no header** (v0.80.0): `utils/versao.ts` (`VERSAO`) mostra `vX.Y.Z` ao lado
  de "Gestão de Vendas" — **manter igual à `version` do package.json a cada release**
  (v0.78.0/v0.79.0 saíram mostrando "v0.77.0"); `tests/versao.test.ts` trava isso.
- **Cadeado com senha** (v0.82.0): botão **Sair** ao lado da engrenagem cobre a tela com
  senha (`utils/bloqueio.ts` + `components/Bloqueio.tsx`, z-index acima de tudo, sem
  desmontar o app — o digitado continua lá). Sem senha, o primeiro bloqueio cadastra;
  a troca fica em Configurações → Bloqueio por senha (pede a atual, mín. 4). A senha é
  local (proteção casual, não cofre) e entra no backup geral.
- **Históricos mais altos** (v0.82.0): modais em `max-h-[93vh]` (era 85vh) — mais cartões
  visíveis sem rolar.
- **Unificações** (v0.81.0, sem mudança funcional): `utils/busca.ts` (`normalizarBusca` única
  para os dois históricos); telefone normalizado num lugar só
  (`normalizarTelefoneParaWhats`); `restaurarBackup` **mescla listas por id** (orçamentos,
  flyers, contatos — conflito: vale o atual; resumo ganhou `flyers`); shell único dos
  históricos (`components/HistoricoBase.tsx` — cada modal entra com título/botões/cartões);
  `tsconfig` cobre `tests/` (`resolveJsonModule` para o teste de versão); índice de versões
  no topo do `APRENDIZADOS.md` (âncoras `<a id>`; regenerar o bloco entre os marcadores).
- **Publicado**: repo público `viniciostristao1/orcamento-web` — cada Release tem
  `Orcamento-vX.Y.Z.html` + a cópia de nome estável **`Orcamento.html`**. ⚠️ **Contrato**: TODA
  release precisa subir a cópia `Orcamento.html` — o **link fixo do usuário** é
  `https://github.com/viniciostristao1/orcamento-web/releases/latest/download/Orcamento.html`
  (sempre a versão mais nova, mesma URL; o usuário baixa e **substitui o arquivo na mesma
  pasta**, mantendo o caminho para o `localStorage` do histórico). Página:
  `https://github.com/viniciostristao1/orcamento-web/releases/latest`. Mockups de layout em
  `ideias/` ("Foco na observação" implementada na v0.14.4).
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
                             (assetsInlineLimit alto → fontes/imagens em base64; sem pasta public)
  src/
    main.tsx                 entrada (StrictMode; aplica o tema salvo antes do 1º render)
    index.css                @import "tailwindcss"; @utility scrollbar-hide; @media print
    App.tsx                  SHELL: header (logo + abas + selo vX.Y.Z + configurações) + telas
                             (todas montadas, a inativa com `hidden`) + lembrete global
    types.ts                 tipos (QuoteSummary, QuoteItem)
    utils/quoteLogic.ts      LÓGICA PURA: parse do texto, agrupar, somar, descontos
    utils/historico.ts       HISTÓRICO orçamentos (localStorage) + backup/restaurar JSON
                             (+ `atualizarNaoRealizadosHistorico`: parcial inline sem mudar a data;
                             `temParcial` estrito: misto, não tudo riscado;
                             busca por faixa de valor: `>2000`, `1000-3000`, pelo bruto;
                             `chassi`: busca + anti-duplicado + `atualizarChassiHistorico`)
    utils/busca.ts           normalizarBusca (definição única, dois históricos)
    utils/telefone.ts        normalizar/validar telefone + wa.me (v0.78.0; também na aba Whats)
    utils/corCliente.ts      CorCliente/FiltroCor + filtrarPorCor + corDaBusca (v0.79.0)
    utils/exportImage.ts     exportarPng (toSvg + fontes reais + canvas) — v0.3.2
    utils/tema.ts            tema da interface (5 temas; azul padrão) + persistência
                             (fontes/paleta em index.css; .titulo-tema = fonte do tema)
    utils/relatorio.ts       linhas DATA⇥NOME⇥CSP⇥NÚMERO⇥Sim/Não⇥Vinícios + TAB
                             (+ seletor de mês no modal: tabela, % e copiar seguem o mês;
                             PARCIAL só no misto, X cheio é Não puro;
                             comparativo mês em foco x anterior via `mesAnterior`)
    utils/versao.ts          VERSAO do selo do header (= package.json; travado por teste)
    utils/bloqueio.ts        senha do cadeado (criar/trocar/conferir; entra no backup)
    utils/lembretes.ts       vencidos + formatos + evento (dois históricos)
    utils/lembretesRapidos.ts rápidos avulsos do sino (CRUD + chave)
    utils/rascunho.ts        rascunho em edição (orcamento_rascunho_v1)
    utils/ultimoOrcamento.ts último documento gerado (orcamento_ultimo_v1)
    utils/backup.ts          backup geral (todas as chaves) + restaurar
                             (+ `backup_ultimo_v1`: data do último download; aviso com 30+ dias)
    utils/rotulos.ts         rótulos editáveis (rotulos_v1)
    assets/logo_toyota.png   logo do header (fundo transparente; único asset)
    components/OrcamentosApp.tsx tela de orçamentos (entradas + resumo + tabela)
    components/HistoryModal.tsx  painel do histórico (abrir/excluir/limpar/backup/busca/
                             abas Todos|Aprovados|Não Aprovados/filtro de cor/WhatsApp/relatório/
                             V aprova tudo / X reprova tudo inline + caixinhas de parcial
                             na janelinha de itens + chassi (+ CHASSI/edição) no cartão,
                             tudo sem mudar a data)
    components/HistoricoBase.tsx casca dos dois históricos (overlay/cabeçalho/busca/cor/lista)
    components/BotaoWhats.tsx    botão ícone-only WhatsApp (SVG próprio) — dois históricos
    components/CorCliente.tsx    MarcadorCor + FiltroCorCliente — dois históricos
    components/QuoteTable.tsx tabela de saída + IMPRIMIR/PDF + BAIXAR IMAGEM (PNG)
                             + V/X de aprovação + WhatsApp do cliente (só a conversa)
    components/NeonCard.tsx  card com borda neon (prop `compact`)
    components/ClearButton.tsx botão "Limpar" (usado nas abas)
    components/ConfiguracoesTema.tsx engrenagem: tema + BACKUP DOS DADOS + troca da senha
    components/RotulosContext.tsx provider dos rótulos (renomear abas no topo)
    components/MenuDados.tsx MENU DADOS lateral (ideia 03; lupa + sub-abas de Dados)
    components/Bloqueio.tsx  tela do cadeado (criar senha / desbloquear)
    components/LembreteRelogio.tsx BotaoRelogio + EditorLembrete (dois históricos)
    components/LembreteHistorico.tsx popup âmbar pulsante dos vencidos
    components/RelatorioModal.tsx janela do relatório Excel (tabela + seletor de mês +
                             ordem de data + copiar; comparativo mês x anterior)
    components/SinoLembretes.tsx sino do header (rápidos + lista geral, janela larga)
    tire/TireFlyerApp.tsx    tela da aba Tire Flyer (entrada + preview + export)
    tire/components/Flyer.tsx dispatcher de layout (data-layout) — clássico intacto
    tire/components/FlyerTabela.tsx / FlyerEtiqueta.tsx / FlyerLaranja.tsx /
      FlyerRacing.tsx / FlyerEncarte.tsx (os 5 layouts alternativos)
    tire/components/FlyerHistoryModal.tsx histórico do flyer (busca/filtro cor/WhatsApp)
    tire/components/SeletorLayoutFlyer.tsx botão ícone-only do layout de saída
    tire/utils/parser.ts     parse da tabela de pneus (TABs) + preço BRL
    tire/utils/historicoFlyer.ts histórico local (flyer_historico_v1)
    tire/utils/layoutFlyer.ts layout escolhido (flyer_layout_v1)
    tire/utils/marcas.ts     getBrandStyle (cores por marca)
    tire/utils/descricaoWhats.ts texto COPIAR PNEUS (medida + marcas)
    tire/types.ts            TireData / PromoInfo
    sistema/SistemaCard.tsx  card 3 (PDF/print → revisão → DADOS; nº/data;
                             contato em Placa|Nome|Chassi nas larguras de Nº|Data|Telefone)
    sistema/extracao.ts      puro: linhas do PDF + normalizar + cabeçalho
    sistema/pdf.ts           pdf.js via Blob (offline) + texto por página
    sistema/ocr.ts           tesseract via Blob + fetch do idioma interceptado
    sistema/por.traineddata.gz português do OCR (base64 no build)
    dados/DadosApp.tsx       tela da aba Dados (sub-abas + busca + grifo)
    dados/components/OrdenarTabela.tsx janelinha "Ordenar por coluna"
    dados/utils/tabelas.ts   modelo { abas, ordem } + seleção em grade + ordenar + notas
  tests/                     vitest run: quote_logic, historico, telefone, versao,
                             sistema_extracao, export_image, tire_flyer, flyer_layout,
                             flyer_historico, dados, backup, bloqueio, lembretes,
                             lembretesRapidos, relatorio, app_smoke (jsdom)
  dist/index.html            BUILD = arquivo único entregue ao usuário (ignorado no git)
```

## 4. Comandos

```bash
npm install          # dependências
npm run dev          # servidor de desenvolvimento (testar no navegador)
npm run typecheck    # tsc -b (cobre só `src/`; testes ficam de fora — ver gotcha)
npm run lint         # oxlint (há warnings conhecidos: set-state-in-effect nos modais)
npm test             # vitest run --testTimeout=20000 (suíte grande; 5s estourava sob carga)
npm run build        # gera dist/index.html (arquivo único)
```

> `npm run build` é **só `vite build`** de propósito: o código vindo do AI Studio tem
> imports/estilos que o `tsc` estrito do template Vite reprovava; o `typecheck` roda separado
> e o que vale para a entrega é o build + os testes.

## 5. Fluxo de entrega (harness)

> **Pedido permanente do usuário: TODA entrega termina em `commit + push + release`**
> (não perguntar toda vez — só segurar o commit se ele pedir explicitamente para esperar).
> O passo 8 (mandar o link fixo) faz parte da entrega.

1. Editar a lógica/tela.
2. `npm run typecheck`, `npm run lint` (só erros; warnings de `set-state-in-effect` nos
   modais/listas são padrão aceito) e `npm test` limpos (e testar no `npm run dev` quando
   mexer em UI).
3. `npm run build` → conferir que `dist/index.html` continua **autocontido** (sem
   `<script src=...>`/`<link rel=stylesheet>` externos).
4. Anexar o bloco em [`APRENDIZADOS.md`](APRENDIZADOS.md) (o que mudou + decisões + gotchas).
5. Subir a versão em `package.json` **e em `src/utils/versao.ts`** (o selo do header;
   `tests/versao.test.ts` quebra se divergirem).
6. `git commit && git push`.
7. Publicar no Release do repo público `viniciostristao1/orcamento-web`:
   `cp dist/index.html /tmp/Orcamento-vX.Y.Z.html` →
   `gh release create vX.Y.Z /tmp/Orcamento-vX.Y.Z.html -t "Orçamentos vX.Y.Z" ...` e subir
   **sempre** também a cópia `Orcamento.html` (nome estável) no mesmo Release.
8. Mandar ao usuário o **link fixo**
   `https://github.com/viniciostristao1/orcamento-web/releases/latest/download/Orcamento.html`
   (ele baixa e substitui o arquivo na mesma pasta) + o nome do arquivo novo.

## 6. Regras duras (não quebrar)

- **Arquivo único e offline**: nada de CDN, fonte externa, imagem remota ou `fetch` em
  runtime — senão não abre no `file://` / sem internet. Fontes boas = `@fontsource/*`
  importado no CSS (o Vite inlineia em base64 por causa do `assetsInlineLimit`).
- **Export = PNG** (decisão do usuário: é o formato que ele manda no WhatsApp). PDF/Excel não
  são necessários; não trocar o fluxo sem pedido.
- **Layout de saída é contrato**: a tabela/resumo devem continuar iguais aos do AI Studio
  (o cliente recebe esse print). ⚠️ Por isso a interface usa `zoom: .75` **por seção** e o
  `#printable-quote` fica fora — não usar zoom em `body`/`main` (mudaria a captura do PNG).
- **O tema NÃO vaza para as saídas**: `#printable-quote` e `[data-saida='flyer']` resetam as
  variáveis `--tema-*` para os valores originais do Tailwind. Ao remapear/`@theme inline` um
  token novo que as saídas usem, adicionar o mesmo token no bloco de reset do `index.css`.
- **Item desmarcado APARECE no cliente** em fonte clara + riscado (mesma altura das demais
  linhas — **nunca usar `opacity` na `<tr>`**, distorce a captura) e entra na caixa "Itens Não
  Aprovados" (com a soma). Só a **caixinha** de seleção é escondida: `data-ui` + CSS
  `@media print` **e** `filter` no `toPng` (o `print:hidden` sozinho NÃO vale para a captura
  do PNG, que é de tela).
- **Histórico**: `localStorage` + **backup/restaurar JSON** (o usuário pode limpar o navegador
  ou trocar de PC). Salvar a cada "Processar Tudo". O `localStorage` no `file://` é por origem
  do navegador — para não depender disso, o Release publica também o `Orcamento.html` de nome
  estável (abrir sempre do mesmo caminho) e há o backup JSON.
- **Placa, Nome, Chassi + Telefone** (v0.13.0; telefone na v0.78.0; chassi na v0.113.0)
  são dados **só do histórico** (não aparecem no PNG enviado ao cliente). Placa é
  campo livre (`maxLength 60`), chassi é VIN de 17 (`maxLength 17`, só letras/números),
  telefone é DDD + número (`maxLength 20`, normalizado para `wa.me`); **todos entram na
  comparação de duplicidade**: mesmo conteúdo substitui o último; diferente = novo registro.
  A busca do histórico ignora acentos (`normalizarBusca` com `normalize('NFD')`) e máscaras.
  Telefone é lido **na hora do clique**: processar/salvar depois de digitar inclui o número;
  o registro já salvo não muda sozinho (reprocessar com número diferente = registro novo).
  Desconto (5) e parcelas (6x) são padrão: a borracha geral os restaura, só o manual alterna.
- **Cor do cliente** (v0.79.0) é marcação **posterior, no histórico** (verde = quer fazer;
  vermelho = só pesquisou): **não** entra no anti-duplicado e o reprocessamento a preserva.
- **Selo de versão**: `VERSAO` (`utils/versao.ts`) = `version` do `package.json`, sempre
  (travado por `tests/versao.test.ts`).
- **Flyer de pneus também é layout de saída**: 750px, `font-sans` do sistema e emojis (igual ao
  app original) e export em `pixelRatio: 2` (1500px). Não trocar fonte/cor/estrutura nem pôr
  `zoom` no `body` — o `zoom` do wrapper do preview é seguro (`clientWidth` segue 750).
- **Sem IA, sem servidor, sem login, sem nuvem.**

## 7. Decisões do usuário (registradas)

- Lógica **pura** (sem Gemini/IA).
- Uso **local no PC** (arquivo no Chrome), não precisa hospedar.
- **Histórico + exportar PNG** (o app original só exporta PNG; suficiente para o WhatsApp).
- Manter o layout de saída do AI Studio.
- **Interface a 75%** (v0.3.0): o usuário usava o Chrome a 75%; o app já vem nesse tamanho.
- **Seleção de itens no orçamento** (v0.3.0): caixinhas para marcar/desmarcar; desmarcado não
  entra no PNG do cliente.
- **Segunda aba "Tire Flyer"** (v0.4.0), no header ao lado da marca, para o gerador de promoção
  de pneus; as duas abas ficam montadas para não perder o que foi digitado.
- **Temas** (v0.5.0): escolhidos em **Configurações** (lista escondida atrás de seta
  desde a v0.119.0); o tema vale só para a interface (PNGs iguais). Hoje são 5 (Azul padrão,
  Papel, WhatsApp, Técnico e Grafite) — Terracota e Executivo saíram na v0.29.0, Suave na
  v0.119.0. As abas no mesmo estilo e só o logo Toyota no header (título e "Gestão de
  Vendas" saíram na v0.119.0).
- **Layout do flyer de pneus** (v0.20.0; cores na v0.21.0): além do **clássico** (mantido como
  padrão), o "Tabela de ofertas" e o "Etiqueta de preço" (ideias 4 e 7 de
  `ideias/tire-flyer-valores.md`) + "Laranja Queima-Estoque", "Vermelho Racing" e "Amarelo
  Encarte" (ideias 01, 02 e 09 de `ideias/tire-flyer-cores.md`), trocados por um ícone ao lado
  do download — nunca substituindo o layout atual.
- **Telefone do cliente** (v0.78.0): campo próprio (não dentro de placa/contato), só
  números; o botão WhatsApp abre **só a conversa** (`wa.me`, sem texto pronto) e fica
  desabilitado sem número válido.
- **Cor do cliente** (v0.79.0): verde = quer fazer em breve, vermelho = só pesquisou;
  marcada no histórico depois de gerar, com filtro por cor nos dois históricos.
- **Cadeado com senha** (v0.82.0): botão Sair bloqueia a tela (overlay, app continua
  montado); senha local com mín. 4 caracteres, troca nas Configurações, incluída no backup.
- **Abas em sublinhado** (v0.102.0, ideia 01 de `ideias/abas-estilos.md`): só texto,
  ativa com traço âmbar embaixo (branca nos temas escuros, escura no papel);
  substitui as pílulas (inclusive o âmbar do grafite).
- **Aprovação + relatório Excel** (v0.105.0): botões V/X ícone-only no documento
  (`QuoteTable`: verde/vermelho, clicar no mesmo limpa); grava no registro da tela
  (`atualizarAprovacaoHistorico`, reprocessar preserva); janela Relatório no histórico
  com tabela + "Copiar para Excel" (`relatorio.ts`: DATA ⇥ NOME ⇥ CSP ⇥ NÚMERO ⇥
  Sim/Não ⇥ Vinícios; sem marca = vazio). Só orçamentos.
- **Dinâmica de aprovação** (v0.106.0; refinada na v0.107.0): V/X **salvam**; X risca
  tudo; abas Todos|Aprovados|Não Aprovados (V com desmarque cai em Não Aprovados —
  recuperação de vendas; parcial só existe no % do relatório); relatório largo, com
  meses, % no topo, lixeira por linha e limpar tudo; parcial também é Sim no relatório.
- **Refinos** (v0.108.0): saiu o botão âmbar (V/X salvam); relatório com coluna PARCIAL
  (após o nome); observação do lembrete persiste ao concluir/limpar; V/X com
  pressionado visível (volta ao normal em orçamento novo).
- **Seletor de mês + aprovação sem abrir** (v0.110.0): relatório com seletor Todos|cada
  mês (tabela, % e copiar seguem o filtro; limpar-tudo continua global); cada cartão do
  histórico tem V/X inline e a janelinha de itens tem V/X + caixinhas por item (vira
  parcial) — tudo via `atualizarAprovacaoHistorico`/`atualizarNaoRealizadosHistorico`,
  sem tocar em `id`/`criadoEm`/`dataDoc` (não muda a data, diferente do "Abrir").
- **Parcial estrita + V/X tudo + janelas largas** (v0.111.0): PARCIAL só no misto
  (`temParcial`: X cheio = Não puro; 1 item desmarcado sozinho = Não puro); V inline
  aprova tudo (zera desmarcados → Aprovados), X inline reprova tudo (risca todos);
  ativo desmarca (puro/cheio voltam ao comum; com parcial limpa só a marca); janelas
  do histórico (`max-w-6xl`, vale nos dois) e do relatório (`max-w-6xl`) mais largas.
- **Agilidade: WhatsApp, backup, valor e meses** (v0.112.0): botão WhatsApp verde no
  documento (telefone da tela, sem texto, apagado sem número); aviso de backup
  (bolinha âmbar na engrenagem + linha no menu com 30+ dias/sem backup, só com dados);
  busca do histórico por faixa de valor (`>`/`<` sempre valor; `1000-3000` só quando o
  texto não acha — telefone/placa têm prioridade); comparativo mensal no relatório
  (foco x anterior, quantidade + %).
- **Chassi ignora palavra de 17 letras** (v0.115.0): candidato a VIN precisa ter
  letra E dígito nos dois caminhos (o "RESPONSABILIZAMOS" da garantia vinha antes
  do VIN no texto e era pego pela busca avulsa).
- **Alça muda a tabela de lugar** (v0.116.0): 6 pontinhos na barra de baixo do cartão
  (arrasta a tabela para cima/entre blocos, igual às notas); subir/descer continuam.
- **Aba Whats removida** (v0.117.0): contatos + relatório de envios + pop-up "para hoje"
  saíram (`src/whats/`, `LembreteContatos`, `whats_scripts.test.ts` e 4 testes de tela);
  `wa.me` dos históricos continua; `zap_*` seguem no backup só para restaurar antigo.
- **Ordem de data + sino largo** (v0.118.0): botão no relatório alterna recentes/antigos
  (vale para tabela e copiar); sino `w-[26rem]` com texto em 2 linhas.
- **Header enxuto + fim do suave** (v0.119.0): header só com logo (+ selo de versão);
  RESUMO LÍQUIDO em `text-xl`; temas atrás de seta; Suave removido (quem tinha cai no azul).
- **Claro legível + backup na seta** (v0.120.0): "Claro Papel" vira "Claro"; campo com fundo
  próprio, aba ativa preta (hex literal, sem remapear) e sub-aba fechada azul-escura no
  papel; backup colapsável igual aos temas.
- **Letra escura no Claro** (v0.121.0): `.campo-tema` com letra escura no papel (vale para
  todos os preenchimentos) + resumo em tokens (`slate-100`/`blue-400`).
- **VIN fragmentado + header** (v0.122.0): 3ª passada no chassi (corte/espaço no meio);
  bloqueio atrás de seta; logo centralizado na coluna do MENU DADOS.
- **VIN em 2–3 partes** (v0.124.0): 3ª passada por índices ("Nr.Fab + espaços" e OCR
  com 2 espaços; regex consumia o texto e pulava sobreposições).
- **Chassi fora da linha de item** (v0.125.0): avulso só no cabeçalho (código de peça +
  palavras somava 17 à toa, ex.: CARE040703AUTOAIR).
- **Dígito do VIN** (v0.126.0): `vinDigitoOk` (ISO 3779) + `escolherVin` desembaraçam VIN
  colado com dígito vizinho (Hr "0" + VIN) e falso RG+bairro (Print-5.pdf).
- **Chassi + regeração sem data** (v0.113.0): VIN de 17 do PDF (rotulado ou avulso
  com letra) preenche o campo `Placa|Nome|Chassi` do card (3 colunas, sem mudar a
  altura); chassi entra na busca/anti-duplicado e tem `+ CHASSI`/edição inline no
  cartão (sem data); regerar o registro aberto mudando só o chassi atualiza no lugar
  (`registroAbertoRef` — mantém data e itens marcados).
- **Sem títulos internos** (v0.103.0): saiu o cabeçalho centralizado de cada aba
  (ORÇAMENTOS, TIRE FLYER, PAINEL WHATSAPP, DADOS) — a aba ativa já diz onde estamos.
  Saiu junto o `TituloEditavel` (+ renomear do contexto); renomear das abas no topo
  continua.
- **Orçamento do sistema em PDF/print** (v0.84.0): card **3. ORÇAMENTO DO SISTEMA
  (PDF/PRINT)** na aba Orçamentos, alternativo aos campos 1 e 2 (que seguem iguais).
  Extrai o texto — PDF via `pdfjs-dist` embutido (linhas reconstruídas por coordenada Y,
  resolve o "colou tudo numa linha"); prints via OCR `tesseract.js` embutido
  (português `por.traineddata.gz` inline; worker/núcleo via Blob — 100% offline).
  Cabeçalho detectado (nº, placa, nome, data) preenche nº/data e completa placa/nome;
  nº e data entram no histórico (busca + anti-duplicado). Fluxo sempre com revisão:
  o texto cai para conferência e só vira DADOS no clique — a soma é a mesma lógica
  (que passou a aceitar `Peca` sem acento e ignora linhas de cabeçalho sem ID).
  Desde a v0.85.0 o texto é separado por seção do PDF real (layouts Toyota):
  `extrairSistemaToyota` tira DADOS (itens entre "It Tipo Código…" e "Fechamento"),
  DESCRIÇÃO (entre "Reclamações Originais…" e "Sugestão"), cliente após "Cliente
  Cadastro", número = 1º do documento e o resto é ignorado — o card mostra as duas
  partes para revisão e preenche os campos 1 e 2.
- **Card 3 automático** (v0.87.0): anexar já extrai sozinho (sem botão extrair);
  botão único **"Novo arquivo"**; novo anexo **substitui** o anterior (nunca soma).
- **Card do sistema redondo** (v0.92.0): botão **+** (ícone) no lugar do "Novo arquivo",
  sem frase explicativa; **TELEFONE e NOME moram no card** (Nº, Data, Telefone + Nome
  abaixo); botão virou **"Usar no orçamento manual"**. NOME é campo próprio no histórico
  (busca + anti-duplicado); borrachas o limpam junto.
- **Borrachas certas + RESUMO colado** (v0.94.0): APROVADO limpa só revisão e ajustes
  (desconto, parcelas, placa, telefone e nome ficam); SISTEMA limpa também revisão,
  ajustes, DADOS e DESCRIÇÃO; PLACA com a largura do Nº e NOME no resto da linha;
  RESUMO sem `mt-auto` (colado no AJUSTES).
- **Detalhes do flyer + alinhamento** (v0.95.0): janelinha "Ver detalhes do flyer" no
  histórico (marcas e preços, sem reabrir); card virou ORÇAMENTO DO SISTEMA; alturas
  medidas em tela (SISTEMA termina junto do RESUMO, DADOS junto da DESCRIÇÃO).
- **Play com campo vazio avisa** (v0.90.0): sem DESCRIÇÃO ou DADOS, o processar mostra
  alerta orientando (usar o card 1) em vez de sair em silêncio sem scroll/imagem.
- **Lembretes com data/hora** (v0.91.0): botão relógio em cada cartão dos dois históricos
  agenda `lembreteEm` (ISO; editor com confirmar/limpar); o cartão mostra data do
  orçamento + data do lembrete (sem contagem de itens/marcas). Vencidos piscam no canto
  inferior direito (`LembreteHistorico`, mesmo padrão do aviso do Whats); o clique abre o
  orçamento/flyer e conclui o lembrete (X dispensa até mudar). Reprocessar preserva.
- **Sino de lembretes** (v0.96.0): botão entre cadeado e engrenagem com selo de
  quantidade; cria **lembretes rápidos** (texto + data/hora, avulsos) e lista TODOS
  (rápidos + históricos, com excluir). Rápidos vencidos piscam no mesmo popup (o clique
  conclui); entram no backup com merge por id. Fechar o sino limpa o rascunho (v0.101.0).
- **Ajustes de lembrete + menu** (v0.97.0): selo do sino conta só vencidos; DESCRIÇÃO
  da revisão com +1 linha (review de DADOS compensa, alinhamento mantido); clique no
  aviso abre o **histórico** no cartão destacado (não gera na tela); mockups do
  MENU DADOS em `ideias/menu-dados.md` (8 ideias, sem implementar).
- **Lembrete maior + menu e filtro** (v0.99.0): editor de data/hora maior com
  **observação** na mesma linha (buscável nos dois históricos, mostrada no cartão);
  MENU DADOS em branco mono sem negrito; filtro Todas/Verdes/Vermelhos na linha de
  ações (entre lupa e limpar).
- **Fonte do MENU igual à dos campos** (v0.99.1): itens com a fonte de conteúdo do tema
  (o CSS global já força os campos nela; `font-mono` destoava).
- **Play prefere extração nova** (v0.100.0): anexar o 2º orçamento + play gera o 2º sem
  precisar do "Usar" (`decidirFontePlay` pura: revisão fresca + campos intactos = vale
  a revisão; edição manual vence sempre). MENU DADOS em `text-base` (igual ao conteúdo).
- **Nova ordem + borrachas** (v0.88.0; renumeração na v0.89.0): esquerda = 1. SISTEMA
  e 2. DADOS (largo); direita = APROVADO, 3. AJUSTES, 3. DESCRIÇÃO e RESUMO. O botão
  **Histórico** fica no card 1. SISTEMA, ao lado da borracha. Borracha do card 1 apaga
  também Nº/Data e PLACA/NOME/TELEFONE; borracha geral no APROVADO (zera revisão/peças,
  mantém desconto 5 e parcelas 6x — padrão, só manual — limpa placa/telefone).
- **Ajustes do card 3 e borrachas** (v0.86.0): a borracha do card 3 apaga também Nº e Data;
  o card APROVADO E DESCONTO ganhou borracha geral (zera revisão/peças, desconto 0,
  parcelas 1x, limpa placa/telefone); "Usar no orçamento" **sobrescreve** PLACA/NOME e
  TELEFONE (só com conteúdo) — telefone sai do `Celular:` normalizado com 55 na frente.
## 8. Pendências

- Usuário **testar no Chrome** (abrir o `.html` baixado) e validar a lógica com 1–2 casos
  reais (entrada → saída esperada). Feedback → nova versão.
- Se o usuário mandar o `index.css` original do AI Studio, conferir se ele sobrescreve
  `font-mono` (hoje o textarea usa o mono do sistema, igual ao original).
