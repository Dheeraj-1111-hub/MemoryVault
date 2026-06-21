import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/api";
import {
  Upload,
  Filter,
  X,
  Tag,
  Calendar,
  FileText,
  Sparkles,
  Download,
  Trash2,
  Star,
} from "lucide-react";
import { docs as seedDocs, type Doc, type DocCategory } from "@/lib/data";
import { DocCard, DocPreview } from "@/components/doc-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Vault — MemoryVault" },
      { name: "description", content: "Every document you've ever saved, beautifully organized." },
    ],
  }),
  component: VaultPage,
});

const filters: ("All" | DocCategory)[] = [
  "All",
  "Placement Notice",
  "Offer Letter",
  "Identity",
  "Education",
  "Finance",
  "Bill",
  "Screenshot",
  "Email",
  "Certificate",
];

function VaultPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [openDoc, setOpenDoc] = useState<Doc | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchDocs = async () => {
    try {
      const url = filter === "All" 
        ? "/documents" 
        : `/documents?type=${encodeURIComponent(filter)}`;
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDocs(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load documents");
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [filter]);

  // Polling for processing documents
  useEffect(() => {
    const hasProcessing = docs.some(d => d.status === "processing");
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchDocs();
    }, 3000);

    return () => clearInterval(interval);
  }, [docs, filter]);

  // Open doc from hash (#docId)
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h && docs.length > 0) {
      const d = docs.find((x) => x.id === h);
      if (d) setOpenDoc(d);
    }
  }, [docs]);

  const list = docs;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    toast.info(`Uploading ${files.length} document(s)...`);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetchWithAuth("/documents/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Upload failed");
        }
        successCount++;
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} document${successCount > 1 ? "s" : ""}`);
      fetchDocs();
    }
  };

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 max-w-[1380px] mx-auto">
      <header className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Your vault
          </span>
          <h1 className="display text-5xl md:text-6xl mt-1">
            {docs.length} <span className="italic text-amber">memories</span>, perfectly indexed.
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Drop anything in — PDFs, screenshots, emails, scans. MemoryVault reads them and makes
            them findable forever.
          </p>
        </div>
      </header>

      {/* Dropzone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`mt-8 block rounded-2xl border-2 border-dashed transition cursor-pointer
          ${dragOver ? "border-amber bg-amber/5" : "border-border bg-card hover:border-amber/50"}
        `}
      >
        <input
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="px-8 py-10 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-amber/15 text-amber flex items-center justify-center">
            <Upload className="h-5 w-5" strokeWidth={1.7} />
          </div>
          <div className="mt-3 font-serif text-2xl">Drop PDFs, images or screenshots</div>
          <div className="mt-1 text-sm text-muted-foreground">
            or <span className="text-amber underline">click to choose files</span> from your device
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="px-2 py-1 rounded-full bg-secondary">.pdf</span>
            <span className="px-2 py-1 rounded-full bg-secondary">.png / .jpg</span>
            <span className="px-2 py-1 rounded-full bg-secondary">.eml</span>
            <span className="px-2 py-1 rounded-full bg-secondary">.docx</span>
          </div>
        </div>
      </label>

      {/* Filters */}
      <div className="mt-8 flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === f
                ? "bg-ink text-paper border-ink"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-amber/40"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {list.map((d) => (
          <DocCard key={d.id} doc={d} onClick={() => setOpenDoc(d)} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="mt-10 text-center text-sm text-muted-foreground">
          No documents in this category yet.
        </div>
      )}

      {/* Drawer */}
      <Sheet open={!!openDoc} onOpenChange={(o) => !o && setOpenDoc(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          {openDoc && (
            <div className="flex flex-col">
              <SheetHeader className="px-6 pt-6 pb-3 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {openDoc.documentType || openDoc.category}
                    </div>
                    <SheetTitle className="font-serif text-3xl mt-1 leading-tight">
                      {openDoc.title}
                    </SheetTitle>
                    <div className="mt-1 text-xs text-muted-foreground">{openDoc.filename}</div>
                  </div>
                  <button
                    onClick={() => setOpenDoc(null)}
                    className="rounded-md p-1.5 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </SheetHeader>

              <div className="px-6 py-5 space-y-6">
                <DocPreview doc={openDoc} />

                {openDoc.status === "processing" && (
                   <div className="rounded-md border border-amber/40 bg-amber/10 px-4 py-3 flex items-center justify-between text-sm">
                     <div className="flex items-center gap-2">
                       <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
                       <span className="text-amber font-medium">AI is reading this document...</span>
                     </div>
                     <span className="text-xs text-amber/80">Check back in a few seconds</span>
                   </div>
                )}

                {/* AI Summary */}
                {openDoc.summary && (
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber">
                      <Sparkles className="h-3.5 w-3.5" /> AI summary
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{openDoc.summary}</p>
                  </div>
                )}

                {/* Extracted fields */}
                {(openDoc.companies?.length > 0 || openDoc.salaries?.length > 0 || openDoc.entities?.length > 0 || (openDoc.fields && Object.keys(openDoc.fields).length > 0)) && (
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Extracted data
                    </div>
                    <div className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {openDoc.companies?.map(c => (
                        <div key={c} className="flex justify-between border-b border-border/70 py-1.5">
                          <span className="text-muted-foreground">Company</span>
                          <span className="font-medium text-right">{c}</span>
                        </div>
                      ))}
                      {openDoc.salaries?.map(s => (
                        <div key={s} className="flex justify-between border-b border-border/70 py-1.5">
                          <span className="text-muted-foreground">CTC / Salary</span>
                          <span className="font-medium text-right">{s}</span>
                        </div>
                      ))}
                      {openDoc.fields && Object.entries(openDoc.fields).map(([k, v]) => (
                        <div key={k} className="flex justify-between border-b border-border/70 py-1.5">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-medium text-right">{v}</span>
                        </div>
                      ))}
                      {openDoc.entities?.slice(0, 3).map(e => (
                        <div key={e} className="flex justify-between border-b border-border/70 py-1.5">
                          <span className="text-muted-foreground">Entity</span>
                          <span className="font-medium text-right">{e}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {openDoc.tags && openDoc.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" /> Tags
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {openDoc.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground/80"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                {openDoc.dates && openDoc.dates.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {openDoc.dates.map(date => (
                      <div key={date} className="rounded-md border border-amber/40 bg-amber/10 px-3 py-2.5 flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-amber" />
                        Key date:{" "}
                        <span className="font-medium">
                          {date}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => toast.info("Download is mocked in demo")}
                    className="inline-flex items-center gap-1.5 rounded-md bg-ink text-paper px-3 py-2 text-sm hover:bg-foreground/90"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                  <button
                    onClick={() => toast.success("Marked as important")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <Star className="h-3.5 w-3.5" /> Mark important
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetchWithAuth(`/documents/${openDoc.id}`, {
                          method: "DELETE"
                        });
                        if (!res.ok) throw new Error("Delete failed");
                        
                        setDocs((d) => d.filter((x) => x.id !== openDoc.id));
                        setOpenDoc(null);
                        toast.success("Removed from vault");
                      } catch (e) {
                        toast.error("Failed to delete document");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>

                <div className="rounded-md bg-muted/60 border border-border p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Original text excerpt: <em className="text-foreground/70">"{openDoc.excerpt}"</em>
                  </span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function guessCategory(name: string): DocCategory {
  const n = name.toLowerCase();
  if (/(pan|aadhaar|passport|license)/.test(n)) return "Identity";
  if (/(offer|appointment)/.test(n)) return "Offer Letter";
  if (/(bill|invoice|electric)/.test(n)) return "Bill";
  if (/(screenshot|ss|otp)/.test(n)) return "Screenshot";
  if (/(cert|certificate)/.test(n)) return "Certificate";
  if (/(eml|mail)/.test(n)) return "Email";
  if (/(notice|placement)/.test(n)) return "Placement Notice";
  if (/(marksheet|degree|transcript)/.test(n)) return "Education";
  return "Education";
}
