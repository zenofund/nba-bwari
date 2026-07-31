import React from "react";
import { AppShell, TopBar, StatusBadge } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mockElections, mockCandidates } from "@/lib/mock-data";
import { electionApi } from "@/lib/api";
import {
  Vote, Users, CheckCircle2, Shield,
  Trophy, AlertCircle, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

type VoteStep = "list" | "verify" | "candidates" | "confirm" | "success";

export function ElectionsScreen() {
  const [loading, setLoading] = React.useState(true);
  const [step, setStep] = React.useState<VoteStep>("list");
  const [selectedElectionId, setSelectedElectionId] = React.useState<string | null>(null);
  const [selectedVotes, setSelectedVotes] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const selectedElection = mockElections.find((e) => e.id === selectedElectionId);
  const candidates = mockCandidates.filter((c) => c.electionId === selectedElectionId);
  const positions = [...new Set(candidates.map((c) => c.position))];

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const handleVote = (position: string, candidateId: string) => {
    setSelectedVotes((prev) => ({ ...prev, [position]: candidateId }));
  };

  const handleSubmitVotes = async () => {
    setSubmitting(true);
    try {
      await electionApi.castVote(selectedElectionId!, Object.values(selectedVotes)[0], Object.keys(selectedVotes)[0]);
      setStep("success");
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <TopBar title="Elections" showNotif />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (step === "success") {
    return (
      <AppShell>
        <TopBar title="Elections" showNotif />
        <div className="p-4 lg:p-8 flex flex-col items-center text-center justify-center min-h-[60vh]">
          <div className="w-24 h-24 rounded-full bg-success/15 flex items-center justify-center mb-6">
            <CheckCircle2 className="size-12 text-success" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Vote Cast!</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md">
            Your vote has been recorded anonymously. Thank you for participating in the democratic process.
          </p>
          <div className="bg-muted rounded-2xl px-5 py-3 mb-8">
            <p className="text-xs text-muted-foreground">Your vote is anonymous and final</p>
          </div>
          <Button
            className="h-12 rounded-2xl px-8 bg-primary text-primary-foreground font-bold"
            onClick={() => { setStep("list"); setSelectedElectionId(null); setSelectedVotes({}); }}
          >
            Back to Elections
          </Button>
        </div>
      </AppShell>
    );
  }

  // Candidates voting screen — desktop: 2-col candidate grid
  if (step === "candidates" && selectedElection) {
    return (
      <AppShell>
        <TopBar title="Cast Your Vote" showBack onBack={() => setStep("verify")} />
        <div className="p-4 lg:p-8 space-y-6 pb-8 max-w-5xl">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3">
            <Shield className="size-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">Your vote is anonymous and encrypted. You cannot change it once submitted.</p>
          </div>

          {positions.map((position) => {
            const positionCandidates = candidates.filter((c) => c.position === position);
            return (
              <div key={position}>
                <h3 className="text-base font-bold text-foreground mb-4">{position}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {positionCandidates.map((candidate) => {
                    const isSelected = selectedVotes[position] === candidate.id;
                    return (
                      <button
                        key={candidate.id}
                        className={cn(
                          "text-left rounded-2xl border p-5 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                            : "border-border bg-card hover:bg-accent/30"
                        )}
                        onClick={() => handleVote(position, candidate.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                            isSelected ? "gradient-navy" : "bg-muted"
                          )}>
                            <span className={cn(
                              "text-xl font-black",
                              isSelected ? "text-white" : "text-muted-foreground"
                            )}>
                              {candidate.name.split(" ").filter(w => w.startsWith("Barr") ? false : true)[0]?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-bold text-foreground">{candidate.name}</p>
                              {isSelected && <CheckCircle2 className="size-5 text-primary shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">Called {candidate.yearCalled} · {candidate.nbaNumber}</p>
                            <p className="text-xs text-foreground/70 mt-2 line-clamp-3">{candidate.manifesto}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <Button
            className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold mt-2 max-w-md mx-auto"
            disabled={Object.keys(selectedVotes).length < positions.length || submitting}
            onClick={() => setStep("confirm")}
          >
            Review My Votes
          </Button>
        </div>
      </AppShell>
    );
  }

  // Confirm screen — desktop: centered
  if (step === "confirm") {
    return (
      <AppShell>
        <TopBar title="Confirm Vote" showBack onBack={() => setStep("candidates")} />
        <div className="p-4 lg:p-8 space-y-5 pb-8 max-w-2xl mx-auto">
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex gap-3">
            <AlertCircle className="size-5 text-warning mt-0.5 shrink-0" />
            <p className="text-sm text-foreground font-medium">This action is final. Your vote cannot be changed after submission.</p>
          </div>

          <h3 className="text-base font-bold text-foreground">Your Selections:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(selectedVotes).map(([position, candidateId]) => {
              const candidate = candidates.find((c) => c.id === candidateId);
              return (
                <Card key={position} className="rounded-2xl border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{position}</p>
                    <p className="text-sm font-bold text-foreground">{candidate?.name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button
            className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold mt-2"
            disabled={submitting}
            onClick={handleSubmitVotes}
          >
            {submitting ? "Submitting..." : "Submit My Vote"}
          </Button>
        </div>
      </AppShell>
    );
  }

  // Identity verification step — desktop: centered
  if (step === "verify" && selectedElection) {
    return (
      <AppShell>
        <TopBar title="Verify Identity" showBack onBack={() => { setStep("list"); setSelectedElectionId(null); }} />
        <div className="p-4 lg:p-8 flex flex-col items-center text-center min-h-[60vh] justify-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Shield className="size-10 text-primary" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">Identity Verification</h2>
          <p className="text-muted-foreground text-sm mb-8">
            We need to verify your identity before you can cast your vote.
          </p>
          <div className="w-full space-y-3 mb-8">
            <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0" />
              <p className="text-xs text-foreground">Member verified: Barr. Adaeze Okonkwo</p>
            </div>
            <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0" />
              <p className="text-xs text-foreground">Attendance requirement met (78%)</p>
            </div>
            <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
              <CheckCircle2 className="size-4 text-success shrink-0" />
              <p className="text-xs text-foreground">Financial compliance verified</p>
            </div>
          </div>
          <Button
            className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold"
            onClick={() => setStep("candidates")}
          >
            Proceed to Vote
          </Button>
        </div>
      </AppShell>
    );
  }

  // Elections list — desktop: grid of election cards
  return (
    <AppShell>
      <TopBar title="Elections" showNotif />
      <div className="p-4 lg:p-8 space-y-6 pb-8">

        {/* Header banner */}
        <div className="gradient-navy rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white/5" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shrink-0">
              <Vote className="size-7 text-[oklch(0.18_0.07_255)]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Branch Elections</h2>
              <p className="text-white/60 text-sm">Your voice matters. Vote securely.</p>
            </div>
          </div>
        </div>

        {/* Elections grid — 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mockElections.map((election) => (
            <Card key={election.id} className="rounded-2xl border-border shadow-sm overflow-hidden flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-foreground leading-tight flex-1">{election.title}</h3>
                  <StatusBadge status={election.status} />
                </div>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{election.description}</p>

                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    {new Date(election.startDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="size-3.5" />
                    {election.positions.length} positions
                  </div>
                </div>

                {/* Positions */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {election.positions.slice(0, 4).map((p) => (
                    <span key={p} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{p}</span>
                  ))}
                  {election.positions.length > 4 && (
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">+{election.positions.length - 4} more</span>
                  )}
                </div>

                <div className="mt-auto">
                  {election.status === "upcoming" && !election.hasVoted && election.memberEligible && (
                    <Button
                      className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                      onClick={() => { setSelectedElectionId(election.id); setStep("verify"); }}
                    >
                      <Vote className="size-4 mr-2" />Cast Your Vote
                    </Button>
                  )}
                  {election.hasVoted && (
                    <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-3 py-2">
                      <CheckCircle2 className="size-4 text-success" />
                      <span className="text-xs text-success font-semibold">You have voted in this election</span>
                    </div>
                  )}
                  {election.status === "completed" && !election.hasVoted && (
                    <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
                      <Users className="size-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Election concluded</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
