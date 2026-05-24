"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Link2,
  Bell,
  TrendingUp,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/link-accounts", label: "Link Accounts", icon: Link2 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/insights", label: "Insights", icon: TrendingUp },
];

export function Sidebar({ isMobileOpen, onMobileToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "zonke_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const navLinkClass = (href: string) =>
    cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
      pathname === href
        ? "bg-sidebar-accent text-primary border-l-2 border-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
    );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">
        <span className="text-2xl font-extrabold text-primary font-[var(--font-heading)]">Zonke</span>
        <button
          onClick={onMobileToggle}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-60 bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-transform duration-300",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <span className="text-3xl font-extrabold text-primary font-[var(--font-heading)] tracking-tight">
            Zonke
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                <Icon className={cn("w-5 h-5", pathname === item.href && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-6 border-t border-sidebar-border pt-4 space-y-1">
          <Link href="/settings" className={navLinkClass("/settings")}>
            <Settings className={cn("w-5 h-5", pathname === "/settings" && "text-primary")} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Account Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-border z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors flex-1 min-w-0",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium text-center truncate max-w-full px-1">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/settings"
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
            pathname === "/settings" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </div>
    </>
  );
}
