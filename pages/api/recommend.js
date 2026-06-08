import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { resumeText, jobTitle, company, jobDescription, skills = [] } = req.body;

    const apiKey = process.env.OPENAI_API_KEY;
    const isOAIConfigured = apiKey && apiKey.trim() !== '' && !apiKey.includes('your_');

    if (!isOAIConfigured) {
        const matchScore = (skills.includes('React') || skills.includes('JavaScript') || skills.includes('Next.js')) ? 'High' : 'Medium';
        const text = `1. Match Classification: ${matchScore} Match\n2. Missing Skills: AWS, Docker, CI/CD pipelines\n3. Improvement Suggestion: Tailor your summary section to explicitly mention experience with server-side rendering and scalable state management to align perfectly with ${company}'s ${jobTitle} requirements.`;
        return res.status(200).json({ text });
    }


    if (!resumeText || !jobTitle || !company || !jobDescription) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const prompt = `You are a career advisor helping a candidate improve a resume for a job opportunity.

Resume skills: ${skills.join(', ') || 'Not available'}
Job title: ${jobTitle}
Company: ${company}
Job description: ${jobDescription}

Provide:
1. One-line match score classification: High, Medium, or Low.
2. A short list of missing skills or qualifications.
3. One improvement suggestion for the resume.

Return the response in simple JSON-like text.`;

        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 220,
        });

        const text = response.choices[0]?.message?.content || '';
        return res.status(200).json({ text });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'AI recommendation generation failed' });
    }
}
