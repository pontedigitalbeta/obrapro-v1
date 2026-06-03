# Melhorar template de mensagem do WhatsApp

## Objetivo
Deixar a mensagem do WhatsApp mais profissional, comercial e limpa, sem excesso de emojis, e centralizar em uma única função reutilizável.

## Mudanças

### 1. `src/lib/whatsapp.ts` — reescrever `montarMensagemOrcamento`

Novo formato seguindo exatamente o padrão pedido:

```
Olá, [nome do cliente].

Segue a proposta comercial da [empresa] para análise.

*Proposta Nº [numero]*
Data: [data]
Serviço: [titulo]
Tipo: [tipo]            (omitir se vazio)
Local: [endereço]       (omitir se vazio)

*Escopo do serviço*    (seção inteira omitida se vazio)
[descrição]

*Itens da proposta*

[Categoria]

- [descrição]: [qtd] [un] x [valor unit] = [total]

Subtotal: [subtotal]
Desconto: [desconto]    (omitir linha se desconto = 0)

*Valor total: [total]*

*Condições comerciais*
Prazo de execução: [prazo]       (omitir se vazio)
Forma de pagamento: [pagamento]  (omitir se vazio)
Garantia: [garantia]             (omitir se vazio)
Validade da proposta: [validade]

Fico à disposição para qualquer dúvida ou ajuste necessário.

Atenciosamente,
[responsável]            (omitir se vazio)
[empresa]
[telefone]               (omitir se vazio)
```

Regras de implementação:
- Remover todos os emojis (📄 📅 🛠️ 📍 💰 ⏱️ 💳 🛡️ ✅ ✔️ ❌ 📝 ▸).
- Aplicar `.trim()` em todos os campos string da empresa/orçamento antes de interpolar — evita o bug "*Get Led Soluções *" (asterisco com espaço dentro).
- Não usar negrito em valores que possam ter espaço no fim; envolver sempre `*texto*` com a string já trimada.
- Categorias renderizadas como título simples (sem negrito, sem ícone), uma linha em branco antes e depois, seguidas dos itens com `- `.
- Manter agrupamento por categoria (mão de obra, material, equipamento, outros), pulando categorias vazias.
- Manter fallback resumido caso passe de 3500 chars, no mesmo tom limpo.
- Manter assinatura da função e o export `abrirWhatsAppOrcamento` inalterados.

### 2. `src/components/orcamento-wizard.tsx` — remover duplicação

A função `enviarWhatsApp` no wizard (linhas 80-87) monta sua própria mensagem curta. Substituir para usar `abrirWhatsAppOrcamento` de `@/lib/whatsapp`, garantindo template único em todo o app. Preservar: validação de telefone, `save("enviado")`, toast de erro. Remover o import de `formatBRL` caso fique sem uso.

### 3. Não alterar
- Cálculos (`calcSubtotal`, `calcDesconto`, `calcTotal`).
- Layout das telas, botões, rotas.
- `orcamentos.index.tsx` e `orcamentos.$id.preview.tsx` já usam `abrirWhatsAppOrcamento` — nenhuma mudança ali.

## Arquivos afetados
- editar `src/lib/whatsapp.ts`
- editar `src/components/orcamento-wizard.tsx`
