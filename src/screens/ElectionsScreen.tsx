import React from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { mockElections, mockCandidates, type Candidate, type Election, type ElectionPhase } from "@/lib/mock-data";
import { electionApi, type EligibilityResult, type VoteBallot } from "@/lib/api";
import {
  Vote, Users, CheckCircle2, Shield, Trophy, AlertCircle,
  Calendar, Clock, Lock, ChevronRight, ChevronDown, ChevronUp,
  Download, BarChart3, FileText, ArrowRight, Award, Gavel,
  XCircle, BookOpen, UserCheck, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type ElectionStep =
  | "list"
  | "detail"
  | "verify"
  | "ballot"
  | "confirm"
  | "success"
  | "results"
  | "nominations";

// ─────────────────────────────────────────────────────────────
// Helper: initials from "Barr. Firstname Lastname"
// ─────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .replace("Barr. ", "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

// ─────────────────────────────────────────────────────────────
// Phase badge
// ─────────────────────────────────────────────────────────────
function PhaseBadge({ phase }: { phase: ElectionPhase }) {
  const cfg: Record<ElectionPhase, { label: string; className: string }> = {
    nomination: { label: "Nominations Open",   className: "bg-gold/15 text-[oklch(0.55_0.10_75)] border-gold/30"    },
    voting:     { label: "Voting Open",         className: "bg-success/15 text-success border-success/30"             },
    tallying:   { label: "Tallying Votes",      className: "bg-warning/15 text-warning border-warning/30"             },
    results:    { label: "Results Published",   className: "bg-muted text-muted-foreground border-border"             },
  };
  const c = cfg[phase];
  return (
    <Badge variant="outline" className={cn("text-xs font-semibold border px-2.5 py-1", c.className)}>
      {c.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────
// Turnout bar
// ─────────────────────────────────────────────────────────────
function TurnoutBar({ voted, eligible, compact = false }: { voted: number; eligible: number; compact?: boolean }) {
  const pct = eligible > 0 ? Math.round((voted / eligible) * 100) : 0;
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="size-3 shrink-0" />
        <span>{voted} of {eligible} voted</span>
        <span className="font-semibold text-foreground">{pct}%</span>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
        <span className="flex items-center gap-1"><Users className="size-3" />Voter turnout</span>
        <span className="font-semibold text-foreground">{voted} / {eligible} ({pct}%)</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Phase timeline
// ─────────────────────────────────────────────────────────────
function PhaseTimeline({ election }: { election: Election }) {
  const phases: { key: ElectionPhase; label: string; date: string }[] = [
    { key: "nomination", label: "Nominations",   date: new Date(election.nominationDeadline).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) },
    { key: "voting",     label: "Voting",         date: new Date(election.votingStart).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) },
    { key: "results",    label: "Results",        date: election.resultsPublishedAt ? new Date(election.resultsPublishedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" }) : "TBD" },
  ];
  const order: ElectionPhase[] = ["nomination", "voting", "tallying", "results"];
  const currentIdx = order.indexOf(election.phase);

  return (
    <div className="flex items-center gap-0">
      {phases.map((ph, i) => {
        const phIdx = order.indexOf(ph.key);
        const isDone = phIdx < currentIdx;
        const isActive = ph.key === election.phase || (election.phase === "tallying" && ph.key === "voting");
        const isLast = i === phases.length - 1;
        return (
          <React.Fragment key={ph.key}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors",
                isDone   ? "bg-success border-success text-white"            :
                isActive ? "bg-primary border-primary text-primary-foreground" :
                           "bg-background border-border text-muted-foreground"
              )}>
                {isDone ? <CheckCircle2 className="size-3.5" /> : i + 1}
              </div>
              <p className={cn("text-[10px] font-semibold mt-1 text-center leading-tight", isActive ? "text-primary" : "text-muted-foreground")}>{ph.label}</p>
              <p className="text-[9px] text-muted-foreground/70 text-center">{ph.date}</p>
            </div>
            {!isLast && <div className={cn("flex-1 h-0.5 mx-1 mb-6", isDone ? "bg-success" : "bg-border")} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CandidateCard — selectable + expandable
// ─────────────────────────────────────────────────────────────
function CandidateCard({
  candidate, isSelected, isExpanded, onSelect, onToggleExpand,
}: {
  candidate: Candidate;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) {
  const abbr = initials(candidate.name);
  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-200",
      isSelected
        ? "border-primary ring-2 ring-primary/20 bg-primary/[0.03]"
        : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
    )}>
      {/* Selectable header */}
      <button className="w-full text-left p-5" onClick={onSelect}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-lg font-black transition-all",
            isSelected ? "gradient-navy text-white shadow-md" : "bg-muted text-muted-foreground"
          )}>
            {abbr}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-bold text-foreground leading-tight">{candidate.name}</p>
              {isSelected && <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Called {candidate.yearCalled} · {candidate.practiceArea}
            </p>
            <p className="text-xs text-foreground/65 mt-2 line-clamp-2 leading-relaxed">
              {candidate.manifesto}
            </p>
          </div>
        </div>
      </button>

      {/* Expand toggle */}
      <div className="px-5 pb-3 -mt-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
        >
          {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          {isExpanded ? "Hide profile" : "View full profile & manifesto"}
        </button>
      </div>

      {/* Expanded profile */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30 px-5 py-4 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Election Statement</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{candidate.manifesto}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Qualifications</p>
            <ul className="space-y-1.5">
              {candidate.qualifications.map((q) => (
                <li key={q} className="flex items-center gap-2 text-xs text-foreground/75">
                  <CheckCircle2 className="size-3 text-success shrink-0" />
                  {q}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground mb-1">Proposed by</p>
              <p className="text-xs font-semibold text-foreground">{candidate.proposer}</p>
            </div>
            <div className="bg-background rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground mb-1">Seconded by</p>
              <p className="text-xs font-semibold text-foreground">{candidate.seconder}</p>
            </div>
          </div>
          <Button
            size="sm"
            className={cn("w-full h-10 rounded-xl font-semibold", isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground")}
            onClick={onSelect}
          >
            {isSelected ? <><CheckCircle2 className="size-4 mr-2" />Selected</> : "Select this candidate"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Result bar for completed elections
// ─────────────────────────────────────────────────────────────
function ResultBar({ candidate, totalVotes }: { candidate: Candidate; totalVotes: number }) {
  const abbr = initials(candidate.name);
  const pct = totalVotes > 0 ? Math.round(((candidate.votes ?? 0) / totalVotes) * 100) : (candidate.percentage ?? 0);
  return (
    <div className={cn("rounded-xl p-4 border", candidate.isWinner ? "border-gold/40 bg-gold/5" : "border-border bg-card")}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black", candidate.isWinner ? "gradient-gold text-[oklch(0.18_0.07_255)]" : "bg-muted text-muted-foreground")}>
          {candidate.isWinner ? <Trophy className="size-4" /> : abbr}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground truncate">{candidate.name}</p>
            {candidate.isWinner && <Badge variant="outline" className="text-[10px] border-gold/40 text-gold bg-gold/10 shrink-0">Winner</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">{candidate.practiceArea} · Called {candidate.yearCalled}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-foreground">{pct}%</p>
          <p className="text-[10px] text-muted-foreground">{(candidate.votes ?? 0).toLocaleString()} votes</p>
        </div>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", candidate.isWinner ? "gradient-gold" : "bg-primary/40")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main ElectionsScreen
// ─────────────────────────────────────────────────────────────
export function ElectionsScreen() {
  const [loading, setLoading] = React.useState(true);
  const [step, setStep] = React.useState<ElectionStep>("list");
  const [selectedElectionId, setSelectedElectionId] = React.useState<string | null>(null);
  const [selectedVotes, setSelectedVotes] = React.useState<VoteBallot>({});
  const [expandedCandidateId, setExpandedCandidateId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [eligibility, setEligibility] = React.useState<EligibilityResult | null>(null);
  const [checkingEligibility, setCheckingEligibility] = React.useState(false);
  const [receiptNumber, setReceiptNumber] = React.useState<string | null>(null);
  const [receiptTimestamp, setReceiptTimestamp] = React.useState<string | null>(null);

  const selectedElection = mockElections.find((e) => e.id === selectedElectionId) ?? null;
  const candidates = mockCandidates.filter((c) => c.electionId === selectedElectionId);
  const positions = selectedElection?.positions ?? [];
  const completedCount = Object.keys(selectedVotes).length;
  const allPositionsDone = completedCount === positions.length && positions.length > 0;

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const navigate = (s: ElectionStep) => setStep(s);

  const openElection = (id: string) => {
    setSelectedElectionId(id);
    setSelectedVotes({});
    setExpandedCandidateId(null);
    navigate("detail");
  };

  const startVoting = async () => {
    if (!selectedElectionId) return;
    setCheckingEligibility(true);
    const result = await electionApi.checkEligibility(selectedElectionId);
    setEligibility(result);
    setCheckingEligibility(false);
    navigate("verify");
  };

  const handleVote = (position: string, candidateId: string) => {
    setSelectedVotes((prev) => ({ ...prev, [position]: candidateId }));
  };

  const toggleExpanded = (candidateId: string) => {
    setExpandedCandidateId((prev) => (prev === candidateId ? null : candidateId));
  };

  const handleSubmitVote = async () => {
    if (!selectedElectionId) return;
    setSubmitting(true);
    try {
      const result = await electionApi.castVote(selectedElectionId, selectedVotes);
      setReceiptNumber(result.receiptNumber);
      setReceiptTimestamp(result.timestamp);
      navigate("success");
    } finally {
      setSubmitting(false);
    }
  };

  const resetToList = () => {
    setStep("list");
    setSelectedElectionId(null);
    setSelectedVotes({});
    setExpandedCandidateId(null);
    setEligibility(null);
    setReceiptNumber(null);
    setReceiptTimestamp(null);
  };

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <AppShell>
        <TopBar title="Elections" showNotif />
        <div className="p-4 lg:p-8 space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Success / Receipt ──────────────────────────────────────
  if (step === "success") {
    return (
      <AppShell>
        <TopBar title="Vote Submitted" />
        <div className="p-4 lg:p-8 flex flex-col items-center justify-center min-h-[70vh] max-w-lg mx-auto">
          {/* Success icon */}
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mb-6 ring-8 ring-success/5">
            <CheckCircle2 className="size-12 text-success" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2 text-center">Vote Cast Successfully</h2>
          <p className="text-muted-foreground text-sm text-center mb-8 leading-relaxed">
            Your votes have been recorded securely and anonymously. Thank you for participating in the democratic process of our branch.
          </p>

          {/* Receipt card */}
          <div className="w-full gradient-navy rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Award className="size-4 text-gold" />
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Voting Receipt</p>
              </div>
              <p className="text-2xl font-black text-white font-mono tracking-widest mb-1">{receiptNumber}</p>
              <p className="text-white/50 text-xs mb-4">
                {receiptTimestamp ? new Date(receiptTimestamp).toLocaleString("en-NG", { dateStyle: "long", timeStyle: "short" }) : ""}
              </p>
              <div className="border-t border-white/15 pt-4">
                <p className="text-white/60 text-xs mb-2">{selectedElection?.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  {positions.map((pos) => (
                    <span key={pos} className="text-[10px] font-medium text-white/70 bg-white/10 px-2 py-0.5 rounded-full">{pos}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Anonymity guarantee */}
          <div className="w-full flex items-start gap-3 bg-muted rounded-xl p-4 mb-6">
            <Lock className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your receipt confirms that a vote was cast — it does not record which candidates you selected. Your choices are permanently anonymous and cannot be linked to your identity.
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 h-12 rounded-xl gap-2">
              <Download className="size-4" />
              Save Receipt
            </Button>
            <Button className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold" onClick={resetToList}>
              Back to Elections
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Confirm Vote ───────────────────────────────────────────
  if (step === "confirm" && selectedElection) {
    return (
      <AppShell>
        <TopBar title="Review Your Votes" showBack onBack={() => navigate("ballot")} />
        <div className="p-4 lg:p-8 pb-8 max-w-3xl">
          {/* Warning */}
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 flex gap-3 mb-6">
            <AlertCircle className="size-5 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground">Final Review — This action cannot be undone</p>
              <p className="text-xs text-muted-foreground mt-0.5">Once submitted, your vote is permanent. Please review all your selections carefully before proceeding.</p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Your Selections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {Object.entries(selectedVotes).map(([position, candidateId]) => {
              const candidate = candidates.find((c) => c.id === candidateId);
              const abbr = candidate ? initials(candidate.name) : "?";
              return (
                <div key={position} className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-xl gradient-navy flex items-center justify-center shrink-0 text-sm font-black text-white">{abbr}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{position}</p>
                    <p className="text-sm font-bold text-foreground truncate">{candidate?.name}</p>
                    <p className="text-[10px] text-muted-foreground">Called {candidate?.yearCalled} · {candidate?.practiceArea}</p>
                  </div>
                  <CheckCircle2 className="size-5 text-success shrink-0" />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted rounded-xl px-4 py-3 mb-6">
            <Lock className="size-3.5 shrink-0" />
            <span>Votes are anonymous and encrypted. Your identity is not linked to your selections.</span>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-13 rounded-2xl" onClick={() => navigate("ballot")}>
              Edit Votes
            </Button>
            <Button
              className="flex-1 h-13 rounded-2xl bg-primary text-primary-foreground font-bold"
              disabled={submitting}
              onClick={handleSubmitVote}
            >
              {submitting ? (
                <span className="flex items-center gap-2"><RefreshCw className="size-4 animate-spin" />Submitting…</span>
              ) : (
                <span className="flex items-center gap-2"><Vote className="size-4" />Submit My Vote</span>
              )}
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Ballot ─────────────────────────────────────────────────
  if (step === "ballot" && selectedElection) {
    return (
      <AppShell>
        <TopBar title="Cast Your Vote" showBack onBack={() => navigate("verify")} />

        {/* Mobile progress chips */}
        <div className="lg:hidden sticky top-14 z-30 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide">
            {positions.map((pos) => (
              <span key={pos} className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap border", selectedVotes[pos] ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground border-transparent")}>
                {selectedVotes[pos] ? <CheckCircle2 className="size-3" /> : <span className="w-2 h-2 rounded-full border border-current inline-block" />}
                {pos}
              </span>
            ))}
          </div>
          <div className="px-4 pb-2 flex items-center gap-2">
            <Progress value={(completedCount / positions.length) * 100} className="h-1 flex-1" />
            <span className="text-[10px] text-muted-foreground shrink-0">{completedCount}/{positions.length}</span>
          </div>
        </div>

        <div className="p-4 lg:p-8 pb-24 lg:pb-8">
          {/* Anonymity notice */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6 text-sm text-foreground">
            <Lock className="size-4 text-primary shrink-0 mt-0.5" />
            <span>Your choices are anonymous and encrypted. Once submitted, they cannot be changed or traced to you.</span>
          </div>

          <div className="flex gap-6 items-start">
            {/* Desktop left navigator */}
            <aside className="hidden lg:block w-56 shrink-0 sticky top-[4.5rem] self-start">
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Ballot Progress</p>
                <div className="space-y-1">
                  {positions.map((pos) => {
                    const isDone = !!selectedVotes[pos];
                    const chosen = candidates.find((c) => c.id === selectedVotes[pos] && c.position === pos);
                    return (
                      <a
                        key={pos}
                        href={`#pos-${pos.replace(/\s+/g, "-").toLowerCase()}`}
                        className={cn("flex items-start gap-2.5 p-2.5 rounded-xl transition-colors no-underline group", isDone ? "bg-success/8" : "hover:bg-muted")}
                      >
                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors", isDone ? "bg-success" : "border-2 border-border group-hover:border-muted-foreground")}>
                          {isDone && <CheckCircle2 className="size-2.5 text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground leading-tight">{pos}</p>
                          {isDone && chosen ? (
                            <p className="text-[10px] text-success truncate mt-0.5">{chosen.name.replace("Barr. ", "")}</p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground mt-0.5">Not yet selected</p>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{completedCount} of {positions.length} done</span>
                    <span>{Math.round((completedCount / positions.length) * 100)}%</span>
                  </div>
                  <Progress value={(completedCount / positions.length) * 100} className="h-1.5" />
                </div>
                <Button
                  className="w-full h-10 rounded-xl mt-4 bg-primary text-primary-foreground text-xs font-bold"
                  disabled={!allPositionsDone}
                  onClick={() => navigate("confirm")}
                >
                  Review Votes <ArrowRight className="size-3 ml-1.5" />
                </Button>
              </div>
            </aside>

            {/* Ballot sections */}
            <div className="flex-1 space-y-10 min-w-0">
              {positions.map((position) => {
                const posCandidates = candidates.filter((c) => c.position === position);
                const posId = `pos-${position.replace(/\s+/g, "-").toLowerCase()}`;
                return (
                  <section key={position} id={posId} className="scroll-mt-36">
                    <div className="flex items-center gap-3 mb-4">
                      <Gavel className="size-4 text-primary shrink-0" />
                      <h3 className="text-base font-bold text-foreground">{position}</h3>
                      {selectedVotes[position] && <CheckCircle2 className="size-4 text-success" />}
                      <span className="ml-auto text-xs text-muted-foreground">Select 1 of {posCandidates.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {posCandidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          isSelected={selectedVotes[position] === candidate.id}
                          isExpanded={expandedCandidateId === candidate.id}
                          onSelect={() => handleVote(position, candidate.id)}
                          onToggleExpand={() => toggleExpanded(candidate.id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {/* Bottom CTA */}
              <Button
                className="w-full lg:max-w-sm h-13 rounded-2xl bg-primary text-primary-foreground font-bold gap-2"
                disabled={!allPositionsDone}
                onClick={() => navigate("confirm")}
              >
                <Vote className="size-4" />
                Review My Votes ({completedCount}/{positions.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        {!allPositionsDone && (
          <div className="lg:hidden fixed bottom-[72px] left-0 right-0 z-20 px-4 pb-3 bg-background/95 backdrop-blur-md border-t border-border pt-3">
            <p className="text-xs text-muted-foreground text-center mb-2">
              {positions.length - completedCount} position{positions.length - completedCount !== 1 ? "s" : ""} remaining
            </p>
          </div>
        )}
      </AppShell>
    );
  }

  // ── Eligibility Verification ───────────────────────────────
  if (step === "verify" && selectedElection) {
    const isEligible = eligibility?.eligible ?? true;
    return (
      <AppShell>
        <TopBar title="Verify Eligibility" showBack onBack={() => navigate("detail")} />
        <div className="p-4 lg:p-8 flex flex-col items-center justify-center min-h-[65vh] max-w-md mx-auto">
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6 ring-8", isEligible ? "bg-success/10 ring-success/5" : "bg-destructive/10 ring-destructive/5")}>
            {checkingEligibility
              ? <RefreshCw className="size-10 text-muted-foreground animate-spin" />
              : isEligible
              ? <UserCheck className="size-10 text-success" />
              : <XCircle className="size-10 text-destructive" />}
          </div>

          <h2 className="text-xl font-black text-foreground mb-2 text-center">
            {checkingEligibility ? "Checking eligibility…" : isEligible ? "Eligible to Vote" : "Not Eligible"}
          </h2>
          <p className="text-muted-foreground text-sm mb-8 text-center leading-relaxed">
            {isEligible
              ? "All eligibility checks passed. You may now access the ballot."
              : "You do not currently meet all requirements to vote in this election."}
          </p>

          {/* Checks */}
          {eligibility && (
            <div className="w-full space-y-2.5 mb-8">
              {eligibility.checks.map((check) => (
                <div key={check.label} className={cn("rounded-xl px-4 py-3 flex items-start gap-3", check.passed ? "bg-success/8 border border-success/20" : "bg-destructive/8 border border-destructive/20")}>
                  {check.passed
                    ? <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    : <XCircle className="size-4 text-destructive shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-xs font-semibold text-foreground">{check.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isEligible ? (
            <Button
              className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold gap-2"
              onClick={() => navigate("ballot")}
            >
              <Vote className="size-4" />
              Proceed to Ballot
            </Button>
          ) : (
            <Button variant="outline" className="w-full h-13 rounded-2xl" onClick={() => navigate("detail")}>
              Back to Election Details
            </Button>
          )}
        </div>
      </AppShell>
    );
  }

  // ── Results ────────────────────────────────────────────────
  if (step === "results" && selectedElection) {
    const resultPositions = positions.map((pos) => ({
      name: pos,
      candidates: candidates.filter((c) => c.position === pos).sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0)),
    }));
    return (
      <AppShell>
        <TopBar title="Election Results" showBack onBack={() => navigate("detail")} />
        <div className="p-4 lg:p-8 space-y-6 pb-8">
          {/* Header */}
          <div className="gradient-navy rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                  <Trophy className="size-5 text-[oklch(0.18_0.07_255)]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-tight">{selectedElection.title}</h2>
                  <p className="text-white/50 text-xs">
                    Results published: {selectedElection.resultsPublishedAt
                      ? new Date(selectedElection.resultsPublishedAt).toLocaleDateString("en-NG", { dateStyle: "long" })
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: "Eligible Voters", value: selectedElection.voterTurnout.eligible.toLocaleString() },
                  { label: "Votes Cast",       value: selectedElection.voterTurnout.voted.toLocaleString()   },
                  { label: "Turnout",           value: `${Math.round(selectedElection.voterTurnout.voted / selectedElection.voterTurnout.eligible * 100)}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="glass rounded-xl px-3 py-2.5 text-center">
                    <p className="text-lg font-black text-white">{value}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results by position */}
          <div className="space-y-6">
            {resultPositions.map(({ name: posName, candidates: posCands }) => {
              const totalPositionVotes = posCands.reduce((sum, c) => sum + (c.votes ?? 0), 0);
              return (
                <Card key={posName} className="rounded-2xl border-border">
                  <div className="p-5 border-b border-border flex items-center gap-2">
                    <Gavel className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">{posName}</h3>
                    <span className="ml-auto text-xs text-muted-foreground">{posCands.length} candidates</span>
                  </div>
                  <div className="p-5 space-y-3">
                    {posCands.map((c) => (
                      <ResultBar key={c.id} candidate={c} totalVotes={totalPositionVotes} />
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {selectedElection.hasVoted && selectedElection.voteReceiptNumber && (
            <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3 text-xs text-muted-foreground">
              <Award className="size-4 shrink-0" />
              <span>You voted in this election. Receipt: <span className="font-mono font-semibold text-foreground">{selectedElection.voteReceiptNumber}</span></span>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  // ── Nominations ────────────────────────────────────────────
  if (step === "nominations" && selectedElection) {
    const nomineesByPosition = positions.map((pos) => ({
      position: pos,
      nominees: candidates.filter((c) => c.position === pos),
    }));
    const deadline = new Date(selectedElection.nominationDeadline);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return (
      <AppShell>
        <TopBar title="Nominations" showBack onBack={() => navigate("detail")} />
        <div className="p-4 lg:p-8 space-y-6 pb-8">
          {/* Deadline banner */}
          <div className="gradient-gold rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[oklch(0.18_0.07_255)]/20 flex items-center justify-center shrink-0">
              <Clock className="size-6 text-[oklch(0.18_0.07_255)]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-[oklch(0.18_0.07_255)] leading-none">Nominations Close</p>
              <p className="text-[oklch(0.18_0.07_255)]/70 text-xs mt-0.5">{deadline.toLocaleDateString("en-NG", { dateStyle: "full" })}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black text-[oklch(0.18_0.07_255)]">{daysLeft}</p>
              <p className="text-[10px] text-[oklch(0.18_0.07_255)]/70">days left</p>
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-3 bg-muted rounded-xl px-4 py-3 text-xs text-muted-foreground">
            <BookOpen className="size-3.5 mt-0.5 shrink-0" />
            <span>Nominations are not anonymous. Nominees must be financial members in good standing, called to bar for at least 3 years, with a minimum 60% attendance record.</span>
          </div>

          {/* Nominations by position */}
          <div className="space-y-5">
            {nomineesByPosition.map(({ position, nominees }) => (
              <Card key={position} className="rounded-2xl border-border">
                <div className="p-5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gavel className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">{position}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">{nominees.length} nominee{nominees.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-border">
                  {nominees.map((nominee) => (
                    <div key={nominee.id} className="flex items-center gap-3 px-5 py-4">
                      <div className="w-10 h-10 rounded-xl gradient-navy flex items-center justify-center shrink-0 text-sm font-black text-white">
                        {initials(nominee.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{nominee.name}</p>
                        <p className="text-xs text-muted-foreground">Called {nominee.yearCalled} · {nominee.practiceArea}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Proposed by {nominee.proposer} · Seconded by {nominee.seconder}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-gold/10 border-gold/30 text-[oklch(0.55_0.10_75)] shrink-0">Nominated</Badge>
                    </div>
                  ))}
                  {nominees.length === 0 && (
                    <div className="px-5 py-6 text-center">
                      <Users className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No nominations yet for this position</p>
                    </div>
                  )}
                </div>
                {/* Declare candidacy */}
                <div className="p-4 border-t border-border bg-muted/30">
                  <Button variant="outline" size="sm" className="w-full rounded-xl h-9 gap-2 text-xs font-semibold">
                    <UserCheck className="size-3.5" />
                    Declare My Candidacy for {position}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Election Detail ────────────────────────────────────────
  if (step === "detail" && selectedElection) {
    const turnoutPct = selectedElection.voterTurnout.eligible > 0
      ? Math.round((selectedElection.voterTurnout.voted / selectedElection.voterTurnout.eligible) * 100)
      : 0;
    const positionCounts = positions.map((pos) => ({
      name: pos,
      count: candidates.filter((c) => c.position === pos).length,
    }));

    return (
      <AppShell>
        <TopBar title="Election Details" showBack onBack={resetToList} />
        <div className="p-4 lg:p-8 space-y-6 pb-8">
          {/* Header */}
          <div className="gradient-navy rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-48 h-48 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-xl font-black text-white leading-tight flex-1">{selectedElection.title}</h2>
                <PhaseBadge phase={selectedElection.phase} />
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5">{selectedElection.description}</p>
              <PhaseTimeline election={selectedElection} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: details */}
            <div className="lg:col-span-2 space-y-5">
              {/* Election info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Calendar, label: "Voting Date",    value: new Date(selectedElection.votingStart).toLocaleDateString("en-NG", { dateStyle: "medium" })     },
                  { icon: Clock,    label: "Voting Hours",   value: `${new Date(selectedElection.votingStart).toLocaleTimeString("en-NG", { timeStyle: "short" })} – ${new Date(selectedElection.votingEnd).toLocaleTimeString("en-NG", { timeStyle: "short" })}` },
                  { icon: Users,    label: "Eligible Voters",value: selectedElection.voterTurnout.eligible.toLocaleString()                                          },
                  { icon: FileText, label: "Positions",      value: `${positions.length} positions, ${candidates.filter(c => c.electionId === selectedElectionId).length} candidates`          },
                ].map(({ icon: Icon, label, value }) => (
                  <Card key={label} className="rounded-2xl border-border">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Positions with candidate counts */}
              <Card className="rounded-2xl border-border">
                <div className="p-5 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground">Positions on the Ballot</h3>
                </div>
                <div className="divide-y divide-border">
                  {positionCounts.map(({ name: posName, count }) => (
                    <div key={posName} className="flex items-center gap-3 px-5 py-3.5">
                      <Gavel className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground font-medium flex-1">{posName}</span>
                      <span className="text-xs text-muted-foreground">{count} candidate{count !== 1 ? "s" : ""}</span>
                      <ChevronRight className="size-3.5 text-muted-foreground/40" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Voting rules */}
              <Card className="rounded-2xl border-border">
                <div className="p-5 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground">Voting Rules</h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { icon: Lock,         text: "Voting is completely anonymous — your choices cannot be traced to your identity." },
                    { icon: Shield,       text: "You may only vote once. Once submitted, your vote is final and cannot be changed." },
                    { icon: CheckCircle2, text: "You must select one candidate for each position before submitting your ballot." },
                    { icon: Award,        text: "Eligibility requirements: ≥75% attendance, all dues paid, active good standing." },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Icon className="size-4 text-primary shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: stats + CTA */}
            <div className="space-y-4">
              {/* Turnout card (if voting/results phase) */}
              {(selectedElection.phase === "voting" || selectedElection.phase === "results") && (
                <Card className="rounded-2xl border-border">
                  <CardContent className="p-5 space-y-4">
                    <h3 className="text-sm font-bold text-foreground">Live Turnout</h3>
                    <div className="text-center py-2">
                      <p className="text-4xl font-black text-foreground">{turnoutPct}%</p>
                      <p className="text-xs text-muted-foreground mt-1">{selectedElection.voterTurnout.voted} of {selectedElection.voterTurnout.eligible} eligible members</p>
                    </div>
                    <TurnoutBar voted={selectedElection.voterTurnout.voted} eligible={selectedElection.voterTurnout.eligible} />
                  </CardContent>
                </Card>
              )}

              {/* Main CTA */}
              <Card className="rounded-2xl border-border">
                <CardContent className="p-5 space-y-3">
                  {selectedElection.phase === "voting" && !selectedElection.hasVoted && selectedElection.memberEligible && (
                    <>
                      <p className="text-xs text-muted-foreground">Your ballot is ready. Verify your eligibility to begin.</p>
                      <Button
                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold gap-2"
                        onClick={startVoting}
                        disabled={checkingEligibility}
                      >
                        {checkingEligibility ? <RefreshCw className="size-4 animate-spin" /> : <Vote className="size-4" />}
                        {checkingEligibility ? "Checking…" : "Cast My Vote"}
                      </Button>
                    </>
                  )}
                  {selectedElection.hasVoted && (
                    <>
                      <div className="flex items-center gap-2 text-success text-sm font-semibold">
                        <CheckCircle2 className="size-4" />
                        You have already voted
                      </div>
                      <p className="text-xs text-muted-foreground">Receipt: <span className="font-mono font-semibold text-foreground">{selectedElection.voteReceiptNumber}</span></p>
                    </>
                  )}
                  {selectedElection.phase === "nomination" && (
                    <>
                      <p className="text-xs text-muted-foreground">Nominations are open. View or declare your candidacy.</p>
                      <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold gap-2" onClick={() => navigate("nominations")}>
                        <Users className="size-4" />
                        View Nominations
                      </Button>
                    </>
                  )}
                  {selectedElection.phase === "results" && (
                    <>
                      <p className="text-xs text-muted-foreground">Official results have been published.</p>
                      <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold gap-2" onClick={() => navigate("results")}>
                        <BarChart3 className="size-4" />
                        View Results
                      </Button>
                    </>
                  )}
                  {selectedElection.phase === "tallying" && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <RefreshCw className="size-4 animate-spin shrink-0" />
                      <span>Votes are being tallied. Results will be published shortly.</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Anonymity guarantee */}
              <div className="flex items-start gap-3 bg-muted rounded-xl px-4 py-3 text-xs text-muted-foreground">
                <Lock className="size-3.5 shrink-0 mt-0.5" />
                <span>{selectedElection.isAnonymous ? "This is a secret ballot. Your identity is never linked to your selections." : "This is a public ballot. Vote selections will be published."}</span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Elections List (default) ───────────────────────────────
  const openElections = mockElections.filter((e) => e.phase === "voting");
  const totalEligibleVoters = openElections[0]?.voterTurnout.eligible ?? 287;
  const totalVotesCast = openElections.reduce((sum, e) => sum + e.voterTurnout.voted, 0);

  return (
    <AppShell>
      <TopBar title="Elections" showNotif />
      <div className="p-4 lg:p-8 space-y-6 pb-8">

        {/* Banner */}
        <div className="gradient-navy rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-52 h-52 rounded-full bg-white/5" />
          <div className="absolute bottom-[-10px] right-[80px] w-28 h-28 rounded-full bg-white/5" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shrink-0 shadow-xl">
                <Vote className="size-7 text-[oklch(0.18_0.07_255)]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Branch Elections</h2>
                <p className="text-white/55 text-sm">Your vote is your voice. Exercise it.</p>
              </div>
            </div>
            {openElections.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Open Elections",   value: openElections.length },
                  { label: "Eligible Voters",  value: totalEligibleVoters  },
                  { label: "Votes Cast Today", value: totalVotesCast        },
                ].map(({ label, value }) => (
                  <div key={label} className="glass rounded-xl px-4 py-2.5 text-center min-w-[90px]">
                    <p className="text-lg font-black text-white">{value.toLocaleString()}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Elections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {mockElections.map((election) => {
            const turnoutPct = election.voterTurnout.eligible > 0
              ? Math.round((election.voterTurnout.voted / election.voterTurnout.eligible) * 100)
              : 0;
            return (
              <Card
                key={election.id}
                className="rounded-2xl border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openElection(election.id)}
              >
                <CardContent className="p-5 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-bold text-foreground leading-tight flex-1">{election.title}</h3>
                    <PhaseBadge phase={election.phase} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{election.description}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {new Date(election.votingStart).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Trophy className="size-3.5" />
                      {election.positions.length} positions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {election.totalCandidates} candidates
                    </span>
                  </div>

                  {/* Position chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {election.positions.slice(0, 3).map((p) => (
                      <span key={p} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{p}</span>
                    ))}
                    {election.positions.length > 3 && (
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">+{election.positions.length - 3} more</span>
                    )}
                  </div>

                  {/* Turnout (voting/results phase) */}
                  {(election.phase === "voting" || election.phase === "results") && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Turnout</span>
                        <span>{election.voterTurnout.voted} / {election.voterTurnout.eligible} ({turnoutPct}%)</span>
                      </div>
                      <Progress value={turnoutPct} className="h-1" />
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto">
                    {election.phase === "voting" && !election.hasVoted && election.memberEligible && (
                      <Button className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm gap-2" onClick={(e) => { e.stopPropagation(); openElection(election.id); }}>
                        <Vote className="size-4" />Cast Your Vote
                      </Button>
                    )}
                    {election.phase === "voting" && election.hasVoted && (
                      <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-3 py-2.5">
                        <CheckCircle2 className="size-4 text-success" />
                        <div>
                          <p className="text-xs font-semibold text-success">Vote recorded</p>
                          {election.voteReceiptNumber && <p className="text-[10px] text-muted-foreground font-mono">{election.voteReceiptNumber}</p>}
                        </div>
                      </div>
                    )}
                    {election.phase === "nomination" && (
                      <Button variant="outline" className="w-full h-10 rounded-xl text-sm gap-2 font-semibold" onClick={(e) => { e.stopPropagation(); openElection(election.id); }}>
                        <Users className="size-4" />View Nominations
                      </Button>
                    )}
                    {election.phase === "results" && (
                      <Button variant="outline" className="w-full h-10 rounded-xl text-sm gap-2 font-semibold" onClick={(e) => { e.stopPropagation(); openElection(election.id); }}>
                        <BarChart3 className="size-4" />View Results
                      </Button>
                    )}
                    {election.phase === "tallying" && (
                      <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
                        <RefreshCw className="size-4 text-muted-foreground animate-spin" />
                        <span className="text-xs text-muted-foreground">Tallying votes…</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
