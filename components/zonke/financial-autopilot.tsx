"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles, Calendar, Zap, ChevronRight, ArrowLeft,
  AlertTriangle, TrendingDown, CheckCircle2, RefreshCw,
  Clock, CreditCard, Flame, ShieldCheck,
} from "lucide-react";
import { ACCOUNTS, USER_PROFILE, Account } from "@/lab/mock-data";

const fmt = (n: number) => `R${n.toLocaleString("en-ZA")}`;

type Mode = "select" | "planned" | "stress";

// Month names
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function daysUntil(dueDate: string): number {
  const mo: Record<string,number> = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const [d, m] = dueDate.split(" ");
  if (!d || !m) return 99;
  const now = new Date();
  const due = new Date(now.getFullYear(), mo[m], parseInt(d));
  if (due < now) due.setFullYear(now.getFullYear() + 1);
  return Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
}

// PLANNED MODE ENGINE
interface PlannedAllocation {
  account: Account;
  payment: number;
  reason: string;
  isMinOnly: boolean;
  monthsToPayoff: number;
}

function runPlannedEngine(budget: number): {
  allocations: PlannedAllocation[];
  totalInterestSaved: number;
  firstPayoffStore: string;
  firstPayoffMonths: number;
  leftover: number;
  minimumOnly: boolean;
} {
  const unpaid = ACCOUNTS.filter(a => a.status !== "paid").map(a => ({ ...a }));
  const totalMin = unpaid.reduce((s, a) => s + a.minDue, 0);
  const minimumOnly = budget <= totalMin;

  const allocs: PlannedAllocation[] = unpaid.map(a => ({
    account: a,
    payment: a.minDue,
    reason: "",
    isMinOnly: true,
    monthsToPayoff: a.minDue > 0 ? Math.ceil(a.balance / a.minDue) : 999,
  }));

  let remaining = budget - totalMin;

  const overdueIdx = allocs.findIndex(a => a.account.status === "overdue");
  if (overdueIdx >= 0 && remaining > 0) {
    const extra = Math.min(remaining, allocs[overdueIdx].account.balance - allocs[overdueIdx].payment);
    allocs[overdueIdx].payment += extra;
    remaining -= extra;
  }

  if (remaining > 0) {
    const sorted = [...allocs]
      .filter(a => a.account.status !== "overdue")
      .sort((a, b) => b.account.interestRate - a.account.interestRate);
    if (sorted.length > 0) {
      const target = allocs.find(a => a.account.id === sorted[0].account.id)!;
      const extra = Math.min(remaining, target.account.balance - target.payment);
      target.payment += extra;
      remaining -= extra;
    }
  }

  allocs.forEach(a => {
    const monthlyRate = a.account.interestRate / 100 / 12;
    if (a.account.status === "overdue") {
      a.reason = "Overdue, paying extra to clear penalty risk";
      a.isMinOnly = a.payment === a.account.minDue;
    } else if (!a.isMinOnly || a.payment > a.account.minDue) {
      a.reason = `Highest interest at ${a.account.interestRate}% avalanche priority`;
      a.isMinOnly = false;
    } else {
      a.reason = "Minimum payment to keep account in good standing";
      a.isMinOnly = true;
    }
    if (a.payment > 0 && monthlyRate > 0) {
      a.monthsToPayoff = Math.ceil(
        Math.log(a.payment / (a.payment - monthlyRate * a.account.balance)) /
        Math.log(1 + monthlyRate)
      );
    } else if (a.payment > 0) {
      a.monthsToPayoff = Math.ceil(a.account.balance / a.payment);
    }
    if (!isFinite(a.monthsToPayoff) || a.monthsToPayoff < 0) a.monthsToPayoff = 999;
  });

  const minInterest = unpaid.reduce((s, a) => {
    if (a.minDue <= 0) return s;
    const mo = a.interestRate / 100 / 12;
    const mths = mo > 0
      ? Math.ceil(Math.log(a.minDue / (a.minDue - mo * a.balance)) / Math.log(1 + mo))
      : Math.ceil(a.balance / a.minDue);
    return s + (a.minDue * mths - a.balance);
  }, 0);

  const planInterest = allocs.reduce((s, a) => {
    if (a.payment <= 0) return s;
    const mo = a.account.interestRate / 100 / 12;
    const mths = a.monthsToPayoff;
    return s + (a.payment * mths - a.account.balance);
  }, 0);

  const totalInterestSaved = Math.max(0, Math.round(minInterest - planInterest));
  const fastest = [...allocs].sort((a, b) => a.monthsToPayoff - b.monthsToPayoff)[0];

  return {
    allocations: allocs,
    totalInterestSaved,
    firstPayoffStore: fastest?.account.store ?? "",
    firstPayoffMonths: fastest?.monthsToPayoff ?? 0,
    leftover: Math.max(0, remaining),
    minimumOnly,
  };
}

