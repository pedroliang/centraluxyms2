import { create } from "zustand";
import { Process, Product } from "@/types/process";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner"; // Usando a biblioteca já configurada em App.tsx

interface ProcessStore {
  processes: Process[];
  isLoading: boolean;
  fetchProcesses: () => Promise<void>;
  addProcess: (process: Process) => Promise<void>;
  updateProcess: (id: string, data: Partial<Process>) => Promise<void>;
  deleteProcess: (id: string) => Promise<void>;
  addProduct: (processId: string, product: Product) => Promise<void>;
  updateProduct: (processId: string, productId: string, data: Partial<Product>) => Promise<void>;
  removeProduct: (processId: string, productId: string) => Promise<void>;
}

export const useProcessStore = create<ProcessStore>((set, get) => ({
  processes: [],
  isLoading: false,

  fetchProcesses: async () => {
    set({ isLoading: true });
    const { data: processesData, error: processError } = await supabase
      .from("processes")
      .select("*")
      .order("created_at", { ascending: false });

    if (processError) {
      toast.error("Erro ao carregar processos: " + processError.message);
      set({ isLoading: false });
      return;
    }

    const { data: productsData, error: productError } = await supabase
      .from("products")
      .select("*");

    if (productError) {
      toast.error("Erro ao carregar produtos: " + productError.message);
      set({ isLoading: false });
      return;
    }

    // Map database shape to our frontend types
    const mappedProcesses: Process[] = processesData.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      date: p.date,
      type: p.type,
      status: p.status,
      createdAt: p.created_at,
      products: productsData
        .filter((prod) => prod.process_id === p.id)
        .map((prod) => ({
          id: prod.id,
          code: prod.code,
          description: prod.description,
          qtyUnit: prod.qty_unit,
          qtyBoxes: prod.qty_boxes,
          qtyPerBox: prod.qty_per_box,
          cubagem: prod.cubagem,
          lote: prod.lote,
          isManual: prod.is_manual,
          isOverridden: prod.is_overridden,
        })),
    }));

    set({ processes: mappedProcesses, isLoading: false });
  },

  addProcess: async (process) => {
    // Optimistic UI update
    set((state) => ({ processes: [process, ...state.processes] }));
    
    const { error } = await supabase.from("processes").insert([{
      id: process.id,
      name: process.name,
      code: process.code,
      date: process.date,
      type: process.type,
      status: process.status,
    }]);

    if (error) {
      toast.error("Erro ao salvar processo: " + error.message);
      get().fetchProcesses(); // Rollback
    }
  },

  updateProcess: async (id, data) => {
    set((state) => ({
      processes: state.processes.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));

    const { error } = await supabase.from("processes").update(data).match({ id });
    if (error) {
      toast.error("Erro ao atualizar: " + error.message);
      get().fetchProcesses();
    }
  },

  deleteProcess: async (id) => {
    set((state) => ({ processes: state.processes.filter((p) => p.id !== id) }));
    
    // As in db we have ON DELETE CASCADE for products
    const { error } = await supabase.from("processes").delete().match({ id });
    if (error) {
      toast.error("Erro ao remover: " + error.message);
      get().fetchProcesses();
    }
  },

  addProduct: async (processId, product) => {
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === processId ? { ...p, products: [...p.products, product] } : p
      ),
    }));

    const { error } = await supabase.from("products").insert([{
      id: product.id,
      process_id: processId,
      code: product.code,
      description: product.description,
      qty_unit: product.qtyUnit,
      qty_boxes: product.qtyBoxes,
      qty_per_box: product.qtyPerBox,
      cubagem: product.cubagem || null,
      lote: product.lote || null,
      is_manual: product.isManual,
      is_overridden: product.isOverridden,
    }]);

    if (error) {
      toast.error("Erro ao adicionar produto: " + error.message);
      get().fetchProcesses();
    }
  },

  updateProduct: async (processId, productId, data) => {
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === processId
          ? { ...p, products: p.products.map((prod) => (prod.id === productId ? { ...prod, ...data } : prod)) }
          : p
      ),
    }));

    const dbData: Record<string, any> = {};
    if (data.qtyUnit !== undefined) dbData.qty_unit = data.qtyUnit;
    if (data.qtyBoxes !== undefined) dbData.qty_boxes = data.qtyBoxes;
    if (data.qtyPerBox !== undefined) dbData.qty_per_box = data.qtyPerBox;
    if (data.cubagem !== undefined) dbData.cubagem = data.cubagem;
    if (data.lote !== undefined) dbData.lote = data.lote;
    if (data.isManual !== undefined) dbData.is_manual = data.isManual;
    if (data.isOverridden !== undefined) dbData.is_overridden = data.isOverridden;
    if (data.description !== undefined) dbData.description = data.description;

    const { error } = await supabase.from("products").update(dbData).match({ id: productId });
    if (error) {
      toast.error("Erro ao atualizar produto: " + error.message);
      get().fetchProcesses();
    }
  },

  removeProduct: async (processId, productId) => {
    set((state) => ({
      processes: state.processes.map((p) =>
        p.id === processId
          ? { ...p, products: p.products.filter((prod) => prod.id !== productId) }
          : p
      ),
    }));

    const { error } = await supabase.from("products").delete().match({ id: productId });
    if (error) {
      toast.error("Erro ao remover produto: " + error.message);
      get().fetchProcesses();
    }
  },
}));
