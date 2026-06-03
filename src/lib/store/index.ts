import { create } from "zustand";
import { persist } from "zustand/middleware";
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

const seedEmpresa: Empresa = {
  nome: "ObraPro Construções",
  documento: "12.345.678/0001-90",
  telefone: "11999998888",
  email: "contato@obrapro.com.br",
  cidade: "São Paulo",
  estado: "SP",
  logoBase64: "",
  descricao: "Especialistas em reformas residenciais e comerciais com mais de 10 anos de experiência.",
  responsavel: "Carlos Oliveira",
};

const c1 = uid();
const c2 = uid();
const c3 = uid();

const seedClientes: Cliente[] = [
  { id: c1, nome: "Mariana Souza", telefone: "11988887777", email: "mariana@email.com", enderecoObra: "Rua das Acácias, 120 — Vila Mariana, SP", observacoes: "Reforma da cozinha e sala.", criadoEm: now() },
  { id: c2, nome: "Roberto Almeida", telefone: "11977776666", email: "roberto@email.com", enderecoObra: "Av. Paulista, 1500, apto 802", observacoes: "", criadoEm: now() },
  { id: c3, nome: "Construtora Lima", telefone: "11966665555", email: "obras@construtoralima.com", enderecoObra: "Rua dos Pinheiros, 88", observacoes: "Cliente recorrente, ótimo pagador.", criadoEm: now() },
];

const mkItem = (categoria: OrcamentoItem["categoria"], descricao: string, unidade: string, quantidade: number, valorUnitario: number): OrcamentoItem => ({
  id: uid(), categoria, descricao, unidade, quantidade, valorUnitario,
});

const seedOrcamentos: Orcamento[] = [
  {
    id: uid(), numero: "0001", clienteId: c1, titulo: "Reforma de cozinha e sala",
    enderecoObra: "Rua das Acácias, 120 — Vila Mariana, SP", tipoServico: "Reforma residencial",
    data: now(), validade: new Date(Date.now() + 15 * 86400000).toISOString(),
    descricaoEscopo: "Demolição de parede entre cozinha e sala, instalação de bancada em granito, pintura completa, troca de revestimento cerâmico e instalações elétricas.",
    itens: [
      mkItem("mao_de_obra", "Demolição e remoção de entulho", "m²", 18, 95),
      mkItem("mao_de_obra", "Mão de obra de pedreiro", "diária", 12, 350),
      mkItem("material", "Cimento CPII", "saco 50kg", 20, 42),
      mkItem("material", "Revestimento cerâmico", "m²", 35, 89),
      mkItem("equipamento", "Locação de andaime", "diária", 5, 80),
    ],
    descontoTipo: "valor", descontoValor: 500,
    prazoExecucao: "30 dias úteis", formaPagamento: "30% entrada, 40% no meio da obra, 30% na entrega",
    garantia: "12 meses para mão de obra; garantia de fábrica para materiais.",
    incluso: "Mão de obra, materiais listados, limpeza final, ART.",
    naoIncluso: "Móveis planejados, eletrodomésticos, iluminação decorativa.",
    observacoesFinais: "Cliente forneceu medidas conferidas em visita técnica.",
    status: "enviado", criadoEm: now(), atualizadoEm: now(),
  },
  {
    id: uid(), numero: "0002", clienteId: c2, titulo: "Pintura apartamento",
    enderecoObra: "Av. Paulista, 1500, apto 802", tipoServico: "Pintura interna",
    data: now(), validade: new Date(Date.now() + 10 * 86400000).toISOString(),
    descricaoEscopo: "Pintura de todas as paredes e teto do apartamento de 90m², com massa corrida e duas demãos de tinta acrílica.",
    itens: [
      mkItem("mao_de_obra", "Aplicação de massa e pintura", "m²", 240, 28),
      mkItem("material", "Tinta acrílica premium", "lata 18L", 6, 320),
      mkItem("material", "Massa corrida", "balde 25kg", 3, 95),
    ],
    descontoTipo: "percentual", descontoValor: 5,
    prazoExecucao: "10 dias úteis", formaPagamento: "50% entrada, 50% na entrega",
    garantia: "6 meses contra descascamento.", incluso: "Proteção de móveis, tintas, mão de obra.",
    naoIncluso: "Texturas decorativas.", observacoesFinais: "",
    status: "aprovado", criadoEm: now(), atualizadoEm: now(),
  },
  {
    id: uid(), numero: "0003", clienteId: c3, titulo: "Construção de muro",
    enderecoObra: "Rua dos Pinheiros, 88", tipoServico: "Alvenaria",
    data: now(), validade: new Date(Date.now() + 20 * 86400000).toISOString(),
    descricaoEscopo: "Construção de muro de 25 metros lineares com 2,2m de altura, em blocos de concreto e acabamento chapiscado.",
    itens: [
      mkItem("mao_de_obra", "Pedreiro e servente", "diária", 16, 420),
      mkItem("material", "Bloco de concreto", "milheiro", 2, 1850),
      mkItem("material", "Areia média", "m³", 8, 110),
    ],
    descontoTipo: "valor", descontoValor: 0,
    prazoExecucao: "15 dias úteis", formaPagamento: "À combinar",
    garantia: "5 anos estruturais.", incluso: "Material e mão de obra.",
    naoIncluso: "Portão.", observacoesFinais: "",
    status: "rascunho", criadoEm: now(), atualizadoEm: now(),
  },
  {
    id: uid(), numero: "0004", clienteId: c1, titulo: "Reforma banheiro suíte",
    enderecoObra: "Rua das Acácias, 120", tipoServico: "Reforma de banheiro",
    data: now(), validade: new Date(Date.now() + 7 * 86400000).toISOString(),
    descricaoEscopo: "Troca completa de revestimentos, louças e metais do banheiro da suíte.",
    itens: [
      mkItem("mao_de_obra", "Reforma completa", "verba", 1, 6800),
      mkItem("material", "Porcelanato 60x60", "m²", 18, 145),
    ],
    descontoTipo: "valor", descontoValor: 0,
    prazoExecucao: "20 dias úteis", formaPagamento: "Parcelado em 3x",
    garantia: "12 meses.", incluso: "Mão de obra e materiais.", naoIncluso: "Box e espelho.",
    observacoesFinais: "",
    status: "recusado", criadoEm: now(), atualizadoEm: now(),
  },
];

const nextNumero = (orcs: Orcamento[]) => {
  const max = orcs.reduce((m, o) => Math.max(m, parseInt(o.numero, 10) || 0), 0);
  return String(max + 1).padStart(4, "0");
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      empresa: seedEmpresa,
      clientes: seedClientes,
      orcamentos: seedOrcamentos,
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
    { name: "obrapro-store", version: 1 }
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
