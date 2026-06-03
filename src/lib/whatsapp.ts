import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Orcamento, Cliente, Empresa, ItemCategoria } from "@/lib/types";
import { CATEGORIA_LABELS } from "@/lib/types";
import { calcSubtotal, calcDesconto, calcTotal, formatBRL } from "@/lib/store";

const MAX_LEN = 3500;

const clean = (v: string | undefined | null): string => (v ?? "").replace(/\s+/g, " ").trim();

export function montarMensagemOrcamento(
  orcamento: Orcamento,
  cliente: Cliente | undefined,
  empresa: Empresa,
): string {
  const subtotal = calcSubtotal(orcamento.itens);
  const desconto = calcDesconto(subtotal, orcamento.descontoTipo, orcamento.descontoValor);
  const total = calcTotal(orcamento);

  const nomeCliente = clean(cliente?.nome);
  const nomeEmpresa = clean(empresa.nome) || "nossa empresa";
  const responsavel = clean(empresa.responsavel);
  const telefoneEmpresa = clean(empresa.telefone);

  const titulo = clean(orcamento.titulo);
  const tipoServico = clean(orcamento.tipoServico);
  const endereco = clean(orcamento.enderecoObra) || clean(cliente?.enderecoObra);
  const escopo = clean(orcamento.descricaoEscopo);
  const prazo = clean(orcamento.prazoExecucao);
  const pagamento = clean(orcamento.formaPagamento);
  const garantia = clean(orcamento.garantia);

  const itensPorCategoria = (Object.keys(CATEGORIA_LABELS) as ItemCategoria[])
    .map((cat) => ({ cat, itens: orcamento.itens.filter((i) => i.categoria === cat) }))
    .filter((g) => g.itens.length > 0);

  const linhas: string[] = [];

  linhas.push(nomeCliente ? `Olá, ${nomeCliente}.` : "Olá.");
  linhas.push("");
  linhas.push(`Segue a proposta comercial da ${nomeEmpresa} para análise.`);
  linhas.push("");

  // Dados da proposta
  linhas.push(`*Proposta Nº ${clean(orcamento.numero)}*`);
  linhas.push(`Data: ${format(new Date(orcamento.data), "dd/MM/yyyy", { locale: ptBR })}`);
  if (titulo) linhas.push(`Serviço: ${titulo}`);
  if (tipoServico) linhas.push(`Tipo: ${tipoServico}`);
  if (endereco) linhas.push(`Local: ${endereco}`);

  // Escopo
  if (escopo) {
    linhas.push("");
    linhas.push("*Escopo do serviço*");
    linhas.push(escopo);
  }

  // Itens
  if (itensPorCategoria.length > 0) {
    linhas.push("");
    linhas.push("*Itens da proposta*");
    for (const { cat, itens } of itensPorCategoria) {
      linhas.push("");
      linhas.push(CATEGORIA_LABELS[cat]);
      linhas.push("");
      for (const i of itens) {
        const desc = clean(i.descricao) || "—";
        const un = clean(i.unidade) || "un";
        const tot = i.quantidade * i.valorUnitario;
        linhas.push(
          `- ${desc}: ${i.quantidade} ${un} x ${formatBRL(i.valorUnitario)} = ${formatBRL(tot)}`,
        );
      }
    }
  }

  // Totais
  linhas.push("");
  linhas.push(`Subtotal: ${formatBRL(subtotal)}`);
  if (desconto > 0) {
    const sufixo = orcamento.descontoTipo === "percentual" ? ` (${orcamento.descontoValor}%)` : "";
    linhas.push(`Desconto${sufixo}: ${formatBRL(desconto)}`);
  }
  linhas.push("");
  linhas.push(`*Valor total: ${formatBRL(total)}*`);

  // Condições comerciais
  const condicoes: string[] = [];
  if (prazo) condicoes.push(`Prazo de execução: ${prazo}`);
  if (pagamento) condicoes.push(`Forma de pagamento: ${pagamento}`);
  if (garantia) condicoes.push(`Garantia: ${garantia}`);
  condicoes.push(
    `Validade da proposta: ${format(new Date(orcamento.validade), "dd/MM/yyyy", { locale: ptBR })}`,
  );
  linhas.push("");
  linhas.push("*Condições comerciais*");
  linhas.push(...condicoes);

  // Assinatura
  linhas.push("");
  linhas.push("Fico à disposição para qualquer dúvida ou ajuste necessário.");
  linhas.push("");
  linhas.push("Atenciosamente,");
  if (responsavel) linhas.push(responsavel);
  linhas.push(nomeEmpresa);
  if (telefoneEmpresa) linhas.push(telefoneEmpresa);

  let msg = linhas.join("\n");

  if (msg.length > MAX_LEN) {
    const resumo = [
      nomeCliente ? `Olá, ${nomeCliente}.` : "Olá.",
      "",
      `Segue a proposta comercial da ${nomeEmpresa} para análise.`,
      "",
      `*Proposta Nº ${clean(orcamento.numero)}*`,
      `Data: ${format(new Date(orcamento.data), "dd/MM/yyyy", { locale: ptBR })}`,
      titulo ? `Serviço: ${titulo}` : "",
      "",
      `*Valor total: ${formatBRL(total)}*`,
      `Validade da proposta: ${format(new Date(orcamento.validade), "dd/MM/yyyy", { locale: ptBR })}`,
      "",
      "Posso enviar o PDF detalhado em seguida. Fico à disposição para qualquer dúvida.",
      "",
      "Atenciosamente,",
      responsavel || "",
      nomeEmpresa,
      telefoneEmpresa || "",
    ].filter((l) => l !== "" || true).join("\n");
    msg = resumo.replace(/\n{3,}/g, "\n\n");
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
