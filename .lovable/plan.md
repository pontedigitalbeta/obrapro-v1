## Objetivo

Separar claramente o uso das duas versões da marca ObraPro e eliminar a duplicidade visual. Os arquivos já existentes em `src/assets/` são adequados:
- `obrapro-logo.png` → **wordmark** (apenas texto "ObraPro")
- `obrapro-icon.png` → **ícone** (casa/documento/check)

Não é preciso gerar novos assets — apenas corrigir onde cada um é usado.

## Mudanças

### 1. Cabeçalho/topbar — `src/routes/_authenticated/route.tsx`
- Já usa o wordmark, mas está pequeno (`h-7`). Ajustar para `h-8 md:h-10` (32px mobile, 40px desktop) com `object-contain`.
- Manter fundo branco, borda inferior, alinhamento vertical central, ao lado do `SidebarTrigger`.

### 2. Sidebar — `src/components/app-sidebar.tsx`
- Remover a imagem do wordmark (`logoFull`) que aparece ao lado do ícone quando expandida — essa é a duplicidade.
- No header da sidebar, exibir apenas o ícone dentro de um container quadrado branco com cantos arredondados:
  - Container: `h-14 w-14 md:h-16 md:w-16` (56/64px), `bg-white rounded-xl border` centralizado.
  - Ícone interno: `h-11 w-11 md:h-12 md:w-12` (44/48px) com `object-contain`.
- Abaixo do container (apenas quando expandida), texto HTML "ObraPro" — não imagem — com tipografia bold da marca (azul escuro + laranja no "Pro" via spans).
- Quando colapsada (`collapsible="icon"`), exibir só o container reduzido com o ícone, sem texto.
- Manter intactos os itens Dashboard, Orçamentos, Clientes, Configurações e o footer (install button, perfil, sair).

### 3. PDF — `src/components/proposta-a4.tsx`
- No cabeçalho do PDF, quando a empresa **não** tiver logo própria, usar o **wordmark** (`obrapro-logo.png`) no lugar do ícone atual.
- Ajustar dimensões para `h-10 w-auto` mantendo `object-contain` (substituir o atual `h-14 w-14`).

### 4. Favicon / PWA / Manifest
- Já configurados com o ícone (`favicon.ico`, `favicon.png`, `apple-touch-icon.png`, `android-chrome-192/512`, `512-maskable`, `manifest.webmanifest`). **Sem mudanças** — apenas confirmar que continuam apontando para o ícone.

### 5. SEO / Open Graph / Install button
- **Sem mudanças.** Title, description, OG tags, manifest e `InstallAppButton` continuam como estão.

## O que NÃO muda

- Rotas, telas, lógica de negócio, autenticação, store, PWA service worker.
- `src/routes/auth.tsx`, `src/routes/_authenticated/index.tsx`, `src/routes/_authenticated/configuracoes.tsx` (continuam usando o wordmark em áreas amplas, o que está correto).
- Arquivos de asset em `public/` e `src/assets/`.

## Revisão final (checklist após implementar)

- Header mobile: apenas wordmark, 32px de altura, alinhado ao trigger.
- Sidebar expandida: apenas ícone em container + "ObraPro" como texto. Nenhuma imagem de wordmark.
- Sidebar colapsada: apenas ícone.
- PDF: cabeçalho com wordmark (fallback) ou logo do usuário.
- Favicon e PWA continuam usando o ícone.
