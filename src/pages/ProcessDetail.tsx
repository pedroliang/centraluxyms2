import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { useProcessStore } from "@/stores/processStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

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

  // Print Config State
  const [printConfigOpen, setPrintConfigOpen] = useState(false);
  const [printActionType, setPrintActionType] = useState<"pdf" | "print" | null>(null);
  const [printConfig, setPrintConfig] = useState<{ 
    orientation: "portrait" | "landscape", 
    color: "color" | "bw", 
    margin: "standard" | "none" | "slim",
    columns: string[]
  }>({ 
    orientation: "landscape", 
    color: "color", 
    margin: "standard",
    columns: []
  });

  const handleGeneratePDF = () => {
    if (!process) return;
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
        ${(() => {
          const p = process;
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
        `; })()}
      </div>
      <script>
        window.onload = function() {
          var element = document.getElementById('pdf-content');
          html2pdf(element, {
            margin:       ${printConfig.margin === 'standard' ? '10' : printConfig.margin === 'slim' ? '5' : '2'},
            filename:     'Centralux_Processo_${process.code}_' + new Date().getTime() + '.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: printConfig.orientation }
          }).from(element).save().then(function() {
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
    if (!process) return;
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
            size: A4 ${printConfig.orientation}; 
            margin: ${printConfig.margin === 'standard' ? '15mm' : printConfig.margin === 'slim' ? '5mm' : '0mm'}; 
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          ${printConfig.color === 'bw' ? '* { filter: grayscale(100%) !important; }' : ''}
        }
      </style></head><body>
      <h1>CENTRALUX YMS</h1>
      <p style="font-size:12px;color:#666;">Impresso em: ${new Date().toLocaleString("pt-BR")}</p>
      ${(() => {
        const p = process;
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
      })()}
      </body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };


  if (!process) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Processo não encontrado.
        </div>
      </AppLayout>
    );
  }

  const dateFormatted = process.date.split('T')[0].split('-').reverse().join('/');

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
            <div className="flex items-center gap-2 mr-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setPrintActionType('pdf'); setPrintConfigOpen(true); }} 
                className="gap-2 border-primary/20 hover:bg-primary/5 text-primary h-8"
              >
                <FileText className="h-3.5 w-3.5" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setPrintActionType('print'); setPrintConfigOpen(true); }} 
                className="gap-2 h-8"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir
              </Button>
            </div>
            
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
        
        <div className="mt-8 flex justify-end mt-auto pt-8 border-t border-border/50">
          <Button 
            onClick={() => {
              (document.activeElement as HTMLElement)?.blur();
              setTimeout(() => navigate("/"), 150);
            }} 
            className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-md h-12 px-8 text-base"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            CONCLUIR CADASTRO
          </Button>
        </div>
      </div>

      <Dialog open={printConfigOpen} onOpenChange={setPrintConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{printActionType === 'pdf' ? "Configurações do PDF" : "Configurações de Impressão"}</DialogTitle>
            <DialogDescription>
              Ajuste o layout e as colunas antes de confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Orientação</Label>
              <div className="col-span-3 flex gap-2">
                <Button 
                  type="button"
                  variant={printConfig.orientation === 'portrait' ? 'default' : 'outline'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setPrintConfig(prev => ({ ...prev, orientation: 'portrait' }))}
                >
                  Retrato
                </Button>
                <Button 
                  type="button"
                  variant={printConfig.orientation === 'landscape' ? 'default' : 'outline'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setPrintConfig(prev => ({ ...prev, orientation: 'landscape' }))}
                >
                  Paisagem
                </Button>
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
