import { GoogleGenAI } from "@google/genai";
import connectDB from "./db";
import { Settings } from "./models";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function analyzeProductImage(imageBuffer: Buffer, mimeType: string, categories: string[] = []) {
  console.log("Gemini API Key check:", apiKey ? `Present (length: ${apiKey.length})` : "Missing");
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }

  await connectDB();
  const settings = await Settings.findOne();
  const modelName = settings?.geminiModel || "gemini-2.5-flash";
  console.log(`Using Gemini Model: ${modelName} via @google/genai SDK`);

  const categoriesPrompt = categories.length > 0 
    ? `Pick the most appropriate category from this list: ${categories.join(", ")}. If none fit perfectly, pick the closest one.`
    : `Suggest the most appropriate category name for this product (e.g., Marine Engines, Boat Parts, Safety Equipment, etc.)`;

  const prompt = `
    Analyze this product image and provide details for an e-commerce listing.
    Return the information in the following JSON format:
    {
      "title": "A short, descriptive product name",
      "description": "A professional product description (approx. 2-3 lines)",
      "categoryName": "${categoriesPrompt}"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        { text: prompt },
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: mimeType
          }
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API detailed error:", error);
    
    // Better user-facing error message
    let errorMessage = "AI Analysis failed.";
    if (error.status === 429 || error.message?.includes("429")) {
      errorMessage = "AI limit reached. Please wait a minute or fill details manually.";
    } else if (error.status === 404 || error.message?.includes("404")) {
      errorMessage = "AI model currently unavailable. Please try again later.";
    } else if (error.status === 403 || error.message?.includes("403")) {
      errorMessage = `Access Denied: Your API key does not have access to the model '${modelName}'. Please switch models in settings.`;
    } else if (error.message?.includes("API key")) {
      errorMessage = "Invalid Gemini API key. Please check your .env file.";
    }
    
    throw new Error(errorMessage);
  }
}
