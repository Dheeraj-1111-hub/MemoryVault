import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  Image as ImageIcon,
  Mail,
  Sparkles,
  AlertCircle,
  Wallet,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { DocCard } from "@/components/doc-card";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MemoryVault" },
      { name: "description", content: "Your second brain at a glance." },
    ],
  }),
  component: Dashboard,
});

const insightIcon: Record<string, any> = {
  deadline: Clock,
  stale: AlertCircle,
  important: ShieldCheck,
  money: Wallet,
};

import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/dashboard")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard:", err);
        setLoading(false);
      });
  }, []);

  const submit = (text: string) => {
    if (!text.trim()) return;
    const id = `t_${Date.now().toString(36)}`;
    navigate({ to: "/ask/$threadId", params: { threadId: id }, search: { q: text } });
  };

  if (loading || !data) {
    return <div className="p-16 flex justify-center"><div className="h-6 w-6 border-2 border-amber border-t-transparent rounded-full animate-spin" /></div>;
  }

  const { stats, recentUploads, insights, deadlines, suggestions, health } = data;

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 max-w-[1280px] mx-auto">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Good evening
        </span>
        <h1 className="display text-5xl md:text-6xl text-foreground">
          Welcome back, <em className="italic text-amber">{user?.name?.split(' ')[0] || 'friend'}</em>.
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl">
          You've offloaded {stats.documents.toLocaleString()} documents,{" "}
          {stats.screenshots.toLocaleString()} screenshots and {stats.emails} emails into MemoryVault.
          {stats.upcomingDeadlines > 0 ? ` ${stats.upcomingDeadlines} deadlines need you this week.` : " No urgent deadlines this week."}
        </p>
      </header>

      {/* Stat row */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Documents", value: stats.documents, icon: FileText },
          { label: "Screenshots", value: stats.screenshots, icon: ImageIcon },
          { label: "Storage", value: `${stats.storageMb} MB`, icon: Wallet },
          { label: "Deadlines", value: stats.upcomingDeadlines, icon: CalendarClock, accent: true },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-card p-4 flex items-start justify-between"
            >
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-1 font-serif text-3xl text-foreground">
                  {s.value}
                </div>
              </div>
              <Icon
                className={`h-4 w-4 ${s.accent ? "text-amber" : "text-muted-foreground"}`}
                strokeWidth={1.7}
              />
            </div>
          );
        })}
      </div>

      {/* Ask anything */}
      <section className="mt-10">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-amber/10 blur-3xl" />
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber">
            <Sparkles className="h-3.5 w-3.5" /> Ask memory
          </div>
          <h2 className="mt-2 display text-3xl md:text-4xl">
            Anything you've ever stored, in one sentence.
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
            className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background pl-4 pr-2 py-2 focus-within:border-amber transition"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={suggestions[0] || "When is my Nokia interview?"}
              className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground/70 py-2"
            />
            <button
              type="submit"
              className="rounded-lg bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-foreground/90 flex items-center gap-1.5"
            >
              Ask <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((ex: string) => (
              <button
                key={ex}
                onClick={() => submit(ex)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-background/60 text-muted-foreground hover:text-foreground hover:border-amber/60 transition"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent uploads */}
        <section className="lg:col-span-2">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Recent uploads
              </span>
              <h3 className="display text-2xl mt-1">Just dropped in</h3>
            </div>
            <Link to="/vault" className="text-sm text-amber hover:underline">
              Open vault →
            </Link>
          </div>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            {recentUploads.map((d: any) => (
              <DocCard key={d.id} doc={d} onClick={() => navigate({ to: "/vault", hash: d.id })} compact={true} />
            ))}
            {recentUploads.length === 0 && (
              <div className="text-sm text-muted-foreground">No documents uploaded yet.</div>
            )}
          </div>
        </section>

        {/* Insights */}
        <section>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            AI insights
          </span>
          <h3 className="display text-2xl mt-1">What needs you</h3>

          <div className="mt-5 rounded-lg border border-border bg-card p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="h-24 w-24 text-amber" />
            </div>
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Workspace Health
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="display text-4xl">{health.overall}%</span>
                <span className="text-sm text-amber font-medium">Optimized</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Identity", score: health.breakdown.identity },
                  { label: "Education", score: health.breakdown.education },
                  { label: "Finance", score: health.breakdown.finance },
                  { label: "Placements", score: health.breakdown.placements },
                ].map((h) => (
                  <div key={h.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{h.label}</span>
                      <span className="font-medium text-foreground">{h.score}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${h.score === 100 ? 'bg-amber' : 'bg-foreground/40'}`} 
                        style={{ width: `${h.score}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {insights.map((ins: any, i: number) => {
              const Icon = insightIcon[ins.type] || AlertCircle;
              return (
                <Link
                  key={i}
                  to="/vault"
                  hash={ins.docId}
                  className="block rounded-lg border border-border bg-card p-4 hover:border-amber/50 transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-md bg-amber/10 text-amber flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {ins.title}
                      </div>
                      <div className="text-sm mt-0.5 text-foreground group-hover:text-amber transition">
                        {ins.body}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {insights.length === 0 && (
              <div className="text-sm text-muted-foreground mt-5">No critical insights at the moment.</div>
            )}
          </div>

          <div className="mt-5 rounded-lg border border-border bg-card p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Upcoming deadlines
            </div>
            <ul className="mt-3 space-y-2.5">
              {deadlines.map((d: any) => (
                <li key={d.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{d.title}</span>
                  <span className="text-amber font-medium text-xs whitespace-nowrap ml-2">
                    {d.in}
                  </span>
                </li>
              ))}
              {deadlines.length === 0 && (
                <li className="text-sm text-muted-foreground">No upcoming deadlines detected.</li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
