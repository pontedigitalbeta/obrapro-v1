import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { STATUS_LABELS, type Orcamento, type OrcamentoStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, ListChecks } from "lucide-react";
import { toast } from "sonner";

const dot: Record<OrcamentoStatus, string> = {
  rascunho: "bg-muted-foreground/60",
  enviado: "bg-info",
  aprovado: "bg-success",
  recusado: "bg-destructive",
};

const STATUS_ORDER: OrcamentoStatus[] = ["rascunho", "enviado", "aprovado", "recusado"];

interface Props {
  orcamento: Orcamento;
  variant?: "icon" | "button";
  onChanged?: (novo: OrcamentoStatus) => void;
}

export function OrcamentoStatusMenu({ orcamento, variant = "icon", onChanged }: Props) {
  const updateOrcamento = useStore((s) => s.updateOrcamento);

  const handleSelect = (novo: OrcamentoStatus) => {
    if (novo === orcamento.status) return;
    updateOrcamento(orcamento.id, { status: novo });
    toast.success(`Status alterado para ${STATUS_LABELS[novo]}`);
    onChanged?.(novo);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Alterar status do orçamento"
            title="Alterar status"
            onClick={(e) => e.stopPropagation()}
          >
            <ListChecks className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-xs"
            aria-label="Alterar status do orçamento"
            title="Alterar status"
            onClick={(e) => e.stopPropagation()}
          >
            <ListChecks className="h-3.5 w-3.5" />
            <span>Status</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Alterar status
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUS_ORDER.map((s) => {
          const atual = s === orcamento.status;
          return (
            <DropdownMenuItem
              key={s}
              onClick={() => handleSelect(s)}
              className={cn("flex items-center gap-2", atual && "font-semibold")}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", dot[s])} />
              <span className="flex-1">{STATUS_LABELS[s]}</span>
              {atual && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
