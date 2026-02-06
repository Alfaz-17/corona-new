import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeProductImage(imageBuffer: Buffer, mimeType: string, categories: string[] = []) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const categoriesPrompt = categories.length > 0 
    ? `Pick the most appropriate category from this list: ${categories.join(", ")}. If none fit perfectly, pick the closest one.`
    : `Suggest the most appropriate category name for this product (e.g., Marine Engines, Boat Parts, Safety Equipment, etc.)`;

  const prompt = `
    Analyze this product image and provide details for an e-commerce listing.
    Return the information in the following JSON format:
    {
      "title": "A short, descriptive product name",
      "description": "A professional product description (approx. 2-3 lines)",
      "price": 0, // Suggest a reasonable price if possible, otherwise 0
      "categoryName": "${categoriesPrompt}"
    }
    Only return the JSON object, nothing else.
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();
  
  try {
    // Extract JSON from the response text (handling potential markdown formatting)
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to analyze image correctly.");
  }
}
