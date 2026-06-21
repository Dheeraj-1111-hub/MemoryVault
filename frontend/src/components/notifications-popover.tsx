import { useState, useEffect } from "react";
import { Bell, Check, X, Circle, AlertTriangle, FileWarning, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fetchWithAuth } from "../lib/api";

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = () => {
    fetchWithAuth("/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    await fetchWithAuth(`/notifications/${id}/read`, { method: "PATCH" });
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await fetchWithAuth(`/notifications/read-all`, { method: "POST" });
    fetchNotifications();
    setOpen(false);
  };

  const getIcon = (type: string, priority: string) => {
    const color = priority === 'high' ? 'text-rust' : priority === 'medium' ? 'text-amber' : 'text-foreground';
    switch (type) {
      case 'deadline': return <Clock className={`h-4 w-4 ${color}`} />;
      case 'missing': return <FileWarning className={`h-4 w-4 ${color}`} />;
      default: return <AlertTriangle className={`h-4 w-4 ${color}`} />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-md hover:bg-background/60 transition text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber"></span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <h3 className="font-medium text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                You're all caught up!
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => (
                  <li key={n._id} className={`p-4 transition ${n.isRead ? 'opacity-60 bg-transparent' : 'bg-amber/5'}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getIcon(n.type, n.priority)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${n.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <button onClick={() => markAsRead(n._id)} className="shrink-0 text-muted-foreground hover:text-amber" title="Mark as read">
                              <Circle className="h-3 w-3 fill-amber text-amber" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">{n.message}</p>
                        {n.actionLink && (
                          <Link 
                            to={n.actionLink}
                            onClick={() => { setOpen(false); markAsRead(n._id); }}
                            className="text-[10px] uppercase tracking-wider text-amber hover:underline mt-2 inline-block"
                          >
                            Take Action →
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
