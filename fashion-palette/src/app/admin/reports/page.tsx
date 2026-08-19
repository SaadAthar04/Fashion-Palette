"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DollarSign, ShoppingCart, AlertTriangle, PackageX, CreditCard, RotateCcw, ShieldAlert } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

type IntegrityProduct = { id: number; name: string; sku: string; slug: string; basePrice: string; stock: number; publishStatus: string; brand: string | null };
type IntegrityReport = {
  lowPriceThreshold: number;
  totalIssues: number;
  zeroPrice: IntegrityProduct[];
  lowPrice: IntegrityProduct[];
  duplicateSku: { value: string; c: number }[];
  duplicateSlug: { value: string; c: number }[];
  missingImages: IntegrityProduct[];
  missingDescription: IntegrityProduct[];
  missingStock: IntegrityProduct[];
};

type Report = {
  sales: { allOrders: number; allRevenue: string; monthOrders: number; monthRevenue: string };
  statusBreakdown: { status: string; c: number }[];
  lowStock: { id: number; name: string; sku: string; stock: number; threshold: number; brand: string | null }[];
  outOfStock: { id: number; name: string; sku: string; brand: string | null }[];
  failedPayments: { id: number; orderNumber: string; total: string; createdAt: string }[];
  pendingReturns: number;
};

