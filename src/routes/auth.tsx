import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import logoFull from "@/assets/obrapro-logo.png.asset.json";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Entrar — ObraPro Orçamentos" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  component: AuthPage,
});

const credentialsSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const signupSchema = credentialsSchema.extend({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, mode: "signin" | "signup") => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    const nome = String(fd.get("nome") || "");

    const parsed = mode === "signup"
      ? signupSchema.safeParse({ email, password, nome })
      : credentialsSchema.safeParse({ email, password });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { nome },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Entrando...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
      }
      // Force full reload so per-user store reinitializes with the new user key.
      window.location.href = "/";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha na autenticação";
      if (msg.toLowerCase().includes("invalid login")) {
        toast.error("E-mail ou senha incorretos");
      } else if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("user already")) {
        toast.error("Este e-mail já está cadastrado. Faça login.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Falha ao entrar com Google");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      window.location.href = "/";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao entrar com Google");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <HardHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ObraPro Orçamentos</h1>
            <p className="text-sm text-muted-foreground">Crie e envie orçamentos profissionais de obra</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>Entre ou crie sua conta para começar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar conta</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-4">
                <form className="space-y-3" onSubmit={(e) => onSubmit(e, "signin")}>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-email">E-mail</Label>
                    <Input id="signin-email" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signin-password">Senha</Label>
                    <Input id="signin-password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form className="space-y-3" onSubmit={(e) => onSubmit(e, "signup")}>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-nome">Nome</Label>
                    <Input id="signup-nome" name="nome" type="text" autoComplete="name" required placeholder="Seu nome" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input id="signup-email" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input id="signup-password" name="password" type="password" autoComplete="new-password" required placeholder="Mínimo 6 caracteres" minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Criar conta
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={signInWithGoogle}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
              </svg>
              Continuar com Google
            </Button>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos termos de uso.
        </p>
      </div>
    </div>
  );
}
