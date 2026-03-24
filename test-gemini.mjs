import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Say 'API is working' if you see this.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (error) {
    console.error("Test Failed:", error);
  }
}

run();
