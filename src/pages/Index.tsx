import React, { useState, useMemo, useEffect } from "react";
import { useProcessStore } from "@/stores/processStore";
import { AppLayout } from "@/components/AppLayout";
import { ProcessCard } from "@/components/ProcessCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { Plus, Search, CalendarIcon, Printer, Package, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { processes, fetchProcesses, isLoading, deleteProcess } = useProcessStore();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const filtered = useMemo(() => {
    return processes.filter((p) => {
      const q = search.toUpperCase();
      const matchesSearch =
        !q || p.code.toUpperCase().includes(q) || p.name.toUpperCase().includes(q);
      const processDate = new Date(p.date);
      const matchesFrom = !dateRange.from || processDate >= dateRange.from;
      const matchesTo = !dateRange.to || processDate <= dateRange.to;
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [processes, search, dateRange]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    const toPrint = processes.filter((p) => selectedIds.includes(p.id));
    // Open print view
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html><head><title>Impressão - Centralux YMS</title>
      <style>
        body { font-family: 'IBM Plex Sans', system-ui, sans-serif; margin: 40px; color: #1a1a2e; }
        h1 { font-size: 18px; margin-bottom: 8px; }
        .process { margin-bottom: 32px; page-break-inside: avoid; }
        .process-header { border-bottom: 2px solid #1a1a2e; padding-bottom: 8px; margin-bottom: 12px; }
        .code { font-family: monospace; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        td.num { text-align: right; font-variant-numeric: tabular-nums; }
        @media print { body { margin: 20px; } }
      </style></head><body>
      <h1>CENTRALUX YMS</h1>
      <p style="font-size:12px;color:#666;">Impresso em: ${new Date().toLocaleString("pt-BR")}</p>
      ${toPrint.map(p => `
        <div class="process">
          <div class="process-header">
            <span style="font-weight:600;">${p.name}</span> — Processo / Código: <span class="code">${p.code}</span>
            <span style="float:right;font-size:12px;">${new Date(p.date).toLocaleDateString("pt-BR")} | ${p.type === "loading" ? "Carregamento" : "Descarga"} | ${p.status.toUpperCase()}</span>
          </div>
          <table>
            <thead><tr><th>Código</th><th>Descrição</th><th>Qtd Unit.</th><th>Caixas</th><th>Qtd/Cx</th><th>Lote</th><th>Volume</th></tr></thead>
            <tbody>
              ${p.products.map(prod => `
                <tr>
                  <td class="code">${prod.code}</td>
                  <td>${prod.description}</td>
                  <td class="num">${prod.qtyUnit}</td>
                  <td class="num">${prod.qtyBoxes}</td>
                  <td class="num">${prod.qtyPerBox}</td>
                  <td>${prod.lote || "—"}</td>
                  <td class="num">${prod.cubagem?.volume || "—"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `).join("")}
      </body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedIds.length} processo(s)?`)) {
      for (const id of selectedIds) {
        await deleteProcess(id);
      }
      setSelectedIds([]);
    }
  };

  const dateLabel = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "dd/MM/yy")} — ${format(dateRange.to, "dd/MM/yy")}`;
    }
    if (dateRange.from) return `A partir de ${format(dateRange.from, "dd/MM/yy")}`;
    return "Filtrar por data";
  };

  return (
    <AppLayout>
      {/* Action bar */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-heading text-foreground">Gestão de Fluxo de Pátio</h1>
          <Link to="/processo/novo">
            <Button>
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Processo
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar código ou nome..."
              className="pl-9 bg-card"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("gap-2", dateRange.from && "text-primary")}>
                <CalendarIcon className="h-4 w-4" />
                {dateLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                locale={ptBR}
                className="p-3 pointer-events-auto"
              />
              {dateRange.from && (
                <div className="border-t border-border px-3 py-2">
                  <Button variant="ghost" size="sm" onClick={() => setDateRange({})}>
                    Limpar filtro
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDeleteSelected} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir ({selectedIds.length})
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir ({selectedIds.length})
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Process grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-12 w-12 mb-3 animate-spin opacity-40 text-primary" />
            <p className="text-sm">Conectando ao banco de dados...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">Nenhum processo encontrado.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProcessCard
                key={p.id}
                process={p}
                selected={selectedIds.includes(p.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
