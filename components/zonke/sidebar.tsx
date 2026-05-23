"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  Link2, 
  Bell, 
  TrendingUp,
  User,
  Menu,
  X,
  Settings,
  Lock,
  MoreVertical,
  LogOut,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "link-accounts" | "notifications" | "insights";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const navItems = [
  { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
  { id: "link-accounts" as Tab, label: "Link Accounts", icon: Link2 },
  { id: "notifications" as Tab, label: "Notifications", icon: Bell },
  { id: "insights" as Tab, label: "Insights", icon: TrendingUp },
];

export function Sidebar({ activeTab, onTabChange, isMobileOpen, onMobileToggle }: SidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  
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
      <aside className={cn(
        "fixed left-0 top-0 h-full w-60 bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-transform duration-300",
        "md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
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
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onMobileToggle();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-accent text-primary border-l-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center gap-3 px-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
              T
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">T</p>
              <p className="text-xs text-muted-foreground truncate">thabo@email.co.za</p>
            </div>
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          
          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors text-left">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors text-left border-t border-border">
                <Lock className="w-4 h-4" />
                Privacy
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-sidebar-accent transition-colors text-left border-t border-border">
                <LogOut className="w-4 h-4" />
                Account Logout
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left border-t border-border">
                <Trash2 className="w-4 h-4" />
                Account Deactivate/Delete
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-border z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
