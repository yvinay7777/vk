export default async function handler(req, res) {
    let remotiveJobs = [];
    let remoteOKJobs = [];

    // Fetch Remotive jobs
    try {
        const remotiveResponse = await fetch('https://remotive.io/api/remote-jobs?limit=50');
        if (remotiveResponse.ok) {
            const remotive = await remotiveResponse.json();
            remotiveJobs = (remotive.jobs || []).map((job) => ({
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
        } else {
            console.warn(`Remotive API responded with status: ${remotiveResponse.status}`);
        }
    } catch (err) {
        console.error('Failed to fetch Remotive jobs:', err);
    }

    // Fetch RemoteOK jobs (frequently blocked by Cloudflare)
    try {
        const remoteOKResponse = await fetch('https://remoteok.com/api', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (remoteOKResponse.ok) {
            const contentType = remoteOKResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const remoteOK = await remoteOKResponse.json();
                remoteOKJobs = (Array.isArray(remoteOK) ? remoteOK.slice(1) : []).map((job) => ({
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
            } else {
                console.warn('RemoteOK API returned non-JSON response (possibly Cloudflare protection).');
            }
        } else {
            console.warn(`RemoteOK API responded with status: ${remoteOKResponse.status}`);
        }
    } catch (err) {
        console.error('Failed to fetch RemoteOK jobs:', err);
    }

    return res.status(200).json({ jobs: [...remotiveJobs, ...remoteOKJobs] });
}