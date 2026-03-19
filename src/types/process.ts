export type ProcessStatus = "active" | "completed" | "cancelled";
export type ProcessType = "loading" | "unloading";

export interface Cubagem {
  comprimento: number;
  largura: number;
  altura: number;
  volume: number;
}

export interface Product {
  id: string;
  code: string;
  description: string;
  qtyUnit: number;
  qtyBoxes: number;
  qtyPerBox: number;
  qtyUnitSP?: number;
  qtyUnitDF?: number;
  qtyBoxesSP?: number;
  qtyBoxesDF?: number;
  cubagem?: Cubagem;
  lote?: string;
  isManual: boolean;
  isOverridden: boolean;
}

export interface Process {
  id: string;
  name: string;
  code: string;
  date: string;
  type: ProcessType;
  status: ProcessStatus;
  origin: string;
  destination: string;
  cliente?: string;
  products: Product[];
  createdAt: string;
}
