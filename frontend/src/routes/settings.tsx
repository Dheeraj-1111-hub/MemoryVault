import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MemoryVault" },
      { name: "description", content: "Profile, storage, and AI preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [model, setModel] = useState("Groq • llama-3.3-70b");
  const [temp, setTemp] = useState(0.3);
  const [autoTag, setAutoTag] = useState(true);
  const [extractDates, setExtractDates] = useState(true);

  const [stats, setStats] = useState({ documents: 0, screenshots: 0, storageMb: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch profile and settings
    fetchWithAuth('/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setName(data.profile.name);
          setEmail(data.profile.email);
          setModel(data.settings.model);
          setTemp(data.settings.temperature);
          setAutoTag(data.settings.autoTagUploads);
          setExtractDates(data.settings.extractDates);
        }
      })
      .catch(console.error);

    // Fetch stats
    fetchWithAuth('/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats({
            documents: data.stats.documents,
            screenshots: data.stats.screenshots,
            storageMb: data.stats.storageMb
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          settings: {
            model,
            temperature: temp,
            autoTagUploads: autoTag,
            extractDates
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Loading settings...</div>;
  }

  // Calculate storage usage based on a 500 MB limit
  const maxStorage = 500;
  const storagePercentage = Math.min(100, Math.round((stats.storageMb / maxStorage) * 100));

  return (
    <div className="px-6 md:px-12 lg:px-16 py-10 max-w-[900px] mx-auto">
      <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Settings
      </span>
      <h1 className="display text-5xl md:text-6xl mt-1">
        Make MemoryVault <em className="italic text-amber">yours</em>.
      </h1>

      <div className="mt-10 space-y-8">
        <Card title="Profile">
          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber"
            />
          </Field>
          <Field label="Email">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber"
            />
          </Field>
        </Card>

        <Card title="Storage">
          <div className="grid sm:grid-cols-3 gap-3">
            <Stat label="Documents" value={stats.documents.toLocaleString()} />
            <Stat label="Screenshots" value={stats.screenshots.toLocaleString()} />
            <Stat label="Storage" value={`${stats.storageMb} MB`} />
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Storage usage</span>
              <span className="text-foreground font-medium">{storagePercentage}% of {maxStorage} MB</span>
            </div>
            <div className="mt-1.5 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-amber rounded-full" style={{ width: `${storagePercentage}%` }} />
            </div>
          </div>
        </Card>

        <Card title="AI settings">
          <Field label="Model">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber"
            >
              <option>Groq • llama-3.3-70b</option>
              <option>Groq • mixtral-8x7b</option>
              <option>OpenAI • gpt-4o-mini</option>
              <option>Google • gemini-3-flash</option>
            </select>
          </Field>
          <Field label={`Temperature — ${temp.toFixed(1)}`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full accent-amber"
            />
          </Field>
          <Field label="Auto-tag uploads">
            <Toggle on={autoTag} onChange={setAutoTag} />
          </Field>
          <Field label="Extract dates into timeline">
            <Toggle on={extractDates} onChange={setExtractDates} />
          </Field>
        </Card>

        <div className="flex justify-end">
          <button
            onClick={saveChanges}
            disabled={saving}
            className="rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-foreground/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-2xl">{value}</div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-amber" : "bg-muted"}`}
      type="button"
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-background border border-border transition ${
          on ? "left-[1.4rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}
