import React from "react";
import { useApp } from "@/lib/store";
import { authApi } from "@/lib/api";
import { mockMember } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Scale, Eye, EyeOff, Fingerprint, ChevronLeft, BarChart3, CalendarCheck, Vote, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type LoginMode = "email" | "phone" | "memberid";

export function LoginScreen() {
  const { dispatch } = useApp();
  const [mode, setMode] = React.useState<LoginMode>("email");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const placeholders: Record<LoginMode, string> = {
    email:    "adaeze@lawfirm.ng",
    phone:    "+234 803 456 7890",
    memberid: "NBA/ABJ/2019/1847",
  };

  const labels: Record<LoginMode, string> = {
    email:    "Email Address",
    phone:    "Phone Number",
    memberid: "Membership ID",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.login({ identifier: identifier || "demo", password: password || "demo" });
      dispatch({ type: "LOGIN", member: mockMember });
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    dispatch({ type: "LOGIN", member: mockMember });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">

      {/* ── Left — branding panel (desktop only) ── */}
      <div className="hidden lg:flex w-[480px] xl:w-[560px] shrink-0 gradient-navy flex-col justify-between px-16 xl:px-20 py-14 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-60px] w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[-60px] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl gradient-gold shadow-xl flex items-center justify-center shrink-0">
            <Scale className="size-5 text-[oklch(0.18_0.07_255)]" />
          </div>
          <div>
            <p className="text-base font-black text-white leading-none tracking-tight">NBA Bwari</p>
            <p className="text-white/40 text-xs mt-0.5 tracking-wide uppercase">Digital Portal</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-sm">
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-7">
            <Shield className="size-3 text-gold" />
            <span className="text-xs font-medium text-white/70">Secure Member Access</span>
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Welcome back to your portal.
          </h2>
          <p className="text-white/55 text-base leading-relaxed mb-10">
            Access your attendance records, vote in elections, manage dues, and download official documents.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: CalendarCheck, label: "Attendance" },
              { icon: Vote,          label: "Elections"  },
              { icon: BarChart3,     label: "Financials" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="glass rounded-2xl p-4 flex flex-col items-center gap-2.5 hover:bg-white/10 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center">
                  <Icon className="size-4 text-gold" />
                </div>
                <span className="text-xs font-semibold text-white text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/25 text-xs">© 2025 NBA Bwari Area Council Branch</p>
      </div>

      {/* ── Right — form ── */}
      <div className="flex-1 flex flex-col lg:overflow-y-auto">

        {/* Mobile header (gradient) */}
        <div className="gradient-navy px-6 pt-12 pb-10 relative overflow-hidden lg:hidden">
          <div className="absolute top-[-40px] right-[-30px] w-40 h-40 rounded-full bg-white/5" />
          <button
            onClick={() => dispatch({ type: "NAVIGATE", screen: "welcome" })}
            className="mb-6 flex items-center gap-1 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
              <Scale className="size-5 text-[oklch(0.18_0.07_255)]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Welcome Back</h1>
              <p className="text-white/60 text-xs">NBA Bwari Digital Portal</p>
            </div>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 px-6 py-8 -mt-5 bg-background rounded-t-3xl lg:mt-0 lg:rounded-none lg:flex lg:items-center lg:justify-center lg:px-0">
          <div className="w-full lg:max-w-md xl:max-w-lg lg:px-12 xl:px-16">

            {/* Desktop back + heading */}
            <div className="hidden lg:block mb-10">
              <button
                onClick={() => dispatch({ type: "NAVIGATE", screen: "welcome" })}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ChevronLeft className="size-4" />
                Back to Home
              </button>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Sign In</h1>
              <p className="text-muted-foreground text-sm mt-2">Enter your credentials to access the member portal</p>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
              {(["email", "phone", "memberid"] as LoginMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
                    mode === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "memberid" ? "Member ID" : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-semibold text-foreground">
                  {labels[mode]}
                </Label>
                <Input
                  id="identifier"
                  type={mode === "email" ? "email" : "text"}
                  placeholder={placeholders[mode]}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-12 rounded-xl border-border bg-muted/40 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-border bg-muted/40 text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs text-primary font-medium hover:underline">
                  Forgot Password?
                </button>
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold text-sm mt-2 gap-2"
              >
                {loading ? <Spinner className="size-4" /> : (
                  <>Sign In <ArrowRight className="size-4" /></>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Biometric & Demo */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl border-border gap-2 text-sm font-medium"
                type="button"
              >
                <Fingerprint className="size-4 text-primary" />
                Biometric
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-border gap-2 text-sm font-medium"
                type="button"
                onClick={handleDemoLogin}
              >
                <Scale className="size-4 text-gold" />
                Demo Login
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Not yet registered?{" "}
              <button
                onClick={() => dispatch({ type: "NAVIGATE", screen: "register" })}
                className="text-primary font-semibold hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
