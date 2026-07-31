import React from "react";
import { AppShell, TopBar, StatusBadge } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { mockFinancials } from "@/lib/mock-data";
import {
  TrendingUp, TrendingDown, CreditCard, CheckCircle2, Download,
  BarChart3, Shield, ArrowUpRight
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";

const areaConfig = {
  income: { label: "Income", color: "var(--chart-3)" },
  expenditure: { label: "Expenditure", color: "var(--chart-5)" },
};
const barConfig = {
  amount: { label: "Amount (₦)", color: "var(--chart-1)" },
};

export function FinancialsScreen() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const totalIncome = mockFinancials.monthlyData.reduce((s: number, d: { income: number }) => s + d.income, 0);
  const totalExp = mockFinancials.monthlyData.reduce((s: number, d: { expenditure: number }) => s + d.expenditure, 0);

  if (loading) {
    return (
      <AppShell>
        <TopBar title="Financials" showNotif />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4"><Skeleton className="h-36 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar title="Financials" showNotif />
      <div className="p-4 lg:p-8 space-y-6 pb-8">

        {/* ── Hero strip ─────────────────────────────────────────── */}
        <div className="gradient-navy rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-52 h-52 rounded-full bg-white/5" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
            <div>
              <p className="text-white/60 text-sm mb-1">Total Dues Paid (2025)</p>
              <p className="text-5xl font-black text-white">₦{(mockFinancials.totalDuesPaid / 1000).toFixed(0)},000</p>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="size-4 text-success" />
                <span className="text-sm text-white/70">Fully compliant for 2025</span>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Outstanding", value: "₦0", icon: Shield, color: "text-success" },
                { label: "Last Payment", value: "Jan 15", icon: CreditCard, color: "text-white" },
                { label: "Total Income", value: `₦${(totalIncome / 1000).toFixed(0)}K`, icon: TrendingUp, color: "text-gold" },
                { label: "Expenditure", value: `₦${(totalExp / 1000).toFixed(0)}K`, icon: TrendingDown, color: "text-chart-5" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass rounded-xl px-3 py-3">
                  <Icon className={cn("size-4 mb-1.5", color)} />
                  <p className="text-base font-black text-white">{value}</p>
                  <p className="text-[10px] text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 2-column layout ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — charts */}
          <div className="lg:col-span-2 space-y-6">

            {/* Branch income/expenditure area chart */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">Branch Financials 2025</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Income vs expenditure month-over-month</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Download className="size-3" />Export PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={areaConfig} className="h-[240px] w-full">
                  <AreaChart data={mockFinancials.monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                    <YAxis hide domain={[0, 8000]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="income" stroke="var(--color-income)" fill="url(#incomeGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenditure" stroke="var(--color-expenditure)" fill="url(#expGrad)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Payment amounts bar chart */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold">My Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={barConfig} className="h-[180px] w-full">
                  <BarChart data={mockFinancials.payments.filter(p => p.status === "paid").map(p => ({ name: p.description.split(" ")[0], amount: p.amount }))} barSize={28} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Payment table */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Payment Transactions</CardTitle>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Download className="size-3" />Statement
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="hidden lg:grid grid-cols-[auto_1fr_auto_auto] gap-6 px-6 py-2 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <span />
                  <span>Description</span>
                  <span>Date</span>
                  <span className="text-right">Amount</span>
                </div>
                {mockFinancials.payments.map((payment, i) => (
                  <div
                    key={payment.id}
                    className={cn(
                      "flex lg:grid lg:grid-cols-[auto_1fr_auto_auto] items-center gap-3 lg:gap-6 px-6 py-4",
                      i < mockFinancials.payments.length - 1 && "border-b border-border"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", payment.status === "paid" ? "bg-success/10" : "bg-warning/10")}>
                      {payment.status === "paid" ? <TrendingDown className="size-4 text-success" /> : <TrendingUp className="size-4 text-warning" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{payment.description}</p>
                      <p className="text-xs text-muted-foreground lg:hidden">{new Date(payment.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <p className="text-xs text-muted-foreground hidden lg:block shrink-0">
                      {new Date(payment.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-bold", payment.status === "paid" ? "text-success" : "text-warning")}>
                        ₦{payment.amount.toLocaleString()}
                      </p>
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — compliance + pay CTA */}
          <div className="space-y-5">

            {/* Compliance card */}
            <Card className="rounded-2xl border-success/30 bg-success/5">
              <CardContent className="p-5">
                <div className="w-12 h-12 rounded-2xl bg-success/15 flex items-center justify-center mb-3">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
                <h3 className="text-base font-bold text-foreground">Financial Compliance</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">All dues are up to date for the 2025 fiscal year.</p>
                <StatusBadge status="compliant" />
              </CardContent>
            </Card>

            {/* Dues breakdown */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold">2025 Dues Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Annual Branch Dues", amount: 50000, paid: true },
                  { label: "NBA National Levy", amount: 75000, paid: true },
                  { label: "Development Fund", amount: 25000, paid: true },
                ].map(({ label, amount, paid }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-8 rounded-full shrink-0", paid ? "bg-success" : "bg-muted")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">₦{amount.toLocaleString()}</p>
                      <p className={cn("text-[10px] font-semibold", paid ? "text-success" : "text-muted-foreground")}>{paid ? "Paid" : "Pending"}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Total</p>
                  <p className="text-base font-black text-foreground">₦150,000</p>
                </div>
              </CardContent>
            </Card>

            {/* Pay CTA */}
            <Card className="rounded-2xl border-border gradient-navy">
              <CardContent className="p-5">
                <BarChart3 className="size-8 text-gold mb-3" />
                <h3 className="text-base font-bold text-white mb-1">2025 Annual Dues</h3>
                <p className="text-sm text-white/60 mb-4">All payments settled. No outstanding balance.</p>
                <Button className="w-full gradient-gold border-0 text-[oklch(0.18_0.07_255)] font-bold gap-2">
                  <CreditCard className="size-4" />Pay Dues
                </Button>
                <Button variant="ghost" className="w-full mt-2 text-white/70 hover:text-white gap-2">
                  <ArrowUpRight className="size-4" />Download Receipt
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
