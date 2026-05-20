import { CreditCard, Percent, Printer, ShoppingCart, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { products, sales as initialSales } from "../data/mock";
import { downloadCsv, nextId } from "../lib/csv";
import type { Notify } from "../types";

type ProductRow = (typeof products)[number];
type SaleRow = (typeof initialSales)[number];
type CartItem = ProductRow & { qtd: number };
type ReceiptDetails = {
  customer: string;
  channel: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  total: number;
  items: Array<{
    sku: string;
    produto: string;
    qtd: number;
    preco: number;
    total: number;
  }>;
};

function priceToNumber(price: string) {
  return Number(price.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
}

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function downloadReceipt(receipt: ReceiptDetails, fallbackCustomer: string, fallbackChannel: string, fallbackPaymentMethod: string) {
  const issueDate = new Date();
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DANFE visual - Comercial Hub</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f4f6f8; color: #0f172a; }
    .sheet { max-width: 920px; margin: 24px auto; background: #fff; border: 1px solid #dbe2ea; box-shadow: 0 12px 30px rgba(15,23,42,.08); }
    .top { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px; border-bottom: 1px solid #dbe2ea; }
    .brand { display: flex; gap: 14px; align-items: center; }
    .logo { width: 44px; height: 44px; border-radius: 10px; background: #020617; color: #10B981; display: grid; place-items: center; font-weight: 700; }
    .eyebrow { font-size: 11px; letter-spacing: .22em; color: #64748b; text-transform: uppercase; }
    h1 { margin: 4px 0 6px; font-size: 22px; }
    .muted { color: #64748b; font-size: 12px; }
    .meta { text-align: right; font-size: 12px; color: #475569; }
    .section { padding: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .box { border: 1px solid #dbe2ea; border-radius: 10px; padding: 14px; background: #f8fafc; }
    .box h2, .totals h2 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: .12em; color: #64748b; }
    .box p { margin: 4px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 13px; }
    th { text-transform: uppercase; letter-spacing: .08em; font-size: 11px; color: #64748b; background: #f8fafc; }
    td.num, th.num { text-align: right; }
    .footerGrid { display: grid; grid-template-columns: 1fr 280px; gap: 16px; margin-top: 16px; }
    .totals { border: 1px solid #dbe2ea; border-radius: 10px; padding: 14px; background: #fff; }
    .line { display: flex; justify-content: space-between; margin: 6px 0; font-size: 14px; }
    .line.total { font-size: 16px; font-weight: 700; padding-top: 8px; border-top: 1px solid #e2e8f0; }
    .notice { border: 1px dashed #cbd5e1; border-radius: 10px; padding: 14px; margin-top: 16px; background: #fff; }
    .foot { padding: 18px 24px 24px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; display: flex; justify-content: space-between; align-items: center; }
    .signature { margin-top: 18px; display: flex; justify-content: space-between; gap: 16px; }
    .signature div { flex: 1; border-top: 1px solid #cbd5e1; padding-top: 6px; font-size: 12px; color: #64748b; }
    @media print { body { background: #fff; } .sheet { box-shadow: none; margin: 0; border: 0; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div class="brand">
        <div class="logo">CH</div>
        <div>
          <div class="eyebrow">Comercial Hub</div>
          <h1>DANFE visual de conferencia</h1>
          <div class="muted">Gestão Comercial Inteligente</div>
        </div>
      </div>
      <div class="meta">
        <div><strong>Data:</strong> ${issueDate.toLocaleDateString("pt-BR")}</div>
        <div><strong>Hora:</strong> ${issueDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
        <div><strong>Tipo:</strong> Conferência comercial</div>
      </div>
    </div>
    <div class="section">
      <div class="grid">
        <div class="box">
          <h2>Emitente</h2>
          <p><strong>Empresa:</strong> Comercial Hub</p>
          <p><strong>Sistema:</strong> Gestão Comercial Inteligente</p>
          <p><strong>Observação:</strong> documento visual para conferência interna, impressão e arquivo local.</p>
        </div>
        <div class="box">
          <h2>Cliente</h2>
          <p><strong>Nome:</strong> ${receipt.customer || fallbackCustomer}</p>
          <p><strong>Canal:</strong> ${receipt.channel || fallbackChannel}</p>
          <p><strong>Pagamento:</strong> ${receipt.paymentMethod || fallbackPaymentMethod}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>SKU</th>
            <th class="num">Qtd</th>
            <th class="num">Valor</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>
          ${receipt.items
            .map(
              (item) => `
            <tr>
              <td>${item.produto}</td>
              <td>${item.sku}</td>
              <td class="num">${item.qtd}</td>
              <td class="num">${money(item.preco)}</td>
              <td class="num">${money(item.total)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="footerGrid">
        <div>
          <div class="notice">
            <strong>DANFE visual de conferência</strong>
            <div class="muted" style="margin-top:6px;">Este arquivo é um documento visual de conferência, com layout inspirado em DANFE para facilitar a impressão e o arquivamento local.</div>
            <div class="signature">
              <div>Vendedor: Lucas</div>
              <div>Loja: Matriz</div>
            </div>
          </div>
        </div>
        <div class="totals">
          <h2>Totais</h2>
          <div class="line"><span>Subtotal</span><strong>${money(receipt.subtotal)}</strong></div>
          <div class="line"><span>Desconto</span><strong>${money(receipt.discount)}</strong></div>
          <div class="line"><span>Frete</span><strong>${money(0)}</strong></div>
          <div class="line"><span>Impostos</span><strong>${money(0)}</strong></div>
          <div class="line total"><span>Total</span><strong>${money(receipt.total)}</strong></div>
        </div>
      </div>
    </div>
    <div class="foot">
      <span>Comercial Hub - Gestão Comercial Inteligente</span>
      <span>Emissão interna para validação e conferência</span>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `recibo-${issueDate.toISOString().slice(0, 10)}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

export function SalesPage({ notify }: { notify: Notify }) {
  const [sales, setSales] = useState<SaleRow[]>(initialSales);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountDraft, setDiscountDraft] = useState("0");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [customer, setCustomer] = useState("Studio Pixel");
  const [customCustomer, setCustomCustomer] = useState("");
  const [channel, setChannel] = useState("Presencial");
  const [productSearch, setProductSearch] = useState("");

  const activeCustomer = customer === "Cliente avulso" ? customCustomer || "Cliente avulso" : customer;

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + priceToNumber(item.preco) * item.qtd, 0), [cart]);
  const total = Math.max(subtotal - discount, 0);
  const visibleProducts = useMemo(() => {
    const normalized = productSearch.trim().toLowerCase();
    return products.filter((product) => {
      if (!normalized) return true;
      return [product.produto, product.categoria, product.marca, product.sku].join(" ").toLowerCase().includes(normalized);
    });
  }, [productSearch]);

  const addToCart = (product: ProductRow) => {
    setCart((current) => {
      const existing = current.find((item) => item.sku === product.sku);
      if (existing) return current.map((item) => (item.sku === product.sku ? { ...item, qtd: item.qtd + 1 } : item));
      return [...current, { ...product, qtd: 1 }];
    });
    notify(`${product.produto} adicionado ao carrinho.`, "green");
  };

  const finalizeSale = () => {
    if (!cart.length) {
      notify("Adicione pelo menos um produto ao carrinho.", "amber");
      return;
    }

    const sale: SaleRow = {
      id: nextId("VD"),
      cliente: activeCustomer,
      vendedor: "Lucas",
      canal: channel,
      total: money(total),
      status: paymentMethod === "Boleto" ? "Em andamento" : "Paga"
    };
    setReceiptDetails({
      customer: activeCustomer,
      channel,
      paymentMethod,
      subtotal,
      discount,
      total,
      items: cart.map((item) => ({
        sku: item.sku,
        produto: item.produto,
        qtd: item.qtd,
        preco: priceToNumber(item.preco),
        total: priceToNumber(item.preco) * item.qtd
      }))
    });
    setSales((current) => [sale, ...current]);
    setCart([]);
    setDiscount(0);
    setReceiptOpen(true);
    notify("Venda finalizada e registrada no historico.", "green");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-cyan-50 text-cyan-800">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-950">Pedido de venda</h2>
            <p className="text-sm text-slate-500">Presencial ou online</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <select className="h-10 w-full rounded border border-slate-200 px-3" value={customer} onChange={(event) => setCustomer(event.target.value)}>
            <option>Studio Pixel</option>
            <option>Comercial Alfa</option>
            <option>Rede Norte</option>
            <option>Cliente avulso</option>
          </select>
          {customer === "Cliente avulso" && (
            <input
              className="h-10 w-full rounded border border-slate-200 px-3"
              placeholder="Digite o nome do cliente"
              value={customCustomer}
              onChange={(event) => setCustomCustomer(event.target.value)}
            />
          )}
          <select className="h-10 w-full rounded border border-slate-200 px-3" value={channel} onChange={(event) => setChannel(event.target.value)}>
            <option>Presencial</option>
            <option>Online</option>
            <option>Orcamento</option>
          </select>
          <div className="rounded border border-slate-200 bg-white p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <strong className="text-sm text-slate-950">Produtos para seleção</strong>
              <span className="text-xs text-slate-500">{visibleProducts.length} itens visíveis</span>
            </div>
            <input
              className="mb-3 h-10 w-full rounded border border-slate-200 px-3 text-sm"
              placeholder="Buscar produto, SKU, categoria ou marca"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
            <div className="max-h-[36rem] space-y-2 overflow-y-auto pr-1">
              {visibleProducts.map((product) => (
                <div key={product.sku} className="grid gap-2 rounded border border-slate-200 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-slate-950">{product.produto}</strong>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>{product.sku}</span>
                      <span>•</span>
                      <span>{product.categoria}</span>
                      <span>•</span>
                      <span>{product.marca}</span>
                      <span>•</span>
                      <span>{product.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm font-semibold text-slate-700">{product.preco}</span>
                    <button type="button" className="h-8 rounded bg-slate-950 px-3 text-xs font-semibold text-white" onClick={() => addToCart(product)}>
                      Add
                    </button>
                  </div>
                </div>
              ))}
              {!visibleProducts.length && <p className="px-1 py-4 text-sm text-slate-500">Nenhum produto encontrado para o filtro atual.</p>}
            </div>
          </div>

          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <strong className="text-sm text-slate-950">Carrinho</strong>
              <span className="text-sm font-semibold text-slate-700">{money(total)}</span>
            </div>
            {cart.length ? (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.sku} className="flex items-center justify-between gap-2 rounded bg-white p-2 text-sm">
                    <span className="min-w-0 flex-1 truncate">{item.produto} x{item.qtd}</span>
                    <button type="button" className="grid h-8 w-8 place-items-center rounded border border-slate-200" aria-label={`Remover ${item.produto}`} onClick={() => setCart((current) => current.filter((cartItem) => cartItem.sku !== item.sku))}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nenhum item adicionado.</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button type="button" className="flex h-10 items-center justify-center gap-2 rounded border border-slate-200 text-sm font-semibold" onClick={() => setDiscountOpen(true)}>
              <Percent size={16} />
              Desc.
            </button>
            <button type="button" className="flex h-10 items-center justify-center gap-2 rounded border border-slate-200 text-sm font-semibold" onClick={() => setPaymentOpen(true)}>
              <CreditCard size={16} />
              Pag.
            </button>
            <button
              type="button"
              className="flex h-10 items-center justify-center gap-2 rounded border border-slate-200 text-sm font-semibold"
              onClick={() => {
                if (!cart.length && !receiptDetails) {
                  notify("Monte um carrinho ou finalize uma venda antes de emitir recibo.", "amber");
                  return;
                }
                if (cart.length) {
                  setReceiptDetails({
                    customer: activeCustomer,
                    channel,
                    paymentMethod,
                    subtotal,
                    discount,
                    total,
                    items: cart.map((item) => ({
                      sku: item.sku,
                      produto: item.produto,
                      qtd: item.qtd,
                      preco: priceToNumber(item.preco),
                      total: priceToNumber(item.preco) * item.qtd
                    }))
                  });
                }
                setReceiptOpen(true);
              }}
            >
              <Printer size={16} />
              Rec.
            </button>
          </div>
          <button type="button" className="h-11 w-full rounded bg-emerald-600 px-4 font-semibold text-white hover:bg-emerald-700" onClick={finalizeSale}>
            Finalizar venda
          </button>
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-950">Historico de vendas</h2>
          <button
            type="button"
            className="h-10 rounded border border-slate-200 bg-white px-4 text-sm font-semibold"
            onClick={() => {
              if (downloadCsv("vendas.csv", sales)) notify("CSV de vendas gerado.", "green");
            }}
          >
            Exportar
          </button>
        </div>
        <DataTable rows={sales} />
      </section>

      <Modal
        open={discountOpen}
        title="Aplicar desconto"
        description={`Subtotal atual: ${money(subtotal)}`}
        onClose={() => setDiscountOpen(false)}
        footer={
          <>
            <button type="button" className="h-10 rounded border border-slate-200 px-4 text-sm font-semibold" onClick={() => setDiscountOpen(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className="h-10 rounded bg-slate-950 px-4 text-sm font-semibold text-white"
              onClick={() => {
                const value = Number(discountDraft.replace(",", "."));
                setDiscount(Number.isFinite(value) ? value : 0);
                setDiscountOpen(false);
                notify("Desconto aplicado ao pedido.", "green");
              }}
            >
              Aplicar
            </button>
          </>
        }
      >
        <input className="h-10 w-full rounded border border-slate-200 px-3" value={discountDraft} onChange={(event) => setDiscountDraft(event.target.value)} placeholder="Valor em R$" />
      </Modal>

      <Modal
        open={paymentOpen}
        title="Forma de pagamento"
        description={`Total a pagar: ${money(total)}`}
        onClose={() => setPaymentOpen(false)}
        footer={
          <button
            type="button"
            className="h-10 rounded bg-slate-950 px-4 text-sm font-semibold text-white"
            onClick={() => {
              setPaymentOpen(false);
              notify(`Pagamento definido como ${paymentMethod}.`, "green");
            }}
          >
            Confirmar pagamento
          </button>
        }
      >
        <select className="h-10 w-full rounded border border-slate-200 px-3" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
          <option>Dinheiro</option>
          <option>Pix</option>
          <option>Cartao de credito</option>
          <option>Cartao de debito</option>
          <option>Boleto</option>
          <option>Parcelamento</option>
        </select>
      </Modal>

      <Modal
        open={receiptOpen}
        title="Recibo"
        description="Resumo pronto para impressao."
        onClose={() => setReceiptOpen(false)}
        footer={
          <>
            <button
              type="button"
              className="h-10 rounded border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => {
                const receipt = receiptDetails ?? {
                  customer: activeCustomer,
                  channel,
                  paymentMethod,
                  subtotal,
                  discount,
                  total,
                  items: cart.map((item) => ({
                    sku: item.sku,
                    produto: item.produto,
                    qtd: item.qtd,
                    preco: priceToNumber(item.preco),
                    total: priceToNumber(item.preco) * item.qtd
                  }))
                };
                downloadReceipt(receipt, activeCustomer, channel, paymentMethod);
                notify("Recibo baixado para o computador.", "green");
              }}
            >
              Exportar
            </button>
            <button
              type="button"
              className="h-10 rounded bg-slate-950 px-4 text-sm font-semibold text-white"
              onClick={() => {
                setReceiptOpen(false);
                notify("Recibo enviado para impressao simulada.", "green");
              }}
            >
              Imprimir
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-700">
          <div className="rounded border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Comercial Hub</p>
                <h3 className="text-xl font-bold text-slate-950">DANFE visual de conferência</h3>
                <p className="mt-1 text-xs text-slate-500">Layout interno com aparência de nota para conferência comercial, impressão e download.</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Data de emissão</p>
                <p className="font-semibold text-slate-700">{new Date().toLocaleDateString("pt-BR")}</p>
                <p className="mt-2">Hora</p>
                <p className="font-semibold text-slate-700">{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Box title="Emitente" lines={["Comercial Hub", "Gestão Comercial Inteligente", "DANFE visual de conferência"]} />
              <Box title="Cliente" lines={[receiptDetails?.customer ?? activeCustomer, `Canal: ${receiptDetails?.channel ?? channel}`, `Pagamento: ${receiptDetails?.paymentMethod ?? paymentMethod}`]} />
            </div>

            <div className="mt-4 overflow-hidden rounded border border-slate-200 bg-white">
              <div className="grid grid-cols-[1.4fr_80px_110px_110px] gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold uppercase text-slate-500">
                <span>Produto</span>
                <span className="text-right">Qtd</span>
                <span className="text-right">Valor</span>
                <span className="text-right">Total</span>
              </div>
              {(receiptDetails?.items.length ? receiptDetails.items : cart.map((item) => ({ sku: item.sku, produto: item.produto, qtd: item.qtd, preco: priceToNumber(item.preco), total: priceToNumber(item.preco) * item.qtd }))).map((item) => (
                <div key={item.sku} className="grid grid-cols-[1.4fr_80px_110px_110px] gap-2 border-b border-slate-100 px-3 py-2 last:border-b-0">
                  <div className="min-w-0">
                    <strong className="block truncate text-slate-950">{item.produto}</strong>
                    <span className="text-xs text-slate-500">{item.sku}</span>
                  </div>
                  <span className="text-right">{item.qtd}</span>
                  <span className="text-right">{money(item.preco)}</span>
                  <span className="text-right font-semibold">{money(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_280px]">
              <div className="rounded border border-slate-200 bg-white p-3 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Observações de conferência</p>
                <p className="mt-1">Documento visual, não fiscal, emitido para conferência operacional e controle comercial.</p>
                <p className="mt-2">Vendedor: Lucas | Loja: Matriz | Sistema: Comercial Hub</p>
              </div>
              <div className="rounded border border-slate-200 bg-white p-3">
                <div className="space-y-1 text-sm">
                  <Line label="Subtotal" value={money(receiptDetails?.subtotal ?? subtotal)} />
                  <Line label="Desconto" value={money(receiptDetails?.discount ?? discount)} />
                  <Line label="Frete" value={money(0)} />
                  <Line label="Impostos" value={money(0)} />
                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <Line label="Total" value={money(receiptDetails?.total ?? total)} strong />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-xs text-slate-500">
              Comercial Hub - Gestão Comercial Inteligente | DANFE visual para validação e conferência
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Box({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="mt-2 space-y-1 text-sm text-slate-700">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <strong className={strong ? "text-base text-slate-950" : "text-slate-950"}>{value}</strong>
    </div>
  );
}
