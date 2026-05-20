import { Lock, MonitorCheck } from "lucide-react";
import { useState } from "react";
import type { UserRole } from "../types";

type LoginAccount = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

const loginAccounts: LoginAccount[] = [
  { email: "admin@informatica.local", password: "Admin@123", name: "Administrador", role: "ADMIN" },
  { email: "vendas@informatica.local", password: "Vendas@123", name: "Lucas Vendedor", role: "VENDEDOR" }
];

export function LoginPage({ onLogin }: { onLogin: (account: LoginAccount) => void }) {
  const [email, setEmail] = useState("admin@informatica.local");
  const [password, setPassword] = useState("Admin@123");
  const [recoverySent, setRecoverySent] = useState(false);
  const [error, setError] = useState("");

  const submitLogin = () => {
    const account = loginAccounts.find((item) => item.email === email.trim().toLowerCase() && item.password === password);
    if (!account) {
      setError("E-mail ou senha incorretos.");
      return;
    }

    setError("");
    onLogin(account);
  };

  return (
    <main className="grid min-h-screen bg-[#eef2f7] lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-[#020617] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-[#10B981] text-[#020617]">
            <MonitorCheck size={24} />
          </div>
          <div>
            <strong className="block text-lg">Comercial Hub</strong>
            <span className="text-sm text-[#94A3B8]">Gestão Comercial Inteligente</span>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase text-[#10B981]">Gestão Comercial Inteligente</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight">Vendas, estoque e CRM em uma única plataforma.</h1>
          <p className="mt-4 text-[#94A3B8]">Controle lojas, vendedores, produtos, comissões e auditoria com rastreabilidade de ponta a ponta.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-5">
        <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-panel" onSubmit={(event) => event.preventDefault()}>
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded bg-[#020617] text-white">
              <MonitorCheck size={22} />
            </div>
            <div>
              <strong className="block text-[#020617]">Comercial Hub</strong>
              <span className="text-xs text-[#94A3B8]">Gestão Comercial Inteligente</span>
            </div>
          </div>
          <div className="mb-6">
            <div className="grid h-12 w-12 place-items-center rounded bg-emerald-50 text-[#10B981]">
              <Lock size={22} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-[#020617]">Acesso seguro</h2>
            <p className="mt-1 text-sm text-slate-500">Entre com sua conta corporativa.</p>
          </div>
          <label className="mb-4 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">E-mail</span>
            <input className="h-11 w-full rounded border border-slate-200 px-3 outline-none focus:border-[#10B981]" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="mb-5 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Senha</span>
            <input className="h-11 w-full rounded border border-slate-200 px-3 outline-none focus:border-[#10B981]" value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          <button type="button" onClick={submitLogin} className="h-11 w-full rounded bg-[#020617] px-4 font-semibold text-white hover:bg-slate-800">
            Entrar
          </button>
          <button
            type="button"
            className="mt-3 h-10 w-full rounded border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => setRecoverySent(true)}
          >
            Recuperar senha
          </button>
          {error && <p className="mt-3 rounded bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">{error}</p>}
          {recoverySent && <p className="mt-3 rounded bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800">Instruções de recuperação simuladas para o e-mail informado.</p>}
        </form>
      </section>
    </main>
  );
}
