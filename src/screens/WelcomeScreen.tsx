import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Shield, Scale, Award, CalendarCheck, Vote, FileText } from "lucide-react";

export function WelcomeScreen() {
  const { dispatch } = useApp();

  return (
    <div className="min-h-screen gradient-navy flex flex-col relative overflow-hidden lg:flex-row lg:max-w-none">
      {/* Background decorative circles */}
      <div className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute top-[60px] right-[-100px] w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute bottom-[-40px] left-[-60px] w-72 h-72 rounded-full bg-white/5" />

      {/* Left side — branding (desktop only) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24 relative z-10">
        <div className="max-w-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-gold shadow-2xl flex items-center justify-center">
              <div className="text-center">
                <Scale className="size-8 text-[oklch(0.18_0.07_255)] mx-auto mb-0.5" />
                <div className="text-[oklch(0.18_0.07_255)] font-black text-xs leading-none">NBA</div>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">NBA Bwari</h1>
              <p className="text-white/60 text-sm">Digital Portal · Bwari Area Council Branch</p>
            </div>
          </div>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            The modern way to manage your legal membership.
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Track attendance, vote in elections, manage dues, download documents, and stay informed — all in one secure platform.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { icon: CalendarCheck, label: "Digital Attendance" },
              { icon: Vote, label: "Secure Elections" },
              { icon: FileText, label: "Document Access" },
              { icon: Shield, label: "Good Standing" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="glass rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                  <Icon className="size-5 text-gold" />
                </div>
                <span className="text-sm font-semibold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — CTAs (full width on mobile, constrained on desktop) */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8 lg:pt-8 lg:px-16 xl:px-24 relative z-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo (hidden on desktop) */}
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

          {/* Feature pills (mobile only) */}
          <div className="lg:hidden flex flex-wrap gap-2 justify-center mb-8">
            {["Attendance", "Elections", "Good Standing", "Documents"].map((feat) => (
              <span key={feat} className="px-3 py-1 rounded-full text-xs font-medium glass text-white/90">
                {feat}
              </span>
            ))}
          </div>

          {/* Award badge */}
          <div className="glass rounded-2xl p-4 flex items-center gap-3 mb-6 w-full">
            <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
              <Award className="size-5 text-gold" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Premium Member Platform</p>
              <p className="text-white/60 text-[11px]">Secure • Modern • Efficient</p>
            </div>
          </div>

          {/* CTA section */}
          <div className="space-y-3">
            <Button
              className="w-full h-13 gradient-gold border-0 text-[oklch(0.18_0.07_255)] font-bold text-base rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
              onClick={() => dispatch({ type: "NAVIGATE", screen: "login" })}
            >
              Sign In to Portal
            </Button>
            <Button
              variant="outline"
              className="w-full h-13 border-white/20 text-white bg-white/10 hover:bg-white/15 rounded-2xl font-semibold text-base backdrop-blur-sm"
              onClick={() => dispatch({ type: "NAVIGATE", screen: "register" })}
            >
              New Member Registration
            </Button>
            <button
              onClick={() => dispatch({ type: "NAVIGATE", screen: "admin-login" })}
              className="w-full text-center text-white/40 text-xs pt-1 hover:text-white/70 transition-colors underline-offset-2 hover:underline"
            >
              Admin Portal Login
            </button>
            <p className="text-center text-white/30 text-xs pt-2">
              © 2025 NBA Bwari Area Council Branch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
