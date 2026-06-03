import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, LifeBuoy, FileText, Users, Settings, Plus } from "lucide-react";
import { helpTopics, quickSteps, faqItems } from "@/lib/help-content";

export const Route = createFileRoute("/_authenticated/ajuda")({
  head: () => ({ meta: [{ title: "Ajuda — ObraPro" }] }),
  component: AjudaPage,
});

function AjudaPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filteredTopics = useMemo(() => {
    if (!q) return helpTopics;
    return helpTopics.filter(
      (t) => t.title.toLowerCase().includes(q) || t.content.some((c) => c.toLowerCase().includes(q)),
    );
  }, [q]);

  const filteredFaq = useMemo(() => {
    if (!q) return faqItems;
    return faqItems.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [q]);

  const semResultados = q && filteredTopics.length === 0 && filteredFaq.length === 0;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">Central de Ajuda</h1>
            <p className="text-sm text-muted-foreground">
              Aprenda a usar o ObraPro para criar orçamentos profissionais, organizar clientes e enviar propostas.
            </p>
          </div>
        </div>
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ajuda..."
            className="pl-9"
            aria-label="Buscar ajuda"
          />
        </div>
      </div>

      {/* Atalhos rápidos */}
      {!q && (
        <div className="grid gap-2 sm:grid-cols-3">
          <Button asChild variant="outline" className="justify-start">
            <Link to="/clientes"><Users className="mr-2 h-4 w-4" />Cadastrar cliente</Link>
          </Button>
          <Button asChild className="justify-start bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/orcamentos/novo"><Plus className="mr-2 h-4 w-4" />Criar orçamento</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link to="/configuracoes"><Settings className="mr-2 h-4 w-4" />Configurar empresa</Link>
          </Button>
        </div>
      )}

      {/* Passo a passo rápido */}
      {!q && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Passo a passo rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 sm:grid-cols-2">
              {quickSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {idx + 1}
                  </span>
                  <span className="text-sm leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Tópicos */}
      {filteredTopics.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold sm:text-lg">Tópicos de ajuda</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredTopics.map((t) => (
              <Card key={t.id} className="overflow-hidden">
                <Accordion type="single" collapsible>
                  <AccordionItem value={t.id} className="border-0">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <t.icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-semibold">{t.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ul className="ml-1 space-y-1.5 text-sm text-muted-foreground">
                        {t.content.map((line, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {filteredFaq.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold sm:text-lg">Perguntas frequentes</h2>
          <Card>
            <CardContent className="p-2 sm:p-4">
              <Accordion type="single" collapsible className="w-full">
                {filteredFaq.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      )}

      {semResultados && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum resultado para “{query}”</p>
            <p className="text-xs text-muted-foreground">Tente outra palavra ou limpe a busca.</p>
            <Button variant="outline" size="sm" onClick={() => setQuery("")}>Limpar busca</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
