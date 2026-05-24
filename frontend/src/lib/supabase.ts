/**
 * Minimal Drizzle-backed adapter that implements the subset of the Supabase
 * JS client used by the ported backend libraries (chatTools, userSettings,
 * documentVersions, etc.).
 *
 * This avoids a full library port while letting existing LLM/orchestration
 * code work against the Neon + Drizzle stack.
 */

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, or, inArray, desc, asc, isNull, isNotNull, sql as drizzleSql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

// --- Public type -----------------------------------------------------------

export type SupabaseClient = ReturnType<typeof createServerSupabase>;

const tableNameMap: Record<string, keyof typeof schema> = {
  admin_audit_logs: "adminAuditLogs",
  chat_messages: "chatMessages",
  document_edits: "documentEdits",
  document_versions: "documentVersions",
  hidden_workflows: "hiddenWorkflows",
  project_subfolders: "projectSubfolders",
  tabular_cells: "tabularCells",
  tabular_review_chat_messages: "tabularReviewChatMessages",
  tabular_review_chats: "tabularReviewChats",
  tabular_reviews: "tabularReviews",
  user_api_keys: "userApiKeys",
  user_profiles: "userProfiles",
  workflow_shares: "workflowShares",
};

// --- Adapter ---------------------------------------------------------------

class LazyQuery<T extends PgTable = PgTable> {
  private _table: T | null = null;
  private _selectCols: string | null = "*";
  private _filters: Array<() => unknown> = [];
  private _orderCol: string | null = null;
  private _orderDir: "asc" | "desc" = "asc";
  private _limitRows: number | null = null;
  private _insertData: Record<string, unknown>[] | null = null;
  private _updateData: Record<string, unknown> | null = null;
  private _isDelete = false;
  private _notFilters: Array<{ col: string; op: string; val: unknown }> = [];

  // -- chainable setters ----------------------------------------------------

  from(table: string) {
    const t = (schema as Record<string, unknown>)[tableNameMap[table] ?? table];
    if (!t) throw new Error(`Table "${table}" not in Drizzle schema`);
    this._table = t as unknown as T;
    return this as unknown as LazyQuery<T>;
  }

  select(cols: string = "*") {
    this._selectCols = cols;
    return this;
  }

  eq(col: string, val: unknown) {
    this._filters.push(() => eq((this._table as Record<string, unknown>)[col] as never, val as never));
    return this;
  }

  in(col: string, vals: unknown[]) {
    this._filters.push(() => inArray((this._table as Record<string, unknown>)[col] as never, vals as never[]));
    return this;
  }

  not(col: string, op: string, val: unknown) {
    // Supabase: .not("col", "is", null) <-> IS NOT NULL
    this._notFilters.push({ col, op, val });
    return this;
  }

  or(filterStr: string) {
    // Supabase .or("col.eq.val,col2.eq.val2") — parse and AND-together
    const parts = filterStr.split(",");
    const conds: ReturnType<typeof eq>[] = [];
    for (const part of parts) {
      const m = part.match(/^(\w+)\.eq\.(.+)$/);
      if (m) {
        conds.push(eq((this._table as Record<string, unknown>)[m[1]] as never, m[2] as never));
      }
    }
    if (conds.length > 0) this._filters.push(() => (conds.length === 1 ? conds[0] : or(...conds as [ReturnType<typeof eq>, ReturnType<typeof eq>, ...ReturnType<typeof eq>[]])));
    return this;
  }

  order(col: string, opts: { ascending: boolean }) {
    this._orderCol = col;
    this._orderDir = opts.ascending !== false ? "asc" : "desc";
    return this;
  }

  limit(n: number) {
    this._limitRows = n;
    return this;
  }

