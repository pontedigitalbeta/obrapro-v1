# Mobile-first responsivo

Objetivo: deixar o ObraPro perfeitamente usável em telas pequenas (≥320px), mantendo o desktop intacto.

## O que muda

### 1. Layout autenticado (`_authenticated/route.tsx` + `app-sidebar.tsx`)
- Sidebar já é `collapsible="icon"` no desktop. No mobile vira drawer (off-canvas) controlado pelo `SidebarTrigger` — garantir que o trigger fica sempre visível no header.
- Header sticky: ajustar padding (`px-3 md:px-4`), reduzir texto secundário em telas pequenas (esconder "ObraPro Orçamentos" em `<sm`, mostrar só logo+título curto).
- Main: padding `p-3 sm:p-4 md:p-6 lg:p-8`.

### 2. Tabelas (Dashboard, Orçamentos, Clientes)
Tabelas com 6–7 colunas estouram no mobile mesmo com scroll. Estratégia híbrida:
- `<md`: renderizar uma lista de **cards** (um card por orçamento/cliente) com as infos essenciais (nº, título, cliente, valor, status, menu de ações).
- `≥md`: manter a `<Table>` atual.

Aplica a:
- `_authenticated/index.tsx` (Últimos orçamentos)
- `_authenticated/orcamentos.index.tsx`
- `_authenticated/clientes.tsx`

### 3. Filtros e toolbars
- Barra de busca + selects: já tem `flex-col sm:flex-row`. Confirmar que botão "Novo" ocupa largura total no mobile (`w-full sm:w-auto`).
- Títulos: `text-xl sm:text-2xl md:text-3xl` para evitar quebra feia.

### 4. Wizard de orçamento (`orcamento-wizard.tsx`)
- Stepper: no mobile, mostrar só o passo atual + "Passo X de 5" em vez dos 5 chips lado a lado.
- Grids de campos: trocar `grid-cols-2` para `grid-cols-1 sm:grid-cols-2`.
- Tabela de itens (passo 3): no mobile, render como cards empilhados com inputs full-width; no desktop mantém tabela.
- Botões de navegação (Voltar/Avançar/Salvar/WhatsApp/PDF): empilhar (`flex-col sm:flex-row`), todos `w-full sm:w-auto`, agrupar ações secundárias.

### 5. Preview do orçamento (`orcamentos.$id.preview.tsx`)
- Barra de ações topo: stack no mobile.
- Documento A4: já tem largura fixa para impressão — adicionar `max-w-full overflow-x-auto` no wrapper e reduzir paddings internos em mobile (`p-6 md:p-12`).
- Tabela de itens da proposta: scroll horizontal com indicação visual.

### 6. Auth (`routes/auth.tsx`) e Configurações
- Card de auth: `max-w-md w-full`, padding reduzido em mobile.
- Tabs e formulários: inputs full-width já por padrão, validar.
- Configurações: grids 2-col → 1-col em mobile.

### 7. Toques finais mobile
- Áreas de toque mínimas 44px (botões `size="icon"` já são 40px — manter, ok).
- `font-size: 16px` em inputs para não dar zoom no iOS (shadcn já faz).
- Adicionar `<meta name="viewport">` — verificar `__root.tsx` (já deve existir; confirmar).

## Detalhes técnicos
- Breakpoints Tailwind padrão: `sm 640`, `md 768`, `lg 1024`.
- Componente reutilizável `MobileListCard` evita duplicar markup nas 3 listas.
- Nenhuma mudança de schema/store/auth — puramente UI/CSS.
- Sem novas dependências.

## Fora do escopo
- PWA / instalação offline.
- Reescrita visual / nova identidade.
- Mudanças em lógica de negócio.
