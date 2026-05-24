"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Info } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend
} from "recharts";
import { MONTHLY_SPENDING, TOTAL_CREDIT_LIMIT, TOTAL_DEBT } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
  return `R${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export function Insights() {
  const [extraPayment, setExtraPayment] = useState(100);
  
  const utilizationPercent = Math.round((TOTAL_DEBT / TOTAL_CREDIT_LIMIT) * 100);
  
  // Calculate paydown projection
  const paydownData = useMemo(() => {
    const monthlyInterestRate = 0.22 / 12; // Average ~22% annual rate
    const minPayment = 450; // Total minimum payment
    
    const data = [];
    let balanceMinOnly = TOTAL_DEBT;
    let balanceWithExtra = TOTAL_DEBT;
    
    for (let month = 0; month <= 18; month++) {
      data.push({
        month: month === 0 ? "Now" : `M${month}`,
        minOnly: Math.max(0, Math.round(balanceMinOnly)),
        withExtra: Math.max(0, Math.round(balanceWithExtra)),
      });
      
      // Calculate next month's balance with minimum payments
      const interestMinOnly = balanceMinOnly * monthlyInterestRate;
      balanceMinOnly = Math.max(0, balanceMinOnly + interestMinOnly - minPayment);
      
      // Calculate next month's balance with extra payment
      const interestWithExtra = balanceWithExtra * monthlyInterestRate;
      balanceWithExtra = Math.max(0, balanceWithExtra + interestWithExtra - minPayment - extraPayment);
    }
    
    return data;
  }, [extraPayment]);

  // Calculate savings
  const monthsMinOnly = paydownData.findIndex(d => d.minOnly === 0);
  const monthsWithExtra = paydownData.findIndex(d => d.withExtra === 0);
  const monthsSaved = monthsMinOnly === -1 ? 0 : Math.max(0, (monthsMinOnly === -1 ? 18 : monthsMinOnly) - (monthsWithExtra === -1 ? 18 : monthsWithExtra));
  const interestSaved = extraPayment > 0 ? Math.round(extraPayment * 0.22 * monthsSaved / 2) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Credit Utilization */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold font-[var(--font-heading)] mb-4">Credit Utilization</h2>
        
        <div className="mb-4">
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                utilizationPercent < 35 
                  ? "bg-gradient-to-r from-green-500 to-green-400" 
                  : utilizationPercent < 75 
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                    : "bg-gradient-to-r from-red-500 to-orange-400"
              )}
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-muted-foreground">0%</span>
            <span className={cn(
              "font-semibold",
              utilizationPercent < 35 ? "text-green-400" : utilizationPercent < 75 ? "text-amber-400" : "text-red-400"
            )}>
              {utilizationPercent}%
            </span>
            <span className="text-muted-foreground">100%</span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You&apos;re using <span className="text-foreground font-medium">{utilizationPercent}%</span> of your{" "}
              <span className="text-foreground font-medium">{formatCurrency(TOTAL_CREDIT_LIMIT)}</span> total available credit. 
              Aim to keep this below <span className="text-green-400 font-medium">35%</span> for a healthier credit profile.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="text-foreground font-medium">{formatCurrency(TOTAL_DEBT)}</span> used / {formatCurrency(TOTAL_CREDIT_LIMIT)} available
            </p>
          </div>
        </div>
      </div>

      {/* Debt Paydown Simulator */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold font-[var(--font-heading)]">Debt Paydown Simulator</h2>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-muted-foreground">Extra Monthly Payment</label>
            <span className="text-lg font-semibold text-primary">{formatCurrency(extraPayment)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="50"
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30"
          />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>R0</span>
            <span>R500</span>
          </div>
        </div>

        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={paydownData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="minOnlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="withExtraGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
                tickFormatter={(value) => `R${value}`}
                tickLine={false}
                axisLine={false}
              />
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
                verticalAlign="top" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">
                    {value === "minOnly" ? "Minimum payments only" : `With extra ${formatCurrency(extraPayment)}/month`}
                  </span>
                )}
              />
              <Area 
                type="monotone" 
                dataKey="minOnly" 
                stroke="#6b7280" 
                fillOpacity={1}
                fill="url(#minOnlyGradient)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="withExtra" 
                stroke="#f59e0b" 
                fillOpacity={1}
                fill="url(#withExtraGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {extraPayment > 0 && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in">
            <p className="text-sm">
              By paying an extra <span className="text-primary font-semibold">{formatCurrency(extraPayment)}/month</span>, 
              you&apos;ll be debt-free <span className="text-success font-semibold">{monthsSaved} months sooner</span> and 
              save approximately <span className="text-success font-semibold">{formatCurrency(interestSaved)}</span> in interest.
            </p>
          </div>
        )}
      </div>

      {/* Monthly Spending Trend */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold font-[var(--font-heading)] mb-6">Monthly Spending Trend</h2>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_SPENDING} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
                tickFormatter={(value) => `R${value}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: "#1a1d27", 
                  border: "1px solid #2a2d37",
                  borderRadius: "8px",
                  color: "#fff"
                }}
                cursor={{ fill: "rgba(245, 158, 11, 0.1)" }}
              />
              <Bar 
                dataKey="amount" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
