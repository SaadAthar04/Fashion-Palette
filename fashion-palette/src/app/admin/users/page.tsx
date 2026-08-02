"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

type UserRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
};

const ROLE_OPTIONS = [
  { value: "customer", label: "Customer" },
  { value: "catalogue_editor", label: "Catalogue Editor" },
  { value: "order_manager", label: "Order Manager" },
  { value: "admin", label: "Admin" },
];

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  order_manager: "bg-blue-100 text-blue-800",
  catalogue_editor: "bg-teal-100 text-teal-800",
  customer: "bg-gray-100 text-gray-700",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await fetch("/api/users")).json(),
  });

  const patchUser = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: Record<string, unknown> }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeRole = (u: UserRow, role: string) => {
    if (role === u.role) return;
    patchUser.mutate(
      { id: u.id, body: { role } },
      { onSuccess: () => toast.success(`${u.name} is now ${role.replace(/_/g, " ")}.`) }
    );
  };

  const toggleActive = async (u: UserRow) => {
    if (u.isActive) {
      const ok = await confirm({
        title: "Deactivate this account?",
        message: `${u.name} will be signed out and blocked from logging in or performing any action until reactivated.`,
        confirmText: "Deactivate",
        cancelText: "Keep active",
        danger: true,
      });
      if (!ok) return;
    }
    patchUser.mutate(
      { id: u.id, body: { isActive: !u.isActive } },
      { onSuccess: () => toast.success(`${u.name} ${u.isActive ? "deactivated" : "reactivated"}.`) }
    );
  };

  const allUsers: UserRow[] = data?.users || [];
  const q = search.toLowerCase();
  const filtered = allUsers.filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Users &amp; Staff</h1>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <div className="mb-6 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading…</div>
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Orders</th>
                <th className="p-4 font-semibold">Joined</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted">No users found</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className={cn("hover:bg-surface/50", !user.isActive && "opacity-60")}>
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-muted">{user.email}</td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user, e.target.value)}
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-1 focus:ring-accent",
                          ROLE_BADGE[user.role] || "bg-gray-100 text-gray-700"
                        )}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700")}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">{user.orderCount}</td>
                    <td className="p-4 text-muted">{new Date(user.createdAt).toLocaleDateString("en-PK")}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleActive(user)}
                        className={cn(
                          "text-xs font-medium hover:underline",
                          user.isActive ? "text-red-600" : "text-green-700"
                        )}
                      >
                        {user.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); queryClient.invalidateQueries({ queryKey: ["admin-users"] }); }} />}
    </div>
  );
}

function AddStaffModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "catalogue_editor", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create staff account");
      toast.success("Staff account created. Share the password securely.");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Staff Member</h2>
          <button onClick={onClose} className="text-muted hover:text-primary"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          <Input label="Phone (optional)" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
            >
              <option value="catalogue_editor">Catalogue Editor — products &amp; brands only</option>
              <option value="order_manager">Order Manager — orders &amp; returns</option>
              <option value="admin">Admin — full access</option>
            </select>
          </div>
          <Input label="Temporary Password (min 8 chars)" type="text" value={form.password} onChange={(e) => set("password", e.target.value)} required />
          <p className="text-xs text-muted">
            Email invites will be available once the email provider is set up. For now, share this password
            securely and ask the staff member to change it after first login.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Create Account</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
