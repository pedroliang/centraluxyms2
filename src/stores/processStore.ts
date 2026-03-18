import { create } from "zustand";
import { Process, Product } from "@/types/process";
import { mockProcesses } from "@/data/mockData";

interface ProcessStore {
  processes: Process[];
  addProcess: (process: Process) => void;
  updateProcess: (id: string, data: Partial<Process>) => void;
  deleteProcess: (id: string) => void;
  addProduct: (processId: string, product: Product) => void;
  updateProduct: (processId: string, productId: string, data: Partial<Product>) => void;
  removeProduct: (processId: string, productId: string) => void;
}

export const useProcessStore = create<ProcessStore>((set) => ({
  processes: mockProcesses,
  addProcess: (process) =>
    set((state) => ({ processes: [...state.processes, process] })),
  updateProcess: (id, data) =>
    set((state) => ({
      processes: state.processes.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
  deleteProcess: (id) =>
    set((state) => ({ processes: state.processes.filter((p) => p.id !== id) })),
  addProduct: (processId, product) =>
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === processId ? { ...p, products: [...p.products, product] } : p
      ),
    })),
  updateProduct: (processId, productId, data) =>
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === processId
          ? { ...p, products: p.products.map((prod) => (prod.id === productId ? { ...prod, ...data } : prod)) }
          : p
      ),
    })),
  removeProduct: (processId, productId) =>
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === processId
          ? { ...p, products: p.products.filter((prod) => prod.id !== productId) }
          : p
      ),
    })),
}));
