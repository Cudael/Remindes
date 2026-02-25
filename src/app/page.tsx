import Link from "next/link";
import { Sparkles, ArrowRight, Shield, Clock, BellRing } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-teal-500/30 text-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Remindes</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/sign-in" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-slate-200 hover:shadow-lg hover:shadow-white/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Hero */}
      <main className="relative flex flex-col items-center justify-center overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Background Effects */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
          }}
          aria-hidden="true"
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-300 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>Your Intelligent Personal Vault</span>
            </div>
          </div>
          
          <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl animate-in slide-in-from-bottom-6 fade-in duration-700 delay-150">
            Never miss an <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              important date
            </span> again.
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl animate-in slide-in-from-bottom-6 fade-in duration-700 delay-300">
            Organize your subscriptions, track expiring documents, and keep your life&apos;s paperwork in one secure, beautifully designed workspace.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in slide-in-from-bottom-6 fade-in duration-700 delay-500">
            <Link
              href="/dashboard"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-slate-900 transition-all hover:bg-slate-100 hover:shadow-xl hover:shadow-white/20 hover:-translate-y-0.5 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:-translate-y-0.5 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Explore Features
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="relative z-10 mx-auto mt-20 w-full max-w-6xl px-6 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-700">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-2 backdrop-blur-2xl shadow-2xl shadow-teal-500/10">
            <div className="rounded-xl border border-white/5 bg-slate-950 overflow-hidden relative">
               {/* Browser dots */}
               <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-3 border-b border-white/5">
                 <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                 <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                 <div className="h-3 w-3 rounded-full bg-teal-500/80" />
               </div>
               {/* Mock UI Content */}
               <div className="p-6 grid grid-cols-12 gap-6 opacity-80">
                 {/* Sidebar mock */}
                 <div className="col-span-3 hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                   <div className="h-8 w-3/4 rounded-lg bg-white/5" />
                   <div className="h-4 w-1/2 rounded bg-white/5 mt-4" />
                   <div className="h-4 w-2/3 rounded bg-white/5" />
                   <div className="h-4 w-1/2 rounded bg-white/5" />
                 </div>
                 {/* Main content mock */}
                 <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                   <div className="flex justify-between items-center">
                     <div className="h-8 w-48 rounded-lg bg-white/10" />
                     <div className="h-10 w-32 rounded-xl bg-teal-500/20" />
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                     <div className="h-32 rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex flex-col justify-between">
                       <div className="h-8 w-8 rounded-full bg-teal-500/20" />
                       <div className="h-6 w-16 rounded bg-white/10" />
                     </div>
                     <div className="h-32 rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex flex-col justify-between">
                       <div className="h-8 w-8 rounded-full bg-amber-500/20" />
                       <div className="h-6 w-16 rounded bg-white/10" />
                     </div>
                     <div className="h-32 rounded-2xl bg-slate-800/50 border border-white/5 p-4 flex flex-col justify-between">
                       <div className="h-8 w-8 rounded-full bg-rose-500/20" />
                       <div className="h-6 w-16 rounded bg-white/10" />
                     </div>
                   </div>
                   <div className="h-48 rounded-2xl bg-slate-800/30 border border-white/5 mt-4" />
                 </div>
               </div>
               
               {/* Shine effect */}
               <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section id="features" className="relative z-10 border-t border-white/5 bg-slate-950 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to stay organized</h2>
            <p className="mt-4 text-lg text-slate-400">
              Powerful features designed to give you peace of mind and complete control over your personal documents and subscriptions.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Smart Reminders",
                description: "Get notified before your passports, IDs, or subscriptions expire. Never pay a late fee again.",
                icon: BellRing,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20"
              },
              {
                title: "Document Vault",
                description: "Securely store copies of your important documents alongside their expiration dates.",
                icon: Shield,
                color: "text-teal-400",
                bg: "bg-teal-500/10",
                border: "border-teal-500/20"
              },
              {
                title: "Subscription Tracking",
                description: "Keep a bird's eye view on all your recurring costs and upcoming renewal dates.",
                icon: Clock,
                color: "text-rose-400",
                bg: "bg-rose-500/10",
                border: "border-rose-500/20"
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-slate-900/50 p-8 transition-colors hover:bg-slate-900/80">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feature.bg} ${feature.border}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Remindes. All rights reserved.</p>
      </footer>
    </div>
  );
}
