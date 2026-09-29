import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft, Gift, CheckCircle2, Lock, TrendingUp,
  Calendar, Wallet, Star, Zap, Crown, Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { syncCurrentUserFromSession } from "@/lib/authBridge";

const MAX_BALANCE = 1000000;
const BALANCE_WARN_AT = 800000;

const WEEKLY_PACKAGES = [
  {
    week: 1,
    title: "Week 1 Reward",
    amount: 125000,
    icon: Gift,
    gradient: "linear-gradient(135deg, hsl(158 70% 36%) 0%, hsl(168 65% 42%) 100%)",
    perks: ["₦125,000 Earnings", "First week bonus"],
  },
  {
    week: 2,
    title: "Week 2 Reward",
    amount: 125000,
    icon: Star,
    gradient: "linear-gradient(135deg, hsl(210 80% 48%) 0%, hsl(200 70% 52%) 100%)",
    perks: ["₦125,000 Earnings", "Consistency bonus"],
  },
  {
    week: 3,
    title: "Week 3 Reward",
    amount: 125000,
    icon: Zap,
    gradient: "linear-gradient(135deg, hsl(280 65% 48%) 0%, hsl(260 60% 54%) 100%)",
    perks: ["₦125,000 Earnings", "Loyalty reward"],
  },
  {
    week: 4,
    title: "Week 4 Reward",
    amount: 125000,
    icon: Crown,
    gradient: "linear-gradient(135deg, hsl(25 90% 50%) 0%, hsl(35 85% 55%) 100%)",
    perks: ["₦125,000 Earnings", "Monthly completion bonus"],
  },
];

