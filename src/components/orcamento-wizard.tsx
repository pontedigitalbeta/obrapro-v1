import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useStore, calcSubtotal, calcDesconto, calcTotal, formatBRL } from "@/lib/store";
import { CATEGORIA_LABELS, STATUS_LABELS, type ItemCategoria, type Orcamento, type OrcamentoItem, type OrcamentoStatus } from "@/lib/types";
import { ArrowLeft, ArrowRight, Plus, Trash2, Save, Eye, FileDown, MessageCircle, Check } from "lucide-react";
import { toast } from "sonner";

const uid = () => Math.random().toString(36).slice(2, 10);

const STEPS = [
  { n: 1, t: "Cliente e obra" },
  { n: 2, t: "Tipo de serviço" },
  { n: 3, t: "Itens" },
  { n: 4, t: "Condições" },
  { n: 5, t: "Revisão" },
];

type FormState = Omit<Orcamento, "id" | "numero" | "criadoEm" | "atualizadoEm">;

const blank = (): FormState => ({
  clienteId: "", titulo: "", enderecoObra: "", tipoServico: "",
  data: new Date().toISOString(), validade: new Date(Date.now() + 15 * 86400000).toISOString(),
  descricaoEscopo: "", itens: [],
  descontoTipo: "valor", descontoValor: 0,
  prazoExecucao: "", formaPagamento: "", garantia: "", incluso: "", naoIncluso: "",
  observacoesFinais: "", status: "rascunho",
});

