import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Shield, Scale, Award, CalendarCheck, Vote, FileText, ArrowRight } from "lucide-react";

export function WelcomeScreen() {
  const { dispatch } = useApp();

  return (
    <div className="min-h-screen gradient-navy flex flex-col relative overflow-hidden lg:flex-row">
      {/* Background decorative circles */}
      <div className="absolute top-[-80px] right-[-60px] w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-[60px] right-[-100px] w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-[-40px] left-[-60px] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[30%] w-32 h-32 rounded-full bg-gold/5 pointer-events-none" />

      {/* ── Left panel — branding (desktop only) ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between px-16 xl:px-24 py-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-gold shadow-2xl flex items-center justify-center shrink-0">
            <Scale className="size-6 text-[oklch(0.18_0.07_255)]" />
          </div>
          <div>
            <p className="text-base font-black text-white leading-none tracking-tight">NBA Bwari</p>
            <p className="text-white/40 text-xs mt-0.5 tracking-wide uppercase">Digital Portal</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs font-medium text-white/70">Bwari Area Council Branch</span>
          </div>

          <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] mb-6">
            The modern way to manage your legal membership.
          </h2>
          <p className="text-white/55 text-lg xl:text-xl leading-relaxed mb-10">
            Track attendance, vote in elections, manage dues, download documents, and stay informed — all in one secure platform.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {[
              { icon: CalendarCheck, label: "Digital Attendance",  desc: "Track your meeting attendance" },
              { icon: Vote,          label: "Secure Elections",     desc: "Vote in branch elections"      },
              { icon: FileText,      label: "Document Access",      desc: "Download official documents"   },
              { icon: Shield,        label: "Good Standing",        desc: "Verify compliance status"      },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass rounded-2xl p-4 flex items-start gap-3 group hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="size-4 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                  <p className="text-[11px] text-white/45 mt-0.5 leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/25 text-xs">© 2025 NBA Bwari Area Council Branch</p>
      </div>

      {/* Vertical divider (desktop) */}
      <div className="hidden lg:block w-px bg-white/10 my-14 shrink-0" />

      {/* ── Right panel — CTAs ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-10 lg:pt-0 lg:px-16 xl:px-20 relative z-10">
        <div className="w-full max-w-sm lg:max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-3xl gradient-gold shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <Scale className="size-10 text-[oklch(0.18_0.07_255)] mx-auto mb-1" />
                  <div className="text-[oklch(0.18_0.07_255)] font-black text-xs leading-none">NBA</div>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Shield className="size-4 text-[oklch(0.18_0.07_255)]" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white text-center leading-tight mb-1">NBA Bwari</h1>
            <h2 className="text-lg font-semibold text-white/80 text-center mb-1">Digital Portal</h2>
            <p className="text-sm text-white/60 text-center">Bwari Area Council Branch</p>
          </div>

          {/* Mobile feature pills */}
          <div className="lg:hidden flex flex-wrap gap-2 justify-center mb-8">
            {["Attendance", "Elections", "Good Standing", "Documents"].map((feat) => (
              <span key={feat} className="px-3 py-1 rounded-full text-xs font-medium glass text-white/90">
                {feat}
              </span>
            ))}
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h3 className="text-2xl font-black text-white leading-tight">Welcome back.</h3>
            <p className="text-white/50 text-sm mt-1.5">Sign in to access your member portal</p>
          </div>

          {/* Award badge */}
          <div className="glass rounded-2xl p-4 flex items-center gap-3 mb-6 w-full border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
              <Award className="size-5 text-gold" />
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-semibold leading-none">Premium Member Platform</p>
              <p className="text-white/50 text-[11px] mt-1">Secure · Modern · Efficient</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" title="System online" />
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              className="w-full h-13 gradient-gold border-0 text-[oklch(0.18_0.07_255)] font-bold text-base rounded-2xl shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              onClick={() => dispatch({ type: "NAVIGATE", screen: "login" })}
            >
              Sign In to Portal
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full h-13 border-white/20 text-white bg-white/10 hover:bg-white/15 rounded-2xl font-semibold text-base backdrop-blur-sm"
              onClick={() => dispatch({ type: "NAVIGATE", screen: "register" })}
            >
              New Member Registration
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => dispatch({ type: "NAVIGATE", screen: "admin-login" })}
              className="text-white/35 text-xs hover:text-white/65 transition-colors underline-offset-2 hover:underline"
            >
              Admin Portal Login
            </button>
            <p className="text-white/25 text-xs lg:hidden">© 2025 NBA Bwari</p>
          </div>
        </div>
      </div>
    </div>
  );
}
