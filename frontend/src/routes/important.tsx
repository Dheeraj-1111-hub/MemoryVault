import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DocCard } from "@/components/doc-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DocPreview } from "@/components/doc-card";
import { ShieldCheck, GraduationCap, Briefcase, Wallet, AlertTriangle, FileWarning } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

export const Route = createFileRoute("/important")({
  head: () => ({
    meta: [
      { title: "Important — MemoryVault" },
      { name: "description", content: "The documents you can never lose." },
    ],
  }),
  component: ImportantPage,
});

const sectionMeta = {
  identity: { title: "Identity", icon: ShieldCheck },
  education: { title: "Education", icon: GraduationCap },
  placement: { title: "Placements", icon: Briefcase },
  finance: { title: "Finance", icon: Wallet },
};

function ImportantPage() {
  const [openDoc, setOpenDoc] = useState<any | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/important")
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 border-2 border-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { sections, missing, alerts } = data || {};

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 max-w-[1280px] mx-auto">
      <div>
        <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Important
        </span>
        <h1 className="display text-5xl md:text-6xl mt-1">
          Documents you can never <em className="italic text-amber">lose</em>.
        </h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          MemoryVault watches what's missing, outdated, or critical — and keeps your most
          important documents within one tap.
        </p>
      </div>

      {/* Intelligence Banner */}
      {(missing?.length > 0 || alerts?.length > 0) && (
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {missing?.length > 0 && (
            <div className="rounded-xl border border-rust/30 bg-rust/5 p-5">
              <div className="flex items-center gap-2 text-rust font-medium mb-3">
                <FileWarning className="h-4 w-4" />
                Missing Documents
              </div>
              <ul className="space-y-2">
                {missing.slice(0, 5).map((m: string, i: number) => (
                  <li key={i} className="text-sm text-foreground flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-rust" />
                    {m}
                  </li>
                ))}
                {missing.length > 5 && (
                  <li className="text-sm text-muted-foreground pl-3">+ {missing.length - 5} more</li>
                )}
              </ul>
            </div>
          )}
          
          {alerts?.length > 0 && (
            <div className="rounded-xl border border-amber/30 bg-amber/5 p-5">
              <div className="flex items-center gap-2 text-amber font-medium mb-3">
                <AlertTriangle className="h-4 w-4" />
                Action Required
              </div>
              <ul className="space-y-2">
                {alerts.map((a: string, i: number) => (
                  <li key={i} className="text-sm text-foreground flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 space-y-12">
        {["identity", "education", "placement", "finance"].map((key) => {
          const sectionData = sections[key];
          if (!sectionData) return null;
          
          const meta = sectionMeta[key as keyof typeof sectionMeta];
          const Icon = meta.icon;
          const items = sectionData.docs || [];
          const health = sectionData.health || 0;

          return (
            <section key={key}>
              <div className="flex items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-amber/15 text-amber flex items-center justify-center">
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {items.length} documents
                    </div>
                    <h2 className="font-serif text-3xl leading-none">{meta.title}</h2>
                  </div>
                </div>
                <div className="min-w-[120px] md:min-w-[200px]">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Completeness</span>
                    <span className="text-foreground font-medium">{health}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        health >= 90 ? "bg-sage" : health >= 50 ? "bg-amber" : "bg-rust"
                      }`}
                      style={{ width: `${health}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.length === 0 && (
                  <div className="col-span-full rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground text-center">
                    No {meta.title.toLowerCase()} documents found.
                  </div>
                )}
                {items.map((d: any) => (
                  <DocCard key={d.id} doc={d} onClick={() => setOpenDoc(d)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Sheet open={!!openDoc} onOpenChange={(o) => !o && setOpenDoc(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {openDoc && (
            <>
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">{openDoc.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <DocPreview doc={openDoc} />
                <p className="text-sm text-muted-foreground">{openDoc.summary}</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