// STRESS MODE ENGINE
interface StressAdvice {
  account: Account;
  action: "pay-full-min" | "pay-partial" | "skip" | "pay-overdue";
  amount: number;
  reason: string;
  priority: number;
}

function runStressEngine(budget: number): {
  advice: StressAdvice[];
  covered: number;
  shortfall: number;
  canCoverAll: boolean;
  tip: string;
} {
  const unpaid = ACCOUNTS.filter(a => a.status !== "paid");
  let remaining = budget;

  const prioritised = [...unpaid].sort((a, b) => {
    const pa = a.status === "overdue" ? 0 : daysUntil(a.dueDate) <= 3 ? 1 : daysUntil(a.dueDate) <= 7 ? 2 : 3;
    const pb = b.status === "overdue" ? 0 : daysUntil(b.dueDate) <= 3 ? 1 : daysUntil(b.dueDate) <= 7 ? 2 : 3;
    if (pa !== pb) return pa - pb;
    return b.interestRate - a.interestRate;
  });

  const advice: StressAdvice[] = [];
  let priority = 1;

  for (const a of prioritised) {
    const isOverdue = a.status === "overdue";
    const days = daysUntil(a.dueDate);

    if (remaining <= 0) {
      advice.push({ account: a, action: "skip", amount: 0, reason: `Skip this month, budget exhausted. Call ${a.store} to request a payment arrangement.`, priority: priority++ });
      continue;
    }

    if (isOverdue) {
      const pay = Math.min(remaining, a.minDue);
      remaining -= pay;
      advice.push({ account: a, action: "pay-overdue", amount: pay, reason: pay >= a.minDue ? "Overdue, paying minimum immediately to stop penalty fees" : `Overdue, partial payment of ${fmt(pay)} to show good faith. Call them to arrange the rest.`, priority: priority++ });
    } else if (remaining >= a.minDue) {
      remaining -= a.minDue;
      advice.push({ account: a, action: "pay-full-min", amount: a.minDue, reason: days <= 3 ? `Due in ${days} days, paying minimum to avoid a late fee` : `Paying minimum to keep account in good standing`, priority: priority++ });
    } else if (remaining > 0 && days <= 5) {
      const pay = remaining;
      remaining = 0;
      advice.push({ account: a, action: "pay-partial", amount: pay, reason: `Due soon, partial payment of ${fmt(pay)}. Call ${a.store} for a short extension on the rest.`, priority: priority++ });
    } else {
      advice.push({ account: a, action: "skip", amount: 0, reason: `Skip this month, due date is ${a.dueDate} and you have no budget left. Call ${a.store} to request a payment arrangement.`, priority: priority++ });
    }
  }

  const covered = advice.reduce((s, a) => s + a.amount, 0);
  const totalMin = unpaid.reduce((s, a) => s + a.minDue, 0);
  const canCoverAll = budget >= totalMin;
  const tips = [
    "SA retail stores are generally understanding, a quick call can get you a 7-14 day extension.",
    "Paying something is always better than paying nothing. Even a partial payment shows good faith.",
    "Next month, try to build a R500 buffer so stress months don't snowball.",
    "Most SA retailers report to credit bureaus monthly, acting now protects your credit score.",
  ];

  return { advice, covered, shortfall: Math.max(0, totalMin - covered), canCoverAll, tip: tips[Math.floor(Math.random() * tips.length)] };
}

