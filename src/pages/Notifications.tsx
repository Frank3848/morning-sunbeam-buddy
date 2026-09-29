import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Gift, ArrowUpRight, Info, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInAppNotifications, markAllRead, getUnreadCount } from "@/lib/pushNotifications";
import { toast } from "sonner";

const iconMap = {
  reward: Gift,
  transaction: ArrowUpRight,
  info: Info,
};

const colorMap = {
  reward: "text-primary bg-primary/10",
  transaction: "text-blue-500 bg-blue-500/10",
  info: "text-amber-500 bg-amber-500/10",
};

const Notifications = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) { navigate("/login"); return; }
    const userData = JSON.parse(currentUser);
    setUser(userData);
    const n = getInAppNotifications(userData.email);
    setNotifications(n);
    setUnread(getUnreadCount(userData.email));
  }, [navigate]);

  const handleMarkAll = () => {
    if (!user) return;
    markAllRead(user.email);
    const n = getInAppNotifications(user.email);
    setNotifications(n);
    setUnread(0);
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    if (!user) return;
    localStorage.removeItem(`notifications_${user.email}`);
    setNotifications([]);
    setUnread(0);
    toast.success("Notifications cleared");
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
            <h1 className="text-base font-bold text-white">Notifications</h1>
            <div className="w-14" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-3">
        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            {unread > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAll}
                className="flex items-center gap-1.5 text-xs rounded-xl"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-xs rounded-xl ml-auto text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </Button>
          </div>
        )}

        {/* Notification list */}
        <div className="bg-card rounded-3xl shadow-[var(--shadow-sm)] border border-border/40 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">Rewards and transaction alerts will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n: any) => {
                const Icon = iconMap[n.type as keyof typeof iconMap] || Info;
                const color = colorMap[n.type as keyof typeof colorMap] || colorMap.info;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground leading-tight">{n.title}</p>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
