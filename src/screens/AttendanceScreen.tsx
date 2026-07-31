import React from "react";
import { AppShell, TopBar, StatusBadge } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mockMeetings, mockAttendanceHistory } from "@/lib/mock-data";
import { attendanceApi } from "@/lib/api";
import {
  QrCode, Fingerprint, KeyRound, MapPin, Clock,
  CheckCircle2, XCircle, TrendingUp, Users, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";

type AttendMethod = "qr" | "fingerprint" | "pin";

const chartConfig = {
  attended: { label: "Attended", color: "var(--chart-1)" },
  total: { label: "Total", color: "var(--chart-2)" },
};

export function AttendanceScreen() {
  const [loading, setLoading] = React.useState(true);
  const [marking, setMarking] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const handleMarkAttendance = async (method: AttendMethod) => {
    setMarking(true);
    setSuccessMsg("");
    try {
      const res = await attendanceApi.markAttendance("mtg-1", method);
      setSuccessMsg(res.message);
    } catch {
      setSuccessMsg("Failed to mark attendance. Try again.");
    } finally {
      setMarking(false);
    }
  };

  const stats = { percentage: 78, total: 14, attended: 11 };
  const upcomingMeeting = mockMeetings.find((m) => m.status === "upcoming");

  if (loading) {
    return (
      <AppShell>
        <TopBar title="Attendance" showNotif />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-36 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar title="Attendance" showNotif />
      <div className="p-4 lg:p-8 space-y-6 pb-8">

        {/* ── Stat banner ─────────────────────────────────────── */}
        <div className="gradient-navy rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-48 h-48 rounded-full bg-white/5" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
            <div>
              <p className="text-white/60 text-sm mb-1">Your Attendance Rate</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black text-white">{stats.percentage}%</span>
                <span className="text-white/60 mb-2">{stats.attended}/{stats.total} meetings</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="size-4 text-gold" />
                <span className="text-sm text-white/70">
                  {stats.percentage >= 75 ? "Meets voting threshold (75%)" : `${75 - stats.percentage}% below voting threshold`}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:w-72">
              {[
                { label: "Attended", value: stats.attended, color: "text-success" },
                { label: "Missed", value: stats.total - stats.attended, color: "text-destructive" },
                { label: "Total", value: stats.total, color: "text-white" },
              ].map(({ label, value, color }) => (
                <div key={label} className="glass rounded-xl p-3 text-center">
                  <p className={cn("text-2xl font-black", color)}>{value}</p>
                  <p className="text-xs text-white/50 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex justify-between text-xs text-white/50 mb-1.5">
              <span>Progress toward 75% threshold</span><span>{stats.percentage}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${stats.percentage}%` }} />
            </div>
          </div>
        </div>

        {/* ── 2-column layout ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — chart + meeting table */}
          <div className="lg:col-span-2 space-y-6">

            {/* Attendance chart */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Monthly Attendance History</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--chart-1)] inline-block" />Attended</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[var(--chart-2)] opacity-40 inline-block" />Total</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart data={mockAttendanceHistory} barSize={20} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="attended" fill="var(--color-attended)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} opacity={0.25} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Meeting records table */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Meeting Records</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Table header */}
                <div className="hidden lg:grid grid-cols-[1fr_2fr_1.5fr_1fr_auto] gap-4 px-6 py-2 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <span>Status</span><span>Meeting</span><span>Venue</span><span>Date</span><span>Attendance</span>
                </div>
                {mockMeetings.map((meeting, i) => (
                  <div
                    key={meeting.id}
                    className={cn(
                      "flex flex-col lg:grid lg:grid-cols-[1fr_2fr_1.5fr_1fr_auto] gap-3 lg:gap-4 px-6 py-4 items-start lg:items-center",
                      i < mockMeetings.length - 1 && "border-b border-border"
                    )}
                  >
                    {/* Status icon */}
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", meeting.status === "upcoming" ? "bg-royal/10" : meeting.memberAttended ? "bg-success/10" : "bg-destructive/10")}>
                      {meeting.status === "upcoming" ? <Clock className="size-4 text-royal" /> : meeting.memberAttended ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}
                    </div>
                    {/* Title */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{meeting.title}</p>
                      <StatusBadge status={meeting.status} />
                    </div>
                    {/* Venue */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" /><span className="truncate">{meeting.venue}</span>
                    </div>
                    {/* Date */}
                    <p className="text-xs text-muted-foreground shrink-0">
                      {new Date(meeting.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    {/* Attendance count */}
                    {meeting.status === "completed" ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="size-3" />{meeting.attendanceCount}/{meeting.totalMembers}
                      </div>
                    ) : <span />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — sign attendance + upcoming */}
          <div className="space-y-5">

            {/* Sign attendance */}
            <Card className="rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Sign Attendance</CardTitle>
                <p className="text-xs text-muted-foreground">Monthly General Meeting — July 2025</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {successMsg && (
                  <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-3 py-2">
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                    <p className="text-xs text-success font-medium">{successMsg}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2">
                  {([
                    { method: "qr" as AttendMethod, icon: QrCode, label: "Scan QR Code", desc: "Use your camera to scan" },
                    { method: "fingerprint" as AttendMethod, icon: Fingerprint, label: "Biometric Verification", desc: "Use your fingerprint" },
                    { method: "pin" as AttendMethod, icon: KeyRound, label: "PIN Verification", desc: "Enter your 6-digit PIN" },
                  ]).map(({ method, icon: Icon, label, desc }) => (
                    <Button
                      key={method}
                      variant="outline"
                      disabled={marking}
                      onClick={() => handleMarkAttendance(method)}
                      className="h-14 rounded-xl border-border justify-start gap-3 text-left px-4"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming meeting detail */}
            {upcomingMeeting && (
              <Card className="rounded-2xl border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />Next Meeting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-base font-bold text-foreground">{upcomingMeeting.title}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Clock className="size-4 text-primary" />
                      {new Date(upcomingMeeting.date).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{upcomingMeeting.venue}</div>
                  </div>
                  <div className="bg-primary/10 rounded-xl px-3 py-2">
                    <p className="text-xs text-primary font-medium">Attendance will open 30 mins before the meeting</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compliance summary */}
            <Card className="rounded-2xl border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                    <TrendingUp className="size-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Attendance Compliance</p>
                    <p className="text-xs text-muted-foreground">{stats.percentage}% of meetings attended</p>
                  </div>
                </div>
                <Progress value={stats.percentage} className="h-2 mb-1" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span>0%</span><span className="text-primary font-semibold">75% threshold</span><span>100%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
