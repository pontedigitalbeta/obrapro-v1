import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { InfoTooltip } from "@/components/info-tooltip";
import { cn } from "@/lib/utils";

interface FieldLabelWithHelpProps {
  children: ReactNode;
  help: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export function FieldLabelWithHelp({ children, help, required, htmlFor, className }: FieldLabelWithHelpProps) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="leading-none">
        {children}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </Label>
      <InfoTooltip content={help} title={typeof children === "string" ? children : undefined} />
    </div>
  );
}
