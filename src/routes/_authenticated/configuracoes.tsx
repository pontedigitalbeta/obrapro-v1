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
import logoFull from "@/assets/obrapro-logo.png.asset.json";
import { InstallAppButton } from "@/components/install-app-button";
import { Smartphone } from "lucide-react";

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

      <Card className="overflow-hidden border-dashed">
        <CardContent className="flex flex-col items-center gap-3 bg-muted/30 p-6 text-center sm:flex-row sm:text-left">
          <img src={logoFull.url} alt="ObraPro" className="h-16 w-auto object-contain" />
          <div>
            <p className="text-sm font-semibold">Identidade visual do sistema</p>
            <p className="text-xs text-muted-foreground">Este é o logotipo do ObraPro. Envie abaixo o logo da sua empresa para personalizar suas propostas.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Aplicativo ObraPro</p>
              <p className="text-xs text-muted-foreground">Instale o ObraPro no seu celular ou computador e abra como um aplicativo, sem precisar do navegador.</p>
            </div>
          </div>
          <InstallAppButton variant="default" size="default" className="bg-primary text-primary-foreground hover:bg-primary/90" />
        </CardContent>
      </Card>

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
              <FieldLabelWithHelp help={fieldHelp.configuracoes.logo}>Logo da empresa</FieldLabelWithHelp>
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
              <FieldLabelWithHelp help={fieldHelp.configuracoes.nome} required>Nome da empresa / profissional</FieldLabelWithHelp>
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <FieldLabelWithHelp help={fieldHelp.configuracoes.documento}>CPF / CNPJ</FieldLabelWithHelp>
              <Input value={form.documento} onChange={(e) => set("documento", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <FieldLabelWithHelp help={fieldHelp.configuracoes.responsavel}>Responsável</FieldLabelWithHelp>
              <Input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <FieldLabelWithHelp help={fieldHelp.configuracoes.telefone}>Telefone / WhatsApp</FieldLabelWithHelp>
              <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="11999998888" />
            </div>
            <div className="grid gap-2">
              <FieldLabelWithHelp help={fieldHelp.configuracoes.email}>E-mail</FieldLabelWithHelp>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <FieldLabelWithHelp help={fieldHelp.configuracoes.cidade}>Cidade</FieldLabelWithHelp>
              <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <FieldLabelWithHelp help={fieldHelp.configuracoes.estado}>Estado</FieldLabelWithHelp>
              <Input value={form.estado} onChange={(e) => set("estado", e.target.value)} placeholder="SP" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <FieldLabelWithHelp help={fieldHelp.configuracoes.descricao}>Descrição curta da empresa</FieldLabelWithHelp>
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
