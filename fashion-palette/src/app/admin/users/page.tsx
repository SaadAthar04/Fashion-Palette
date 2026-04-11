"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

type UserRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  orderCount: number;
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      return res.json();
    },
  });

  const allUsers: UserRow[] = data?.users || [];
  const filtered = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <div className="mb-6 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-muted">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Orders</th>
                <th className="p-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted">No users found</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-surface/50">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-muted">{user.email}</td>
                    <td className="p-4 text-muted">{user.phone || "-"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">{user.orderCount}</td>
                    <td className="p-4 text-muted">{new Date(user.createdAt).toLocaleDateString("en-PK")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
