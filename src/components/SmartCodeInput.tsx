import React, { useState, useRef, useEffect } from "react";
import { useProcessStore } from "@/stores/processStore";
import { cn } from "@/lib/utils";

interface ProductSearchResult {
  code: string;
  description: string;
  cubagem?: { x: number; y: number; z: number; peso?: string };
  lote?: string;
  qtyPerBox?: number;
}

interface SmartCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: ProductSearchResult) => void;
  placeholder?: string;
}

export function SmartCodeInput({ value, onChange, onSelect, placeholder = "Código do produto..." }: SmartCodeInputProps) {
  const searchProducts = useProcessStore((state) => state.searchProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const found = searchProducts(value);
      setResults(found);
      setIsOpen(found.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        onFocus={() => value.length >= 2 && results.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-mono tracking-body ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[400px] rounded-md border border-border bg-card shadow-elevated">
          <div className="max-h-60 overflow-auto p-1">
            {results.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
              >
                <span className="font-mono font-semibold text-primary">{item.code}</span>
                <span className="truncate text-foreground">{item.description}</span>
                {item.lote && <span className="ml-auto text-xs text-muted-foreground">Lote: {item.lote}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
