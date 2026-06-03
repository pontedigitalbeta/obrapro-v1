import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OrcamentoWizard } from "@/components/orcamento-wizard";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { useEffect } from "react";

export const Route = createFileRoute("/orcamentos/$id")({
  head: () => ({ meta: [{ title: "Editar orçamento — ObraPro" }] }),
  component: EditarOrcamentoPage,
});

function EditarOrcamentoPage() {
  const { id } = Route.useParams();
  const orcamento = useStore((s) => s.orcamentos.find((o) => o.id === id));
  const navigate = useNavigate();

  useEffect(() => {
    if (!orcamento) navigate({ to: "/orcamentos" });
  }, [orcamento, navigate]);

  if (!orcamento) return null;

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/orcamentos"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Editar orçamento #{orcamento.numero}</h1>
        <p className="text-sm text-muted-foreground">{orcamento.titulo}</p>
      </div>
      <OrcamentoWizard orcamentoId={orcamento.id} />
    </div>
  );
}
