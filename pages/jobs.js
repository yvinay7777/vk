import JobExplorer from '../components/JobExplorer';

export default function JobsPage({ 
  user, 
  jobs, 
  resume, 
  savedJobs, 
  handleSaveJob, 
  handleGenerateRecommendation, 
  recommendations, 
  refreshJobs 
}) {
  return (
    <div className="space-y-8 py-6">
      
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Thermal Telemetry</p>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">Active Career Opportunities</h2>
        <p className="text-slate-300 text-sm mt-1">
          Explore job nodes matching your professional signatures across remote databases.
        </p>
      </div>

      <JobExplorer
        user={user}
        jobs={jobs}
        resume={resume}
        savedJobs={savedJobs.map((job) => job.jobId)}
        onSaveJob={handleSaveJob}
        onGenerateRecommendation={handleGenerateRecommendation}
        recommendations={recommendations}
        onRefresh={refreshJobs}
      />

    </div>
  );
}
