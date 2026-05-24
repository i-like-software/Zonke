"use client";

import { useState } from "react";
import { Sidebar, type Tab } from "@/components/zonke/sidebar";
import { Dashboard } from "@/components/Dashboard";
import { FinancialAutopilot } from "@/components/FinancialAutopilot";
import { Link2, Bell, TrendingUp } from "lucide-react";

// ── Placeholder screens for tabs not yet built ───────────────────────
function PlaceholderPage({ title, icon: Icon, description }: {
  title: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      </div>
      <span className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium">
        Coming soon
      </span>
    </div>
  );
}

// ── Root page ─────────────────────────────────────────────────────────
export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleMobileToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard onNavigateToAutopilot={() => setActiveTab("autopilot")} />
        );
      case "autopilot":
        return (
          <FinancialAutopilot onBack={() => setActiveTab("dashboard")} />
        );
      case "link-accounts":
        return (
          <PlaceholderPage
            title="Link Accounts"
            icon={Link2}
            description="Connect your Edgars, Woolworths, Truworths and other store accounts so Zonke can track them automatically."
          />
        );
      case "notifications":
        return (
          <PlaceholderPage
            title="Notifications"
            icon={Bell}
            description="Payment reminders and due date alerts — all in one place instead of scattered SMS and WhatsApp messages."
          />
        );
      case "insights":
        return (
          <PlaceholderPage
            title="Insights"
            icon={TrendingUp}
            description="Spending trends, interest paid over time, and your debt payoff trajectory."
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={handleMobileToggle}
      />

      {/*
        Main content area:
        - On desktop (md+): offset left by sidebar width (w-60 = 240px)
        - On mobile: full width, padded top for the header bar + bottom for tab bar
      */}
      <main className="md:ml-60 min-h-screen">
        <div className="px-4 py-6 pt-20 md:pt-6 pb-24 md:pb-6 max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}