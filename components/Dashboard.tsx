"use client";

import { useState, useEffect } from "react";
import {
  CreditCard, Calendar, TrendingDown, Sparkles,
  ChevronDown, ChevronUp, Check, AlertCircle,
  AlertTriangle, Plus, ExternalLink, Pencil,
  Trash2, X, Wallet,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import {
  Account, ACCOUNTS as DEFAULT_ACCOUNTS, STORE_COLORS, USER_PROFILE,
} from "@/lab/mock-data";

//helpers
function fmt(n: number) {
  return `R${n.toLocaleString("en-ZA")}`;
}

function daysUntil(dueDate: string): number {
  const mo: Record<string, number> = {
    Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,
    Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11,
  };
  const [d, m] = dueDate.split(" ");
  if (!d || !m) return 99;
  const now = new Date();
  const due = new Date(now.getFullYear(), mo[m], parseInt(d));
  if (due < now) due.setFullYear(now.getFullYear() + 1);
  return Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
}

// Store logo
const STORE_META: Record<string, { color: string; bg: string; abbr: string }> = {
  Truworths:   { color: "#fff", bg: "#8b5cf6", abbr: "TR" },
  "Ackemans":  { color: "#fff", bg: "#FF5722", abbr: "MRP" },
  Foschini:    { color: "#fff", bg: "#9C27B0", abbr: "TFG" },
};

function StoreLogo({ store, size = 36 }: { store: string; size?: number }) {
  const meta = STORE_META[store];
  const bg   = meta?.bg ?? "#64748b";
  const abbr = meta?.abbr ?? store.slice(0, 2).toUpperCase();
  return (
    <div
      className="store-logo"
      style={{
        width: size, height: size,
        background: bg,
        borderRadius: size * 0.28,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 2px 8px ${bg}55`,
      }}
    >
      <span style={{
        color: "#fff", fontSize: size * 0.28,
        fontWeight: 700, letterSpacing: "-0.02em",
        fontFamily: "var(--font-heading)",
      }}>
        {abbr}
      </span>
    </div>
  );
}

//Status badge
function Badge({ status }: { status: string }) {
  const map = {
    paid:    { cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",    icon: <Check className="w-3 h-3" />,          label: "Paid" },
    unpaid:  { cls: "bg-amber-50 text-amber-700 ring-amber-200",          icon: <AlertCircle className="w-3 h-3" />,    label: "Unpaid" },
    overdue: { cls: "bg-red-50 text-red-700 ring-red-200 badge-overdue",                icon: <AlertTriangle className="w-3 h-3" />,  label: "Overdue" },
  };
  const s = map[status as keyof typeof map] ?? map.unpaid;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

//Summary card
function SummaryCard({
  label, value, sub, icon, accent, bar, barColor, tag, tagColor,
}: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; accent: string;
  bar?: number;
  barColor?: string;
  tag?: string;
  tagColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col gap-2 summary-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accent + "15" }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <p className="text-xl font-bold text-slate-900 font-[var(--font-heading)] leading-tight">{value}</p>
      {bar !== undefined && (
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(bar, 100)}%`, background: barColor ?? accent }}
          />
        </div>
      )}
      <div className="flex items-center justify-between gap-2 min-h-[18px]">
        {sub && <p className="text-xs text-slate-400 leading-tight">{sub}</p>}
        {tag && (
          <span
            className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: (tagColor ?? accent) + "15", color: tagColor ?? accent }}
          >
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

// Add / Edit modal
function AccountModal({
  account, onSave, onClose,
}: {
  account?: Account; onSave: (a: Account) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Account>>(account ?? {
    store: "", balance: 0, limit: 0, minDue: 0,
    dueDate: "", status: "unpaid", interestRate: 20, storeUrl: "",
  });
  const set = (k: keyof Account, v: string | number) =>
    setForm(p => ({ ...p, [k]: v }));

  const save = () => {
    if (!form.store || !form.dueDate) return;
    onSave({
      id: account?.id ?? String(Date.now()),
      store: form.store!,
      balance: Number(form.balance) || 0,
      limit: Number(form.limit) || 0,
      minDue: Number(form.minDue) || 0,
      dueDate: form.dueDate!,
      status: (form.status as Account["status"]) || "unpaid",
      interestRate: Number(form.interestRate) || 20,
      storeUrl: form.storeUrl || "#",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.35)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            {account ? "Edit account" : "Add store account"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Store name *</label>
            <input
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="e.g. Edgars"
              value={form.store}
              onChange={e => set("store", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Balance (R)", key: "balance" as keyof Account },
              { label: "Credit limit (R)", key: "limit" as keyof Account },
              { label: "Minimum due (R)", key: "minDue" as keyof Account },
              { label: "Interest rate (%)", key: "interestRate" as keyof Account },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                <input
                  type="number"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                  value={form[key] as number}
                  onChange={e => set(key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Due date *</label>
              <input
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                placeholder="25 May"
                value={form.dueDate}
                onChange={e => set("dueDate", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Status</label>
              <select
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                value={form.status}
                onChange={e => set("status", e.target.value)}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Store payment URL</label>
            <input
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
              placeholder="https://..."
              value={form.storeUrl}
              onChange={e => set("storeUrl", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl text-white transition-colors"
            style={{ background: "oklch(0.66 0.13 75)" }}
          >
            {account ? "Save changes" : "Add account"}
          </button>
        </div>
      </div>
    </div>
  );
}

//Main Dashboard
export function Dashboard({
  onNavigateToAutopilot,
}: {
  onNavigateToAutopilot?: () => void;
}) {
  const [accounts, setAccounts]       = useState<Account[]>([]);
  const [modal, setModal]             = useState(false);
  const [editing, setEditing]         = useState<Account | undefined>();
  const [tipExpanded, setTipExpanded] = useState(false);
  const [chartReady, setChartReady]   = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("storeAccounts");
      setAccounts(saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS);
    } catch { setAccounts(DEFAULT_ACCOUNTS); }
  }, []);

  // Mount chart after a tick so Recharts fires the sweep animation
  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  const persist = (data: Account[]) => {
    setAccounts(data);
    localStorage.setItem("storeAccounts", JSON.stringify(data));
  };

  const openAdd  = () => { setEditing(undefined); setModal(true); };
  const openEdit = (a: Account) => { setEditing(a); setModal(true); };
  const del      = (id: string) =>
    confirm("Remove this account?") && persist(accounts.filter(a => a.id !== id));

  const handleSave = (a: Account) => {
    const exists = accounts.find(x => x.id === a.id);
    persist(exists ? accounts.map(x => x.id === a.id ? a : x) : [...accounts, a]);
    setModal(false);
  };

  //derived
  const unpaid   = accounts.filter(a => a.status !== "paid");
  const overdue  = accounts.filter(a => a.status === "overdue");
  const totalDebt = accounts.reduce((s, a) => s + a.balance, 0);
  const totalDue  = unpaid.reduce((s, a) => s + a.minDue, 0);
  const totalLimit = accounts.reduce((s, a) => s + a.limit, 0);
  const utilPct   = totalLimit ? Math.round((totalDebt / totalLimit) * 100) : 0;
  const highestInterest = [...unpaid].sort((a, b) => b.interestRate - a.interestRate)[0];
  const nextDue   = [...unpaid].sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))[0];

  const pieData = accounts.map(a => ({
    name: a.store,
    value: a.balance,
    color: STORE_COLORS[a.store] ?? "#64748b",
  }));

  const budgetPct = Math.min(100, Math.round((totalDue / USER_PROFILE.monthlyBudgetForDebt) * 100));
  const budgetOver = totalDue > USER_PROFILE.monthlyBudgetForDebt;

  return (
    <div className="space-y-6 pb-8 page-enter">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 font-[var(--font-heading)]">
            Hi, {USER_PROFILE.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's your store credit overview</p>
        </div>
      </div>

      {/* ── Overdue alert ── */}
      {overdue.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {overdue.length} account{overdue.length > 1 ? "s" : ""} overdue
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              {overdue.map(a => a.store).join(", ")}, pay now to avoid penalty fees
            </p>
          </div>
        </div>
      )}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Total debt"
          value={fmt(totalDebt)}
          icon={<CreditCard className="w-4 h-4" />}
          accent="#E8253A"
          tag={`${accounts.length} account${accounts.length !== 1 ? "s" : ""}`}
          tagColor="#64748b"
          bar={utilPct}
          barColor={utilPct > 70 ? "#E8253A" : "#94a3b8"}
          sub={`${utilPct}% of ${fmt(accounts.reduce((s,a)=>s+a.limit,0))} limit used`}
        />
        <SummaryCard
          label="Due this month"
          value={fmt(totalDue)}
          icon={<TrendingDown className="w-4 h-4" />}
          accent="#C49A2A"
          bar={Math.min(100, Math.round((totalDue / USER_PROFILE.monthlyBudgetForDebt) * 100))}
          barColor={budgetOver ? "#E8253A" : "#C49A2A"}
          sub={budgetOver
            ? `${fmt(totalDue - USER_PROFILE.monthlyBudgetForDebt)} over budget`
            : `${fmt(USER_PROFILE.monthlyBudgetForDebt - totalDue)} still available`}
          tag={budgetOver ? "Over budget" : "On track"}
          tagColor={budgetOver ? "#E8253A" : "#1A6B3C"}
        />
        <SummaryCard
          label="Next payment due"
          value={nextDue ? nextDue.dueDate : "—"}
          icon={<Calendar className="w-4 h-4" />}
          accent="#1A6B3C"
          sub={nextDue ? `${nextDue.store} · min ${fmt(nextDue.minDue)}` : "No upcoming payments"}
          tag={nextDue ? `${daysUntil(nextDue.dueDate)}d away` : undefined}
          tagColor={nextDue && daysUntil(nextDue.dueDate) <= 3 ? "#E8253A" : "#1A6B3C"}
        />
        <SummaryCard
          label="Overdue"
          value={overdue.length > 0 ? `${overdue.length} account${overdue.length > 1 ? "s" : ""}` : "All clear"}
          icon={<AlertTriangle className="w-4 h-4" />}
          accent={overdue.length > 0 ? "#E8253A" : "#1A6B3C"}
          sub={overdue.length > 0
            ? overdue.map(a => a.store).join(", ")
            : "No overdue accounts"}
          tag={overdue.length > 0 ? "Action needed" : "✓ Good standing"}
          tagColor={overdue.length > 0 ? "#E8253A" : "#1A6B3C"}
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Accounts table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-hover">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Your accounts</h2>
            <span className="text-xs text-slate-400">{accounts.length} linked</span>
          </div>

          {accounts.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-400">
              No accounts yet,{" "}
              <button className="underline text-amber-600" onClick={openAdd}>add one</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {accounts.map(a => {
                const days = daysUntil(a.dueDate);
                const urgent = a.status !== "paid" && days <= 3;
                const usedPct = a.limit > 0 ? Math.round((a.balance / a.limit) * 100) : 0;
                const storeMeta = STORE_META[a.store];
                const accentColor = storeMeta?.bg ?? "#64748b";
                return (
                  <div
                    key={a.id}
                    className={`px-5 py-4 account-row ${
                      a.status === "overdue" ? "bg-red-50/30 border-l-2 border-red-400" : ""
                    }`}
                  >
                    {/* Row: logo + all info */}
                    <div className="flex items-start gap-3">
                      <StoreLogo store={a.store} size={40} />

                      {/* Main info block */}
                      <div className="flex-1 min-w-0">
                        {/* Line 1: name + badge + actions */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{a.store}</p>
                            <Badge status={a.status} />
                            {urgent && (
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md shrink-0">
                                {days}d left!
                              </span>
                            )}
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {a.status !== "paid" && (
                              <a
                                href={a.storeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg text-white transition-opacity hover:opacity-90"
                                style={{ background: accentColor }}
                              >
                                Pay <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => del(a.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Line 2: key numbers */}
                        <div className="flex items-center gap-4 mt-1.5">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Balance</p>
                            <p className="text-sm font-bold text-slate-900">{fmt(a.balance)}</p>
                          </div>
                          {a.minDue > 0 && (
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Min due</p>
                              <p className="text-sm font-semibold text-amber-600">{fmt(a.minDue)}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Due date</p>
                            <p className={`text-sm font-medium ${urgent ? "text-red-500" : "text-slate-700"}`}>
                              {a.dueDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Rate</p>
                            <p className="text-sm font-medium text-slate-700">{a.interestRate}%</p>
                          </div>
                        </div>

                        {/* Line 3: utilisation bar */}
                        {a.limit > 0 && (
                          <div className="mt-2.5">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>Credit used</span>
                              <span>{usedPct}% of {fmt(a.limit)}</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bar-shimmer"
                                style={{
                                  width: `${usedPct}%`,
                                  background: usedPct > 80 ? "#E8253A" : usedPct > 50 ? "#C49A2A" : accentColor,
                                  transition: "width 0.6s ease",
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Smart Pay tip */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.66 0.13 75 / 0.12)" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "oklch(0.66 0.13 75)" }} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Smart Pay tip</h3>
            </div>
            {highestInterest ? (
              <>
                <p className="text-sm text-slate-500 leading-relaxed mb-3">
                  Pay{" "}
                  <span className="font-semibold text-slate-800">{highestInterest.store}</span>
                  {" "}first, highest rate at{" "}
                  <span className="font-semibold" style={{ color: "oklch(0.66 0.13 75)" }}>
                    {highestInterest.interestRate}%
                  </span>
                </p>
                <a
                  href={highestInterest.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 text-sm font-medium text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ background: "oklch(0.66 0.13 75)" }}
                >
                  Pay {highestInterest.store} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            ) : (
              <p className="text-sm text-emerald-600 font-medium">All accounts up to date 🎉</p>
            )}
            <button
              onClick={() => setTipExpanded(!tipExpanded)}
              className="mt-3 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              How this works
              {tipExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {tipExpanded && (
              <p className="mt-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-xl leading-relaxed">
                The avalanche method pays highest-interest debt first, saving the most
                money in interest over time.
              </p>
            )}
          </div>

          {/* Budget snapshot */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Budget snapshot</h3>
            <div className="space-y-2.5">
              {[
                { label: "Monthly income",  val: fmt(USER_PROFILE.monthlyIncome),           color: "text-slate-700" },
                { label: "Debt budget",     val: fmt(USER_PROFILE.monthlyBudgetForDebt),     color: "text-slate-700" },
                { label: "Min payments due",val: fmt(totalDue), color: budgetOver ? "text-red-500 font-semibold" : "text-emerald-600 font-semibold" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-400">{label}</span>
                  <span className={color}>{val}</span>
                </div>
              ))}

              {/* Progress bar */}
              <div className="mt-1">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${budgetPct}%`,
                      background: budgetOver
                        ? "oklch(0.62 0.20 25)"
                        : "oklch(0.67 0.14 145)",
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  {budgetOver
                    ? `${fmt(totalDue - USER_PROFILE.monthlyBudgetForDebt)} over your debt budget`
                    : `${fmt(USER_PROFILE.monthlyBudgetForDebt - totalDue)} remaining in budget`}
                </p>
              </div>
            </div>
          </div>

          {/* Autopilot CTA */}
          <button
            onClick={onNavigateToAutopilot}
            className="group w-full text-left rounded-2xl p-5 border autopilot-glow"
            style={{
              background: "linear-gradient(135deg, oklch(0.97 0.02 85) 0%, oklch(0.96 0.04 75) 100%)",
              borderColor: "oklch(0.88 0.06 75)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.66 0.13 75 / 0.15)" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "oklch(0.66 0.13 75)" }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: "oklch(0.50 0.10 75)" }}>
                Financial Autopilot
              </span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "oklch(0.66 0.13 75 / 0.15)", color: "oklch(0.50 0.10 75)" }}>
                AI
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "oklch(0.55 0.08 75)" }}>
              Get a personalised payment plan or stress-mode advice for tough months.
            </p>
            <p className="text-xs font-semibold mt-2 group-hover:underline" style={{ color: "oklch(0.50 0.10 75)" }}>
              Launch Autopilot →
            </p>
          </button>
        </div>
      </div>

      {/* ── Debt distribution ── */}
      {accounts.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 chart-enter">
          <h3 className="font-medium text-slate-900 mb-4">Debt distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={90}
                  cx="50%"
                  cy="50%"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {pieData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => fmt(v)}
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={v => (
                    <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <AccountModal
          account={editing}
          onSave={handleSave}
          onClose={() => { setModal(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}