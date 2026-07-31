import React from "react";
import { AdminLayout, AdminCard, AdminStatCard } from "@/screens/admin/AdminLayout";
import { mockAdminAuditLogs } from "@/lib/admin-mock-data";
import { adminAuditApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  ScrollText, Download, Search, Shield, User, Calendar,
  FileText, Vote, Users, Ban, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const actionConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  MEMBER_APPROVED: { label: "Member Approved", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  MEMBER_SUSPENDED: { label: "Member Suspended", icon: Ban, color: "text-destructive", bg: "bg-destructive/10" },
  MEETING_CREATED: { label: "Meeting Created", icon: Calendar, color: "text-royal", bg: "bg-royal/10" },
  ELECTION_CONFIGURED: { label: "Election Configured", icon: Vote, color: "text-gold", bg: "bg-gold/10" },
  FINANCIAL_REPORT_PUBLISHED: { label: "Report Published", icon: FileText, color: "text-chart-4", bg: "bg-chart-4/10" },
  DOCUMENT_UPLOADED: { label: "Document Uploaded", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  CONTENT_PUBLISHED: { label: "Content Published", icon: FileText, color: "text-royal", bg: "bg-royal/10" },
  ATTENDANCE_CLOSED: { label: "Attendance Closed", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
};

export function AdminAuditScreen() {
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("all");

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = mockAdminAuditLogs.filter((log) => {
    const matchSearch = !search ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    const matchFilter = actionFilter === "all" || log.action === actionFilter;
    return matchSearch && matchFilter;
  });

  const actions = [...new Set(mockAdminAuditLogs.map((l) => l.action))];

  return (
    <AdminLayout
      title="Audit Logs"
      subtitle="Track all administrative actions and system changes"
      actions={
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => adminAuditApi.export()}>
          <Download className="size-4 mr-1.5" />
          Export
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Total Log Entries" value={mockAdminAuditLogs.length} icon={ScrollText} color="text-royal" bg="bg-royal/10" />
        <AdminStatCard label="Member Actions" value={mockAdminAuditLogs.filter((l) => l.action.includes("MEMBER")).length} icon={Users} color="text-primary" bg="bg-primary/10" />
        <AdminStatCard label="Election Actions" value={mockAdminAuditLogs.filter((l) => l.action.includes("ELECTION")).length} icon={Vote} color="text-gold" bg="bg-gold/10" />
        <AdminStatCard label="Financial Actions" value={mockAdminAuditLogs.filter((l) => l.action.includes("FINANCIAL")).length} icon={FileText} color="text-success" bg="bg-success/10" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by actor, action, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card border-border"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-11 rounded-xl bg-card border border-border px-3 text-sm font-medium text-foreground cursor-pointer"
        >
          <option value="all">All Actions</option>
          {actions.map((action) => (
            <option key={action} value={action}>{actionConfig[action]?.label || action}</option>
          ))}
        </select>
      </div>

      {/* Log entries */}
      <div className="space-y-2">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <ScrollText className="size-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No log entries found</p>
          </div>
        ) : (
          filtered.map((log) => {
            const conf = actionConfig[log.action] || { label: log.action, icon: Shield, color: "text-muted-foreground", bg: "bg-muted" };
            const Icon = conf.icon;
            return (
              <AdminCard key={log.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", conf.bg)}>
                    <Icon className={cn("size-5", conf.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className={cn("text-xs mb-1", conf.bg, conf.color, "border-transparent")}>
                          {conf.label}
                        </Badge>
                        <p className="text-sm font-semibold text-foreground">{log.target}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(log.timestamp).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}{" "}
                        {new Date(log.timestamp).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="size-3" />
                        {log.actor}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="size-3" />
                        {log.actorRole}
                      </div>
                      <span className="font-mono">{log.ipAddress}</span>
                    </div>
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
