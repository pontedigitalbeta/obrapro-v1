import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useStore, calcTotal, formatBRL } from "@/lib/store";
import { Plus, FileText, Clock, CheckCircle2, DollarSign, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — ObraPro" }] }),
  component: Dashboard,
});

function Dashboard() {
  const orcamentos = useStore((s) => s.orcamentos);
  const clientes = useStore((s) => s.clientes);

  const total = orcamentos.length;
  const pendentes = orcamentos.filter((o) => o.status === "rascunho" || o.status === "enviado").length;
  const aprovados = orcamentos.filter((o) => o.status === "aprovado").length;
  const valorNegociacao = orcamentos
    .filter((o) => o.status === "enviado" || o.status === "rascunho")
    .reduce((s, o) => s + calcTotal(o), 0);

  const ultimos = [...orcamentos].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm)).slice(0, 5);

  const cards = [
    { label: "Total de orçamentos", value: total, icon: FileText, tone: "bg-primary/10 text-primary" },
    { label: "Pendentes", value: pendentes, icon: Clock, tone: "bg-warning/15 text-warning-foreground" },
    { label: "Aprovados", value: aprovados, icon: CheckCircle2, tone: "bg-success/15 text-success" },
    { label: "Em negociação", value: formatBRL(valorNegociacao), icon: DollarSign, tone: "bg-accent/20 text-accent-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral dos seus orçamentos</p>
        </div>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
          <Link to="/orcamentos/novo"><Plus className="mr-2 h-4 w-4" />Novo Orçamento</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${c.tone}`}>
                <c.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
                <p className="truncate text-xl font-bold">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Últimos orçamentos</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/orcamentos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {ultimos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum orçamento ainda. Crie o primeiro!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ultimos.map((o) => {
                    const cli = clientes.find((c) => c.id === o.clienteId);
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">#{o.numero}</TableCell>
                        <TableCell className="font-medium">{o.titulo}</TableCell>
                        <TableCell className="text-muted-foreground">{cli?.nome ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(o.data), "dd MMM yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatBRL(calcTotal(o))}</TableCell>
                        <TableCell><StatusBadge status={o.status} /></TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="icon">
                            <Link to="/orcamentos/$id/preview" params={{ id: o.id }}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
