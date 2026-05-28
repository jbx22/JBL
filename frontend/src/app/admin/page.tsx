"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = "user" | "admin" | "super_admin";
type AccountStatus = "active" | "suspended" | "deleted";

type AdminOverview = {
  principal: { userId: string; email: string; role: Role };
  counts: Record<
    | "users"
    | "activeUsers"
    | "suspendedUsers"
    | "admins"
    | "projects"
    | "documents"
    | "chats"
    | "tabularReviews"
    | "aiCreditsUsed",
    number
  >;
  tiers: { tier: string; count: number }[];
  financials: {
    paidSubscriptions: number;
    pendingSubscriptions: number;
    activeSubscriptions: number;
    totalRevenueCents: number;
    revenue30dCents: number;
    payingUsers: number;
    averageRevenuePerPaidUserCents: number;
    currency: string;
  };
  signupsPerDay: { date: string; count: number }[];
  revenuePerDay: { date: string; total: number; count: number }[];
  recentUsers: {
    id: string;
    email: string;
    displayName: string | null;
    organisation: string | null;
    tier: string | null;
    messageCreditsUsed: number | null;
    role: Role | null;
    accountStatus: AccountStatus | null;
    createdAt: string;
  }[];
  admins: {
    id: string;
    email: string;
    displayName: string | null;
    role: Role;
    accountStatus: AccountStatus;
    suspensionReason: string | null;
    updatedAt?: string;
  }[];
  auditLogs: {
    id: string;
    actorEmail: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
  }[];
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "SAR",
});

