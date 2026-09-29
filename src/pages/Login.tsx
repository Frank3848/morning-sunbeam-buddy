import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthReady } from "@/hooks/useAuthReady";

const Login = () => {
  const navigate = useNavigate();
  const { isReady, user } = useAuthReady();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedLoginEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (isReady && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isReady, user, navigate]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = "Email address is required";
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      setIsLoading(false);
      toast.error(error.message || "Invalid email or password");
      return;
    }

    if (rememberMe) localStorage.setItem("rememberedLoginEmail", email.toLowerCase());
    else localStorage.removeItem("rememberedLoginEmail");

    setIsLoading(false);
    toast.success("Welcome back! 🎉");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col overflow-x-hidden" style={{ background: "var(--gradient-bg)" }}>

      {/* Top brand section */}
      <div className="flex-shrink-0 pt-10 pb-6 px-6 flex flex-col items-center">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
          <Zap className="w-8 h-8 text-white fill-white" />
        </div>
        <div className="animate-slide-logo-bounce">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-primary">Cash</span><span className="text-foreground">Pay</span>
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">Nigerian Smart Online Earnings</p>
      </div>

      {/* Card */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-[var(--shadow-xl)] p-6 border border-border/40">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-bold text-foreground">Sign In</h2>
                <a
                  href="https://wa.me/2348037750681"
                  className="text-xs text-primary font-semibold px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Need Help?
                </a>
              </div>
              <p className="text-sm text-muted-foreground">Enter your credentials to access your wallet</p>
            </div>

            {/* Features strip */}
            <div className="flex gap-2 mb-6">
              {["Secure", "Fast", "Reliable"].map((f) => (
                <div key={f} className="flex items-center gap-1 bg-secondary/60 rounded-full px-2.5 py-1">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-semibold text-primary">{f}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Email Address</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(p => ({ ...p, email: undefined }));
                  }}
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(p => ({ ...p, password: undefined }));
                    }}
                    disabled={isLoading}
                    className={`h-12 bg-muted/50 border-border/60 rounded-xl text-base pr-11 transition-all focus:bg-card focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(c) => setRememberMe(c as boolean)}
                    disabled={isLoading}
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">Remember me</label>
                </div>
                <a href="#" className="text-sm text-primary font-semibold hover:underline">Forgot PIN?</a>
              </div>

              <Button
                type="submit"
                className="w-full h-13 font-bold text-base rounded-2xl mt-2 shadow-[var(--shadow-primary)] hover:shadow-[0_12px_28px_-4px_hsl(var(--primary)/0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-primary)", height: "52px" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="w-5 h-5" /></>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/40 text-center">
              <p className="text-sm text-muted-foreground">
                New to CashPay?{" "}
                <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link>
              </p>
            </div>
          </div>

          {/* Trust badges */}
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

export default Login;
