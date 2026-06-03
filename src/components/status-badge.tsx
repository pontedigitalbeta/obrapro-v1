import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type OrcamentoStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<OrcamentoStatus, string> = {
  rascunho: "bg-muted text-muted-foreground hover:bg-muted",
  enviado: "bg-info text-info-foreground hover:bg-info",
  aprovado: "bg-success text-success-foreground hover:bg-success",
  recusado: "bg-destructive text-destructive-foreground hover:bg-destructive",
};

export function StatusBadge({ status, className }: { status: OrcamentoStatus; className?: string }) {
  return <Badge className={cn(styles[status], "font-medium", className)}>{STATUS_LABELS[status]}</Badge>;
}
