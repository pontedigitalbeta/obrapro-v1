import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Orcamento, Cliente, Empresa, ItemCategoria } from "@/lib/types";
import { CATEGORIA_LABELS } from "@/lib/types";
import { calcSubtotal, calcDesconto, calcTotal, formatBRL } from "@/lib/store";

const MAX_LEN = 3500;

export function montarMensagemOrcamento(
  orcamento: Orcamento,
  cliente: Cliente | undefined,
  empresa: Empresa,
): string {
  const subtotal = calcSubtotal(orcamento.itens);
  const desconto = calcDesconto(subtotal, orcamento.descontoTipo, orcamento.descontoValor);
  const total = calcTotal(orcamento);

  const itensPorCategoria = (Object.keys(CATEGORIA_LABELS) as ItemCategoria[])
    .map((cat) => ({ cat, itens: orcamento.itens.filter((i) => i.categoria === cat) }))
    .filter((g) => g.itens.length > 0);

  const linhas: string[] = [];
  const saudacao = cliente?.nome ? `Olá, ${cliente.nome.split(" ")[0]}!` : "Olá!";
  linhas.push(saudacao);
  linhas.push("");
  linhas.push(`Segue a proposta da *${empresa.nome || "nossa empresa"}*:`);
  linhas.push("");
  linhas.push(`📄 *Proposta Nº ${orcamento.numero}*`);
  linhas.push(`📅 ${format(new Date(orcamento.data), "dd/MM/yyyy", { locale: ptBR })}`);
  linhas.push(`🛠️ *${orcamento.titulo}*`);
  if (orcamento.tipoServico) linhas.push(`_${orcamento.tipoServico}_`);
  if (orcamento.enderecoObra || cliente?.enderecoObra) {
    linhas.push(`📍 ${orcamento.enderecoObra || cliente?.enderecoObra}`);
  }
  linhas.push("");

  if (orcamento.descricaoEscopo) {
    linhas.push("*Escopo do serviço:*");
    linhas.push(orcamento.descricaoEscopo);
    linhas.push("");
  }

  linhas.push("*Itens:*");
  for (const { cat, itens } of itensPorCategoria) {
    linhas.push(`▸ _${CATEGORIA_LABELS[cat]}_`);
    for (const i of itens) {
      const tot = i.quantidade * i.valorUnitario;
      linhas.push(
        `  • ${i.descricao || "—"} — ${i.quantidade} ${i.unidade} × ${formatBRL(i.valorUnitario)} = *${formatBRL(tot)}*`
      );
    }
  }
  linhas.push("");

  linhas.push(`Subtotal: ${formatBRL(subtotal)}`);
  if (desconto > 0) {
    const sufixo = orcamento.descontoTipo === "percentual" ? ` (${orcamento.descontoValor}%)` : "";
    linhas.push(`Desconto${sufixo}: − ${formatBRL(desconto)}`);
  }
  linhas.push(`💰 *VALOR TOTAL: ${formatBRL(total)}*`);
  linhas.push("");

  const cond: string[] = [];
  if (orcamento.prazoExecucao) cond.push(`⏱️ *Prazo:* ${orcamento.prazoExecucao}`);
  if (orcamento.formaPagamento) cond.push(`💳 *Pagamento:* ${orcamento.formaPagamento}`);
  if (orcamento.garantia) cond.push(`🛡️ *Garantia:* ${orcamento.garantia}`);
  cond.push(`✅ *Validade:* ${format(new Date(orcamento.validade), "dd/MM/yyyy", { locale: ptBR })}`);
  if (orcamento.incluso) cond.push(`✔️ *Inclui:* ${orcamento.incluso}`);
  if (orcamento.naoIncluso) cond.push(`❌ *Não inclui:* ${orcamento.naoIncluso}`);
  linhas.push(...cond);

  if (orcamento.observacoesFinais) {
    linhas.push("");
    linhas.push(`📝 *Observações:* ${orcamento.observacoesFinais}`);
  }

  linhas.push("");
  linhas.push("Qualquer dúvida, estou à disposição!");
  if (empresa.responsavel || empresa.telefone) {
    linhas.push(`— ${empresa.responsavel || empresa.nome}${empresa.telefone ? ` • ${empresa.telefone}` : ""}`);
  }

  let msg = linhas.join("\n");
  if (msg.length > MAX_LEN) {
    // fallback resumido
    const resumo = [
      saudacao,
      "",
      `Segue a proposta da *${empresa.nome}*:`,
      `📄 *Nº ${orcamento.numero}* — ${orcamento.titulo}`,
      `📅 ${format(new Date(orcamento.data), "dd/MM/yyyy", { locale: ptBR })}`,
      `💰 *Valor total: ${formatBRL(total)}*`,
      `✅ Validade: ${format(new Date(orcamento.validade), "dd/MM/yyyy", { locale: ptBR })}`,
      "",
      "Posso enviar o PDF detalhado em seguida. Qualquer dúvida estou à disposição!",
      empresa.responsavel ? `— ${empresa.responsavel}` : "",
    ].filter(Boolean).join("\n");
    msg = resumo;
  }
  return msg;
}

export function abrirWhatsAppOrcamento(
  orcamento: Orcamento,
  cliente: Cliente | undefined,
  empresa: Empresa,
): { ok: true } | { ok: false; reason: string } {
  if (!cliente?.telefone) return { ok: false, reason: "Cliente sem telefone" };
  const msg = montarMensagemOrcamento(orcamento, cliente, empresa);
  const tel = cliente.telefone.replace(/\D/g, "");
  const url = `https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
  return { ok: true };
}
