import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home({ user, jobs, statusMessage }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-12 py-6">
      
      {/* Landing Hero Section */}
      <section className="relative z-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-orange-400 shadow-sm shadow-orange-500/10 glow-text-orange">
            Combustion Core
          </span>
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.08] text-white tracking-tight sm:text-6xl">
            Ignite your career path with our <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-red-500 bg-clip-text text-transparent">AI Navigator</span>.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
            Scan your credentials, consult our conversational AI advisor, and explore active global job telemetry feeds using Supabase.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            {user ? (
              <Link href="/resume" className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3.5 text-sm font-semibold text-white shadow-glow hover:from-orange-400 hover:to-red-500 transition-all">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3.5 text-sm font-semibold text-white shadow-glow hover:from-orange-400 hover:to-red-500 transition-all">
                Sign In / Register
              </Link>
            )}
            <Link href="/jobs" className="rounded-full border border-orange-500/30 bg-orange-950/15 px-8 py-3.5 text-sm font-semibold text-orange-200 hover:bg-orange-950/30 hover:border-orange-400/50 transition-all hover:shadow-orangeGlow">
              Explore Job Feeds
            </Link>
          </div>
        </div>

        {/* Telemetry Indicator Display */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-orange-500/20 bg-slate-950/50 p-8 shadow-orangeGlow backdrop-blur-md">
          <div className="absolute -left-10 top-10 h-44 w-44 rounded-full bg-orange-600/10 blur-3xl" />
          <div className="absolute right-0 top-12 h-44 w-44 rounded-full bg-red-500/10 blur-3xl" />
          
          <div className="space-y-5 relative z-10">
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-inner">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-400">Core Telemetry</p>
              <h2 className="mt-2 text-xl font-bold text-white tracking-tight">Navigator status</h2>
              <p className="mt-2 text-sm text-slate-300">Thermal engine is running. Supabase synchronizers active.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Telemetry Feed</p>
                <p className="mt-2 text-3xl font-extrabold text-orange-400">{jobs.length}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Counselor</p>
                <p className="mt-2 text-3xl font-extrabold text-red-400">Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Navigation Cards Grid */}
      <section className="grid gap-6 md:grid-cols-3 pt-6">
        
        <div className="glass-card rounded-[2rem] border border-orange-500/20 p-6 flex flex-col justify-between">
          <div>
            <span className="text-3xl">📁</span>
            <h3 className="mt-4 text-xl font-bold text-white">Stellar Scanner</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Upload PDF/DOCX resumes. Map your qualifications score and skills immediately to Supabase.
            </p>
          </div>
          <Link href="/resume" className="mt-6 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-all inline-flex items-center gap-1.5">
            Open Scanner &rarr;
          </Link>
        </div>

        <div className="glass-card rounded-[2rem] border border-orange-500/20 p-6 flex flex-col justify-between">
          <div>
            <span className="text-3xl">💬</span>
            <h3 className="mt-4 text-xl font-bold text-white">AI Coach Chat</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Consult the AI Advisor in a multi-turn chat environment. Ask for resume feedback or application advice.
            </p>
          </div>
          <Link href="/assistant" className="mt-6 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-all inline-flex items-center gap-1.5">
            Initiate Conversation &rarr;
          </Link>
        </div>

        <div className="glass-card rounded-[2rem] border border-orange-500/20 p-6 flex flex-col justify-between">
          <div>
            <span className="text-3xl">⚡</span>
            <h3 className="mt-4 text-xl font-bold text-white">Market Telemetry</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Explore live global job feeds synchronized every 15 minutes. Save matches straight to your cockpit list.
            </p>
          </div>
          <Link href="/jobs" className="mt-6 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-all inline-flex items-center gap-1.5">
            Query Job Feeds &rarr;
          </Link>
        </div>

      </section>

      {/* Status Bar */}
      <div className="rounded-full bg-slate-950/80 px-6 py-3 border border-orange-500/5 text-center text-xs text-slate-400">
        System telemetry status: <span className="text-orange-300 font-semibold">{statusMessage}</span>
      </div>

    </div>
  );
}