// TYPEWRITER HOOK
function useTypewriter(text: string, speed = 12, active = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) { setDisplayed(text); setDone(true); return; }
    setDisplayed("");
    setDone(false);
    idx.current = 0;
    const interval = setInterval(() => {
      idx.current += 3;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) { setDone(true); clearInterval(interval); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { displayed, done };
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <div className="flex gap-1">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-amber-400 thinking-dot" />
        ))}
      </div>
      <span className="text-xs text-slate-400 ml-1">Analysing your accounts...</span>
    </div>
  );
}

function PlannedResults({ onBack }: { onBack: () => void }) {
  const [thinking, setThinking] = useState(true);
  const [show, setShow] = useState(false);
  const result = runPlannedEngine(USER_PROFILE.monthlyBudgetForDebt);

  useEffect(() => {
    const t1 = setTimeout(() => setThinking(false), 2200);
    const t2 = setTimeout(() => setShow(true), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const summaryText = result.minimumOnly
    ? `Your budget of ${fmt(USER_PROFILE.monthlyBudgetForDebt)} only covers minimum payments this month. Here's how to allocate it to avoid penalties.`
    : `With your ${fmt(USER_PROFILE.monthlyBudgetForDebt)} budget, the avalanche method saves you an estimated ${fmt(result.totalInterestSaved)} in interest. ${result.firstPayoffStore} clears first in ${result.firstPayoffMonths} month${result.firstPayoffMonths !== 1 ? "s" : ""}.`;

  const { displayed } = useTypewriter(summaryText, 10, show);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-700">Planned Mode</span>
        </div>
        <button onClick={() => { setThinking(true); setShow(false); setTimeout(() => { setThinking(false); setTimeout(() => setShow(true), 200); }, 2200); }}
          className="ml-auto p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors" title="Recalculate">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {thinking && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <ThinkingDots />
          <div className="mt-3 space-y-2">
            {["Checking due dates...", "Sorting by interest rate...", "Running avalanche calculation..."].map((s, i) => (
              <p key={i} className="text-xs text-slate-300 animate-pulse" style={{ animationDelay: `${i * 400}ms` }}>{s}</p>
            ))}
          </div>
        </div>
      )}

      {show && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Your payment plan</span>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed min-h-[40px]">
              {displayed}<span className="animate-pulse">|</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-slate-900">{fmt(USER_PROFILE.monthlyBudgetForDebt)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">Budget</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-emerald-600">{fmt(result.totalInterestSaved)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">Interest saved</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-slate-900">{result.firstPayoffMonths}mo</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">First payoff</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">This month's allocations</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {result.allocations.map((alloc, i) => {
                const pct = alloc.account.balance > 0 ? Math.round((alloc.payment / alloc.account.balance) * 100) : 0;
                return (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-slate-900">{alloc.account.store}</p>
                          {!alloc.isMinOnly && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">PRIORITY</span>}
                          {alloc.account.status === "overdue" && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 text-red-600">OVERDUE</span>}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{alloc.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold text-slate-900">{fmt(alloc.payment)}</p>
                        <p className="text-[10px] text-slate-400">{alloc.monthsToPayoff < 999 ? `~${alloc.monthsToPayoff}mo to clear` : "long-term"}</p>
                      </div>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: alloc.account.status === "overdue" ? "#E8253A" : "oklch(0.62 0.13 75)", transitionDelay: `${i * 100}ms` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{fmt(alloc.payment)} of {fmt(alloc.account.balance)} balance ({pct}%)</p>
                  </div>
                );
              })}
            </div>
            {result.leftover > 0 && (
              <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700"><strong>{fmt(result.leftover)}</strong> unallocated, consider putting it toward the highest-interest account to clear faster.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex gap-3">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Avalanche method:</strong> Always pay minimums on all accounts first, then throw every extra rand at the highest interest rate account. This minimises total interest paid over time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StressResults({ budget, onBack }: { budget: number; onBack: () => void }) {
  const [thinking, setThinking] = useState(true);
  const [show, setShow] = useState(false);
  const result = runStressEngine(budget);

  useEffect(() => {
    const t1 = setTimeout(() => setThinking(false), 2000);
    const t2 = setTimeout(() => setShow(true), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const summaryText = result.canCoverAll
    ? `Good news, ${fmt(budget)} covers all your minimum payments. Here's the smartest order to pay them.`
    : `${fmt(budget)} doesn't cover all minimums (you're ${fmt(result.shortfall)} short). Here's how to minimise the damage this month.`;

  const { displayed } = useTypewriter(summaryText, 10, show);

  const actionConfig = {
    "pay-overdue":  { label: "Pay now",  color: "#E8253A", bg: "bg-red-50",    icon: <Flame className="w-3.5 h-3.5 text-red-500" /> },
    "pay-full-min": { label: "Pay min",  color: "#1A6B3C", bg: "bg-emerald-50", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
    "pay-partial":  { label: "Pay part", color: "#C49A2A", bg: "bg-amber-50",   icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
    "skip":         { label: "Skip",     color: "#94a3b8", bg: "bg-slate-50",   icon: <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-xl border border-red-100">
          <Zap className="w-4 h-4 text-red-500" />
          <span className="text-sm font-semibold text-red-600">Stress Mode</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
          <CreditCard className="w-3.5 h-3.5" />
          Budget: <strong className="text-slate-700">{fmt(budget)}</strong>
        </div>
      </div>

      {thinking && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <ThinkingDots />
          <div className="mt-3 space-y-2">
            {["Checking overdue accounts first...", "Sorting by urgency and due date...", "Finding what you can safely skip..."].map((s, i) => (
              <p key={i} className="text-xs text-slate-300 animate-pulse" style={{ animationDelay: `${i * 400}ms` }}>{s}</p>
            ))}
          </div>
        </div>
      )}

      {show && (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${result.canCoverAll ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
            <div className="flex items-center gap-2 mb-3">
              {result.canCoverAll ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
              <span className={`text-sm font-semibold ${result.canCoverAll ? "text-emerald-800" : "text-red-700"}`}>
                {result.canCoverAll ? "Budget covers all minimums" : "Tight month — triage mode"}
              </span>
            </div>
            <p className={`text-sm leading-relaxed min-h-[40px] ${result.canCoverAll ? "text-emerald-900" : "text-red-900"}`}>
              {displayed}<span className="animate-pulse">|</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">What to do, in order</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {result.advice.map((item, i) => {
                const cfg = actionConfig[item.action];
                return (
                  <div key={i} className={`px-5 py-4 ${cfg.bg}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: cfg.color + "20", color: cfg.color }}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            {cfg.icon}
                            <p className="text-sm font-semibold text-slate-900">{item.account.store}</p>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: cfg.color + "15", color: cfg.color }}>{cfg.label}</span>
                          </div>
                          {item.amount > 0 && <p className="text-sm font-bold text-slate-900 shrink-0">{fmt(item.amount)}</p>}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.reason}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Total to pay this month</span>
              <span className="text-sm font-bold text-slate-900">{fmt(result.covered)}</span>
            </div>
          </div>

          {!result.canCoverAll && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">{fmt(result.shortfall)} shortfall this month</p>
                <p className="text-xs text-amber-700 leading-relaxed">Call any skipped stores and ask for a payment arrangement, SA retailers have hardship programmes. It won't hurt your credit score if you communicate proactively.</p>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex gap-3">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed"><strong>Remember:</strong> {result.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StressBudgetInput({ onSubmit, onBack }: { onSubmit: (b: number) => void; onBack: () => void }) {
  const [budget, setBudget] = useState("");
  const totalMin = ACCOUNTS.filter(a => a.status !== "paid").reduce((s, a) => s + a.minDue, 0);
  const val = Number(budget);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] max-w-sm mx-auto text-center gap-6">
      <div>
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Stress Mode</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Tough month? Enter what you can afford and we'll tell you exactly what to pay, what to skip, and how to protect your credit score.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-left space-y-2">
        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">Your minimum payments</p>
        {ACCOUNTS.filter(a => a.status !== "paid").map(a => (
          <div key={a.id} className="flex justify-between text-sm items-center">
            <span className="flex items-center gap-1.5 text-slate-600">
              {a.status === "overdue" && <AlertTriangle className="w-3 h-3 text-red-400" />}
              {a.store}
            </span>
            <span className="font-semibold text-slate-900">{fmt(a.minDue)}</span>
          </div>
        ))}
        <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold">
          <span className="text-slate-700">Total minimum</span>
          <span style={{ color: "oklch(0.62 0.13 75)" }}>{fmt(totalMin)}</span>
        </div>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
          What can you put towards store accounts this month?
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">R</span>
          <input
            type="number"
            className="w-full pl-8 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ "--tw-ring-color": "oklch(0.62 0.13 75 / 0.4)" } as React.CSSProperties}
            placeholder="0"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && val > 0 && onSubmit(val)}
          />
        </div>
        {val > 0 && val < totalMin && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />Below total minimums, we'll help you triage
          </p>
        )}
        {val >= totalMin && val > 0 && (
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />Covers all minimums, we'll optimise the rest
          </p>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <button onClick={onBack} className="flex-1 py-3 border border-slate-200 rounded-2xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">Back</button>
        <button onClick={() => val > 0 && onSubmit(val)} disabled={!budget || val <= 0} className="flex-1 py-3 text-white font-semibold rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors" style={{ background: val > 0 ? "#E8253A" : "#94a3b8" }}>
          Get advice
        </button>
      </div>
    </div>
  );
}

function ModeSelect({ onSelect }: { onSelect: (m: "planned" | "stress") => void }) {
  const unpaid = ACCOUNTS.filter(a => a.status !== "paid");
  const totalDue = unpaid.reduce((s, a) => s + a.minDue, 0);
  const overdueCount = ACCOUNTS.filter(a => a.status === "overdue").length;
  const maxRate = Math.max(...unpaid.map(a => a.interestRate));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"
          style={{ background: "linear-gradient(135deg, oklch(0.96 0.04 85), oklch(0.93 0.06 75))", border: "1px solid oklch(0.88 0.06 75)" }}>
          <Sparkles className="w-8 h-8" style={{ color: "oklch(0.62 0.13 75)" }} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 font-[var(--font-heading)] mb-2">Financial Autopilot</h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Smart payment advice for your {unpaid.length} store accounts.{" "}
          <strong className="text-slate-700">{fmt(totalDue)}</strong> due this month.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button onClick={() => onSelect("planned")} className="group text-left bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:border-amber-200 mode-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.95 0.05 85)", border: "1px solid oklch(0.88 0.06 75)" }}>
              <Calendar className="w-5 h-5" style={{ color: "oklch(0.62 0.13 75)" }} />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all mt-1" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1.5">Planned Mode</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Uses your registered budget of <strong className="text-slate-700">{fmt(USER_PROFILE.monthlyBudgetForDebt)}/mo</strong>. Get a full payment schedule using the avalanche method.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "oklch(0.62 0.13 75)" }}>
            <TrendingDown className="w-3.5 h-3.5" />Minimise interest · fastest payoff
          </div>
        </button>

        <button onClick={() => onSelect("stress")} className="group text-left bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:border-red-200 mode-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-50 border border-red-100">
              <Zap className="w-5 h-5 text-red-500" />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all mt-1" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1.5">Stress Mode</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Tough month? Enter what you can actually afford and get specific advice on what to pay, what to skip safely.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-500">
            <Flame className="w-3.5 h-3.5" />Damage control · avoid penalties
          </div>
        </button>
      </div>

      <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3">
        {[
          { label: "Unpaid", value: unpaid.length.toString(), color: "#C49A2A" },
          { label: "Overdue", value: overdueCount.toString(), color: overdueCount > 0 ? "#E8253A" : "#1A6B3C" },
          { label: "Highest rate", value: `${maxRate}%`, color: "#E8253A" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
            <p className="text-xl font-bold font-[var(--font-heading)] number-pop" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinancialAutopilot({ onBack }: { onBack?: () => void }) {
  const [mode, setMode] = useState<Mode>("select");
  const [stressBudget, setStressBudget] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {onBack && mode === "select" && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to dashboard
        </button>
      )}

      {mode === "select" && <ModeSelect onSelect={m => { if (m === "planned") setMode("planned"); else { setStressBudget(null); setMode("stress"); } }} />}
      {mode === "planned" && <PlannedResults onBack={() => setMode("select")} />}
      {mode === "stress" && stressBudget === null && <StressBudgetInput onSubmit={b => setStressBudget(b)} onBack={() => setMode("select")} />}
      {mode === "stress" && stressBudget !== null && <StressResults budget={stressBudget} onBack={() => setStressBudget(null)} />}
    </div>
  );
}