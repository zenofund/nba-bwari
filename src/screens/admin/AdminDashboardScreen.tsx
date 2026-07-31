import React from "react";
import { AdminLayout, AdminStatCard, AdminCard } from "@/screens/admin/AdminLayout";
import { mockAdminStats } from "@/lib/admin-mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, UserCheck, CalendarCheck, BarChart3,
  Vote, Shield, TrendingUp, Wallet, AlertCircle,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Badge } from "@/components/ui/badge";

export function AdminDashboardScreen() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const revenueConfig = {
    revenue: { label: "Revenue", color: "var(--chart-3)" },
    expenditure: { label: "Expenditure", color: "var(--chart-5)" },
  };

  const growthConfig = {
    new: { label: "New Members", color: "var(--chart-1)" },
    total: { label: "Total Members", color: "var(--chart-2)" },
  };

  const attendanceConfig = {
    rate: { label: "Attendance Rate", color: "var(--chart-4)" },
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Branch overview and analytics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard" subtitle="Branch overview and analytics">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Total Members" value={mockAdminStats.totalMembers} icon={Users} trend="3.2%" trendUp color="text-royal" bg="bg-royal/10" />
        <AdminStatCard label="Active Members" value={mockAdminStats.activeMembers} icon={UserCheck} trend="1.8%" trendUp color="text-success" bg="bg-success/10" />
        <AdminStatCard label="Pending Approvals" value={mockAdminStats.pendingApprovals} icon={AlertCircle} color="text-warning" bg="bg-warning/10" />
        <AdminStatCard label="Upcoming Meetings" value={mockAdminStats.upcomingMeetings} icon={CalendarCheck} color="text-primary" bg="bg-primary/10" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Attendance Rate" value={`${mockAdminStats.attendanceRate}%`} icon={CalendarCheck} trend="4%" trendUp color="text-chart-4" bg="bg-chart-4/10" />
        <AdminStatCard label="Financial Compliance" value={`${mockAdminStats.financialCompliance}%`} icon={BarChart3} trend="2%" trendUp color="text-chart-3" bg="bg-chart-3/10" />
        <AdminStatCard label="Voting Participation" value={`${mockAdminStats.votingParticipation}%`} icon={Vote} trend="6%" trendUp color="text-gold" bg="bg-gold/10" />
        <AdminStatCard label="Good Standing" value={mockAdminStats.goodStandingCount} icon={Shield} color="text-success" bg="bg-success/10" />
      </div>

      {/* Revenue + Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Revenue vs Expenditure</h3>
              <p className="text-xs text-muted-foreground">Monthly breakdown (₦)</p>
            </div>
            <Badge variant="outline" className="text-success border-success/30 bg-success/10">
              <TrendingUp className="size-3 mr-1" />
              +12.5%
            </Badge>
          </div>
          <ChartContainer config={revenueConfig} className="h-[240px] w-full">
            <AreaChart data={mockAdminStats.monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenditure" stroke="var(--color-expenditure)" fill="url(#expGrad)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Member Growth</h3>
              <p className="text-xs text-muted-foreground">New vs total members</p>
            </div>
            <Badge variant="outline" className="text-royal border-royal/30 bg-royal/10">
              <ArrowUpRight className="size-3 mr-1" />
              Growing
            </Badge>
          </div>
          <ChartContainer config={growthConfig} className="h-[240px] w-full">
            <BarChart data={mockAdminStats.memberGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="new" fill="var(--color-new)" radius={4} barSize={16} />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} barSize={16} opacity={0.4} />
            </BarChart>
          </ChartContainer>
        </AdminCard>
      </div>

      {/* Attendance trend + Financial summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Attendance Trend</h3>
              <p className="text-xs text-muted-foreground">Monthly attendance rate (%)</p>
            </div>
          </div>
          <ChartContainer config={attendanceConfig} className="h-[200px] w-full">
            <LineChart data={mockAdminStats.attendanceTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2.5} dot={{ fill: "var(--color-rate)", r: 4 }} />
            </LineChart>
          </ChartContainer>
        </AdminCard>

        <AdminCard className="p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center">
                  <Wallet className="size-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-black text-foreground">₦{(mockAdminStats.totalRevenue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
              <ArrowUpRight className="size-5 text-success" />
            </div>
            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-destructive/15 flex items-center justify-center">
                  <ArrowDownRight className="size-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Outstanding Dues</p>
                  <p className="text-lg font-black text-foreground">₦{(mockAdminStats.outstandingDues / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted-foreground/15 flex items-center justify-center">
                  <BarChart3 className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Balance</p>
                  <p className="text-lg font-black text-foreground">₦{((mockAdminStats.totalRevenue - mockAdminStats.outstandingDues) / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
