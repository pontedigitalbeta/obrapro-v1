import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { useStore, calcTotal, formatBRL } from "@/lib/store";
import { STATUS_LABELS, type OrcamentoStatus, type Orcamento } from "@/lib/types";
import { Plus, Search, MoreVertical, Eye, Pencil, Copy, Trash2, FileDown, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { gerarOrcamentoPdf } from "@/lib/pdf";
import { abrirWhatsAppOrcamento } from "@/lib/whatsapp";
import { InfoTooltip } from "@/components/info-tooltip";
import { fieldHelp } from "@/lib/help-content";

export const Route = createFileRoute("/_authenticated/orcamentos/")({
  head: () => ({ meta: [{ title: "Orçamentos — ObraPro" }] }),
  component: OrcamentosPage,
});

function OrcamentosPage() {
  const orcamentos = useStore((s) => s.orcamentos);
  const clientes = useStore((s) => s.clientes);
  const empresa = useStore((s) => s.empresa);
  const duplicate = useStore((s) => s.duplicateOrcamento);
  const remove = useStore((s) => s.deleteOrcamento);
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [clienteFiltro, setClienteFiltro] = useState<string>("todos");

  const filtrados = orcamentos.filter((o) => {
    if (statusFiltro !== "todos" && o.status !== statusFiltro) return false;
    if (clienteFiltro !== "todos" && o.clienteId !== clienteFiltro) return false;
    if (busca && !`${o.numero} ${o.titulo}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const handlePdf = async (o: Orcamento) => {
    const cli = clientes.find((c) => c.id === o.clienteId);
    toast.loading("Gerando PDF...", { id: `pdf-${o.id}` });
    try {
      await gerarOrcamentoPdf(o, cli, empresa);
      toast.success("PDF gerado!", { id: `pdf-${o.id}` });
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF", { id: `pdf-${o.id}` });
    }
  };

  const handleWhats = (o: Orcamento) => {
    const cli = clientes.find((c) => c.id === o.clienteId);
    const r = abrirWhatsAppOrcamento(o, cli, empresa);
    if (!r.ok) toast.error(r.reason);
  };

  const renderQuickActions = (o: Orcamento) => (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePdf(o)}
        className="h-8 gap-1.5 px-2.5 text-xs"
        title="Baixar PDF"
      >
        <FileDown className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">PDF</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleWhats(o)}
        className="h-8 gap-1.5 border-success/40 px-2.5 text-xs text-success hover:bg-success/10 hover:text-success"
        title="Enviar por WhatsApp"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
    </>
  );

  const renderActions = (o: Orcamento) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate({ to: "/orcamentos/$id/preview", params: { id: o.id } })}>
          <Eye className="mr-2 h-4 w-4" />Visualizar proposta
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: "/orcamentos/$id", params: { id: o.id } })}>
          <Pencil className="mr-2 h-4 w-4" />Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { const n = duplicate(o.id); if (n) toast.success(`Duplicado como #${n.numero}`); }}>
          <Copy className="mr-2 h-4 w-4" />Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Excluir orçamento?")) { remove(o.id); toast.success("Orçamento excluído"); } }}>
          <Trash2 className="mr-2 h-4 w-4" />Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">{filtrados.length} de {orcamentos.length} orçamento(s)</p>
        </div>
        <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto">
          <Link to="/orcamentos/novo"><Plus className="mr-2 h-4 w-4" />Novo Orçamento</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar..." className="pl-9" />
            </div>
            <div className="flex w-full items-center gap-1 sm:w-auto">
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger className="w-full sm:w-44" aria-label="Filtrar por status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {(Object.keys(STATUS_LABELS) as OrcamentoStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InfoTooltip content={fieldHelp.orcamentosLista.filtroStatus} title="Filtro de status" />
            </div>
            <div className="flex w-full items-center gap-1 sm:w-auto">
              <Select value={clienteFiltro} onValueChange={setClienteFiltro}>
                <SelectTrigger className="w-full sm:w-56" aria-label="Filtrar por cliente"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clientes</SelectItem>
                  {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
              <InfoTooltip content={fieldHelp.orcamentosLista.filtroCliente} title="Filtro de cliente" />
            </div>
          </div>

          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {filtrados.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Nenhum orçamento encontrado</p>
            ) : filtrados.map((o) => {
              const cli = clientes.find((c) => c.id === o.clienteId);
              return (
                <div key={o.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">#{o.numero}</span>
                        <span>•</span>
                        <span>{format(new Date(o.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                      <p className="mt-1 truncate font-semibold">{o.titulo}</p>
                      <p className="truncate text-sm text-muted-foreground">{cli?.nome ?? "—"}</p>
                    </div>
                    {renderActions(o)}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <StatusBadge status={o.status} />
                    <span className="text-base font-bold">{formatBRL(calcTotal(o))}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {renderQuickActions(o)}
                  </div>
                </div>
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
                  <TableHead className="w-[200px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Nenhum orçamento encontrado</TableCell></TableRow>
                ) : filtrados.map((o) => {
                  const cli = clientes.find((c) => c.id === o.clienteId);
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">#{o.numero}</TableCell>
                      <TableCell className="font-medium">{o.titulo}</TableCell>
                      <TableCell className="text-muted-foreground">{cli?.nome ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(o.data), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell className="text-right font-semibold">{formatBRL(calcTotal(o))}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          {renderQuickActions(o)}
                          {renderActions(o)}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
