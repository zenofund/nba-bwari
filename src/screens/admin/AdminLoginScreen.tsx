import React from "react";
import { useApp } from "@/lib/store";
import { adminAuthApi } from "@/lib/admin-api";
import { mockAdminUser } from "@/lib/admin-mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Scale, Eye, EyeOff, ShieldCheck, ChevronLeft, Lock } from "lucide-react";

export function AdminLoginScreen() {
  const { dispatch } = useApp();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminAuthApi.login({ email: email || "admin", password: password || "admin" });
      dispatch({ type: "ADMIN_LOGIN", member: mockAdminUser as any });
    } catch {
      setError("Invalid admin credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    dispatch({ type: "ADMIN_LOGIN", member: mockAdminUser as any });
  };

  return (
    <div className="min-h-screen gradient-navy flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-[-100px] right-[-80px] w-80 h-80 rounded-full bg-white/5" />
      <div className="absolute bottom-[-60px] left-[-80px] w-72 h-72 rounded-full bg-white/5" />

      <button
        onClick={() => dispatch({ type: "NAVIGATE", screen: "welcome" })}
        className="absolute top-6 left-6 flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm"
      >
        <ChevronLeft className="size-4" />
        Portal
      </button>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl gradient-gold shadow-2xl flex items-center justify-center mx-auto mb-4">
            <div className="text-center">
              <Scale className="size-8 text-[oklch(0.18_0.07_255)] mx-auto mb-0.5" />
              <div className="text-[oklch(0.18_0.07_255)] font-black text-[10px] leading-none">NBA</div>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Admin Portal</h1>
          <p className="text-white/50 text-sm">NBA Bwari Branch Administration</p>
        </div>

        {/* Admin badge */}
        <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5 text-gold" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">Restricted Access</p>
            <p className="text-white/50 text-[11px]">Authorized personnel only</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-sm font-semibold text-white/90">
              Admin Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@nbabwari.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-semibold text-white/90">
              Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/15 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl gradient-gold border-0 text-[oklch(0.18_0.07_255)] font-bold text-sm"
          >
            {loading ? <Spinner className="size-4" /> : (<><Lock className="size-4 mr-2" />Access Admin Panel</>)}
          </Button>
        </form>

        <Button
          variant="outline"
          className="w-full h-11 rounded-2xl border-white/20 text-white bg-white/10 hover:bg-white/15 mt-3 text-sm font-medium"
          onClick={handleDemoLogin}
        >
          Demo Admin Login
        </Button>

        <p className="text-center text-white/30 text-xs mt-6">
          © 2025 NBA Bwari Area Council Branch · Admin v1.0
        </p>
      </div>
    </div>
  );
}
