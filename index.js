const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from a .env file

const app = express();
const port = process.env.PORT || 3010;

// Dynamic CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Development origin
  'https://7862ai.netlify.app', // Production origin
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed for this origin'));
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// Import the Google Generative AI library
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Generative AI client using an environment variable for the API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.get('/', async (req, res) => {
  try {
    const prompt = req.query.prompt || 'Explain how AI works';

    // Await the result from the AI model
    const result = await model.generateContent(prompt);

    // Ensure the response structure is handled correctly
    const responseText =
      result?.response?.text() || 'No response text available';

    console.log(`Prompt: ${prompt}`);
    console.log(`Response: ${responseText}`);

    res.status(200).json({ text: responseText });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Error generating content. Please try again.' });
  }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
