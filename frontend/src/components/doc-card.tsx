import { Link } from "@tanstack/react-router";
import { FileText, Image as ImageIcon, Mail } from "lucide-react";
import type { Doc } from "@/lib/data";
import { cn } from "@/lib/utils";

export function DocIcon({ kind, className }: { kind: Doc["kind"]; className?: string }) {
  const Icon = kind === "image" ? ImageIcon : kind === "email" ? Mail : FileText;
  return <Icon className={cn("h-4 w-4", className)} strokeWidth={1.7} />;
}

export function DocCard({
  doc,
  onClick,
  compact,
}: {
  doc: Doc;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group text-left rounded-lg border border-border bg-card p-4 hover:border-amber/60 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-18px_oklch(0.55_0.13_35/0.4)] transition",
        compact && "p-3",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
          <DocIcon kind={doc.kind} className="text-amber" />
          {doc.category}
        </div>
        <div className="flex items-center gap-1.5">
          {doc.status === "processing" && (
            <span className="text-[10px] uppercase tracking-wider text-sage font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" /> Processing...
            </span>
          )}
          {doc.status === "failed" && (
            <span className="text-[10px] uppercase tracking-wider text-destructive font-medium">
              Failed
            </span>
          )}
          {doc.important && (
            <span className="text-[10px] uppercase tracking-wider text-amber font-medium">
              ★ Important
            </span>
          )}
        </div>
      </div>
      <h3 className="mt-2.5 font-serif text-xl leading-tight">{doc.title}</h3>
      {!compact && (
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{doc.summary}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {doc.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-foreground/70"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
        <span className="text-foreground/50 group-hover:text-amber transition">Open →</span>
      </div>
    </button>
  );
}

export function DocPreview({ doc }: { doc: Doc }) {
  // Use env var or just relative path if proxy is configured
  const backendUrl = "http://localhost:5000"; 
  const fileUrl = doc.filePath ? `${backendUrl}${doc.filePath}` : "";

  return (
    <div className="aspect-[4/5] w-full rounded-md border border-border bg-paper relative overflow-hidden flex flex-col">
      {/* Faux document chrome */}
      <div className="h-7 border-b border-border bg-muted/60 flex items-center px-3 gap-1.5 shrink-0">
        <span className="h-2 w-2 rounded-full bg-rust/60" />
        <span className="h-2 w-2 rounded-full bg-amber/70" />
        <span className="h-2 w-2 rounded-full bg-sage/70" />
        <span className="ml-3 text-[10px] uppercase tracking-wider text-muted-foreground truncate">
          {doc.filename}
        </span>
      </div>
      
      <div className="flex-1 relative bg-muted/20">
        {fileUrl ? (
          doc.kind === "image" ? (
            <img 
              src={fileUrl} 
              alt={doc.title} 
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <iframe 
              src={fileUrl} 
              title={doc.title}
              className="absolute inset-0 w-full h-full border-0 bg-white"
            />
          )
        ) : (
          <div className="absolute inset-0 pt-10 px-7 pb-6 flex flex-col paper-grain">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {doc.category}
            </div>
            <h4 className="mt-2 font-serif text-2xl leading-tight text-ink">{doc.title}</h4>
            <div className="mt-3 ink-divider" />
            <p className="mt-4 text-sm italic text-foreground/70 leading-relaxed line-clamp-6">
              “{doc.excerpt}”
            </p>
            <div className="mt-auto flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>MemoryVault • Indexed</span>
              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SourceChip({ docId, title }: { docId: string; title: string }) {
  return (
    <Link
      to="/vault"
      hash={docId}
      className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-[11px] text-foreground hover:bg-amber/20 transition"
    >
      <FileText className="h-3 w-3 text-amber" />
      {title}
    </Link>
  );
}
