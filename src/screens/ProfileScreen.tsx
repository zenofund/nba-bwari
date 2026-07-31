import React from "react";
import { useApp } from "@/lib/store";
import { AppShell, TopBar, StatusBadge } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { mockMember, mockFinancials } from "@/lib/mock-data";
import {
  User, Mail, Phone, MapPin, Calendar, Shield,
  CreditCard, Bell, Moon, Lock, LogOut, ChevronRight,
  CheckCircle2, XCircle, Award, Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileScreen() {
  const { dispatch } = useApp();
  const member = mockMember;
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = () => dispatch({ type: "LOGOUT" });

  const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );

  const MenuRow = ({ icon: Icon, label, onClick, danger = false, rightEl }: {
    icon: React.ElementType; label: string; onClick?: () => void; danger?: boolean; rightEl?: React.ReactNode;
  }) => (
    <button
      className="w-full flex items-center gap-3 py-3.5 border-b border-border last:border-0 hover:bg-accent/30 -mx-4 px-4 transition-colors lg:mx-0 lg:rounded-xl lg:px-3"
      onClick={onClick}
    >
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", danger ? "bg-destructive/10" : "bg-muted")}>
        <Icon className={cn("size-4", danger ? "text-destructive" : "text-muted-foreground")} />
      </div>
      <span className={cn("flex-1 text-sm font-medium text-left", danger ? "text-destructive" : "text-foreground")}>{label}</span>
      {rightEl ?? <ChevronRight className="size-4 text-muted-foreground shrink-0" />}
    </button>
  );

  return (
    <AppShell>
      <TopBar title="Profile" showNotif />
      <div className="p-4 lg:p-8 pb-8">

        {/* ── 3-column layout ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Profile hero + personal info */}
          <div className="space-y-5">
            {/* Profile hero */}
            <div className="gradient-navy rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full bg-white/5" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-black text-[oklch(0.18_0.07_255)]">{member.firstName.charAt(0)}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center border-2 border-background">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-black text-white">{member.fullName}</h2>
                  <p className="text-white/60 text-xs">{member.nbaNumber}</p>
                  <div className="mt-2"><StatusBadge status={member.membershipStatus} /></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
                {[
                  { label: "Since", value: "2019" },
                  { label: "Attendance", value: `${member.attendancePercentage}%` },
                  { label: "Good Standing", value: "Active" },
                ].map(({ label, value }) => (
                  <div key={label} className="glass rounded-xl px-2 py-2 text-center">
                    <p className="text-xs font-bold text-white">{value}</p>
                    <p className="text-[9px] text-white/50">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal info */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Personal Information</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <InfoRow icon={User} label="Full Name" value={member.fullName} />
                <InfoRow icon={Mail} label="Email" value={member.email} />
                <InfoRow icon={Phone} label="Phone" value={member.phone} />
                <InfoRow icon={MapPin} label="Address" value={member.residentialAddress} />
                <InfoRow icon={Calendar} label="Year Called to Bar" value={String(member.yearCalledToBar)} />
                <InfoRow icon={Shield} label="Supreme Court Number" value={member.supremeCourtNumber} />
              </CardContent>
            </Card>

            {/* Logout */}
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5 font-semibold"
              onClick={handleLogout}
            >
              <LogOut className="size-4 mr-2" />Sign Out
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">NBA Bwari Digital Portal v1.0.0 · © 2025</p>
          </div>

          {/* MIDDLE — Compliance + payment summary */}
          <div className="space-y-5">
            {/* Compliance */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Compliance Status</CardTitle></CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  { label: "Membership Validity", ok: true },
                  { label: "Financial Compliance", ok: member.financialCompliance },
                  { label: "Attendance Requirement", ok: member.attendancePercentage >= 75 },
                  { label: "Good Standing Status", ok: member.goodStandingStatus },
                  { label: "Voting Eligibility", ok: member.votingEligibility },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-3 py-1.5">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", ok ? "bg-success/15" : "bg-destructive/15")}>
                      {ok ? <CheckCircle2 className="size-3 text-success" /> : <XCircle className="size-3 text-destructive" />}
                    </div>
                    <span className="text-sm text-foreground flex-1">{label}</span>
                    <span className={cn("text-xs font-semibold", ok ? "text-success" : "text-destructive")}>{ok ? "Met" : "Not Met"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment summary */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">Payment Summary</CardTitle>
                  <button onClick={() => dispatch({ type: "NAVIGATE", screen: "financials" })} className="text-xs text-primary font-semibold hover:underline">View All</button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-success/10 rounded-xl p-3">
                    <CreditCard className="size-4 text-success mb-2" />
                    <p className="text-base font-black text-foreground">₦{(mockFinancials.totalDuesPaid / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">Total Paid</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <Shield className="size-4 text-muted-foreground mb-2" />
                    <p className="text-base font-black text-foreground">₦0</p>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-2">
                  <Award className="size-4 text-success shrink-0" />
                  <p className="text-xs text-muted-foreground">Fully compliant for 2025</p>
                </div>
              </CardContent>
            </Card>

            {/* Membership card */}
            <Card className="rounded-2xl border-border gradient-navy">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                    <Scale className="size-5 text-[oklch(0.18_0.07_255)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">NBA Bwari Member</p>
                    <p className="text-xs text-white/60">{member.nbaNumber}</p>
                  </div>
                </div>
                <p className="text-xs text-white/50">Member since {member.yearCalledToBar}</p>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — Settings */}
          <div className="space-y-5">
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Settings</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <MenuRow
                  icon={Moon}
                  label="Dark Mode"
                  rightEl={<Switch checked={darkMode} onCheckedChange={(v) => { setDarkMode(v); document.documentElement.classList.toggle("dark", v); }} />}
                />
                <MenuRow icon={Bell} label="Notifications" />
                <MenuRow icon={Lock} label="Change Password" />
                <MenuRow icon={User} label="Edit Profile" />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Quick Links</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <MenuRow icon={Shield} label="Good Standing Letter" onClick={() => dispatch({ type: "NAVIGATE", screen: "good-standing" })} />
                <MenuRow icon={CreditCard} label="Pay Dues" onClick={() => dispatch({ type: "NAVIGATE", screen: "financials" })} />
                <MenuRow icon={Calendar} label="Meeting Calendar" onClick={() => dispatch({ type: "NAVIGATE", screen: "attendance" })} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
