export default async function handler(req, res) {
    try {
        const remotive = await fetch('https://remotive.io/api/remote-jobs?limit=50').then((r) => r.json());
        const remoteOK = await fetch('https://remoteok.com/api').then((r) => r.json());

        const remotiveJobs = (remotive.jobs || []).map((job) => ({
            id: job.id,
            source: 'remotive',
            title: job.title,
            company: job.company_name,
            location: job.candidate_required_location || 'Remote',
            tags: job.tags || [],
            url: job.url,
            description: job.description,
            salary: job.salary,
            publication_date: job.publication_date,
        }));

        const remoteOKJobs = (Array.isArray(remoteOK) ? remoteOK.slice(1) : []).map((job) => ({
            id: job.id || job.slug || `${job.position}-${job.company}`,
            source: 'remoteok',
            title: job.position,
            company: job.company,
            location: job.location || 'Remote',
            tags: Array.isArray(job.tags) ?
                job.tags :
                typeof job.tags === 'string' ?
                job.tags.split(',') :
                [],
            url: job.url || job.url_original || job.link,
            description: job.description || job.description_plain || '',
            salary: job.salary || '',
            publication_date: job.date || job.posted_at,
        }));

        return res.status(200).json({ jobs: [...remotiveJobs, ...remoteOKJobs] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unable to fetch remote jobs' });
    }
}