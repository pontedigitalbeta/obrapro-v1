import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store";
import type { Cliente } from "@/lib/types";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({ meta: [{ title: "Clientes — ObraPro" }] }),
  component: ClientesPage,
});

const empty = { nome: "", telefone: "", email: "", enderecoObra: "", observacoes: "" };

function ClientesPage() {
  const clientes = useStore((s) => s.clientes);
  const addCliente = useStore((s) => s.addCliente);
  const updateCliente = useStore((s) => s.updateCliente);
  const deleteCliente = useStore((s) => s.deleteCliente);

  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [form, setForm] = useState(empty);

  const filtrados = clientes.filter((c) =>
    [c.nome, c.email, c.telefone, c.enderecoObra].join(" ").toLowerCase().includes(busca.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c: Cliente) => {
    setEditing(c);
    setForm({ nome: c.nome, telefone: c.telefone, email: c.email, enderecoObra: c.enderecoObra, observacoes: c.observacoes });
    setOpen(true);
  };

  const submit = () => {
    if (!form.nome.trim()) { toast.error("Informe o nome do cliente"); return; }
    if (editing) { updateCliente(editing.id, form); toast.success("Cliente atualizado"); }
    else { addCliente(form); toast.success("Cliente cadastrado"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes.length} cliente(s) cadastrado(s)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar cliente" : "Novo cliente"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="11999998888" />
                </div>
                <div className="grid gap-2">
                  <Label>E-mail</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Endereço da obra</Label>
                <Input value={form.enderecoObra} onChange={(e) => setForm({ ...form, enderecoObra: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Observações</Label>
                <Textarea rows={3} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
              <Button onClick={submit} className="w-full sm:w-auto">{editing ? "Salvar" : "Cadastrar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="relative mb-4 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente..." className="pl-9" />
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtrados.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Nenhum cliente encontrado</p>
            ) : filtrados.map((c) => (
              <div key={c.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.nome}</p>
                    {c.telefone && <p className="truncate text-sm text-muted-foreground">{c.telefone}</p>}
                    {c.email && <p className="truncate text-sm text-muted-foreground">{c.email}</p>}
                    {c.enderecoObra && <p className="mt-1 truncate text-xs text-muted-foreground">{c.enderecoObra}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Excluir cliente?")) { deleteCliente(c.id); toast.success("Cliente removido"); } }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Endereço da obra</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Nenhum cliente encontrado</TableCell></TableRow>
                ) : filtrados.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{c.telefone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{c.enderecoObra || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Excluir cliente?")) { deleteCliente(c.id); toast.success("Cliente removido"); } }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
