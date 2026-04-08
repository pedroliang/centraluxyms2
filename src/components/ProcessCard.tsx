import React from "react";
import { Process, ProcessStatus } from "@/types/process";
import { cn } from "@/lib/utils";
import { Truck, Package, Calendar, ArrowRight, MapPin, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const statusConfig: Record<ProcessStatus, { label: string; className: string }> = {
  active: { label: "ATIVO", className: "bg-primary/10 text-primary" },
  completed: { label: "FINALIZADO", className: "bg-success/10 text-success" },
  cancelled: { label: "CANCELADO", className: "bg-destructive/10 text-destructive" },
};

interface ProcessCardProps {
  key?: string;
  process: Process;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}

export function ProcessCard({ process, selected, onToggleSelect }: ProcessCardProps) {
  const status = statusConfig[process.status];
  const dateFormatted = process.date.split('T')[0].split('-').reverse().join('/');
  const isAjustado = process.name?.includes("[AJUSTADO]") || process.code?.includes("[AJUSTADO]") || process.cliente?.includes("[AJUSTADO]");

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-4 shadow-card transition-all",
        isAjustado
          ? "ajustado-neon-border"
          : selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/30"
      )}
    >
      {/* Checkbox */}
      <div className="absolute left-4 top-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(process.id)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
      </div>

      <div className="ml-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm font-semibold text-foreground tracking-heading">{process.code}</p>
              {process.cliente && (
                <span className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                  <Building2 className="h-3 w-3" />
                  {process.cliente}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-foreground">{process.name}</p>
          </div>
          <span className={cn("rounded px-2 py-0.5 text-[11px] font-semibold", status.className)}>
            {status.label}
          </span>
        </div>

        {/* Meta */}
        <div className="mt-2.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="font-medium">{process.origin || "Indefinida"}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
          <span className="font-medium">{process.destination || "Indefinida"}</span>
        </div>

        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {process.type === "loading" ? <Truck className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
            {process.type === "loading" ? "Carregamento" : "Descarga"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {dateFormatted}
          </span>
          <span className="tabular-nums">{process.products.length} itens</span>
        </div>

        {/* Action */}
        <Link
          to={`/processo/${process.id}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver detalhes <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
