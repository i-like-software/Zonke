import { Insights } from "@/components/zonke/insights";

export default function InsightsPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] tracking-tight">
          Financial Insights
        </h1>
      </header>
      <Insights />
    </>
  );
}