export function OrcamentoWizard({ orcamentoId }: { orcamentoId?: string }) {
  const navigate = useNavigate();
  const clientes = useStore((s) => s.clientes);
  const existing = useStore((s) => orcamentoId ? s.orcamentos.find((o) => o.id === orcamentoId) : undefined);
  const addOrcamento = useStore((s) => s.addOrcamento);
  const updateOrcamento = useStore((s) => s.updateOrcamento);
  const empresa = useStore((s) => s.empresa);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() => existing ? { ...existing } : blank());

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const cliente = useMemo(() => clientes.find((c) => c.id === form.clienteId), [clientes, form.clienteId]);

  const subtotal = calcSubtotal(form.itens);
  const descontoAplicado = calcDesconto(subtotal, form.descontoTipo, form.descontoValor);
  const total = calcTotal(form);

  const addItem = () => set("itens", [...form.itens, { id: uid(), categoria: "material", descricao: "", unidade: "un", quantidade: 1, valorUnitario: 0 }]);
  const updateItem = (id: string, patch: Partial<OrcamentoItem>) =>
    set("itens", form.itens.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const removeItem = (id: string) => set("itens", form.itens.filter((i) => i.id !== id));

  const save = (status?: OrcamentoStatus): string | null => {
    if (!form.clienteId) { toast.error("Selecione um cliente"); setStep(1); return null; }
    if (!form.titulo.trim()) { toast.error("Informe o título"); setStep(1); return null; }
    const payload = { ...form, status: status ?? form.status };
    if (existing) {
      updateOrcamento(existing.id, payload);
      toast.success("Orçamento atualizado");
      return existing.id;
    }
    const novo = addOrcamento(payload);
    toast.success(`Orçamento #${novo.numero} salvo`);
    return novo.id;
  };

  const goPreview = () => { const id = save(); if (id) navigate({ to: "/orcamentos/$id/preview", params: { id } }); };

  const enviarWhatsApp = () => {
    if (!cliente?.telefone) { toast.error("Cliente sem telefone cadastrado"); return; }
    const id = save("enviado");
    if (!id) return;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const msg = `Olá ${cliente.nome}! Segue a proposta da ${empresa.nome} para *${form.titulo}*. Valor total: ${formatBRL(total)}. Veja a proposta completa: ${url}/orcamentos/${id}/preview`;
    window.open(`https://wa.me/55${cliente.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const dateInput = (iso: string) => iso.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <button
              onClick={() => setStep(s.n)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                step === s.n ? "bg-accent text-accent-foreground"
                : step > s.n ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.n ? <Check className="h-4 w-4" /> : s.n}
            </button>
            <span className={`hidden text-sm font-medium md:inline ${step === s.n ? "text-foreground" : "text-muted-foreground"}`}>{s.t}</span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${step > s.n ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-5 md:p-7">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Cliente e dados da obra</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label>Cliente *</Label>
                  <Select value={form.clienteId} onValueChange={(v) => {
                    set("clienteId", v);
                    const c = clientes.find((x) => x.id === v);
                    if (c && !form.enderecoObra) set("enderecoObra", c.enderecoObra);
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecione um cliente..." /></SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Cadastre clientes em <a href="/clientes" className="underline">Clientes</a></p>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>Título do orçamento *</Label>
                  <Input value={form.titulo} onChange={(e) => set("titulo", e.target.value)} placeholder="Ex: Reforma de cozinha" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>Endereço da obra</Label>
                  <Input value={form.enderecoObra} onChange={(e) => set("enderecoObra", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Input type="date" value={dateInput(form.data)} onChange={(e) => set("data", new Date(e.target.value).toISOString())} />
                </div>
                <div className="grid gap-2">
                  <Label>Validade da proposta</Label>
                  <Input type="date" value={dateInput(form.validade)} onChange={(e) => set("validade", new Date(e.target.value).toISOString())} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Tipo de serviço e escopo</h2>
              <div className="grid gap-2">
                <Label>Tipo de serviço</Label>
                <Input value={form.tipoServico} onChange={(e) => set("tipoServico", e.target.value)} placeholder="Ex: Reforma residencial, Alvenaria, Pintura..." />
              </div>
              <div className="grid gap-2">
                <Label>Descrição do escopo</Label>
                <Textarea rows={8} value={form.descricaoEscopo} onChange={(e) => set("descricaoEscopo", e.target.value)} placeholder="Descreva detalhadamente o que será executado..." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Itens do orçamento</h2>
                <Button onClick={addItem} size="sm"><Plus className="mr-2 h-4 w-4" />Adicionar item</Button>
              </div>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">Categoria</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-24">Unid.</TableHead>
                      <TableHead className="w-24">Qtd.</TableHead>
                      <TableHead className="w-32">Valor unit.</TableHead>
                      <TableHead className="w-32 text-right">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.itens.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">Nenhum item. Clique em "Adicionar item".</TableCell></TableRow>
                    ) : form.itens.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>
                          <Select value={i.categoria} onValueChange={(v) => updateItem(i.id, { categoria: v as ItemCategoria })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(Object.keys(CATEGORIA_LABELS) as ItemCategoria[]).map((c) => (
                                <SelectItem key={c} value={c}>{CATEGORIA_LABELS[c]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input value={i.descricao} onChange={(e) => updateItem(i.id, { descricao: e.target.value })} /></TableCell>
                        <TableCell><Input value={i.unidade} onChange={(e) => updateItem(i.id, { unidade: e.target.value })} /></TableCell>
                        <TableCell><Input type="number" step="0.01" value={i.quantidade} onChange={(e) => updateItem(i.id, { quantidade: parseFloat(e.target.value) || 0 })} /></TableCell>
                        <TableCell><Input type="number" step="0.01" value={i.valorUnitario} onChange={(e) => updateItem(i.id, { valorUnitario: parseFloat(e.target.value) || 0 })} /></TableCell>
                        <TableCell className="text-right font-semibold">{formatBRL(i.quantidade * i.valorUnitario)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="ml-auto max-w-sm space-y-3 rounded-lg border bg-muted/30 p-4">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-medium">{formatBRL(subtotal)}</span></div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Desconto</Label>
                  <Select value={form.descontoTipo} onValueChange={(v) => set("descontoTipo", v as "valor" | "percentual")}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valor">R$</SelectItem>
                      <SelectItem value="percentual">%</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" step="0.01" value={form.descontoValor} onChange={(e) => set("descontoValor", parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Desconto aplicado</span><span>− {formatBRL(descontoAplicado)}</span></div>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">Valor final</span>
                  <span className="text-2xl font-bold text-accent-foreground">{formatBRL(total)}</span>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Condições comerciais</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Prazo de execução</Label>
                  <Input value={form.prazoExecucao} onChange={(e) => set("prazoExecucao", e.target.value)} placeholder="Ex: 30 dias úteis" />
                </div>
                <div className="grid gap-2">
                  <Label>Forma de pagamento</Label>
                  <Input value={form.formaPagamento} onChange={(e) => set("formaPagamento", e.target.value)} placeholder="Ex: 30% entrada, 70% na entrega" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>Garantia</Label>
                  <Input value={form.garantia} onChange={(e) => set("garantia", e.target.value)} placeholder="Ex: 12 meses para mão de obra" />
                </div>
                <div className="grid gap-2">
                  <Label>O que está incluso</Label>
                  <Textarea rows={4} value={form.incluso} onChange={(e) => set("incluso", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>O que NÃO está incluso</Label>
                  <Textarea rows={4} value={form.naoIncluso} onChange={(e) => set("naoIncluso", e.target.value)} />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>Observações finais</Label>
                  <Textarea rows={3} value={form.observacoesFinais} onChange={(e) => set("observacoesFinais", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold">Revisão final</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cliente" value={cliente?.nome ?? "—"} />
                <Field label="Título" value={form.titulo || "—"} />
                <Field label="Endereço da obra" value={form.enderecoObra || "—"} />
                <Field label="Tipo de serviço" value={form.tipoServico || "—"} />
                <Field label="Prazo" value={form.prazoExecucao || "—"} />
                <Field label="Pagamento" value={form.formaPagamento || "—"} />
              </div>
              <Separator />
              <div className="flex items-center justify-between rounded-lg bg-accent/10 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor total da proposta</p>
                  <p className="text-3xl font-bold">{formatBRL(total)}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{form.itens.length} itens</p>
                  <p>Status: <span className="font-medium text-foreground">{STATUS_LABELS[form.status]}</span></p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => save()} variant="outline"><Save className="mr-2 h-4 w-4" />Salvar rascunho</Button>
                <Button onClick={goPreview}><Eye className="mr-2 h-4 w-4" />Visualizar proposta</Button>
                <Button onClick={goPreview} className="bg-accent text-accent-foreground hover:bg-accent/90"><FileDown className="mr-2 h-4 w-4" />Gerar PDF</Button>
                <Button onClick={enviarWhatsApp} className="bg-success text-success-foreground hover:bg-success/90"><MessageCircle className="mr-2 h-4 w-4" />Enviar por WhatsApp</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => save()}><Save className="mr-2 h-4 w-4" />Salvar</Button>
          {step < 5 && (
            <Button onClick={() => setStep(Math.min(5, step + 1))}>
              Próximo<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
