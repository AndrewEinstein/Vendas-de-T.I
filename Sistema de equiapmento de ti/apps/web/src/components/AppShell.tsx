import { Bell, LogOut, Menu, Search, ShieldCheck, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { NavItem, ViewKey } from "../types";

export function AppShell({
  navItems,
  activeView,
  onNavigate,
  onLogout,
  onGlobalSearch,
  notifications,
  onClearNotifications,
  children
}: {
  navItems: NavItem[];
  activeView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  onLogout: () => void;
  onGlobalSearch: (term: string) => void;
  notifications: string[];
  onClearNotifications: () => void;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const active = navItems.find((item) => item.key === activeView);

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded bg-[#020617] text-white">
              <ShieldCheck size={22} />
            </div>
            <div>
              <strong className="block text-sm text-[#020617]">Comercial Hub</strong>
              <span className="text-xs text-[#94A3B8]">Gestão Comercial Inteligente</span>
            </div>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded border border-slate-200 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeView;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm font-medium ${
                  isActive ? "bg-[#020617] text-white" : "text-slate-600 hover:bg-slate-100 hover:text-[#020617]"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
          <button className="grid h-10 w-10 place-items-center rounded border border-slate-200 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Modulo</p>
            <h1 className="truncate text-lg font-bold text-[#020617]">{active?.label}</h1>
          </div>
          <label className="hidden h-10 min-w-72 items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 md:flex">
            <Search size={17} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Buscar no sistema"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onGlobalSearch(searchTerm);
                }
              }}
            />
          </label>
          <div className="relative">
          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded border border-slate-200 bg-white"
            aria-label="Notificacoes"
            onClick={() => setNotificationOpen((current) => !current)}
          >
            <Bell size={18} />
            {notifications.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#10B981]" />}
          </button>
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <strong className="text-sm text-[#020617]">Notificações</strong>
                  <button type="button" className="text-xs font-semibold text-[#10B981]" onClick={onClearNotifications}>
                    Marcar lidas
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto p-2">
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <div key={notification} className="rounded border border-slate-100 p-3 text-sm text-slate-600">
                        {notification}
                      </div>
                    ))
                  ) : (
                    <p className="px-3 py-6 text-center text-sm text-slate-500">Tudo em dia por aqui.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded border border-slate-200 bg-white" onClick={onLogout} aria-label="Sair">
            <LogOut size={18} />
          </button>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
