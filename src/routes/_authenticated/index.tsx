import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { useStore, calcTotal, formatBRL } from "@/lib/store";
import { Plus, FileText, Clock, CheckCircle2, DollarSign, Eye, Users, LifeBuoy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import logoIcon from "@/assets/obrapro-icon.png.asset.json";
import { InstallAppButton } from "@/components/install-app-button";
import { InfoTooltip } from "@/components/info-tooltip";
import { fieldHelp } from "@/lib/help-content";

export const Route = createFileRoute("/_authenticated/")({
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
    { label: "Total de orçamentos", value: total, icon: FileText, tone: "bg-primary/10 text-primary", help: fieldHelp.dashboard.total },
    { label: "Pendentes", value: pendentes, icon: Clock, tone: "bg-warning/15 text-warning-foreground", help: fieldHelp.dashboard.pendentes },
    { label: "Aprovados", value: aprovados, icon: CheckCircle2, tone: "bg-success/15 text-success", help: fieldHelp.dashboard.aprovados },
    { label: "Em negociação", value: formatBRL(valorNegociacao), icon: DollarSign, tone: "bg-accent/20 text-accent-foreground", help: fieldHelp.dashboard.negociacao },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={logoIcon.url} alt="ObraPro" className="h-12 w-12 shrink-0 rounded-lg object-contain shadow-sm ring-1 ring-border" />
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Visão geral dos seus orçamentos</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild className="w-full bg-accent text-accent-foreground shadow-md hover:bg-accent/90 sm:w-auto">
            <Link to="/orcamentos/novo"><Plus className="mr-2 h-4 w-4" />Novo Orçamento</Link>
          </Button>
        </div>
      </div>

      {total === 0 && (
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold">Vamos começar?</p>
              <p className="text-sm text-muted-foreground">Comece cadastrando um cliente e criando seu primeiro orçamento profissional.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" size="sm"><Link to="/clientes"><Users className="mr-2 h-4 w-4" />Cadastrar cliente</Link></Button>
              <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/orcamentos/novo"><Plus className="mr-2 h-4 w-4" />Criar orçamento</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/ajuda"><LifeBuoy className="mr-2 h-4 w-4" />Ver ajuda</Link></Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12 ${c.tone}`}>
                <c.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">{c.label}</p>
                  <InfoTooltip content={c.help} title={c.label} />
                </div>
                <p className="truncate text-base font-bold sm:text-xl">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Últimos orçamentos</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/orcamentos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {ultimos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum orçamento ainda. Crie o primeiro!</p>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="space-y-3 md:hidden">
                {ultimos.map((o) => {
                  const cli = clientes.find((c) => c.id === o.clienteId);
                  return (
                    <Link
                      key={o.id}
                      to="/orcamentos/$id/preview"
                      params={{ id: o.id }}
                      className="block rounded-lg border bg-card p-3 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono">#{o.numero}</span>
                            <span>•</span>
                            <span>{format(new Date(o.data), "dd MMM", { locale: ptBR })}</span>
                          </div>
                          <p className="mt-1 truncate font-semibold">{o.titulo}</p>
                          <p className="truncate text-sm text-muted-foreground">{cli?.nome ?? "—"}</p>
                        </div>
                        <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <StatusBadge status={o.status} />
                        <span className="text-sm font-bold">{formatBRL(calcTotal(o))}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* Desktop: table */}
              <div className="hidden overflow-x-auto md:block">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
