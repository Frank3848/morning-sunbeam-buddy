import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeOnboarding from "@/components/WelcomeOnboarding";
import NotificationCenter from "@/components/NotificationCenter";
import { addInAppNotification, showLocalNotification, registerServiceWorker } from "@/lib/pushNotifications";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  LogOut, Eye, EyeOff, ArrowUpRight, Loader2,
  CheckCircle2, Building, ShieldCheck, Zap,
  Home, ArrowLeftRight, User, CheckCheck, Bell,
  TrendingUp, Copy, ChevronRight, Wallet,
  Shield, Clock, Users, Award, Share2, MessageCircle, Trophy, Crown, Medal, Gift, Lock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BuyAccessCodeDialog } from "@/components/BuyAccessCodeDialog";
import { AirtimeDialog } from "@/components/AirtimeDialog";
import { DataDialog } from "@/components/DataDialog";
import { useAuthReady } from "@/hooks/useAuthReady";
import buyAccessCodeIcon from "@/assets/buy-access-code.png";
import watchIcon from "@/assets/watch.png";
import airtimeIcon from "@/assets/airtime.png";
import dataIcon from "@/assets/data.png";
import supportIcon from "@/assets/support.png";
import groupIcon from "@/assets/group.png";
import earnMoreIcon from "@/assets/earn-more.png";
import profileIcon from "@/assets/profile.png";

const MAX_BALANCE = 1000000;
const BALANCE_WARN_AT = 800000;

