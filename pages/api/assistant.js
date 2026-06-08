import { getAIClient } from '../../lib/ai';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages = [], question, resumeText = '' } = req.body;

    const { client, model, configured, provider } = getAIClient();

    if (!configured) {
        const lastUserMsg = messages[messages.length - 1]?.content || question || '';
        const lowerMsg = lastUserMsg.toLowerCase();
        let mockReply = "Greetings! I am your cosmic career advisor. Since neither Gemini nor OpenAI API keys are configured in .env.local, I am operating in interstellar demo mode. How can I assist you with your career search?";
        if (lowerMsg.includes('resume') || lowerMsg.includes('improve') || lowerMsg.includes('feedback')) {
            mockReply = "🚀 [Demo Mode] Your resume coordinates look promising. To elevate your rating, consider highlighting modern frontend architectures (React/Next.js) or cloud orchestrations (AWS/Docker). Adjusting your transmission patterns will help align your profile with standard remote job nodes.";
        } else if (lowerMsg.includes('skill') || lowerMsg.includes('demand')) {
            mockReply = "✨ [Demo Mode] Current interstellar job streams are highly active for specialists in TypeScript, Next.js 14, Tailwind CSS, and database optimizations (Supabase/PostgreSQL). Ensure these tags are clearly readable in your scanner profile.";
        } else if (lowerMsg.includes('job') || lowerMsg.includes('search')) {
            mockReply = "🌌 [Demo Mode] Navigating the job boards requires careful alignment. Use the Job Explorer page to retrieve active live job nodes, check your matching score, and generate tailor-made alignment configurations.";
        }
        return res.status(200).json({ text: mockReply });
    }

    let apiMessages = [];
    const systemPrompt = `You are a cosmic career advisor for a resume navigator called AI Resume Navigator.
You help users with resume feedback, job search strategies, career coaching, and skill advice.
Keep your answers helpful, concise, encouraging, and themed around space/interstellar navigation.

Candidate's current Resume details:
${resumeText ? resumeText.slice(0, 2000) : 'No resume uploaded yet.'}`;

    apiMessages.push({ role: 'system', content: systemPrompt });

    if (messages.length > 0) {
        messages.forEach((msg) => {
            apiMessages.push({ role: msg.role, content: msg.content });
        });
    } else if (question) {
        apiMessages.push({ role: 'user', content: question });
    } else {
        return res.status(400).json({ error: 'Please provide messages or a question.' });
    }

    try {
        const response = await client.chat.completions.create({
            model: model,
            messages: apiMessages,
            max_tokens: 400,
        });

        const text = response.choices[0]?.message?.content?.trim() || 'No answer was generated.';
        return res.status(200).json({ text });
    } catch (error) {
        console.error(error);
        const providerName = provider === 'gemini' ? 'Gemini' : 'OpenAI';
        
        // Handle quota/rate limits specifically
        if (error.code === 'insufficient_quota' || (error.message && error.message.toLowerCase().includes('quota')) || error.status === 429) {
            const lastUserMsg = messages[messages.length - 1]?.content || question || '';
            const lowerMsg = lastUserMsg.toLowerCase();
            let mockReply = `Greetings! I am your cosmic career advisor. Operating in interstellar demo mode due to ${providerName} API key quota limits. How can I assist you with your career search?`;
            if (lowerMsg.includes('resume') || lowerMsg.includes('improve') || lowerMsg.includes('feedback')) {
                mockReply = "🚀 [Demo Mode] Your resume coordinates look promising. To elevate your rating, consider highlighting modern frontend architectures (React/Next.js) or cloud orchestrations (AWS/Docker). Adjusting your transmission patterns will help align your profile with standard remote job nodes.";
            } else if (lowerMsg.includes('skill') || lowerMsg.includes('demand')) {
                mockReply = "✨ [Demo Mode] Current interstellar job streams are highly active for specialists in TypeScript, Next.js 14, Tailwind CSS, and database optimizations (Supabase/PostgreSQL). Ensure these tags are clearly readable in your scanner profile.";
            } else if (lowerMsg.includes('job') || lowerMsg.includes('search')) {
                mockReply = "🌌 [Demo Mode] Navigating the job boards requires careful alignment. Use the Job Explorer page to retrieve active live job nodes, check your matching score, and generate tailor-made alignment configurations.";
            }
            return res.status(200).json({ text: `⚠️ ${providerName} API Quota Exceeded / Rate Limited. Falling back to Demo Advisor:\n\n${mockReply}` });
        }
        return res.status(500).json({ error: `AI assistant (${providerName}) failed to respond.` });
    }
}
