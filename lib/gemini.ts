import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeProductImage(imageBuffer: Buffer, mimeType: string, categories: string[] = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Gemini API Key check:", apiKey ? `Present (length: ${apiKey.length})` : "Missing");
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }

  // Using gemini-1.5-flash as it's often more available on free tiers, with 2.0 as primary
  const modelName = "gemini-1.5-flash"; 
  const model = genAI.getGenerativeModel({ model: modelName });

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
    Only return the JSON object, nothing else.
  `;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: mimeType
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response text (handling potential markdown formatting)
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error: any) {
    console.error("Gemini API detailed error:", error);
    
    // Better user-facing error message
    let errorMessage = "AI Analysis failed.";
    if (error.status === 429 || error.message?.includes("429")) {
      errorMessage = "AI limit reached. Please wait a minute or fill details manually.";
    } else if (error.status === 404 || error.message?.includes("404")) {
      errorMessage = "AI model currently unavailable. Please try again later.";
    } else if (error.message?.includes("API key")) {
      errorMessage = "Invalid Gemini API key. Please check your .env file.";
    }
    
    throw new Error(errorMessage);
  }
}
