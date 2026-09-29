import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Bell, Globe, Smartphone, ChevronRight, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotif, setPushNotif] = useState(false);
  const [transactionAlert, setTransactionAlert] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [currency, setCurrency] = useState("NGN");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) { navigate("/login"); return; }
    setUser(JSON.parse(currentUser));

    // Load saved settings
    const saved = JSON.parse(localStorage.getItem("cashpay_settings") || "{}");
    if (saved.darkMode !== undefined) setDarkMode(saved.darkMode);
    if (saved.pushNotif !== undefined) setPushNotif(saved.pushNotif);
    if (saved.transactionAlert !== undefined) setTransactionAlert(saved.transactionAlert);
    if (saved.promotions !== undefined) setPromotions(saved.promotions);
    if (saved.currency) setCurrency(saved.currency);

    setDarkMode(document.documentElement.classList.contains("dark"));
    setPushNotif(typeof Notification !== "undefined" && Notification.permission === "granted");
  }, [navigate]);

  const save = (update: Record<string, any>) => {
    const current = JSON.parse(localStorage.getItem("cashpay_settings") || "{}");
    localStorage.setItem("cashpay_settings", JSON.stringify({ ...current, ...update }));
  };

  const handleDarkMode = (val: boolean) => {
    setDarkMode(val);
    document.documentElement.classList.toggle("dark", val);
    save({ darkMode: val });
    toast.success(val ? "Dark mode enabled" : "Light mode enabled");
  };

  const handlePushNotif = async (val: boolean) => {
    if (val && typeof Notification !== "undefined" && Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Notification permission denied");
        return;
      }
    }
    setPushNotif(val);
    save({ pushNotif: val });
    toast.success(val ? "Push notifications enabled" : "Push notifications disabled");
  };

  const handleTransactionAlert = (val: boolean) => {
    setTransactionAlert(val);
    save({ transactionAlert: val });
    toast.success(val ? "Transaction alerts enabled" : "Transaction alerts disabled");
  };

  const handlePromotions = (val: boolean) => {
    setPromotions(val);
    save({ promotions: val });
    toast.success(val ? "Promotional alerts enabled" : "Promotional alerts disabled");
  };

  if (!user) return null;

  const sections = [
    {
      title: "Appearance",
      items: [
        {
          icon: darkMode ? Moon : Sun,
          iconBg: "bg-violet-500/10",
          iconColor: "text-violet-600",
          label: "Dark Mode",
          description: "Switch between light and dark theme",
          toggle: true,
          value: darkMode,
          onChange: handleDarkMode,
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          iconBg: "bg-amber-500/10",
          iconColor: "text-amber-600",
          label: "Push Notifications",
          description: "Receive alerts on your device",
          toggle: true,
          value: pushNotif,
          onChange: handlePushNotif,
        },
        {
          icon: Smartphone,
          iconBg: "bg-blue-500/10",
          iconColor: "text-blue-600",
          label: "Transaction Alerts",
          description: "Get notified on every transaction",
          toggle: true,
          value: transactionAlert,
          onChange: handleTransactionAlert,
        },
        {
          icon: Globe,
          iconBg: "bg-emerald-500/10",
          iconColor: "text-emerald-600",
          label: "Promotions & Offers",
          description: "Receive special deals and bonuses",
          toggle: true,
          value: promotions,
          onChange: handlePromotions,
        },
      ],
    },
    {
      title: "Currency",
      items: [
        {
          icon: Globe,
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
          label: "Default Currency",
          description: "Nigerian Naira (₦ NGN)",
          toggle: false,
          trailing: <Check className="w-4 h-4 text-primary" />,
        },
      ],
    },
  ];

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
            <h1 className="text-base font-bold text-white">Settings</h1>
            <div className="w-14" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-3">
        {sections.map((section) => (
          <div key={section.title} className="bg-card rounded-3xl shadow-[var(--shadow-sm)] border border-border/40 overflow-hidden">
            <div className="px-4 pt-4 pb-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{section.title}</p>
            </div>
            {section.items.map((item, i) => (
              <div key={item.label}>
                <div className="flex items-center gap-3.5 px-4 py-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  {item.toggle ? (
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.onChange}
                      className="flex-shrink-0"
                    />
                  ) : (
                    <div className="flex-shrink-0">{item.trailing}</div>
                  )}
                </div>
                {i < section.items.length - 1 && <Separator className="mx-4 opacity-50" />}
              </div>
            ))}
          </div>
        ))}

        <p className="text-center text-[11px] text-muted-foreground pt-2">CashPay v1.0.0 · Nigerian Smart Online Earnings</p>
      </div>
    </div>
  );
};

export default Settings;
