## Plano — Transformar ObraPro em PWA instalável

### 1. Web App Manifest (`public/manifest.webmanifest`)
Atualizar com os campos pedidos:
- `name: "ObraPro"`, `short_name: "ObraPro"`
- `description`: texto fornecido
- `start_url: "/"`, `scope: "/"`, `display: "standalone"`
- `background_color: "#ffffff"`
- `theme_color: "#1e2540"` (azul grafite da identidade)
- `orientation: "portrait-primary"`, `lang: "pt-BR"`
- Ícones: 192, 512 (purpose `any`), 512 maskable, apple-touch-icon 180

Atualizar `theme-color` meta em `__root.tsx` para combinar.

### 2. Ícones maskable
Gerar a partir do `obrapro-icon.png` existente um `android-chrome-512-maskable.png` com padding/safe-zone (≈20% de margem) e fundo branco sólido, exigido pelo Android para ícones adaptáveis.

### 3. Service Worker (offline básico)
Seguindo a skill PWA: usar **`vite-plugin-pwa`** com `generateSW` (não escrever SW à mão).

- Instalar `vite-plugin-pwa` e adicionar ao `vite.config.ts` com:
  - `registerType: "autoUpdate"`
  - `injectRegister: null` (registramos manualmente, com guardas)
  - `devOptions: { enabled: false }`
  - `workbox`: `NetworkFirst` para navegações HTML, `CacheFirst` para assets hash, exclusão de `/~oauth` e rotas `/api/*`
  - `manifest: false` (mantemos o nosso `manifest.webmanifest`)

- Criar `src/lib/pwa/register-sw.ts` — wrapper único de registro que **recusa** registro quando:
  - `!import.meta.env.PROD`
  - dentro de iframe
  - hostname começa com `id-preview--` / `preview--`
  - hostname é/termina em `lovableproject.com`, `lovableproject-dev.com`, `beta.lovable.dev`
  - URL contém `?sw=off`
  
  Em qualquer contexto recusado, faz `unregister()` de registros existentes de `/sw.js`. Chamado uma vez a partir de `src/routes/__root.tsx` dentro de `useEffect`.

### 4. Hook + botão "Instalar app"
- `src/hooks/use-pwa-install.ts` — captura `beforeinstallprompt`, guarda o evento, expõe `{ canInstall, isInstalled, promptInstall, isIOS }`. Detecta instalado via `display-mode: standalone` ou `navigator.standalone`.
- `src/components/install-app-button.tsx` — botão discreto com ícone Download e texto "Instalar app":
  - Se `canInstall` → dispara `prompt()` nativo
  - Se `isInstalled` → mostra "App instalado" (desabilitado) ou se oculta (prop `hideWhenInstalled`)
  - Se iOS Safari (sem prompt) → abre Dialog com instruções: "No iPhone, toque em Compartilhar e depois em 'Adicionar à Tela de Início'. No Android, abra o menu do navegador e toque em 'Instalar app'."

### 5. Locais do botão
- **Sidebar** (`app-sidebar.tsx`): no `SidebarFooter`, acima do bloco de usuário, variante compacta.
- **Dashboard** (`_authenticated/index.tsx`): card/área de destaque no topo (esconde quando instalado).
- **Configurações** (`_authenticated/configuracoes.tsx`): seção "Aplicativo" com botão + texto curto explicando.

### 6. Verificação
- Confirmar `display-mode: standalone` aplica visual de app (já temos viewport correto).
- Em preview Lovable o SW NÃO registra (skill exige); o botão de instalação ainda aparece mas o prompt nativo só dispara em produção/published.

### Arquivos
**Criar:** `src/lib/pwa/register-sw.ts`, `src/hooks/use-pwa-install.ts`, `src/components/install-app-button.tsx`, `public/android-chrome-512-maskable.png`
**Editar:** `public/manifest.webmanifest`, `vite.config.ts`, `package.json` (dep), `src/routes/__root.tsx`, `src/components/app-sidebar.tsx`, `src/routes/_authenticated/index.tsx`, `src/routes/_authenticated/configuracoes.tsx`
