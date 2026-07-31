import React from "react";
import { useApp } from "@/lib/store";
import { AppShell, TopBar } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { goodStandingApi } from "@/lib/api";
import { Shield, CheckCircle2, Download, XCircle, Award, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockMember, mockFinancials } from "@/lib/mock-data";

export function GoodStandingScreen() {
  const { dispatch } = useApp();
  const [checking, setChecking] = React.useState(false);
  const [result, setResult] = React.useState<null | { eligible: boolean; reasons: string[] }>(null);
  const [letterRequested, setLetterRequested] = React.useState(false);

  const checkEligibility = async () => {
    setChecking(true);
    try {
      const res = await goodStandingApi.checkEligibility();
      setResult(res);
    } finally {
      setChecking(false);
    }
  };

  const requirements = [
    { label: "Valid NBA membership", met: true },
    { label: "Financial compliance (dues paid)", met: mockMember.financialCompliance },
    { label: "Minimum 75% attendance rate", met: mockMember.attendancePercentage >= 75 },
    { label: "No pending disciplinary matters", met: true },
  ];

  return (
    <AppShell>
      <TopBar
        title="Letter of Good Standing"
        showBack
        onBack={() => dispatch({ type: "NAVIGATE", screen: "dashboard" })}
      />
      <div className="p-4 lg:p-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero banner */}
            <div className="gradient-navy rounded-2xl p-8 relative overflow-hidden text-center">
              <div className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute bottom-[-20px] left-[-30px] w-32 h-32 rounded-full bg-white/5" />
              <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4 shadow-xl relative z-10">
                <Shield className="size-10 text-[oklch(0.18_0.07_255)]" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 relative z-10">Good Standing Status</h2>
              <p className="text-white/60 text-sm relative z-10 max-w-md mx-auto">
                Check your eligibility for an official Letter of Good Standing from the NBA Bwari Branch
              </p>
            </div>

            {/* Requirements */}
            {!result && (
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Eligibility Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {requirements.map(({ label, met }) => (
                    <div key={label} className="flex items-center gap-4 rounded-xl bg-muted/40 px-4 py-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", met ? "bg-success/15" : "bg-destructive/15")}>
                        {met ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}
                      </div>
                      <span className="text-sm text-foreground font-medium flex-1">{label}</span>
                      <span className={cn("text-xs font-bold", met ? "text-success" : "text-destructive")}>{met ? "Met" : "Not Met"}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Result: Eligible */}
            {result?.eligible && !letterRequested && (
              <Card className="rounded-2xl border-success/30 bg-success/5">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                    <Award className="size-10 text-success" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-2">Congratulations!</h3>
                  <p className="text-sm text-muted-foreground mb-2 max-w-md mx-auto">
                    You are in good standing with the NBA Bwari Branch.
                  </p>
                  <p className="text-xs text-muted-foreground mb-8">Your letter will be valid for the current year (2025)</p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                    <Button
                      className="flex-1 h-12 rounded-xl bg-success text-success-foreground font-bold gap-2"
                      onClick={() => setLetterRequested(true)}
                    >
                      <Download className="size-4" />Download Letter
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setResult(null)}>
                      Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Result: Not Eligible */}
            {result && !result.eligible && (
              <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="size-10 text-destructive" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-2">Not Eligible</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    You do not currently qualify for a Letter of Good Standing.
                  </p>
                  <div className="space-y-2 mb-6 max-w-md mx-auto">
                    {result.reasons.map((reason, i) => (
                      <div key={i} className="flex items-center gap-2 bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2 text-left">
                        <XCircle className="size-4 text-destructive shrink-0" />
                        <p className="text-xs text-foreground">{reason}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="h-11 rounded-xl px-8" onClick={() => setResult(null)}>Back</Button>
                </CardContent>
              </Card>
            )}

            {/* Letter Downloaded success */}
            {letterRequested && (
              <Card className="rounded-2xl border-success/30 bg-success/5">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="size-10 text-success" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-2">Letter Ready!</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                    Your Letter of Good Standing has been generated. Please check your email or download below.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                    <Button className="flex-1 h-12 rounded-xl font-bold gap-2">
                      <Download className="size-4" />Download PDF
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => { setResult(null); setLetterRequested(false); }}>
                      Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Check button */}
            {!result && (
              <Button
                className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold"
                disabled={checking}
                onClick={checkEligibility}
              >
                {checking ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Checking Eligibility...
                  </span>
                ) : "Check My Eligibility"}
              </Button>
            )}
          </div>

          {/* RIGHT — member status snapshot */}
          <div className="space-y-5">
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Member Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                  <Users className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Member</p>
                    <p className="text-sm font-semibold text-foreground">{mockMember.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                  <Shield className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">NBA Number</p>
                    <p className="text-sm font-semibold text-foreground">{mockMember.nbaNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                  <Calendar className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Year Called</p>
                    <p className="text-sm font-semibold text-foreground">{mockMember.yearCalledToBar}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance summary */}
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Compliance Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {requirements.map(({ label, met }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0", met ? "bg-success/15" : "bg-destructive/15")}>
                      {met ? <CheckCircle2 className="size-2.5 text-success" /> : <XCircle className="size-2.5 text-destructive" />}
                    </div>
                    <span className="text-xs text-muted-foreground flex-1">{label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* CTA: dues */}
            <Card className="rounded-2xl border-success/30 bg-success/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center">
                    <CheckCircle2 className="size-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Dues: Paid</p>
                    <p className="text-xs text-muted-foreground">₦{(mockFinancials.totalDuesPaid / 1000).toFixed(0)}K paid for 2025</p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: "NAVIGATE", screen: "financials" })}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  View payment history →
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
