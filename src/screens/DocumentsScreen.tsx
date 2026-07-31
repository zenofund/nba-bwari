import React from "react";
import { AppShell, TopBar } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { mockDocuments } from "@/lib/mock-data";
import { documentsApi } from "@/lib/api";
import {
  FileText, Download, Search, Shield,
  FileSpreadsheet, Newspaper, Bell, Award, Filter
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

const filterCategories = [
  { id: "all", label: "All Documents" },
  { id: "good_standing", label: "Good Standing" },
  { id: "circular", label: "Circulars" },
  { id: "financial_report", label: "Financial Reports" },
  { id: "report", label: "Reports" },
  { id: "election_notice", label: "Election Notices" },
  { id: "certificate", label: "Certificates" },
];

export function DocumentsScreen() {
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [downloading, setDownloading] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const filtered = mockDocuments.filter((doc) => {
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "all" || doc.type === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleDownload = async (docId: string) => {
    setDownloading(docId);
    try { await documentsApi.downloadDocument(docId); } finally { setDownloading(null); }
  };

  if (loading) {
    return (
      <AppShell>
        <TopBar title="Documents" showNotif />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar title="Documents" showNotif />
      <div className="p-4 lg:p-8 space-y-6 pb-8">

        {/* ── Good Standing banner ────────────────────────────────── */}
        <div className="gradient-navy rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-48 h-48 rounded-full bg-white/5" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center shrink-0">
                <Shield className="size-7 text-[oklch(0.18_0.07_255)]" />
              </div>
              <div>
                <p className="text-white/60 text-xs mb-0.5">Letter of Good Standing</p>
                <h2 className="text-xl font-black text-white mb-1">You are in Good Standing</h2>
                <p className="text-white/60 text-sm">Valid: Jan – Dec 2025</p>
              </div>
            </div>
            <Button className="gradient-gold border-0 text-[oklch(0.18_0.07_255)] font-bold rounded-xl h-11 gap-2 self-start lg:self-auto">
              <Download className="size-4" />Download Letter
            </Button>
          </div>
        </div>

        {/* ── 2-column layout: filter sidebar + doc grid ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* LEFT — search + filter sidebar */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-muted/40 border-border"
              />
            </div>

            {/* Desktop filter list */}
            <Card className="rounded-2xl border-border hidden lg:block">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 px-2 py-2 mb-1 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  <Filter className="size-3" />Categories
                </div>
                {filterCategories.map((cat) => {
                  const count = cat.id === "all" ? mockDocuments.length : mockDocuments.filter(d => d.type === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveFilter(cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        activeFilter === cat.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      {cat.label}
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-md",
                        activeFilter === cat.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      )}>{count}</span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Mobile filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:hidden">
              {filterCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    activeFilter === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — document grid */}
          <div className="lg:col-span-3">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="size-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-base text-muted-foreground font-medium">No documents found</p>
                <p className="text-sm text-muted-foreground">Try a different search term or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((doc) => {
                  const { icon: Icon, color, bg } = docIcons[doc.type] || docIcons.report;
                  return (
                    <Card key={doc.id} className="rounded-2xl border-border hover:shadow-md transition-shadow group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", bg)}>
                            <Icon className={cn("size-6", color)} />
                          </div>
                          <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-medium text-muted-foreground">{doc.format}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground leading-tight mb-2 line-clamp-2">{doc.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span>{new Date(doc.issuedDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span>·</span>
                          <span>{doc.size}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-9 rounded-xl gap-2 text-xs font-medium"
                          onClick={() => handleDownload(doc.id)}
                          disabled={downloading === doc.id}
                        >
                          {downloading === doc.id
                            ? <><div className="size-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />Downloading...</>
                            : <><Download className="size-3.5" />Download</>}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
