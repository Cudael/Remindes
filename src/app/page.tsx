import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-6">
      {/* Ambient Background Grid (Matches Dashboard) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />
      
      {/* Glowing Orb for Depth */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" 
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Logo Icon */}
        <div className="mb-8 flex items-center justify-center animate-in fade-in zoom-in duration-700">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-2xl shadow-teal-500/20 ring-1 ring-white/10">
            <Sparkles className="h-10 w-10 text-white" aria-hidden="true" />
          </div>
        </div>
        
        {/* Typography Hierarchy */}
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150">
          Welcome to <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
            Remindes
          </span>
        </h1>
        
        <p className="mb-10 text-lg leading-relaxed text-slate-400 sm:text-xl animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
          Your intelligent personal vault. Organize your subscriptions, track expiring documents, and never miss an important date again.
        </p>
        
        {/* Call to Action */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500">
          <Link
            href="/dashboard"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-slate-900 transition-all hover:bg-slate-100 hover:shadow-xl hover:shadow-white/10 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
