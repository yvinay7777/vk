import ResumeUploader from '../components/ResumeUploader';
import JobExplorer from '../components/JobExplorer';

export default function ResumePage({ 
  user, 
  resume, 
  setResume, 
  jobs, 
  savedJobs, 
  handleSaveJob, 
  handleGenerateRecommendation, 
  recommendations, 
  refreshJobs 
}) {
  return (
    <div className="space-y-10 py-6">
      
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">Command Control</p>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">Credential Operations</h2>
        <p className="text-slate-300 text-sm mt-1">Upload your credentials and explore matching jobs in real-time.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-6">
          <ResumeUploader user={user} onResumeSaved={setResume} />
        </div>
        <div>
          <JobExplorer
            user={user}
            jobs={jobs}
            resume={resume}
            savedJobs={savedJobs}
            onSaveJob={handleSaveJob}
            onGenerateRecommendation={handleGenerateRecommendation}
            recommendations={recommendations}
            onRefresh={refreshJobs}
          />
        </div>
      </div>

    </div>
  );
}
