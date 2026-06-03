import { useState } from "react";
import { Download, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

interface InstallAppButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  hideWhenInstalled?: boolean;
  fullWidth?: boolean;
  label?: string;
}

export function InstallAppButton({
  variant = "outline",
  size = "sm",
  className,
  hideWhenInstalled = false,
  fullWidth = false,
  label = "Instalar app",
}: InstallAppButtonProps) {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePwaInstall();
  const [showHelp, setShowHelp] = useState(false);

  if (isInstalled) {
    if (hideWhenInstalled) return null;
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={cn(fullWidth && "w-full", "gap-2", className)}
      >
        <Check className="h-4 w-4 text-success" />
        App instalado
      </Button>
    );
  }

  const handleClick = async () => {
    if (canInstall) {
      const r = await promptInstall();
      if (!r.ok) setShowHelp(true);
      return;
    }
    setShowHelp(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={cn(fullWidth && "w-full", "gap-2", className)}
      >
        <Download className="h-4 w-4" />
        {label}
      </Button>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-accent" />
              Como instalar o ObraPro
            </DialogTitle>
            <DialogDescription>
              Tenha o ObraPro como um app no seu celular ou computador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            {isIOS ? (
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="mb-2 font-semibold">No iPhone / iPad (Safari):</p>
                <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                  <li>Toque no ícone <span className="font-medium text-foreground">Compartilhar</span> na barra inferior.</li>
                  <li>Role e toque em <span className="font-medium text-foreground">Adicionar à Tela de Início</span>.</li>
                  <li>Confirme tocando em <span className="font-medium text-foreground">Adicionar</span>.</li>
                </ol>
              </div>
            ) : (
              <>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="mb-2 font-semibold">No celular (Android / Chrome):</p>
                  <p className="text-muted-foreground">
                    Toque no menu <span className="font-medium text-foreground">⋮</span> do navegador e selecione
                    <span className="font-medium text-foreground"> Instalar app</span> ou
                    <span className="font-medium text-foreground"> Adicionar à tela inicial</span>.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="mb-2 font-semibold">No computador (Chrome / Edge):</p>
                  <p className="text-muted-foreground">
                    Clique no ícone <span className="font-medium text-foreground">Instalar</span> que aparece no canto direito da barra de endereços.
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
