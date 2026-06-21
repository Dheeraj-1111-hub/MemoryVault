import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { fetchWithAuth } from "../lib/api";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FileText,
  Image as ImageIcon,
  Mail,
  CalendarClock,
  Home,
  FolderOpen,
  MessageSquare,
  Star,
  Search,
} from "lucide-react";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      // Fetch recent docs and deadlines for the palette
      fetchWithAuth("/search")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setDocs(data.results.slice(0, 20)); // Keep it light
          }
        })
        .catch(console.error);

      fetchWithAuth("/dashboard")
        .then(res => res.json())
        .then(data => {
          if (data.deadlines) {
            setDeadlines(data.deadlines);
          }
        })
        .catch(console.error);
    }
  }, [open]);

  const go = (to: string) => {
    onOpenChange(false);
    setTimeout(() => navigate({ to }), 0);
  };

  const goDoc = (id: string) => {
    onOpenChange(false);
    setTimeout(() => navigate({ to: "/vault", hash: id }), 0);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search documents, deadlines, companies…" />
      <CommandList>
        <CommandEmpty>No results in your vault.</CommandEmpty>
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}>
            <Home className="h-4 w-4" /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/vault")}>
            <FolderOpen className="h-4 w-4" /> Vault
          </CommandItem>
          <CommandItem onSelect={() => go("/ask")}>
            <MessageSquare className="h-4 w-4" /> Ask Memory
          </CommandItem>
          <CommandItem onSelect={() => go("/timeline")}>
            <CalendarClock className="h-4 w-4" /> Timeline
          </CommandItem>
          <CommandItem onSelect={() => go("/important")}>
            <Star className="h-4 w-4" /> Important
          </CommandItem>
          <CommandItem onSelect={() => go("/search")}>
            <Search className="h-4 w-4" /> Smart Search
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Documents">
          {docs.map((d) => {
            const Icon = d.kind === "image" ? ImageIcon : d.kind === "email" ? Mail : FileText;
            const keywords = `${d.title} ${(d.tags || []).join(" ")} ${(d.companies || []).join(" ")}`;
            return (
              <CommandItem key={d._id} onSelect={() => goDoc(d._id)} value={keywords}>
                <Icon className="h-4 w-4 text-amber" />
                <span>{d.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{d.documentType}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Deadlines">
          {deadlines.map((d) => (
            <CommandItem key={d.id} onSelect={() => go("/timeline")}>
              <CalendarClock className="h-4 w-4 text-amber" />
              <span>{d.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{d.in}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