  insert(rows: Record<string, unknown> | Record<string, unknown>[]) {
    this._insertData = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(data: Record<string, unknown>) {
    this._updateData = data;
    return this;
  }

  delete() {
    this._isDelete = true;
    return this;
  }

  // -- execution ------------------------------------------------------------

  async maybeSingle() {
    this._limitRows = 1;
    const res = await this._execute();
    if ("error" in res) return { data: null, error: (res as { error: Error }).error };
    const rows = (res as { data: Record<string, unknown>[] }).data;
    return { data: rows.length > 0 ? rows[0] : null, error: null };
  }

  async single() {
    this._limitRows = 1;
    const res = await this._execute();
    if ("error" in res) return { data: null, error: (res as { error: Error }).error };
    const rows = (res as { data: Record<string, unknown>[] }).data;
    return rows.length > 0
      ? { data: rows[0], error: null }
      : { data: null, error: new Error("No rows returned") };
  }

  async then(resolve?: (v: unknown) => void, reject?: (e: unknown) => void) {
    try {
      const r = await this._execute();
      if (resolve) resolve(r);
      return r;
    } catch (e) {
      if (reject) reject(e);
      throw e;
    }
  }

  // -- internal -------------------------------------------------------------

  private _buildWhere() {
    if (!this._table) return undefined;
    const parts: ReturnType<typeof eq>[] = [];
    for (const f of this._filters) parts.push(f() as ReturnType<typeof eq>);
    for (const n of this._notFilters) {
      if (n.op === "is" && n.val === null) {
        parts.push(isNotNull((this._table as Record<string, unknown>)[n.col] as never));
      }
    }
    if (parts.length === 0) return undefined;
    return parts.length === 1 ? parts[0] : and(...parts as [ReturnType<typeof eq>, ReturnType<typeof eq>, ...ReturnType<typeof eq>[]]);
  }

  private async _execute(): Promise<{ data: Record<string, unknown>[]; error: null } | { data: null; error: Error }> {
    try {
      if (!this._table) throw new Error("No table selected — call .from() first");

      if (this._isDelete) {
        let q = (db.delete(this._table) as any).$dynamic() as any;
        const w = this._buildWhere();
        if (w) q = q.where(w);
        await q;
        return { data: [], error: null };
      }

      if (this._insertData) {
        const rows = await db.insert(this._table).values(this._insertData as any).returning();
        return { data: rows as Record<string, unknown>[], error: null };
      }

      if (this._updateData) {
        let q = (db.update(this._table) as any).set(this._updateData).$dynamic() as any;
        const w = this._buildWhere();
        if (w) q = q.where(w);
        const rows = await q.returning();
        return { data: rows as Record<string, unknown>[], error: null };
      }

      // SELECT
      let q: any;
      // Try to use typed select if possible
      q = (db.select() as any).from(this._table) as any;
      const w = this._buildWhere();
      if (w) q = q.where(w);
      if (this._orderCol) {
        const col = (this._table as Record<string, unknown>)[this._orderCol] as never;
        q = q.orderBy(this._orderDir === "asc" ? asc(col) : desc(col));
      }
      if (this._limitRows) q = q.limit(this._limitRows);

      const rows = await q;
      return { data: rows as Record<string, unknown>[], error: null };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
}

// --- Factory ---------------------------------------------------------------

export function createServerSupabase() {
  const proxy: Record<string, any> = {
    from: (table: string) => new LazyQuery().from(table),
  };

  // Trap to support arbitrary .from(table).select().eq()... chains
  return new Proxy(proxy, {
    get(target, prop) {
      if (typeof prop === "symbol") return undefined;
      if (prop in target) return target[prop];
      // Support direct table methods like .rpc()
      if (prop === "rpc") {
        return () => {
          throw new Error("RPC not implemented in Drizzle adapter");
        };
      }
      return undefined;
    },
  }) as unknown as ReturnType<typeof _createFactory>;
}

function _createFactory() {
  return {
    from: (table: string) => new LazyQuery().from(table),
    rpc: () => { throw new Error("RPC not supported"); },
  } as any;
}
