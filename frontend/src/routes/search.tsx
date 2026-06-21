import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon, X, Clock, ArrowUpRight } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { DocCard } from "@/components/doc-card";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Smart Search — MemoryVault" },
      { name: "description", content: "Search like Gmail. Find like Google." },
    ],
  }),
  component: SearchPage,
});

const types = ["All", "pdf", "image", "email"] as const;

function SearchPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState("");
  
  const [results, setResults] = useState<any[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load recent searches on mount
  useEffect(() => {
    fetchWithAuth("/search/recent")
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecent(data.recent);
      });
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (q.trim().length > 1) {
      const timer = setTimeout(() => {
        fetchWithAuth(`/search/suggestions?q=${encodeURIComponent(q)}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) setSuggestions(data.suggestions);
          });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [q]);

  // Execute Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (type !== "All") params.append("type", type);
      if (minAmount) params.append("minAmount", minAmount);
      activeTags.forEach(t => params.append("tags", t));

      fetchWithAuth(`/search?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Map backend fields to frontend Doc interface where needed
            const mapped = data.results.map((d: any) => ({
              id: d._id,
              title: d.title,
              kind: d.kind,
              uploadedAt: d.uploadDate,
              tags: d.tags || [],
              summary: d.summary,
              excerpt: d.extractedText,
              category: d.documentType,
              filePath: d.filePath,
              fields: d.metadata
            }));
            setResults(mapped);
          }
        })
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [q, type, activeTags, minAmount]);

  // Aggregate tags from results to build dynamic tags list
  const tagsList = Array.from(new Set(results.flatMap((d) => d.tags))).sort();

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 max-w-[1280px] mx-auto">
      <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Smart search
      </span>
      <h1 className="display text-5xl md:text-6xl mt-1">
        Search like <em className="italic text-amber">Gmail</em>. Find like Google.
      </h1>

      <div className="mt-7 relative z-50">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 focus-within:border-amber transition shadow-sm">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Try: "salary above 10000" or "documents from Nokia"'
            className="flex-1 bg-transparent outline-none py-2 text-sm"
          />
          {q && (
            <button onClick={() => setQ("")} className="p-1 rounded hover:bg-muted">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Suggestions / Recent Dropdown */}
        {showSuggestions && (q.length > 1 ? suggestions.length > 0 : recent.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card shadow-xl overflow-hidden py-2">
            {!q ? (
              <>
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Recent Searches</div>
                {recent.map((r, i) => (
                  <button
                    key={i}
                    onMouseDown={() => setQ(r)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {r}
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Suggestions</div>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={() => setQ(s)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted flex items-center gap-2"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" /> {s}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 grid md:grid-cols-[260px_1fr] gap-6">
        {/* Filters */}
        <aside className="space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              File type
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    type === t
                      ? "bg-ink text-paper border-ink"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "All" ? "All" : `.${t}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Amount above ₹
            </div>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="10000"
              className="mt-2 w-full rounded-md border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-amber transition"
            />
          </div>

          {tagsList.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Tags in results
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tagsList.map((t) => {
                  const on = activeTags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        setActiveTags((arr) =>
                          on ? arr.filter((x) => x !== t) : [...arr, t],
                        )
                      }
                      className={`text-[11px] px-2 py-1 rounded-full border transition ${
                        on
                          ? "bg-amber/15 text-foreground border-amber/60"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      #{t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(activeTags.length > 0 || minAmount || type !== "All" || q) && (
            <button
              onClick={() => {
                setActiveTags([]);
                setMinAmount("");
                setType("All");
                setQ("");
              }}
              className="text-xs text-amber hover:underline mt-4 inline-block"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {loading ? (
              <>
                <div className="h-3 w-3 border-[1.5px] border-amber border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              `${results.length} result${results.length === 1 ? "" : "s"} found`
            )}
          </div>
          <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {results.map((d) => (
              <DocCard key={d.id} doc={d} />
            ))}
          </div>
          {!loading && results.length === 0 && (
            <div className="mt-10 p-8 rounded-xl border border-border bg-card/50 text-center flex flex-col items-center">
              <SearchIcon className="h-8 w-8 text-muted-foreground mb-3" />
              <div className="text-base text-foreground font-medium">No documents found</div>
              <div className="text-sm text-muted-foreground mt-1 max-w-sm">
                Try using different keywords, or remove some filters to broaden your search.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
