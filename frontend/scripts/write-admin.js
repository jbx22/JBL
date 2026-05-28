const fs = require("fs");
const path = require("path");
const target = path.join(__dirname, "..", "src", "app", "admin", "page.tsx");
const content = `"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Activity, BadgeDollarSign, ChevronLeft, ChevronRight, CreditCard, FileText, FolderOpen, Key, LayoutDashboard, LogOut, RefreshCw, Search, ShieldAlert, SlidersHorizontal, Terminal, UserCheck, UserCog, UserMinus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = "user" | "admin" | "super_admin";
type AccountStatus = "active" | "suspended" | "deleted";
interface AdminOverview { principal: { userId: string; email: string; role: Role }; counts: Record<string, number>; tiers: { tier: string; count: number }[]; financials: { paidSubscriptions: number; pendingSubscriptions: number; activeSubscriptions: number; totalRevenueCents: number; revenue30dCents: number; payingUsers: number; averageRevenuePerPaidUserCents: number; currency: string }; signupsPerDay: { date: string; count: number }[]; revenuePerDay: { date: string; total: number; count: number }[]; recentUsers: { id: string; email: string; displayName: string | null; organisation: string | null; tier: string | null; messageCreditsUsed: number | null; role: Role | null; accountStatus: AccountStatus | null; createdAt: string }[]; admins: { id: string; email: string; displayName: string | null; role: Role; accountStatus: AccountStatus; suspensionReason: string | null }[]; auditLogs: { id: string; actorEmail: string | null; action: string; entityType: string; entityId: string | null; metadata: Record<string, unknown>; createdAt: string }[]; }

const FORMAT = new Intl.NumberFormat("en-US", { style: "currency", currency: "SAR" });
const TIERS = ["Free", "Explorer", "Business", "Founder Pro", "Enterprise"];
const TABS = [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { id: "users", label: "Users", icon: Users }, { id: "subscriptions", label: "Subscriptions", icon: CreditCard }, { id: "apikeys", label: "API & Usage", icon: Key }, { id: "audit", label: "Audit Log", icon: Terminal }];
type TabId = (typeof TABS)[number]["id"];

async function api<T>(p: string, i?: RequestInit): Promise<T> {
  const r = await fetch(p, { cache: "no-store", ...i, headers: { Accept: "application/json", ...(i?.headers as Record<string, string> || {}) } });
  if (!r.ok) { let d = "Request failed: " + r.status; try { const b = await r.clone().json(); d = b?.detail || d; } catch { d = (await r.text()) || d; } const e = new Error(d) as any; e.status = r.status; throw e; }
  return r.json() as Promise<T>;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof Users; color?: string }) {
  return <div className="rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md active:scale-[0.98]">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</span>
      <div className={"flex h-8 w-8 items-center justify-center rounded-md " + (color || "bg-gray-50 text-gray-500")}><Icon className="h-4 w-4" /></div>
    </div>
    <div className="text-2xl font-bold text-gray-950">{value}</div>
  </div>;
}

function BarChart({ data, h = 120, color = "#6366f1", valueKey = "count", fv }: { data: { [key: string]: string | number }[]; h?: number; color?: string; valueKey?: string; fv?: (v: number) => string }) {
  if (!data.length) return <div className="flex items-center justify-center text-xs text-gray-400" style={{ height: h }}>No data yet</div>;
  const max = Math.max(...data.map(d => Number(d[valueKey])), 1);
  return <div className="flex items-end gap-[2px]" style={{ height: h }}>
    {data.map((d, i) => { const v = Number(d[valueKey]), pct = (v / max) * 100;
      return <div key={i} className="group relative flex flex-1 cursor-pointer items-end" style={{ height: "100%" }}>
        <div className="w-full rounded-t transition-all hover:opacity-80" style={{ height: Math.max(pct, 2) + "%", backgroundColor: color }} />
        <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">{d.date || d.label}: {fv ? fv(v) : v}</div>
      </div>;
    })}
  </div>;
}

function Donut({ tiers }: { tiers: { tier: string; count: number }[] }) {
  const total = tiers.reduce((s, t) => s + t.count, 0);
  if (total === 0) return <div className="flex items-center justify-center text-sm text-gray-400">No subscriptions yet</div>;
  const colors = ["#6366f1", "#c9a84c", "#22c55e", "#f97316", "#ef4444"];
  let cum = 0;
  return <div className="flex flex-col items-center gap-4">
    <div className="relative h-36 w-36">
      {tiers.map((t, i) => { const pct = t.count / total, da = pct * 283, off = -(cum / total) * 283; cum += t.count;
        return <svg key={t.tier} className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke={colors[i % colors.length]} strokeWidth="10" strokeDasharray={da + " 283"} strokeDashoffset={off} strokeLinecap="round" />
        </svg>;
      })}
      <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold text-gray-950">{total}</span></div>
    </div>
    <div className="flex flex-wrap justify-center gap-3">
      {tiers.map((t, i) => <div key={t.tier} className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
        <span className="text-xs text-gray-600">{t.tier} ({t.count})</span>
      </div>)}
    </div>
  </div>;
}

function AuditRow({ log, expanded, onToggle }: { log: AdminOverview["auditLogs"][0]; expanded: boolean; onToggle: () => void }) {
  return <div className="rounded-lg border border-gray-200 bg-white transition hover:border-gray-300">
    <button onClick={onToggle} className="flex w-full items-center justify-between p-3 text-left">
      <div className="flex items-center gap-2">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">{log.action}</span>
        <span className="text-xs text-gray-500">{log.entityType}</span>
        {log.entityId && <span className="font-mono text-xs text-gray-400">{log.entityId.slice(0, 8)}…</span>}
      </div>
      <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
    </button>
    <div className="px-3 pb-2 text-xs text-gray-500">by {log.actorEmail || "System"}</div>
    {expanded && Object.keys(log.metadata).length > 0 && <div className="border-t border-gray-100 px-3 pb-3 pt-2">
      <pre className="overflow-x-auto rounded-md bg-gray-50 p-2 text-xs text-gray-600">{JSON.stringify(log.metadata, null, 2)}</pre>
    </div>}
  </div>;
}

export default function AdminPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const [userPage, setUserPage] = useState(0);
  const USERS_PER_PAGE = 20;
  const [auditSearch, setAuditSearch] = useState("");
  const [auditTimeFilter, setAuditTimeFilter] = useState<string>("all");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [auditExpanded, setAuditExpanded] = useState<Set<string>>(new Set());
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyResult, setNewKeyResult] = useState<{ key: string; label: string } | null>(null);

  useEffect(() => { const h = window.location.hash.replace("#", "") as TabId; if (TABS.some(t => t.id === h)) setActiveTab(h); }, []);
  useEffect(() => { window.location.hash = activeTab; }, [activeTab]);
  useEffect(() => { setUserPage(0); }, [userSearch, userStatusFilter]);

  const load = useCallback(async () => {
    setError(null); setAccessDenied(false); setRefreshing(true);
    try { const d = await api<AdminOverview>("/api/admin/overview"); setOverview(d); }
    catch (err) { if ((err as any)?.status === 401) { router.replace("/login?callbackUrl=/admin"); return; } if ((err as any)?.status === 403) { setAccessDenied(true); return; } setError(err instanceof Error ? err.message : "Failed to load"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [router]);
  useEffect(() => { load(); }, [load]);

  const totalRevenue = overview ? FORMAT.format((overview.financials.totalRevenueCents ?? 0) / 100) : "";
  const revenue30d = overview ? FORMAT.format((overview.financials.revenue30dCents ?? 0) / 100) : "";

  const filteredUsers = useMemo(() => {
    if (!overview?.recentUsers) return [];
    return overview.recentUsers.filter(u => {
      const q = userSearch.toLowerCase();
      if (q && !u.email.toLowerCase().includes(q) && !(u.displayName || "").toLowerCase().includes(q) && !(u.organisation || "").toLowerCase().includes(q)) return false;
      if (userStatusFilter !== "all" && (u.accountStatus || "active") !== userStatusFilter) return false;
      return true;
    });
  }, [overview, userSearch, userStatusFilter]);

  const paginatedUsers = filteredUsers.slice(userPage * USERS_PER_PAGE, (userPage + 1) * USERS_PER_PAGE);
  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const allActions = useMemo(() => { if (!overview?.auditLogs) return []; return [...new Set(overview.auditLogs.map(l => l.action))]; }, [overview]);

  const filteredAudit = useMemo(() => {
    if (!overview?.auditLogs) return [];
    return overview.auditLogs.filter(l => {
      if (auditActionFilter !== "all" && l.action !== auditActionFilter) return false;
      if (auditSearch) { const q = auditSearch.toLowerCase(); if (!(l.actorEmail || "").toLowerCase().includes(q) && !l.action.toLowerCase().includes(q) && !l.entityType.toLowerCase().includes(q)) return false; }
      if (auditTimeFilter !== "all") { const ms = auditTimeFilter === "24h" ? 86400000 : auditTimeFilter === "7d" ? 604800000 : 2592000000; if (Date.now() - new Date(l.createdAt).getTime() > ms) return false; }
      return true;
    });
  }, [overview, auditSearch, auditTimeFilter, auditActionFilter]);

  const updateUser = async (id: string, body: Record<string, unknown>) => {
    setSaving(true); setError(null);
    try { await api("/api/admin/users/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Update failed"); } finally { setSaving(false); }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newKeyLabel.trim()) return;
    setSaving(true); setError(null); setNewKeyResult(null);
    try { const r = await api<{ key: string; label: string }>("/api/admin/api-keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: newKeyLabel.trim() }) }); setNewKeyResult(r); setNewKeyLabel(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to create API key"); } finally { setSaving(false); }
  };

  const toggleExpand = (id: string) => setAuditExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return <div className="flex h-full min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-gray-950" />
      <span className="text-sm text-gray-500">Loading admin dashboard…</span>
    </div>
  </div>;
  if (error && !overview) return <div className="mx-auto max-w-xl p-8">
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100"><ShieldAlert className="h-5 w-5 text-red-600" /></div>
      <h2 className="text-lg font-semibold text-red-800">Dashboard unavailable</h2>
      <p className="mt-1 text-sm text-red-600">{error}</p>
      <div className="mt-4 flex justify-center gap-3">
        <Button type="button" onClick={load} className="bg-black text-white hover:bg-gray-900">Retry</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/")}>Back to site</Button>
      </div>
    </div>
  </div>;
  if (accessDenied) return <div className="flex h-full min-h-[60vh] items-center justify-center bg-gray-50 p-6">
    <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><ShieldAlert className="h-6 w-6" /></div>
      <h1 className="text-xl font-semibold text-gray-950">Admin access required</h1>
      <p className="mt-2 text-sm leading-6 text-gray-600">This dashboard requires admin or super admin privileges.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" className="bg-black text-white hover:bg-gray-900" onClick={() => signOut({ callbackUrl: "/login?callbackUrl=/admin" })}>Sign out and retry</Button>
        <Button type="button" variant="outline" onClick={load}>Try again</Button>
      </div>
    </div>
  </div>;
  if (!overview) return null;
  const isSuperAdmin = overview.principal.role === "super_admin";

  return <div className="min-h-screen bg-gray-50">
    <div className="mx-auto max-w-7xl px-3 py-3 md:px-6 md:py-6">
      <div className="mb-3 flex flex-col gap-3 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500"><LayoutDashboard className="h-3.5 w-3.5 text-gray-400" /> AGD LAW AI Admin</div>
          <h1 className="mt-1 text-xl font-bold text-gray-950 md:text-2xl">Admin Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">{overview.principal.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && <Button type="button" variant="outline" size="sm" onClick={() => router.push("/super-admin")} className="hidden border-gray-300 text-gray-700 hover:bg-gray-100 md:inline-flex"><ShieldAlert className="mr-1.5 h-3.5 w-3.5" />Governance</Button>}
          <button onClick={load} disabled={refreshing} className="rounded-md border border-gray-300 bg-white p-2 text-gray-500 transition hover:bg-gray-50 disabled:opacity-50" title="Refresh"><RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} /></button>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="rounded-md border border-gray-300 bg-white p-2 text-gray-500 transition hover:bg-gray-50" title="Sign out"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:mb-6"><div className="flex items-start gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer" onClick={() => setError(null)} /><span>{error}</span></div></div>}
      <div className="mb-4 overflow-x-auto md:mb-6">
        <div className="flex min-w-max gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {TABS.map(tab => { const Icon = tab.icon;
            return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={"flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition md:px-4 md:text-sm " + (activeTab === tab.id ? "bg-gray-950 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800")}>
              <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" /><span className="hidden sm:inline">{tab.label}</span><span className="sm:hidden">{tab.label.slice(0, 4)}</span>
            </button>;
          })}
        </div>
      </div>
      {activeTab === "dashboard" && <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Users" value={overview.counts.users} icon={Users} /><StatCard label="Active" value={overview.counts.activeUsers} icon={UserCheck} />
          <StatCard label="Suspended" value={overview.counts.suspendedUsers} icon={UserMinus} /><StatCard label="Revenue (30d)" value={revenue30d} icon={BadgeDollarSign} />
          <StatCard label="Total Revenue" value={totalRevenue} icon={CreditCard} /><StatCard label="AI Credits" value={overview.counts.aiCreditsUsed?.toLocaleString() || "0"} icon={SlidersHorizontal} />
          <StatCard label="Documents" value={overview.counts.documents} icon={FileText} /><StatCard label="Projects" value={overview.counts.projects} icon={FolderOpen} /><StatCard label="Chats" value={overview.counts.chats} icon={Activity} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-gray-800">Signups (30 days)</h3><BarChart data={overview.signupsPerDay} h={160} color="#6366f1" /></div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-gray-800">Revenue (30 days)</h3><BarChart data={overview.revenuePerDay} h={160} color="#c9a84c" valueKey="total" fv={v => FORMAT.format(v / 100)} /></div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">Plan Distribution</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <Donut tiers={overview.tiers} />
            <div className="space-y-2">{overview.tiers.map(t => { const total = overview.tiers.reduce((s, x) => s + x.count, 0); const pct = total > 0 ? Math.round((t.count / total) * 100) : 0;
              const tc = t.tier === "Founder Pro" ? "#c9a84c" : t.tier === "Enterprise" ? "#ef4444" : t.tier === "Business" ? "#22c55e" : t.tier === "Explorer" ? "#6366f1" : "#9ca3af";
              return <div key={t.tier} className="flex items-center gap-3"><span className="w-28 text-sm text-gray-600">{t.tier}</span><div className="h-3 flex-1 rounded-full bg-gray-100"><div className="h-3 rounded-full" style={{ width: pct + "%", backgroundColor: tc }} /></div><span className="w-12 text-right text-sm font-medium text-gray-700">{pct}%</span></div>;
            })}</div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3"><h3 className="text-sm font-semibold text-gray-800">Recent Events</h3><button onClick={() => setActiveTab("audit")} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View all →</button></div>
          <div className="divide-y divide-gray-100">{overview.auditLogs.length === 0 ? <div className="p-6 text-center text-sm text-gray-500">No audit events yet</div> : overview.auditLogs.slice(0, 8).map(log => {
            return <div key={log.id} className="flex items-center justify-between px-4 py-2.5"><div className="flex items-center gap-2"><span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">{log.action}</span><span className="text-xs text-gray-400">{log.entityType}</span></div><div className="text-right"><span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</span><div className="text-xs text-gray-400">{log.actorEmail || "System"}</div></div></div>;
          })}</div>
        </div>
      </div>}
      {activeTab === "users" && <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search by name, email, organisation…" value={userSearch} onChange={e => setUserSearch(e.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400" /></div>
          <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400"><option value="all">All status</option><option value="active">Active</option><option value="suspended">Suspended</option></select>
        </div>
        <p className="text-xs text-gray-500">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</p>
        <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-500"><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Org</th><th className="px-4 py-3 font-medium">Tier</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Credits</th><th className="px-4 py-3 font-medium">Joined</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-50">{paginatedUsers.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">No users found</td></tr> : paginatedUsers.map(u => <tr key={u.id} className="hover:bg-gray-50">
              <td className="px-4 py-3"><div className="font-medium text-gray-900">{u.displayName || "Unnamed"}</div><div className="text-xs text-gray-500">{u.email}</div></td>
              <td className="px-4 py-3 text-sm text-gray-500">{u.organisation || "—"}</td>
              <td className="px-4 py-3"><select disabled={saving} value={u.tier || "Free"} onChange={e => updateUser(u.id, { tier: e.target.value })} className="h-8 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 disabled:opacity-50">{TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select></td>
              <td className="px-4 py-3"><select disabled={saving} value={u.accountStatus || "active"} onChange={e => updateUser(u.id, { accountStatus: e.target.value, suspensionReason: e.target.value === "suspended" ? "Suspended by admin" : null })} className="h-8 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 disabled:opacity-50"><option value="active">Active</option><option value="suspended">Suspend</option></select></td>
              <td className="px-4 py-3 text-sm text-gray-500">{u.messageCreditsUsed ?? 0}</td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3"><button disabled={saving} onClick={() => updateUser(u.id, { messageCreditsUsed: 0 })} className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-50 disabled:opacity-50">Reset</button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="space-y-2 md:hidden">{paginatedUsers.length === 0 ? <div className="text-center text-sm text-gray-500">No users found</div> : paginatedUsers.map(u => <div key={u.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="mb-2 flex items-start justify-between"><div className="min-w-0 flex-1"><div className="truncate font-medium text-gray-900">{u.displayName || "Unnamed"}</div><div className="truncate text-xs text-gray-500">{u.email}</div></div><span className={"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium " + ((u.accountStatus || "active") === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>{u.accountStatus || "active"}</span></div>
          <div className="mb-3 flex flex-wrap gap-1.5 text-xs text-gray-500"><span>{u.organisation || "No org"}</span><span>·</span><span>{u.messageCreditsUsed ?? 0} credits</span><span>·</span><span>{new Date(u.createdAt).toLocaleDateString()}</span></div>
          <div className="flex flex-wrap gap-2">
            <select disabled={saving} value={u.tier || "Free"} onChange={e => updateUser(u.id, { tier: e.target.value })} className="h-8 flex-1 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 disabled:opacity-50">{TIERS.map(t => <option key={t} value={t}>{t}</option>)}</select>
            <select disabled={saving} value={u.accountStatus || "active"} onChange={e => updateUser(u.id, { accountStatus: e.target.value })} className="h-8 flex-1 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 disabled:opacity-50"><option value="active">Active</option><option value="suspended">Suspend</option></select>
            <button disabled={saving} onClick={() => updateUser(u.id, { messageCreditsUsed: 0 })} className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-600 disabled:opacity-50">Reset</button>
          </div>
        </div>)}</div>
        {totalUserPages > 1 && <div className="flex items-center justify-center gap-2">
          <button onClick={() => setUserPage(p => Math.max(0, p - 1))} disabled={userPage === 0} className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm text-gray-500">Page {userPage + 1} of {totalUserPages}</span>
          <button onClick={() => setUserPage(p => Math.min(totalUserPages - 1, p + 1))} disabled={userPage >= totalUserPages - 1} className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
        </div>}
      </div>}
      {activeTab === "subscriptions" && <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Revenue" value={totalRevenue} icon={CreditCard} /><StatCard label="30-Day Revenue" value={revenue30d} icon={BadgeDollarSign} />
          <StatCard label="Paid Subs" value={overview.financials.paidSubscriptions} icon={UserCheck} /><StatCard label="Active Subs" value={overview.financials.activeSubscriptions} icon={UserCog} />
          <StatCard label="Pending" value={overview.financials.pendingSubscriptions} icon={Activity} /><StatCard label="Paying Users" value={overview.financials.payingUsers} icon={Users} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><h3 className="mb-4 text-sm font-semibold text-gray-800">Plan distribution</h3><Donut tiers={overview.tiers} /></div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-800">Financial summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: "Paid subscriptions", value: overview.financials.paidSubscriptions }, { label: "Pending payments", value: overview.financials.pendingSubscriptions }, { label: "Active subscriptions", value: overview.financials.activeSubscriptions }, { label: "Paying users", value: overview.financials.payingUsers }, { label: "ARPU", value: FORMAT.format((overview.financials.averageRevenuePerPaidUserCents || 0) / 100) }, { label: "30d Revenue", value: revenue30d }].map(item => <div key={item.label} className="rounded-md bg-gray-50 p-3"><div className="text-xs text-gray-500">{item.label}</div><div className="mt-1 text-lg font-semibold text-gray-900">{item.value}</div></div>)}
            </div>
          </div>
        </div>
      </div>}
      {activeTab === "apikeys" && <div className="space-y-4">
        <form onSubmit={createApiKey} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Create new API key</h3>
          <div className="flex gap-2">
            <Input placeholder="Key label (e.g. CI/CD, Dev)" value={newKeyLabel} onChange={e => setNewKeyLabel(e.target.value)} required className="flex-1 border-gray-200" />
            <Button type="submit" disabled={saving || !newKeyLabel.trim()} className="bg-gray-950 text-white hover:bg-gray-800">{saving ? "Creating…" : "Create"}</Button>
          </div>
        </form>
        {newKeyResult && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
          <h4 className="mb-1 font-semibold text-amber-800">API key created — copy it now, it won&apos;t be shown again</h4>
          <div className="rounded-md bg-white p-2 font-mono text-xs text-gray-800">Label: {newKeyResult.label}</div>
          <div className="mt-1 rounded-md bg-white p-2 font-mono text-xs text-gray-800 break-all">Key: {newKeyResult.key}</div>
          <button onClick={() => setNewKeyResult(null)} className="mt-2 rounded-md border border-amber-300 bg-white px-3 py-1 text-xs text-amber-700 transition hover:bg-amber-100">Dismiss</button>
        </div>}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="AI Credits" value={overview.counts.aiCreditsUsed?.toLocaleString() || "0"} icon={SlidersHorizontal} />
          <StatCard label="Chats" value={overview.counts.chats} icon={Activity} /><StatCard label="Documents" value={overview.counts.documents} icon={FileText} /><StatCard label="Projects" value={overview.counts.projects} icon={FolderOpen} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Usage by plan</h3>
          <div className="space-y-3">{overview.tiers.length === 0 ? <p className="text-sm text-gray-500">No tier data available</p> : overview.tiers.map(t => <div key={t.tier} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"><span className="text-sm font-medium text-gray-700">{t.tier}</span><span className="text-sm text-gray-600">{t.count} user{t.count !== 1 ? "s" : ""}</span></div>)}</div>
        </div>
      </div>}
      {activeTab === "audit" && <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search by actor, action, entity…" value={auditSearch} onChange={e => setAuditSearch(e.target.value)} className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 placeholder:text-gray-400" /></div>
          <select value={auditActionFilter} onChange={e => setAuditActionFilter(e.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400"><option value="all">All actions</option>{allActions.map(a => <option key={a} value={a}>{a}</option>)}</select>
          <select value={auditTimeFilter} onChange={e => setAuditTimeFilter(e.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-400"><option value="all">All time</option><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select>
        </div>
        <p className="text-xs text-gray-500">{filteredAudit.length} event{filteredAudit.length !== 1 ? "s" : ""}</p>
        <div className="space-y-2">{filteredAudit.length === 0 ? <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">No audit events found</div> : filteredAudit.map(log => <AuditRow key={log.id} log={log} expanded={auditExpanded.has(log.id)} onToggle={() => toggleExpand(log.id)} />)}</div>
      </div>}
    </div>
  </div>;
}
`;

fs.writeFileSync(target, content, "utf-8");
const stat = fs.statSync(target);
console.log("OK: " + target + " [" + stat.size + " bytes]");
