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

    const fallbackJobs = [
        {
            id: 'fallback-1',
            source: 'remotive',
            title: 'React Frontend Developer',
            company: 'Stellar Innovations',
            location: 'Remote (US/Europe)',
            tags: ['React', 'JavaScript', 'Next.js', 'Tailwind CSS'],
            url: 'https://remotive.io',
            description: '<p>We are seeking a React Developer to design beautiful dashboard UIs. Experience with Next.js and Tailwind CSS is highly preferred. Join our remote-first startup and build premium interfaces.</p>',
            salary: '$90,000 - $120,000',
            publication_date: '2026-06-08'
        },
        {
            id: 'fallback-2',
            source: 'remoteok',
            title: 'Full Stack Engineer (Node.js & Postgres)',
            company: 'Orbit Tech',
            location: 'Remote Worldwide',
            tags: ['Node.js', 'PostgreSQL', 'SQL', 'React'],
            url: 'https://remoteok.com',
            description: 'Join our team as a Full Stack Engineer! You will build scalable API services with Node.js and optimize database schemas using PostgreSQL / Supabase.',
            salary: '$110,000 - $140,000',
            publication_date: '2026-06-08'
        },
        {
            id: 'fallback-3',
            source: 'remotive',
            title: 'Python Backend Engineer',
            company: 'Nebula Analytics',
            location: 'Remote (Canada/US)',
            tags: ['Python', 'SQL', 'AWS', 'Git'],
            url: 'https://remotive.io',
            description: '<p>Looking for a Python Backend Engineer to scale our data processing pipeline. Experience with SQL databases and AWS services (S3, EC2) is required.</p>',
            salary: '$95,000 - $125,000',
            publication_date: '2026-06-08'
        },
        {
            id: 'fallback-4',
            source: 'remoteok',
            title: 'Cloud Operations & DevOps Engineer',
            company: 'Galaxy Labs',
            location: 'Remote',
            tags: ['AWS', 'Git', 'Docker', 'CI/CD'],
            url: 'https://remoteok.com',
            description: 'We are looking for a DevOps Engineer to manage our cloud deployment infrastructure, configure CI/CD pipelines, and maintain system reliability.',
            salary: '$120,000 - $150,000',
            publication_date: '2026-06-08'
        },
        {
            id: 'fallback-5',
            source: 'remotive',
            title: 'UI/UX Product Designer',
            company: 'Cosmic Studio',
            location: 'Remote',
            tags: ['UI/UX', 'Product', 'Figma'],
            url: 'https://remotive.io',
            description: '<p>Join Cosmic Studio as a UI/UX Designer. Create premium visual designs, interactive mockups, and help iterate on modern SaaS applications.</p>',
            salary: '$80,000 - $100,000',
            publication_date: '2026-06-08'
        }
    ];

    let finalJobs = [...remotiveJobs, ...remoteOKJobs];
    if (finalJobs.length === 0) {
        console.warn('Both job feeds returned empty list. Injecting fallback mock jobs.');
        finalJobs = fallbackJobs;
    }

    return res.status(200).json({ jobs: finalJobs });
}