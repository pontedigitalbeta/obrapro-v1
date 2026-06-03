import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Cliente, Empresa, Orcamento, OrcamentoItem } from "../types";

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

interface State {
  empresa: Empresa;
  clientes: Cliente[];
  orcamentos: Orcamento[];
  setEmpresa: (e: Empresa) => void;
  addCliente: (c: Omit<Cliente, "id" | "criadoEm">) => Cliente;
  updateCliente: (id: string, c: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  addOrcamento: (o: Omit<Orcamento, "id" | "numero" | "criadoEm" | "atualizadoEm">) => Orcamento;
  updateOrcamento: (id: string, o: Partial<Orcamento>) => void;
  deleteOrcamento: (id: string) => void;
  duplicateOrcamento: (id: string) => Orcamento | null;
}

const emptyEmpresa: Empresa = {
  nome: "",
  documento: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
  logoBase64: "",
  descricao: "",
  responsavel: "",
};

const nextNumero = (orcs: Orcamento[]) => {
  const max = orcs.reduce((m, o) => Math.max(m, parseInt(o.numero, 10) || 0), 0);
  return String(max + 1).padStart(4, "0");
};

// Per-user storage: data is namespaced by the currently signed-in user id.
const currentUserKey = () => {
  if (typeof window === "undefined") return "guest";
  return localStorage.getItem("obrapro:current-user") || "guest";
};

const userScopedStorage = createJSONStorage(() => ({
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`${name}::${currentUserKey()}`);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${name}::${currentUserKey()}`, value);
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${name}::${currentUserKey()}`);
  },
}));

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      empresa: emptyEmpresa,
      clientes: [],
      orcamentos: [],
      setEmpresa: (empresa) => set({ empresa }),
      addCliente: (c) => {
        const novo: Cliente = { ...c, id: uid(), criadoEm: now() };
        set((s) => ({ clientes: [novo, ...s.clientes] }));
        return novo;
      },
      updateCliente: (id, c) => set((s) => ({ clientes: s.clientes.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      deleteCliente: (id) => set((s) => ({ clientes: s.clientes.filter((x) => x.id !== id) })),
      addOrcamento: (o) => {
        const novo: Orcamento = { ...o, id: uid(), numero: nextNumero(get().orcamentos), criadoEm: now(), atualizadoEm: now() };
        set((s) => ({ orcamentos: [novo, ...s.orcamentos] }));
        return novo;
      },
      updateOrcamento: (id, o) =>
        set((s) => ({ orcamentos: s.orcamentos.map((x) => (x.id === id ? { ...x, ...o, atualizadoEm: now() } : x)) })),
      deleteOrcamento: (id) => set((s) => ({ orcamentos: s.orcamentos.filter((x) => x.id !== id) })),
      duplicateOrcamento: (id) => {
        const orig = get().orcamentos.find((x) => x.id === id);
        if (!orig) return null;
        const novo: Orcamento = {
          ...orig, id: uid(), numero: nextNumero(get().orcamentos),
          titulo: orig.titulo + " (cópia)", status: "rascunho",
          criadoEm: now(), atualizadoEm: now(),
        };
        set((s) => ({ orcamentos: [novo, ...s.orcamentos] }));
        return novo;
      },
    }),
    {
      name: "obrapro-store",
      version: 1,
      skipHydration: true,
      storage: userScopedStorage,
    }
  )
);

export const calcItemTotal = (i: OrcamentoItem) => i.quantidade * i.valorUnitario;
export const calcSubtotal = (itens: OrcamentoItem[]) => itens.reduce((s, i) => s + calcItemTotal(i), 0);
export const calcDesconto = (subtotal: number, tipo: "percentual" | "valor", v: number) =>
  tipo === "percentual" ? (subtotal * v) / 100 : v;
export const calcTotal = (o: Pick<Orcamento, "itens" | "descontoTipo" | "descontoValor">) => {
  const sub = calcSubtotal(o.itens);
  return Math.max(0, sub - calcDesconto(sub, o.descontoTipo, o.descontoValor));
};
export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
