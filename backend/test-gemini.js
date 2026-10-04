const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // The SDK might not have a direct listModels exposed in the standard class, 
    // but we can fetch it directly via REST to be 100% sure.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error);
    } else {
      console.log("Available models:");
      data.models.forEach(m => console.log(` - ${m.name}`));
    }
  } catch (e) {
    console.error("Failed:", e);
  }
}

run();
