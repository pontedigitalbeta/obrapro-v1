# Plano: Login e cadastro no primeiro acesso

Ativar Lovable Cloud (backend) para autenticação real com email/senha + Google, perfis de usuário e isolamento de dados por usuário via RLS.

## 1. Ativar Lovable Cloud
Banco, auth e secrets gerenciados (necessário para login real e Google OAuth).

## 2. Banco de dados (migrations)

**Tabela `profiles`** (1:1 com `auth.users`)
- `id uuid PK` → FK `auth.users(id) ON DELETE CASCADE`
- `nome text`, `telefone text`, `cargo text`, `avatar_url text`
- `created_at`, `updated_at`
- RLS: usuário lê/atualiza apenas o próprio perfil
- Trigger `handle_new_user()` cria profile automaticamente no signup

**Tabelas de dados** (`clientes`, `orcamentos`, `empresa`)
- Adicionar coluna `user_id uuid NOT NULL` referenciando `auth.users(id)`
- RLS: `SELECT/INSERT/UPDATE/DELETE` apenas onde `user_id = auth.uid()`
- GRANTs para `authenticated` + `service_role`

## 3. Configurar Google OAuth
Chamar `configure_social_auth` com `providers: ["google"]`.

## 4. Rotas

- `src/routes/auth.tsx` (pública) — tabs **Entrar** / **Criar conta**
  - Email/senha (zod validation, mín. 6 caracteres)
  - Botão "Continuar com Google" via broker `lovable.auth.signInWithOAuth("google")`
  - Após login → redirect `/`
- `src/routes/_authenticated/route.tsx` — gate gerenciado (`ssr: false`, redireciona para `/auth`)
- Mover rotas existentes para dentro de `_authenticated/`:
  - `index.tsx` (dashboard), `clientes.tsx`, `orcamentos.*`, `configuracoes.tsx`
- Manter `orcamentos.$id.preview.tsx` acessível (para visualização da proposta — decidir se público ou autenticado; manter autenticado por enquanto)

## 5. Migrar store local → Supabase

Refatorar `src/lib/store/index.ts`: trocar Zustand+localStorage por server functions com `requireSupabaseAuth`:
- `src/lib/clientes.functions.ts`, `orcamentos.functions.ts`, `empresa.functions.ts`
- Hooks atualizados (`useClientes`, `useOrcamentos`, `useEmpresa`) usando TanStack Query
- Todas as queries filtram automaticamente por `user_id` via RLS

## 6. UI auxiliar

- `__root.tsx`: registrar `onAuthStateChange` (invalida queries) + bearer attacher em `start.ts`
- Sidebar: mostrar nome do usuário + botão **Sair**
- Página `configuracoes.tsx`: aba "Minha conta" (nome, telefone, cargo) além de dados da empresa

## Detalhes técnicos

- `auth-attacher` deve estar registrado em `src/start.ts` `functionMiddleware`
- Senha mínima de 6 caracteres (Supabase default); validação client-side com zod
- Sign up usa `emailRedirectTo: window.location.origin`
- Manter mock data atual apenas como seed opcional (descartar)
- Dados existentes no localStorage serão perdidos (app ainda em desenvolvimento)

## Fora de escopo
- Reset de senha (pode ser adicionado depois)
- Roles/admin (single-user por conta)
- Multi-tenant/equipes compartilhadas

