"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Calendar, 
  TrendingDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ACCOUNTS, TOTAL_DEBT, STORE_COLORS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
  return `R${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function Dashboard() {
  const [isOptimizerExpanded, setIsOptimizerExpanded] = useState(false);

  const totalDue = ACCOUNTS.filter(a => a.status === "unpaid").reduce((sum, a) => sum + a.minDue, 0);
  const nextDueAccount = ACCOUNTS.filter(a => a.status === "unpaid")[0];

  const pieData = ACCOUNTS.map(account => ({
    name: account.store,
    value: account.balance,
    color: STORE_COLORS[account.store as keyof typeof STORE_COLORS],
  }));

  // Find account with highest interest rate
  const highestInterestAccount = [...ACCOUNTS]
    .filter(a => a.status === "unpaid")
    .sort((a, b) => b.interestRate - a.interestRate)[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Store Debt"
          value={formatCurrency(TOTAL_DEBT)}
          icon={<CreditCard className="w-5 h-5" />}
          variant="danger"
        />
        <SummaryCard
          label="Due This Month"
          value={formatCurrency(totalDue)}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="warning"
        />
        <SummaryCard
          label="Next Due Date"
          value={nextDueAccount?.dueDate || "N/A"}
          icon={<Calendar className="w-5 h-5" />}
          variant="neutral"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts Table */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold font-[var(--font-heading)]">Your Accounts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Store</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Balance</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Min. Due</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNTS.map((account) => (
                  <tr 
                    key={account.id} 
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: STORE_COLORS[account.store as keyof typeof STORE_COLORS] }}
                        >
                          {account.store.charAt(0)}
                        </div>
                        <span className="font-medium">{account.store}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(account.balance)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatCurrency(account.minDue)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{account.dueDate}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={account.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {account.status === "unpaid" && (
                        <button 
                          className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          onClick={() => alert(`Redirecting to pay ${account.store}...`)}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smart Pay Optimizer */}
        <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold font-[var(--font-heading)]">Smart Pay Optimizer</h3>
            </div>
            
            {highestInterestAccount && (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Pay <span className="text-foreground font-medium">{highestInterestAccount.store}</span> first — 
                  it has your highest interest rate at{" "}
                  <span className="text-primary font-medium">{highestInterestAccount.interestRate}% p.a.</span>{" "}
                  Clearing it saves you <span className="text-success font-medium">R38</span> in interest this month.
                </p>
                
                <button 
                  className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                  onClick={() => alert(`Redirecting to pay ${highestInterestAccount.store}...`)}
                >
                  Pay {highestInterestAccount.store} Now
                  <span className="text-lg">→</span>
                </button>
              </>
            )}
            
            <button
              onClick={() => setIsOptimizerExpanded(!isOptimizerExpanded)}
              className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How this works
              {isOptimizerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isOptimizerExpanded && (
              <p className="mt-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg animate-fade-in">
                We analyze your accounts and recommend paying off the one with the highest interest rate first. 
                This &quot;avalanche method&quot; minimizes total interest paid over time.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Spending Breakdown Chart */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold font-[var(--font-heading)] mb-6">Debt Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                labelLine={{ stroke: "#6b7280", strokeWidth: 1 }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: "#1a1d27", 
                  border: "1px solid #2a2d37",
                  borderRadius: "8px",
                  color: "#fff"
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ 
  label, 
  value, 
  icon, 
  variant 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  variant: "danger" | "warning" | "neutral";
}) {
  const variantStyles = {
    danger: "from-red-500/10 to-orange-500/5 border-red-500/20",
    warning: "from-amber-500/10 to-yellow-500/5 border-amber-500/20",
    neutral: "from-slate-500/10 to-slate-500/5 border-slate-500/20",
  };

  const iconStyles = {
    danger: "text-red-400",
    warning: "text-amber-400",
    neutral: "text-slate-400",
  };

  return (
    <div className={cn(
      "bg-gradient-to-br rounded-xl border p-6 hover:scale-[1.02] transition-transform cursor-default",
      variantStyles[variant]
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className={iconStyles[variant]}>{icon}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold font-[var(--font-heading)]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === "paid";
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      isPaid 
        ? "bg-green-500/10 text-green-400 border border-green-500/20" 
        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    )}>
      {isPaid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {isPaid ? "Paid" : "Unpaid"}
    </span>
  );
}
