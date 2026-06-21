import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  Search, 
  FileSearch, 
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Layers
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
    <div className="min-h-screen bg-[#0A0A0A] text-foreground selection:bg-amber/30 selection:text-amber overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-blue-600/10 to-purple-600/20 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </div>
            <span className="font-serif text-xl tracking-tight font-medium text-white">MemoryVault</span>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-white/80 hover:text-white transition flex items-center gap-2 group"
              >
                Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white/60 hover:text-white transition">
                  Sign in
                </Link>
                <Link 
                  to="/register" 
                  className="relative group overflow-hidden rounded-full p-[1px]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full animate-[spin_3s_linear_infinite] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-black/90 px-5 py-2 rounded-full text-sm font-medium text-white transition-all group-hover:bg-black/70 backdrop-blur-md">
                    Get started
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-40 pb-32 px-6 relative">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 mb-8 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              MemoryVault 2.0 is now live
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl font-serif tracking-tighter leading-[1.05] text-white"
            >
              The AI brain for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500">
                your digital life.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Dump screenshots, PDFs, emails, and notes. Ask MemoryVault anything — and find what you need instantly by meaning, not just keywords.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to={user ? "/dashboard" : "/register"} 
                className="w-full sm:w-auto rounded-xl bg-white text-black px-8 py-4 text-base font-semibold transition-all hover:bg-gray-100 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                Start building your vault <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>

          {/* 3D Dashboard Teaser */}
          <motion.div 
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
            className="mt-24 max-w-6xl mx-auto relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl -z-10 rounded-full opacity-50" />
            <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl p-2 md:p-4 ring-1 ring-white/5 overflow-hidden">
              <div className="rounded-xl border border-white/5 bg-[#111] overflow-hidden flex flex-col">
                <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                  <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
                  <div className="ml-4 flex-1 h-7 rounded-md bg-black/50 border border-white/5 max-w-md flex items-center px-3 text-xs text-white/40 font-mono">
                    <Search className="h-3 w-3 mr-2" /> ask memoryvault anything...
                  </div>
                </div>
                <div className="p-8 aspect-[16/9] md:aspect-[21/9] flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#111] to-black">
                   <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                   
                   <motion.div 
                     animate={{ y: [0, -10, 0] }} 
                     transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                     className="relative z-10 text-center flex flex-col items-center"
                   >
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-xl">
                        <BrainCircuit className="h-10 w-10 text-amber-400" />
                      </div>
                      <div className="font-serif text-3xl text-white">Synthesizing intelligence...</div>
                      <div className="mt-3 flex items-center gap-2 text-white/40 text-sm font-mono bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        <span className="animate-pulse h-2 w-2 rounded-full bg-green-500" /> 14,021 parameters loaded
                      </div>
                   </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bento Box Features */}
        <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight">Everything you need,<br/><span className="text-white/50">in one intelligent vault.</span></h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Feature 1 - Large spanning 2 cols */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="md:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-10 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6 border border-amber-500/20">
                    <FileSearch className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-serif text-white mb-4">Semantic Search</h3>
                  <p className="text-lg text-white/50 max-w-md leading-relaxed">
                    Stop searching for file names. Search by concept, idea, or contents using natural language. Our vector embeddings understand exactly what you mean.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-10 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
                    <Layers className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-3">Auto-Categorization</h3>
                  <p className="text-white/50 leading-relaxed">
                    Upload anything. We automatically tag, sort, and categorize your documents into smart collections.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-10 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20">
                    <Zap className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-serif text-white mb-3">Deadlines</h3>
                  <p className="text-white/50 leading-relaxed">
                    AI scans your documents for dates and upcoming events, adding them to a unified timeline.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Feature 4 - Large spanning 2 cols */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-10 relative overflow-hidden group hover:border-white/20 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-6 border border-orange-500/20">
                    <BrainCircuit className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-serif text-white mb-4">Interactive Memory</h3>
                  <p className="text-lg text-white/50 max-w-md leading-relaxed">
                    Chat with your entire vault at once. Ask complex questions spanning dozens of documents and receive precise answers with exact source citations.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-32 px-6 relative border-t border-white/5 bg-black/50">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[200px] bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-serif text-white tracking-tight mb-8">Ready to remember<br/>everything?</h2>
            <Link 
              to={user ? "/dashboard" : "/register"} 
              className="inline-flex rounded-xl bg-white text-black px-10 py-5 text-lg font-semibold transition-all hover:bg-gray-100 hover:scale-105 active:scale-95 items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              Create your free vault <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-sm text-white/40 bg-black relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
             <Sparkles className="h-4 w-4 text-white/60" />
          </div>
          <span className="font-serif font-medium text-white/80 text-lg">MemoryVault</span>
        </div>
        <p>© {new Date().getFullYear()} MemoryVault. Built for the Digital Heroes Project.</p>
      </footer>
    </div>
  );
}