export default function AdminReportsPage() {
  const { data, isLoading } = useQuery<Report>({
    queryKey: ["admin-reports"],
    queryFn: async () => (await fetch("/api/reports")).json(),
  });

  const { data: integrity } = useQuery<IntegrityReport>({
    queryKey: ["admin-data-integrity"],
    queryFn: async () => (await fetch("/api/admin/data-integrity")).json(),
  });

  if (isLoading || !data) return <div className="p-12 text-center text-muted">Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon={DollarSign} label="Revenue (all time)" value={formatPrice(data.sales.allRevenue)} />
        <Stat icon={ShoppingCart} label="Orders (all time)" value={String(data.sales.allOrders)} />
        <Stat icon={DollarSign} label="Revenue this month" value={formatPrice(data.sales.monthRevenue)} accent />
        <Stat icon={ShoppingCart} label="Orders this month" value={String(data.sales.monthOrders)} accent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Order status breakdown */}
        <Panel title="Orders by status">
          {data.statusBreakdown.length === 0 ? (
            <Empty>No orders yet</Empty>
          ) : (
            <div className="space-y-2">
              {data.statusBreakdown.map((s) => {
                const info = ORDER_STATUSES[s.status as keyof typeof ORDER_STATUSES];
                return (
                  <div key={s.status} className="flex items-center justify-between text-sm">
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", info?.color)}>{info?.label || s.status}</span>
                    <span className="font-semibold">{s.c}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Attention needed */}
        <Panel title="Needs attention">
          <div className="space-y-3 text-sm">
            <Row icon={PackageX} label="Out of stock" value={data.outOfStock.length} tone={data.outOfStock.length ? "red" : "muted"} />
            <Row icon={AlertTriangle} label="Low stock" value={data.lowStock.length} tone={data.lowStock.length ? "amber" : "muted"} />
            <Row icon={CreditCard} label="Failed payments" value={data.failedPayments.length} tone={data.failedPayments.length ? "red" : "muted"} />
            <Row icon={RotateCcw} label="Open returns" value={data.pendingReturns} tone={data.pendingReturns ? "amber" : "muted"} link="/admin/returns" />
          </div>
        </Panel>
      </div>

      {/* Data integrity (Final feedback A1) */}
      {integrity && (
        <Panel
          title={
            <span className="flex items-center gap-2">
              <ShieldAlert className={cn("w-4 h-4", integrity.totalIssues ? "text-red-600" : "text-success")} />
              Catalogue data integrity {integrity.totalIssues ? `(${integrity.totalIssues} to review)` : "— all clear"}
            </span>
          }
          className="mb-6"
        >
          {integrity.totalIssues === 0 ? (
            <Empty>No pricing, duplicate, image, description or stock issues found. Safe to launch.</Empty>
          ) : (
            <div className="space-y-5">
              <IntegrityBlock title="Zero / invalid price (never publish)" tone="red" items={integrity.zeroPrice} />
              <IntegrityBlock title={`Unusually low price — below Rs ${integrity.lowPriceThreshold.toLocaleString("en-PK")} (check source currency)`} tone="amber" items={integrity.lowPrice} showPrice />
              <IntegrityBlock title="Published but out of stock" tone="amber" items={integrity.missingStock} />
              <IntegrityBlock title="Missing images" tone="amber" items={integrity.missingImages} />
              <IntegrityBlock title="Missing description" tone="amber" items={integrity.missingDescription} />
              {integrity.duplicateSku.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-red-600 mb-1">Duplicate SKUs</p>
                  <p className="text-[12px] text-muted">{integrity.duplicateSku.map((d) => `${d.value} (×${d.c})`).join(", ")}</p>
                </div>
              )}
              {integrity.duplicateSlug.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-red-600 mb-1">Duplicate slugs</p>
                  <p className="text-[12px] text-muted">{integrity.duplicateSlug.map((d) => `${d.value} (×${d.c})`).join(", ")}</p>
                </div>
              )}
            </div>
          )}
        </Panel>
      )}

      {/* Low stock table */}
      <Panel title={`Low stock (${data.lowStock.length})`} className="mb-6">
        {data.lowStock.length === 0 ? <Empty>All good — nothing low</Empty> : (
          <ReportTable
            headers={["Product", "Brand", "SKU", "Stock", "Threshold"]}
            rows={data.lowStock.map((p) => [
              <Link key="n" href={`/admin/products/${p.id}/edit`} className="text-accent hover:underline">{p.name}</Link>,
              p.brand || "—", p.sku, <span key="s" className="font-semibold text-amber-700">{p.stock}</span>, p.threshold,
            ])}
          />
        )}
      </Panel>

      {/* Out of stock table */}
      <Panel title={`Out of stock (${data.outOfStock.length})`} className="mb-6">
        {data.outOfStock.length === 0 ? <Empty>Nothing out of stock</Empty> : (
          <ReportTable
            headers={["Product", "Brand", "SKU"]}
            rows={data.outOfStock.map((p) => [
              <Link key="n" href={`/admin/products/${p.id}/edit`} className="text-accent hover:underline">{p.name}</Link>,
              p.brand || "—", p.sku,
            ])}
          />
        )}
      </Panel>

      {/* Failed payments */}
      <Panel title={`Failed payments (${data.failedPayments.length})`}>
        {data.failedPayments.length === 0 ? <Empty>No failed payments</Empty> : (
          <ReportTable
            headers={["Order", "Total", "Date"]}
            rows={data.failedPayments.map((o) => [
              <Link key="n" href={`/admin/orders/${o.id}`} className="text-accent hover:underline">{o.orderNumber}</Link>,
              formatPrice(o.total), new Date(o.createdAt).toLocaleDateString("en-PK"),
            ])}
          />
        )}
      </Panel>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-5", accent && "ring-1 ring-accent/20")}>
      <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-3">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}

function Panel({ title, children, className }: { title: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-5", className)}>
      <h2 className="text-sm font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Row({ icon: Icon, label, value, tone, link }: { icon: React.ElementType; label: string; value: number; tone: "red" | "amber" | "muted"; link?: string }) {
  const toneCls = tone === "red" ? "text-red-600" : tone === "amber" ? "text-amber-600" : "text-muted";
  const content = (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2"><Icon className={cn("w-4 h-4", toneCls)} /> {label}</span>
      <span className={cn("font-semibold", toneCls)}>{value}</span>
    </div>
  );
  return link ? <Link href={link} className="block hover:opacity-80">{content}</Link> : content;
}

function ReportTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[420px]">
        <thead>
          <tr className="text-left border-b border-border">
            {headers.map((h) => <th key={h} className="py-2 pr-4 font-semibold text-xs text-muted uppercase tracking-wide">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((cells, i) => (
            <tr key={i}>{cells.map((c, j) => <td key={j} className="py-2.5 pr-4">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted py-4 text-center">{children}</p>;
}

function IntegrityBlock({ title, tone, items, showPrice }: { title: string; tone: "red" | "amber"; items: IntegrityProduct[]; showPrice?: boolean }) {
  if (!items || items.length === 0) return null;
  const toneCls = tone === "red" ? "text-red-600" : "text-amber-700";
  return (
    <div>
      <p className={cn("text-[13px] font-semibold mb-1.5", toneCls)}>{title} ({items.length})</p>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px] min-w-[480px]">
          <thead>
            <tr className="text-left border-b border-border text-[10px] uppercase tracking-wide text-muted">
              <th className="py-1 pr-3">Product</th>
              <th className="py-1 pr-3">Brand</th>
              <th className="py-1 pr-3">SKU</th>
              {showPrice && <th className="py-1 pr-3">Price</th>}
              <th className="py-1 pr-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((p) => (
              <tr key={p.id}>
                <td className="py-1.5 pr-3"><Link href={`/admin/products/${p.id}/edit`} className="text-accent hover:underline">{p.name}</Link></td>
                <td className="py-1.5 pr-3">{p.brand || "—"}</td>
                <td className="py-1.5 pr-3 font-mono text-[11px]">{p.sku}</td>
                {showPrice && <td className="py-1.5 pr-3 whitespace-nowrap">{formatPrice(p.basePrice)}</td>}
                <td className="py-1.5 pr-3">
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", p.publishStatus === "published" ? "bg-red-100 text-red-700" : "bg-surface text-muted")}>
                    {p.publishStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
