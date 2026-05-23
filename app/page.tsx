"use client";

import { useState } from "react";
import { Sidebar } from "@/components/zonke/sidebar";
import { Dashboard } from "@/components/zonke/dashboard";
import { LinkAccounts } from "@/components/zonke/link-accounts";
import { Notifications } from "@/components/zonke/notifications";
import { Insights } from "@/components/zonke/insights";

type Tab = "dashboard" | "link-accounts" | "notifications" | "insights";

export default function ZonkePage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkAccountsComplete = () => {
    setActiveTab("dashboard");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "link-accounts":
        return <LinkAccounts onComplete={handleLinkAccountsComplete} />;
      case "notifications":
        return <Notifications />;
      case "insights":
        return <Insights />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "link-accounts":
        return "Link Accounts";
      case "notifications":
        return "Notifications";
      case "insights":
        return "Financial Insights";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Main Content */}
      <main className="md:ml-60 pt-20 md:pt-0 pb-20 md:pb-0">
        <div className="p-6 md:p-8">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] tracking-tight">
              {getPageTitle()}
            </h1>
            {activeTab === "dashboard" && (
              <p className="text-muted-foreground mt-1">
                Welcome back, Thabo. Here&apos;s your financial overview.
              </p>
            )}
          </header>
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