function getCurrentWeekOfMonth() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  return Math.ceil((now.getDate() + firstDay.getDay()) / 7);
}

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}`;
}

function getNextWeekStartDate(targetWeek: number) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  // Calculate the start date of the target week
  const dayOffset = (targetWeek - 1) * 7 - firstDay.getDay() + 1;
  const targetDate = new Date(now.getFullYear(), now.getMonth(), dayOffset);
  if (targetDate < now) return null;
  const diff = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

const WeeklyRewards = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [claimedWeeks, setClaimedWeeks] = useState<number[]>([]);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);
  const [withdrawnThisWeek, setWithdrawnThisWeek] = useState(false);
  const currentWeek = getCurrentWeekOfMonth();
  const monthKey = getMonthKey();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const sUser = sess.session?.user;
      if (!sUser) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles" as any).select("*").eq("id", sUser.id).maybeSingle();
      if (!mounted) return;

      const userData = {
        id: sUser.id,
        email: sUser.email,
        name: (profile as any)?.name || sUser.email?.split("@")[0] || "User",
        balance: Number((profile as any)?.balance ?? 0),
      };
      setUser(userData);

      // Claimed weeks (keyed by user id for stability across sessions)
      const claimed = JSON.parse(
        localStorage.getItem(`claimed_weeks_${sUser.id}_${monthKey}`) ||
        localStorage.getItem(`claimed_weeks_${sUser.email}_${monthKey}`) || "[]"
      );
      setClaimedWeeks(claimed);

      const weekKey = `${monthKey}_w${currentWeek}`;
      const hasWithdrawn = localStorage.getItem(`withdrawn_${sUser.id}_${weekKey}`) ||
        localStorage.getItem(`withdrawn_${sUser.email}_${weekKey}`);
      setWithdrawnThisWeek(!!hasWithdrawn);
    })();
    return () => { mounted = false; };
  }, [navigate, monthKey, currentWeek]);

  const handleClaim = async (week: number, amount: number) => {
    if (!user) return;
    if (claimedWeeks.includes(week)) {
      toast.error("You've already claimed this week's reward!");
      return;
    }
    if (week !== currentWeek) {
      toast.error(
        week > currentWeek
          ? "This reward is not available yet — claim it when that week arrives."
          : "That week has passed. Only the current week's reward can be claimed."
      );
      return;
    }
    if (Number(user.balance || 0) + amount > MAX_BALANCE) {
      toast.error("Wallet limit reached: balance cannot exceed ₦1,000,000. Please withdraw first.");
      return;
    }

    // Credit balance via backend RPC (single source of truth)
    const { data, error } = await supabase.rpc("record_transaction" as any, {
      p_type: "credit",
      p_amount: amount,
      p_description: `Week ${week} Reward Claimed`,
    });
    if (error) {
      toast.error(error.message || "Could not claim reward. Please try again.");
      return;
    }

    // Refresh balance from profiles
    const { data: profile } = await supabase
      .from("profiles" as any).select("balance").eq("id", user.id).maybeSingle();
    const newBalance = Number((profile as any)?.balance ?? (user.balance + amount));
    setUser({ ...user, balance: newBalance });

    // Keep legacy currentUser in sync so dashboard mirrors the update
    await syncCurrentUserFromSession();

    // Mark week as claimed (both id + email keys for backward compatibility)
    const newClaimed = [...claimedWeeks, week];
    setClaimedWeeks(newClaimed);
    localStorage.setItem(`claimed_weeks_${user.id}_${monthKey}`, JSON.stringify(newClaimed));
    if (user.email) {
      localStorage.setItem(`claimed_weeks_${user.email}_${monthKey}`, JSON.stringify(newClaimed));
    }

    setClaimedAmount(amount);
    setShowClaimSuccess(true);
    toast.success(`₦${amount.toLocaleString("en-NG")} reward credited to your wallet!`);
  };


  const totalClaimed = claimedWeeks.reduce((sum, w) => {
    const pkg = WEEKLY_PACKAGES.find((p) => p.week === w);
    return sum + (pkg?.amount || 0);
  }, 0);

  if (!user) return null;

  return (
    <div className="h-full min-h-[100dvh] flex flex-col" style={{ background: "var(--gradient-bg)" }}>
      {/* Header */}
      <header className="flex-shrink-0 safe-top">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="w-9 h-9 rounded-xl bg-card border border-border/60 flex items-center justify-center shadow-[var(--shadow-xs)]">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Weekly Rewards</h1>
              <p className="text-[11px] text-muted-foreground">Earn 4 times per month</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
        <div className="px-4 space-y-4">

          {/* Summary Card */}
          <div className="rounded-3xl overflow-hidden shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-card)" }}>
            <div className="relative p-5">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-3xl" style={{ background: "hsl(0 0% 100%)" }} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-white/75" />
                  <p className="text-[11px] font-semibold text-white/75 uppercase tracking-widest">
                    Month Progress
                  </p>
                </div>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-2xl font-black text-white">₦{totalClaimed.toLocaleString("en-NG")}</p>
                    <p className="text-xs text-white/70">of ₦500,000 monthly</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">{claimedWeeks.length}/4</p>
                    <p className="text-xs text-white/70">Weeks Claimed</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-white transition-all duration-500"
                    style={{ width: `${(claimedWeeks.length / 4) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  {[1, 2, 3, 4].map((w) => (
                    <span key={w} className={`text-[10px] font-semibold ${claimedWeeks.includes(w) ? "text-white" : "text-white/50"}`}>
                      W{w} {claimedWeeks.includes(w) && "✓"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal notice */}
          {withdrawnThisWeek && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-xs text-destructive font-semibold">You've already withdrawn this week. Next withdrawal available next week.</p>
            </div>
          )}

          {/* Wallet limit notice */}
          {Number(user.balance || 0) >= BALANCE_WARN_AT && (
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 flex items-start gap-2">
              <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                {Number(user.balance) >= MAX_BALANCE
                  ? "Wallet limit reached (₦1,000,000). Withdraw funds before claiming another reward."
                  : `Your balance is ₦${Number(user.balance).toLocaleString("en-NG")} of the ₦1,000,000 limit. Withdraw soon to keep claiming.`}
              </p>
            </div>
          )}


          {/* Weekly Packages */}
          <div>
            <h3 className="text-base font-bold text-foreground mb-3">Weekly Packages</h3>
            <div className="space-y-3">
              {WEEKLY_PACKAGES.map((pkg) => {
                const isClaimed = claimedWeeks.includes(pkg.week);
                const isAvailable = pkg.week === currentWeek && !isClaimed;
                const isLocked = pkg.week !== currentWeek && !isClaimed;
                const IconComp = pkg.icon;

                return (
                  <div
                    key={pkg.week}
                    className={`rounded-2xl border overflow-hidden transition-all ${
                      isClaimed
                        ? "border-primary/30 bg-primary/5"
                        : isAvailable
                        ? "border-border/60 bg-card shadow-[var(--shadow-sm)]"
                        : "border-border/30 bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: isClaimed ? "hsl(var(--primary) / 0.15)" : pkg.gradient }}
                        >
                          {isClaimed ? (
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                          ) : isLocked ? (
                            <Lock className="w-5 h-5 text-white/70" />
                          ) : (
                            <IconComp className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground">{pkg.title}</h4>
                            {isClaimed && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary rounded-full px-2 py-0.5">
                                Claimed
                              </span>
                            )}
                            {isLocked && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                                Locked
                              </span>
                            )}
                            {isAvailable && !isClaimed && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/15 text-primary rounded-full px-2 py-0.5">
                                Available
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-black text-foreground">₦{pkg.amount.toLocaleString("en-NG")}</p>
                          <div className="flex gap-2 mt-1">
                            {pkg.perks.map((perk) => (
                              <span key={perk} className="text-[10px] text-muted-foreground font-medium">• {perk}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {isAvailable && (
                        <Button
                          onClick={() => handleClaim(pkg.week, pkg.amount)}
                          className="w-full mt-3 h-11 rounded-2xl font-bold text-sm shadow-[var(--shadow-primary)]"
                          style={{ background: pkg.gradient }}
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          Claim ₦{pkg.amount.toLocaleString("en-NG")}
                        </Button>
                      )}

                      {isClaimed && (
                        <div className="mt-3 bg-primary/10 rounded-xl p-2.5 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <p className="text-xs text-primary font-semibold">Reward credited to your wallet</p>
                        </div>
                      )}

                      {isLocked && (() => {
                        const daysUntil = getNextWeekStartDate(pkg.week);
                        return (
                          <div className="mt-3 bg-muted/50 rounded-xl p-2.5 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-xs text-muted-foreground font-semibold">
                              {daysUntil && daysUntil > 0 ? `Activates in ${daysUntil} day${daysUntil > 1 ? 's' : ''}` : "Activates soon"}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-card rounded-2xl border border-border/40 p-4 space-y-2">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              How It Works
            </h4>
            <ul className="space-y-1.5">
              {[
                "Earn ₦125,000 every week (₦500,000/month)",
                "Claim each weekly reward once — no repeats",
                "Rewards unlock as each week arrives",
                "Withdraw once per week after claiming",
              ].map((item) => (
                <li key={item} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Claim Success Dialog */}
      <Dialog open={showClaimSuccess} onOpenChange={setShowClaimSuccess}>
        <DialogContent className="sm:max-w-sm rounded-3xl border-0 shadow-[var(--shadow-xl)]">
          <div className="text-center space-y-4 py-4 px-4">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Reward Claimed! 🎉</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">Your weekly reward has been credited to your wallet.</p>
            <div className="bg-secondary/50 rounded-2xl p-4 border border-primary/15">
              <p className="text-sm text-muted-foreground">Amount Credited</p>
              <p className="text-2xl font-black text-primary">₦{claimedAmount.toLocaleString("en-NG")}</p>
            </div>
            <Button
              onClick={() => setShowClaimSuccess(false)}
              className="w-full h-12 rounded-2xl font-bold shadow-[var(--shadow-primary)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyRewards;
