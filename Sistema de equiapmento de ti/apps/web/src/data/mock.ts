export const stats = [
  { label: "Vendas hoje", value: "R$ 18.940", delta: "+12,4%", tone: "green" },
  { label: "Faturamento mensal", value: "R$ 482.710", delta: "+8,1%", tone: "blue" },
  { label: "Produtos em baixo estoque", value: "14", delta: "5 criticos", tone: "amber" },
  { label: "Clientes cadastrados", value: "2.846", delta: "+36 semana", tone: "violet" }
];

export const salesPerformance = [
  { name: "Jan", presencial: 118, online: 72 },
  { name: "Fev", presencial: 132, online: 86 },
  { name: "Mar", presencial: 146, online: 93 },
  { name: "Abr", presencial: 158, online: 112 },
  { name: "Mai", presencial: 171, online: 126 },
  { name: "Jun", presencial: 184, online: 142 }
];

export const topProducts = [
  { produto: "Notebook Dell Latitude 5420", vendas: 84, receita: "R$ 394.716" },
  { produto: "SSD Kingston NV2 1TB", vendas: 132, receita: "R$ 52.668" },
  { produto: "Mouse Logitech MX Master", vendas: 98, receita: "R$ 53.802" },
  { produto: "Monitor LG UltraWide 29", vendas: 41, receita: "R$ 61.459" }
];

export const products = Array.from({ length: 100 }, (_, index) => {
  const base = index + 1;
  const catalogue = [
    { prefix: "NB", categoria: "Notebooks", marca: "Dell", name: "Notebook Dell Latitude", price: 4699, margin: 38 },
    { prefix: "PC", categoria: "Computadores", marca: "TechPro", name: "PC Gamer Ryzen", price: 6899, margin: 31 },
    { prefix: "PER", categoria: "Perifericos", marca: "Logitech", name: "Mouse Logitech MX", price: 549, margin: 52 },
    { prefix: "SSD", categoria: "Pecas", marca: "Kingston", name: "SSD Kingston NV2", price: 399, margin: 28 },
    { prefix: "MON", categoria: "Monitores", marca: "LG", name: "Monitor LG UltraWide", price: 1459, margin: 26 },
    { prefix: "NOTE", categoria: "Notebooks", marca: "Lenovo", name: "Notebook Lenovo ThinkPad", price: 5299, margin: 34 },
    { prefix: "HEAD", categoria: "Perifericos", marca: "JBL", name: "Headset JBL Quantum", price: 399, margin: 44 },
    { prefix: "CAM", categoria: "Perifericos", marca: "Logitech", name: "Webcam Full HD", price: 289, margin: 47 }
  ];
  const item = catalogue[index % catalogue.length];
  const variant = String(Math.ceil((index + 1) / catalogue.length)).padStart(2, "0");
  const price = item.price + (index % 7) * 73;
  const margin = item.margin + (index % 5);
  return {
    sku: `${item.prefix}-${variant}-${String(base).padStart(3, "0")}`,
    produto: `${item.name} ${variant}`,
    categoria: item.categoria,
    marca: item.marca,
    preco: `R$ ${price.toLocaleString("pt-BR")}`,
    margem: `${margin}%`,
    status: index % 11 === 0 ? "Indisponivel" : "Ativo"
  };
});

export const stock = [
  { loja: "Matriz Tech Center", sku: "NB-DELL-5420-I5", produto: "Notebook Dell Latitude 5420", qtd: 8, minimo: 3, status: "OK" },
  { loja: "Matriz Tech Center", sku: "SSD-KING-NV2-1TB", produto: "SSD Kingston NV2 1TB", qtd: 6, minimo: 10, status: "Baixo" },
  { loja: "Filial Games", sku: "PER-LOGI-MX-MASTER", produto: "Mouse Logitech MX Master", qtd: 4, minimo: 8, status: "Baixo" },
  { loja: "Filial Games", sku: "PC-GAMER-R5-4060", produto: "PC Gamer Ryzen 5 RTX 4060", qtd: 2, minimo: 2, status: "OK" }
];

export const sales = [
  { id: "VD-1048", cliente: "Studio Pixel", vendedor: "Lucas", canal: "Presencial", total: "R$ 5.248", status: "Paga" },
  { id: "OR-2381", cliente: "Comercial Alfa", vendedor: "Marina", canal: "Online", total: "R$ 23.495", status: "Aberta" },
  { id: "VD-1047", cliente: "Studio Pixel", vendedor: "Lucas", canal: "Presencial", total: "R$ 1.947", status: "Entregue" },
  { id: "VD-1046", cliente: "Fernando Lima", vendedor: "Rafael", canal: "Online", total: "R$ 399", status: "Cancelada" }
];

export const customers = [
  { nome: "Studio Pixel", documento: "34.567.890/0001-10", telefone: "(65) 97777-5522", compras: 12, funil: "Ganha" },
  { nome: "Comercial Alfa", documento: "12.345.678/0001-99", telefone: "(65) 98888-1234", compras: 2, funil: "Negociacao" },
  { nome: "Rede Norte", documento: "45.678.901/0001-22", telefone: "(65) 96666-1010", compras: 5, funil: "Proposta" }
];

export const users = [
  { nome: "Administrador", email: "admin@informatica.local", perfil: "Administrador", loja: "Matriz", ultimoAcesso: "Hoje, 09:11" },
  { nome: "Lucas Vendedor", email: "vendas@informatica.local", perfil: "Vendedor", loja: "Matriz", ultimoAcesso: "Hoje, 08:42" },
  { nome: "Rafael Estoque", email: "estoque@informatica.local", perfil: "Estoquista", loja: "Filial", ultimoAcesso: "Ontem, 17:20" }
];

export const stores = [
  { loja: "Matriz Tech Center", cnpj: "12.345.678/0001-99", cidade: "Cuiaba", responsavel: "Marina Oliveira", vendedores: 8 },
  { loja: "Filial Games e Perifericos", cnpj: "12.345.678/0002-70", cidade: "Varzea Grande", responsavel: "Rafael Santos", vendedores: 5 }
];

export const auditLogs = [
  { data: "2026-04-27 09:12", usuario: "admin@informatica.local", acao: "UPDATE", modulo: "products", entidade: "Product", ip: "192.168.0.24" },
  { data: "2026-04-27 09:04", usuario: "vendas@informatica.local", acao: "CREATE_SALE", modulo: "sales", entidade: "Sale", ip: "192.168.0.31" },
  { data: "2026-04-27 08:50", usuario: "estoque@informatica.local", acao: "TRANSFER", modulo: "inventory", entidade: "InventoryTransfer", ip: "192.168.0.19" }
];

export const permissions = [
  { modulo: "Dashboard", admin: true, gerente: true, vendedor: true, estoquista: true, suporte: true },
  { modulo: "Usuarios", admin: true, gerente: true, vendedor: false, estoquista: false, suporte: false },
  { modulo: "Vendas", admin: true, gerente: true, vendedor: true, estoquista: false, suporte: false },
  { modulo: "Estoque", admin: true, gerente: true, vendedor: false, estoquista: true, suporte: false },
  { modulo: "CRM", admin: true, gerente: true, vendedor: true, estoquista: false, suporte: true },
  { modulo: "Auditoria", admin: true, gerente: false, vendedor: false, estoquista: false, suporte: false }
];
