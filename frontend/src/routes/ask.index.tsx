import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { newThreadId, loadThreads } from "@/lib/threads";
import { exampleQueries } from "@/lib/data";
import { MessageSquare, Plus, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ask/")({
  head: () => ({
    meta: [
      { title: "Ask Memory — MemoryVault" },
      { name: "description", content: "Chat with your documents like ChatGPT — with real sources." },
    ],
  }),
  component: AskIndex,
});

function AskIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    // If a thread already exists, route to the newest one. Otherwise stay on landing.
  }, []);

  const startThread = (seed?: string) => {
    const id = newThreadId();
    navigate({ to: "/ask/$threadId", params: { threadId: id }, search: seed ? { q: seed } : undefined });
  };

  const threads = typeof window !== "undefined" ? loadThreads() : [];

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 max-w-[1000px] mx-auto">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-amber">
        <Sparkles className="h-3.5 w-3.5" /> Ask memory
      </div>
      <h1 className="display text-5xl md:text-6xl mt-2">
        What would you like to <em className="italic text-amber">find</em>?
      </h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">
        Ask anything about your documents — interview dates, salaries, IDs, bills. MemoryVault
        searches everything you've ever uploaded and answers with sources.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {exampleQueries.map((q) => (
          <button
            key={q}
            onClick={() => startThread(q)}
            className="text-left rounded-lg border border-border bg-card p-4 hover:border-amber/60 hover:-translate-y-0.5 transition"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Try asking
            </div>
            <div className="mt-1 font-serif text-xl">{q}</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => startThread()}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-ink text-paper px-4 py-2.5 text-sm font-medium hover:bg-foreground/90"
      >
        <Plus className="h-4 w-4" /> Start a new conversation
      </button>

      {threads.length > 0 && (
        <section className="mt-12">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Recent conversations
          </div>
          <ul className="mt-3 space-y-2">
            {threads.slice(0, 6).map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => navigate({ to: "/ask/$threadId", params: { threadId: t.id } })}
                  className="w-full flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 hover:border-amber/50 transition"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-amber" />
                    {t.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
