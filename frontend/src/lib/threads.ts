// localStorage-backed thread store for Ask Memory
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: { docId: string; title: string; kind?: string }[];
  followUps?: string[];
};

export type Thread = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const KEY = "memvault_threads";

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return data.map((t: any) => ({
      ...t,
      messages: Array.isArray(t.messages) ? t.messages : []
    }));
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(threads));
}

export function upsertThread(t: Thread) {
  const list = loadThreads().filter((x) => x.id !== t.id);
  list.unshift(t);
  saveThreads(list);
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}

export function newThreadId() {
  return "t_" + Math.random().toString(36).slice(2, 10);
}
