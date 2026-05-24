import { Dashboard } from "@/components/zonke/dashboard";

export default function DashboardPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, Thabo. Here&apos;s your financial overview.
        </p>
      </header>
      <Dashboard />
    </>
  );
}
