## Objetivo
Permitir alterar rapidamente o status de um orçamento (rascunho / enviado / aprovado / recusado) por meio de um ícone dedicado, tanto na listagem mobile quanto na tabela desktop, sem remover nenhuma ação existente.

## 1. Novo componente reutilizável
**Arquivo:** `src/components/orcamento-status-menu.tsx`

- Nome: `OrcamentoStatusMenu`
- Props:
  - `orcamento: Orcamento`
  - `variant?: "icon" | "button"` (default `"icon"`)
  - `onChanged?: (novo: OrcamentoStatus) => void`
- Comportamento:
  - Botão com ícone `ListChecks` (lucide-react). `variant="outline"`, `size="sm"` (ou `size="icon"` h-8 w-8 quando `variant="icon"`).
  - `aria-label="Alterar status do orçamento"`, `title="Alterar status"` (tooltip nativo, consistente com PDF/WhatsApp da lista).
  - Abre `DropdownMenu` (já em uso no projeto) com as 4 opções via `STATUS_LABELS` de `src/lib/types.ts`.
  - Cada item mostra um *dot* colorido (mapa local de cores reutilizando os tokens já usados em `status-badge.tsx`: `bg-muted`, `bg-info`, `bg-success`, `bg-destructive`) + label + `Check` à direita quando é o status atual.
  - Status atual fica com classe `font-semibold` e ícone de check; demais selecionáveis.
  - Ao clicar:
    - Se for o mesmo status: fecha o menu, sem toast.
    - Se for novo: `useStore.getState().updateOrcamento(orcamento.id, { status: novo })`, `toast.success(`Status alterado para ${STATUS_LABELS[novo]}`)`, dispara `onChanged?.(novo)`.

## 2. Integração na listagem `src/routes/_authenticated/orcamentos.index.tsx`

### Mobile (card)
Na linha do badge, transformar em um cluster:
```
[StatusBadge]  [OrcamentoStatusMenu variant="icon"]        [valor]
```
Apenas substituir o `<StatusBadge>` solitário por um `<div className="flex items-center gap-2">` contendo o badge + `<OrcamentoStatusMenu orcamento={o} />`. Não mexer no bloco `renderQuickActions` (PDF/WhatsApp continuam abaixo).

### Desktop (tabela)
Dentro de `<div className="flex items-center justify-end gap-1.5">` da coluna Ações, inserir `<OrcamentoStatusMenu orcamento={o} />` ANTES de `renderQuickActions(o)` e do menu `MoreVertical`. Ordem final:
```
[Status ▾] [PDF] [WhatsApp] [⋮]
```
Sem alterar `TableHead` nem larguras (a coluna já tem `w-[200px]`; se ficar apertada, ampliar para `w-[240px]`).

## 3. Status atual e import
- Importar `OrcamentoStatusMenu` no topo do arquivo da listagem.
- Reutilizar `STATUS_LABELS` e tipo `OrcamentoStatus` já exportados de `src/lib/types.ts` — nenhum novo tipo necessário.

## 4. Mapa visual de cores (dentro do componente)
```ts
const dot: Record<OrcamentoStatus, string> = {
  rascunho:  "bg-muted-foreground/60",
  enviado:   "bg-info",
  aprovado:  "bg-success",
  recusado:  "bg-destructive",
};
```
Consistente com `src/components/status-badge.tsx`.

## 5. (Opcional, baixo custo) Detalhe do orçamento
Em `src/routes/_authenticated/orcamentos.$id.tsx`, se houver um cabeçalho com o status do orçamento sendo editado, adicionar `<OrcamentoStatusMenu orcamento={o} variant="button" />` ao lado do título. Faço uma verificação rápida do arquivo durante a implementação e só adiciono se a integração for trivial (1 linha); caso contrário, fica para depois conforme o item 10 do briefing.

## 6. O que NÃO muda
- `StatusBadge`, `status-badge.tsx`, layout geral, tokens de cor, rotas, store API (`updateOrcamento` já existe), botões PDF/WhatsApp, dropdown `MoreVertical`, filtros, busca.

## 7. Verificação final
- Ícone aparece no card mobile (ao lado do badge) e na coluna Ações desktop.
- Menu lista os 4 status com dot colorido e check no atual.
- Clicar troca o status, badge atualiza imediatamente (Zustand → re-render), toast aparece.
- Selecionar o mesmo status não dispara toast.
- Nenhuma ação existente removida; layout limpo no mobile (393px) e desktop.

## Arquivos
- **Criar:** `src/components/orcamento-status-menu.tsx`
- **Editar:** `src/routes/_authenticated/orcamentos.index.tsx`
- **Editar (opcional, se trivial):** `src/routes/_authenticated/orcamentos.$id.tsx`
