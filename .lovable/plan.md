# ObraPro Orçamentos — Plano de Construção

App web profissional para empreiteiros e prestadores de serviço criarem orçamentos de obra padronizados em PDF.

## Stack e arquitetura

- TanStack Start + React 19 (já configurado)
- Tailwind v4 + shadcn/ui (já configurado)
- Estado global: Zustand + persist em localStorage (mock data agora, troca por Supabase depois)
- PDF: `html2canvas` + `jspdf` para exportar a página de preview A4
- Formulários: react-hook-form + zod
- Ícones: lucide-react

Estrutura de dados isolada em `src/lib/store/` para que a migração futura para Supabase troque apenas a camada de persistência, sem mexer em componentes.

## Design system

- Paleta profissional construção civil: azul-aço como primary, laranja-âmbar como accent (CTA "Novo Orçamento", status), neutros quentes para fundo.
- Tipografia: Inter (UI) + um display sutil para títulos da proposta.
- Tokens em `src/styles.css` (oklch), nada de cores hardcoded.
- Layout com sidebar colapsável (shadcn/ui sidebar) + header com SidebarTrigger. Em mobile vira offcanvas.

## Rotas (TanStack file-based)

```
src/routes/
  __root.tsx              → SidebarProvider + AppSidebar + Outlet
  index.tsx               → Dashboard
  clientes.tsx            → Lista de clientes + dialog de novo/editar
  orcamentos.index.tsx    → Lista de orçamentos com filtros
  orcamentos.novo.tsx     → Wizard 5 etapas
  orcamentos.$id.tsx      → Edição (reusa wizard)
  orcamentos.$id.preview.tsx → Preview A4 da proposta (layout limpo, sem sidebar)
  configuracoes.tsx       → Dados da empresa + upload de logo
```

## Telas

**Dashboard** — 4 cards de métricas (total, pendentes, aprovados, valor em negociação), botão âmbar destacado "Novo Orçamento", tabela dos últimos 5 orçamentos com badges de status.

**Clientes** — Tabela com busca; dialog para criar/editar (nome, telefone, e-mail, endereço da obra, observações).

**Orçamentos** — Tabela com filtros por status (Rascunho/Enviado/Aprovado/Recusado) e por cliente, badges coloridos, ações por linha (visualizar, editar, duplicar, excluir).

**Novo/Editar Orçamento (Wizard 5 etapas)** — Stepper no topo, navegação Voltar/Próximo, salva rascunho a qualquer momento.
1. Cliente + dados da obra (seletor de cliente ou criar inline, endereço, data, validade)
2. Tipo de serviço + descrição do escopo (textarea rica)
3. Itens — tabela dinâmica com categoria (Mão de obra / Material / Equipamento / Outros), descrição, unidade, quantidade, valor unitário, valor total calculado; subtotal por categoria + total geral; campo de desconto (% ou R$) e valor final
4. Condições comerciais — prazo de execução, forma de pagamento, garantia, incluso, não incluso, observações
5. Revisão final — resumo de tudo + botões: Salvar, Visualizar proposta, Gerar PDF, Enviar por WhatsApp (abre `wa.me` com texto pré-formatado e link da proposta)

**Visualização da proposta (`/orcamentos/$id/preview`)** — Página A4 (210×297mm, escala responsiva), sem sidebar, com:
- Capa: logo + nome da empresa + título do orçamento + número + data
- Bloco dados empresa / dados cliente / dados obra
- Escopo do serviço
- Tabela de itens agrupados por categoria com subtotais
- Valor total em destaque (caixa âmbar)
- Condições, prazo, garantia, incluso/não incluso
- Linha de assinatura do responsável
- Botões flutuantes (escondidos na impressão via `print:hidden`): Imprimir, Baixar PDF, WhatsApp, Voltar

**Configurações** — Form com dados da empresa, upload de logo (preview, salvo como base64 no store mock), salvar com toast de confirmação.

## Botões funcionais nesta primeira versão

- Salvar orçamento → persiste no store
- Visualizar proposta → navega para `/orcamentos/$id/preview`
- Gerar PDF → html2canvas + jspdf da página de preview
- Gerar apresentação comercial → reaproveita o mesmo PDF (mesma proposta visual) nesta v1
- Enviar por WhatsApp → `https://wa.me/<telefone>?text=<texto>`

## Mock data

Seed inicial com 1 empresa configurada, 3 clientes, 4 orçamentos em status variados, para que o Dashboard e listas já apareçam preenchidos no primeiro acesso.

## Pronto para Supabase depois

Camada `src/lib/store/` exporta hooks (`useClientes`, `useOrcamentos`, `useEmpresa`) com a mesma assinatura que servirá para queries do Supabase. Tipos em `src/lib/types.ts` espelham o futuro schema (tabelas `clientes`, `orcamentos`, `orcamento_itens`, `empresa`).

## Fora do escopo desta v1

- Autenticação / multi-usuário
- Backend real (Supabase) — estrutura preparada, ativação fica para próximo passo
- Templates múltiplos de proposta (apenas 1 layout agora)
- Envio real de e-mail
