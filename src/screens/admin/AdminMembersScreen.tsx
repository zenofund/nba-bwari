import React from "react";
import { AdminLayout, AdminCard } from "@/screens/admin/AdminLayout";
import { mockAdminMembers } from "@/lib/admin-mock-data";
import type { AdminMember } from "@/lib/admin-mock-data";
import { adminMembersApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, UserPlus, Download, MoreVertical, CheckCircle2,
  XCircle, Clock, Ban, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  Active: { label: "Active", className: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
  Inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border", icon: Clock },
  Suspended: { label: "Suspended", className: "bg-destructive/15 text-destructive border-destructive/30", icon: Ban },
  Pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/30", icon: Clock },
};

export function AdminMembersScreen() {
  const [loading, setLoading] = React.useState(true);
  const [members, setMembers] = React.useState<AdminMember[]>(mockAdminMembers);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedMember, setSelectedMember] = React.useState<AdminMember | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await adminMembersApi.list({ status: statusFilter, search });
      setMembers(data);
      setLoading(false);
    };
    loadData();
  }, [search, statusFilter]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    await adminMembersApi.approve(id);
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, membershipStatus: "Active" } : m));
    setActionLoading(false);
    setDetailOpen(false);
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(true);
    await adminMembersApi.suspend(id);
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, membershipStatus: "Suspended" } : m));
    setActionLoading(false);
    setDetailOpen(false);
  };

  const handleActivate = async (id: string) => {
    setActionLoading(true);
    await adminMembersApi.activate(id);
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, membershipStatus: "Active" } : m));
    setActionLoading(false);
    setDetailOpen(false);
  };

  const pendingCount = mockAdminMembers.filter((m) => m.membershipStatus === "Pending").length;

  return (
    <AdminLayout
      title="Member Management"
      subtitle={`${mockAdminMembers.length} total members · ${pendingCount} pending approval`}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl hidden sm:flex" onClick={() => adminMembersApi.export("csv")}>
            <Download className="size-4 mr-1.5" />
            Export
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl bg-primary text-primary-foreground">
                <UserPlus className="size-4 mr-1.5" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Register New Member</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold">Full Name</label>
                  <Input placeholder="Barr. Full Name" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">NBA Number</label>
                  <Input placeholder="NBA/ABJ/XXXX/XXXX" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">SC Number</label>
                  <Input placeholder="SCN/XXXX/XXXX" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Email</label>
                  <Input type="email" placeholder="email@lawfirm.ng" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Phone</label>
                  <Input placeholder="+234 800 000 0000" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Year Called to Bar</label>
                  <Input type="number" placeholder="2015" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Membership Status</label>
                  <Select defaultValue="Active">
                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button className="bg-primary text-primary-foreground" onClick={() => setAddOpen(false)}>Register Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, NBA number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 rounded-xl bg-card border-border w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members table */}
      <AdminCard className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground font-medium">No members found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Member</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">NBA Number</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Attendance</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Good Standing</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Joined</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const status = statusConfig[member.membershipStatus];
                    return (
                      <tr
                        key={member.id}
                        className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
                        onClick={() => { setSelectedMember(member); setDetailOpen(true); }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl gradient-navy flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-white">{member.fullName.replace("Barr. ", "").charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{member.fullName}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{member.nbaNumber}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={cn("text-xs", status.className)}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("text-sm font-semibold", member.attendancePercentage >= 75 ? "text-success" : "text-warning")}>
                            {member.attendancePercentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {member.goodStanding
                            ? <ShieldCheck className="size-4 text-success" />
                            : <XCircle className="size-4 text-muted-foreground" />}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(member.joinedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <button className="p-1.5 rounded-lg hover:bg-accent">
                            <MoreVertical className="size-4 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-border">
              {members.map((member) => {
                const status = statusConfig[member.membershipStatus];
                return (
                  <button
                    key={member.id}
                    className="w-full text-left p-4 hover:bg-accent/30 transition-colors"
                    onClick={() => { setSelectedMember(member); setDetailOpen(true); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-navy flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white">{member.fullName.replace("Barr. ", "").charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.nbaNumber}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs shrink-0", status.className)}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-13">
                      <span className="text-xs text-muted-foreground">Attendance: <span className={cn("font-semibold", member.attendancePercentage >= 75 ? "text-success" : "text-warning")}>{member.attendancePercentage}%</span></span>
                      <span className="text-xs text-muted-foreground">GS: {member.goodStanding ? "✓" : "✗"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </AdminCard>

      {/* Member detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>Member Details</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-4 py-2">
                <div className="w-16 h-16 rounded-2xl gradient-navy flex items-center justify-center shrink-0">
                  <span className="text-xl font-black text-white">{selectedMember.fullName.replace("Barr. ", "").charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedMember.fullName}</h3>
                  <p className="text-xs text-muted-foreground">{selectedMember.nbaNumber}</p>
                  <Badge variant="outline" className={cn("text-xs mt-1", statusConfig[selectedMember.membershipStatus].className)}>
                    {statusConfig[selectedMember.membershipStatus].label}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 py-2">
                {[
                  { label: "Email", value: selectedMember.email },
                  { label: "Phone", value: selectedMember.phone },
                  { label: "Year Called to Bar", value: String(selectedMember.yearCalledToBar) },
                  { label: "Attendance Rate", value: `${selectedMember.attendancePercentage}%` },
                  { label: "Financial Compliance", value: selectedMember.financialCompliance ? "Compliant" : "Non-Compliant" },
                  { label: "Good Standing", value: selectedMember.goodStanding ? "Yes" : "No" },
                  { label: "Member Since", value: new Date(selectedMember.joinedAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              <DialogFooter className="flex-col gap-2">
                {selectedMember.membershipStatus === "Pending" && (
                  <Button className="w-full bg-success text-success-foreground" disabled={actionLoading} onClick={() => handleApprove(selectedMember.id)}>
                    <CheckCircle2 className="size-4 mr-2" />
                    Approve Member
                  </Button>
                )}
                {selectedMember.membershipStatus === "Active" && (
                  <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/5" disabled={actionLoading} onClick={() => handleSuspend(selectedMember.id)}>
                    <Ban className="size-4 mr-2" />
                    Suspend Member
                  </Button>
                )}
                {selectedMember.membershipStatus === "Suspended" && (
                  <Button className="w-full bg-primary text-primary-foreground" disabled={actionLoading} onClick={() => handleActivate(selectedMember.id)}>
                    <CheckCircle2 className="size-4 mr-2" />
                    Re-activate Member
                  </Button>
                )}
                {selectedMember.membershipStatus === "Inactive" && (
                  <Button className="w-full bg-primary text-primary-foreground" disabled={actionLoading} onClick={() => handleActivate(selectedMember.id)}>
                    <CheckCircle2 className="size-4 mr-2" />
                    Activate Member
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
