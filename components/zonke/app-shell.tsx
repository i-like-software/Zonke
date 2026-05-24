"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/zonke/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={() => setIsMobileMenuOpen((p) => !p)}
      />
      <main className="md:ml-60 pt-20 md:pt-0 pb-20 md:pb-0">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
