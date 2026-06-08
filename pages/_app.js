import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { supabase, supabaseReady } from '../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ParticlesBackground from '../components/ParticlesBackground';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [statusMessage, setStatusMessage] = useState('Bridge ready. Systems operational.');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!supabaseReady) {
      setStatusMessage('Offline Demo Mode. Local storage simulation active.');
      // Load mock session from localStorage
      const mockSessionUser = localStorage.getItem('demo_user');
      if (mockSessionUser) {
        const parsedUser = JSON.parse(mockSessionUser);
        setUser(parsedUser);
        loadSavedJobs(parsedUser);
        loadLatestResume(parsedUser);
      }
    }
    refreshJobs();

    let subscription;
    if (supabaseReady) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          try {
            await supabase
              .from('profiles')
              .upsert({
                id: currentUser.id,
                email: currentUser.email,
                last_login: new Date().toISOString(),
              });
          } catch (profileErr) {
            console.error('Profile sync failed:', profileErr);
          }
          await loadSavedJobs(currentUser);
          await loadLatestResume(currentUser);
        } else {
          setResume(null);
          setSavedJobs([]);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    if (!supabaseReady) {
      const mockUser = { id: 'demo-user-id', email };
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setStatusMessage('Demo Mode: Account simulated locally.');
      router.push('/resume');
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    
    if (data?.session) {
      setStatusMessage('Secure account created.');
      router.push('/resume');
    } else {
      setStatusMessage('Account registered! A verification email has been sent. Please check your inbox and confirm your email before signing in.');
    }
  };

  const signIn = async (email, password) => {
    if (!supabaseReady) {
      const mockUser = { id: 'demo-user-id', email };
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setStatusMessage('Demo Mode: Connected via simulated credentials.');
      router.push('/resume');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setStatusMessage('Connected to control bridge.');
    router.push('/resume');
  };

  const googleSignIn = async () => {
    if (!supabaseReady) {
      const mockUser = { id: 'demo-user-id', email: 'astronaut@navigator.ai' };
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setStatusMessage('Demo Mode: Authenticated via Google simulation.');
      router.push('/resume');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      console.error('Google sign-in error:', error);
      setStatusMessage(`Google sign-in failed: ${error.message}`);
    } else {
      setStatusMessage('Redirecting to Google for authentication...');
    }
  };

  const logout = async () => {
    if (!supabaseReady) {
      localStorage.removeItem('demo_user');
      setUser(null);
      setResume(null);
      setSavedJobs([]);
      setRecommendations({});
      setStatusMessage('Demo Mode: Connection terminated.');
      router.push('/');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setResume(null);
    setSavedJobs([]);
    setRecommendations({});
    setStatusMessage('Connection terminated.');
    router.push('/');
  };

  const loadLatestResume = async (currentUser) => {
    if (!supabaseReady) {
      const localResume = localStorage.getItem(`demo_resume_${currentUser.id}`);
      if (localResume) {
        setResume(JSON.parse(localResume));
      }
      return;
    }
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('uploaded_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        setResume({
          id: data[0].id,
          userId: data[0].user_id,
          fileName: data[0].file_name,
          storagePath: data[0].storage_path,
          url: data[0].url,
          text: data[0].text,
          skills: data[0].skills,
          education: data[0].education,
          experience: data[0].experience,
          summary: data[0].summary,
          score: data[0].score,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSavedJobs = async (currentUser) => {
    if (!supabaseReady) {
      const localJobs = localStorage.getItem(`demo_saved_jobs_${currentUser.id}`);
      if (localJobs) {
        setSavedJobs(JSON.parse(localJobs));
      }
      return;
    }
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedJobs((data || []).map((job) => ({
        id: job.id,
        jobId: job.job_id,
        userId: job.user_id,
        title: job.title,
        company: job.company,
        url: job.url,
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const refreshJobs = async () => {
    setLoadingJobs(true);
    setStatusMessage('Polling stellar job feeds...');
    try {
      const response = await fetch('/api/fetch-jobs');
      const data = await response.json();
      const normalized = (data.jobs || []).map((job) => ({
        ...job,
        remoteId: `${job.source}-${job.id}`,
      }));
      setJobs(normalized);
      setStatusMessage('Feeds updated.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Failed to retrieve jobs.');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSaveJob = async (job) => {
    if (!user) {
      setStatusMessage('Sign in to save jobs.');
      router.push('/auth');
      return;
    }

    const jobId = `${job.source}-${job.id}`;
    if (!supabaseReady) {
      const key = `demo_saved_jobs_${user.id}`;
      const savedList = JSON.parse(localStorage.getItem(key) || '[]');
      if (savedList.some((j) => j.jobId === jobId)) {
        setStatusMessage('Job already saved.');
        return;
      }
      const newSavedJob = {
        id: `demo-job-${Date.now()}`,
        jobId,
        title: job.title,
        company: job.company,
        url: job.url,
      };
      const updatedList = [newSavedJob, ...savedList];
      localStorage.setItem(key, JSON.stringify(updatedList));
      setSavedJobs(updatedList);
      setStatusMessage('Demo Mode: Job saved locally.');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .insert([{
          user_id: user.id,
          job_id: jobId,
          title: job.title,
          company: job.company,
          url: job.url,
        }])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        setSavedJobs((prev) => [{
          id: data[0].id,
          jobId,
          title: job.title,
          company: job.company,
          url: job.url,
        }, ...prev]);
        setStatusMessage('Job saved.');
      }
    } catch (error) {
      console.error(error);
      setStatusMessage('Unable to save job.');
    }
  };

  const handleGenerateRecommendation = async (job) => {
    if (!resume) {
      setStatusMessage('Upload a resume first.');
      router.push('/resume');
      return;
    }
    const jobKey = `${job.source}-${job.id}`;
    try {
      setStatusMessage(`Analyzing signal sync with ${job.title}...`);
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resume.text || resume.summary,
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.description || '',
          skills: resume.skills || [],
        }),
      });
      const result = await response.json();
      setRecommendations((prev) => ({ ...prev, [jobKey]: { text: result.text || result.error || 'No recommendation.' } }));
      setStatusMessage('Recommendation generated.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Analysis failed.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-hero-gradient text-white flex flex-col">
      <ParticlesBackground />
      
      {/* Ambient fire glow gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(249,115,22,0.12),_transparent_40%),radial-gradient(circle_at_70%_80%,_rgba(239,68,68,0.08),_transparent_45%)]" />

      {/* Global Navigation Header */}
      <nav className="relative z-20 border-b border-orange-500/10 bg-slate-950/60 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent glow-text-orange">
              🔥 AI Resume Navigator
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/" className={`transition hover:text-orange-400 ${router.pathname === '/' ? 'text-orange-400' : 'text-slate-300'}`}>
              Home
            </Link>
            <Link href="/resume" className={`transition hover:text-orange-400 ${router.pathname === '/resume' ? 'text-orange-400' : 'text-slate-300'}`}>
              My Resume
            </Link>
            <Link href="/assistant" className={`transition hover:text-orange-400 ${router.pathname === '/assistant' ? 'text-orange-400' : 'text-slate-300'}`}>
              AI Coach
            </Link>
            <Link href="/jobs" className={`transition hover:text-orange-400 ${router.pathname === '/jobs' ? 'text-orange-400' : 'text-slate-300'}`}>
              Explore Jobs
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden lg:inline text-xs text-orange-200/60 bg-orange-500/5 border border-orange-500/20 rounded-full px-3 py-1">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="rounded-full bg-red-500/20 border border-red-500/30 px-4 py-1.5 text-xs text-red-200 transition hover:bg-red-500/35"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2 text-xs font-bold text-white shadow-glow hover:from-orange-400 hover:to-red-500 transition"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main content route */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <Component
          {...pageProps}
          user={user}
          resume={resume}
          setResume={setResume}
          jobs={jobs}
          savedJobs={savedJobs}
          recommendations={recommendations}
          statusMessage={statusMessage}
          setStatusMessage={setStatusMessage}
          loadingJobs={loadingJobs}
          signIn={signIn}
          signUp={signUp}
          onGoogleSignIn={googleSignIn}
          refreshJobs={refreshJobs}
          handleSaveJob={handleSaveJob}
          handleGenerateRecommendation={handleGenerateRecommendation}
          signOut={logout}
        />
      </main>

      {/* Mini Footer */}
      <footer className="relative z-10 py-6 border-t border-orange-500/5 text-center text-xs text-slate-500">
        AI Resume Navigator &copy; 2026. Thermal core operational.
      </footer>
    </div>
  );
}

export default MyApp;