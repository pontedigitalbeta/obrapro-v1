import { Fragment } from "react";
import { HardHat } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CATEGORIA_LABELS, type ItemCategoria, type Orcamento, type Cliente, type Empresa } from "@/lib/types";
import { calcSubtotal, calcDesconto, calcTotal, formatBRL } from "@/lib/store";

interface Props {
  orcamento: Orcamento;
  cliente: Cliente | undefined;
  empresa: Empresa;
}

export function PropostaA4({ orcamento, cliente, empresa }: Props) {
  const subtotal = calcSubtotal(orcamento.itens);
  const desconto = calcDesconto(subtotal, orcamento.descontoTipo, orcamento.descontoValor);
  const total = calcTotal(orcamento);

  const itensPorCategoria = (Object.keys(CATEGORIA_LABELS) as ItemCategoria[])
    .map((cat) => ({ cat, itens: orcamento.itens.filter((i) => i.categoria === cat) }))
    .filter((g) => g.itens.length > 0);

  return (
    <div className="a4-page print-page text-[13px] leading-relaxed">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b-4 pb-4 sm:flex-row sm:items-start sm:justify-between" style={{ borderColor: "#d97706" }}>
        <div className="flex items-center gap-3">
          {empresa.logoBase64 ? (
            <img src={empresa.logoBase64} alt={empresa.nome} className="h-14 w-14 rounded object-contain sm:h-16 sm:w-16" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded bg-slate-800 text-amber-400 sm:h-16 sm:w-16">
              <HardHat className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-800 sm:text-xl">{empresa.nome}</h1>
            <p className="truncate text-xs text-slate-500">{empresa.descricao}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs">Proposta Comercial</p>
          <p className="text-xl font-bold text-slate-800 sm:text-2xl">Nº {orcamento.numero}</p>
          <p className="text-xs text-slate-500">{format(new Date(orcamento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
      </div>

      {/* Title */}
      <div className="my-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">{orcamento.titulo}</h2>
        {orcamento.tipoServico && <p className="mt-1 text-sm text-slate-500">{orcamento.tipoServico}</p>}
      </div>

      {/* Data blocks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Block title="Empresa">
          <p><strong>{empresa.nome}</strong></p>
          <p>{empresa.documento}</p>
          <p>{empresa.telefone} • {empresa.email}</p>
          <p>{empresa.cidade}/{empresa.estado}</p>
        </Block>
        <Block title="Cliente">
          <p><strong>{cliente?.nome ?? "—"}</strong></p>
          <p>{cliente?.telefone}{cliente?.email ? ` • ${cliente.email}` : ""}</p>
          <p className="text-slate-600">Obra: {orcamento.enderecoObra || cliente?.enderecoObra || "—"}</p>
        </Block>
      </div>

      {/* Escopo */}
      {orcamento.descricaoEscopo && (
        <Section title="Escopo do serviço">
          <p className="whitespace-pre-wrap text-slate-700">{orcamento.descricaoEscopo}</p>
        </Section>
      )}

      {/* Itens */}
      <Section title="Itens do orçamento">
        <div className="-mx-2 overflow-x-auto px-2 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[480px] border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-200 px-2 py-1.5 text-left">Descrição</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-16">Unid.</th>
                <th className="border border-slate-200 px-2 py-1.5 text-center w-16">Qtd.</th>
                <th className="border border-slate-200 px-2 py-1.5 text-right w-24">Vlr. unit.</th>
                <th className="border border-slate-200 px-2 py-1.5 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {itensPorCategoria.map(({ cat, itens }) => {
                const subCat = itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);
                return (
                  <Fragment key={cat}>
                    <tr>
                      <td colSpan={5} className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {CATEGORIA_LABELS[cat]}
                      </td>
                    </tr>
                    {itens.map((i) => (
                      <tr key={i.id}>
                        <td className="border border-slate-200 px-2 py-1.5">{i.descricao || "—"}</td>
                        <td className="border border-slate-200 px-2 py-1.5 text-center">{i.unidade}</td>
                        <td className="border border-slate-200 px-2 py-1.5 text-center">{i.quantidade}</td>
                        <td className="border border-slate-200 px-2 py-1.5 text-right">{formatBRL(i.valorUnitario)}</td>
                        <td className="border border-slate-200 px-2 py-1.5 text-right font-medium">{formatBRL(i.quantidade * i.valorUnitario)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} className="border border-slate-200 px-2 py-1 text-right text-xs italic text-slate-500">Subtotal {CATEGORIA_LABELS[cat]}</td>
                      <td className="border border-slate-200 px-2 py-1 text-right text-xs font-semibold text-slate-700">{formatBRL(subCat)}</td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
          <Row label="Subtotal" value={formatBRL(subtotal)} />
          {desconto > 0 && <Row label={`Desconto${orcamento.descontoTipo === "percentual" ? ` (${orcamento.descontoValor}%)` : ""}`} value={`− ${formatBRL(desconto)}`} />}
          <div className="mt-2 rounded-md bg-amber-500 px-3 py-2 text-white">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider">Valor total</span>
              <span className="text-xl font-bold">{formatBRL(total)}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Condições */}
      <Section title="Condições comerciais">
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {orcamento.prazoExecucao && <Item label="Prazo de execução" value={orcamento.prazoExecucao} />}
          {orcamento.formaPagamento && <Item label="Forma de pagamento" value={orcamento.formaPagamento} />}
          {orcamento.garantia && <Item label="Garantia" value={orcamento.garantia} />}
          <Item label="Validade da proposta" value={format(new Date(orcamento.validade), "dd/MM/yyyy", { locale: ptBR })} />
          {orcamento.incluso && <Item label="Inclui" value={orcamento.incluso} />}
          {orcamento.naoIncluso && <Item label="Não inclui" value={orcamento.naoIncluso} />}
        </div>
        {orcamento.observacoesFinais && (
          <div className="mt-4 rounded border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-slate-700">
            <strong>Observações:</strong> {orcamento.observacoesFinais}
          </div>
        )}
      </Section>

      {/* Assinatura */}
      <div className="mt-10 grid grid-cols-1 gap-8 pt-8 sm:mt-12 sm:grid-cols-2 sm:gap-12">
        <div className="text-center">
          <div className="border-t border-slate-400 pt-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">{empresa.responsavel}</p>
            <p>{empresa.nome}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-slate-400 pt-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">{cliente?.nome ?? "Cliente"}</p>
            <p>Aceite do cliente</p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-[10px] text-slate-400">
        Proposta gerada por ObraPro Orçamentos • {empresa.nome} • {empresa.telefone}
      </p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      {children}
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 border-b border-slate-300 pb-1 text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h3>
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-slate-100 py-1"><span className="text-slate-600">{label}</span><span className="font-medium">{value}</span></div>;
}
function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="text-slate-700">{value}</p>
    </div>
  );
}
