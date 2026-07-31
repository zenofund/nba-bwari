import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Scale, Info, Shield, CalendarCheck, Vote } from "lucide-react";

export function RegisterScreen() {
  const { dispatch } = useApp();

  return (
    <div className="min-h-screen bg-background flex lg:flex-row">
      {/* Left — branding (desktop only) */}
      <div className="hidden lg:flex flex-1 gradient-navy flex-col justify-center px-16 xl:px-24 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-60px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-40px] left-[-60px] w-72 h-72 rounded-full bg-white/5" />
        <div className="max-w-lg relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl gradient-gold shadow-xl flex items-center justify-center">
              <Scale className="size-7 text-[oklch(0.18_0.07_255)]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">NBA Bwari</h1>
              <p className="text-white/60 text-sm">Digital Portal</p>
            </div>
          </div>
          <h2 className="text-3xl font-black text-white leading-tight mb-4">Join the NBA Bwari digital community.</h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Register to access digital attendance, secure elections, financial management, and official branch documents.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: Shield, label: "Good Standing" },
              { icon: CalendarCheck, label: "Attendance" },
              { icon: Vote, label: "Elections" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="glass rounded-2xl p-4 flex flex-col items-center gap-2">
                <Icon className="size-6 text-gold" />
                <span className="text-xs font-semibold text-white text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full lg:max-w-lg lg:mx-auto lg:justify-center lg:px-8">
        {/* Mobile header */}
        <div className="gradient-navy px-6 pt-12 pb-10 relative overflow-hidden lg:hidden">
          <div className="absolute top-[-40px] right-[-30px] w-40 h-40 rounded-full bg-white/5" />
          <button
            onClick={() => dispatch({ type: "NAVIGATE", screen: "welcome" })}
            className="mb-6 flex items-center gap-1 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
              <Scale className="size-5 text-[oklch(0.18_0.07_255)]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">New Member</h1>
              <p className="text-white/60 text-xs">NBA Bwari Branch Registration</p>
            </div>
          </div>
        </div>

        {/* Desktop back button */}
        <button
          onClick={() => dispatch({ type: "NAVIGATE", screen: "welcome" })}
          className="hidden lg:flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mt-8 mb-4"
        >
          <ChevronLeft className="size-4" />
          <span className="text-sm">Back to Home</span>
        </button>

        <div className="flex-1 px-6 py-8 -mt-5 bg-background rounded-t-3xl lg:mt-0 lg:rounded-none lg:py-4">
          {/* Desktop heading */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-black text-foreground">New Member Registration</h1>
            <p className="text-muted-foreground text-sm mt-1">NBA Bwari Branch Registration</p>
          </div>

          {/* Notice */}
          <div className="flex gap-3 bg-primary/10 rounded-xl p-3 mb-6 border border-primary/20">
            <Info className="size-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground leading-relaxed">
              Physical registration must be completed at the{" "}
              <span className="font-semibold">NBA Bwari Branch Secretariat</span>. Submit this form to begin the process.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Full Name</Label>
              <Input placeholder="Barr. Full Name" className="h-12 rounded-xl bg-muted/40" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">NBA Number</Label>
                <Input placeholder="NBA/ABJ/XXXX/XXXX" className="h-12 rounded-xl bg-muted/40" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">SC Number</Label>
                <Input placeholder="SCN/XXXX/XXXX" className="h-12 rounded-xl bg-muted/40" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Email Address</Label>
              <Input type="email" placeholder="you@lawfirm.ng" className="h-12 rounded-xl bg-muted/40" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Phone Number</Label>
              <Input type="tel" placeholder="+234 800 000 0000" className="h-12 rounded-xl bg-muted/40" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Year Called to Bar</Label>
              <Input type="number" placeholder="e.g. 2015" className="h-12 rounded-xl bg-muted/40" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Residential Address</Label>
              <Input placeholder="No. XX, Street, Bwari, Abuja" className="h-12 rounded-xl bg-muted/40" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Password</Label>
                <Input type="password" placeholder="Create a strong password" className="h-12 rounded-xl bg-muted/40" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Confirm Password</Label>
                <Input type="password" placeholder="Repeat your password" className="h-12 rounded-xl bg-muted/40" />
              </div>
            </div>
          </div>

          <Button className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold text-sm mt-6">
            Submit Registration
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Already registered?{" "}
            <button
              onClick={() => dispatch({ type: "NAVIGATE", screen: "login" })}
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
