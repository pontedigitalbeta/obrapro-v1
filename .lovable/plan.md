## Objetivo

Tornar a exportação de PDF a ação principal do orçamento: um botão "PDF" direto na lista que baixa o arquivo imediatamente, e melhorar o envio por WhatsApp para mandar o orçamento como texto formatado (em vez de só um link).

## Mudanças

### 1. Botão "PDF" direto na lista de orçamentos
Arquivo: `src/routes/_authenticated/orcamentos.index.tsx`

- Adicionar botão `PDF` (ícone `FileDown`) em cada linha da tabela e em cada card mobile, ao lado do menu de ações.
- Ao clicar: gera o PDF do orçamento sem precisar navegar até o preview.
- Toast de loading → sucesso/erro.

### 2. Extrair a geração de PDF para função reutilizável
Novo arquivo: `src/lib/pdf.ts`

- Função `gerarOrcamentoPdf(orcamento, cliente, empresa)` que:
  - Renderiza um nó React off-screen (container oculto com a mesma marcação A4 do preview) usando `ReactDOM.createRoot`.
  - Aguarda fontes/imagens carregarem.
  - Roda `html2canvas` + `jsPDF` (mesma lógica de hoje, com paginação A4).
  - Salva como `Orcamento_{numero}_{cliente}.pdf`.
  - Limpa o nó ao final.
- A página de preview e o botão da lista passam a chamar essa função única.

### 3. Componente compartilhado da proposta
Novo arquivo: `src/components/proposta-a4.tsx`

- Extrair o markup A4 atual de `orcamentos.$id.preview.tsx` (header, blocos, tabela de itens, totais, condições, assinatura) para um componente puro `<PropostaA4 orcamento cliente empresa />`.
- A página de preview passa a usar esse componente.
- A função `gerarOrcamentoPdf` renderiza esse mesmo componente off-screen → garante que PDF da lista e do preview sejam idênticos.

### 4. WhatsApp envia o orçamento como texto formatado
Arquivo: `src/lib/whatsapp.ts` (novo) + uso em `orcamentos.index.tsx` e `orcamentos.$id.preview.tsx`

- Função `montarMensagemOrcamento(orcamento, cliente, empresa)` que retorna uma mensagem em texto pronta para WhatsApp, com formatação (asteriscos para negrito, quebras de linha, emojis discretos), contendo:
  - Saudação ao cliente
  - Empresa + nº da proposta + data
  - Título e tipo de serviço
  - Lista de itens agrupados por categoria com qtd × valor unit. = total
  - Subtotal, desconto (se houver) e *Valor total*
  - Prazo, forma de pagamento, garantia, validade
  - Assinatura (responsável + telefone)
- Botão "WhatsApp" abre `https://wa.me/55{telefone}?text={mensagem}` — abre o WhatsApp do próprio usuário já com o texto pronto para enviar ao cliente.
- Adicionar também botão "WhatsApp" na lista (atalho) além do que já existe no preview.

## Detalhes técnicos

- Dependências `html2canvas` e `jspdf` já estão no projeto (usadas no preview atual) — nenhuma instalação nova.
- A renderização off-screen usa um `<div style={{position:'fixed', left:'-10000px', top:0, width:'794px'}}>` (largura A4 @ 96dpi) anexado ao `document.body`, montado via `createRoot`, desmontado após salvar.
- Mensagem WhatsApp limitada a ~3500 chars (limite seguro). Se exceder, fallback resumido + link para a URL do preview.
- Sem mudanças de schema, store ou auth. Apenas frontend.

## Fora do escopo

- Trocar engine para PDF vetorial (pdfmake) — pode ser feito depois.
- Capa, marca d'água, anexos.
- Envio automático via API do WhatsApp (continua sendo `wa.me` que abre o cliente do usuário).