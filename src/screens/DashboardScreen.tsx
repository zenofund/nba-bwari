import React from "react";
import { useApp } from "@/lib/store";
import { AppShell, TopBar, StatusBadge } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { mockMember, mockNotifications, mockMeetings, mockFinancials, mockElections } from "@/lib/mock-data";
import {
  CalendarCheck, Vote, FileText, BarChart3,
  Newspaper, Calendar, CreditCard, Shield,
  ChevronRight, CheckCircle2, XCircle, Clock,
  Bell, MapPin, TrendingUp, Users, ArrowRight, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Screen } from "@/lib/store";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import { mockAttendanceHistory } from "@/lib/mock-data";

type QuickAction = { icon: React.ElementType; label: string; screen: Screen; color: string; bg: string };

const quickActions: QuickAction[] = [
  { icon: CalendarCheck, label: "Attendance", screen: "attendance", color: "text-royal", bg: "bg-royal/10" },
  { icon: Shield, label: "Good Standing", screen: "good-standing", color: "text-success", bg: "bg-success/10" },
  { icon: Vote, label: "Elections", screen: "elections", color: "text-gold", bg: "bg-gold/10" },
  { icon: BarChart3, label: "Financials", screen: "financials", color: "text-primary", bg: "bg-primary/10" },
  { icon: Newspaper, label: "News", screen: "news", color: "text-chart-4", bg: "bg-chart-4/10" },
  { icon: Calendar, label: "Meetings", screen: "attendance", color: "text-chart-5", bg: "bg-chart-5/10" },
  { icon: CreditCard, label: "Payments", screen: "financials", color: "text-muted-foreground", bg: "bg-muted" },
  { icon: FileText, label: "Documents", screen: "documents", color: "text-muted-foreground", bg: "bg-muted" },
];

const chartConfig = {
  attended: { label: "Attended", color: "var(--chart-1)" },
  total: { label: "Total", color: "var(--chart-2)" },
};

