import React from "react";
import { AdminLayout, AdminCard, AdminStatCard } from "@/screens/admin/AdminLayout";
import { mockAdminContent } from "@/lib/admin-mock-data";
import { adminContentApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Newspaper, Plus, Eye, Trash2, FileEdit, Send,
  Megaphone, Calendar, FileText, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  branch_news: { label: "Branch News", icon: Newspaper, color: "text-royal", bg: "bg-royal/10" },
  announcement: { label: "Announcement", icon: Megaphone, color: "text-gold", bg: "bg-gold/10" },
  circular: { label: "Circular", icon: FileText, color: "text-primary", bg: "bg-primary/10" },
  report: { label: "Report", icon: FileEdit, color: "text-chart-4", bg: "bg-chart-4/10" },
  event: { label: "Event", icon: Calendar, color: "text-chart-5", bg: "bg-chart-5/10" },
  national_news: { label: "National", icon: Globe, color: "text-muted-foreground", bg: "bg-muted" },
};

export function AdminContentScreen() {
  const [loading, setLoading] = React.useState(true);
  const [addOpen, setAddOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("all");

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const filtered = activeTab === "all" ? mockAdminContent : mockAdminContent.filter((c) => c.category === activeTab);
  const published = mockAdminContent.filter((c) => c.status === "published");
  const drafts = mockAdminContent.filter((c) => c.status === "draft");

  return (
    <AdminLayout
      title="Content Management"
      subtitle="Publish news, circulars, announcements, and events"
      actions={
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl bg-primary text-primary-foreground">
              <Plus className="size-4 mr-1.5" />
              New Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Title</label>
                <Input placeholder="Article title..." className="h-10 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Category</label>
                  <Input placeholder="branch_news, announcement..." className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Status</label>
                  <Input defaultValue="draft" className="h-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Excerpt</label>
                <Input placeholder="Brief summary of the article..." className="h-10 rounded-xl" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button className="bg-primary text-primary-foreground" onClick={() => setAddOpen(false)}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard label="Total Articles" value={mockAdminContent.length} icon={Newspaper} color="text-royal" bg="bg-royal/10" />
        <AdminStatCard label="Published" value={published.length} icon={Send} color="text-success" bg="bg-success/10" />
        <AdminStatCard label="Drafts" value={drafts.length} icon={FileEdit} color="text-warning" bg="bg-warning/10" />
        <AdminStatCard label="Total Views" value={published.reduce((sum, c) => sum + c.views, 0)} icon={Eye} color="text-primary" bg="bg-primary/10" />
      </div>

      {/* Category tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto mb-4 h-auto flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="branch_news">Branch News</TabsTrigger>
          <TabsTrigger value="announcement">Announcements</TabsTrigger>
          <TabsTrigger value="circular">Circulars</TabsTrigger>
          <TabsTrigger value="event">Events</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => {
                const catConf = categoryConfig[item.category] || categoryConfig.branch_news;
                const Icon = catConf.icon;
                return (
                  <AdminCard key={item.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", catConf.bg)}>
                        <Icon className={cn("size-5", catConf.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-bold text-foreground leading-tight">{item.title}</h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs shrink-0",
                              item.status === "published" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            {item.status === "published" ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.excerpt}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(item.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span className="text-[11px] text-muted-foreground">·</span>
                          <span className="text-[11px] text-muted-foreground">{item.author}</span>
                          {item.status === "published" && (
                            <>
                              <span className="text-[11px] text-muted-foreground">·</span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                <Eye className="size-3" />
                                {item.views}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {item.status === "draft" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-lg text-success hover:bg-success/10 h-8 px-2"
                            onClick={() => adminContentApi.publish(item.id)}
                          >
                            <Send className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-lg text-muted-foreground hover:bg-accent h-8 px-2"
                            onClick={() => adminContentApi.unpublish(item.id)}
                          >
                            <FileEdit className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg text-destructive hover:bg-destructive/10 h-8 px-2"
                          onClick={() => adminContentApi.delete(item.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </AdminCard>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Newspaper className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">No content found</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
