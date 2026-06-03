import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { Save, Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — ObraPro" }] }),
  component: ConfigPage,
});

function ConfigPage() {
  const empresa = useStore((s) => s.empresa);
  const setEmpresa = useStore((s) => s.setEmpresa);
  const [form, setForm] = useState(empresa);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogo = (file: File) => {
    if (file.size > 1024 * 1024) { toast.error("Logo deve ter menos de 1MB"); return; }
    const reader = new FileReader();
    reader.onload = () => set("logoBase64", reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    setEmpresa(form);
    toast.success("Configurações salvas");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Configurações</h1>
        <p className="text-sm text-muted-foreground">Dados da empresa que aparecem nas propostas</p>
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted">
              {form.logoBase64 ? (
                <img src={form.logoBase64} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground">Logo</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])} />
                <Button asChild variant="outline" size="sm"><span><Upload className="mr-2 h-4 w-4" />Enviar logo</span></Button>
              </Label>
              {form.logoBase64 && (
                <Button variant="ghost" size="sm" onClick={() => set("logoBase64", "")}><X className="mr-2 h-4 w-4" />Remover</Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label>Nome da empresa / profissional *</Label>
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>CPF / CNPJ</Label>
              <Input value={form.documento} onChange={(e) => set("documento", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Responsável</Label>
              <Input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Telefone / WhatsApp</Label>
              <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="11999998888" />
            </div>
            <div className="grid gap-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Estado</Label>
              <Input value={form.estado} onChange={(e) => set("estado", e.target.value)} placeholder="SP" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Descrição curta da empresa</Label>
              <Textarea rows={3} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={save} size="lg"><Save className="mr-2 h-4 w-4" />Salvar alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
