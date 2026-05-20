import { CalendarClock, Filter, MessageSquarePlus, PhoneCall, TrendingUp, UserPlus, LayoutDashboard, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { customers as initialCustomers } from "../data/mock";
import type { Notify } from "../types";

type CustomerRow = (typeof initialCustomers)[number] & {
  segmento?: string;
  origem?: string;
  ultimoContato?: string;
  valorPotencial?: string;
  vendedor?: string;
  status?: string;
  observacoes?: string;
  cidade?: string;
};
type CrmModal = "cliente" | "funil" | "contato" | "follow" | null;
type CrmView = "painel" | "clientes" | "historico";

const pipeline = [
  { stage: "Leads", value: "36", tone: "bg-cyan-50 text-cyan-800" },
  { stage: "Qualificacao", value: "18", tone: "bg-emerald-50 text-emerald-800" },
  { stage: "Proposta", value: "11", tone: "bg-amber-50 text-amber-800" },
  { stage: "Negociacao", value: "7", tone: "bg-fuchsia-50 text-fuchsia-800" }
];

export function CrmPage({ notify }: { notify: Notify }) {
  const [customers, setCustomers] = useState<CustomerRow[]>(
    initialCustomers.map((customer, index) => ({
      ...customer,
      segmento: index === 0 ? "Tecnologia" : index === 1 ? "Servicos" : "Varejo",
      origem: index === 0 ? "Site" : index === 1 ? "Indicacao" : "WhatsApp",
      ultimoContato: "Hoje, 10:30",
      valorPotencial: index === 0 ? "R$ 42.000" : index === 1 ? "R$ 18.500" : "R$ 9.200",
      vendedor: index === 0 ? "Lucas" : index === 1 ? "Marina" : "Rafael",
      status: index === 0 ? "Ativo" : index === 1 ? "Em negocacao" : "Pausado",
      observacoes: "Cliente com interesse recorrente em computadores e periféricos.",
      cidade: index === 0 ? "Cuiaba" : index === 1 ? "Varzea Grande" : "Rondonopolis"
    }))
  );
  const [modal, setModal] = useState<CrmModal>(null);
  const [view, setView] = useState<CrmView>("painel");
  const [newCustomer, setNewCustomer] = useState({
    nome: "",
    documento: "",
    telefone: "",
    funil: "Leads",
    segmento: "Tecnologia",
    origem: "Site",
    cidade: "",
    valorPotencial: ""
  });
  const [note, setNote] = useState("");

  const metrics = useMemo(
    () => [
      { label: "Clientes ativos", value: customers.filter((item) => item.status !== "Pausado").length },
      { label: "Valor potencial", value: `R$ ${customers.length * 12800}` },
      { label: "Contatos hoje", value: 14 },
      { label: "Follow-ups agendados", value: 9 }
    ],
    [customers]
  );

  const saveCustomer = () => {
    if (!newCustomer.nome || !newCustomer.documento || !newCustomer.telefone) {
      notify("Preencha nome, documento e telefone.", "amber");
      return;
    }

    setCustomers((current) => [
      {
        nome: newCustomer.nome,
        documento: newCustomer.documento,
        telefone: newCustomer.telefone,
        compras: 0,
        funil: newCustomer.funil,
        segmento: newCustomer.segmento,
        origem: newCustomer.origem,
        ultimoContato: "Agora",
        valorPotencial: newCustomer.valorPotencial || "R$ 0",
        vendedor: "Lucas",
        status: "Novo",
        observacoes: "Cadastro realizado no CRM.",
        cidade: newCustomer.cidade || "Nao informado"
      },
      ...current
    ]);
    setNewCustomer({ nome: "", documento: "", telefone: "", funil: "Leads", segmento: "Tecnologia", origem: "Site", cidade: "", valorPotencial: "" });
    setModal(null);
    notify("Cliente cadastrado no CRM.", "green");
  };

  const saveAction = (label: string) => {
    if (!note.trim()) {
      notify("Digite uma observacao para registrar a acao.", "amber");
      return;
    }

    setNote("");
    setModal(null);
    notify(`${label} registrado no CRM.`, "green");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">CRM</h2>
            <p className="mt-1 text-sm text-slate-500">Acesso central para abrir, consultar e acompanhar clientes e oportunidades.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`flex h-10 items-center gap-2 rounded px-4 text-sm font-semibold ${view === "painel" ? "bg-[#020617] text-white" : "border border-slate-200 bg-white text-slate-700"}`}
              onClick={() => {
                setView("painel");
                notify("CRM aberto no painel principal.", "green");
              }}
            >
              <LayoutDashboard size={16} />
              Abrir CRM
            </button>
            <button type="button" className="flex h-10 items-center gap-2 rounded border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700" onClick={() => setView("clientes")}>
              <ArrowRight size={16} />
              Clientes
            </button>
            <button type="button" className="flex h-10 items-center gap-2 rounded border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700" onClick={() => setView("historico")}>
              <ArrowRight size={16} />
              Histórico
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        {pipeline.map((item) => (
          <button
            type="button"
            key={item.stage}
            className={`rounded-lg border border-slate-200 p-4 text-left shadow-panel transition hover:scale-[1.01] ${item.tone}`}
            onClick={() => {
              setModal("funil");
              setNote(`Analise da etapa ${item.stage}`);
            }}
          >
            <span className="text-sm font-semibold">{item.stage}</span>
            <strong className="mt-2 block text-3xl">{item.value}</strong>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <strong className="mt-2 block text-2xl text-slate-950">{metric.value}</strong>
          </div>
        ))}
      </div>

      {view === "painel" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-950">Clientes e histórico</h2>
            <button type="button" className="flex h-10 items-center gap-2 rounded bg-slate-950 px-4 text-sm font-semibold text-white" onClick={() => setModal("cliente")}>
              <UserPlus size={17} />
              Novo cliente
            </button>
          </div>
          <DataTable rows={customers} />
        </section>
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <h2 className="text-base font-bold text-slate-950">Painel comercial</h2>
          <div className="mt-4 space-y-3">
            <Action icon={TrendingUp} title="Funil" text="Leads, oportunidades, valor e etapa." onClick={() => setModal("funil")} />
            <Action icon={MessageSquarePlus} title="Contato" text="Registro de e-mail, telefone ou WhatsApp." onClick={() => setModal("contato")} />
            <Action icon={CalendarClock} title="Follow-up" text="Retorno agendado por vendedor." onClick={() => setModal("follow")} />
            <Action icon={PhoneCall} title="Histórico" text="Últimos contatos, status e observações." onClick={() => setModal("contato")} />
            <Action icon={Filter} title="Segmentação" text="Cliente por segmento, cidade e origem." onClick={() => setModal("funil")} />
          </div>
          <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <strong className="block text-slate-950">Resumo</strong>
            O CRM agora exibe mais dados de perfil, potencial comercial, origem e status.
          </div>
          </section>
        </div>
      )}

      {view === "clientes" && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Clientes</h2>
              <p className="text-sm text-slate-500">Visão direta para abrir e consultar registros do CRM.</p>
            </div>
            <button type="button" className="h-10 rounded bg-slate-950 px-4 text-sm font-semibold text-white" onClick={() => setModal("cliente")}>
              Abrir cliente
            </button>
          </div>
          <DataTable rows={customers} />
        </section>
      )}

      {view === "historico" && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <h2 className="text-base font-bold text-slate-950">Histórico do CRM</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {customers.slice(0, 6).map((customer) => (
              <div key={customer.documento} className="rounded border border-slate-200 p-3">
                <strong className="block text-slate-950">{customer.nome}</strong>
                <p className="mt-1 text-sm text-slate-500">{customer.segmento} | {customer.origem}</p>
                <p className="mt-1 text-sm text-slate-500">Contato: {customer.ultimoContato}</p>
                <p className="mt-1 text-sm text-slate-500">Potencial: {customer.valorPotencial}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Modal
        open={modal === "cliente"}
        title="Novo cliente"
        description="Cadastro rapido para pessoa fisica ou juridica."
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" className="h-10 rounded border border-slate-200 px-4 text-sm font-semibold" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button type="button" className="h-10 rounded bg-slate-950 px-4 text-sm font-semibold text-white" onClick={saveCustomer}>
              Salvar cliente
            </button>
          </>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Nome ou razao social" value={newCustomer.nome} onChange={(value) => setNewCustomer((current) => ({ ...current, nome: value }))} />
          <Input label="CPF ou CNPJ" value={newCustomer.documento} onChange={(value) => setNewCustomer((current) => ({ ...current, documento: value }))} />
          <Input label="Telefone" value={newCustomer.telefone} onChange={(value) => setNewCustomer((current) => ({ ...current, telefone: value }))} />
          <Input label="Cidade" value={newCustomer.cidade} onChange={(value) => setNewCustomer((current) => ({ ...current, cidade: value }))} />
          <Select label="Etapa do funil" value={newCustomer.funil} onChange={(value) => setNewCustomer((current) => ({ ...current, funil: value }))} options={["Leads", "Qualificacao", "Proposta", "Negociacao"]} />
          <Select label="Segmento" value={newCustomer.segmento} onChange={(value) => setNewCustomer((current) => ({ ...current, segmento: value }))} options={["Tecnologia", "Servicos", "Varejo", "Educacao", "Industria"]} />
          <Select label="Origem" value={newCustomer.origem} onChange={(value) => setNewCustomer((current) => ({ ...current, origem: value }))} options={["Site", "Indicacao", "WhatsApp", "Telefone", "Loja"]} />
          <Input label="Valor potencial" value={newCustomer.valorPotencial} onChange={(value) => setNewCustomer((current) => ({ ...current, valorPotencial: value }))} />
        </div>
      </Modal>

      <Modal
        open={modal === "funil" || modal === "contato" || modal === "follow"}
        title={modal === "follow" ? "Agendar follow-up" : modal === "contato" ? "Registrar contato" : "Atualizar funil"}
        description="A acao fica registrada no historico comercial local."
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" className="h-10 rounded border border-slate-200 px-4 text-sm font-semibold" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button type="button" className="h-10 rounded bg-slate-950 px-4 text-sm font-semibold text-white" onClick={() => saveAction(modal === "follow" ? "Follow-up" : modal === "contato" ? "Contato" : "Funil")}>
              Registrar
            </button>
          </>
        }
      >
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Observacao</span>
          <textarea className="min-h-28 w-full rounded border border-slate-200 p-3" value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </Modal>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input className="h-10 w-full rounded border border-slate-200 px-3" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select className="h-10 w-full rounded border border-slate-200 px-3" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Action({ icon: Icon, title, text, onClick }: { icon: typeof Filter; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" className="flex w-full gap-3 rounded border border-slate-200 p-3 text-left hover:bg-slate-50" onClick={onClick}>
      <div className="grid h-10 w-10 place-items-center rounded bg-slate-100 text-slate-700">
        <Icon size={18} />
      </div>
      <span>
        <strong className="block text-sm text-slate-950">{title}</strong>
        <span className="text-sm text-slate-500">{text}</span>
      </span>
    </button>
  );
}
