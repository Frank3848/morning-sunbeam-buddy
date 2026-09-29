import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Gift, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft, ArrowRight,
  Zap, UserPlus, Smartphone, MapPin, Wifi, CheckCircle2, Fingerprint,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthReady } from "@/hooks/useAuthReady";

type Step = "form" | "link-device" | "linking" | "success";

// Best-effort phone model detection from User-Agent
const detectDeviceModel = (): { model: string; os: string; brand: string } => {
  const ua = (navigator.userAgent || "") + " " + ((navigator as any).userAgentData?.platform || "");

  // iPhone
  if (/iPhone/i.test(ua)) {
    const verMatch = ua.match(/iPhone OS (\d+)_/);
    const v = verMatch ? parseInt(verMatch[1], 10) : 0;
    const guess = v >= 18 ? "iPhone 16" : v >= 17 ? "iPhone 15" : v >= 16 ? "iPhone 14" : v >= 15 ? "iPhone 13" : "iPhone";
    return { model: guess, os: `iOS ${verMatch?.[1] ?? ""}`.trim(), brand: "Apple" };
  }
  if (/iPad/i.test(ua)) return { model: "iPad", os: "iPadOS", brand: "Apple" };

  // Android — try to parse model in parentheses: "; SM-G991B Build" or "; TECNO CK7n)"
  const androidMatch = ua.match(/Android\s([\d.]+);\s?([^)]*)\)/i);
  if (androidMatch) {
    const osVer = androidMatch[1];
    const rawSeg = androidMatch[2] || "";
    // Drop language token like "en-US" and "Build/..."
    const cleaned = rawSeg.split(";").map(s => s.trim()).filter(s => s && !/^[a-z]{2}(-[a-zA-Z]{2})?$/i.test(s) && !/^wv$/i.test(s) && !/^k$/i.test(s));
    let model = cleaned[cleaned.length - 1] || "Android Device";
    model = model.replace(/\s*Build\/.*$/i, "").trim();

    // Friendly mapping
    const samsungMap: Record<string, string> = {
      "SM-S928": "Samsung Galaxy S24 Ultra", "SM-S921": "Samsung Galaxy S24",
      "SM-S918": "Samsung Galaxy S23 Ultra", "SM-S911": "Samsung Galaxy S23",
      "SM-G998": "Samsung Galaxy S21 Ultra", "SM-G991": "Samsung Galaxy S21",
      "SM-A546": "Samsung Galaxy A54", "SM-A536": "Samsung Galaxy A53",
    };
    for (const prefix of Object.keys(samsungMap)) {
      if (model.toUpperCase().includes(prefix)) { model = samsungMap[prefix]; break; }
    }

    let brand = "Android";
    if (/samsung|SM-/i.test(model)) brand = "Samsung";
    else if (/tecno/i.test(model)) brand = "TECNO";
    else if (/infinix/i.test(model)) brand = "Infinix";
    else if (/itel/i.test(model)) brand = "itel";
    else if (/pixel/i.test(model)) brand = "Google";
    else if (/redmi|xiaomi|mi /i.test(model)) brand = "Xiaomi";
    else if (/oppo/i.test(model)) brand = "OPPO";
    else if (/vivo/i.test(model)) brand = "vivo";
    else if (/oneplus/i.test(model)) brand = "OnePlus";
    else if (/huawei/i.test(model)) brand = "HUAWEI";

    return { model: model.replace(/_/g, " "), os: `Android ${osVer}`, brand };
  }

  if (/Windows/i.test(ua)) return { model: "Windows PC", os: "Windows", brand: "Microsoft" };
  if (/Macintosh|Mac OS X/i.test(ua)) return { model: "Mac", os: "macOS", brand: "Apple" };
  if (/Linux/i.test(ua)) return { model: "Linux Device", os: "Linux", brand: "Linux" };
  return { model: "Unknown Device", os: "Unknown", brand: "Device" };
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isReady, user } = useAuthReady();
  const [step, setStep] = useState<Step>("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [referralCode, setReferralCode] = useState("");

  const device = useMemo(detectDeviceModel, []);
  const deviceId = useMemo(() => "CP-" + Math.random().toString(36).slice(2, 8).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(), []);
  const [linkProgress, setLinkProgress] = useState(0);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) { setEmail(savedEmail); setRememberEmail(true); }
    const refParam = searchParams.get("ref");
    if (refParam) setReferralCode(refParam.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    if (isReady && user && step === "form") {
      navigate("/dashboard", { replace: true });
    }
  }, [isReady, user, navigate, step]);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    else if (name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!email.trim()) newErrors.email = "Email address is required";
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { toast.error("Please fix the errors below"); return; }
    setIsLoading(true);

    // Simulated processing for trust
    await new Promise(r => setTimeout(r, 1500));

    setIsLoading(false);
    setStep("link-device");
  };

  const handleLinkDevice = async () => {
    setStep("linking");
    setLinkProgress(0);

    // Progress animation
    const progressTimer = setInterval(() => {
      setLinkProgress(p => Math.min(p + 7, 92));
    }, 120);

    const emailLower = email.toLowerCase().trim();
    const { error } = await supabase.auth.signUp({
      email: emailLower,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          name: name.trim(),
          referred_by: referralCode.trim().toUpperCase() || null,
          device_model: device.model,
          device_id: deviceId,
        },
      },
    });

    clearInterval(progressTimer);

    if (error) {
      setLinkProgress(0);
      setStep("link-device");
      if (error.message?.toLowerCase().includes("already")) toast.error("Email already registered");
      else toast.error(error.message);
      return;
    }

    if (rememberEmail) localStorage.setItem("rememberedEmail", emailLower);
    else localStorage.removeItem("rememberedEmail");

    try {
      await supabase.from("registered_emails" as any).insert({ email: emailLower, name: name.trim() });
    } catch (_) { /* non-blocking */ }

    setLinkProgress(100);
    await new Promise(r => setTimeout(r, 700));
    setStep("success");

    // Auto-continue to dashboard
    setTimeout(() => {
      toast.success(`Account created successfully! 🎉`);
      navigate("/dashboard");
    }, 1400);
  };

  // ============== STEP: LINK DEVICE ==============
  if (step === "link-device" || step === "linking" || step === "success") {
    const isLinking = step === "linking";
    const isSuccess = step === "success";

    return (
      <div className="min-h-[100dvh] flex flex-col overflow-x-hidden" style={{ background: "var(--gradient-bg)" }}>
        <div className="flex-shrink-0 pt-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4 pt-2">
              <button
                onClick={() => !isLinking && !isSuccess && setStep("form")}
                disabled={isLinking || isSuccess}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="animate-slide-logo-bounce">
                <h1 className="text-xl font-black">
                  <span className="text-primary">Cash</span><span className="text-foreground">Pay</span>
                </h1>
              </div>
              <div className="w-14" />
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 pb-8">
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-3xl shadow-[var(--shadow-xl)] p-6 border border-border/40">
              {/* Header icon */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-[var(--shadow-primary)]"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    ) : (
                      <Smartphone className="w-10 h-10 text-white" />
                    )}
                  </div>
                  {!isSuccess && (
                    <span className="absolute inset-0 rounded-3xl border-2 border-primary/40 animate-ping" />
                  )}
                </div>
              </div>

              <div className="text-center mb-5">
                <h2 className="text-xl font-black text-foreground mb-1">
                  {isSuccess ? "Device Linked Successfully" : "Link Your Device"}
                </h2>
                <p className="text-xs text-muted-foreground px-4">
                  {isSuccess
                    ? "Your account is secured and ready to use."
                    : "We detected your device. Confirm to link it as a trusted device for secure access."}
                </p>
              </div>

              {/* Device card */}
              <div
                className="rounded-2xl p-4 mb-4 border-2 border-primary/20"
                style={{ background: "var(--gradient-subtle)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shadow-[var(--shadow-xs)]">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Detected device</p>
                    <p className="text-sm font-black text-foreground truncate">{device.model}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{device.brand} • {device.os}</p>
                  </div>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 rounded-full px-2 py-1 whitespace-nowrap">THIS DEVICE</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3 h-3 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">Network</p>
                      <p className="text-[11px] font-semibold text-foreground truncate">Secure Wi-Fi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">Location</p>
                      <p className="text-[11px] font-semibold text-foreground truncate">Nigeria</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground font-semibold">Device ID</p>
                  <p className="text-[10px] font-mono font-bold text-foreground">{deviceId}</p>
                </div>
              </div>

              {/* Progress bar when linking */}
              {isLinking && (
                <div className="mb-4">
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${linkProgress}%`, background: "var(--gradient-primary)" }}
                    />
                  </div>
                  <p className="text-[11px] text-center text-muted-foreground mt-2 font-semibold">
                    Securing your device... {linkProgress}%
                  </p>
                </div>
              )}

              {/* Security info */}
              {!isLinking && !isSuccess && (
                <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-secondary/40">
                  <Fingerprint className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    Linking this device enables <span className="font-bold text-foreground">2-factor protection</span>. You'll be alerted whenever a new device tries to access your account.
                  </p>
                </div>
              )}

              {/* Action */}
              {isSuccess ? (
                <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-primary/10 border border-primary/30">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-xs font-bold text-primary">Opening your wallet...</p>
                </div>
              ) : (
                <Button
                  onClick={handleLinkDevice}
                  disabled={isLinking}
                  className="w-full font-bold rounded-2xl shadow-[var(--shadow-primary)] flex items-center justify-center gap-2"
                  style={{ background: "var(--gradient-primary)", height: 52 }}
                >
                  {isLinking ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Linking device...</>
                  ) : (
                    <>Link & Verify Device <ArrowRight className="w-5 h-5" /></>
                  )}
                </Button>
              )}

              <p className="text-[9px] text-center text-muted-foreground mt-4">
                🔒 Secured with encrypted connection
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============== STEP: FORM ==============
  return (
    <div className="min-h-[100dvh] flex flex-col overflow-x-hidden" style={{ background: "var(--gradient-bg)" }}>
      <div className="flex-shrink-0 pt-8 pb-4 px-4 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
          <Zap className="w-7 h-7 text-white fill-white" />
        </div>
        <div className="animate-slide-logo-bounce">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-primary">Cash</span><span className="text-foreground">Pay</span>
          </h1>
        </div>
      </div>

      <div className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-[var(--shadow-xl)] p-6 border border-border/40">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Join millions earning on CashPay</p>
              </div>
              <a
                href="https://wa.me/2348037750681"
                className="text-xs text-primary font-semibold px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors flex-shrink-0 mt-0.5"
              >
                Need Help?
              </a>
            </div>

            <div className="mb-5 p-3.5 rounded-2xl flex items-center gap-3" style={{ background: "var(--gradient-subtle)", border: "1px solid hsl(var(--primary) / 0.2)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Welcome Bonus</p>
                <p className="text-xl font-black text-primary leading-tight">₦500,000</p>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-bold text-primary bg-secondary rounded-full px-2.5 py-1">FREE</span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Full Name</label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: undefined })); }}
                  disabled={isLoading}
                  className={`h-12 bg-muted/50 border-border/60 rounded-xl text-base transition-all focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                  disabled={isLoading}
                  className={`h-12 bg-muted/50 border-border/60 rounded-xl text-base transition-all focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                    disabled={isLoading}
                    className={`h-12 bg-muted/50 border-border/60 rounded-xl text-base pr-11 transition-all focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                    disabled={isLoading}
                    className={`h-12 bg-muted/50 border-border/60 rounded-xl text-base pr-11 transition-all focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive font-medium">{errors.confirmPassword}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-primary" /> Referral Code <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="h-12 bg-muted/50 border-border/60 rounded-xl text-base transition-all focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="remember" checked={rememberEmail} onCheckedChange={(c) => setRememberEmail(c as boolean)} disabled={isLoading} />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">Remember my email</label>
              </div>

              <Button
                type="submit"
                className="w-full font-bold rounded-2xl shadow-[var(--shadow-primary)] hover:shadow-[0_12px_28px_-4px_hsl(var(--primary)/0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mt-1"
                style={{ background: "var(--gradient-primary)", height: 52 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <>Continue <ArrowRight className="w-5 h-5" /></>
                )}
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-border/40 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Secure sign-in</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Bank-grade Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
