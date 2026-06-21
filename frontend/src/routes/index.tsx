import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  Search, 
  FileSearch, 
  ShieldCheck 
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MemoryVault — Your second brain for documents" },
      { name: "description", content: "ChatGPT + Drive + Search for everything you'd otherwise forget." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-amber/30 selection:text-amber">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-ink text-paper flex items-center justify-center">
              <Sparkles className="h-4 w-4" strokeWidth={1.6} />
            </div>
            <span className="font-serif text-xl tracking-tight">MemoryVault</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-amber hover:text-amber/80 transition flex items-center gap-1"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-paper transition-all hover:bg-foreground hover:scale-105"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-amber/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mt-12 md:mt-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/5 px-3 py-1 text-xs font-medium text-amber mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Introducing the smartest vault for your files</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-serif tracking-tight leading-[1.1] text-foreground"
          >
            Your second brain,<br />
            <span className="italic text-muted-foreground">powered by AI.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Dump screenshots, PDFs, emails, and notes. Ask MemoryVault anything — and find what you need instantly, not just by keyword, but by meaning.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to={user ? "/dashboard" : "/register"} 
              className="w-full sm:w-auto rounded-full bg-ink px-8 py-3.5 text-base font-medium text-paper transition-all hover:bg-foreground hover:shadow-lg hover:shadow-foreground/10 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Start building your vault <ArrowRight className="h-4 w-4" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto rounded-full border border-border bg-background px-8 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-muted"
            >
              How it works
            </a>
          </motion.div>
        </div>

        {/* Floating Mockup Teaser */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-20 max-w-5xl mx-auto relative z-10"
        >
          <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl p-4 md:p-6 ring-1 ring-white/5">
            <div className="rounded-xl border border-border/50 bg-background/80 overflow-hidden">
              <div className="h-12 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <div className="ml-4 flex-1 h-6 rounded-md bg-background/50 border border-border/50 max-w-md flex items-center px-3 text-xs text-muted-foreground font-mono">
                  <Search className="h-3 w-3 mr-2" /> ask memoryvault anything...
                </div>
              </div>
              <div className="p-8 aspect-[21/9] flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber/5 via-background to-background" />
                 <div className="relative z-10 text-center">
                    <BrainCircuit className="h-16 w-16 text-amber/40 mx-auto mb-4" />
                    <div className="font-serif text-2xl text-muted-foreground">Synthesizing intelligence...</div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div id="features" className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: FileSearch,
              title: "Cognitive Search",
              description: "Forget file names. Search for concepts, ideas, and contents using natural language. We use advanced vector embeddings to find exactly what you mean.",
            },
            {
              icon: BrainCircuit,
              title: "Automated Intelligence",
              description: "Every file you upload is automatically analyzed. We extract entities, summarize contents, and flag upcoming deadlines without you lifting a finger.",
            },
            {
              icon: ShieldCheck,
              title: "Interactive Memory",
              description: "Chat with your vault. Ask complex questions spanning dozens of documents and get precise answers with exact source citations.",
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-2xl border border-border/50 bg-card/30 p-8 hover:bg-card/60 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-amber/10 flex items-center justify-center text-amber mb-6">
                <feature.icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-6 w-6 rounded border border-border bg-muted flex items-center justify-center">
             <Sparkles className="h-3 w-3 text-foreground" />
          </div>
          <span className="font-serif font-medium text-foreground">MemoryVault</span>
        </div>
        <p>© {new Date().getFullYear()} MemoryVault. Built for the Digital Heroes Project.</p>
      </footer>
    </div>
  );
}
