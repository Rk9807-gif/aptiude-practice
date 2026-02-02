import { GoogleGenAI } from "@google/genai";

const askGemini = new GoogleGenAI({
    apiKey : process.env.GEMINI_PUBLISH_API_KEY
});

export default askGemini;