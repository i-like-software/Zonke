"use client";

import {
  LayoutDashboard,
  Link2,
  Bell,
  TrendingUp,
  Zap,
  User,
  Menu,
  X,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCOUNTS, USER_PROFILE } from "@/lab/mock-data";

export type Tab = "dashboard" | "link-accounts" | "insights" | "autopilot";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const navItems = [
  { id: "dashboard" as Tab,      label: "Dashboard",           icon: LayoutDashboard },
  { id: "link-accounts" as Tab,  label: "Link Accounts",       icon: Link2 },
  { id: "insights" as Tab,       label: "Insights",            icon: TrendingUp },
  { id: "autopilot" as Tab,      label: "Financial Autopilot", icon: Zap },
];

function fmt(n: number) {
  return `R${n.toLocaleString("en-ZA")}`;
}

export function Sidebar({ activeTab, onTabChange, isMobileOpen, onMobileToggle }: SidebarProps) {
  const handleNavClick = (tab: Tab) => {
    onTabChange(tab);
    if (isMobileOpen) onMobileToggle();
  };

  // Derived from mock data
  const totalDebt    = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const overdueCount = ACCOUNTS.filter(a => a.status === "overdue").length;
  const unpaidCount  = ACCOUNTS.filter(a => a.status === "unpaid").length;
  const initials     = USER_PROFILE.name.slice(0, 2).toUpperCase();

  return (
    <>
      {/* ── Mobile top header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">
        <span className="text-xl font-bold font-[var(--font-heading)]" style={{ color: "oklch(0.70 0.13 75)" }}>
          Zonke
        </span>
        <button
          onClick={onMobileToggle}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile overlay ── */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={onMobileToggle} />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-60 bg-sidebar border-r border-sidebar-border z-50",
          "flex flex-col transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ── Logo ── */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <span
            className="text-2xl font-bold font-[var(--font-heading)] tracking-tight"
            style={{ color: "oklch(0.70 0.13 75)" }}
          >
            Zonke
          </span>
        </div>

        {/* ── Debt snapshot ── */}
        <div className="mx-3 mt-4 rounded-xl p-3.5 border border-sidebar-border"
          style={{ background: "oklch(0.23 0.03 265)" }}>
          <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider mb-1">Total debt</p>
          <p className="text-xl font-bold font-[var(--font-heading)]" style={{ color: "oklch(0.70 0.13 75)" }}>
            {fmt(totalDebt)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {overdueCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400">
                <AlertTriangle className="w-2.5 h-2.5" />
                {overdueCount} overdue
              </span>
            )}
            <span className="text-[10px] text-sidebar-foreground/50">
              {unpaidCount} unpaid
            </span>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto mt-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAutopilot = item.id === "autopilot";
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium nav-item",
                  isActive
                    ? "text-sidebar-primary-foreground nav-item-active"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                )}
                style={isActive ? {
                  background: "oklch(0.62 0.13 75)",
                  boxShadow: "0 2px 8px oklch(0.62 0.13 75 / 0.35)",
                } : {}}
              >
                <Icon className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-white" : isAutopilot ? "text-sidebar-foreground/70" : ""
                )} />
                <span className={isActive ? "text-white font-semibold" : ""}>{item.label}</span>
                {/* AI pill on autopilot */}
              </button>
            );
          })}
        </nav>

        {/* ── User profile ── */}
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <div className="flex items-center gap-3 px-2 py-1">
            {/* Avatar with initials */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.13 75), oklch(0.55 0.16 55))",
                color: "#fff",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {USER_PROFILE.name}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                Income: {fmt(USER_PROFILE.monthlyIncome)}/mo
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-border z-50 flex items-center justify-around px-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 relative"
            >
              <Icon
                className="w-5 h-5 shrink-0"
                style={{ color: isActive ? "oklch(0.70 0.13 75)" : "oklch(0.60 0.01 265)" }}
              />
              <span
                className="text-[9px] font-medium truncate max-w-[52px] text-center leading-tight"
                style={{ color: isActive ? "oklch(0.70 0.13 75)" : "oklch(0.60 0.01 265)" }}
              >
                {item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}