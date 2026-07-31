import React from "react";
import { useApp } from "@/lib/store";
import { AppShell, TopBar } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { mockNewsItems } from "@/lib/mock-data";
import { Search, Calendar, Clock, Megaphone, Vote, Newspaper, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type NewsCategory = typeof mockNewsItems[0]["category"];

const categoryConfig: Record<NewsCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  branch_news: { label: "Branch", icon: Newspaper, color: "text-royal", bg: "bg-royal/10" },
  announcement: { label: "Notice", icon: Megaphone, color: "text-gold", bg: "bg-gold/10" },
  election: { label: "Election", icon: Vote, color: "text-primary", bg: "bg-primary/10" },
  national_news: { label: "National", icon: Globe, color: "text-chart-4", bg: "bg-chart-4/10" },
};

export function NewsScreen() {
  useApp();
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<string>("All");

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const filtered = mockNewsItems.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || item.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const featured = filtered.find((n) => n.featured);
  const rest = filtered.filter((n) => !n.featured);

  if (loading) {
    return (
      <AppShell>
        <TopBar title="News & Updates" showNotif />
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar title="News & Updates" showNotif />
      <div className="p-4 lg:p-8 space-y-6 pb-8">

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search news and announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-muted/40 border-border"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["All", "branch_news", "announcement", "election", "national_news"].map((filter) => {
            const conf = filter !== "All" ? categoryConfig[filter as NewsCategory] : null;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all",
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                )}
              >
                {conf ? conf.label : "All"}
              </button>
            );
          })}
        </div>

        {/* Featured article — desktop: full-width banner */}
        {featured && (
          <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="gradient-navy h-48 lg:h-full relative flex items-end p-6">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="relative z-10">
                  <span className="text-xs font-bold bg-gold text-[oklch(0.18_0.07_255)] px-3 py-1 rounded-full">
                    Featured
                  </span>
                </div>
              </div>
              <CardContent className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  {(() => {
                    const conf = categoryConfig[featured.category];
                    const Icon = conf.icon;
                    return (
                      <>
                        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", conf.bg)}>
                          <Icon className={cn("size-3.5", conf.color)} />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{conf.label}</span>
                      </>
                    );
                  })()}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 leading-tight">{featured.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{featured.excerpt}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(featured.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{featured.readTime}</span>
                  </div>
                  <button className="text-xs text-primary font-semibold hover:underline ml-auto">Read More</button>
                </div>
              </CardContent>
            </div>
          </Card>
        )}

        {/* News grid — 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rest.map((item) => {
            const conf = categoryConfig[item.category];
            const Icon = conf.icon;
            return (
              <Card key={item.id} className="rounded-2xl border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", conf.bg)}>
                      <Icon className={cn("size-5", conf.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-[10px] font-bold", conf.color)}>{conf.label}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">{item.title}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{item.excerpt}</p>
                  <button className="text-xs text-primary font-semibold hover:underline">Read More</button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Newspaper className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-base text-muted-foreground font-medium">No articles found</p>
            <p className="text-sm text-muted-foreground">Try a different search or filter</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
