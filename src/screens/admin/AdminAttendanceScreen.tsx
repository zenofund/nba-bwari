import React from "react";
import { AdminLayout, AdminCard, AdminStatCard } from "@/screens/admin/AdminLayout";
import { mockAdminMeetings } from "@/lib/admin-mock-data";
import type { AdminMeeting } from "@/lib/admin-mock-data";
import { adminMeetingsApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarPlus, Download, Lock, Unlock, MapPin, Clock,
  Eye, CalendarCheck, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  upcoming: { label: "Upcoming", className: "bg-royal/15 text-royal border-royal/30" },
  open: { label: "Open", className: "bg-success/15 text-success border-success/30" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function AdminAttendanceScreen() {
  const [loading, setLoading] = React.useState(true);
  const [meetings, setMeetings] = React.useState<AdminMeeting[]>(mockAdminMeetings);
  const [addOpen, setAddOpen] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const handleToggleAttendance = async (id: string, currentOpen: boolean) => {
    setActionLoading(true);
    if (currentOpen) {
      await adminMeetingsApi.closeAttendance(id);
      setMeetings((prev) => prev.map((m) => m.id === id ? { ...m, attendanceOpen: false, status: "completed" } : m));
    } else {
      await adminMeetingsApi.openAttendance(id);
      setMeetings((prev) => prev.map((m) => m.id === id ? { ...m, attendanceOpen: true, status: "open" } : m));
    }
    setActionLoading(false);
  };

  const completed = meetings.filter((m) => m.status === "completed");
  const avgAttendance = completed.length > 0
    ? Math.round(completed.reduce((sum, m) => sum + (m.attendanceCount / m.totalMembers) * 100, 0) / completed.length)
    : 0;

  return (
    <AdminLayout
      title="Attendance Management"
      subtitle="Create meetings, manage attendance, and export records"
      actions={
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl bg-primary text-primary-foreground">
              <CalendarPlus className="size-4 mr-1.5" />
              Create Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Meeting Title</label>
                <Input placeholder="Monthly General Meeting — August 2025" className="h-10 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Date</label>
                  <Input type="date" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Time</label>
                  <Input type="time" className="h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Venue</label>
                <Input placeholder="Bwari Community Centre, Area 1" className="h-10 rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="bg-primary text-primary-foreground" onClick={() => setAddOpen(false)}>Create Meeting</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Total Meetings" value={meetings.length} icon={CalendarCheck} color="text-royal" bg="bg-royal/10" />
        <AdminStatCard label="Avg Attendance" value={`${avgAttendance}%`} icon={TrendingUp} color="text-success" bg="bg-success/10" />
        <AdminStatCard label="Upcoming" value={meetings.filter((m) => m.status === "upcoming").length} icon={Clock} color="text-primary" bg="bg-primary/10" />
        <AdminStatCard label="Attendance Open" value={meetings.filter((m) => m.attendanceOpen).length} icon={Unlock} color="text-gold" bg="bg-gold/10" />
      </div>

      {/* Meeting list */}
      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          meetings.map((meeting) => {
            const status = statusConfig[meeting.status];
            const attendancePct = meeting.totalMembers > 0 ? Math.round((meeting.attendanceCount / meeting.totalMembers) * 100) : 0;
            return (
              <AdminCard key={meeting.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Date block */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl gradient-navy flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] text-white/60 uppercase">{new Date(meeting.date).toLocaleDateString("en-NG", { month: "short" })}</span>
                      <span className="text-lg font-black text-white leading-none">{new Date(meeting.date).getDate()}</span>
                    </div>
                    <div className="sm:hidden">
                      <Badge variant="outline" className={cn("text-xs", status.className)}>{status.label}</Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{meeting.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">{meeting.venue}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(meeting.date).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    {meeting.status === "completed" && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 max-w-[200px] h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${attendancePct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {meeting.attendanceCount}/{meeting.totalMembers} ({attendancePct}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block">
                      <Badge variant="outline" className={cn("text-xs", status.className)}>{status.label}</Badge>
                    </div>
                    {meeting.status === "upcoming" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-success border-success/30 hover:bg-success/10"
                        disabled={actionLoading}
                        onClick={() => handleToggleAttendance(meeting.id, meeting.attendanceOpen)}
                      >
                        <Unlock className="size-3.5 mr-1" />
                        Open
                      </Button>
                    )}
                    {meeting.status === "open" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={actionLoading}
                        onClick={() => handleToggleAttendance(meeting.id, meeting.attendanceOpen)}
                      >
                        <Lock className="size-3.5 mr-1" />
                        Close
                      </Button>
                    )}
                    {meeting.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => adminMeetingsApi.exportAttendance(meeting.id)}
                      >
                        <Download className="size-3.5 mr-1" />
                        Export
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="rounded-xl">
                      <Eye className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </AdminCard>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
}
