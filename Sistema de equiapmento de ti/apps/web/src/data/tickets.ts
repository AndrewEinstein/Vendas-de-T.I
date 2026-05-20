export type TicketPriority = "Baixa" | "Media" | "Alta";
export type TicketStatus = "Aberto" | "Em andamento" | "Resolvido";

export type Ticket = {
  numero: number;
  solicitante: string;
  empresa: string;
  categoria: string;
  prioridade: TicketPriority;
  status: TicketStatus;
  abertura: string;
  canal: "Portal" | "WhatsApp" | "Telefone" | "E-mail";
  setor: string;
  responsavel: string;
  slaHoras: number;
  descricao: string;
  observacoes: string;
  ultimaAtualizacao: string;
};

export const criticalCategories = ["Dashboard", "Vendas", "Estoque", "Produtos", "Lojas", "CRM", "Usuarios", "Relatorios", "Auditoria"];
export const simpleCategories = ["Chamados", "Login", "Sessao", "Permissoes", "Interface"];

export const initialTickets: Ticket[] = [
  { numero: 101, solicitante: "Ana Lima", empresa: "Nordeste Logistica", categoria: "Dashboard", prioridade: "Baixa", status: "Aberto", abertura: "2026-05-02", canal: "Portal", setor: "Financeiro", responsavel: "Equipe N1", slaHoras: 2, descricao: "Falha na visualização do dashboard.", observacoes: "Impacta a leitura de indicadores.", ultimaAtualizacao: "2026-05-02 08:40" },
  { numero: 102, solicitante: "Bruno Silva", empresa: "Studio Pixel", categoria: "Vendas", prioridade: "Alta", status: "Aberto", abertura: "2026-05-02", canal: "WhatsApp", setor: "Design", responsavel: "Equipe N1", slaHoras: 24, descricao: "Pedido nao carrega no modulo de vendas.", observacoes: "Fluxo comercial travado.", ultimaAtualizacao: "2026-05-02 09:10" },
  { numero: 103, solicitante: "Carla Souza", empresa: "Comercial Alfa", categoria: "Estoque", prioridade: "Baixa", status: "Aberto", abertura: "2026-05-03", canal: "Telefone", setor: "Operacoes", responsavel: "Equipe N2", slaHoras: 4, descricao: "Estoque nao atualiza entre lojas.", observacoes: "Precisa de escalonamento imediato.", ultimaAtualizacao: "2026-05-03 10:25" },
  { numero: 104, solicitante: "Diego Alves", empresa: "Loja Centro", categoria: "Produtos", prioridade: "Alta", status: "Em andamento", abertura: "2026-05-03", canal: "Portal", setor: "Vendas", responsavel: "Equipe N1", slaHoras: 24, descricao: "Cadastro de produtos com erro.", observacoes: "Prioridade acima do necessario.", ultimaAtualizacao: "2026-05-03 15:42" },
  { numero: 105, solicitante: "Elaine Costa", empresa: "Financeira Alfa", categoria: "Lojas", prioridade: "Baixa", status: "Aberto", abertura: "2026-05-04", canal: "E-mail", setor: "Financeiro", responsavel: "Equipe N2", slaHoras: 2, descricao: "Loja sem exibição correta no painel.", observacoes: "Bloqueia fechamento do dia.", ultimaAtualizacao: "2026-05-04 07:55" },
  { numero: 106, solicitante: "Fabio Lima", empresa: "Mega Print", categoria: "CRM", prioridade: "Alta", status: "Resolvido", abertura: "2026-05-04", canal: "Telefone", setor: "Administrativo", responsavel: "Equipe N1", slaHoras: 24, descricao: "Erro na tela de cliente.", observacoes: "Resolvido sem necessidade de alta.", ultimaAtualizacao: "2026-05-04 11:20" },
  { numero: 107, solicitante: "Gabi Nunes", empresa: "Tech Center", categoria: "Usuarios", prioridade: "Baixa", status: "Aberto", abertura: "2026-05-04", canal: "WhatsApp", setor: "RH", responsavel: "Equipe N2", slaHoras: 4, descricao: "Permissoes de usuarios não aparecem.", observacoes: "Requer ajuste de credenciais.", ultimaAtualizacao: "2026-05-04 12:33" },
  { numero: 108, solicitante: "Henrique Melo", empresa: "Comercial Hub", categoria: "Relatorios", prioridade: "Alta", status: "Aberto", abertura: "2026-05-05", canal: "Portal", setor: "Suporte", responsavel: "Equipe N1", slaHoras: 48, descricao: "Relatorio mensal nao gera.", observacoes: "Classificacao acima da gravidade.", ultimaAtualizacao: "2026-05-05 08:15" },
  { numero: 109, solicitante: "Iara Rocha", empresa: "Secure Data", categoria: "Auditoria", prioridade: "Baixa", status: "Aberto", abertura: "2026-05-05", canal: "Telefone", setor: "TI", responsavel: "Equipe N3", slaHoras: 1, descricao: "Auditoria nao registra acao.", observacoes: "Chamado critico com risco alto.", ultimaAtualizacao: "2026-05-05 09:05" },
  { numero: 110, solicitante: "Joao Pedro", empresa: "Oficina X", categoria: "Chamados", prioridade: "Alta", status: "Aberto", abertura: "2026-05-05", canal: "Portal", setor: "Operacoes", responsavel: "Equipe N1", slaHoras: 24, descricao: "Abertura de chamados trava no envio.", observacoes: "Deve ser reclassificado para baixa.", ultimaAtualizacao: "2026-05-05 13:17" },
  { numero: 111, solicitante: "Karen Dias", empresa: "Rede Max", categoria: "Login", prioridade: "Alta", status: "Em andamento", abertura: "2026-05-06", canal: "E-mail", setor: "Comercial", responsavel: "Equipe N3", slaHoras: 2, descricao: "Sem acesso ao sistema.", observacoes: "Um dos chamados mais criticos.", ultimaAtualizacao: "2026-05-06 08:02" },
  { numero: 112, solicitante: "Lucas Prado", empresa: "CallTech", categoria: "Sessao", prioridade: "Alta", status: "Aberto", abertura: "2026-05-06", canal: "WhatsApp", setor: "Suporte", responsavel: "Equipe N1", slaHoras: 24, descricao: "Sessao expira com erro.", observacoes: "Baixo impacto operacional.", ultimaAtualizacao: "2026-05-06 09:44" },
  { numero: 113, solicitante: "Maria Eduarda", empresa: "Comercial Alfa", categoria: "Permissoes", prioridade: "Alta", status: "Resolvido", abertura: "2026-05-06", canal: "Portal", setor: "Financeiro", responsavel: "Equipe N3", slaHoras: 2, descricao: "Falha nas permissoes do usuario.", observacoes: "Resolvido com ajuste de acesso.", ultimaAtualizacao: "2026-05-06 11:28" },
  { numero: 114, solicitante: "Nicolas Azevedo", empresa: "Escola Nova", categoria: "Interface", prioridade: "Alta", status: "Aberto", abertura: "2026-05-06", canal: "Telefone", setor: "Administrativo", responsavel: "Equipe N1", slaHoras: 48, descricao: "Dificuldade de uso na interface.", observacoes: "Atendimento pode ser agendado.", ultimaAtualizacao: "2026-05-06 14:50" },
  { numero: 115, solicitante: "Olivia Fernandes", empresa: "Loja Centro", categoria: "Vendas", prioridade: "Media", status: "Aberto", abertura: "2026-05-07", canal: "Portal", setor: "Vendas", responsavel: "Equipe N2", slaHoras: 4, descricao: "Modulo de vendas com lentidao.", observacoes: "Revisar como media-alta conforme impacto.", ultimaAtualizacao: "2026-05-07 08:10" },
  { numero: 116, solicitante: "Paulo Henrique", empresa: "Mega Print", categoria: "Dashboard", prioridade: "Baixa", status: "Aberto", abertura: "2026-05-07", canal: "E-mail", setor: "Administrativo", responsavel: "Equipe N1", slaHoras: 24, descricao: "Indicadores nao carregam na dashboard.", observacoes: "Baixa prioridade coerente com a categoria.", ultimaAtualizacao: "2026-05-07 09:30" }
];

export function isCritical(category: string) {
  return criticalCategories.includes(category);
}

export function isSimple(category: string) {
  return simpleCategories.includes(category);
}

export function suggestPriority(category: string, current: TicketPriority): TicketPriority {
  if (isCritical(category) && current === "Baixa") return "Alta";
  if (isSimple(category) && current === "Alta") return "Baixa";
  if (isCritical(category) && current === "Media") return "Alta";
  if (isSimple(category) && current === "Media") return "Baixa";
  return current;
}

export function needsReview(ticket: Ticket) {
  const criticalLow = isCritical(ticket.categoria) && ticket.prioridade === "Baixa";
  const simpleHigh = isSimple(ticket.categoria) && ticket.prioridade === "Alta";
  const openMismatch = ticket.status === "Aberto" && ((isCritical(ticket.categoria) && ticket.prioridade === "Baixa") || (isSimple(ticket.categoria) && ticket.prioridade === "Alta"));
  return criticalLow || simpleHigh || openMismatch;
}
