## Causa

`html2canvas` (1.4.x) não entende cores no formato `oklch()`. O Tailwind v4 deste projeto emite **toda** a paleta default (`slate-*`, `amber-*`, etc., usadas no `PropostaA4`) como `oklch(...)`. Resultado: `Attempting to parse an unsupported color function "oklch"` → `toast.error("Erro ao gerar PDF")`.

## Correção

Trocar `html2canvas` por **`html2canvas-pro`** — fork mantido, drop-in replacement, com suporte nativo a `oklch`, `oklab` e `color()`.

### Passos
1. `bun add html2canvas-pro` (mantém `jspdf`).
2. Em `src/lib/pdf.ts`, trocar:
   ```ts
   import("html2canvas")
   ```
   por
   ```ts
   import("html2canvas-pro")
   ```
   Nenhuma outra mudança de API necessária — assinatura idêntica.
3. Remover a dependência antiga `html2canvas` do `package.json` (opcional, evita confusão).
4. Smoke test: abrir lista de orçamentos → clicar **PDF** → arquivo `Orcamento_*.pdf` baixa sem erro no console.

## Fora do escopo

- Reescrever para PDF vetorial (`pdfmake`/`jspdf` nativo).
- Mudar layout do `PropostaA4`.
- Capa, marca d'água.
