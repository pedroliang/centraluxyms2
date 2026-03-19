import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProcessStore } from "@/stores/processStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "active" as const, label: "ATIVO" },
  { value: "completed" as const, label: "FINALIZADO" },
  { value: "cancelled" as const, label: "CANCELADO" },
];

export default function ProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { processes, updateProcess } = useProcessStore();
  const process = processes.find((p) => p.id === id);

  if (!process) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Processo não encontrado.
        </div>
      </AppLayout>
    );
  }

  const dateFormatted = new Date(process.date).toLocaleDateString("pt-BR");

  return (
    <AppLayout>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-heading text-foreground font-mono">{process.code}</h1>
                <span className="text-sm text-muted-foreground">— {process.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{dateFormatted}</span>
                <span>{process.type === "loading" ? "Carregamento" : "Descarga"}</span>
                <span className="tabular-nums">{process.products.length} itens</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {process.status !== "completed" && (
              <Button 
                onClick={() => {
                  updateProcess(process.id, { status: "completed" });
                  toast.success("Processo marcado como FINALIZADO!");
                  navigate("/");
                }} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalizar Processo
              </Button>
            )}
            
            {/* Status toggle */}
            <div className="flex rounded-md border border-border overflow-hidden">
              {statusOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateProcess(process.id, { status: s.value })}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    process.status === s.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-6 flex flex-col min-h-[50vh]">
        <ProductGrid processId={process.id} products={process.products} />
        
        {process.status !== "completed" && (
          <div className="mt-8 flex justify-end mt-auto pt-8 border-t border-border/50">
            <Button 
              onClick={() => {
                updateProcess(process.id, { status: "completed" });
                toast.success("Processo finalizado com sucesso!");
                navigate("/");
              }} 
              className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md h-12 px-8 text-base"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              PRONTO! (Finalizar Processo)
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