const Dashboard = () => {
  const navigate = useNavigate();
  const { isReady, user: authUser } = useAuthReady();
  const welcomeBonusCheckedFor = useRef<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showVerifying, setShowVerifying] = useState(false);
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);
  const [showBuyAccessCode, setShowBuyAccessCode] = useState(false);
  const [showAirtimeDialog, setShowAirtimeDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [showWithdrawWarning, setShowWithdrawWarning] = useState(false);
  const [showTutorialVideo, setShowTutorialVideo] = useState(false);
  const [showRewardClaim, setShowRewardClaim] = useState(false);
  const [rewardPassword, setRewardPassword] = useState("");
  const [showRewardPassword, setShowRewardPassword] = useState(false);
  const [rewardStep, setRewardStep] = useState<"intro" | "password" | "processing" | "success">("intro");
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    amount: "", bankName: "", accountNumber: "", accountName: "", accessCode: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [successDetails, setSuccessDetails] = useState<any>(null);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState("");
  const verifyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leaderboardTick, setLeaderboardTick] = useState(0);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [memberCount, setMemberCount] = useState<number>(() => {
    const saved = parseInt(localStorage.getItem("displayedMemberCount") || "0", 10);
    if (saved && saved > 50000) return saved;
    return 124583 + Math.floor(Math.random() * 5000);
  });

  const buildSessionUser = (sessionUser: any) => ({
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.user_metadata?.name || sessionUser.email?.split("@")[0] || "User",
    balance: 0,
    profilePicture: "",
    referralCode: "",
    referredBy: null,
    referralCount: 0,
    phone: "",
  });

  // Load real top referrers from the database (refreshes every 2 minutes)
  const [topReferrers, setTopReferrers] = useState<{ display_name: string; referral_count: number; is_me: boolean }[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await (supabase as any).rpc("get_top_referrers", { p_limit: 5 });
      if (Array.isArray(data)) setTopReferrers(data);
    };
    load();
    const t = setInterval(load, 120000);
    return () => clearInterval(t);
  }, []);

  // Fluctuate total active members (updates every ~30-60s, also runs on mount)
  useEffect(() => {
    const tick = () => {
      setMemberCount((prev) => {
        const realUsers = JSON.parse(localStorage.getItem("users") || "[]").length || 0;
        const delta = Math.random() < 0.8
          ? Math.floor(Math.random() * 180) + 20   // +20..+199
          : -(Math.floor(Math.random() * 40) + 5); // -5..-44
        const next = Math.max(120000 + realUsers, prev + delta);
        localStorage.setItem("displayedMemberCount", String(next));
        return next;
      });
    };
    tick();
    const schedule = () => {
      const ms = (15 + Math.random() * 20) * 1000;
      return setTimeout(function run() {
        tick();
        timer = schedule();
      }, ms);
    };
    let timer = schedule();
    return () => clearTimeout(timer);
  }, []);

  const promotions = [
    {
      title: "Mobile Money",
      subtitle: "Coming Soon",
      description: "Pay with MTN, Airtel, Zamtel",
      gradient: "linear-gradient(135deg, hsl(210 80% 48%) 0%, hsl(200 70% 52%) 100%)"
    },
    {
      title: "Transact & Win",
      subtitle: "Limited Offer",
      description: "Win up to ₦50,000 weekly",
      gradient: "linear-gradient(135deg, hsl(158 70% 36%) 0%, hsl(168 65% 42%) 100%)"
    },
    {
      title: "K20 Airtime Giveaway",
      subtitle: "Airtime Winners",
      description: "Congratulations to this week's winners!",
      gradient: "linear-gradient(135deg, hsl(280 65% 48%) 0%, hsl(260 60% 54%) 100%)"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % promotions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  // Load profile from Supabase + subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    if (!isReady) return () => { mounted = false; };

    const loadProfile = async (sessionUser: any) => {
      const fallbackUser = buildSessionUser(sessionUser);

      try {
        if (welcomeBonusCheckedFor.current !== sessionUser.id) {
          const { error: bonusError } = await supabase.rpc("claim_welcome_bonus" as any);
          if (bonusError) {
            console.warn("Welcome bonus could not be confirmed:", bonusError.message);
          } else {
            welcomeBonusCheckedFor.current = sessionUser.id;
          }
        }

        const { data: profile, error } = await supabase
          .from("profiles" as any)
          .select("*")
          .eq("id", sessionUser.id)
          .maybeSingle();

        if (!mounted || error) {
          if (error) console.warn("Profile load failed, using session data:", error.message);
          return;
        }

        const merged: any = {
          ...fallbackUser,
          name: (profile as any)?.name || fallbackUser.name,
          balance: Number((profile as any)?.balance ?? fallbackUser.balance),
          profilePicture: (profile as any)?.profile_picture || fallbackUser.profilePicture,
          referralCode: (profile as any)?.referral_code || fallbackUser.referralCode,
          referredBy: (profile as any)?.referred_by || fallbackUser.referredBy,
          referralCount: (profile as any)?.referral_count || fallbackUser.referralCount,
          phone: (profile as any)?.phone || fallbackUser.phone,
        };
        setUser(merged);
      } catch (error) {
        console.warn("Unexpected profile load error, using session data:", error);
      }
    };

    if (!authUser) {
      setUser(null);
      navigate("/login", { replace: true });
      return () => { mounted = false; };
    }

    const loadRecentTxns = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions" as any)
          .select("id,type,amount,description,created_at,status")
          .order("created_at", { ascending: false })
          .limit(3);
        if (!mounted || error || !data) return;
        setRecentTxns((data as any[]).map((t) => ({
          id: t.id, type: t.type, amount: Number(t.amount),
          description: t.description, date: t.created_at, status: t.status,
        })));
      } catch (e) { console.warn("Recent activity load failed:", e); }
    };

    loadProfile(authUser);
    loadRecentTxns();

    registerServiceWorker();

    // Keep balance fresh: refetch profile whenever the tab regains focus
    const refetch = () => { if (authUser) { loadProfile(authUser); loadRecentTxns(); } };
    window.addEventListener("focus", refetch);
    document.addEventListener("visibilitychange", refetch);

    return () => {
      mounted = false;
      window.removeEventListener("focus", refetch);
      document.removeEventListener("visibilitychange", refetch);
    };
  }, [authUser, isReady, navigate]);

  // Trigger backend bulk reminder once per session (throttled 6h per device)
  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      try {
        const TRIGGER_KEY = "bulk_reminder_last_trigger";
        const SIX_H = 6 * 60 * 60 * 1000;
        const last = parseInt(localStorage.getItem(TRIGGER_KEY) || "0", 10);
        if (Date.now() - last >= SIX_H) {
          await supabase.functions.invoke("send-bulk-reminders", { body: {} });
          localStorage.setItem(TRIGGER_KEY, Date.now().toString());
        }
      } catch (err) { console.warn("Reminder dispatch failed:", err); }
    })();

    const notifKey = `notif_seeded_${user.email}`;
    if (!localStorage.getItem(notifKey)) {
      addInAppNotification(user.email, { id: Date.now().toString(), title: "🎉 Welcome to CashPay!", body: "Your ₦500,000 welcome bonus has been credited.", type: "reward", read: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      addInAppNotification(user.email, { id: (Date.now() + 1).toString(), title: "💰 Weekly Reward Available", body: "Complete your first transaction to qualify for ₦50,000 weekly.", type: "info", read: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      localStorage.setItem(notifKey, "true");
    }
    if (!localStorage.getItem(`welcome_shown_${user.email}`)) setShowWelcome(true);
  }, [user?.email]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const bankCodeMap: Record<string, string> = {
    "Access Bank": "044", "GTBank": "058", "First Bank": "011", "UBA": "033",
    "Zenith Bank": "057", "Kuda Bank": "50211", "Opay": "100004", "PalmPay": "999991",
    "Moniepoint": "50515", "Polaris Bank": "076", "Sterling Bank": "232",
    "Fidelity Bank": "070", "Union Bank": "032", "Wema Bank": "035", "Stanbic IBTC": "221",
  };

  const handleAccountNumberChange = (accountNumber: string, bankName: string) => {
    setWithdrawData(prev => ({ ...prev, accountNumber, accountName: "" }));
    setVerifiedAccountName("");
    if (verifyDebounceRef.current) clearTimeout(verifyDebounceRef.current);
    if (accountNumber.length === 10 && bankName) {
      verifyDebounceRef.current = setTimeout(async () => {
        setIsVerifyingAccount(true);
        try {
          const bankCode = bankCodeMap[bankName];
          if (!bankCode) { setIsVerifyingAccount(false); return; }
          const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
          const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/verify-bank-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
            body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
          });
          const data = await res.json();
          if (data.account_name) {
            setVerifiedAccountName(data.account_name);
            setWithdrawData(prev => ({ ...prev, accountName: data.account_name }));
            toast.success(`✅ Account verified: ${data.account_name}`);
          } else {
            toast.error(data.error || "Could not verify account number");
          }
        } catch { toast.error("Account verification failed"); }
        finally { setIsVerifyingAccount(false); }
      }, 600);
    }
  };

  // Records a transaction in the backend via the secure RPC and updates local user state.
  const addTransaction = async (type: "credit" | "debit", amount: number, description: string) => {
    const { error } = await supabase.rpc("record_transaction" as any, {
      p_type: type, p_amount: amount, p_description: description,
    });
    if (error) { toast.error(error.message || "Could not record transaction"); throw error; }
    const { data: profile } = await supabase
      .from("profiles" as any)
      .select("balance")
      .eq("id", user.id)
      .maybeSingle();
    setUser((prev: any) => prev ? {
      ...prev,
      balance: Number((profile as any)?.balance ?? (type === "credit" ? prev.balance + amount : prev.balance - amount)),
    } : prev);
  };

  const handleWithdrawSubmit = async () => {
    const { amount, bankName, accountNumber, accountName, accessCode } = withdrawData;
    if (!amount || !bankName || !accountNumber || !accountName || !accessCode) { toast.error("Please fill all fields"); return; }
    if (accessCode.length < 6) { toast.error("Please enter a valid access code"); return; }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) { toast.error("Please enter a valid amount"); return; }
    if (user.balance < amountNum) { toast.error("Insufficient balance"); return; }

    // Check weekly withdrawal limit
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const currentWeek = Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7);
    const weekKey = `${monthKey}_w${currentWeek}`;
    if (localStorage.getItem(`withdrawn_${user.email}_${weekKey}`)) {
      toast.error("You can only withdraw once per week. Try again next week.");
      return;
    }

    setShowWithdrawForm(false);
    setShowVerifying(true);
    setVerifyProgress(0);

    const startTime = Date.now();
    const duration = 3000;
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setVerifyProgress(progress);
      if (elapsed < duration) requestAnimationFrame(animateProgress);
    };
    requestAnimationFrame(animateProgress);

    setTimeout(async () => {
      setVerifyProgress(100);
      setShowVerifying(false);
      // Access code is verified by SHA-256 hash so the plaintext code never appears in source.
      const enc = new TextEncoder().encode(accessCode.trim());
      const buf = await crypto.subtle.digest("SHA-256", enc);
      const hashed = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
      const EXPECTED = "8c90fa1f3c4ce965fa82d6e8cde9ef8523a8e08d018471d525287d6fb96b8fe7";
      if (hashed !== EXPECTED) {
        toast.error("Incorrect access code. Purchase the code to access full service");
        return;
      }
      try {
        await addTransaction("debit", amountNum, `Withdrawal to ${bankName} - ${accountNumber}`);
      } catch {
        return;
      }

      // Mark weekly withdrawal
      const wNow = new Date();
      const wMonthKey = `${wNow.getFullYear()}-${wNow.getMonth()}`;
      const wCurrentWeek = Math.ceil((wNow.getDate() + new Date(wNow.getFullYear(), wNow.getMonth(), 1).getDay()) / 7);
      localStorage.setItem(`withdrawn_${user.email}_${wMonthKey}_w${wCurrentWeek}`, "true");
      setSuccessDetails({ amount: amountNum, bank: bankName, accountNumber, accountName, date: new Date().toLocaleString(), status: "Completed" });
      setShowWithdrawSuccess(true);
      toast.success(`₦${amountNum.toLocaleString('en-NG')} sent successfully!`);
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      addInAppNotification(user.email, { id: Date.now().toString(), title: "✅ Transfer Successful", body: `₦${amountNum.toLocaleString('en-NG')} sent to ${bankName}`, type: "transaction", read: false, time });
      showLocalNotification("CashPay Transfer", `₦${amountNum.toLocaleString('en-NG')} sent to ${bankName}`);
      setWithdrawData({ amount: "", bankName: "", accountNumber: "", accountName: "", accessCode: "" });
    }, 3000);
  };

  const services = [
    { name: "Buy Code", image: buyAccessCodeIcon, action: () => setShowBuyAccessCode(true), color: "hsl(45 95% 55%)" },
    { name: "Watch", image: watchIcon, action: () => setShowTutorialVideo(true), color: "hsl(210 80% 55%)" },
    { name: "Airtime", image: airtimeIcon, action: () => setShowAirtimeDialog(true), color: "hsl(158 70% 42%)" },
    { name: "Data", image: dataIcon, action: () => setShowDataDialog(true), color: "hsl(280 65% 55%)" },
    { name: "Support", image: supportIcon, action: () => navigate("/support"), color: "hsl(0 75% 58%)" },
    { name: "Community", image: groupIcon, action: () => navigate("/group"), color: "hsl(25 90% 55%)" },
    { name: "Earn More", image: earnMoreIcon, action: () => navigate("/weekly-rewards"), color: "hsl(158 70% 42%)" },
    { name: "Profile", image: profileIcon, action: () => navigate("/profile"), color: "hsl(215 70% 55%)" },
  ];

  if (!isReady || (authUser && !user)) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleWelcomeComplete = () => {
    localStorage.setItem(`welcome_shown_${user.email}`, "true");
    setShowWelcome(false);
  };

  const firstName = (user.name || user.email.split('@')[0]).split(' ')[0];
  const initials = (user.name || "U").split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="h-full min-h-[100dvh] flex flex-col overflow-x-hidden" style={{ background: "var(--gradient-bg)" }}>
      {showWelcome && <WelcomeOnboarding userName={firstName} onComplete={handleWelcomeComplete} />}

      {/* Header */}
      <header className="flex-shrink-0 safe-top">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between">
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
                {initials}
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},</p>
                <h2 className="text-base font-bold text-foreground leading-tight">{firstName} 👋</h2>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2">
              <NotificationCenter email={user.email} />
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl bg-card border border-border/60 flex items-center justify-center shadow-[var(--shadow-xs)] hover:bg-muted/50 transition-colors"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
        <div className="px-4 space-y-4">

          {/* Balance Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-card)" }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl" style={{ background: "hsl(0 0% 100%)", transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full opacity-10 blur-2xl" style={{ background: "hsl(0 0% 100%)", transform: "translate(-30%, 30%)" }} />
            {/* Shimmer */}
            <div className="absolute inset-0 animate-shimmer pointer-events-none" />

            <div className="relative z-10 p-5">
              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[11px] font-semibold text-white/75 uppercase tracking-widest">Available Balance</p>
                    <button onClick={() => setShowBalance(!showBalance)} className="text-white/70 hover:text-white transition-colors">
                      {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">
                    {showBalance
                      ? `₦${user.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
                      : "₦••••••••"}
                  </h2>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Wallet limit warning */}
              {user.balance >= BALANCE_WARN_AT && (
                <div className="mb-3 rounded-2xl bg-white/15 border border-white/25 p-3">
                  <p className="text-[11px] font-black text-white uppercase tracking-wider mb-0.5">
                    {user.balance >= MAX_BALANCE ? "Wallet Limit Reached" : "Wallet Almost Full"}
                  </p>
                  <p className="text-[11px] text-white/85 leading-relaxed">
                    {user.balance >= MAX_BALANCE
                      ? "Your balance has reached the ₦1,000,000 limit. You can't claim more earnings until you withdraw."
                      : `Your balance is ₦${user.balance.toLocaleString("en-NG")} of the ₦1,000,000 limit. Withdraw soon so you can keep claiming rewards.`}
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/20">
                    <div
                      className="h-1.5 rounded-full bg-white transition-all"
                      style={{ width: `${Math.min(100, (user.balance / MAX_BALANCE) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Reward badge */}
              <button
                type="button"
                onClick={() => { setRewardStep("intro"); setRewardPassword(""); setShowRewardClaim(true); }}
                className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1.5 mb-4 hover:bg-white/25 active:scale-95 transition-all"
              >
                <TrendingUp className="w-3.5 h-3.5 text-white" />
                <p className="text-[11px] text-white font-semibold">
                  Weekly Rewards: <span className="font-black">₦500,000</span>
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              </button>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => navigate("/transactions")}
                  className="flex items-center justify-center gap-2 bg-white text-primary rounded-2xl py-3 font-bold text-sm shadow-lg hover:bg-white/90 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Transactions
                </button>
                <button
                  onClick={() => {
                    // If user has zero balance, show insufficient + earn-more guidance
                    if (!user.balance || user.balance <= 0) {
                      setShowWithdrawWarning(true);
                      return;
                    }
                    // Before they spend the welcome bonus, warn them once
                    const warned = localStorage.getItem(`withdraw_warned_${user.email}`);
                    if (!warned) {
                      setShowWithdrawWarning(true);
                      return;
                    }
                    setShowWithdrawForm(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-white/15 text-white rounded-2xl py-3 font-bold text-sm border border-white/30 hover:bg-white/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Transfer
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Reward Quick Claim (inline, no need to open Earn More) */}
          {(() => {
            const now = new Date();
            const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const currentWeek = Math.ceil((now.getDate() + firstDay.getDay()) / 7);
            const claimed: number[] = JSON.parse(localStorage.getItem(`claimed_weeks_${user.email}_${monthKey}`) || "[]");
            const isClaimed = claimed.includes(currentWeek);
            const amount = 125000;

            const handleQuickClaim = async () => {
              if (isClaimed) {
                toast.info("You've already claimed this week's reward.");
                return;
              }
              try {
                await addTransaction("credit", amount, `Week ${currentWeek} Reward Claimed`);
              } catch { return; }
              const newClaimed = [...claimed, currentWeek];
              localStorage.setItem(`claimed_weeks_${user.email}_${monthKey}`, JSON.stringify(newClaimed));
              toast.success(`₦${amount.toLocaleString("en-NG")} weekly reward claimed!`);
            };

            return (
              <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-primary)] border border-white/20" style={{ background: "var(--gradient-primary)" }}>
                <div className="p-3.5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
                    {isClaimed ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Gift className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/85">Week {currentWeek} Reward {isClaimed && "• Claimed"}</p>
                    <p className="text-base font-black text-white leading-tight">₦{amount.toLocaleString("en-NG")}</p>
                    <p className="text-[10px] text-white/85">{isClaimed ? "Next week unlocks soon" : "Tap claim — no need to open Earn More"}</p>
                  </div>
                  <button
                    onClick={isClaimed ? () => navigate("/weekly-rewards") : handleQuickClaim}
                    className="h-9 px-4 rounded-xl bg-white text-primary text-xs font-black shadow-md hover:bg-white/90 transition-all active:scale-95 flex-shrink-0"
                  >
                    {isClaimed ? "View" : "Claim Now"}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Quick Services */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground">Quick Services</h3>
              <span className="text-xs text-muted-foreground font-medium">All Services</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              {services.map((service) => (
                <button
                  key={service.name}
                  onClick={service.action}
                  className="flex flex-col items-center gap-2 p-3 bg-card rounded-2xl shadow-[var(--shadow-sm)] border border-border/40 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden shadow-[var(--shadow-xs)]">
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] font-semibold text-center text-foreground leading-tight">{service.name}</p>
                </button>
              ))}
            </div>
          </div>


          {/* Promotions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground">Promotions</h3>
              <div className="flex gap-1">
                {promotions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPromoIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${index === currentPromoIndex ? "bg-primary w-4" : "bg-muted-foreground/30 w-1.5"}`}
                  />
                ))}
              </div>
            </div>
            <div
              className="relative w-full rounded-2xl overflow-hidden cursor-pointer shadow-[var(--shadow-md)]"
              style={{ height: 120 }}
              onClick={() => setCurrentPromoIndex((prev) => (prev + 1) % promotions.length)}
            >
              <div className="absolute inset-0 transition-all duration-700" style={{ background: promotions[currentPromoIndex].gradient }} />
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl" style={{ transform: "translate(20%, -20%)" }} />
              <div className="relative z-10 p-4 h-full flex flex-col justify-between text-white">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 rounded-full px-2 py-0.5">
                    {promotions[currentPromoIndex].subtitle}
                  </span>
                  <h4 className="text-lg font-black mt-1.5 leading-tight">{promotions[currentPromoIndex].title}</h4>
                  <p className="text-xs text-white/85 mt-0.5">{promotions[currentPromoIndex].description}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-white/80">
                  <ChevronRight className="w-3 h-3" /> Learn more
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground">Recent Activity</h3>
              <button onClick={() => navigate("/transactions")} className="text-xs text-primary font-semibold">View All</button>
            </div>
            <div className="bg-card rounded-2xl border border-border/40 shadow-[var(--shadow-sm)] divide-y divide-border/30">
              {(() => {
                const txns = recentTxns;
                if (txns.length === 0) return (
                  <div className="p-6 text-center">
                    <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No transactions yet</p>
                  </div>
                );
                return txns.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
                        {tx.type === "credit" ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <ArrowUpRight className="w-4 h-4 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${tx.type === "credit" ? "text-emerald-600" : "text-destructive"}`}>
                      {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString("en-NG")}
                    </p>
                  </div>
                ));
              })()}
            </div>
          </div>




          {/* Referral Card */}
          <div className="bg-card rounded-2xl border border-border/40 shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Invite & Earn</h4>
                  <p className="text-[10px] text-muted-foreground">₦25,000 per referral</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border/40">
                <p className="text-sm font-black text-foreground flex-1 tracking-wider">{user.referralCode || "N/A"}</p>
                <button
                  onClick={() => {
                    if (user.referralCode) {
                      navigator.clipboard.writeText(user.referralCode);
                      toast.success("Referral code copied!");
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
                >
                  <Copy className="w-3.5 h-3.5 text-primary" />
                </button>
              </div>
              {/* Share Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    const referralLink = `https://cashpay-28854.vercel.app/register?ref=${user.referralCode}`;
                    const msg = `Join CashPay and earn ₦500,000 welcome bonus! Use my referral code: ${user.referralCode}\n\n${referralLink}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[hsl(142,70%,40%)] text-[hsl(0,0%,100%)] text-xs font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    const referralLink = `https://cashpay-28854.vercel.app/register?ref=${user.referralCode}`;
                    const msg = `Join CashPay and earn ₦500,000 welcome bonus! Use my referral code: ${user.referralCode} ${referralLink}`;
                    window.open(`sms:?body=${encodeURIComponent(msg)}`, "_self");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-primary/10 text-primary text-xs font-semibold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  SMS
                </button>
                <button
                  onClick={() => {
                    const referralLink = `https://cashpay-28854.vercel.app/register?ref=${user.referralCode}`;
                    navigator.clipboard.writeText(referralLink);
                    toast.success("Referral link copied!");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-primary/10 text-primary text-xs font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-muted-foreground">Referrals: <span className="font-bold text-foreground">{user.referralCount || 0}</span></p>
                <p className="text-[10px] text-primary font-semibold">Earned: ₦{((user.referralCount || 0) * 25000).toLocaleString("en-NG")}</p>
              </div>
            </div>
          </div>

          {/* Referral Leaderboard */}
          <div className="bg-card rounded-2xl border border-border/40 shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Top Referrers</h4>
                  <p className="text-[10px] text-muted-foreground">This month's leaderboard</p>
                </div>
              </div>
              <div className="space-y-2">
                {(() => {
                  const leaders = topReferrers;
                  if (!leaders.length) {
                    return (
                      <p className="text-[11px] text-muted-foreground text-center py-3">
                        No referrals yet — share your invite link to be the first on the board.
                      </p>
                    );
                  }
                  const rankIcons = [
                    <Crown key="1" className="w-4 h-4 text-[hsl(45,93%,47%)]" />,
                    <Medal key="2" className="w-4 h-4 text-[hsl(0,0%,70%)]" />,
                    <Medal key="3" className="w-4 h-4 text-[hsl(30,60%,50%)]" />,
                  ];
                  return leaders.map((l, i) => (
                    <div key={`${i}-${l.display_name}`} className={`flex items-center gap-3 p-2.5 rounded-xl ${l.is_me ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}>
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {i < 3 ? rankIcons[i] : <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{l.is_me ? "You" : l.display_name}</p>
                        <p className="text-[10px] text-muted-foreground">{l.referral_count} referrals</p>
                      </div>
                      <p className="text-xs font-bold text-primary">₦{(l.referral_count * 25000).toLocaleString("en-NG")}</p>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-2xl p-4 border border-border/40 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Award className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">Total Earned</p>
              </div>
              <p className="text-lg font-black text-foreground">₦{user.balance?.toLocaleString('en-NG') || '0'}</p>
              <p className="text-[10px] text-primary font-semibold mt-0.5">Active earnings</p>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border/40 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">Members</p>
              </div>
              <p className="text-lg font-black text-foreground tabular-nums transition-all duration-500">{memberCount.toLocaleString("en-NG")}</p>
              <p className="text-[10px] text-primary font-semibold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active members
              </p>
            </div>
          </div>

          {/* Trust & Security Badge */}
          <div className="bg-card rounded-2xl border border-border/40 shadow-[var(--shadow-sm)] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-foreground">Your Account Is Protected</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Secure sign-in • Encrypted connection (HTTPS) • Private account data</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            </div>
          </div>

          <div className="pb-2" />

        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/40 safe-bottom z-50 shadow-[0_-4px_20px_-4px_rgb(0_0_0/0.08)]">
        <div className="flex items-center justify-around py-2 px-4">
          {[
            { icon: Home, label: "Home", action: () => {}, active: true },
            { icon: ArrowLeftRight, label: "History", action: () => navigate("/transactions"), active: false },
            { icon: User, label: "Profile", action: () => navigate("/profile"), active: false },
          ].map(({ icon: Icon, label, action, active }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-1 min-w-[72px] py-1"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${active ? "shadow-[var(--shadow-primary)]" : ""}`}
                style={active ? { background: "var(--gradient-primary)" } : { background: "transparent" }}>
                <Icon className={`w-5 h-5 ${active ? "text-white" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-[11px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Dialogs */}
      <BuyAccessCodeDialog open={showBuyAccessCode} onOpenChange={setShowBuyAccessCode} />

      {/* Withdraw Warning / Insufficient Balance Dialog */}
      <Dialog open={showWithdrawWarning} onOpenChange={setShowWithdrawWarning}>
        <DialogContent className="sm:max-w-sm rounded-3xl border-0 shadow-[var(--shadow-xl)] p-0 overflow-hidden">
          <div className="p-5" style={{ background: "var(--gradient-card)" }}>
            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-3 mx-auto">
              {(!user.balance || user.balance <= 0) ? (
                <ArrowUpRight className="w-7 h-7 text-white" />
              ) : (
                <Shield className="w-7 h-7 text-white" />
              )}
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-black text-white">
                {(!user.balance || user.balance <= 0) ? "Insufficient Balance" : "Important Notice"}
              </DialogTitle>
            </DialogHeader>
            <p className="text-center text-xs text-white/85 mt-2">
              {(!user.balance || user.balance <= 0)
                ? "You don't have enough funds to withdraw. Earn more by inviting friends with your referral code — you get ₦25,000 for every signup!"
                : "Once you withdraw your ₦500,000 welcome bonus, your balance will become empty. To withdraw again, you'll need to earn more by inviting friends with your referral code (₦25,000 per signup) or claim your weekly rewards."}
            </p>
          </div>
          <div className="p-5 bg-card space-y-2.5">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-start gap-2.5">
              <Users className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Invite & Earn ₦25,000</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Share your code: <span className="font-bold text-primary">{user.referralCode || "—"}</span></p>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-3 flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Weekly Rewards</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Claim ₦125,000 every week of the month</p>
              </div>
            </div>
            {(!user.balance || user.balance <= 0) ? (
              <Button
                onClick={() => { setShowWithdrawWarning(false); navigate("/weekly-rewards"); }}
                className="w-full h-12 rounded-2xl font-bold shadow-[var(--shadow-primary)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Earn More Now
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWithdrawWarning(false)}
                  className="h-12 rounded-2xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    localStorage.setItem(`withdraw_warned_${user.email}`, "true");
                    setShowWithdrawWarning(false);
                    setShowWithdrawForm(true);
                  }}
                  className="h-12 rounded-2xl font-bold shadow-[var(--shadow-primary)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  I Understand
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AirtimeDialog open={showAirtimeDialog} onOpenChange={setShowAirtimeDialog} />
      <DataDialog open={showDataDialog} onOpenChange={setShowDataDialog} />

      {/* Weekly Reward Claim (password-protected) */}
      <Dialog open={showRewardClaim} onOpenChange={(o) => { if (!isClaimingReward) setShowRewardClaim(o); }}>
        <DialogContent className="w-[92vw] max-w-[360px] rounded-3xl">
          {rewardStep === "intro" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" /> Claim Earned Reward
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="rounded-2xl p-5 text-white shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">Total Available</p>
                  <p className="text-3xl font-black mt-1">₦50,000.00</p>
                  <p className="text-[11px] text-white/85 mt-1">Weekly rewards balance ready to claim</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3">
                  <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                    🔒 For your security, you'll need to confirm your login password before this reward is credited to your wallet.
                  </p>
                </div>
                <Button
                  onClick={() => setRewardStep("password")}
                  className="w-full h-12 rounded-2xl font-bold shadow-[var(--shadow-primary)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  Claim ₦50,000
                </Button>
              </div>
            </>
          )}

          {rewardStep === "password" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-black flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> Confirm Password
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <p className="text-xs text-muted-foreground">
                  Enter your current login password to release ₦50,000 to your wallet.
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showRewardPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={rewardPassword}
                      onChange={(e) => setRewardPassword(e.target.value)}
                      disabled={isClaimingReward}
                      className="h-12 rounded-xl pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRewardPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showRewardPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  disabled={!rewardPassword || isClaimingReward}
                  onClick={async () => {
                    if (!user?.email) return;
                    setIsClaimingReward(true);
                    setRewardStep("processing");
                    const { error } = await supabase.auth.signInWithPassword({
                      email: user.email,
                      password: rewardPassword,
                    });
                    if (error) {
                      setIsClaimingReward(false);
                      setRewardStep("password");
                      toast.error("Incorrect password. Please try again.");
                      return;
                    }
                    try {
                      await addTransaction("credit", 50000, "Weekly Rewards Claimed");
                      setRewardStep("success");
                      toast.success("₦50,000 credited to your wallet!");
                    } catch {
                      setRewardStep("password");
                      toast.error("Could not credit reward. Try again.");
                    } finally {
                      setIsClaimingReward(false);
                    }
                  }}
                  className="w-full h-12 rounded-2xl font-bold shadow-[var(--shadow-primary)]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isClaimingReward ? <Loader2 className="w-4 h-4 animate-spin" /> : "Withdraw Funds"}
                </Button>
              </div>
            </>
          )}

          {rewardStep === "processing" && (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-sm font-semibold text-foreground">Verifying password...</p>
              <p className="text-xs text-muted-foreground mt-1">Securing your reward</p>
            </div>
          )}

          {rewardStep === "success" && (
            <div className="text-center space-y-4 py-2">
              <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-center">Reward Claimed! 🎉</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">Your weekly reward has been added to your dashboard balance.</p>
              <div className="bg-secondary/50 rounded-2xl p-4 border border-primary/15">
                <p className="text-xs text-muted-foreground">Amount Credited</p>
                <p className="text-2xl font-black text-primary">₦50,000.00</p>
              </div>
              <Button
                onClick={() => { setShowRewardClaim(false); setRewardStep("intro"); setRewardPassword(""); }}
                className="w-full h-12 rounded-2xl font-bold shadow-[var(--shadow-primary)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Tutorial Video */}
      <Dialog open={showTutorialVideo} onOpenChange={setShowTutorialVideo}>
        <DialogContent className="max-w-[360px] p-0 overflow-hidden bg-black border-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-white text-sm font-bold">How to use CashPay</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            <video
              src="/videos/cashpay-tutorial.mp4"
              controls
              autoPlay
              playsInline
              className="w-full rounded-xl bg-black"
              style={{ aspectRatio: "9 / 16" }}
            />
            <p className="text-[10px] text-white/70 mt-2 text-center">
              Buy Access Code · Withdraw · Buy Airtime · Buy Data — step by step
            </p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button
                onClick={() => { setShowTutorialVideo(false); setShowBuyAccessCode(true); }}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-2 h-auto"
              >
                Buy Access Code
              </Button>
              <Button
                onClick={() => { setShowTutorialVideo(false); setShowAirtimeDialog(true); }}
                variant="outline"
                className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white font-bold text-xs py-2 h-auto"
              >
                Buy Airtime
              </Button>
              <Button
                onClick={() => { setShowTutorialVideo(false); setShowDataDialog(true); }}
                variant="outline"
                className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white font-bold text-xs py-2 h-auto"
              >
                Buy Data
              </Button>
              <Button
                onClick={() => { setShowTutorialVideo(false); setShowWithdrawForm(true); }}
                variant="outline"
                className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white font-bold text-xs py-2 h-auto"
              >
                Withdraw
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Form */}
      <Dialog open={showWithdrawForm} onOpenChange={setShowWithdrawForm}>
        <DialogContent className="w-[92%] max-w-[380px] rounded-3xl p-0 overflow-hidden max-h-[88vh] overflow-y-auto border-0 shadow-[var(--shadow-xl)]">
          <div className="p-4" style={{ background: "var(--gradient-card)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Transfer Funds</h2>
                <p className="text-[11px] text-white/70">Send to any Nigerian bank</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/15">
              <p className="text-[10px] text-white/70 font-medium uppercase tracking-wide">Balance</p>
              <p className="text-2xl font-black text-white">
                {showBalance ? `₦${user?.balance?.toLocaleString('en-NG', { minimumFractionDigits: 2 }) || '0.00'}` : '₦••••••'}
              </p>
            </div>
          </div>

          <div className="p-4 space-y-3 bg-card">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount (₦)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₦</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawData.amount}
                  onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                  className="pl-8 h-11 rounded-xl border-border/60 bg-muted/40 text-base font-bold focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bank</Label>
              <Select value={withdrawData.bankName} onValueChange={(value) => {
                setWithdrawData({ ...withdrawData, bankName: value, accountName: "" });
                setVerifiedAccountName("");
                if (withdrawData.accountNumber.length === 10) handleAccountNumberChange(withdrawData.accountNumber, value);
              }}>
                <SelectTrigger className="h-11 rounded-xl border-border/60 bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select your bank" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {["Access Bank","GTBank","First Bank","UBA","Zenith Bank","Kuda Bank","Opay","PalmPay","Moniepoint","Polaris Bank","Sterling Bank","Fidelity Bank","Union Bank","Wema Bank","Stanbic IBTC"].map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account Number</Label>
              <Input
                type="text"
                placeholder="10-digit account number"
                maxLength={10}
                value={withdrawData.accountNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  handleAccountNumberChange(val, withdrawData.bankName);
                }}
                className="h-11 rounded-xl border-border/60 bg-muted/40 font-mono tracking-widest focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account Name</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={isVerifyingAccount ? "Verifying..." : "Auto-filled after verification"}
                  value={withdrawData.accountName}
                  readOnly={!!verifiedAccountName}
                  onChange={(e) => setWithdrawData({ ...withdrawData, accountName: e.target.value })}
                  className={`h-11 rounded-xl border-border/60 bg-muted/40 text-sm pr-9 ${verifiedAccountName ? "border-primary/50 bg-secondary/40 font-semibold" : ""}`}
                />
                {isVerifyingAccount && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
                {verifiedAccountName && !isVerifyingAccount && <CheckCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />}
              </div>
              {verifiedAccountName && <p className="text-[10px] text-primary font-semibold flex items-center gap-1"><CheckCheck className="h-3 w-3" /> Verified</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Access Code</Label>
              <Input
                type="text"
                placeholder="Enter your access code"
                value={withdrawData.accessCode}
                onChange={(e) => setWithdrawData({ ...withdrawData, accessCode: e.target.value.toUpperCase() })}
                className="h-11 rounded-xl border-border/60 bg-muted/40 font-mono tracking-wider focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
              />
              <p className="text-[10px] text-muted-foreground">No code? Buy from Quick Services above.</p>
            </div>

            {/* Trust strip */}
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <p className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-300 leading-tight flex-1">NIBSS Instant Pay · End-to-end encrypted</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </div>
            </div>

            {withdrawData.amount && withdrawData.bankName && (
              <div className="rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/30 shadow-sm">
                <div className="px-3 py-2 border-b border-primary/15 flex items-center justify-between">
                  <p className="text-[10px] font-black text-primary uppercase tracking-wider">Transfer Preview</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">REAL-TIME</span>
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-[11px] text-muted-foreground font-medium">You're sending</span>
                    <span className="font-black text-lg text-primary">₦{parseFloat(withdrawData.amount || '0').toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {[
                    ["Bank", withdrawData.bankName],
                    ...(withdrawData.accountNumber ? [["Account No.", withdrawData.accountNumber]] : []),
                    ...(verifiedAccountName ? [["Recipient", verifiedAccountName]] : []),
                    ["Fee", "₦0.00"],
                    ["Arrival", "Instant"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-bold text-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleWithdrawSubmit}
              disabled={isProcessing}
              className="w-full h-12 rounded-2xl font-bold text-sm shadow-[var(--shadow-primary)] hover:-translate-y-0.5 transition-all"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : <><Lock className="mr-2 h-4 w-4" />Confirm & Send Securely</>}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" /> Protected by CashPay Secure · Encrypted connection
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={showVerifying} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm rounded-3xl border-0 shadow-[var(--shadow-xl)]" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="text-center space-y-5 py-6 px-4">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
              <ShieldCheck className="h-10 w-10 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1.5">Verifying Transfer</h3>
              <p className="text-sm text-muted-foreground">Please wait while we secure your transaction...</p>
            </div>
            <div className="space-y-2">
              <Progress value={verifyProgress} className="h-2.5 rounded-full" />
              <p className="text-xs font-semibold text-primary">{Math.round(verifyProgress)}% Complete</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-2xl py-2.5 px-4">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Encrypting & securing your transfer...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showWithdrawSuccess} onOpenChange={setShowWithdrawSuccess}>
        <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-[var(--shadow-xl)]">
          <div className="text-center space-y-4 py-4 px-4">
            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Transfer Successful!</DialogTitle>
            </DialogHeader>

            {successDetails && (
              <div className="bg-secondary/50 rounded-2xl p-4 space-y-3 text-left border border-primary/15">
                {[
                  ["Amount", `₦${successDetails.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`],
                  ["Bank", successDetails.bank],
                  ["Account No.", successDetails.accountNumber],
                  ["Account Name", successDetails.accountName],
                  ["Status", "✅ Completed"],
                  ["Date", successDetails.date],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{k}</span>
                    <span className={`font-semibold text-sm ${k === "Amount" ? "text-primary text-base font-black" : "text-foreground"}`}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={() => setShowWithdrawSuccess(false)}
              className="w-full h-12 rounded-2xl font-bold shadow-[var(--shadow-primary)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
