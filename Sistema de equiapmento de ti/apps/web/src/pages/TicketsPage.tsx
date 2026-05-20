import { AlertTriangle, CheckCircle2, Filter, FolderKanban, Layers3, ListChecks, PlusCircle, RefreshCcw, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { downloadCsv } from "../lib/csv";
import { criticalCategories, initialTickets, isCritical, isSimple, needsReview, simpleCategories, suggestPriority, type Ticket, type TicketPriority } from "../data/tickets";
import type { Notify } from "../types";

type ReviewItem = Ticket & {
  sugestao: TicketPriority;
  motivo: string;
};

type TicketSection = "visao" | "novo" | "categorias" | "revisao" | "detalhes";

const sectionLabels: Record<TicketSection, string> = {
  visao: "Visão geral",
  novo: "Abrir chamado",
  categorias: "Categorias e módulos",
  revisao: "Revisão em lote",
  detalhes: "Detalhes"
};

const moduleMap = [
  { module: "Conectividade", categories: ["Internet", "Acesso", "Seguranca"], tone: "bg-cyan-50 text-cyan-800" },
  { module: "Sistemas internos", categories: ["Sistema Interno", "Sistema Financeiro"], tone: "bg-fuchsia-50 text-fuchsia-800" },
  { module: "Perifericos", categories: ["Mouse", "Teclado", "Impressora"], tone: "bg-emerald-50 text-emerald-800" },
  { module: "Postos de trabalho", categories: ["Computador", "Duvida de uso"], tone: "bg-amber-50 text-amber-800" }
];

export function TicketsPage({ notify }: { notify: Notify }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<TicketSection>("visao");
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(initialTickets[0]);
  const [ticketForm, setTicketForm] = useState({
    solicitante: "",
    empresa: "",
    categoria: "Sistema Interno",
    prioridade: "Media" as TicketPriority,
    status: "Aberto" as Ticket["status"],
    canal: "Portal" as Ticket["canal"],
    setor: "",
    responsavel: "",
    slaHoras: "4",
    descricao: "",
    observacoes: ""
  });

  const analyzed = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const base = tickets.filter((ticket) => {
      const searchable = [
        ticket.numero,
        ticket.solicitante,
        ticket.empresa,
        ticket.categoria,
        ticket.prioridade,
        ticket.status,
        ticket.canal,
        ticket.setor,
        ticket.responsavel,
        ticket.descricao
      ]
        .join(" ")
        .toLowerCase();
      return (!normalized || searchable.includes(normalized)) && (!onlyOpen || ticket.status === "Aberto");
    });

    const reviewItems: ReviewItem[] = base
      .filter(needsReview)
      .map((ticket) => ({
        ...ticket,
        sugestao: suggestPriority(ticket.categoria, ticket.prioridade),
        motivo:
          isCritical(ticket.categoria) && ticket.prioridade === "Baixa"
            ? "Chamado critico com prioridade baixa."
            : isSimple(ticket.categoria) && ticket.prioridade === "Alta"
              ? "Chamado simples com prioridade alta."
              : "Chamado aberto com prioridade possivelmente inadequada."
      }));

    const countsByCategory = base.reduce<Record<string, number>>((acc, ticket) => {
      acc[ticket.categoria] = (acc[ticket.categoria] ?? 0) + 1;
      return acc;
    }, {});

    const mostCommonCategory = Object.entries(countsByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
    const openTickets = base.filter((ticket) => ticket.status === "Aberto").length;
    const unresolvedCritical = base.filter((ticket) => isCritical(ticket.categoria) && ticket.status !== "Resolvido").length;

    return {
      total: base.length,
      openTickets,
      mostCommonCategory,
      unresolvedCritical,
      reviewItems,
      countsByCategory,
      base,
      conclusion:
        reviewItems.length > 0
          ? "O sistema identificou chamados com prioridade inconsistente. Categorias criticas foram subestimadas e categorias simples foram superestimadas, exigindo revisao em lote."
          : "Nao foram encontrados problemas de classificacao no recorte atual."
    };
  }, [onlyOpen, searchTerm, tickets]);

  const applyBatchCorrection = () => {
    const reviewSet = new Set(analyzed.reviewItems.map((item) => item.numero));
    setTickets((current) => current.map((ticket) => (reviewSet.has(ticket.numero) ? { ...ticket, prioridade: suggestPriority(ticket.categoria, ticket.prioridade) } : ticket)));
    notify("Correcoes em lote aplicadas aos chamados com prioridade incorreta.", "green");
  };

  const createTicket = () => {
    if (!ticketForm.solicitante.trim() || !ticketForm.empresa.trim() || !ticketForm.descricao.trim()) {
      notify("Preencha solicitante, empresa e descricao para abrir o chamado.", "amber");
      return;
    }

    const nextNumber = Math.max(...tickets.map((ticket) => ticket.numero)) + 1;
    const now = new Date();
    const padded = (value: number) => String(value).padStart(2, "0");
    const created: Ticket = {
      numero: nextNumber,
      solicitante: ticketForm.solicitante,
      empresa: ticketForm.empresa,
      categoria: ticketForm.categoria,
      prioridade: ticketForm.prioridade,
      status: ticketForm.status,
      abertura: `${now.getFullYear()}-${padded(now.getMonth() + 1)}-${padded(now.getDate())}`,
      canal: ticketForm.canal,
      setor: ticketForm.setor || "Geral",
      responsavel: ticketForm.responsavel || "Equipe N1",
      slaHoras: Number(ticketForm.slaHoras) || 4,
      descricao: ticketForm.descricao,
      observacoes: ticketForm.observacoes || "Chamado criado pelo módulo de abertura.",
      ultimaAtualizacao: `${now.getFullYear()}-${padded(now.getMonth() + 1)}-${padded(now.getDate())} ${padded(now.getHours())}:${padded(now.getMinutes())}`
    };

    setTickets((current) => [created, ...current]);
    setSelectedTicket(created);
    setActiveSection("visao");
    setTicketForm({
      solicitante: "",
      empresa: "",
      categoria: "Sistema Interno",
      prioridade: "Media",
      status: "Aberto",
      canal: "Portal",
      setor: "",
      responsavel: "",
      slaHoras: "4",
      descricao: "",
      observacoes: ""
    });
    notify("Chamado aberto com sucesso.", "green");
  };

  const exportReview = () => {
    if (downloadCsv("chamados-revisao.csv", analyzed.reviewItems)) notify("CSV dos chamados em revisao gerado.", "green");
  };

  const renderSection = () => {
    if (activeSection === "novo") {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded bg-emerald-50 text-emerald-700">
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Abrir chamado</h3>
              <p className="text-sm text-slate-500">Registro completo dentro do módulo de suporte.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Solicitante" value={ticketForm.solicitante} onChange={(value) => setTicketForm((current) => ({ ...current, solicitante: value }))} />
            <Field label="Empresa" value={ticketForm.empresa} onChange={(value) => setTicketForm((current) => ({ ...current, empresa: value }))} />
            <SelectField label="Categoria" value={ticketForm.categoria} onChange={(value) => setTicketForm((current) => ({ ...current, categoria: value as Ticket["categoria"] }))} options={[...criticalCategories, ...simpleCategories]} />
            <SelectField label="Prioridade" value={ticketForm.prioridade} onChange={(value) => setTicketForm((current) => ({ ...current, prioridade: value as TicketPriority }))} options={["Baixa", "Media", "Alta"]} />
            <SelectField label="Status" value={ticketForm.status} onChange={(value) => setTicketForm((current) => ({ ...current, status: value as Ticket["status"] }))} options={["Aberto", "Em andamento", "Resolvido"]} />
            <SelectField label="Canal" value={ticketForm.canal} onChange={(value) => setTicketForm((current) => ({ ...current, canal: value as Ticket["canal"] }))} options={["Portal", "WhatsApp", "Telefone", "E-mail"]} />
            <Field label="Setor" value={ticketForm.setor} onChange={(value) => setTicketForm((current) => ({ ...current, setor: value }))} />
            <Field label="Responsável" value={ticketForm.responsavel} onChange={(value) => setTicketForm((current) => ({ ...current, responsavel: value }))} />
            <Field label="SLA (horas)" value={ticketForm.slaHoras} onChange={(value) => setTicketForm((current) => ({ ...current, slaHoras: value }))} />
            <div className="md:col-span-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Descrição</span>
                <textarea className="min-h-28 w-full rounded border border-slate-200 p-3" value={ticketForm.descricao} onChange={(event) => setTicketForm((current) => ({ ...current, descricao: event.target.value }))} />
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Observações</span>
                <textarea className="min-h-24 w-full rounded border border-slate-200 p-3" value={ticketForm.observacoes} onChange={(event) => setTicketForm((current) => ({ ...current, observacoes: event.target.value }))} />
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" className="h-10 rounded bg-slate-950 px-4 text-sm font-semibold text-white" onClick={createTicket}>
              Registrar chamado
            </button>
          </div>
        </section>
      );
    }

    if (activeSection === "categorias") {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded bg-fuchsia-50 text-fuchsia-700">
              <FolderKanban size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Categorias e módulos</h3>
              <p className="text-sm text-slate-500">Estrutura interna parecida com GLPI para organizar a operação.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {moduleMap.map((item) => (
              <div key={item.module} className="rounded border border-slate-200 p-4">
                <strong className="block text-slate-950">{item.module}</strong>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.categories.map((category) => (
                    <span key={category} className={`rounded px-3 py-1 text-xs font-semibold ${item.tone}`}>
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            <InfoCard title="Categorias críticas" items={criticalCategories} tone="rose" />
            <InfoCard title="Categorias simples" items={simpleCategories} tone="emerald" />
          </div>
        </section>
      );
    }

    if (activeSection === "revisao") {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-950">Revisão em lote</h3>
              <p className="text-sm text-slate-500">Lista dos chamados com possível erro de classificação.</p>
            </div>
            <button type="button" className="h-9 rounded border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700" onClick={exportReview}>
              Exportar revisão
            </button>
          </div>
          <div className="mt-4 grid gap-2">
            {analyzed.reviewItems.map((item) => (
              <button
                type="button"
                key={item.numero}
                className={`rounded border p-3 text-left text-sm transition ${selectedTicket.numero === item.numero ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                onClick={() => setSelectedTicket(item)}
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-slate-950">Chamado {item.numero}</strong>
                  <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">{item.sugestao !== item.prioridade ? `Alterar para ${item.sugestao}` : "Revisar"}</span>
                </div>
                <p className="mt-1 text-slate-600">
                  {item.categoria} | {item.prioridade} | {item.motivo}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" className="flex h-10 items-center gap-2 rounded bg-slate-950 px-4 text-sm font-semibold text-white" onClick={applyBatchCorrection}>
              <RefreshCcw size={16} />
              Aplicar correção
            </button>
          </div>
        </section>
      );
    }

    if (activeSection === "detalhes") {
      return (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <h3 className="text-base font-bold text-slate-950">Detalhes completos</h3>
          <div className="mt-4 space-y-3 text-sm">
            <DetailRow label="Numero" value={`#${selectedTicket.numero}`} />
            <DetailRow label="Solicitante" value={selectedTicket.solicitante} />
            <DetailRow label="Empresa" value={selectedTicket.empresa} />
            <DetailRow label="Categoria" value={selectedTicket.categoria} />
            <DetailRow label="Prioridade" value={selectedTicket.prioridade} />
            <DetailRow label="Status" value={selectedTicket.status} />
            <DetailRow label="Canal" value={selectedTicket.canal} />
            <DetailRow label="Setor" value={selectedTicket.setor} />
            <DetailRow label="Responsável" value={selectedTicket.responsavel} />
            <DetailRow label="SLA" value={`${selectedTicket.slaHoras}h`} />
            <DetailRow label="Abertura" value={selectedTicket.abertura} />
            <DetailRow label="Atualização" value={selectedTicket.ultimaAtualizacao} />
            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-800">Descrição</p>
              <p className="mt-1 text-slate-600">{selectedTicket.descricao}</p>
              <p className="mt-2 text-slate-500">{selectedTicket.observacoes}</p>
            </div>
          </div>
        </section>
      );
    }

    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric title="Total de chamados" value={analyzed.total} tone="blue" />
          <Metric title="Chamados abertos" value={analyzed.openTickets} tone="amber" />
          <Metric title="Categoria com mais chamados" value={analyzed.mostCommonCategory} tone="violet" />
          <Metric title="Críticos não resolvidos" value={analyzed.unresolvedCritical} tone="red" />
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Listagem dos chamados</h3>
              <button type="button" className="h-9 rounded border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700" onClick={exportReview}>
                Exportar revisão
              </button>
            </div>
            <DataTable rows={analyzed.base} />
          </div>

          <div className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
              <h3 className="text-base font-bold text-slate-950">Categorias críticas</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {criticalCategories.map((category) => (
                  <span key={category} className="rounded bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    {category}
                  </span>
                ))}
              </div>
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
              <h3 className="text-base font-bold text-slate-950">Chamados de prioridade alta não resolvidos</h3>
              <div className="mt-3 space-y-2">
                {analyzed.base
                  .filter((ticket) => ticket.prioridade === "Alta" && ticket.status !== "Resolvido")
                  .map((ticket) => (
                    <button
                      type="button"
                      key={ticket.numero}
                      className={`w-full rounded border p-3 text-left text-sm transition ${
                        selectedTicket.numero === ticket.numero ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <strong className="block text-slate-950">
                        #{ticket.numero} - {ticket.categoria}
                      </strong>
                      <span className="text-slate-500">
                        {ticket.solicitante} | {ticket.status}
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950">Chamados em destaque</h3>
              <span className="text-sm text-slate-500">{analyzed.reviewItems.length} em revisao</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {analyzed.reviewItems.map((item) => (
                <button
                  key={item.numero}
                  type="button"
                  className={`rounded border p-3 text-left text-sm transition ${
                    selectedTicket.numero === item.numero ? "border-slate-950 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  onClick={() => {
                    setSelectedTicket(item);
                    setActiveSection("detalhes");
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-slate-950">#{item.numero}</strong>
                    <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">Revisar</span>
                  </div>
                  <p className="mt-1 text-slate-600">{item.solicitante}</p>
                  <p className="text-slate-500">
                    {item.empresa} | {item.categoria}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <h3 className="text-base font-bold text-slate-950">Detalhes rápidos</h3>
            <div className="mt-4 space-y-3 text-sm">
              <DetailRow label="Chamado atual" value={`#${selectedTicket.numero}`} />
              <DetailRow label="Solicitante" value={selectedTicket.solicitante} />
              <DetailRow label="Categoria" value={selectedTicket.categoria} />
              <DetailRow label="Prioridade" value={selectedTicket.prioridade} />
              <DetailRow label="Status" value={selectedTicket.status} />
              <DetailRow label="SLA" value={`${selectedTicket.slaHoras}h`} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <h3 className="text-base font-bold text-slate-950">Contagem por categoria</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {Object.entries(analyzed.countsByCategory).map(([category, count]: [string, number]) => (
                <div key={category} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
                  <span>{category}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <h3 className="text-base font-bold text-slate-950">Conclusao final</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{analyzed.conclusion}</p>
            <div className="mt-4 flex items-center gap-2 rounded bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <CheckCircle2 size={16} />
              O sistema identifica, sugere e corrige prioridades em lote.
            </div>
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Chamados de Suporte</h2>
            <p className="mt-1 text-sm text-slate-500">Estrutura de navegação por módulos, semelhante a um help desk moderno.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex h-10 min-w-72 items-center gap-2 rounded border border-slate-200 bg-white px-3">
              <Search size={16} className="text-slate-400" />
              <input className="w-full bg-transparent text-sm outline-none" placeholder="Buscar chamado, empresa, categoria..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </label>
            <button type="button" className={`flex h-10 items-center gap-2 rounded border px-3 text-sm font-semibold ${onlyOpen ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`} onClick={() => setOnlyOpen((current) => !current)}>
              <Filter size={16} />
              Somente abertos
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(sectionLabels) as TicketSection[]).map((section) => (
            <button
              key={section}
              type="button"
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold ${
                activeSection === section ? "bg-[#020617] text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setActiveSection(section)}
            >
              {section === "visao" && <Layers3 size={16} />}
              {section === "novo" && <PlusCircle size={16} />}
              {section === "categorias" && <FolderKanban size={16} />}
              {section === "revisao" && <Sparkles size={16} />}
              {section === "detalhes" && <ListChecks size={16} />}
              {sectionLabels[section]}
            </button>
          ))}
        </div>
      </section>

      {renderSection()}

      <Modal
        open={reviewOpen}
        title="Correcao em lote"
        description="Lista dos chamados que precisam de revisao e sugestao de nova prioridade."
        onClose={() => setReviewOpen(false)}
        footer={
          <>
            <button type="button" className="h-10 rounded border border-slate-200 px-4 text-sm font-semibold" onClick={() => setReviewOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="flex h-10 items-center gap-2 rounded bg-slate-950 px-4 text-sm font-semibold text-white" onClick={applyBatchCorrection}>
              <RefreshCcw size={16} />
              Aplicar correcao
            </button>
          </>
        }
      >
        <div className="space-y-2">
          {analyzed.reviewItems.map((item) => (
            <div key={item.numero} className="rounded border border-slate-200 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-slate-950">Chamado {item.numero}</strong>
                <span className="rounded bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">{item.sugestao !== item.prioridade ? `Alterar para ${item.sugestao}` : "Revisar"}</span>
              </div>
              <p className="mt-1 text-slate-600">
                {item.categoria} | {item.prioridade} | {item.motivo}
              </p>
            </div>
          ))}
          {!analyzed.reviewItems.length && <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Nenhum chamado precisa de correcao no filtro atual.</div>}
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input className="h-10 w-full rounded border border-slate-200 px-3" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select className="h-10 w-full rounded border border-slate-200 px-3" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function InfoCard({ title, items, tone }: { title: string; items: string[]; tone: "rose" | "emerald" }) {
  const styles = {
    rose: "bg-rose-50 text-rose-700",
    emerald: "bg-emerald-50 text-emerald-700"
  };

  return (
    <div className="rounded border border-slate-200 p-4">
      <strong className="block text-slate-950">{title}</strong>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded px-3 py-1 text-xs font-semibold ${styles[tone]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <strong className="text-right text-slate-950">{value}</strong>
    </div>
  );
}

function Metric({ title, value, tone }: { title: string; value: string | number; tone: "blue" | "amber" | "violet" | "red" }) {
  const styles = {
    blue: "bg-cyan-50 text-cyan-800",
    amber: "bg-amber-50 text-amber-800",
    violet: "bg-fuchsia-50 text-fuchsia-800",
    red: "bg-rose-50 text-rose-800"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className={`mt-2 inline-flex rounded px-3 py-1 text-lg font-bold ${styles[tone]}`}>{value}</div>
    </div>
  );
}
