import os

content = '''"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    Activity,
    BadgeDollarSign,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Clock,
    CreditCard,
    FileText,
    FolderOpen,
    Key,
    LayoutDashboard,
    Lock,
    LogOut,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    UserCog,
    Users,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────

type Role = "user" | "admin" | "super_admin";
type AccountStatus = "active" | "suspended" | "deleted";

type AdminAccount = {
    id: string;
    email: string;
    displayName: string | null;
    role: Role;
    accountStatus: AccountStatus;
    suspensionReason: string | null;
    createdAt?: string;
    updatedAt?: string;
};

type UserRow = {
    id: string;
    email: string;
    displayName: string | null;
    organisation: string | null;
    tier: string | null;
    messageCreditsUsed: number | null;
    role: Role | null;
    accountStatus: AccountStatus | null;
    createdAt: string;
};

type AuditLogEntry = {
    id: string;
    actorEmail: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
};

type SignupDay = { date: string; count: number };
type RevenueDay = { date: string; total: number; count: number };

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
    signupsPerDay: SignupDay[];
    revenuePerDay: RevenueDay[];
    recentUsers: UserRow[];
    admins: AdminAccount[];
    auditLogs: AuditLogEntry[];
};

// ─── Helpers ─────────────────────────────────────────────────

const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
});

function fmtNum(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString();
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function fmtDT(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function fmtRel(iso: string) {
    const d = Date.now() - new Date(iso).getTime();
    const m = Math.floor(d / 60000);
    if (m < 1) return "just now";
    if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    const days = Math.floor(h / 24);
    if (days < 30) return days + "d ago";
    return fmtDate(iso);
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const r = await fetch(path, {
        cache: "no-store",
        ...init,
        headers: {
            Accept: "application/json",
            ...(init?.headers as Record<string, string> | undefined),
        },
    });
    if (!r.ok) {
        let d = "Request failed: " + r.status;
        try {
            const b = await r.clone().json();
            d = b?.detail || d;
        } catch {
            d = (await r.text()) || d;
        }
        const e = new Error(d) as Error & { status?: number };
        e.status = r.status;
        throw e;
    }
    return r.json() as Promise<T>;
}

const TIERS = ["Free", "Explorer", "Business", "Founder Pro", "Enterprise"];

// ─── Pure CSS Bar Chart ──────────────────────────────────────

function BarChart({
    data,
    h = 160,
    color = "#1a1a2e",
    fv,
}: {
    data: { label: string; value: number }[];
    h?: number;
    color?: string;
    fv?: (v: number) => string;
}) {
    const mx = Math.max(...data.map((d) => d.value), 1);
    if (!data.length) {
        return (
            <div className="flex h-[160px] items-center justify-center text-xs text-gray-400">
                No data
            </div>
        );
    }
    const slice = data.slice(-30);
    return (
        <div className="w-full overflow-x-auto" style={{ height: h }}>
            <div className="flex h-full items-end gap-[2px] min-w-[200px]">
                {slice.map((d, i) => {
                    const p = (d.value / mx) * 100;
                    return (
                        <div
                            key={i}
                            className="group relative flex flex-1 flex-col items-center justify-end"
                            style={{ height: "100%" }}
                        >
                            <div
                                className="w-full rounded-t transition-all hover:opacity-80"
                                style={{
                                    height: Math.max(p, 1) + "%",
                                    backgroundColor: color,
                                    minHeight: d.value > 0 ? 4 : 0,
                                }}
                            />
                            <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-black px-2 py-1 text-[10px] text-white shadow group-hover:block whitespace-nowrap z-10">
                                {fv ? fv(d.value) : d.value}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Stat Card ───────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
    trend,
    tu,
    sub,
}: {
    label: string;
    value: string | number;
    icon: typeof Users;
    trend?: string;
    tu?: boolean;
    sub?: string;
}) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {label}
                </span>
                <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <div className="text-2xl font-bold text-gray-950">{value}</div>
            {(trend || sub) && (
                <div className="mt-1.5 flex items-center gap-2 text-xs">
                    {trend && (
                        <span
                            className={
                                "inline-flex items-center gap-0.5 font-medium " +
                                (tu !== undefined
                                    ? tu
                                        ? "text-emerald-600"
                                        : "text-red-600"
                                    : "text-gray-500")
                            }
                        >
                            {tu === true && <ChevronUp className="h-3 w-3" />}
                            {tu === false && <ChevronDown className="h-3 w-3" />}
                            {trend}
                        </span>
                    )}
                    {sub && <span className="text-gray-400">{sub}</span>}
                </div>
            )}
        </div>
    );
}

// ─── Slide-Up Panel (mobile editing modal) ───────────────────

function SlideUp({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) {
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
            <div
                className="absolute inset-0 bg-black/40 transition-opacity"
                onClick={onClose}
            />
            <div
                className="relative w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl md:max-w-lg md:rounded-2xl"
                style={{ animation: "su 200ms ease-out" }}
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                    <h3 className="text-base font-semibold text-gray-950">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="px-5 py-4">{children}</div>
                <style>{`@keyframes su { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
            </div>
        </div>
    );
}

// ─── Tab Definitions ─────────────────────────────────────────

type TabId = "dashboard" | "users" | "subscriptions" | "admins" | "apikeys" | "audit";

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard; ao?: boolean }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "subscriptions", label: "Subscriptions", icon: BadgeDollarSign },
    { id: "admins", label: "Admins", icon: ShieldCheck, ao: true },
    { id: "apikeys", label: "API Keys", icon: Key },
    { id: "audit", label: "Audit Log", icon: Clock },
];
'''

path = "jbl-biz-law/frontend/src/app/admin/page.tsx"
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Written {len(content)} bytes to {path}")
