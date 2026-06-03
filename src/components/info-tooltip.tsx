import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string;
  title?: string;
  className?: string;
}

export function InfoTooltip({ content, title, className }: InfoTooltipProps) {
  const label = title ? `Ajuda: ${title}` : "Mais informações";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        collisionPadding={16}
        className="w-auto max-w-[260px] p-3 text-sm leading-snug"
      >
        {title && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>}
        <p className="text-foreground">{content}</p>
      </PopoverContent>
    </Popover>
  );
}
