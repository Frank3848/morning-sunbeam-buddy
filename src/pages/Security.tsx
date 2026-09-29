import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Eye, EyeOff, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Security = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) { navigate("/login"); return; }
    setUser(JSON.parse(currentUser));
  }, [navigate]);

  const getStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-destructive", "bg-amber-500", "bg-blue-500", "bg-emerald-500"][strength];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find((u: any) => u.email === user.email);

    if (!found || found.password !== currentPassword) {
      toast.error("Current password is incorrect");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const updatedUsers = users.map((u: any) =>
      u.email === user.email ? { ...u, password: newPassword } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
    toast.success("Password changed successfully!");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--gradient-bg)" }}>
      {/* Header */}
      <div className="relative overflow-hidden pb-4" style={{ background: "var(--gradient-card)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-15 blur-3xl bg-white" style={{ transform: "translate(30%, -30%)" }} />
        <div className="relative z-10 px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-base font-bold text-white">Security</h1>
            <div className="w-14" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-3">
        {/* Info card */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Keep your account safe</p>
            <p className="text-xs text-muted-foreground mt-0.5">Use a strong, unique password to protect your CashPay account and funds.</p>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-sm)] border border-border/40 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10">
                <Lock className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Change Password</p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 pb-4">
              {/* Current */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="pr-10 rounded-xl"
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="pr-10 rounded-xl"
                    required
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-muted'}`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Strength: <span className="font-semibold">{strengthLabel}</span></p>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pr-10 rounded-xl"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword === confirmPassword && (
                  <div className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Passwords match</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl font-bold"
                style={{ background: "var(--gradient-primary)" }}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        </div>

        {/* Security tips */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-xs)] border border-border/40 p-4 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Security Tips</p>
          {[
            "Use at least 8 characters",
            "Mix uppercase, numbers & symbols",
            "Never share your password",
            "Use a unique password for CashPay",
          ].map(tip => (
            <div key={tip} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Security;
