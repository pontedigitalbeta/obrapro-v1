## Objetivo
Refinar o menu lateral (`src/components/app-sidebar.tsx`) para deixar as opções mais destacadas visualmente e fazer o menu minimizar automaticamente ao selecionar um item.

## Mudanças

### 1. Destaque visual das opções (`src/components/app-sidebar.tsx`)
- Aumentar a altura dos itens do menu (de padrão ~32px para ~44px) com mais padding horizontal.
- Aumentar o tamanho do ícone (de `h-4 w-4` para `h-5 w-5`) e do texto (`text-sm` → `text-[15px] font-medium`).
- Item ativo: fundo sólido `bg-primary text-primary-foreground` com cantos arredondados, ícone com peso visual maior e uma barra indicadora à esquerda (`before:` pseudo-elemento de 3px usando `bg-accent`).
- Item inativo: hover com `bg-sidebar-accent` suave + leve transição de cor no ícone.
- Aumentar espaçamento vertical entre itens (`gap-1` no `SidebarMenu`).
- Ocultar o `SidebarGroupLabel` "Menu" (redundante) ou estilizá-lo como caption discreto em uppercase.

### 2. Auto-minimizar ao selecionar (`src/components/app-sidebar.tsx`)
- Usar `useSidebar()` para acessar `setOpen` (desktop) e `setOpenMobile` (mobile).
- No `onClick` de cada `Link`, chamar `setOpen(false)` em telas desktop e `setOpenMobile(false)` em mobile, exceto se o item já estiver ativo (evita colapsar/reabrir desnecessariamente).
- O ícone permanece visível porque o `Sidebar` já usa `collapsible="icon"`, então "minimizar" = colapsar para a faixa de ícones, mantendo navegação acessível.

## Fora de escopo
- Não mexer no header, footer (perfil/logout) ou estrutura de rotas.
- Não alterar tokens globais em `styles.css` (apenas classes utilitárias no componente). Se for necessário um token novo de destaque, adicionar de forma mínima.
- Sem novas dependências.

## Detalhes técnicos
- `SidebarMenuButton` aceita `size="lg"` (variante já existente no shadcn sidebar) — usar para altura/tipografia maior.
- Indicador ativo via `data-[active=true]:` variantes do Tailwind, lendo `isActive` já passado ao botão.
- `setOpen` vs `setOpenMobile`: o hook `useSidebar` expõe `isMobile`; usar para decidir qual setter chamar.
