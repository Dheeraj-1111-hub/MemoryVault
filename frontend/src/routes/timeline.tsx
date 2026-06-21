import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Briefcase, GraduationCap, Wallet, User, Filter, HelpCircle, FileText, Calendar, Building, Landmark, Plane } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — MemoryVault" },
      { name: "description", content: "Your life, automatically arranged by date." },
    ],
  }),
  component: TimelinePage,
});

const groups = ["All", "Identity", "Education", "Finance", "Bills", "Placements", "Jobs", "Internships", "Travel", "Personal"] as const;

const groupIcon: Record<string, any> = {
  Identity: User,
  Education: GraduationCap,
  Finance: Wallet,
  Bills: FileText,
  Placements: Briefcase,
  Jobs: Building,
  Internships: Briefcase,
  Travel: Plane,
  Personal: User,
  Other: HelpCircle
};

function TimelinePage() {
  const [filter, setFilter] = useState<string>("Upcoming");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = "/timeline";
    if (filter === "Upcoming") url = "/timeline/upcoming";
    else if (filter === "History") url = "/timeline/history";
    else if (filter !== "All") url = `/timeline?category=${encodeURIComponent(filter)}`;
    
    fetchWithAuth(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEvents(data.events);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  // Format date to "28 June"
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    return { day, month };
  };

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 max-w-[1100px] mx-auto">
      <div>
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Timeline
        </span>
        <h1 className="display text-5xl md:text-6xl mt-1">
          Your <em className="italic text-amber">year</em>, automatically.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          MemoryVault reads dates out of your documents and arranges them so you can scroll
          through your life like a magazine.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === g
                ? "bg-ink text-paper border-ink"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-amber/40"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Timeline rail */}
      <div className="mt-10 relative">
        <div className="absolute left-[7.5rem] top-2 bottom-2 w-px bg-border" />
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="h-6 w-6 border-2 border-amber border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground text-sm">
            No events found. Upload more documents to generate your timeline.
          </div>
        ) : (
          <ul className="space-y-7">
            {events.map((e) => {
              const Icon = groupIcon[e.category] ?? Calendar;
              const { day, month } = formatDate(e.date);
              
              // Calculate countdown
              const diffTime = new Date(e.date).getTime() - new Date().getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              let statusTag = null;
              
              if (diffDays >= 0 && diffDays <= 7) {
                statusTag = <span className="ml-3 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-amber/20 text-amber font-medium">{diffDays === 0 ? 'Today' : `${diffDays} days left`}</span>;
              } else if (diffDays < 0 && diffDays >= -7) {
                statusTag = <span className="ml-3 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-red-500/10 text-red-500 font-medium">{Math.abs(diffDays)} days ago</span>;
              }

              return (
                <li key={e._id} className="grid grid-cols-[7rem_auto_1fr] items-start gap-5">
                  <div className="text-right pt-1">
                    <div className="font-serif text-2xl leading-none text-foreground">
                      {day}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                      {month}
                    </div>
                  </div>
                  <div className="relative -ml-2.5">
                    <div className={`h-5 w-5 rounded-full bg-card border-2 flex items-center justify-center ${e.priority === 'high' ? 'border-amber shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'border-border'}`}>
                      <Icon className={`h-2.5 w-2.5 ${e.priority === 'high' ? 'text-amber' : 'text-muted-foreground'}`} strokeWidth={2} />
                    </div>
                  </div>
                  <Link
                    to="/vault"
                    hash={e.sourceDocumentId?._id}
                    className={`rounded-lg border bg-card p-4 transition ${e.priority === 'high' ? 'border-amber/30 hover:border-amber/60' : 'border-border hover:border-foreground/30'}`}
                  >
                    <div className="flex items-center">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {e.category}
                      </div>
                      {statusTag}
                    </div>
                    <div className="mt-1 font-serif text-xl">{e.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{e.sourceDocumentId?.title || 'View Document'}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
