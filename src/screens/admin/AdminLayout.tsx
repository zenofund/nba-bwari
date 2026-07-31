import React from "react";
import { useApp } from "@/lib/store";
import type { Screen } from "@/lib/store";
import { mockAdminUser } from "@/lib/admin-mock-data";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, CalendarCheck, BarChart3,
  Vote, Newspaper, FileText, ScrollText, Settings,
  LogOut, Scale, ChevronLeft, Bell, Search,
} from "lucide-react";

type NavItem = {
  screen: Screen;
  icon: React.ElementType;
  label: string;
  group: string;
};

const navItems: NavItem[] = [
  { screen: "admin-dashboard", icon: LayoutDashboard, label: "Dashboard", group: "Overview" },
  { screen: "admin-members", icon: Users, label: "Members", group: "Management" },
  { screen: "admin-attendance", icon: CalendarCheck, label: "Attendance", group: "Management" },
  { screen: "admin-financials", icon: BarChart3, label: "Financials", group: "Management" },
  { screen: "admin-elections", icon: Vote, label: "Elections", group: "Management" },
  { screen: "admin-content", icon: Newspaper, label: "Content", group: "Content" },
  { screen: "admin-documents", icon: FileText, label: "Documents", group: "Content" },
  { screen: "admin-audit", icon: ScrollText, label: "Audit Logs", group: "System" },
  { screen: "admin-settings", icon: Settings, label: "Settings", group: "System" },
];

export function AdminLayout({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const { state, dispatch } = useApp();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const groupedNav = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar text-sidebar-foreground flex-col transition-transform duration-300 lg:flex",
          sidebarOpen ? "flex translate-x-0" : "hidden -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-18 flex items-center gap-3 px-6 border-b border-sidebar-border shrink-0">
          <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center shrink-0">
            <Scale className="size-6 text-[oklch(0.18_0.07_255)]" />
          </div>
          <div>
            <p className="text-base font-black text-white leading-none">NBA Bwari</p>
            <p className="text-[11px] text-white/50 mt-1">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
          {Object.entries(groupedNav).map(([group, items]) => (
            <div key={group} className="mb-5">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider px-3 mb-2">{group}</p>
              {items.map(({ screen, icon: Icon, label }) => {
                const isActive = state.currentScreen === screen;
                return (
                  <button
                    key={screen}
                    onClick={() => {
                      dispatch({ type: "NAVIGATE", screen });
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1",
                      isActive
                        ? "bg-sidebar-accent text-white"
                        : "text-white/60 hover:text-white hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Icon className={cn("size-5 shrink-0", isActive && "text-gold")} />
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-sidebar-border p-4 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 mb-3">
            <div className="w-11 h-11 rounded-xl gradient-gold flex items-center justify-center shrink-0">
              <span className="text-base font-black text-[oklch(0.18_0.07_255)]">
                {mockAdminUser.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{mockAdminUser.name}</p>
              <p className="text-[11px] text-white/50 truncate">{mockAdminUser.roleLabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="size-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-accent"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-none">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <button className="p-2 rounded-lg hover:bg-accent transition-colors hidden sm:flex">
              <Search className="size-4 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
              <Bell className="size-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button
              onClick={() => dispatch({ type: "NAVIGATE", screen: "dashboard" })}
              className="p-2 rounded-lg hover:bg-accent transition-colors hidden sm:flex"
              title="View Member Portal"
            >
              <ChevronLeft className="size-4 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

// Reusable admin stat card
export function AdminStatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = "text-primary",
  bg = "bg-primary/10",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", bg)}>
          <Icon className={cn("size-5", color)} />
        </div>
        {trend && (
          <span className={cn("text-xs font-semibold", trendUp ? "text-success" : "text-destructive")}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// Reusable admin section card
export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-sm", className)}>
      {children}
    </div>
  );
}
