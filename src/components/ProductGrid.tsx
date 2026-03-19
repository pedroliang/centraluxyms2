import React, { useState } from "react";
import { Product } from "@/types/process";
import { useProcessStore } from "@/stores/processStore";
import { SmartCodeInput } from "./SmartCodeInput";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  processId: string;
  products: Product[];
}

export function ProductGrid({ processId, products }: ProductGridProps) {
  const { addProduct, updateProduct, removeProduct } = useProcessStore();
  
  // New product form
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [qtyUnit, setQtyUnit] = useState("");
  const [qtyBoxes, setQtyBoxes] = useState("");
  const [qtyPerBox, setQtyPerBox] = useState("");
  const [lote, setLote] = useState("");
  const [cubVol, setCubVol] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const handleQtyUnitChange = (val: string) => {
    setQtyUnit(val);
    const unit = parseFloat(val);
    const perBox = parseFloat(qtyPerBox);
    const boxes = parseFloat(qtyBoxes);
    
    if (!isNaN(unit)) {
      if (!isNaN(perBox) && perBox > 0) {
        setQtyBoxes(Number((unit / perBox).toFixed(4)).toString());
      } else if (!isNaN(boxes) && boxes > 0) {
        setQtyPerBox(Number((unit / boxes).toFixed(4)).toString());
      }
    }
  };

  const handleQtyBoxesChange = (val: string) => {
    setQtyBoxes(val);
    const boxes = parseFloat(val);
    const perBox = parseFloat(qtyPerBox);
    const unit = parseFloat(qtyUnit);
    
    if (!isNaN(boxes)) {
      if (!isNaN(perBox) && perBox > 0) {
        setQtyUnit(Number((boxes * perBox).toFixed(4)).toString());
      } else if (!isNaN(unit) && boxes > 0) {
        setQtyPerBox(Number((unit / boxes).toFixed(4)).toString());
      }
    }
  };

  const handleQtyPerBoxChange = (val: string) => {
    setQtyPerBox(val);
    const perBox = parseFloat(val);
    const boxes = parseFloat(qtyBoxes);
    const unit = parseFloat(qtyUnit);
    
    if (!isNaN(perBox) && perBox > 0) {
      if (!isNaN(unit)) {
        setQtyBoxes(Number((unit / perBox).toFixed(4)).toString());
      } else if (!isNaN(boxes)) {
        setQtyUnit(Number((boxes * perBox).toFixed(4)).toString());
      }
    }
  };

  const resetForm = () => {
    setCode(""); setDescription(""); setQtyUnit(""); setQtyBoxes("");
    setQtyPerBox(""); setLote(""); setCubVol(""); setIsManual(false); setAutoFilled(false);
  };

  const handleSelectProduct = (product: { code: string; description: string; cubagem?: { x: number; y: number; z: number; peso?: string }; lote?: string; qtyPerBox?: number }) => {
    setCode(product.code);
    setDescription(product.description);
    setLote(product.lote || "");
    setQtyPerBox(product.qtyPerBox?.toString() || "");
    // Calculate volume from x*y*z
    const vol = product.cubagem ? Math.round(product.cubagem.x * product.cubagem.y * product.cubagem.z) : 0;
    setCubVol(vol ? vol.toString() : "");
    setIsManual(false);
    setAutoFilled(true);
  };

  const handleAdd = () => {
    if (!code || !description) return;
    const newProduct: Product = {
      id: crypto.randomUUID(),
      code,
      description,
      qtyUnit: Number(qtyUnit) || 0,
      qtyBoxes: Number(qtyBoxes) || 0,
      qtyPerBox: Number(qtyPerBox) || 0,
      cubagem: cubVol ? { comprimento: 0, largura: 0, altura: 0, volume: Number(cubVol) } : undefined,
      lote: lote || undefined,
      isManual,
      isOverridden: false,
    };
    addProduct(processId, newProduct);
    resetForm();
  };

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleInlineUpdate = (productId: string, field: keyof Product, value: any) => {
    updateProduct(processId, productId, { [field]: value, isOverridden: true });
  };

  const totalQtyUnit = products.reduce((sum, p) => sum + (p.qtyUnit || 0), 0);
  const totalQtyBoxes = products.reduce((sum, p) => sum + (p.qtyBoxes || 0), 0);
  const totalVolume = products.reduce((sum, p) => sum + (p.cubagem?.volume || 0), 0);

  return (
    <div>
      {/* Add product form */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-card mb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Adicionar Produto</h3>
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-2">
            <label className="mb-1 block text-[11px] text-muted-foreground">Código</label>
            <SmartCodeInput
              value={code}
              onChange={(v) => { setCode(v); if (autoFilled) { setAutoFilled(false); setDescription(""); setLote(""); setQtyPerBox(""); setCubVol(""); } }}
              onSelect={handleSelectProduct}
            />
          </div>
          <div className="col-span-3">
            <label className="mb-1 block text-[11px] text-muted-foreground">Descrição</label>
            <input
              value={description}
              onChange={(e) => { setDescription(e.target.value); if (!autoFilled) setIsManual(true); }}
              placeholder={autoFilled ? "" : "Modo manual..."}
              className={cn(
                "h-10 w-full rounded-md border px-3 py-2 text-sm bg-card ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isManual ? "border-warning" : "border-input"
              )}
            />
          </div>
          <div className="col-span-1">
            <label className="mb-1 block text-[11px] text-muted-foreground">Qtd Unit.</label>
            <input type="number" value={qtyUnit} onChange={(e) => handleQtyUnitChange(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm tabular-nums text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="col-span-1">
            <label className="mb-1 block text-[11px] text-muted-foreground">Caixas</label>
            <input type="number" value={qtyBoxes} onChange={(e) => handleQtyBoxesChange(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm tabular-nums text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="col-span-1">
            <label className="mb-1 block text-[11px] text-muted-foreground">Qtd/Cx</label>
            <input type="number" value={qtyPerBox} onChange={(e) => handleQtyPerBoxChange(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm tabular-nums text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="col-span-1">
            <label className="mb-1 block text-[11px] text-muted-foreground">Lote</label>
            <input value={lote} onChange={(e) => setLote(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="col-span-1">
            <label className="mb-1 block text-[11px] text-muted-foreground">Vol. (cm³)</label>
            <input type="number" value={cubVol} onChange={(e) => setCubVol(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm tabular-nums text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="col-span-2 flex justify-end">
            <Button onClick={handleAdd} disabled={!code || !description} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>
        {isManual && (
          <p className="mt-2 text-[11px] text-warning-foreground bg-warning/10 px-2 py-1 rounded inline-block">
            ⚠ Modo manual — Código não encontrado no banco de dados
          </p>
        )}
      </div>

      {/* Products table */}
      {products.length > 0 && (
        <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Código</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Descrição</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Qtd Unit.</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Caixas</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Qtd/Cx</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Lote</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Volume</th>
                <th className="px-4 py-2.5 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, i) => (
                <tr
                  key={prod.id}
                  className={cn(
                    "border-b border-border last:border-0 animate-row-enter",
                    prod.isOverridden && "override-indicator",
                    prod.isManual && "bg-warning/5"
                  )}
                >
                  <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{prod.code}</td>
                  <td className="px-4 py-2.5 text-foreground">{prod.description}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {editingId === prod.id ? (
                      <input
                        type="number"
                        defaultValue={prod.qtyUnit}
                        onBlur={(e) => { handleInlineUpdate(prod.id, "qtyUnit", Number(e.target.value)); setEditingId(null); }}
                        className="w-16 text-right rounded border border-input bg-background px-1 py-0.5 text-sm"
                        autoFocus
                      />
                    ) : prod.qtyUnit}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {editingId === prod.id ? (
                      <input
                        type="number"
                        defaultValue={prod.qtyBoxes}
                        onBlur={(e) => handleInlineUpdate(prod.id, "qtyBoxes", Number(e.target.value))}
                        className="w-16 text-right rounded border border-input bg-background px-1 py-0.5 text-sm"
                      />
                    ) : prod.qtyBoxes}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {editingId === prod.id ? (
                      <input
                        type="number"
                        defaultValue={prod.qtyPerBox}
                        onBlur={(e) => handleInlineUpdate(prod.id, "qtyPerBox", Number(e.target.value))}
                        className="w-16 text-right rounded border border-input bg-background px-1 py-0.5 text-sm"
                      />
                    ) : prod.qtyPerBox}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{prod.lote || "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{prod.cubagem?.volume || "—"}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditingId(editingId === prod.id ? null : prod.id)}
                        className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeProduct(processId, prod.id)}
                        className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/50">
                <td colSpan={2} className="px-4 py-2.5 text-right text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-foreground">{totalQtyUnit}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-foreground">{totalQtyBoxes}</td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5"></td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-muted-foreground">{totalVolume > 0 ? totalVolume : "—"}</td>
                <td className="px-4 py-2.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
