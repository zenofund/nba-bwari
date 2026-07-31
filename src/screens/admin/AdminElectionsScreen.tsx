import React from "react";
import { AdminLayout, AdminCard, AdminStatCard } from "@/screens/admin/AdminLayout";
import { mockAdminElections, mockAdminCandidates } from "@/lib/admin-mock-data";
import { adminElectionsApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Vote, Users, Trophy, Plus, Trash2, Play, Square,
  Calendar, Clock, UserPlus, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-royal/15 text-royal border-royal/30" },
  active: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function AdminElectionsScreen() {
  const [loading, setLoading] = React.useState(true);
  const [addElectionOpen, setAddElectionOpen] = React.useState(false);
  const [addCandidateOpen, setAddCandidateOpen] = React.useState(false);
  const [selectedElectionId, setSelectedElectionId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("elections");

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const selectedElection = mockAdminElections.find((e) => e.id === selectedElectionId);
  const candidates = mockAdminCandidates.filter((c) => c.electionId === selectedElectionId);

  return (
    <AdminLayout
      title="Elections Management"
      subtitle="Create elections, manage candidates, and view results"
      actions={
        <Dialog open={addElectionOpen} onOpenChange={setAddElectionOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl bg-primary text-primary-foreground">
              <Plus className="size-4 mr-1.5" />
              Create Election
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
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
                <Input placeholder="Annual election for branch executive positions" className="h-10 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Start Date</label>
                  <Input type="date" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">End Date</label>
                  <Input type="date" className="h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Positions (comma-separated)</label>
                <Input placeholder="Chairman, Secretary, Treasurer" className="h-10 rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddElectionOpen(false)}>Cancel</Button>
              <Button className="bg-primary text-primary-foreground" onClick={() => setAddElectionOpen(false)}>Create Election</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Total Elections" value={mockAdminElections.length} icon={Vote} color="text-royal" bg="bg-royal/10" />
        <AdminStatCard label="Active" value={mockAdminElections.filter((e) => e.status === "active").length} icon={Play} color="text-success" bg="bg-success/10" />
        <AdminStatCard label="Total Candidates" value={mockAdminCandidates.length} icon={Users} color="text-gold" bg="bg-gold/10" />
        <AdminStatCard label="Eligible Voters" value={mockAdminElections[0]?.eligibleVoters || 0} icon={BarChart3} color="text-primary" bg="bg-primary/10" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="candidates" disabled={!selectedElectionId}>Candidates</TabsTrigger>
        </TabsList>

        {/* Elections Tab */}
        <TabsContent value="elections">
          {loading ? (
            <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {mockAdminElections.map((election) => {
                const status = statusConfig[election.status];
                return (
                  <AdminCard key={election.id} className="p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-foreground">{election.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{election.description}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-xs shrink-0", status.className)}>{status.label}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(election.startDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(election.startDate).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="size-3" />
                          {election.positions.length} positions
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="size-3" />
                          {election.eligibleVoters} eligible
                        </div>
                      </div>

                      {/* Positions */}
                      <div className="flex flex-wrap gap-1.5">
                        {election.positions.map((p) => (
                          <span key={p} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{p}</span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        {election.status === "upcoming" && (
                          <Button
                            size="sm"
                            className="rounded-xl bg-success text-success-foreground"
                            onClick={() => adminElectionsApi.activate(election.id)}
                          >
                            <Play className="size-3.5 mr-1" />
                            Activate
                          </Button>
                        )}
                        {election.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => adminElectionsApi.close(election.id)}
                          >
                            <Square className="size-3.5 mr-1" />
                            Close
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            setSelectedElectionId(election.id);
                            setActiveTab("candidates");
                          }}
                        >
                          <Users className="size-3.5 mr-1" />
                          Manage Candidates
                        </Button>
                        {election.status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => adminElectionsApi.getResults(election.id)}
                          >
                            <BarChart3 className="size-3.5 mr-1" />
                            View Results
                          </Button>
                        )}
                      </div>
                    </div>
                  </AdminCard>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates">
          {selectedElection && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{selectedElection.title}</h3>
                  <p className="text-xs text-muted-foreground">{candidates.length} candidates registered</p>
                </div>
                <Dialog open={addCandidateOpen} onOpenChange={setAddCandidateOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-xl bg-primary text-primary-foreground">
                      <UserPlus className="size-4 mr-1.5" />
                      Add Candidate
                    </Button>
                  </DialogTrigger>
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
                        <Input placeholder="Branch Chairman" className="h-10 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold">Manifesto</label>
                        <Input placeholder="Candidate's vision and pledges..." className="h-10 rounded-xl" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddCandidateOpen(false)}>Cancel</Button>
                      <Button className="bg-primary text-primary-foreground" onClick={() => setAddCandidateOpen(false)}>Add Candidate</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {candidates.map((candidate) => (
                  <AdminCard key={candidate.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl gradient-navy flex items-center justify-center shrink-0">
                        <span className="text-lg font-black text-white">
                          {candidate.name.replace("Barr. ", "").charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-foreground">{candidate.name}</h4>
                        <p className="text-xs text-muted-foreground">{candidate.position} · Called {candidate.yearCalled}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{candidate.manifesto}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl text-destructive hover:bg-destructive/10"
                        onClick={() => adminElectionsApi.removeCandidate(candidate.electionId, candidate.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </AdminCard>
                ))}
                {candidates.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-medium">No candidates yet</p>
                    <p className="text-xs text-muted-foreground">Add candidates for this election</p>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
