import React, { useState, useMemo, useEffect } from "react";
import { useProcessStore } from "@/stores/processStore";
import { AppLayout } from "@/components/AppLayout";
import { ProcessCard } from "@/components/ProcessCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, CalendarIcon, Printer, Package, FileText, Loader2, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
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
        !q || 
        p.code.toUpperCase().includes(q) || 
        p.name.toUpperCase().includes(q) ||
        (p.cliente && p.cliente.toUpperCase().includes(q)) ||
        p.products.some(prod => prod.code.toUpperCase().includes(q) || prod.description.toUpperCase().includes(q));
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

  const handleGeneratePDF = () => {
    const toPrint = processes.filter((p) => selectedIds.includes(p.id));
    const pdfWindow = window.open("", "_blank");
    if (!pdfWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html><head><title>Gerando PDF...</title>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
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
      </style></head><body>
      <div id="pdf-content">
        <h1>CENTRALUX YMS</h1>
        <p style="font-size:12px;color:#666;">Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
        ${toPrint.map(p => {
          const hasSP = p.products.some(prod => (prod.qtyUnitSP || 0) > 0 || (prod.qtyBoxesSP || 0) > 0);
          const hasDF = p.products.some(prod => (prod.qtyUnitDF || 0) > 0 || (prod.qtyBoxesDF || 0) > 0);
          return `
          <div class="process">
            <div class="process-header">
              <span style="font-weight:600;">${p.cliente ? p.cliente + ' - ' + p.name : p.name}</span> — Processo / Código: <span class="code">${p.code}</span>
              <span style="float:right;font-size:12px;">${p.date.split('T')[0].split('-').reverse().join('/')} | ${p.type === "loading" ? "Carregamento" : "Descarga"} | ${p.status.toUpperCase()}</span>
            </div>
            <table>
              <thead><tr><th>Código</th><th>Descrição</th><th>Qtd Total</th>${hasSP ? '<th>Unt. SP</th>' : ''}${hasDF ? '<th>Unt. DF</th>' : ''}<th>Caixas</th>${hasSP ? '<th>Cx. SP</th>' : ''}${hasDF ? '<th>Cx. DF</th>' : ''}<th>Qtd/Cx</th><th>Lote</th><th>Volume</th></tr></thead>
              <tbody>
                ${p.products.map(prod => `
                  <tr>
                    <td class="code">${prod.code}</td>
                    <td>${prod.description.length > 30 ? prod.description.substring(0,27) + "..." : prod.description}</td>
                    <td class="num" style="font-weight:bold;">${prod.qtyUnit}</td>
                    ${hasSP ? `<td class="num">${prod.qtyUnitSP || "—"}</td>` : ''}
                    ${hasDF ? `<td class="num">${prod.qtyUnitDF || "—"}</td>` : ''}
                    <td class="num" style="font-weight:bold;">${prod.qtyBoxes}</td>
                    ${hasSP ? `<td class="num">${prod.qtyBoxesSP || "—"}</td>` : ''}
                    ${hasDF ? `<td class="num">${prod.qtyBoxesDF || "—"}</td>` : ''}
                    <td class="num">${prod.qtyPerBox}</td>
                    <td>${prod.lote || "—"}</td>
                    <td class="num">${prod.cubagem?.volume || "—"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `}).join("")}
      </div>
      <script>
        window.onload = function() {
          var element = document.getElementById('pdf-content');
          html2pdf(element, {
            margin:       10,
            filename:     'Centralux_Processos_' + new Date().getTime() + '.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          }).then(function() {
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
      ${toPrint.map(p => {
        const hasSP = p.products.some(prod => (prod.qtyUnitSP || 0) > 0 || (prod.qtyBoxesSP || 0) > 0);
        const hasDF = p.products.some(prod => (prod.qtyUnitDF || 0) > 0 || (prod.qtyBoxesDF || 0) > 0);
        return `
        <div class="process">
          <div class="process-header">
            <span style="font-weight:600;">${p.cliente ? p.cliente + ' - ' + p.name : p.name}</span> — Processo / Código: <span class="code">${p.code}</span>
            <span style="float:right;font-size:12px;">${p.date.split('T')[0].split('-').reverse().join('/')} | ${p.type === "loading" ? "Carregamento" : "Descarga"} | ${p.status.toUpperCase()}</span>
          </div>
          <table>
            <thead><tr><th>Código</th><th>Descrição</th><th>Qtd Total</th>${hasSP ? '<th>Unt. SP</th>' : ''}${hasDF ? '<th>Unt. DF</th>' : ''}<th>Caixas</th>${hasSP ? '<th>Cx. SP</th>' : ''}${hasDF ? '<th>Cx. DF</th>' : ''}<th>Qtd/Cx</th><th>Lote</th><th>Volume</th></tr></thead>
            <tbody>
              ${p.products.map(prod => `
                <tr>
                  <td class="code">${prod.code}</td>
                  <td>${prod.description}</td>
                  <td class="num" style="font-weight:bold;">${prod.qtyUnit}</td>
                  ${hasSP ? `<td class="num">${prod.qtyUnitSP || "—"}</td>` : ''}
                  ${hasDF ? `<td class="num">${prod.qtyUnitDF || "—"}</td>` : ''}
                  <td class="num" style="font-weight:bold;">${prod.qtyBoxes}</td>
                  ${hasSP ? `<td class="num">${prod.qtyBoxesSP || "—"}</td>` : ''}
                  ${hasDF ? `<td class="num">${prod.qtyBoxesDF || "—"}</td>` : ''}
                  <td class="num">${prod.qtyPerBox}</td>
                  <td>${prod.lote || "—"}</td>
                  <td class="num">${prod.cubagem?.volume || "—"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `}).join("")}
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
              <Button variant="outline" onClick={handleGeneratePDF} className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                <FileText className="h-4 w-4" />
                Gerar PDF ({selectedIds.length})
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
