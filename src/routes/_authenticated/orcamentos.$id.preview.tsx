import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { ArrowLeft, Printer, FileDown, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { PropostaA4 } from "@/components/proposta-a4";
import { gerarOrcamentoPdf } from "@/lib/pdf";
import { abrirWhatsAppOrcamento } from "@/lib/whatsapp";

export const Route = createFileRoute("/_authenticated/orcamentos/$id/preview")({
  head: () => ({ meta: [{ title: "Proposta — ObraPro" }] }),
  component: PreviewPage,
});

function PreviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const orcamento = useStore((s) => s.orcamentos.find((o) => o.id === id));
  const cliente = useStore((s) => orcamento ? s.clientes.find((c) => c.id === orcamento.clienteId) : undefined);
  const empresa = useStore((s) => s.empresa);
  const pageRef = useRef<HTMLDivElement>(null);

  if (!orcamento) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Orçamento não encontrado</p>
          <Button onClick={() => navigate({ to: "/orcamentos" })}>Voltar</Button>
        </div>
      </div>
    );
  }

  const gerarPdf = async () => {
    toast.loading("Gerando PDF...", { id: "pdf" });
    try {
      await gerarOrcamentoPdf(orcamento, cliente, empresa);
      toast.success("PDF gerado!", { id: "pdf" });
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF", { id: "pdf" });
    }
  };

  const enviarWhatsApp = () => {
    const r = abrirWhatsAppOrcamento(orcamento, cliente, empresa);
    if (!r.ok) toast.error(r.reason);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-4 sm:py-6">
      {/* Floating toolbar */}
      <div className="no-print sticky top-0 z-20 mx-auto mb-4 flex max-w-4xl flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button asChild variant="ghost" size="sm" className="w-full justify-start sm:w-auto">
          <Link to="/orcamentos"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Link>
        </Button>
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="w-full sm:w-auto"><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
          <Button size="sm" onClick={gerarPdf} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"><FileDown className="mr-2 h-4 w-4" />Baixar PDF</Button>
          <Button size="sm" onClick={enviarWhatsApp} className="w-full bg-success text-success-foreground hover:bg-success/90 sm:w-auto"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</Button>
        </div>
      </div>

      <div ref={pageRef}>
        <PropostaA4 orcamento={orcamento} cliente={cliente} empresa={empresa} />
      </div>
    </div>
  );
}
