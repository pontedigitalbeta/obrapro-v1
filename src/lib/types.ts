export type OrcamentoStatus = "rascunho" | "enviado" | "aprovado" | "recusado";

export type ItemCategoria = "mao_de_obra" | "material" | "equipamento" | "outros";

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  enderecoObra: string;
  observacoes: string;
  criadoEm: string;
}

export interface OrcamentoItem {
  id: string;
  categoria: ItemCategoria;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
}

export interface Orcamento {
  id: string;
  numero: string;
  clienteId: string;
  titulo: string;
  enderecoObra: string;
  tipoServico: string;
  data: string;
  validade: string;
  descricaoEscopo: string;
  itens: OrcamentoItem[];
  descontoTipo: "percentual" | "valor";
  descontoValor: number;
  prazoExecucao: string;
  formaPagamento: string;
  garantia: string;
  incluso: string;
  naoIncluso: string;
  observacoesFinais: string;
  status: OrcamentoStatus;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Empresa {
  nome: string;
  documento: string; // CPF/CNPJ
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  logoBase64: string;
  descricao: string;
  responsavel: string;
}

export const CATEGORIA_LABELS: Record<ItemCategoria, string> = {
  mao_de_obra: "Mão de obra",
  material: "Material",
  equipamento: "Equipamento",
  outros: "Outros",
};

export const STATUS_LABELS: Record<OrcamentoStatus, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
};
