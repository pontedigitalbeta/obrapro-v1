# Central de Ajuda — ObraPro

Implementar uma Central de Ajuda completa e reutilizável, com tooltips de ajuda nos principais formulários, sem alterar funcionalidades existentes.

## 1. Novos componentes reutilizáveis

**`src/components/info-tooltip.tsx`** — `InfoTooltip`
- Ícone `HelpCircle` (16px, `text-muted-foreground`).
- Usa `Popover` (funciona bem em mobile e desktop, abre por click/toque/teclado).
- Props: `content: string`, `title?: string`, `className?: string`.
- `aria-label` ("Ajuda: {title|content curto}"), foco visível, navegável por teclado.
- `PopoverContent` com `max-w-xs`, `side="top"`, `collisionPadding` para não sair da tela.

**`src/components/field-label-with-help.tsx`** — `FieldLabelWithHelp`
- Wrap do `Label` shadcn em `inline-flex items-center gap-1.5`.
- Props: `children`, `help: string`, `required?: boolean`, `htmlFor?: string`.
- Mostra asterisco laranja (`text-accent`) quando `required`.
- Renderiza `<InfoTooltip content={help} />` ao lado.

## 2. Conteúdo centralizado

**`src/lib/help-content.ts`** — exporta:
- `helpTopics`: array `{ id, title, icon, content: string[] }` com os 12 tópicos descritos.
- `quickSteps`: array dos 9 passos do "Passo a passo rápido".
- `faqItems`: array `{ q, a }` com as 7 perguntas.
- `fieldHelp`: objeto agrupando textos curtos dos tooltips por tela/etapa (`wizard.step1.cliente`, `clientes.telefone`, `config.logo`, `dashboard.totalOrcamentos`, etc.) — fonte única de verdade reaproveitada nos formulários.

## 3. Nova rota `/ajuda`

**`src/routes/_authenticated/ajuda.tsx`** (`createFileRoute("/_authenticated/ajuda")`)
- `head`: title "Ajuda — ObraPro".
- Estrutura:
  1. **Cabeçalho**: "Central de Ajuda" + subtítulo + `Input` de busca com ícone `Search` (filtra `helpTopics` e `faqItems` por título/conteúdo, case-insensitive).
  2. **Passo a passo rápido**: `Card` com timeline numerada (círculo primário com número + texto), grid 1 coluna mobile / 2 colunas desktop.
  3. **Tópicos de ajuda**: grid responsivo (1 col mobile, 2 col md, 3 col lg) de `Card`s clicáveis que expandem o conteúdo via `Accordion` (`type="multiple"`) — cada card mostra ícone lucide + título; conteúdo em lista.
  4. **Perguntas frequentes**: seção com `Accordion type="single" collapsible` usando `faqItems`.
  5. **Rodapé**: pequeno card com CTA para WhatsApp/contato (texto institucional, sem nova lógica).
- Busca: estado local `query`; quando vazio, mostra tudo; quando preenchida, filtra ambas as seções e mostra estado vazio amigável.

## 4. Sidebar — item "Ajuda"

**`src/components/app-sidebar.tsx`**
- Importar `HelpCircle` de `lucide-react`.
- Adicionar `{ title: "Ajuda", url: "/ajuda", icon: HelpCircle }` ao final do array `items` (após Configurações).
- Sem outras mudanças.

## 5. Tooltips nos formulários existentes

Apenas substituir/embrulhar `Label`s; **não alterar lógica, validação, estado ou cálculos**.

**`src/components/orcamento-wizard.tsx`** — usar `FieldLabelWithHelp` (ou `InfoTooltip` ao lado de títulos de seção) nos campos das 5 etapas conforme lista do briefing (cliente, título, endereço, validade; tipo de serviço, escopo; categoria, descrição, unidade, quantidade, valor unitário, desconto, valor final; prazo, pagamento, garantia, incluso, não incluso, observações; status, gerar PDF, WhatsApp).

**`src/routes/_authenticated/clientes.tsx`** — ajuda em: nome, telefone, e-mail, endereço da obra, observações.

**`src/routes/_authenticated/configuracoes.tsx`** — ajuda em: nome da empresa, CPF/CNPJ, responsável, telefone, e-mail, cidade, estado, descrição, logo.

**`src/routes/_authenticated/orcamentos.index.tsx`** — `InfoTooltip` discreto nos rótulos dos filtros (status, cliente) e tooltips nos botões PDF / WhatsApp / menu de ações (usando o `Tooltip` shadcn já existente quando for ação por ícone).

## 6. Dashboard

**`src/routes/_authenticated/index.tsx`**
- Adicionar `InfoTooltip` aos 4 cards de métrica (Total, Pendentes, Aprovados, Em negociação) — ícone ao lado do título do card.
- Estado vazio (sem orçamentos): novo `Card` destacado com texto "Comece cadastrando um cliente e criando seu primeiro orçamento profissional." e 3 botões:
  - "Cadastrar cliente" → `/clientes`
  - "Criar orçamento" → `/orcamentos/novo`
  - "Ver ajuda" → `/ajuda` (variant outline)
- Detectar estado vazio pela lista atual de orçamentos já consumida na tela.

## 7. Design & acessibilidade

- Tokens semânticos existentes (`primary`, `accent`, `muted-foreground`, `card`). Laranja só em destaques (asterisco required, número da timeline ativo, CTA "Criar orçamento").
- Mobile-first: cards em coluna única, popovers com `collisionPadding={16}`.
- `aria-label` em todos os botões-ícone de ajuda; `Accordion` Radix já é acessível por teclado.
- Tooltips curtos (≤120 caracteres); textos longos só na Central.

## 8. Não fazer

- Não editar `src/routeTree.gen.ts` (regenerado automaticamente).
- Não instalar dependências novas.
- Não alterar rotas existentes, cálculos do wizard, store ou schemas.
- Não tocar em `src/integrations/supabase/*` nem em `client.ts`.

## Arquivos

**Novos:** `src/components/info-tooltip.tsx`, `src/components/field-label-with-help.tsx`, `src/lib/help-content.ts`, `src/routes/_authenticated/ajuda.tsx`.

**Editados:** `src/components/app-sidebar.tsx`, `src/components/orcamento-wizard.tsx`, `src/routes/_authenticated/clientes.tsx`, `src/routes/_authenticated/configuracoes.tsx`, `src/routes/_authenticated/orcamentos.index.tsx`, `src/routes/_authenticated/index.tsx`.
