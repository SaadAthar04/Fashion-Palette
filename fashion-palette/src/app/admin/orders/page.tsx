"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Eye, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const buildParams = (extra?: Record<string, string>) => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("q", search);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    Object.entries(extra || {}).forEach(([k, v]) => params.set(k, v));
    return params;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter, search, from, to, page],
    queryFn: async () => {
      const res = await fetch(`/api/orders?${buildParams()}`);
      return res.json();
    },
  });

  const exportCsv = () => {
    const params = buildParams({ format: "csv" });
    params.delete("page");
    params.delete("limit");
    window.open(`/api/orders?${params}`, "_blank");
  };

  const orders = data?.orders || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order #, name, phone, email, payment ref…"
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
        >
          <option value="all">All Statuses</option>
          {Object.entries(ORDER_STATUSES).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted whitespace-nowrap">From</label>
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white" />
          <label className="text-xs text-muted whitespace-nowrap">To</label>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted">No orders found</td></tr>
              ) : (
                orders.map((order: { id: number; orderNumber: string; user?: { name: string; email: string } | null; items: unknown[]; total: string; paymentMethod: string; status: string; createdAt: string }) => {
                  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
                  return (
                    <tr key={order.id} className="hover:bg-surface/50">
                      <td className="p-4 font-medium">{order.orderNumber}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{order.user?.name || "Guest"}</p>
                          <p className="text-xs text-muted">{order.user?.email || ""}</p>
                        </div>
                      </td>
                      <td className="p-4 text-muted">{order.items.length}</td>
                      <td className="p-4 font-medium">{formatPrice(order.total)}</td>
                      <td className="p-4 text-muted uppercase text-xs">{order.paymentMethod === "cod" ? "COD" : order.paymentMethod.replace(/_/g, " ")}</td>
                      <td className="p-4">
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", statusInfo?.color)}>
                          {statusInfo?.label || order.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted">{new Date(order.createdAt).toLocaleDateString("en-PK")}</td>
                      <td className="p-4">
                        <Link href={`/admin/orders/${order.id}`} className="p-1.5 hover:text-accent transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-surface">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm px-3">{page} / {pagination.totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="p-2 border border-border rounded-lg disabled:opacity-50 hover:bg-surface">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
