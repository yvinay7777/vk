'use client';

export default function DashboardPanel({ resume, savedJobs = [] }) {
  return (
    <section className="glass-card rounded-[2rem] border border-orange-500/20 bg-slate-950/60 p-8 shadow-orangeGlow backdrop-blur-2xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Your Cockpit</p>
          <h3 className="mt-2 text-2xl font-bold text-white tracking-tight">Credentials Insights</h3>
        </div>
        <span className="rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-1.5 text-xs font-bold text-orange-300">
          {savedJobs.length} Saved Jobs
        </span>
      </div>

      {resume ? (
        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-200/60">Profile Score</p>
                <h4 className="mt-1 text-5xl font-black text-white">{resume.score || 0}</h4>
              </div>
              <div className="rounded-xl bg-orange-500/15 px-4 py-2 text-xs font-medium text-orange-200">
                {resume.fileName}
              </div>
            </div>
            
            <p className="mb-6 text-sm leading-relaxed text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-white/5">
              {resume.summary}
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-slate-950/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">Key Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(resume.skills || []).map((skill) => (
                    <span key={skill} className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-orange-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="rounded-xl border border-white/5 bg-slate-950/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">Education Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {(resume.education || []).map((item) => (
                    <span key={item} className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-semibold text-slate-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 flex flex-col">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-200/60 mb-4 border-b border-white/5 pb-2">
              Saved Jobs Snapshot
            </p>
            {savedJobs.length ? (
              <ul className="space-y-3 overflow-y-auto flex-1 max-h-[280px] pr-1 scrollbar-thin">
                {savedJobs.slice(0, 5).map((job) => (
                  <li key={job.id} className="rounded-xl border border-white/5 bg-slate-950/50 p-4 hover:border-orange-500/20 transition-all">
                    <p className="font-semibold text-sm text-white truncate">{job.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{job.company}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center rounded-xl bg-slate-950/30 border border-dashed border-white/5">
                <p className="text-xs text-slate-500">Save jobs to view snapshot telemetry.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/20 p-8 text-center text-slate-400 text-sm">
          Upload a resume in the scanner portal to unlock your telemetry insights cards.
        </div>
      )}
    </section>
  );
}