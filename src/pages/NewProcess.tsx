import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProcessStore } from "@/stores/processStore";
import { Process, ProcessType } from "@/types/process";
import { ArrowLeft, Save, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function NewProcess() {
  const navigate = useNavigate();
  const { addProcess } = useProcessStore();

  const [name, setName] = useState("Carreta");
  const [code, setCode] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [type, setType] = useState<ProcessType>("unloading");
  const [origin, setOrigin] = useState("Brasília");
  const [destination, setDestination] = useState("São Paulo");

  const processId = crypto.randomUUID();

  const handleSave = () => {
    if (!name.trim() || !code.trim()) return;
    const process: Process = {
      id: processId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      date: format(date, "yyyy-MM-dd"),
      type,
      origin,
      destination,
      status: "active",
      products: [],
      createdAt: new Date().toISOString(),
    };
    addProcess(process);
    navigate(`/processo/${processId}`);
  };

  return (
    <AppLayout>
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-heading text-foreground">Novo Processo</h1>
        </div>
      </div>

      <div className="p-6 max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-5 shadow-card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Veículo</label>
              <select value={name} onChange={(e) => setName(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Carreta">Carreta</option>
                <option value="Contêiner">Contêiner</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Processo/Código</label>
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Ex: CTX-9945" className="bg-background font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Origem</label>
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Brasília">Brasília</option>
                <option value="São Paulo">São Paulo</option>
                <option value="Porto">Porto</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Destino</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="Brasília">Brasília</option>
                <option value="São Paulo">São Paulo</option>
                <option value="Porto">Porto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background text-foreground border-input",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("unloading")}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    type === "unloading" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  Descarga
                </button>
                <button
                  type="button"
                  onClick={() => setType("loading")}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    type === "loading" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  Carregamento
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleSave} disabled={!name.trim() || !code.trim()}>
              <Save className="h-4 w-4 mr-1.5" />
              Criar Processo
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
