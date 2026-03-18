import { Process, Product, ProcessStatus } from "@/types/process";

// Mock product database (simulating "Estoque 1" sheet)
export const productDatabase: Record<string, {
  description: string;
  cubagem?: { comprimento: number; largura: number; altura: number; volume: number };
  lote?: string;
  qtyPerBox?: number;
}> = {
  "PRD-001": { description: "PARAFUSO SEXT. M10x30 GALV.", cubagem: { comprimento: 30, largura: 20, altura: 15, volume: 9000 }, lote: "L2024-A1", qtyPerBox: 100 },
  "PRD-002": { description: "ARRUELA LISA 3/8\" INOX 304", cubagem: { comprimento: 25, largura: 20, altura: 10, volume: 5000 }, lote: "L2024-A2", qtyPerBox: 500 },
  "PRD-003": { description: "PORCA SEXT. M8 CLASSE 8.8", cubagem: { comprimento: 20, largura: 15, altura: 12, volume: 3600 }, lote: "L2024-B1", qtyPerBox: 200 },
  "PRD-004": { description: "BARRA ROSCADA M12 x 1000mm", cubagem: { comprimento: 100, largura: 10, altura: 10, volume: 10000 }, lote: "L2024-B2", qtyPerBox: 10 },
  "PRD-005": { description: "CHAPA AÇO CARB. #18 1200x2400", lote: "L2024-C1", qtyPerBox: 1 },
  "PRD-006": { description: "TUBO GALV. 1\" x 6000mm", cubagem: { comprimento: 600, largura: 5, altura: 5, volume: 15000 }, lote: "L2024-C2", qtyPerBox: 6 },
  "PRD-007": { description: "PERFIL U 3\" x 6000mm", lote: "L2024-D1", qtyPerBox: 4 },
  "PRD-008": { description: "ELETRODO E6013 3.25mm", cubagem: { comprimento: 40, largura: 8, altura: 8, volume: 2560 }, lote: "L2024-D2", qtyPerBox: 50 },
  "PRD-009": { description: "DISCO CORTE 7\" x 1/8\"", cubagem: { comprimento: 20, largura: 20, altura: 15, volume: 6000 }, lote: "L2024-E1", qtyPerBox: 25 },
  "PRD-010": { description: "FLANGE CEGO 4\" #150 ANSI", cubagem: { comprimento: 15, largura: 15, altura: 5, volume: 1125 }, lote: "L2024-E2", qtyPerBox: 8 },
};

// Mock processes
export const mockProcesses: Process[] = [
  {
    id: "1",
    name: "Carga Galpão Norte",
    code: "CTX-9942",
    date: "2024-05-24",
    type: "loading",
    status: "active",
    products: [
      { id: "p1", code: "PRD-001", description: "PARAFUSO SEXT. M10x30 GALV.", qtyUnit: 500, qtyBoxes: 5, qtyPerBox: 100, cubagem: { comprimento: 30, largura: 20, altura: 15, volume: 9000 }, lote: "L2024-A1", isManual: false, isOverridden: false },
      { id: "p2", code: "PRD-003", description: "PORCA SEXT. M8 CLASSE 8.8", qtyUnit: 1000, qtyBoxes: 5, qtyPerBox: 200, cubagem: { comprimento: 20, largura: 15, altura: 12, volume: 3600 }, lote: "L2024-B1", isManual: false, isOverridden: false },
    ],
    createdAt: "2024-05-24T08:00:00Z",
  },
  {
    id: "2",
    name: "Descarga Container 12",
    code: "CTX-9943",
    date: "2024-05-25",
    type: "unloading",
    status: "completed",
    products: [
      { id: "p3", code: "PRD-006", description: "TUBO GALV. 1\" x 6000mm", qtyUnit: 60, qtyBoxes: 10, qtyPerBox: 6, cubagem: { comprimento: 600, largura: 5, altura: 5, volume: 15000 }, lote: "L2024-C2", isManual: false, isOverridden: false },
    ],
    createdAt: "2024-05-25T10:30:00Z",
  },
  {
    id: "3",
    name: "Carga Exportação SP",
    code: "CTX-9944",
    date: "2024-05-26",
    type: "loading",
    status: "active",
    products: [],
    createdAt: "2024-05-26T07:15:00Z",
  },
];

export function searchProducts(query: string) {
  const q = query.toUpperCase();
  return Object.entries(productDatabase)
    .filter(([code, data]) => code.includes(q) || data.description.includes(q))
    .map(([code, data]) => ({ code, ...data }));
}
