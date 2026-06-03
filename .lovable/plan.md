## Problema

Hoje `gerarOrcamentoPdf` rasteriza o `PropostaA4` inteiro em **um único canvas** e o jsPDF apenas desloca a imagem para baixo a cada página A4. Resultado: linhas da tabela, totais e blocos de condições são cortados ao meio entre páginas.

## Solução: paginação por blocos com pontos de quebra seguros

Em vez de fatiar cega­mente a cada 297 mm, vamos medir o DOM, encontrar **boundaries seguros** (entre blocos e entre linhas de tabela) e cortar o canvas só nesses pontos. Também adicionamos margens, cabeçalho repetido e rodapé com paginação.

### 1. Marcar pontos de quebra no `PropostaA4`
Arquivo: `src/components/proposta-a4.tsx`

- Adicionar `data-pdf-block` nos containers de nível superior: header, título, blocos empresa/cliente, escopo, cada grupo de categoria de itens, bloco de totais, condições, observações, assinatura, rodapé.
- Adicionar `data-pdf-row` em cada `<tr>` da tabela de itens (incluindo cabeçalho da tabela, linhas de item, linha de subtotal por categoria).
- Adicionar `data-pdf-keep-with-next` no header da tabela e no header de categoria, pra nunca ficarem órfãos no fim de página.
- Sem mudança visual no preview — só atributos.

### 2. Reescrever a geração em `src/lib/pdf.ts`

Novo fluxo:

```text
render off-screen (largura 794px = A4 @ 96dpi, padding interno)
    ↓
html2canvas-pro → canvas único (scale: 2)
    ↓
coletar Y de TODOS os elementos [data-pdf-block] e [data-pdf-row]
em coordenadas do canvas (offsetTop * scale)
    ↓
para cada página:
  • alturaUtil = A4 - margens topo/base (em px @ scale)
  • escolher o maior boundary Y ≤ (cursor + alturaUtil)
  • se nenhum boundary couber (bloco gigante), force-cut em (cursor + alturaUtil)
  • desenhar slice do canvas em um canvas-página, exportar JPEG, addImage
  • desenhar header (logo + nº proposta) e footer (página X / Y, empresa)
    diretamente no pdf via pdf.text / pdf.setFillColor
```

Margens A4: 10 mm topo (após header), 12 mm base (antes footer), 8 mm laterais. Header/footer desenhados pelo jsPDF (texto vetorial nítido) — não pelo canvas.

### 3. CSS de impressão consistente
Arquivo: `src/components/proposta-a4.tsx` (classes Tailwind) + `src/styles.css` (regras `@media print` já existentes, se houver — ajustar se necessário)

- Garantir `break-inside: avoid` nas linhas e blocos (CSS puro, para também ajudar o `window.print()` do botão Imprimir).
- Largura fixa do container off-screen: `width: 794px`, padding interno equivalente a 8 mm laterais — assim o canvas já vem na proporção certa pro A4.

### 4. Empty-page guard
Se o último boundary escolhido = cursor (boundary não avançou), avançar com corte forçado pra evitar loop infinito.

## Detalhes técnicos

- A4 retrato: 210 × 297 mm. Em px @ 96dpi: 794 × 1123. Com `scale: 2` o canvas tem 1588 × 2246 por "página visual".
- Coordenadas: como `html2canvas-pro` rasteriza o nó em escala fiel, `element.offsetTop` (relativo ao container raiz) × `scale` = Y no canvas. Usamos `getBoundingClientRect()` relativos ao container pra ser robusto a margens.
- Header repetido no PDF mostra: logo (se houver, do `empresa.logoBase64`), nome da empresa à esquerda, nº da proposta + data à direita, linha âmbar fina embaixo. Só aparece da **página 2** em diante (página 1 já tem o header completo da proposta).
- Footer em todas as páginas: `Página X de Y · {empresa.nome} · {empresa.telefone}`.
- Nome do arquivo e fluxo de toast permanecem iguais.

## Fora do escopo

- Trocar pra PDF vetorial (pdfmake/jspdf nativo).
- Sumário / capa / marca d'água.
- Quebra entre páginas no `window.print()` (já razoável, mas não é o foco).
