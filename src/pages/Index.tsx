import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Gift, TrendingUp, Users, Star, CheckCircle2, Lock } from "lucide-react";
import cashpayLogo from "@/assets/cashpay-logo.jpg";
import { useAuthReady } from "@/hooks/useAuthReady";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { isReady, user } = useAuthReady();

  useEffect(() => {
    if (isReady && user) navigate("/dashboard", { replace: true });
  }, [isReady, user, navigate]);

  useEffect(() => {
    if (window.location.pathname === "/index") {
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const openAuthPage = async (path: "/login" | "/register") => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.warn("Could not clear local session before opening auth page:", error);
    }
    navigate(path);
  };

  if (!isReady) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col overflow-x-hidden" style={{ background: "var(--gradient-bg)" }}>
      {/* Top Bar */}
      <header className="safe-top px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={cashpayLogo} alt="CashPay" className="h-8 w-8 rounded-xl object-cover shadow-[var(--shadow-sm)]" />
          <span className="text-base font-black text-foreground tracking-tight">CashPay</span>
        </div>
        <button
          onClick={() => openAuthPage("/login")}
          className="text-xs font-bold text-primary px-3 py-1.5 rounded-full bg-primary/10 active:scale-95 transition"
        >
          Sign In
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Hero */}
        <section className="relative mt-4 rounded-3xl overflow-hidden p-6 shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-card)" }}>
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full opacity-25 blur-3xl bg-white" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-15 blur-2xl bg-white" />
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-white/20 border border-white/25 rounded-full px-3 py-1 text-white">
              <Star className="w-3 h-3 fill-white" /> Nigerian Smart Online Earnings
            </span>
            <h1 className="text-3xl font-black text-white leading-tight mt-3">
              Send, Earn & Win<br />with CashPay.
            </h1>
            <p className="text-sm text-white/85 mt-2 leading-relaxed">
              Get a ₦500,000 welcome bonus, weekly cash rewards, and bank-level security — all in one place.
            </p>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex -space-x-2">
                {["A","C","I","F"].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-white/25 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                    {c}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-white/85 font-semibold">
                124,000+ active Nigerians
              </p>
            </div>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="mt-5 grid grid-cols-2 gap-3">
          {[
            { icon: Gift, title: "₦500K Bonus", desc: "Instant welcome credit", color: "hsl(158 70% 38%)" },
            { icon: TrendingUp, title: "Weekly Rewards", desc: "Up to ₦125K every week", color: "hsl(210 80% 50%)" },
            { icon: Zap, title: "Instant Transfers", desc: "To any Nigerian bank", color: "hsl(280 65% 55%)" },
            { icon: ShieldCheck, title: "Secure Account", desc: "Encrypted connection", color: "hsl(45 95% 50%)" },
          ].map((f) => (
            <div key={f.title} className="bg-card border border-border/40 rounded-2xl p-3.5 shadow-[var(--shadow-xs)]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${f.color}1A` }}>
                <f.icon className="w-4 h-4" style={{ color: f.color }} />
              </div>
              <p className="text-xs font-black text-foreground leading-tight">{f.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Trust strip */}
        <section className="mt-5 bg-card border border-border/40 rounded-2xl p-4 shadow-[var(--shadow-xs)]">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-primary" />
            <p className="text-xs font-black text-foreground">Why Nigerians trust CashPay</p>
          </div>
          <ul className="space-y-2">
            {[
              "Verified secure platform with 24/7 monitoring",
              "Instant payouts to all Nigerian banks",
              "Earn from referrals, airtime & data discounts",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-foreground leading-snug">{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Social proof */}
        <section className="mt-5 flex items-center justify-between bg-card border border-border/40 rounded-2xl p-3.5 shadow-[var(--shadow-xs)]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <p className="text-[11px] font-semibold text-foreground">Trusted by</p>
          </div>
          <p className="text-sm font-black text-primary">124,583+ users</p>
        </section>
      </main>

      {/* Sticky CTA */}
      <div className="safe-bottom px-5 pb-5 pt-3 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={() => openAuthPage("/register")}
          className="w-full h-14 rounded-2xl text-white font-black text-base shadow-[var(--shadow-primary)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{ background: "var(--gradient-primary)" }}
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-center text-[11px] text-muted-foreground mt-3">
          Already have an account?{" "}
          <button onClick={() => openAuthPage("/login")} className="text-primary font-bold">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Index;
