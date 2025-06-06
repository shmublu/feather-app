// index.js
const { OpenAI } = require("openai");
const fs = require('fs');

// Instantiate the client; it will automatically read process.env.OPENAI_API_KEY
const client = new OpenAI({apiKey:apiKey});
