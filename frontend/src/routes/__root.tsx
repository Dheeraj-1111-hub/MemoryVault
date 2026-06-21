import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
// 
import { Sidebar } from "../components/sidebar";
import { CommandPalette, useCommandPalette } from "../components/command-palette";
import { Toaster } from "../components/ui/sonner";

function Shell({ children }: { children: ReactNode }) {
  const { open, setOpen } = useCommandPalette();
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar onOpenCommand={() => setOpen(true)} />
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      <CommandPalette open={open} onOpenChange={setOpen} />
      <Toaster />
    </div>
  );
}

function NotFoundComponent() {
  return (
    <Shell>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-7xl text-foreground">404</h1>
          <h2 className="mt-3 text-lg font-medium text-foreground">Not in your vault</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This page doesn't exist. Try searching or head back to your dashboard.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MemoryVault — Your second brain for documents" },
      {
        name: "description",
        content:
          "Dump screenshots, PDFs, emails. Ask MemoryVault anything — and find it instantly.",
      },
      { property: "og:title", content: "MemoryVault" },
      {
        property: "og:description",
        content: "ChatGPT + Drive + Search for everything you'd otherwise forget.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

import { AuthProvider, useAuth } from '../contexts/AuthContext';

function AppContent() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const isAuthRoute = router.state.location.pathname === '/login' || router.state.location.pathname === '/register';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse h-12 w-12 rounded-xl bg-ink/10 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-t-ink border-r-transparent border-b-ink border-l-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user && !isAuthRoute) {
    window.location.href = '/login';
    return null;
  }

  if (user && isAuthRoute) {
    window.location.href = '/';
    return null;
  }

  return isAuthRoute ? <Outlet /> : <Shell><Outlet /></Shell>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
