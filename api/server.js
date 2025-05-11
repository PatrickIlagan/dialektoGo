require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// ✅ CORS for your frontend
const corsOptions = {
  origin: 'https://pwa---dialektogo.web.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Serve static files from root (one level up from /api)
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'home.html'));
});

// ✅ Initialize Groq SDK
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Handle chat POST requests
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a friendly and helpful Tagalog assistant. The user is a foreigner in the Philippines learning Tagalog. Assist them by translating English to Tagalog, answering questions, or providing phrases they might need in various situations (e.g., asking for directions, ordering food, etc.). Your responses should be natural, conversational, and not overly formal. Include the pronunciation of each phrase or word."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      model: "llama3-8b-8192",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false
    });

    const fullReply = chatCompletion.choices[0].message.content;
    res.json({ reply: fullReply });

  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ error: 'Groq API request failed' });
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
