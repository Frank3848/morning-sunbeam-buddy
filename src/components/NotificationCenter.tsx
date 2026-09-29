import { useState, useEffect } from "react";
import { Bell, Gift, ArrowUpRight, Info, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getInAppNotifications,
  markAllRead,
  getUnreadCount,
  requestNotificationPermission,
  registerServiceWorker,
} from "@/lib/pushNotifications";

interface Props {
  email: string;
}

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

const NotificationCenter = ({ email }: Props) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const refresh = () => {
    const n = getInAppNotifications(email);
    setNotifications(n);
    setUnread(getUnreadCount(email));
  };

  useEffect(() => {
    refresh();
    if (typeof Notification !== 'undefined') {
      setPermissionGranted(Notification.permission === 'granted');
    }
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [email]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    markAllRead(email);
    setUnread(0);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionGranted(true);
      await registerServiceWorker();
    }
  };

  return (
    <>
      {/* Bell Button */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-sm h-9 w-9 sm:h-10 sm:w-10"
          onClick={open ? handleClose : handleOpen}
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>

      {/* Notification Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={handleClose}
          />
          {/* Panel */}
          <div className="fixed top-14 right-3 sm:right-4 z-[101] w-[340px] max-w-[calc(100vw-1.5rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Notifications</span>
                {unread > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unread} new
                  </span>
                )}
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Enable push prompt */}
            {!permissionGranted && (
              <div className="mx-3 mt-3 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">Enable Push Notifications</p>
                  <p className="text-[11px] text-muted-foreground">Get alerts for rewards & transactions</p>
                </div>
                <Button
                  size="sm"
                  className="h-7 text-xs rounded-lg flex-shrink-0"
                  style={{ background: "var(--gradient-primary)" }}
                  onClick={handleEnableNotifications}
                >
                  Enable
                </Button>
              </div>
            )}

            {/* Notification list */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Rewards and transaction alerts will appear here</p>
                </div>
              ) : (
                notifications.map((n: any) => {
                  const Icon = iconMap[n.type as keyof typeof iconMap] || Info;
                  const color = colorMap[n.type as keyof typeof colorMap] || colorMap.info;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${!n.read ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-foreground leading-tight">{n.title}</p>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-border bg-muted/20 flex justify-center">
                <button
                  onClick={() => { markAllRead(email); refresh(); }}
                  className="flex items-center gap-1.5 text-xs text-primary font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default NotificationCenter;