type TabId = "dashboard" | "users" | "audit";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  if (!response.ok) {
    let detail = `Request failed: ${response.status}`;
    try {
      const body = await response.clone().json();
      detail = body?.detail || detail;
    } catch {
      detail = (await response.text()) || detail;
    }
    const error = new Error(detail) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return response.json() as Promise<T>;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            color || "bg-gray-50 text-gray-500"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-950">{value}</div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(0);
  const [auditExpanded, setAuditExpanded] = useState<Set<string>>(new Set());
  const USERS_PER_PAGE = 15;

  const loadOverview = useCallback(async () => {
    setError(null);
    setAccessDenied(false);
    setRefreshing(true);
    try {
      const data = await api<AdminOverview>("/api/admin/overview");
      setOverview(data);
    } catch (err) {
      if (err instanceof Error && "status" in err && err.status === 401) {
        router.replace("/login?callbackUrl=/admin");
        return;
      }
      if (err instanceof Error && "status" in err && err.status === 403) {
        setAccessDenied(true);
        return;
      }
      setError(
        err instanceof Error ? err.message : "Failed to load admin console"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // Derived
  const totalRevenue = useMemo(
    () => money.format((overview?.financials.totalRevenueCents ?? 0) / 100),
    [overview]
  );

  const filteredUsers = useMemo(() => {
    if (!overview?.recentUsers) return [];
    return overview.recentUsers.filter((u) => {
      const q = userSearch.toLowerCase();
      if (
        q &&
        !u.email.toLowerCase().includes(q) &&
        !(u.displayName || "").toLowerCase().includes(q) &&
        !(u.organisation || "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [overview, userSearch]);

  const paginatedUsers = useMemo(
    () =>
      filteredUsers.slice(
        userPage * USERS_PER_PAGE,
        (userPage + 1) * USERS_PER_PAGE
      ),
    [filteredUsers, userPage]
  );
  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  const toggleAuditExpand = (id: string) => {
    setAuditExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    setUserPage(0);
  }, [userSearch]);

  const handleUpdateUser = async (
    userId: string,
    body: Record<string, unknown>
  ) => {
    setError(null);
    try {
      await api(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await loadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#c9a84c]" />
          <span className="text-sm text-gray-500">
            Loading admin panel…
          </span>
        </div>
      </div>
    );
  }

  // Access denied
  if (accessDenied) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-red-800">
            Access denied
          </h2>
          <p className="mt-1 text-sm text-red-600">
            You do not have admin permissions.
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error && !overview) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <h2 className="text-lg font-semibold text-red-800">
            Administration panel unavailable
          </h2>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadOverview()}
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Retry
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-1 h-3 w-3" /> Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const profile = overview?.principal;
  const counts = overview?.counts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 text-white">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                Admin Console
              </h1>
              <p className="text-[11px] text-gray-500">
                {profile?.email ?? ""} · {profile?.role ?? ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadOverview()}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-1 h-3.5 w-3.5" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="-mb-px flex gap-6">
            {[
              { id: "dashboard" as TabId, label: "Dashboard", icon: BarChart3 },
              { id: "users" as TabId, label: "Users", icon: Users },
              { id: "audit" as TabId, label: "Audit Log", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error bar */}
      {error && overview && (
        <div className="mx-auto mt-2 max-w-7xl px-4">
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            <X className="h-4 w-4 cursor-pointer" onClick={() => setError(null)} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              <StatCard
                label="Total Users"
                value={counts?.users ?? 0}
                icon={Users}
                color="bg-blue-50 text-blue-600"
              />
              <StatCard
                label="Active Users"
                value={counts?.activeUsers ?? 0}
                icon={UserCheck}
                color="bg-green-50 text-green-600"
              />
              <StatCard
                label="Suspended"
                value={counts?.suspendedUsers ?? 0}
                icon={UserMinus}
                color="bg-red-50 text-red-600"
              />
              <StatCard
                label="Admins"
                value={counts?.admins ?? 0}
                icon={ShieldAlert}
                color="bg-amber-50 text-amber-600"
              />
              <StatCard
                label="Projects"
                value={counts?.projects ?? 0}
                icon={FileText}
                color="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                label="Documents"
                value={counts?.documents ?? 0}
                icon={FileText}
                color="bg-purple-50 text-purple-600"
              />
              <StatCard
                label="Total Revenue"
                value={totalRevenue}
                icon={TrendingUp}
                color="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                label="Paying Users"
                value={overview?.financials.payingUsers ?? 0}
                icon={CreditCard}
                color="bg-cyan-50 text-cyan-600"
              />
            </div>

            {/* Recent signups chart (simple bar) */}
            {overview?.signupsPerDay && overview.signupsPerDay.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Signups (last 30 days)
                </h3>
                <div className="flex h-24 items-end gap-[3px]">
                  {overview.signupsPerDay.map((d, i) => {
                    const maxCount = Math.max(
                      ...overview.signupsPerDay.map((s) => s.count),
                      1
                    );
                    const pct = (d.count / maxCount) * 100;
                    return (
                      <div
                        key={i}
                        className="group relative flex flex-1 cursor-pointer items-end"
                        style={{ height: "100%" }}
                      >
                        <div
                          className="w-full rounded-t bg-[#6366f1] transition-all hover:opacity-80"
                          style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                        <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                          {d.date}: {d.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by email, name, or organisation…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Users table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Organisation</th>
                    <th className="px-4 py-3 font-medium">Tier</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="max-w-[200px] truncate px-4 py-3 font-medium text-gray-900">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {u.displayName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {u.organisation || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {u.tier || "Free"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {u.role || "user"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.accountStatus === "active"
                              ? "bg-green-50 text-green-700"
                              : u.accountStatus === "suspended"
                                ? "bg-red-50 text-red-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.accountStatus === "active" && (
                            <UserCheck className="h-3 w-3" />
                          )}
                          {u.accountStatus === "suspended" && (
                            <UserMinus className="h-3 w-3" />
                          )}
                          {u.accountStatus || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() =>
                              handleUpdateUser(u.id, {
                                accountStatus:
                                  u.accountStatus === "active"
                                    ? "suspended"
                                    : "active",
                              })
                            }
                          >
                            {u.accountStatus === "active"
                              ? "Suspend"
                              : "Reactivate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalUserPages > 1 && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Page {userPage + 1} of {totalUserPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPage === 0}
                    onClick={() => setUserPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPage >= totalUserPages - 1}
                    onClick={() =>
                      setUserPage((p) =>
                        Math.min(totalUserPages - 1, p + 1)
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Audit Log
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {(overview?.auditLogs ?? []).length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">
                    No audit log entries yet
                  </div>
                ) : (
                  (overview?.auditLogs ?? []).map((log) => (
                    <div key={log.id} className="px-4 py-3">
                      <div
                        className="flex cursor-pointer items-start justify-between"
                        onClick={() => toggleAuditExpand(log.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-mono text-gray-600">
                              {log.action}
                            </span>
                            <span className="text-xs text-gray-500">
                              {log.actorEmail || "system"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {auditExpanded.has(log.id) && log.metadata && (
                        <pre className="mt-2 max-h-32 overflow-auto rounded bg-gray-50 p-2 text-[11px] text-gray-600">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
