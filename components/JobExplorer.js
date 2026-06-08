'use client';
import { useMemo, useState } from 'react';

const NOTEWORTHY_SKILLS = ['JavaScript', 'React', 'Next.js', 'Node.js', 'Firebase', 'CSS', 'HTML', 'GraphQL', 'SQL', 'Python', 'AWS', 'Docker', 'Kubernetes'];

function normalize(value) {
  return value?.toString().toLowerCase() || '';
}

function collectJobSkills(job) {
  const tagSet = new Set((job.tags?.map((tag) => tag.toString().trim()).filter(Boolean)) || []);
  const description = normalize(job.description);
  NOTEWORTHY_SKILLS.forEach((skill) => {
    if (description.includes(skill.toLowerCase())) {
      tagSet.add(skill);
    }
  });
  return Array.from(tagSet).slice(0, 8);
}

function computeMatch(resume, job) {
  const resumeSkills = new Set((resume?.skills || []).map((skill) => normalize(skill)));
  const jobSkills = collectJobSkills(job).map((skill) => normalize(skill));
  const shared = jobSkills.filter((skill) => resumeSkills.has(skill));
  const score = jobSkills.length ? Math.round((shared.length / jobSkills.length) * 100) : 45;
  const label = score >= 70 ? 'High Match' : score >= 45 ? 'Medium Match' : 'Low Match';
  const missingSkills = jobSkills.filter((skill) => !resumeSkills.has(skill));
  return { score, label, missingSkills, jobSkills };
}

export default function JobExplorer({ user, jobs, resume, savedJobs = [], onSaveJob, onGenerateRecommendation, recommendations = {}, onRefresh }) {
  const [keyword, setKeyword] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(true);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const text = `${job.title} ${job.company}`.toLowerCase();
        const query = keyword.trim().toLowerCase();
        return (!query || text.includes(query)) && (!remoteOnly || text.includes('remote'));
      })
      .slice(0, 16);
  }, [jobs, keyword, remoteOnly]);

  return (
    <section className="glass-card rounded-[2rem] border border-orange-500/20 bg-slate-950/60 p-8 shadow-orangeGlow backdrop-blur-2xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Available Nodes</p>
          <h3 className="mt-2 text-2xl font-bold text-white tracking-tight">Active Opportunities</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={onRefresh} className="rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-2 text-xs font-semibold text-orange-300 transition hover:bg-orange-500/20">
            Refresh Feeds
          </button>
          <span className="rounded-full bg-slate-900/60 border border-white/5 px-4 py-2 text-xs text-slate-300">{jobs.length} jobs found</span>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-orange-400/80"
          placeholder="Search by keyword, title or company"
        />
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={() => setRemoteOnly((prev) => !prev)}
            className="h-4 w-4 rounded border-orange-500/30 text-orange-500 bg-slate-900 focus:ring-0"
          />
          Remote only
        </label>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-slate-400 text-sm">
          No jobs found matching these filters.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredJobs.map((job) => {
            const { score, label, missingSkills, jobSkills } = computeMatch(resume, job);
            const saved = savedJobs.includes(`${job.source}-${job.id}`);
            const recommendation = recommendations?.[`${job.source}-${job.id}`];

            return (
              <article key={`${job.source}-${job.id}`} className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 shadow-sm hover:border-orange-500/20 transition hover:-translate-y-0.5 hover:bg-slate-900/60 flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400/80">{job.source}</p>
                      <h4 className="mt-1 text-lg font-bold text-white leading-snug">{job.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{job.company} · {job.location}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      label === 'High Match' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
                      label === 'Medium Match' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' :
                      'bg-slate-800 text-slate-300'
                    }`}>{label}</span>
                  </div>
                  
                  <p className="mb-4 max-h-24 overflow-hidden text-sm leading-relaxed text-slate-300 bg-slate-950/20 p-3 rounded-lg border border-white/5">{job.description || 'No description available.'}</p>
                  
                  <div className="mb-4 flex flex-wrap gap-1">
                    {jobSkills.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] text-slate-400">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="mb-4 rounded-xl bg-orange-500/5 border border-orange-500/10 p-4 text-xs text-slate-300">
                    <p className="font-bold text-orange-300">Sync Score: {score}%</p>
                    <p className="mt-1 text-slate-400">Missing: {missingSkills.slice(0, 5).join(', ') || 'None'}</p>
                  </div>
                  
                  {recommendation?.text && (
                    <div className="mb-4 rounded-xl bg-orange-500/10 border border-orange-500/20 p-4 text-xs text-orange-200">
                      <p className="font-bold">AI suggestions</p>
                      <p className="mt-1 whitespace-pre-line leading-relaxed">{recommendation.text}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-4 border-t border-white/5 pt-4">
                  {!recommendation?.text && (
                    <button
                      onClick={() => onGenerateRecommendation(job)}
                      className="w-full mb-2 rounded-full bg-orange-500/15 border border-orange-500/30 px-4 py-2 text-xs font-semibold text-orange-300 transition hover:bg-orange-500/25"
                    >
                      Generate suggestions
                    </button>
                  )}
                  
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center rounded-full bg-slate-950 border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:border-orange-500/30 hover:text-orange-200"
                  >
                    View Node
                  </a>
                  
                  <button
                    onClick={() => onSaveJob(job)}
                    className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      saved
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-glow hover:from-orange-400 hover:to-red-500'
                    }`}
                  >
                    {saved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
