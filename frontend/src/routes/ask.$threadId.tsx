import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageSquare, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  loadThreads,
  saveThreads,
  upsertThread,
  deleteThread,
  newThreadId,
  type Thread,
  type ChatMessage,
} from "@/lib/threads";
import { fetchWithAuth } from "@/lib/api";
import { answerQuery, exampleQueries } from "@/lib/data";
import { SourceChip } from "@/components/doc-card";
import { z } from "zod";

const search = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/ask/$threadId")({
  validateSearch: search,
  head: () => ({
    meta: [{ title: "Ask Memory — MemoryVault" }],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { q: seed } = Route.useSearch();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load threads from localStorage once (we keep the list of threads local for sidebar, but messages from backend)
  useEffect(() => {
    const list = loadThreads();
    let active = list.find((t) => t.id === threadId);
    if (!active) {
      active = {
        id: threadId,
        title: "New conversation",
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      list.unshift(active);
    }
    setThreads(list);

    // Fetch history from backend
    fetchWithAuth(`/chat/${threadId}`)
      .then((res) => res.json())
      .then(data => {
        if (data.success && data.messages.length > 0) {
          // Sync backend messages to local thread
          const mappedMessages = data.messages.map((m: any) => ({
            id: m.id,
            role: m.role === 'ai' ? 'assistant' : 'user',
            text: m.text,
            sources: m.sources ? m.sources.map((s: any) => ({ docId: s.documentId, title: s.title, kind: s.kind })) : [],
            followUps: m.followUps || []
          }));
          
          setThreads(prev => {
            const newList = [...prev];
            const idx = newList.findIndex(t => t.id === threadId);
            if (idx > -1) {
              newList[idx].messages = mappedMessages;
              saveThreads(newList);
            }
            return newList;
          });
        }
      })
      .catch(console.error);

  }, [threadId]);

  const thread = threads.find((t) => t.id === threadId);

  // Seed from query (?q=...) — only on first render of this thread
  const seededRef = useRef(false);
  useEffect(() => {
    if (!thread || seededRef.current) return;
    if (seed && thread.messages.length === 0) {
      seededRef.current = true;
      void send(seed);
    } else {
      seededRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [thread?.messages.length, thinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  const persist = (next: Thread) => {
    upsertThread(next);
    setThreads((prev) => {
      const others = prev.filter((t) => t.id !== next.id);
      return [next, ...others];
    });
  };

  const send = async (text: string) => {
    if (!text.trim() || !thread) return;
    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      role: "user",
      text: text.trim(),
    };
    const isFirst = thread.messages.length === 0;
    const next: Thread = {
      ...thread,
      title: isFirst ? text.slice(0, 60) : thread.title,
      updatedAt: new Date().toISOString(),
      messages: [...thread.messages, userMsg],
    };
    persist(next);
    setInput("");
    setThinking(true);

    try {
      const res = await fetchWithAuth("/chat/ask", {
        method: "POST",
        body: JSON.stringify({ threadId, question: text.trim() })
      });
      const data = await res.json();
      
      if (data.success && data.message) {
        const aMsg: ChatMessage = {
          id: data.message.id,
          role: "assistant",
          text: data.message.text,
          sources: data.message.sources ? data.message.sources.map((s: any) => ({ docId: s.documentId, title: s.title, kind: s.kind })) : [],
          followUps: data.message.followUps || []
        };
        persist({ ...next, messages: [...next.messages, aMsg], updatedAt: new Date().toISOString() });
      } else {
        throw new Error("Failed to get answer");
      }
    } catch (err) {
      console.error(err);
      const aMsg: ChatMessage = {
        id: "a_" + Date.now(),
        role: "assistant",
        text: "I'm sorry, I encountered an error connecting to MemoryVault. Please try again.",
      };
      persist({ ...next, messages: [...next.messages, aMsg], updatedAt: new Date().toISOString() });
    } finally {
      setThinking(false);
    }
  };

  const startNew = () => {
    const id = newThreadId();
    navigate({ to: "/ask/$threadId", params: { threadId: id } });
  };

  const onDelete = (id: string) => {
    deleteThread(id);
    const remaining = loadThreads();
    setThreads(remaining);
    if (id === threadId) {
      if (remaining[0]) navigate({ to: "/ask/$threadId", params: { threadId: remaining[0].id } });
      else navigate({ to: "/ask" });
    }
  };

  if (!thread) return null;

  return (
    <div className="flex h-screen" key={threadId}>
      {/* Thread list */}
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar/60 flex flex-col">
        <div className="p-3">
          <button
            onClick={startNew}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-ink text-paper py-2 text-sm font-medium hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" /> New conversation
          </button>
        </div>
        <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Threads
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
          {threads.length === 0 && (
            <div className="px-2 text-xs text-muted-foreground">No threads yet.</div>
          )}
          {threads.map((t) => {
            const active = t.id === threadId;
            return (
              <div
                key={t.id}
                className={`group flex items-center gap-1 rounded-md transition ${
                  active ? "bg-ink text-paper" : "hover:bg-sidebar-accent"
                }`}
              >
                <Link
                  to="/ask/$threadId"
                  params={{ threadId: t.id }}
                  className="flex-1 min-w-0 flex items-center gap-2 px-2.5 py-2 text-sm"
                >
                  <MessageSquare
                    className={`h-3.5 w-3.5 shrink-0 ${active ? "text-amber" : "text-muted-foreground"}`}
                  />
                  <span className="truncate">{t.title}</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(t.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 mr-1 rounded p-1.5 ${
                    active ? "hover:bg-paper/20 text-paper" : "hover:bg-muted text-muted-foreground"
                  }`}
                  aria-label="Delete thread"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-6 py-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber" />
          <h2 className="font-serif text-xl truncate">{thread.title}</h2>
        </header>

        <div ref={scrollerRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            {thread.messages.length === 0 && !thinking && (
              <div className="text-center py-10">
                <div className="h-12 w-12 mx-auto rounded-full bg-amber/15 text-amber flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-4 display text-3xl">
                  How can I help, <em className="italic text-amber">Sai</em>?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask about anything you've stored in your vault.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                  {exampleQueries.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-amber/50 text-muted-foreground hover:text-foreground transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {thread.messages.map((m) => (
              <MessageBubble key={m.id} m={m} onSend={send} />
            ))}

            {thinking && (
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-amber/15 text-amber flex items-center justify-center text-xs font-serif">
                  M
                </div>
                <div className="text-sm text-muted-foreground italic flex items-center gap-1">
                  Searching your vault
                  <span className="inline-flex">
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse [animation-delay:150ms]">.</span>
                    <span className="animate-pulse [animation-delay:300ms]">.</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-border bg-background px-6 py-4"
        >
          <div className="max-w-3xl mx-auto flex items-end gap-2 rounded-xl border border-border bg-card px-3 py-2 focus-within:border-amber transition">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask about any document…"
              className="flex-1 resize-none bg-transparent outline-none py-2 text-sm max-h-40"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="h-9 w-9 rounded-md bg-ink text-paper flex items-center justify-center disabled:opacity-40 hover:bg-foreground/90"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 max-w-3xl mx-auto text-[11px] text-muted-foreground">
            MemoryVault answers from your private documents. Sources are shown below each answer.
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ m, onSend }: { m: ChatMessage, onSend: (text: string) => void }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-ink text-paper px-4 py-2.5 text-sm">
          {m.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <div className="h-7 w-7 rounded-full bg-amber/15 text-amber flex items-center justify-center text-xs font-serif shrink-0">
        M
      </div>
      <div className="flex-1 min-w-0">
        <div className="prose-sm text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {renderMarkdown(m.text)}
        </div>
        {m.sources && m.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground mr-1 self-center">
              Sources
            </span>
            {m.sources.map((s) => (
              <SourceChip key={s.docId} docId={s.docId} title={s.title} />
            ))}
          </div>
        )}
        {m.followUps && m.followUps.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {m.followUps.map((fu, idx) => (
              <button
                key={idx}
                onClick={() => onSend(fu)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-amber/50 text-muted-foreground hover:text-foreground transition text-left"
              >
                {fu}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Tiny markdown: **bold** and `- ` list items + line breaks.
function renderMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const isBullet = line.trim().startsWith("- ");
    const content = isBullet ? line.trim().slice(2) : line;
    const parts = content.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") ? (
        <strong key={j} className="font-semibold">
          {p.slice(2, -2)}
        </strong>
      ) : (
        <span key={j}>{p}</span>
      ),
    );
    return (
      <div key={i} className={isBullet ? "flex gap-2" : ""}>
        {isBullet && <span className="text-amber select-none">•</span>}
        <span>{parts}</span>
      </div>
    );
  });
}
