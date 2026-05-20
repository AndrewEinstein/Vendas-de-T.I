import { BarChart3, Boxes, ClipboardList, FileText, Landmark, Package, ScrollText, ShoppingCart, UsersRound, LifeBuoy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { ToastViewport } from "./components/ToastViewport";
import { AuditPage } from "./pages/AuditPage";
import { CrmPage } from "./pages/CrmPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LoginPage } from "./pages/LoginPage";
import { ProductsPage } from "./pages/ProductsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SalesPage } from "./pages/SalesPage";
import { StoresPage } from "./pages/StoresPage";
import { TicketsPage } from "./pages/TicketsPage";
import { UsersPage } from "./pages/UsersPage";
import type { NavItem, Notify, StatusTone, ToastMessage, UserRole, ViewKey } from "./types";

type SessionUser = {
  name: string;
  email: string;
  role: UserRole;
};

export function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState([
    "SSD Kingston NV2 1TB esta abaixo do estoque minimo.",
    "3 follow-ups comerciais vencem hoje.",
    "Relatorio de comissoes do mes esta pronto."
  ]);

  const notify = useCallback<Notify>((message: string, tone: StatusTone = "blue") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const handleGlobalSearch = useCallback(
    (term: string) => {
      const normalized = term.trim().toLowerCase();

      if (!normalized) {
        notify("Digite um termo para buscar.", "amber");
        return;
      }

      const routeByTerm: Array<[string[], ViewKey]> = [
        [["venda", "orcamento", "pedido"], "sales"],
        [["estoque", "inventario", "transferencia"], "inventory"],
        [["produto", "sku", "barcode"], "products"],
        [["loja", "cnpj"], "stores"],
        [["cliente", "lead", "crm", "follow"], "crm"],
        [["chamado", "suporte", "ticket", "helpdesk"], "tickets"],
        [["usuario", "permissao", "perfil"], "users"],
        [["relatorio", "csv", "excel", "pdf"], "reports"],
        [["log", "auditoria"], "audit"]
      ];

      const match = routeByTerm.find(([terms]) => terms.some((item) => normalized.includes(item)));
      if (match) {
        setActiveView(match[1]);
        notify(`Busca "${term}" direcionada para o modulo correspondente.`, "green");
        return;
      }

      notify(`Busca "${term}" registrada. Use os filtros do modulo para refinar.`, "blue");
    },
    [notify]
  );

  const navItems = useMemo<NavItem[]>(
    () => [
      { key: "dashboard", label: "Dashboard", icon: BarChart3, allowedRoles: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA", "SUPORTE"] },
      { key: "sales", label: "Vendas", icon: ShoppingCart, allowedRoles: ["ADMIN", "GERENTE", "VENDEDOR"] },
      { key: "inventory", label: "Estoque", icon: Boxes, allowedRoles: ["ADMIN", "GERENTE", "ESTOQUISTA"] },
      { key: "products", label: "Produtos", icon: Package, allowedRoles: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA", "SUPORTE"] },
      { key: "stores", label: "Lojas", icon: Landmark, allowedRoles: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA", "SUPORTE"] },
      { key: "crm", label: "CRM", icon: UsersRound, allowedRoles: ["ADMIN", "GERENTE", "VENDEDOR", "SUPORTE"] },
      { key: "tickets", label: "Chamados", icon: LifeBuoy, allowedRoles: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA", "SUPORTE"] },
      { key: "users", label: "Usuarios e permissoes", icon: ClipboardList, allowedRoles: ["ADMIN", "GERENTE"] },
      { key: "reports", label: "Relatorios", icon: FileText, allowedRoles: ["ADMIN", "GERENTE", "VENDEDOR", "ESTOQUISTA", "SUPORTE"] },
      { key: "audit", label: "Auditoria", icon: ScrollText, allowedRoles: ["ADMIN"] }
    ],
    []
  );

  const visibleNavItems = useMemo(() => navItems.filter((item) => sessionUser && item.allowedRoles.includes(sessionUser.role)), [navItems, sessionUser]);

  const firstAllowedView = visibleNavItems[0]?.key ?? "dashboard";

  useEffect(() => {
    if (authenticated && sessionUser && !visibleNavItems.some((item) => item.key === activeView)) {
      setActiveView(firstAllowedView);
    }
  }, [activeView, authenticated, firstAllowedView, sessionUser, visibleNavItems]);

  if (!authenticated) {
    return (
      <LoginPage
        onLogin={(account) => {
          setSessionUser(account);
          setAuthenticated(true);
          setActiveView("dashboard");
        }}
      />
    );
  }

  return (
    <>
      <AppShell
        navItems={visibleNavItems}
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={() => {
          setAuthenticated(false);
          setSessionUser(null);
          setActiveView("dashboard");
        }}
        onGlobalSearch={handleGlobalSearch}
        notifications={notifications}
        onClearNotifications={() => {
          setNotifications([]);
          notify("Notificacoes marcadas como lidas.", "green");
        }}
      >
        {activeView === "dashboard" && <DashboardPage onOpenReports={() => setActiveView("reports")} notify={notify} />}
        {activeView === "sales" && <SalesPage notify={notify} />}
        {activeView === "inventory" && <InventoryPage notify={notify} />}
        {activeView === "products" && <ProductsPage notify={notify} />}
        {activeView === "stores" && <StoresPage />}
        {activeView === "crm" && <CrmPage notify={notify} />}
        {activeView === "tickets" && <TicketsPage notify={notify} />}
        {activeView === "users" && <UsersPage notify={notify} />}
        {activeView === "reports" && <ReportsPage notify={notify} />}
        {activeView === "audit" && <AuditPage />}
      </AppShell>
      <ToastViewport toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </>
  );
}
