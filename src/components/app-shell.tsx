import React from "react";
import { Home, CalendarCheck, Vote, FileText, User, Bell, Scale, Newspaper, BarChart3, Shield, Search, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import type { Screen } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { mockMember } from "@/lib/mock-data";

// Full nav for desktop sidebar
const allNavItems: { screen: Screen; icon: React.ElementType; label: string; group: string }[] = [
  { screen: "dashboard",     icon: Home,         label: "Home",          group: "Overview"   },
  { screen: "attendance",    icon: CalendarCheck, label: "Attendance",    group: "Overview"   },
  { screen: "elections",     icon: Vote,         label: "Elections",     group: "Overview"   },
  { screen: "news",          icon: Newspaper,    label: "News & Updates",group: "Overview"   },
  { screen: "financials",    icon: BarChart3,    label: "Financials",    group: "Compliance" },
  { screen: "good-standing", icon: Shield,       label: "Good Standing", group: "Compliance" },
  { screen: "documents",     icon: FileText,     label: "Documents",     group: "Compliance" },
  { screen: "notifications", icon: Bell,         label: "Notifications", group: "Account"    },
  { screen: "profile",       icon: User,         label: "Profile",       group: "Account"    },
];

// Bottom nav (mobile only — 5 items)
const bottomNavItems: { screen: Screen; icon: React.ElementType; label: string }[] = [
  { screen: "dashboard",  icon: Home,         label: "Home"       },
  { screen: "attendance", icon: CalendarCheck, label: "Attendance" },
  { screen: "elections",  icon: Vote,         label: "Elections"  },
  { screen: "documents",  icon: FileText,     label: "Documents"  },
  { screen: "profile",    icon: User,         label: "Profile"    },
];

function DesktopSidebar() {
  const { state, dispatch } = useApp();
  const grouped = allNavItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof allNavItems>);

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Gold accent top bar */}
      <div className="h-0.5 gradient-gold shrink-0" />

      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center shrink-0 shadow-lg">
          <Scale className="size-4 text-[oklch(0.18_0.07_255)]" />
        </div>
        <div>
          <p className="text-sm font-black text-sidebar-foreground leading-none tracking-tight">NBA Bwari</p>
          <p className="text-[10px] text-sidebar-foreground/40 mt-0.5 tracking-wide uppercase">Digital Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <p className="text-[10px] font-bold text-sidebar-foreground/30 uppercase tracking-widest px-3 mb-2">{group}</p>
            <div className="space-y-0.5">
              {items.map(({ screen, icon: Icon, label }) => {
                const isActive = state.currentScreen === screen;
                return (
                  <button
                    key={screen}
                    onClick={() => dispatch({ type: "NAVIGATE", screen })}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-gold" />
                    )}
                    <Icon className={cn("size-4 shrink-0 transition-colors", isActive ? "text-gold" : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70")} />
                    <span className="flex-1 text-left">{label}</span>
                    {screen === "notifications" && state.unreadNotifications > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gold text-[oklch(0.18_0.07_255)] text-[10px] font-black">
                        {state.unreadNotifications}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-sidebar-border p-3 shrink-0 space-y-1">
        <button
          onClick={() => dispatch({ type: "NAVIGATE", screen: "profile" })}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
            state.currentScreen === "profile"
              ? "bg-sidebar-accent"
              : "hover:bg-sidebar-accent/40"
          )}
        >
          <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center shrink-0 shadow">
            <span className="text-xs font-black text-[oklch(0.18_0.07_255)]">{mockMember.firstName.charAt(0)}</span>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-semibold text-sidebar-foreground truncate leading-none">{mockMember.fullName}</p>
            <p className="text-[10px] text-sidebar-foreground/40 truncate mt-0.5">{mockMember.nbaNumber}</p>
          </div>
          <ChevronRight className="size-3 text-sidebar-foreground/30 shrink-0" />
        </button>
        <button
          onClick={() => dispatch({ type: "LOGOUT" })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="size-3.5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function BottomNav() {
  const { state, dispatch } = useApp();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center justify-around px-1 py-2 safe-area-pb">
        {bottomNavItems.map(({ screen, icon: Icon, label }) => {
          const isActive = state.currentScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => dispatch({ type: "NAVIGATE", screen })}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("p-1.5 rounded-xl transition-all duration-200", isActive && "bg-primary/10")}>
                <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              </div>
              <span className={cn("text-[10px] font-medium leading-none", isActive ? "text-primary" : "text-muted-foreground")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Desktop-only top header (replaces the mobile TopBar on large screens)
function DesktopHeader({
  title,
  showNotif = false,
  showBack = false,
  onBack,
  rightAction,
}: {
  title: string;
  showNotif?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}) {
  const { state, dispatch } = useApp();
  return (
    <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between bg-background/95 backdrop-blur-md border-b border-border px-8">
      {/* Left: Back button + Page title */}
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-accent transition-colors -ml-1 shrink-0"
          >
            <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-2">
        {/* Search bar */}
        <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-xl px-3 h-9 w-56 text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
          <Search className="size-3.5 shrink-0" />
          <span className="text-xs">Search…</span>
          <kbd className="ml-auto text-[10px] bg-background border border-border rounded px-1.5 py-0.5 font-mono hidden xl:block">⌘K</kbd>
        </div>

        {rightAction}

        {showNotif && (
          <button
            onClick={() => dispatch({ type: "NAVIGATE", screen: "notifications" })}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-accent transition-colors"
          >
            <Bell className="size-4 text-muted-foreground" />
            {state.unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{state.unreadNotifications}</span>
              </span>
            )}
          </button>
        )}

        {/* User avatar */}
        <button
          onClick={() => dispatch({ type: "NAVIGATE", screen: "profile" })}
          className="flex items-center gap-2.5 px-2.5 h-9 rounded-xl hover:bg-accent transition-colors"
        >
          <div className="w-7 h-7 rounded-lg gradient-gold flex items-center justify-center shadow">
            <span className="text-xs font-black text-[oklch(0.18_0.07_255)]">{mockMember.firstName.charAt(0)}</span>
          </div>
          <div className="text-left hidden xl:block">
            <p className="text-xs font-semibold text-foreground leading-none">{mockMember.firstName}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{mockMember.nbaNumber}</p>
          </div>
        </button>
      </div>
    </header>
  );
}

export function TopBar({
  title,
  showNotif = false,
  showBack = false,
  onBack,
  rightAction,
}: {
  title: string;
  showNotif?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}) {
  const { state, dispatch } = useApp();

  return (
    <>
      {/* Mobile-only top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-xl hover:bg-accent transition-colors">
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {!showBack && (
            <div className="w-7 h-7 gradient-navy rounded-md flex items-center justify-center">
              <span className="text-xs font-bold text-white">N</span>
            </div>
          )}
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          {showNotif && (
            <button
              onClick={() => dispatch({ type: "NAVIGATE", screen: "notifications" })}
              className="relative p-1.5 rounded-xl hover:bg-accent transition-colors"
            >
              <Bell className="size-5 text-muted-foreground" />
              {state.unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white">{state.unreadNotifications}</span>
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Desktop header */}
      <DesktopHeader title={title} showNotif={showNotif} showBack={showBack} onBack={onBack} rightAction={rightAction} />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col pb-[72px] lg:pb-0 lg:ml-64 min-w-0">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    "Active":        { label: "Active",       className: "bg-success/15 text-success border-success/30"         },
    "Inactive":      { label: "Inactive",     className: "bg-muted text-muted-foreground"                       },
    "Suspended":     { label: "Suspended",    className: "bg-destructive/15 text-destructive border-destructive/30" },
    "compliant":     { label: "Compliant",    className: "bg-success/15 text-success border-success/30"         },
    "non-compliant": { label: "Non-Compliant",className: "bg-destructive/15 text-destructive border-destructive/30" },
    "upcoming":      { label: "Upcoming",     className: "bg-royal/15 text-royal border-royal/30"               },
    "completed":     { label: "Completed",    className: "bg-muted text-muted-foreground"                       },
    "open":          { label: "Open",         className: "bg-success/15 text-success border-success/30"         },
    "paid":          { label: "Paid",         className: "bg-success/15 text-success border-success/30"         },
    "pending":       { label: "Pending",      className: "bg-warning/15 text-warning border-warning/30"         },
  };

  const variant = variants[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium border px-2 py-0.5", variant.className)}>
      {variant.label}
    </Badge>
  );
}
