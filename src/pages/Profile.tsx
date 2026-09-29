import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Calendar, Camera, ChevronRight, Shield, HelpCircle, LogOut, Settings, Bell, CreditCard, Wallet, Zap, Pencil, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) { navigate("/login"); return; }
    const userData = JSON.parse(currentUser);
    setUser(userData);
    setProfilePicture(userData.profilePicture || "");
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image size must be less than 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePicture(base64String);
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.map((u: any) => u.email === user.email ? { ...u, profilePicture: base64String } : u);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      const updatedUser = { ...user, profilePicture: base64String };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      toast.success("Profile photo updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (!user) return null;

  const initials = (user.name || "U").split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const menuItems = [
    {
      icon: CreditCard,
      label: "Transaction History",
      description: "View all your transactions",
      action: () => navigate("/transactions"),
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage your alerts & notifications",
      action: () => navigate("/notifications"),
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      icon: Shield,
      label: "Security",
      description: "Password & account protection",
      action: () => navigate("/security"),
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "App preferences & account settings",
      action: () => navigate("/settings"),
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help from our team",
      action: () => navigate("/support"),
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--gradient-bg)" }}>
      {/* Hero Header */}
      <div className="relative overflow-hidden pb-6" style={{ background: "var(--gradient-card)" }}>
        {/* Blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-15 blur-3xl bg-white" style={{ transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full opacity-10 blur-2xl bg-white" style={{ transform: "translate(-30%, 30%)" }} />

        <div className="relative z-10 px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-base font-bold text-white">My Profile</h1>
            <div className="w-14" />
          </div>
        </div>
      </div>

      {/* Profile Card — below header, no overlap */}
      <div className="px-4 pt-4 pb-6 space-y-3">
        {/* Main profile card */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-xl)] border border-border/40 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-20 h-20 border-4 border-card shadow-[var(--shadow-lg)]">
                  <AvatarImage src={profilePicture} alt={user.name} />
                  <AvatarFallback className="text-2xl font-black text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center shadow-[var(--shadow-md)] border-2 border-card"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-foreground truncate">{user.name}</h2>
                  <button
                    onClick={() => navigate("/edit-profile")}
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 hover:bg-primary/20 transition-colors"
                  >
                    <Pencil className="w-3 h-3 text-primary" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
                  </span>
                </div>
                {/* Verified badge */}
                <div className="inline-flex items-center gap-1 bg-primary/10 rounded-full px-2.5 py-1 mt-2">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-bold text-primary">Verified Account</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance strip */}
          <div className="mx-4 mb-4 p-4 rounded-2xl flex items-center justify-between" style={{ background: "var(--gradient-subtle)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Available Balance</p>
                <p className="text-xl font-black text-primary leading-tight">
                  ₦{user.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="rounded-xl text-xs font-bold shadow-[var(--shadow-primary)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Wallet
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-sm)] border border-border/40 overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Account</p>
          </div>
          {menuItems.map((item, index) => (
            <div key={item.label}>
              <button
                onClick={item.action}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-muted/30 transition-colors text-left active:bg-muted/50"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              </button>
              {index < menuItems.length - 1 && <Separator className="mx-4 opacity-50" />}
            </div>
          ))}
        </div>

        {/* App Info */}
        <div className="bg-card rounded-3xl p-4 border border-border/40 shadow-[var(--shadow-xs)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[var(--shadow-primary)]" style={{ background: "var(--gradient-primary)" }}>
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-foreground"><span className="text-primary">Cash</span>Pay</p>
            <p className="text-[10px] text-muted-foreground">Version 1.0.0 · Nigerian Smart Online Earnings</p>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-sm)] border border-border/40 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-4 hover:bg-destructive/5 transition-colors text-left active:bg-destructive/10"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-destructive/10">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-destructive">Log Out</p>
              <p className="text-[11px] text-muted-foreground">Sign out of your CashPay account</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
