'use client';
import { useState } from 'react';
import { supabase, supabaseReady } from '../lib/supabase';

const SKILLS = ['JavaScript', 'React', 'Next.js', 'Node.js', 'Firebase', 'CSS', 'Tailwind', 'AWS', 'Python', 'SQL', 'NoSQL', 'Git', 'TypeScript', 'UI/UX', 'Leadership', 'Product'];

function simplifyText(content) {
  return content.replace(/\s+/g, ' ').trim();
}

function extractResumeData(text) {
  const normalized = text.replace(/\r/g, ' ');
  const skills = SKILLS.filter((skill) => new RegExp(`\\b${skill}\\b`, 'i').test(normalized));
  const educationMatches = normalized.match(/(Bachelor|Master|MBA|PhD|University|College|Institute|High School)/gi) || [];
  const experienceSlice = normalized.slice(0, 260);
  const experience = experienceSlice.split(/\.|\n/).slice(0, 2).join('. ').trim();
  const summary = normalized.slice(0, 320);
  const score = Math.min(100, 45 + skills.length * 10 + (educationMatches.length ? 15 : 0) + (experience ? 10 : 0));

  return {
    skills: [...new Set(skills)],
    education: educationMatches.length ? educationMatches.slice(0, 3) : ['Professional experience'],
    experience: experience || 'Experienced candidate ready for remote roles.',
    summary: summary || 'Resume parsed and ready for recommendations.',
    score,
  };
}

export default function ResumeUploader({ user, onResumeSaved }) {
  const [uploadMessage, setUploadMessage] = useState('Upload a resume to analyze your professional profile.');
  const [uploading, setUploading] = useState(false);

  const parsePdf = async (buffer) => {
    const pdfjsLib = await import('pdfjs-dist/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(' ') + ' ';
    }
    return simplifyText(text);
  };

  const parseDocx = async (buffer) => {
    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    return simplifyText(result.value.replace(/<[^>]+>/g, ' '));
  };

  const analyzeFile = async (file) => {
    const buffer = await file.arrayBuffer();
    if (file.name.toLowerCase().endsWith('.pdf')) {
      return parsePdf(buffer);
    }
    if (file.name.toLowerCase().endsWith('.docx')) {
      return parseDocx(buffer);
    }
    if (file.name.toLowerCase().endsWith('.doc')) {
      return 'This file was uploaded successfully, but DOC parsing is not supported in this MVP. Use PDF or DOCX for full analysis.';
    }
    return simplifyText(new TextDecoder().decode(buffer));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!user) {
      setUploadMessage('Please sign in to upload a resume.');
      return;
    }
    if (!supabaseReady) {
      setUploading(true);
      setUploadMessage('Scanning resume data nodes (Local Simulation)...');
      try {
        const text = await analyzeFile(file);
        const parsed = extractResumeData(text);
        const resumeId = `demo-resume-${Date.now()}`;
        const resumeData = {
          id: resumeId,
          userId: user.id,
          fileName: file.name,
          storagePath: 'local',
          url: '#',
          text: text.slice(0, 2500),
          skills: parsed.skills,
          education: parsed.education,
          experience: parsed.experience,
          summary: parsed.summary,
          score: parsed.score,
        };
        localStorage.setItem(`demo_resume_${user.id}`, JSON.stringify(resumeData));
        onResumeSaved(resumeData);
        setUploadMessage('Scan complete. Credentials added to configuration dashboard (Local Simulation).');
      } catch (error) {
        console.error(error);
        setUploadMessage('Demo Mode scan failed.');
      } finally {
        setUploading(false);
      }
      return;
    }

    setUploading(true);
    setUploadMessage('Scanning resume data nodes...');
    try {
      const text = await analyzeFile(file);
      const parsed = extractResumeData(text);
      const resumeId = `${user.id}-${Date.now()}`;
      const storagePath = `${user.id}/${resumeId}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(storagePath);

      const resumeData = {
        id: resumeId,
        user_id: user.id,
        file_name: file.name,
        storage_path: storagePath,
        url: publicUrl,
        text: text.slice(0, 2500),
        skills: parsed.skills,
        education: parsed.education,
        experience: parsed.experience,
        summary: parsed.summary,
        score: parsed.score,
      };

      const { error: dbError } = await supabase
        .from('resumes')
        .insert([resumeData]);

      if (dbError) throw dbError;

      onResumeSaved({
        id: resumeId,
        userId: user.id,
        fileName: file.name,
        storagePath,
        url: publicUrl,
        text: resumeData.text,
        skills: parsed.skills,
        education: parsed.education,
        experience: parsed.experience,
        summary: parsed.summary,
        score: parsed.score,
      });

      setUploadMessage('Scan complete. Credentials added to configuration dashboard.');
    } catch (error) {
      console.error(error);
      setUploadMessage('Upload failed. Ensure resumes bucket exists in Supabase.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="glass-card rounded-[2rem] border border-orange-500/20 bg-slate-950/60 p-8 shadow-orangeGlow backdrop-blur-2xl">
      <div className="mb-6">
        <span className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-300">
          Thermal Scanner
        </span>
        <h3 className="mt-3 text-2xl font-bold text-white tracking-tight">Upload Profile Credentials</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Upload your resume in PDF or DOCX format to map your experience to remote roles.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="rounded-2xl border border-dashed border-orange-500/30 bg-orange-950/10 p-6 text-center">
          <p className="text-sm font-medium text-orange-200/90">{uploadMessage}</p>
        </div>
        
        <div className="flex justify-center">
          <label className="relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-8 py-3.5 text-sm font-semibold text-white shadow-glow hover:from-orange-400 hover:to-red-500 transition-all">
            <input 
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden" 
            />
            {uploading ? 'Processing Signal...' : 'Initiate Scan'}
          </label>
        </div>
      </div>
    </section>
  );
}