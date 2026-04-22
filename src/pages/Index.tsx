import React, { useState, useMemo, useEffect } from "react";
import { useProcessStore } from "@/stores/processStore";
import { AppLayout } from "@/components/AppLayout";
import { ProcessCard } from "@/components/ProcessCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, CalendarIcon, Printer, Package, FileText, Loader2, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const PRINT_COLUMNS = [
  { id: 'code', label: 'Código' },
  { id: 'description', label: 'Descrição' },
  { id: 'qtyUnit', label: 'Q.Unit' },
  { id: 'qtyUnitSP', label: 'Unt. SP' },
  { id: 'qtyUnitDF', label: 'Unt. DF' },
  { id: 'qtyBoxes', label: 'Caixas' },
  { id: 'qtyBoxesSP', label: 'Cx. SP' },
  { id: 'qtyBoxesDF', label: 'Cx. DF' },
  { id: 'qtyPerBox', label: 'Q/Cx' },
  { id: 'lote', label: 'Lote' },
];


export default function Dashboard() {
  const navigate = useNavigate();
  const { processes, fetchProcesses, isLoading, deleteProcess } = useProcessStore();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [quickFilter, setQuickFilter] = useState<{ type: "origin" | "destination"; value: string } | null>(null);

  // Print Config State
  const [printConfigOpen, setPrintConfigOpen] = useState(false);
  const [printActionType, setPrintActionType] = useState<"pdf" | "print" | null>(null);
  const [printConfig, setPrintConfig] = useState<{ 
    orientation: "portrait" | "landscape", 
    color: "color" | "bw", 
    margin: "standard" | "none" | "slim",
    columns: string[]
  }>({ 
    orientation: "portrait", 
    color: "color", 
    margin: "standard",
    columns: []
  });


  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const filtered = useMemo(() => {
    return processes.filter((p) => {
      const q = search.toUpperCase();
      const matchesSearch =
        !q || 
        p.code.toUpperCase().includes(q) || 
        p.name.toUpperCase().includes(q) ||
        (p.cliente && p.cliente.toUpperCase().includes(q)) ||
        p.products.some(prod => prod.code.toUpperCase().includes(q) || prod.description.toUpperCase().includes(q));
      const processDate = new Date(p.date);
      const matchesFrom = !dateRange.from || processDate >= dateRange.from;
      const matchesTo = !dateRange.to || processDate <= dateRange.to;
      
      const matchesQuickFilter = !quickFilter || (
        quickFilter.type === "origin"
          ? p.origin?.toUpperCase().includes(quickFilter.value.toUpperCase())
          : p.destination?.toUpperCase().includes(quickFilter.value.toUpperCase())
      );

      return matchesSearch && matchesFrom && matchesTo && matchesQuickFilter;
    });
  }, [processes, search, dateRange, quickFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGeneratePDF = () => {
    const toPrint = processes.filter((p) => selectedIds.includes(p.id));
    const pdfWindow = window.open("", "_blank");
    if (!pdfWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <head><title>Gerando PDF...</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
      <style>
        body { font-family: 'IBM Plex Sans', system-ui, sans-serif; margin: ${printConfig.margin === 'standard' ? '20mm' : printConfig.margin === 'slim' ? '10mm' : '0'}; color: #1a1a2e; }
        h1 { font-size: 18px; margin-bottom: 8px; }
        .process { margin-bottom: 32px; page-break-inside: avoid; break-inside: avoid; display: inline-block; width: 100%; }
        .process-header { border-bottom: 2px solid #1a1a2e; padding-bottom: 8px; margin-bottom: 12px; }
        .code { font-family: monospace; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        tr { page-break-inside: avoid; break-inside: avoid; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f0f4ff !important; font-weight: 600; color: #1a1a2e; }
        td.num { text-align: right; font-variant-numeric: tabular-nums; }
        .status-badge { padding: 2px 6px; borderRadius: 4px; fontSize: 10px; fontWeight: 600; }
        .status-active { background: #eef2ff !important; color: #2563eb !important; }
        .status-completed { background: #f0fdf4 !important; color: #16a34a !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        ${printConfig.color === 'bw' ? '* { filter: grayscale(100%) !important; }' : ''}
      </style></head><body>
      <div id="pdf-content">
        <h1>CENTRALUX YMS</h1>
        <p style="font-size:12px;color:#666;">Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
        ${toPrint.map(p => {
          const activeCols = printConfig.columns.length > 0 
            ? PRINT_COLUMNS.filter(c => printConfig.columns.includes(c.id))
            : PRINT_COLUMNS;

          return `
          <div class="process">
            <div class="process-header" style="border-bottom: 2px solid #2563eb;">
              <span style="font-weight:600; color: #1a1a2e;">${p.cliente ? p.cliente + ' - ' + p.name : p.name}</span> — Processo / Código: <span class="code" style="color: #2563eb;">${p.code}</span>
              <span style="float:right;font-size:12px;">
                ${p.date.split('T')[0].split('-').reverse().join('/')} | ${p.type === "loading" ? "Carregamento" : "Descarga"} | 
                <span class="status-badge ${p.status === 'active' ? 'status-active' : 'status-completed'}">${p.status.toUpperCase()}</span>
              </span>
            </div>
            <table>
              <thead>
                <tr>
                  ${activeCols.map(c => `<th>${c.label}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${p.products.map(prod => `
                  <tr>
                    ${activeCols.map(c => {
                      const val = (prod as any)[c.id];
                      const isNum = typeof val === 'number';
                      const isCode = c.id === 'code';
                      return `<td class="${isNum ? 'num' : ''} ${isCode ? 'code' : ''}" ${isNum && (c.id === 'qtyUnit' || c.id === 'qtyBoxes') ? 'style="font-weight:bold;"' : ''}>${val || "—"}</td>`;
                    }).join("")}
                  </tr>
                `).join("")}
              </tbody>
              <tfoot>
                <tr style="background: #f8faff; font-weight: bold;">
                  <td colspan="${activeCols.findIndex(c => c.id.startsWith('qty')) || 1}" style="text-align: right;">TOTAL</td>
                  ${activeCols.slice(activeCols.findIndex(c => c.id.startsWith('qty')) || 1).map(c => {
                    if (c.id.startsWith('qty') && c.id !== 'qtyPerBox') {
                      const total = p.products.reduce((s, prod) => s + (Number((prod as any)[c.id]) || 0), 0);
                      return `<td class="num">${total || "—"}</td>`;
                    }
                    return `<td></td>`;
                  }).join("")}
                </tr>
              </tfoot>
            </table>
          </div>
        `; }).join("")}

      </div>
      <script>
        window.onload = function() {
          var element = document.getElementById('pdf-content');
          html2pdf(element, {
            margin:       ${printConfig.margin === 'standard' ? '10' : printConfig.margin === 'slim' ? '5' : '2'},
            filename:     'Centralux_Processos_' + new Date().getTime() + '.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: printConfig.orientation }
          }).from(element).toPdf().get('pdf').then(function (pdf) {
            var totalPages = pdf.internal.getNumberOfPages();
            for (var i = 1; i <= totalPages; i++) {
              pdf.setPage(i);
              pdf.setFontSize(8);
              pdf.setTextColor(150);
              pdf.text('Página ' + i + ' de ' + totalPages, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10);
            }
          }).save().then(function() {
            setTimeout(() => window.close(), 500);
          });
        };
      </script>
      </body></html>
    `;
    pdfWindow.document.write(html);
    pdfWindow.document.close();
  };

  const handlePrint = () => {
    const toPrint = processes.filter((p) => selectedIds.includes(p.id));
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <head><title>Impressão - Centralux YMS</title>
      <style>
        body { font-family: 'IBM Plex Sans', system-ui, sans-serif; margin: ${printConfig.margin === 'standard' ? '20mm' : printConfig.margin === 'slim' ? '10mm' : '0'}; color: #1a1a2e; }
        h1 { font-size: 18px; margin-bottom: 8px; }
        .process { margin-bottom: 32px; page-break-inside: avoid; break-inside: avoid; display: inline-block; width: 100%; }
        .process-header { border-bottom: 2px solid #1a1a2e; padding-bottom: 8px; margin-bottom: 12px; }
        .code { font-family: monospace; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        tr { page-break-inside: avoid; break-inside: avoid; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f0f4ff !important; font-weight: 600; color: #1a1a2e; }
        td.num { text-align: right; font-variant-numeric: tabular-nums; }
        .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; }
        .status-active { background: #eef2ff !important; color: #2563eb !important; }
        .status-completed { background: #f0fdf4 !important; color: #16a34a !important; }
        @media print { 
          body { margin: ${printConfig.margin === 'none' ? '0' : '20px'}; } 
          @page { 
            size: ${printConfig.orientation}; 
            margin: ${printConfig.margin === 'standard' ? '15mm' : printConfig.margin === 'slim' ? '5mm' : '0mm'}; 
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          ${printConfig.color === 'bw' ? '* { filter: grayscale(100%) !important; }' : ''}
        }
      </style></head><body>
      <h1>CENTRALUX YMS</h1>
      <p style="font-size:12px;color:#666;">Impresso em: ${new Date().toLocaleString("pt-BR")}</p>
      ${toPrint.map(p => {
        const activeCols = printConfig.columns.length > 0 
          ? PRINT_COLUMNS.filter(c => printConfig.columns.includes(c.id))
          : PRINT_COLUMNS;

        return `
        <div class="process">
          <div class="process-header" style="border-bottom: 2px solid #2563eb;">
            <span style="font-weight:600; color: #1a1a2e;">${p.cliente ? p.cliente + ' - ' + p.name : p.name}</span> — Processo / Código: <span class="code" style="color: #2563eb;">${p.code}</span>
            <span style="float:right;font-size:12px;">
              ${p.date.split('T')[0].split('-').reverse().join('/')} | ${p.type === "loading" ? "Carregamento" : "Descarga"} | 
              <span class="status-badge ${p.status === 'active' ? 'status-active' : 'status-completed'}">${p.status.toUpperCase()}</span>
            </span>
          </div>
          <table>
            <thead>
              <tr>
                ${activeCols.map(c => `<th>${c.label}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${p.products.map(prod => `
                <tr>
                  ${activeCols.map(c => {
                    const val = (prod as any)[c.id];
                    const isNum = typeof val === 'number';
                    const isCode = c.id === 'code';
                    return `<td class="${isNum ? 'num' : ''} ${isCode ? 'code' : ''}" ${isNum && (c.id === 'qtyUnit' || c.id === 'qtyBoxes') ? 'style="font-weight:bold;"' : ''}>${val || "—"}</td>`;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
            <tfoot>
                <tr style="background: #f8faff; font-weight: bold;">
                  <td colspan="${activeCols.findIndex(c => c.id.startsWith('qty')) || 1}" style="text-align: right;">TOTAL</td>
                  ${activeCols.slice(activeCols.findIndex(c => c.id.startsWith('qty')) || 1).map(c => {
                    if (c.id.startsWith('qty') && c.id !== 'qtyPerBox') {
                      const total = p.products.reduce((s, prod) => s + (Number((prod as any)[c.id]) || 0), 0);
                      return `<td class="num">${total || "—"}</td>`;
                    }
                    return `<td></td>`;
                  }).join("")}
                </tr>
              </tfoot>
          </table>
        </div>
        `;
      }).join("")}

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
              placeholder="Pesquisar código, nome, cliente ou item..."
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

          <div className="flex items-center gap-2 border-l border-border pl-3">
            <Button 
              variant={!quickFilter ? "default" : "outline"} 
              size="sm"
              onClick={() => setQuickFilter(null)}
              className="px-4"
            >
              Todos
            </Button>
            <Button 
              variant={quickFilter?.value === "Porto" ? "default" : "outline"} 
              size="sm"
              onClick={() => setQuickFilter({ type: "origin", value: "Porto" })}
              className="gap-2"
            >
              Porto
            </Button>
            <Button 
              variant={quickFilter?.value === "São Paulo" ? "default" : "outline"} 
              size="sm"
              onClick={() => setQuickFilter({ type: "destination", value: "São Paulo" })}
              className="gap-2"
            >
              São Paulo
            </Button>
            <Button 
              variant={quickFilter?.value === "Brasília" ? "default" : "outline"} 
              size="sm"
              onClick={() => setQuickFilter({ type: "destination", value: "Brasília" })}
              className="gap-2"
            >
              Brasília
            </Button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              {selectedIds.length === 1 && (
                <Button variant="outline" onClick={() => navigate(`/processo/editar/${selectedIds[0]}`)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
              <Button variant="destructive" onClick={handleDeleteSelected} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Excluir ({selectedIds.length})
              </Button>
              <Button variant="outline" onClick={() => { setPrintActionType('pdf'); setPrintConfigOpen(true); }} className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                <FileText className="h-4 w-4" />
                Gerar PDF ({selectedIds.length})
              </Button>
              <Button variant="outline" onClick={() => { setPrintActionType('print'); setPrintConfigOpen(true); }} className="gap-2">
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

      {/* Footer/Modals */}
      <Dialog open={printConfigOpen} onOpenChange={setPrintConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{printActionType === 'pdf' ? "Configurações do PDF" : "Configurações de Impressão"}</DialogTitle>
            <DialogDescription>
              Ajuste o layout e as cores antes de confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orientation" className="text-right">Orientação</Label>
              <div className="col-span-3">
                <Select value={printConfig.orientation} onValueChange={(v: "portrait" | "landscape") => setPrintConfig(prev => ({ ...prev, orientation: v }))}>
                  <SelectTrigger id="orientation">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Retrato</SelectItem>
                    <SelectItem value="landscape">Paisagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="margin" className="text-right">Margens</Label>
              <div className="col-span-3">
                <Select value={printConfig.margin} onValueChange={(v: "standard" | "none" | "slim") => setPrintConfig(prev => ({ ...prev, margin: v }))}>
                  <SelectTrigger id="margin">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Padrão</SelectItem>
                    <SelectItem value="slim">Estreita</SelectItem>
                    <SelectItem value="none">Nenhuma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">Cor</Label>
              <div className="col-span-3">
                <Select value={printConfig.color} onValueChange={(v: "color" | "bw") => setPrintConfig(prev => ({ ...prev, color: v }))}>
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Colorido</SelectItem>
                    <SelectItem value="bw">Preto e Branco</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border-t pt-4 mt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Colunas para exibir</Label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {PRINT_COLUMNS.map(col => (
                  <div key={col.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`col-${col.id}`} 
                      checked={printConfig.columns.includes(col.id)}
                      onCheckedChange={(checked) => {
                        setPrintConfig(prev => ({
                          ...prev,
                          columns: checked 
                            ? [...prev.columns, col.id]
                            : prev.columns.filter(c => c !== col.id)
                        }));
                      }}
                    />
                    <label 
                      htmlFor={`col-${col.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {col.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">* Se nenhuma for escolhida, todas serão impressas.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintConfigOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={() => {
              setPrintConfigOpen(false);
              if (printActionType === 'pdf') handleGeneratePDF();
              else if (printActionType === 'print') handlePrint();
            }}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
