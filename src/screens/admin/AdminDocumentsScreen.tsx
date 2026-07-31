import React from "react";
import { AdminLayout, AdminCard, AdminStatCard } from "@/screens/admin/AdminLayout";
import { mockAdminDocuments } from "@/lib/admin-mock-data";
import { adminDocumentsApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FileText, Upload, Download, Trash2, Eye, Shield,
  FileSpreadsheet, Newspaper, Bell, Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const docIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  good_standing: { icon: Shield, color: "text-success", bg: "bg-success/10" },
  circular: { icon: Newspaper, color: "text-royal", bg: "bg-royal/10" },
  financial_report: { icon: FileSpreadsheet, color: "text-chart-4", bg: "bg-chart-4/10" },
  report: { icon: FileText, color: "text-muted-foreground", bg: "bg-muted" },
  election_notice: { icon: Bell, color: "text-gold", bg: "bg-gold/10" },
  certificate: { icon: Award, color: "text-primary", bg: "bg-primary/10" },
};

export function AdminDocumentsScreen() {
  const [loading, setLoading] = React.useState(true);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AdminLayout
      title="Documents Management"
      subtitle="Upload, manage, and distribute official branch documents"
      actions={
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl bg-primary text-primary-foreground">
              <Upload className="size-4 mr-1.5" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Document Title</label>
                <Input placeholder="NBA Circular No. 16/2025" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Document Type</label>
                <Input placeholder="circular, report, good_standing..." className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">File</label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="size-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Click or drag file here</p>
                  <p className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG, XLS (max 10MB)</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button className="bg-primary text-primary-foreground" onClick={() => setUploadOpen(false)}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Total Documents" value={mockAdminDocuments.length} icon={FileText} color="text-royal" bg="bg-royal/10" />
        <AdminStatCard label="Total Downloads" value={mockAdminDocuments.reduce((sum, d) => sum + d.downloads, 0)} icon={Download} color="text-success" bg="bg-success/10" />
        <AdminStatCard label="Good Standing Letters" value={mockAdminDocuments.filter((d) => d.type === "good_standing").length} icon={Shield} color="text-primary" bg="bg-primary/10" />
        <AdminStatCard label="Circulars" value={mockAdminDocuments.filter((d) => d.type === "circular").length} icon={Newspaper} color="text-gold" bg="bg-gold/10" />
      </div>

      {/* Documents table */}
      <AdminCard className="overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Document</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Size</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Issued</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Downloads</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Uploaded By</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockAdminDocuments.map((doc) => {
                    const { icon: Icon, color, bg } = docIcons[doc.type] || docIcons.report;
                    return (
                      <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
                              <Icon className={cn("size-4", color)} />
                            </div>
                            <span className="text-sm font-medium text-foreground">{doc.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{doc.type.replace(/_/g, " ")}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{doc.size}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(doc.issuedDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-foreground">{doc.downloads}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{doc.uploadedBy}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="rounded-lg h-8 w-8 p-0" onClick={() => adminDocumentsApi.download(doc.id)}>
                              <Download className="size-3.5 text-primary" />
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-lg h-8 w-8 p-0">
                              <Eye className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-lg h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => adminDocumentsApi.delete(doc.id)}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-border">
              {mockAdminDocuments.map((doc) => {
                const { icon: Icon, color, bg } = docIcons[doc.type] || docIcons.report;
                return (
                  <div key={doc.id} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                        <Icon className={cn("size-5", color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.size} · {doc.downloads} downloads</p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-13">
                      <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs" onClick={() => adminDocumentsApi.download(doc.id)}>
                        <Download className="size-3 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-lg h-8 text-xs text-destructive" onClick={() => adminDocumentsApi.delete(doc.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </AdminCard>
    </AdminLayout>
  );
}
