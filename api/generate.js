// api/generate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 지원합니다.' });
    }

    const { prompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "Vercel 환경변수(GEMINI_API_KEY)가 없습니다." });
    }

    try {
        // Gemini API를 이용한 한/영 번역 (gemini-2.5-flash-lite 적용)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents:[{
                    parts:[{ text: `Translate the following Korean text to English. Output only the English translation without any extra words: ${prompt}` }]
                }]
            })
        });

        const geminiData = await geminiResponse.json();
        
        if (!geminiResponse.ok) {
            throw new Error(geminiData.error?.message || "Gemini 번역 실패");
        }

        // 번역된 텍스트 추출
        const translatedPrompt = geminiData.candidates[0].content.parts[0].text.trim();

        res.status(200).json({ translatedPrompt });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
