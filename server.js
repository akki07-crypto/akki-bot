const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve Static Frontend Files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Built-in Dynamic MCP Tool for Real-time Data
const mcpTools = {
  "get_current_time": () => {
    return new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  },
  "get_current_date": () => {
    return new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full' 
    });
  }
};

// API Endpoint for Chat Router
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message ? req.body.message.toLowerCase() : "";

  // MCP Routing Logic: Detect tool trigger keywords
  if (userMessage.includes('time') || userMessage.includes('samay') || userMessage.includes('waqt')) {
    const timeResponse = mcpTools.get_current_time();
    return res.json({ reply: `Akki Bhai, abhi time ho raha hai: ${timeResponse} 🕒` });
  }
  
  if (userMessage.includes('date') || userMessage.includes('tarikh') || userMessage.includes('din')) {
    const dateResponse = mcpTools.get_current_date();
    return res.json({ reply: `Akki Bhai, aaj ki date hai: ${dateResponse} 📅` });
  }

  // Fallback to Groq API Cloud Model if no local tool matches
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are Akki Bot, a super cool friendly AI buddy created by Akki. Keep replies short and interesting." },
          { role: "user", content: req.body.message }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    if (data && data.choices && data.choices[0]) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.json({ reply: "Groq se clean response nahi mila, check env variables! 🐻" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Backend pipeline connection error! 🐻" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MCP Gateway Active on Port ${PORT}`));
