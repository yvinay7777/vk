import OpenAI from 'openai';

/**
 * Returns a configured OpenAI-compatible client.
 * Dynamically selects Gemini if GEMINI_API_KEY is present,
 * otherwise falls back to OpenAI if OPENAI_API_KEY is present.
 */
export function getAIClient() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const hasGemini = geminiKey && geminiKey.trim() !== '' && !geminiKey.includes('your_');

    const openaiKey = process.env.OPENAI_API_KEY;
    const hasOpenAI = openaiKey && openaiKey.trim() !== '' && !openaiKey.includes('your_');

    if (hasGemini) {
        return {
            client: new OpenAI({
                apiKey: geminiKey,
                dangerouslyAllowBrowser: false,
                baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
            }),
            model: 'gemini-2.5-flash',
            configured: true,
            provider: 'gemini'
        };
    } else if (hasOpenAI) {
        return {
            client: new OpenAI({
                apiKey: openaiKey,
                dangerouslyAllowBrowser: false
            }),
            model: 'gpt-4o-mini',
            configured: true,
            provider: 'openai'
        };
    }

    return {
        client: null,
        model: null,
        configured: false,
        provider: 'none'
    };
}
