const express = require('express');
const path = require('path');
const Groq = require('groq-sdk');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🎯 YAHAN HAI TUMHARI NEW VALID KEY:
// Line 12 aur 14 ko badal kar bilkul aisa likho:
const MY_GROQ_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: MY_GROQ_KEY });
// Exact Live Date Time Function
const getLiveDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
};

// Chat Route
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const currentLiveTime = getLiveDateTime();
        
        // System prompt details merged directly for live clock behavior
        const fullPrompt = `[Context: Current India Time & Date is ${currentLiveTime}. You are Akki Bot. You have real-time capabilities to provide news, time, and updates. Use this context if the user asks for current info.]\nUser: ${message}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'user', content: fullPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
        });

        const botReply = chatCompletion.choices[0].message.content;
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Engine Error:", error.message);
        
        if (error.message.includes('401') || error.message.includes('API Key')) {
            res.json({ reply: "⚠️ Groq API Key me abhi bhi issue hai. Console se check karein." });
        } else {
            res.status(500).json({ reply: "Groq Engine response error." });
        }
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Akki Bot with Real-Time Context active on http://localhost:${PORT}`);
});