export function DashboardScreen() {
  const { dispatch } = useApp();
  const [loading, setLoading] = React.useState(true);
  const member = mockMember;
  const unread = mockNotifications.filter((n) => !n.read).length;
  const upcomingMeetings = mockMeetings.filter((m) => m.status === "upcoming");
  const pastMeetings = mockMeetings.filter((m) => m.status === "completed").slice(0, 3);
  const activeElection = mockElections.find(
    (e) => e.phase === "voting" && !e.hasVoted && e.memberEligible
  );

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <AppShell>
        <TopBar title="Dashboard" showNotif />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <div className="grid grid-cols-4 gap-3"><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-20 rounded-2xl" /></div>
            <Skeleton className="h-56 rounded-2xl" />
          </div>
          <div className="space-y-4"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-36 rounded-2xl" /></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar title="Dashboard" showNotif />

      <div className="p-4 lg:p-8 space-y-6 pb-8">
        {/* ── Hero Banner ─────────────────────────────────────────────── */}
        <div className="gradient-navy rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute bottom-[-20px] right-[60px] w-32 h-32 rounded-full bg-white/5" />

          {/* Mobile: stacked; Desktop: side-by-side with quick stats inline */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center shadow-xl shrink-0">
                <span className="text-2xl font-black text-[oklch(0.18_0.07_255)]">{member.firstName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Welcome back</p>
                <h1 className="text-xl lg:text-2xl font-black text-white leading-tight">{member.fullName}</h1>
                <p className="text-white/50 text-xs mt-0.5">{member.nbaNumber} · {member.branch}</p>
              </div>
            </div>

            {/* Status pills — more prominent on desktop */}
            <div className="flex flex-wrap lg:flex-nowrap gap-3">
              {[
                { label: "Attendance", value: `${member.attendancePercentage}%`, ok: member.attendancePercentage >= 75, icon: CalendarCheck },
                { label: "Good Standing", value: member.goodStandingStatus ? "Active" : "Inactive", ok: member.goodStandingStatus, icon: Shield },
                { label: "Voting", value: member.votingEligibility ? "Eligible" : "Ineligible", ok: member.votingEligibility, icon: Vote },
              ].map(({ label, value, ok, icon: Icon }) => (
                <div key={label} className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5 min-w-[130px]">
                  <Icon className={cn("size-4 shrink-0", ok ? "text-success" : "text-destructive")} />
                  <div>
                    <p className="text-[10px] text-white/50 leading-none">{label}</p>
                    <p className="text-sm font-bold text-white mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
              <StatusBadge status={member.membershipStatus} />
            </div>
          </div>
        </div>

        {/* ── Vote Now nudge ────────────────────────────────────────────── */}
        {activeElection && (
          <button
            className="w-full text-left"
            onClick={() => dispatch({ type: "NAVIGATE", screen: "elections" })}
          >
            <div className="gradient-gold rounded-2xl p-5 relative overflow-hidden hover:brightness-105 transition-all">
              <div className="absolute top-[-20px] right-[-20px] w-36 h-36 rounded-full bg-[oklch(0.18_0.07_255)]/10" />
              <div className="flex items-center gap-4 relative z-10">
                {/* Pulsing icon */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-[oklch(0.18_0.07_255)]/15 flex items-center justify-center">
                    <Vote className="size-7 text-[oklch(0.18_0.07_255)]" />
                  </div>
                  <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-success animate-ping" />
                  <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Zap className="size-3.5 text-[oklch(0.18_0.07_255)]" />
                    <p className="text-xs font-bold text-[oklch(0.18_0.07_255)] uppercase tracking-wide">
                      Voting is Open — Your vote is needed!
                    </p>
                  </div>
                  <p className="text-base font-black text-[oklch(0.18_0.07_255)] leading-tight truncate">
                    {activeElection.title}
                  </p>
                  <p className="text-[oklch(0.18_0.07_255)]/65 text-xs mt-1">
                    Closes {new Date(activeElection.votingEnd).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" })} at {new Date(activeElection.votingEnd).toLocaleTimeString("en-NG", { timeStyle: "short" })} · {activeElection.positions.length} positions to vote
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="bg-[oklch(0.18_0.07_255)] text-gold px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-md">
                    Cast Your Vote
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              </div>
            </div>
          </button>
        )}

        {/* ── Main 2-column grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">

            {/* KPI stat row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Dues Paid (2025)", value: `₦${(mockFinancials.totalDuesPaid/1000).toFixed(0)}K`, icon: CreditCard, color: "text-success", bg: "bg-success/10" },
                { label: "Meetings Attended", value: "11 / 14", icon: CalendarCheck, color: "text-royal", bg: "bg-royal/10" },
                { label: "Attendance Rate", value: `${member.attendancePercentage}%`, icon: TrendingUp, color: "text-gold", bg: "bg-gold/10" },
                { label: "Outstanding", value: "₦0", icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label} className="rounded-2xl border-border">
                  <CardContent className="p-4">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", bg)}>
                      <Icon className={cn("size-4", color)} />
                    </div>
                    <p className="text-2xl font-black text-foreground leading-none">{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Attendance chart */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Attendance History</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--chart-1)] inline-block" />Attended</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--chart-2)] opacity-40 inline-block" />Total</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
                    <span>Attendance Rate</span>
                    <span className="font-semibold text-primary">{member.attendancePercentage}%</span>
                  </div>
                  <Progress value={member.attendancePercentage} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">75% minimum required for voting eligibility</p>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <BarChart data={mockAttendanceHistory} barSize={18} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="attended" fill="var(--color-attended)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} opacity={0.25} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 lg:grid-cols-8 gap-4">
                  {quickActions.map(({ icon: Icon, label, screen, color, bg }) => (
                    <button
                      key={label}
                      onClick={() => dispatch({ type: "NAVIGATE", screen })}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={cn(
                        "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center border border-border transition-all group-hover:scale-105 group-hover:shadow-md",
                        bg
                      )}>
                        <Icon className={cn("size-5", color)} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent meeting records */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Recent Meetings</CardTitle>
                  <button
                    onClick={() => dispatch({ type: "NAVIGATE", screen: "attendance" })}
                    className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                  >
                    View all <ChevronRight className="size-3" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {pastMeetings.map((meeting, i) => (
                  <div key={meeting.id} className={cn("flex items-center gap-4 px-6 py-4", i < pastMeetings.length - 1 && "border-b border-border")}>
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", meeting.memberAttended ? "bg-success/10" : "bg-destructive/10")}>
                      {meeting.memberAttended
                        ? <CheckCircle2 className="size-4 text-success" />
                        : <XCircle className="size-4 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{meeting.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3" />{meeting.venue}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{new Date(meeting.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                      {meeting.attendanceCount && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 justify-end"><Users className="size-3" />{meeting.attendanceCount}/{meeting.totalMembers}</p>}
                    </div>
                    <StatusBadge status={meeting.memberAttended ? "compliant" : "non-compliant"} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT column (1/3 width) */}
          <div className="space-y-5">

            {/* Compliance snapshot */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Membership Validity", ok: true },
                  { label: "Financial Compliance", ok: member.financialCompliance },
                  { label: "Attendance (≥75%)", ok: member.attendancePercentage >= 75 },
                  { label: "Good Standing", ok: member.goodStandingStatus },
                  { label: "Voting Eligibility", ok: member.votingEligibility },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", ok ? "bg-success/15" : "bg-destructive/15")}>
                      {ok ? <CheckCircle2 className="size-3 text-success" /> : <XCircle className="size-3 text-destructive" />}
                    </div>
                    <span className="text-sm text-foreground flex-1">{label}</span>
                    <span className={cn("text-xs font-semibold", ok ? "text-success" : "text-destructive")}>{ok ? "Met" : "Not Met"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming meetings */}
            {upcomingMeetings.length > 0 && (
              <Card className="rounded-2xl border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">Upcoming Meetings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={() => dispatch({ type: "NAVIGATE", screen: "attendance" })}
                      className="w-full text-left rounded-xl bg-primary/5 border border-primary/20 p-3 hover:bg-primary/10 transition-colors"
                    >
                      <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5"><Clock className="size-3" />Upcoming</p>
                      <p className="text-sm font-semibold text-foreground">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="size-3" />{meeting.venue}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(meeting.date).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Notifications widget */}
            {unread > 0 && (
              <button
                className="w-full text-left"
                onClick={() => dispatch({ type: "NAVIGATE", screen: "notifications" })}
              >
                <Card className="rounded-2xl border-gold/30 bg-gold/5 hover:bg-gold/10 transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                      <Bell className="size-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{unread} Unread</p>
                      <p className="text-xs text-muted-foreground">Tap to view notifications</p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </button>
            )}

            {/* Payment summary */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Payment Summary</CardTitle>
                  <button onClick={() => dispatch({ type: "NAVIGATE", screen: "financials" })} className="text-xs text-primary font-medium hover:underline">View</button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-success/10 rounded-xl p-3">
                    <CreditCard className="size-4 text-success mb-2" />
                    <p className="text-lg font-black text-foreground">₦{(mockFinancials.totalDuesPaid/1000).toFixed(0)}K</p>
                    <p className="text-[10px] text-muted-foreground">Total Paid</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <Shield className="size-4 text-muted-foreground mb-2" />
                    <p className="text-lg font-black text-foreground">₦0</p>
                    <p className="text-[10px] text-muted-foreground">Outstanding</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success shrink-0" />
                  <p className="text-xs text-muted-foreground">Fully compliant for 2025</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
