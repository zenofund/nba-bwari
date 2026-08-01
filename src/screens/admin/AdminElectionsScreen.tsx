import React from "react";
import { AdminLayout, AdminCard, AdminStatCard } from "@/screens/admin/AdminLayout";
import {
  mockAdminElections, mockAdminCandidates,
  type AdminElection, type AdminElectionPhase,
} from "@/lib/admin-mock-data";
import { adminElectionsApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Vote, Users, Trophy, Plus, Trash2, Play, Square,
  Calendar, Clock, UserPlus, BarChart3, CheckCircle2,
  ArrowRight, ChevronLeft, Lock, Gavel, RefreshCw,
  AlertCircle, Award, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Phase config
// ─────────────────────────────────────────────────────────────
type PhaseConfig = {
  label: string;
  badge: string;
  next: AdminElectionPhase | null;
  nextLabel: string | null;
  nextIcon: React.ElementType | null;
  color: string;
};

const phaseConfig: Record<AdminElectionPhase, PhaseConfig> = {
  pending: {
    label: "Not Started",
    badge: "bg-muted text-muted-foreground border-border",
    next: "nominations",
    nextLabel: "Open Nominations",
    nextIcon: FileText,
    color: "text-muted-foreground",
  },
  nominations: {
    label: "Nominations Open",
    badge: "bg-gold/15 text-[oklch(0.55_0.10_75)] border-gold/30",
    next: "voting",
    nextLabel: "Open Voting",
    nextIcon: Vote,
    color: "text-[oklch(0.55_0.10_75)]",
  },
  voting: {
    label: "Voting Open",
    badge: "bg-success/15 text-success border-success/30",
    next: "tallying",
    nextLabel: "Close Voting & Tally",
    nextIcon: Square,
    color: "text-success",
  },
  tallying: {
    label: "Tallying Votes",
    badge: "bg-warning/15 text-warning border-warning/30",
    next: "results",
    nextLabel: "Publish Results",
    nextIcon: Trophy,
    color: "text-warning",
  },
  results: {
    label: "Results Published",
    badge: "bg-primary/10 text-primary border-primary/20",
    next: null,
    nextLabel: null,
    nextIcon: null,
    color: "text-primary",
  },
};

const phaseOrder: AdminElectionPhase[] = ["pending", "nominations", "voting", "tallying", "results"];

function initials(name: string) {
  return name.replace("Barr. ", "").split(" ").slice(0, 2).map((w) => w[0]).join("");
}

// ─────────────────────────────────────────────────────────────
// Phase timeline strip
// ─────────────────────────────────────────────────────────────
function PhaseTimeline({ phase }: { phase: AdminElectionPhase }) {
  const current = phaseOrder.indexOf(phase);
  const steps = [
    { key: "nominations", label: "Nominations" },
    { key: "voting",      label: "Voting"      },
    { key: "tallying",    label: "Tallying"     },
    { key: "results",     label: "Results"      },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const stepIdx = phaseOrder.indexOf(step.key as AdminElectionPhase);
        const isDone   = stepIdx < current;
        const isActive = stepIdx === current;
        const isLast   = i === steps.length - 1;
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2",
                isDone   ? "bg-success border-success text-white"             :
                isActive ? "bg-primary border-primary text-primary-foreground" :
                           "bg-background border-border text-muted-foreground"
              )}>
                {isDone ? <CheckCircle2 className="size-3" /> : i + 1}
              </div>
              <p className={cn(
                "text-[9px] font-semibold mt-1 text-center",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>{step.label}</p>
            </div>
            {!isLast && (
              <div className={cn("flex-1 h-0.5 mx-1 mb-4", isDone ? "bg-success" : "bg-border")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Result bar
// ─────────────────────────────────────────────────────────────
function ResultBar({
  name, votes, totalVotes, isWinner,
}: { name: string; votes: number; totalVotes: number; isWinner: boolean }) {
  const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  return (
    <div className={cn("rounded-xl p-4 border", isWinner ? "border-gold/40 bg-gold/5" : "border-border bg-muted/30")}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black", isWinner ? "gradient-gold text-[oklch(0.18_0.07_255)]" : "bg-muted text-muted-foreground")}>
          {isWinner ? <Trophy className="size-4" /> : initials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground truncate">{name}</p>
            {isWinner && <Badge variant="outline" className="text-[10px] border-gold/40 text-gold bg-gold/10 shrink-0">Winner</Badge>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-foreground">{pct}%</p>
          <p className="text-[10px] text-muted-foreground">{votes} votes</p>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", isWinner ? "gradient-gold" : "bg-primary/40")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Create Election Dialog
// ─────────────────────────────────────────────────────────────
function CreateElectionDialog({
  open, onClose,
}: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Election</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Election Title</label>
            <Input placeholder="NBA Bwari Branch Elections 2026" className="h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Description</label>
            <textarea
              placeholder="Annual election for branch executive positions…"
              className="w-full min-h-[72px] resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Nomination Deadline</label>
              <Input type="date" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Voting Date</label>
              <Input type="date" className="h-10 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Voting Opens</label>
              <Input type="time" className="h-10 rounded-xl" defaultValue="08:00" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Voting Closes</label>
              <Input type="time" className="h-10 rounded-xl" defaultValue="18:00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Positions (comma-separated)</label>
            <Input placeholder="Branch Chairman, Vice Chairman, Secretary…" className="h-10 rounded-xl" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <div>
              <p className="text-xs font-semibold text-foreground">Anonymous ballot</p>
              <p className="text-[10px] text-muted-foreground">Members' vote choices cannot be traced to their identity</p>
            </div>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground" onClick={onClose}>
            Create Election
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Candidate Dialog
// ─────────────────────────────────────────────────────────────
function AddCandidateDialog({
  open, onClose, positions,
}: { open: boolean; onClose: () => void; positions: string[] }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Candidate</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Candidate Name</label>
            <Input placeholder="Barr. Full Name" className="h-10 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">NBA Number</label>
              <Input placeholder="NBA/ABJ/XXXX/XXXX" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Year Called</label>
              <Input type="number" placeholder="2015" className="h-10 rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Position</label>
            <select className="w-full h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select position…</option>
              {positions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Election Statement / Manifesto</label>
            <textarea
              placeholder="Candidate's vision and pledges…"
              className="w-full min-h-[80px] resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Proposed by</label>
              <Input placeholder="Barr. Proposer Name" className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Seconded by</label>
              <Input placeholder="Barr. Seconder Name" className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-primary text-primary-foreground" onClick={onClose}>
            <UserPlus className="size-4 mr-1.5" />
            Add Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Phase transition button with confirmation
// ─────────────────────────────────────────────────────────────
function PhaseTransitionButton({ election }: { election: AdminElection }) {
  const [confirming, setConfirming] = React.useState(false);
  const cfg = phaseConfig[election.phase];
  if (!cfg.next || !cfg.nextLabel || !cfg.nextIcon) return null;
  const Icon = cfg.nextIcon;

  if (confirming) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-warning/10 border border-warning/30 px-3 py-2">
        <AlertCircle className="size-4 text-warning shrink-0" />
        <span className="text-xs text-foreground flex-1">
          Advance to <strong>{phaseConfig[cfg.next].label}</strong>? This cannot be undone.
        </span>
        <Button
          size="sm"
          className="h-7 text-xs px-2.5 rounded-lg bg-primary text-primary-foreground"
          onClick={() => {
            adminElectionsApi.activate(election.id);
            setConfirming(false);
          }}
        >
          Confirm
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs px-2 rounded-lg"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      className={cn(
        "rounded-xl h-9 gap-1.5 text-xs font-semibold",
        election.phase === "voting"
          ? "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
          : "bg-primary text-primary-foreground"
      )}
      onClick={() => setConfirming(true)}
    >
      <Icon className="size-3.5" />
      {cfg.nextLabel}
    </Button>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
export function AdminElectionsScreen() {
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<"list" | "detail">("list");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailTab, setDetailTab] = React.useState("overview");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [addCandidateOpen, setAddCandidateOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const election = mockAdminElections.find((e) => e.id === selectedId) ?? null;
  const electionCandidates = mockAdminCandidates.filter((c) => c.electionId === selectedId);

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDetailTab("overview");
    setView("detail");
  };

  const activeCount    = mockAdminElections.filter((e) => e.phase === "voting").length;
  const completedCount = mockAdminElections.filter((e) => e.phase === "results").length;
  const totalCandidates = mockAdminCandidates.length;
  const maxEligible    = Math.max(...mockAdminElections.map((e) => e.eligibleVoters), 0);

  // ── LIST VIEW ──────────────────────────────────────────────
  if (view === "list") {
    return (
      <AdminLayout
        title="Elections Management"
        subtitle="Create elections, manage candidates, control voting phases, and publish results"
        actions={
          <Button
            size="sm"
            className="rounded-xl bg-primary text-primary-foreground"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4 mr-1.5" />
            Create Election
          </Button>
        }
      >
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <AdminStatCard label="Total Elections"   value={mockAdminElections.length} icon={Vote}     color="text-royal"   bg="bg-royal/10"   />
          <AdminStatCard label="Active (Voting)"   value={activeCount}                icon={Play}     color="text-success" bg="bg-success/10" />
          <AdminStatCard label="Total Candidates"  value={totalCandidates}            icon={Users}    color="text-gold"    bg="bg-gold/10"    />
          <AdminStatCard label="Eligible Voters"   value={maxEligible}                icon={BarChart3} color="text-primary" bg="bg-primary/10" />
        </div>

        {/* Election list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {mockAdminElections.map((el) => {
              const cfg    = phaseConfig[el.phase];
              const cands  = mockAdminCandidates.filter((c) => c.electionId === el.id);
              const turnoutPct = el.eligibleVoters > 0 ? Math.round((el.totalVotes / el.eligibleVoters) * 100) : 0;
              return (
                <AdminCard key={el.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <button
                          className="text-left hover:underline"
                          onClick={() => openDetail(el.id)}
                        >
                          <h3 className="text-sm font-bold text-foreground">{el.title}</h3>
                        </button>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{el.description}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs shrink-0 border", cfg.badge)}>
                        {cfg.label}
                      </Badge>
                    </div>

                    {/* Phase timeline */}
                    <PhaseTimeline phase={el.phase} />

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {new Date(el.startDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {new Date(el.startDate).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })} – {new Date(el.endDate).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Trophy className="size-3.5" />
                        {el.positions.length} positions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {cands.length} candidates
                      </span>
                      <span className="flex items-center gap-1.5">
                        {el.isAnonymous ? <Lock className="size-3.5" /> : null}
                        {el.isAnonymous ? "Anonymous ballot" : "Public ballot"}
                      </span>
                    </div>

                    {/* Turnout bar (if applicable) */}
                    {(el.phase === "voting" || el.phase === "tallying" || el.phase === "results") && (
                      <div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Voter turnout</span>
                          <span className="font-semibold text-foreground">{el.totalVotes} / {el.eligibleVoters} ({turnoutPct}%)</span>
                        </div>
                        <Progress value={turnoutPct} className="h-1.5" />
                      </div>
                    )}

                    {/* Position chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {el.positions.map((p) => (
                        <span key={p} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{p}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                      <PhaseTransitionButton election={el} />
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-9 gap-1.5 text-xs"
                        onClick={() => openDetail(el.id)}
                      >
                        <Users className="size-3.5" />
                        Manage Candidates
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl h-9 gap-1.5 text-xs ml-auto"
                        onClick={() => openDetail(el.id)}
                      >
                        View Details
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </AdminCard>
              );
            })}
          </div>
        )}

        <CreateElectionDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      </AdminLayout>
    );
  }

  // ── DETAIL VIEW ────────────────────────────────────────────
  if (!election) return null;

  const cfg         = phaseConfig[election.phase];
  const cands       = electionCandidates;
  const turnoutPct  = election.eligibleVoters > 0 ? Math.round((election.totalVotes / election.eligibleVoters) * 100) : 0;
  const positionGroups = election.positions.map((pos) => ({
    name: pos,
    candidates: cands.filter((c) => c.position === pos),
  }));

  return (
    <AdminLayout
      title={election.title}
      subtitle={phaseConfig[election.phase].label}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl h-9 gap-1.5 text-xs"
            onClick={() => setView("list")}
          >
            <ChevronLeft className="size-3.5" />
            All Elections
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-primary text-primary-foreground h-9 text-xs"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4 mr-1" />
            Create Election
          </Button>
        </div>
      }
    >
      {/* Header overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Eligible Voters"  value={election.eligibleVoters}                              icon={Users}    color="text-royal"   bg="bg-royal/10"   />
        <AdminStatCard label="Votes Cast"       value={election.totalVotes}                                  icon={Vote}     color="text-success" bg="bg-success/10" />
        <AdminStatCard label="Turnout"          value={`${turnoutPct}%`}                                     icon={BarChart3} color="text-gold"   bg="bg-gold/10"    />
        <AdminStatCard label="Candidates"       value={cands.length}                                          icon={Users}    color="text-primary" bg="bg-primary/10" />
      </div>

      <Tabs value={detailTab} onValueChange={setDetailTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates ({cands.length})</TabsTrigger>
            {election.phase === "results" && <TabsTrigger value="results">Results</TabsTrigger>}
          </TabsList>
          {detailTab === "candidates" && (
            <Button
              size="sm"
              className="rounded-xl bg-primary text-primary-foreground h-9 text-xs"
              onClick={() => setAddCandidateOpen(true)}
            >
              <UserPlus className="size-3.5 mr-1" />
              Add Candidate
            </Button>
          )}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-5">
          {/* Phase timeline */}
          <AdminCard className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">Election Phase</h3>
              <Badge variant="outline" className={cn("text-xs border", cfg.badge)}>{cfg.label}</Badge>
            </div>
            <PhaseTimeline phase={election.phase} />
            {cfg.next && (
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Next: {phaseConfig[cfg.next].label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {election.phase === "nominations" && `Nomination deadline: ${new Date(election.nominationDeadline).toLocaleDateString("en-NG", { dateStyle: "medium" })}`}
                    {election.phase === "voting" && `Voting window: ${new Date(election.startDate).toLocaleDateString("en-NG", { dateStyle: "medium" })} ${new Date(election.startDate).toLocaleTimeString("en-NG", { timeStyle: "short" })} – ${new Date(election.endDate).toLocaleTimeString("en-NG", { timeStyle: "short" })}`}
                    {election.phase === "pending" && "Open nominations to allow candidates to register"}
                    {election.phase === "tallying" && "Review results before publishing to members"}
                  </p>
                </div>
                <PhaseTransitionButton election={election} />
              </div>
            )}
          </AdminCard>

          {/* Election info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminCard className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground">Key Dates</h3>
              {[
                { icon: FileText, label: "Nomination Deadline", value: new Date(election.nominationDeadline).toLocaleDateString("en-NG", { dateStyle: "full" }) },
                { icon: Calendar, label: "Voting Date",         value: new Date(election.startDate).toLocaleDateString("en-NG", { dateStyle: "full" })           },
                { icon: Clock,    label: "Voting Window",       value: `${new Date(election.startDate).toLocaleTimeString("en-NG", { timeStyle: "short" })} – ${new Date(election.endDate).toLocaleTimeString("en-NG", { timeStyle: "short" })}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </AdminCard>

            <AdminCard className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground">Turnout</h3>
              <div className="text-center py-3">
                <p className="text-4xl font-black text-foreground">{turnoutPct}%</p>
                <p className="text-xs text-muted-foreground mt-1">{election.totalVotes} of {election.eligibleVoters} eligible members</p>
              </div>
              <Progress value={turnoutPct} className="h-2" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-success/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-foreground">{election.totalVotes}</p>
                  <p className="text-[10px] text-muted-foreground">Voted</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-foreground">{election.eligibleVoters - election.totalVotes}</p>
                  <p className="text-[10px] text-muted-foreground">Not Yet Voted</p>
                </div>
              </div>
            </AdminCard>
          </div>

          {/* Positions & candidate counts */}
          <AdminCard className="overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Positions on Ballot</h3>
            </div>
            <div className="divide-y divide-border">
              {positionGroups.map(({ name: pos, candidates: posCands }) => (
                <div key={pos} className="flex items-center gap-3 px-5 py-3.5">
                  <Gavel className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground font-medium flex-1">{pos}</span>
                  <span className="text-xs text-muted-foreground">{posCands.length} candidate{posCands.length !== 1 ? "s" : ""}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs rounded-lg px-2"
                    onClick={() => setDetailTab("candidates")}
                  >
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </AdminCard>

          {/* Settings */}
          <AdminCard className="p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Election Settings</h3>
            <div className="space-y-2.5">
              {[
                { label: "Anonymous ballot",    value: election.isAnonymous, icon: Lock   },
                { label: "Results published",   value: election.phase === "results", icon: Award  },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground flex-1">{label}</span>
                  <span className={cn("text-xs font-semibold", value ? "text-success" : "text-muted-foreground")}>
                    {value ? "Yes" : "No"}
                  </span>
                </div>
              ))}
            </div>
          </AdminCard>
        </TabsContent>

        {/* ── CANDIDATES TAB ────────────────────────────────── */}
        <TabsContent value="candidates" className="space-y-5">
          {positionGroups.map(({ name: pos, candidates: posCands }) => (
            <AdminCard key={pos} className="overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Gavel className="size-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{pos}</h3>
                </div>
                <span className="text-xs text-muted-foreground">{posCands.length} candidate{posCands.length !== 1 ? "s" : ""}</span>
              </div>
              {posCands.length > 0 ? (
                <div className="divide-y divide-border">
                  {posCands.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-4">
                      <div className="w-11 h-11 rounded-xl gradient-navy flex items-center justify-center shrink-0 text-base font-black text-white">
                        {initials(c.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.nbaNumber} · Called {c.yearCalled}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{c.manifesto}"</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl text-destructive hover:bg-destructive/10 h-9 w-9 p-0 shrink-0"
                        onClick={() => adminElectionsApi.removeCandidate(c.electionId, c.id)}
                        title="Remove candidate"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <Users className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No candidates for this position</p>
                </div>
              )}
            </AdminCard>
          ))}
        </TabsContent>

        {/* ── RESULTS TAB ───────────────────────────────────── */}
        {election.phase === "results" && (
          <TabsContent value="results" className="space-y-5">
            {/* Turnout summary */}
            <div className="gradient-navy rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="size-5 text-gold" />
                  <h3 className="text-base font-bold text-white">Official Results</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Eligible Voters", value: election.eligibleVoters.toLocaleString() },
                    { label: "Votes Cast",       value: election.totalVotes.toLocaleString()     },
                    { label: "Turnout",          value: `${turnoutPct}%`                          },
                  ].map(({ label, value }) => (
                    <div key={label} className="glass rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-white">{value}</p>
                      <p className="text-[10px] text-white/50 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results per position */}
            {positionGroups.map(({ name: pos, candidates: posCands }) => {
              const sorted     = [...posCands].sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
              const totalPosVotes = sorted.reduce((sum, c) => sum + (c.votes ?? 0), 0);
              return (
                <AdminCard key={pos} className="overflow-hidden">
                  <div className="p-5 border-b border-border flex items-center gap-2">
                    <Gavel className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">{pos}</h3>
                    <span className="ml-auto text-xs text-muted-foreground">{sorted.length} candidates</span>
                  </div>
                  <div className="p-5 space-y-3">
                    {sorted.map((c, i) => (
                      <ResultBar
                        key={c.id}
                        name={c.name}
                        votes={c.votes ?? 0}
                        totalVotes={totalPosVotes}
                        isWinner={i === 0}
                      />
                    ))}
                  </div>
                </AdminCard>
              );
            })}

            <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3 text-xs text-muted-foreground">
              <RefreshCw className="size-3.5 shrink-0" />
              <span>Results were published after independent verification and board ratification.</span>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <CreateElectionDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <AddCandidateDialog
        open={addCandidateOpen}
        onClose={() => setAddCandidateOpen(false)}
        positions={election.positions}
      />
    </AdminLayout>
  );
}
