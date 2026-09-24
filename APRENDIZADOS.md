# Aprendizados — Gerador de Orçamentos

Diário técnico do projeto: cada bloco de trabalho anexa aqui **o que foi feito, decisões e
gotchas** (para não repetir). Topo = mais recente. Ler antes de mexer em build/config.

---

## 2026-09-24 — Aba Whats com o título colado no topo (v0.7.6)

**Pedido:** reduzir o espaço entre "PAINEL WHATSAPP" e a barra superior (Toyota Weiand Lajeado).

**Feito:** root da aba Whats de `py-10` → **`pt-1 pb-20`** e o cabeçalho interno de
`mb-10 pb-8` → `mb-8 pb-6` — mesmo padrão do Tire Flyer. Gap medido no Chromium: **15px**
(antes ~42px). PNGs do orçamento/flyer: **0 diferenças**. Testes: 44.

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

## 2026-09-24 — Tema Claude: textos em branco (v0.6.3)

**Pedido:** no tema Claude, as fontes devem ser de cor **branca**.

**Feito:** `--tema-texto`/`--tema-titulo` (texto principal, títulos e valores) passaram para
`#ffffff` e a escala secundária ficou em cinzas neutros (`#ededed`/`#cccccc`/`#a1a1a1`/`#787878`)
em vez dos tons quentes — mantém a hierarquia (rótulos um pouco mais apagados) com o texto
branco. Saídas revalidadas pixel a pixel vs v0.4.2: **0 diferenças**. Testes: 42.

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

## 2026-09-24 — Tire Flyer: largura do campo ajustada (v0.4.2)

**Pedido:** a v0.4.1 deixou a largura "um pouco exagerada"; reduzir um pouco.

**Feito:** `main` do Tire Flyer de `max-w-[1600px]` → **`max-w-[1400px]`**. Textarea fica com
**~927px** lógicos em telas 1600+ (era ~1194) e **882px em 1366** (igual, o viewport limita
antes) — segue **sem rolagem lateral** (`scrollWidth == clientWidth`) e as duas colunas
continuam. Flyer (750px) e PNG (1500px) inalterados. Testes: 40.

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
