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
  const [qtyUnitSP, setQtyUnitSP] = useState("");
  const [qtyUnitDF, setQtyUnitDF] = useState("");
  const [qtyBoxesSP, setQtyBoxesSP] = useState("");
  const [qtyBoxesDF, setQtyBoxesDF] = useState("");
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
    setQtyUnitSP(""); setQtyUnitDF(""); setQtyBoxesSP(""); setQtyBoxesDF("");
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
    if (!code) return;
    const newProduct: Product = {
      id: crypto.randomUUID(),
      code,
      description: description || "Sem descrição",
      qtyUnit: Number(qtyUnit) || 0,
      qtyBoxes: Number(qtyBoxes) || 0,
      qtyPerBox: Number(qtyPerBox) || 0,
      qtyUnitSP: Number(qtyUnitSP) || 0,
      qtyUnitDF: Number(qtyUnitDF) || 0,
      qtyBoxesSP: Number(qtyBoxesSP) || 0,
      qtyBoxesDF: Number(qtyBoxesDF) || 0,
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

  const handleInlineUpdate = (prod: Product, field: keyof Product, value: any) => {
    const num = Number(value);
    if (isNaN(num)) return;
    const updates: Partial<Product> = { [field]: num, isOverridden: true };

    const perBox = field === "qtyPerBox" ? num : prod.qtyPerBox;

    if (perBox > 0) {
      if (field === "qtyUnit") updates.qtyBoxes = Number((num / perBox).toFixed(4));
      if (field === "qtyBoxes") updates.qtyUnit = Number((num * perBox).toFixed(4));
      if (field === "qtyUnitSP") updates.qtyBoxesSP = Number((num / perBox).toFixed(4));
      if (field === "qtyBoxesSP") updates.qtyUnitSP = Number((num * perBox).toFixed(4));
      if (field === "qtyUnitDF") updates.qtyBoxesDF = Number((num / perBox).toFixed(4));
      if (field === "qtyBoxesDF") updates.qtyUnitDF = Number((num * perBox).toFixed(4));
      
      if (field === "qtyPerBox") {
        if (prod.qtyUnit) updates.qtyBoxes = Number((prod.qtyUnit / perBox).toFixed(4));
        if (prod.qtyUnitSP) updates.qtyBoxesSP = Number((prod.qtyUnitSP / perBox).toFixed(4));
        if (prod.qtyUnitDF) updates.qtyBoxesDF = Number((prod.qtyUnitDF / perBox).toFixed(4));
      }
    }

    updateProduct(processId, prod.id, updates);
  };

  const totalQtyUnit = products.reduce((sum, p) => sum + (p.qtyUnit || 0), 0);
  const totalQtyBoxes = products.reduce((sum, p) => sum + (p.qtyBoxes || 0), 0);
  const totalVolume = products.reduce((sum, p) => sum + (p.cubagem?.volume || 0), 0);
  const totalQtyUnitSP = products.reduce((sum, p) => sum + (p.qtyUnitSP || 0), 0);
  const totalQtyUnitDF = products.reduce((sum, p) => sum + (p.qtyUnitDF || 0), 0);
  const totalQtyBoxesSP = products.reduce((sum, p) => sum + (p.qtyBoxesSP || 0), 0);
  const totalQtyBoxesDF = products.reduce((sum, p) => sum + (p.qtyBoxesDF || 0), 0);

  return (
    <div>
      {/* Add product form */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-card mb-4">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Adicionar Produto</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="w-28 shrink-0">
            <label className="mb-1 block text-[11px] text-muted-foreground truncate">Código</label>
            <SmartCodeInput
              value={code}
              onChange={(v) => { setCode(v); if (autoFilled) { setAutoFilled(false); setDescription(""); setLote(""); setQtyPerBox(""); setCubVol(""); } }}
              onSelect={handleSelectProduct}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="mb-1 block text-[11px] text-muted-foreground truncate">Descrição</label>
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
          <div className="w-16 shrink-0">
            <label className="mb-1 block text-[11px] text-muted-foreground truncate" title="Qtd. Total Unitária">Q.Unit</label>
            <input type="number" value={qtyUnit} onChange={(e) => handleQtyUnitChange(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm tabular-nums text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="w-16 shrink-0">
            <label className="mb-1 block text-[11px] text-blue-600 truncate" title="Qtd. Unit SP">Unt.SP</label>
            <input type="number" value={qtyUnitSP} onChange={(e) => setQtyUnitSP(e.target.value)} className="h-10 w-full rounded-md border border-blue-600/40 bg-card px-2 py-2 text-sm tabular-nums text-right focus-visible:ring-blue-600" />
          </div>
          <div className="w-16 shrink-0">
            <label className="mb-1 block text-[11px] text-orange-500 truncate" title="Qtd. Unit DF">Unt.DF</label>
            <input type="number" value={qtyUnitDF} onChange={(e) => setQtyUnitDF(e.target.value)} className="h-10 w-full rounded-md border border-orange-500/40 bg-card px-2 py-2 text-sm tabular-nums text-right focus-visible:ring-orange-500" />
          </div>
          <div className="w-16 shrink-0">
            <label className="mb-1 block text-[11px] text-muted-foreground truncate" title="Total Caixas">Caixas</label>
            <input type="number" value={qtyBoxes} onChange={(e) => handleQtyBoxesChange(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm tabular-nums text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="w-16 shrink-0">
            <label className="mb-1 block text-[11px] text-blue-600 truncate" title="Caixas SP">Cx.SP</label>
            <input type="number" value={qtyBoxesSP} onChange={(e) => setQtyBoxesSP(e.target.value)} className="h-10 w-full rounded-md border border-blue-600/40 bg-card px-2 py-2 text-sm tabular-nums text-right focus-visible:ring-blue-600" />
          </div>
          <div className="w-16 shrink-0">
            <label className="mb-1 block text-[11px] text-orange-500 truncate" title="Caixas DF">Cx.DF</label>
            <input type="number" value={qtyBoxesDF} onChange={(e) => setQtyBoxesDF(e.target.value)} className="h-10 w-full rounded-md border border-orange-500/40 bg-card px-2 py-2 text-sm tabular-nums text-right focus-visible:ring-orange-500" />
          </div>
          <div className="w-16 shrink-0">
            <label className="mb-1 block text-[11px] text-muted-foreground truncate" title="Qtd por Caixa">Q/Cx</label>
            <input type="number" value={qtyPerBox} onChange={(e) => handleQtyPerBoxChange(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm tabular-nums text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="w-20 shrink-0">
            <label className="mb-1 block text-[11px] text-muted-foreground truncate">Lote</label>
            <input value={lote} onChange={(e) => setLote(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="w-20 shrink-0">
            <label className="mb-1 block text-[11px] text-muted-foreground truncate" title="Volume (cm³)">Vol.</label>
            <input type="number" value={cubVol} onChange={(e) => setCubVol(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card px-2 py-2 text-sm tabular-nums text-right ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="w-24 shrink-0">
            <Button onClick={handleAdd} disabled={!code} className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Add
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
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Qtd Total</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-blue-600 uppercase tracking-wider" title="Qtd. Unit. SP">Unt. SP</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-orange-500 uppercase tracking-wider" title="Qtd. Unit. DF">Unt. DF</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider" title="Total Caixas">Caixas</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-blue-600 uppercase tracking-wider" title="Caixas SP">Cx. SP</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-orange-500 uppercase tracking-wider" title="Caixas DF">Cx. DF</th>
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
                  <td className="px-4 py-2.5 text-foreground max-w-[150px] truncate" title={prod.description}>{prod.description}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                    {editingId === prod.id ? (
                      <input
                        type="number"
                        defaultValue={prod.qtyUnit}
                        onBlur={(e) => handleInlineUpdate(prod, "qtyUnit", e.target.value)}
                        className="w-14 text-right rounded border border-input bg-background px-1 py-0.5 text-sm"
                        autoFocus
                      />
                    ) : prod.qtyUnit}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-blue-600">
                    {editingId === prod.id ? (
                      <input type="number" defaultValue={prod.qtyUnitSP} onBlur={(e) => handleInlineUpdate(prod, "qtyUnitSP", e.target.value)} className="w-12 text-right rounded border border-blue-600/40 text-blue-600 bg-background px-1 py-0.5 text-sm" />
                    ) : (prod.qtyUnitSP || "—")}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-orange-500">
                    {editingId === prod.id ? (
                      <input type="number" defaultValue={prod.qtyUnitDF} onBlur={(e) => handleInlineUpdate(prod, "qtyUnitDF", e.target.value)} className="w-12 text-right rounded border border-orange-500/40 text-orange-500 bg-background px-1 py-0.5 text-sm" />
                    ) : (prod.qtyUnitDF || "—")}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                    {editingId === prod.id ? (
                      <input
                        type="number"
                        defaultValue={prod.qtyBoxes}
                        onBlur={(e) => handleInlineUpdate(prod, "qtyBoxes", e.target.value)}
                        className="w-14 text-right rounded border border-input bg-background px-1 py-0.5 text-sm"
                      />
                    ) : prod.qtyBoxes}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-blue-600">
                    {editingId === prod.id ? (
                      <input type="number" defaultValue={prod.qtyBoxesSP} onBlur={(e) => handleInlineUpdate(prod, "qtyBoxesSP", e.target.value)} className="w-12 text-right rounded border border-blue-600/40 text-blue-600 bg-background px-1 py-0.5 text-sm" />
                    ) : (prod.qtyBoxesSP || "—")}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-orange-500">
                    {editingId === prod.id ? (
                      <input type="number" defaultValue={prod.qtyBoxesDF} onBlur={(e) => handleInlineUpdate(prod, "qtyBoxesDF", e.target.value)} className="w-12 text-right rounded border border-orange-500/40 text-orange-500 bg-background px-1 py-0.5 text-sm" />
                    ) : (prod.qtyBoxesDF || "—")}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {editingId === prod.id ? (
                      <input
                        type="number"
                        defaultValue={prod.qtyPerBox}
                        onBlur={(e) => handleInlineUpdate(prod, "qtyPerBox", e.target.value)}
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
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-blue-600">{totalQtyUnitSP}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-orange-500">{totalQtyUnitDF}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-foreground">{totalQtyBoxes}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-blue-600">{totalQtyBoxesSP}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-orange-500">{totalQtyBoxesDF}</td>
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
