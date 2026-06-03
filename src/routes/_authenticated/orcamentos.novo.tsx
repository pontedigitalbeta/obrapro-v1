import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OrcamentoWizard } from "@/components/orcamento-wizard";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orcamentos/novo")({
  head: () => ({ meta: [{ title: "Novo orçamento — ObraPro" }] }),
  component: NovoOrcamentoPage,
});

function NovoOrcamentoPage() {
  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/orcamentos"><ArrowLeft className="mr-2 h-4 w-4" />Voltar para orçamentos</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Novo Orçamento</h1>
        <p className="text-sm text-muted-foreground">Preencha as 5 etapas para criar uma proposta profissional</p>
      </div>
      <OrcamentoWizard />
    </div>
  );
}
