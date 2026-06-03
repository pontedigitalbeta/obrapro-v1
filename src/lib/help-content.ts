import {
  Rocket,
  Users,
  FileText,
  ClipboardList,
  Wrench,
  ListChecks,
  Handshake,
  CheckCircle2,
  FileDown,
  MessageCircle,
  Tag,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export interface HelpTopic {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string[];
}

export const helpTopics: HelpTopic[] = [
  {
    id: "primeiros-passos",
    title: "Primeiros passos",
    icon: Rocket,
    content: [
      "Cadastre os dados da sua empresa em Configurações.",
      "Inclua nome, responsável, telefone, e-mail, cidade e estado.",
      "Envie a logo da sua empresa para aparecer nas propostas.",
      "Depois cadastre seus clientes e crie o primeiro orçamento.",
    ],
  },
  {
    id: "cadastrar-clientes",
    title: "Como cadastrar clientes",
    icon: Users,
    content: [
      "Acesse Clientes no menu lateral.",
      "Clique em Novo Cliente.",
      "Preencha nome, telefone, e-mail e endereço da obra.",
      "O endereço da obra pode ser usado automaticamente no orçamento.",
      "Salve o cadastro.",
    ],
  },
  {
    id: "criar-orcamento",
    title: "Como criar um orçamento",
    icon: FileText,
    content: [
      "Acesse Orçamentos.",
      "Clique em Novo Orçamento.",
      "Preencha as 5 etapas: cliente e obra, tipo de serviço, itens, condições e revisão.",
      "Ao final, salve, visualize, gere PDF ou envie pelo WhatsApp.",
    ],
  },
  {
    id: "etapa-1",
    title: "Etapa 1 — Cliente e obra",
    icon: ClipboardList,
    content: [
      "Selecione o cliente.",
      "Informe o título do orçamento.",
      "Confira o endereço da obra.",
      "Ajuste data e validade da proposta.",
      "Use um título simples, como “Reforma de cozinha” ou “Instalação elétrica”.",
    ],
  },
  {
    id: "etapa-2",
    title: "Etapa 2 — Tipo de serviço e escopo",
    icon: Wrench,
    content: [
      "Informe o tipo principal do serviço.",
      "Descreva claramente o que será executado.",
      "O escopo deve explicar ao cliente o que está sendo contratado.",
      "Evite descrições vagas.",
    ],
  },
  {
    id: "etapa-3",
    title: "Etapa 3 — Itens do orçamento",
    icon: ListChecks,
    content: [
      "Adicione mão de obra, materiais, equipamentos e outros custos.",
      "Para cada item, informe categoria, descrição, unidade, quantidade e valor unitário.",
      "O sistema calcula o total de cada item e o valor final.",
      "Use desconto em reais ou porcentagem quando necessário.",
    ],
  },
  {
    id: "etapa-4",
    title: "Etapa 4 — Condições comerciais",
    icon: Handshake,
    content: [
      "Informe prazo de execução.",
      "Informe forma de pagamento.",
      "Informe garantia.",
      "Descreva o que está incluso e o que não está incluso.",
      "Use observações finais para regras importantes da proposta.",
    ],
  },
  {
    id: "etapa-5",
    title: "Etapa 5 — Revisão final",
    icon: CheckCircle2,
    content: [
      "Confira cliente, título, endereço, tipo de serviço, prazo e forma de pagamento.",
      "Confira o valor total.",
      "Depois escolha: salvar rascunho, visualizar, gerar PDF ou enviar por WhatsApp.",
    ],
  },
  {
    id: "gerar-pdf",
    title: "Como gerar PDF",
    icon: FileDown,
    content: [
      "Abra o orçamento.",
      "Clique em Gerar PDF ou Visualizar proposta.",
      "Confira os dados antes de enviar.",
      "O PDF deve ser usado como documento profissional para o cliente.",
    ],
  },
  {
    id: "enviar-whatsapp",
    title: "Como enviar pelo WhatsApp",
    icon: MessageCircle,
    content: [
      "O cliente precisa ter telefone cadastrado.",
      "Clique no botão WhatsApp no orçamento.",
      "O sistema monta uma mensagem automática.",
      "Revise a mensagem antes de enviar.",
    ],
  },
  {
    id: "status",
    title: "Status dos orçamentos",
    icon: Tag,
    content: [
      "Rascunho: orçamento em edição.",
      "Enviado: orçamento enviado ao cliente.",
      "Aprovado: cliente confirmou.",
      "Recusado: cliente não aprovou ou orçamento foi cancelado.",
    ],
  },
  {
    id: "instalar-app",
    title: "Como instalar o ObraPro como app",
    icon: Smartphone,
    content: [
      "Use o botão Instalar ObraPro quando aparecer.",
      "No Android/Chrome, use o menu do navegador e toque em “Adicionar à tela inicial” ou “Instalar app”.",
      "No iPhone/Safari, toque em compartilhar e depois “Adicionar à Tela de Início”.",
    ],
  },
];

export const quickSteps: string[] = [
  "Cadastre os dados da empresa.",
  "Cadastre o cliente.",
  "Crie um novo orçamento.",
  "Adicione escopo e itens.",
  "Configure prazo, pagamento e garantia.",
  "Revise a proposta.",
  "Gere o PDF.",
  "Envie pelo WhatsApp.",
  "Atualize o status do orçamento.",
];

export interface FaqItem {
  q: string;
  a: string;
}

export const faqItems: FaqItem[] = [
  {
    q: "Preciso cadastrar o cliente antes de criar um orçamento?",
    a: "O ideal é cadastrar o cliente antes, pois o orçamento usa os dados do cliente, telefone e endereço da obra. Caso o cliente ainda não exista, acesse Clientes e faça o cadastro.",
  },
  {
    q: "Como o valor total é calculado?",
    a: "O sistema soma os itens do orçamento multiplicando quantidade por valor unitário e depois aplica o desconto, se houver.",
  },
  {
    q: "O PDF é enviado automaticamente?",
    a: "Não. O sistema gera o PDF ou abre a visualização da proposta. O usuário confere o documento e decide como enviar.",
  },
  {
    q: "Por que o WhatsApp não abriu?",
    a: "Verifique se o cliente possui telefone cadastrado. Também confira se o navegador permitiu abrir uma nova aba.",
  },
  {
    q: "Posso editar um orçamento depois de salvar?",
    a: "Sim. Acesse a lista de orçamentos, abra o menu de ações e escolha Editar.",
  },
  {
    q: "Qual status devo usar?",
    a: "Use Rascunho enquanto estiver editando, Enviado quando mandar ao cliente, Aprovado quando o cliente confirmar e Recusado quando o orçamento não for aceito.",
  },
  {
    q: "Os dados ficam salvos?",
    a: "Os dados são mantidos no sistema conforme a estrutura atual do app. Em versões futuras, a persistência pode ser conectada ao banco de dados.",
  },
];

export const fieldHelp = {
  wizard: {
    cliente: "Selecione o cliente que receberá a proposta. Cadastre clientes na tela Clientes.",
    titulo: "Use um nome simples para identificar o serviço, como Reforma da cozinha ou Pintura da fachada.",
    enderecoObra: "Endereço onde o serviço será executado. Pode vir do cadastro do cliente.",
    data: "Data de emissão da proposta.",
    validade: "Data limite até quando o valor e as condições comerciais serão mantidos.",
    tipoServico: "Informe a categoria principal do trabalho, como pintura, reforma, elétrica, hidráulica ou alvenaria.",
    descricaoEscopo: "Explique de forma clara o que será executado. Esse texto aparecerá na proposta.",
    categoria: "Classifique o item como mão de obra, material, equipamento ou outros.",
    descricao: "Descreva o serviço ou material que será cobrado.",
    unidade: "Use unidades como m², m, un, diária, hora ou serviço.",
    quantidade: "Informe a quantidade correspondente ao item.",
    valorUnitario: "Informe o preço por unidade. O total é calculado automaticamente.",
    desconto: "Você pode aplicar desconto em reais ou porcentagem.",
    valorFinal: "Valor total da proposta após soma dos itens e aplicação do desconto.",
    prazoExecucao: "Tempo estimado para realizar o serviço após aprovação e início da obra.",
    formaPagamento: "Informe entrada, parcelas ou condição combinada com o cliente.",
    garantia: "Informe se existe garantia e quais condições ela cobre.",
    incluso: "Liste os serviços, materiais ou etapas que fazem parte da proposta.",
    naoIncluso: "Liste itens que não estão no orçamento para evitar dúvidas futuras.",
    observacoesFinais: "Use para condições especiais, regras, restrições ou informações adicionais.",
    status: "Indica a situação atual do orçamento.",
    gerarPdf: "Cria a versão profissional da proposta para enviar ao cliente.",
    whatsapp: "Abre uma mensagem pronta para envio ao cliente.",
  },
  clientes: {
    nome: "Nome do cliente ou responsável pela obra.",
    telefone: "Use o número com DDD. Esse telefone será usado para envio via WhatsApp.",
    email: "Campo opcional para contato e registro.",
    enderecoObra: "Endereço onde o serviço será executado. Pode ser usado automaticamente no orçamento.",
    observacoes: "Use para detalhes internos sobre o cliente ou a obra.",
  },
  configuracoes: {
    nome: "Esse nome aparecerá nas propostas e PDFs.",
    documento: "Documento exibido nos dados da empresa, se preenchido.",
    responsavel: "Nome da pessoa responsável pela proposta.",
    telefone: "Contato que aparecerá na proposta e poderá ser usado pelo cliente.",
    email: "E-mail comercial exibido nos documentos.",
    cidade: "Cidade da empresa ou profissional.",
    estado: "UF da empresa ou profissional.",
    descricao: "Texto breve para apresentar sua empresa nas propostas.",
    logo: "Envie a logo da sua empresa para personalizar o documento gerado.",
  },
  orcamentosLista: {
    filtroStatus: "Filtre os orçamentos por rascunho, enviado, aprovado ou recusado.",
    filtroCliente: "Mostra apenas os orçamentos de um cliente específico.",
    pdf: "Gera o PDF profissional do orçamento.",
    whatsapp: "Abre o WhatsApp com uma mensagem pronta para o cliente.",
    acoes: "Use para visualizar, editar, duplicar ou excluir o orçamento.",
  },
  dashboard: {
    total: "Quantidade total de propostas cadastradas.",
    pendentes: "Orçamentos em rascunho ou enviados, aguardando decisão.",
    aprovados: "Orçamentos confirmados pelo cliente.",
    negociacao: "Soma dos valores dos orçamentos pendentes.",
  },
};
