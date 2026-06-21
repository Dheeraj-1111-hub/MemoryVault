import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  FolderOpen,
  MessageSquare,
  CalendarClock,
  Star,
  Search,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationsPopover } from "./notifications-popover";
import { useAuth } from "../contexts/AuthContext";
import { LogOut } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/vault", label: "Vault", icon: FolderOpen },
  { to: "/ask", label: "Ask Memory", icon: MessageSquare },
  { to: "/timeline", label: "Timeline", icon: CalendarClock },
  { to: "/important", label: "Important", icon: Star },
  { to: "/search", label: "Smart Search", icon: Search },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function Sidebar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground relative">
      <div className="px-6 pt-7 pb-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-ink text-paper flex items-center justify-center">
            <Sparkles className="h-4 w-4" strokeWidth={1.6} />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-xl tracking-tight">MemoryVault</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              your second brain
            </div>
          </div>
        </Link>
        <NotificationsPopover />
      </div>

      <button
        onClick={onOpenCommand}
        className="mx-4 mb-3 flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground hover:bg-background transition"
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          Quick search
        </span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      <nav className="px-3 flex-1 space-y-0.5 overflow-y-auto custom-scrollbar">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-ink text-paper"
                  : "text-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  active ? "text-amber" : "text-muted-foreground group-hover:text-foreground",
                )}
                strokeWidth={1.7}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto m-4 flex flex-col gap-3">
        {user && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-amber/15 text-amber flex items-center justify-center font-serif text-base uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="leading-tight min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 ink-divider" />
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>Vault storage</span>
              <span className="text-foreground font-medium">{(user.storageUsed / (1024 * 1024)).toFixed(1)} MB</span>
            </div>
            <button 
              onClick={logout}
              className="mt-4 w-full h-8 flex justify-center items-center gap-2 rounded-md bg-secondary text-xs font-medium text-foreground hover:bg-muted transition"
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </button>
          </div>
        )}

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Built for</p>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">Digital Heroes Project</p>
        </div>
      </div>
    </aside>
  );
}
