import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) { navigate("/login"); return; }
    const userData = JSON.parse(currentUser);
    setUser(userData);
    setFullName(userData.name || "");
    setPhone(userData.phone || "");
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) { toast.error("Full name cannot be empty"); return; }
    if (trimmedName.length > 60) { toast.error("Name must be less than 60 characters"); return; }
    if (trimmedPhone && !/^[0-9+\-\s()]{7,15}$/.test(trimmedPhone)) {
      toast.error("Please enter a valid phone number"); return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 700));

    const updatedUser = { ...user, name: trimmedName, phone: trimmedPhone };

    // Update in users array
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u: any) =>
      u.email === user.email ? { ...u, name: trimmedName, phone: trimmedPhone } : u
    );
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    setUser(updatedUser);
    setLoading(false);
    toast.success("Profile updated successfully!");
    navigate("/profile");
  };

  if (!user) return null;

  const initials = (user.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const hasChanges = fullName.trim() !== (user.name || "") || phone.trim() !== (user.phone || "");

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--gradient-bg)" }}>
      {/* Header */}
      <div className="relative overflow-hidden pb-16" style={{ background: "var(--gradient-card)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-15 blur-3xl bg-white" style={{ transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full opacity-10 blur-2xl bg-white" style={{ transform: "translate(-30%, 30%)" }} />
        <div className="relative z-10 px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-base font-bold text-white">Edit Profile</h1>
            <div className="w-14" />
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 pb-8 space-y-4">
        {/* Avatar card */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-xl)] border border-border/40 p-5 flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar className="w-20 h-20 border-4 border-card shadow-[var(--shadow-lg)]">
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback className="text-2xl font-black text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center border-2 border-card shadow-[var(--shadow-md)]" style={{ background: "var(--gradient-primary)" }}>
              <Pencil className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-sm)] border border-border/40 overflow-hidden">
          <div className="px-4 pt-4 pb-1">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Personal Information</p>
          </div>

          <form onSubmit={handleSave} className="px-4 pt-3 pb-5 space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="pl-10 rounded-xl"
                  maxLength={60}
                  required
                />
              </div>
              {fullName.trim() && fullName.trim() !== user.name && (
                <div className="flex items-center gap-1 text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Name updated</span>
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                </div>
                <Input
                  type="tel"
                  placeholder="e.g. 08012345678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="pl-10 rounded-xl"
                  maxLength={15}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Used for account recovery and verification</p>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address</Label>
              <Input
                type="email"
                value={user.email}
                disabled
                className="rounded-xl opacity-60 cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">Email address cannot be changed</p>
            </div>

            <Button
              type="submit"
              disabled={loading || !hasChanges}
              className="w-full rounded-xl font-bold mt-2 disabled:opacity-40"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
