import { GoogleGenAI } from "@google/genai";
import connectDB from "./db";
import { Settings } from "./models";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

async function getGeminiContext() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables.");
  }
  await connectDB();
  const settings = await Settings.findOne();
  return settings?.geminiModel || "gemini-2.5-flash";
}

function formatGeminiError(error: any, modelName: string): Error {
  console.error("Gemini API detailed error:", error);
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
  return new Error(errorMessage);
}

export async function analyzeProductImage(imageBuffer: Buffer, mimeType: string, categories: string[] = []) {
  const modelName = await getGeminiContext();

  const categoriesPrompt = categories.length > 0
    ? `Pick the most appropriate category from this list: ${categories.join(", ")}. If none fit perfectly, pick the closest one.`
    : `Suggest the most appropriate category name for this product (e.g., Marine Engines, Boat Parts, Safety Equipment, etc.)`;

  const prompt = `
    Analyze this marine product image and suggest SEO-ready product details for an e-commerce listing.
    Follow these guidelines carefully — NEVER invent model numbers, SKUs, or part numbers that are not clearly visible on the product label/image (leave them empty string "" if uncertain):
    1. title: Clear, natural product heading (H1), e.g., "[Brand] [Product Name] [Model if visible]".
    2. primaryKeyword: The single clearest search phrase a marine buyer would search (e.g., "marine fuel injection pump").
    3. keywords: 5-8 relevant secondary & application keywords (e.g., brand + part, vessel application).
    4. slug: Short, clean lowercase hyphenated URL slug based on the primary keyword/product name (e.g., "siemens-plc-s7-1200").
    5. metaTitle: Concise 50-60 character SEO title with brand/model and primary keyword.
    6. metaDescription: Natural 140-160 character summary encouraging buyer enquiries.
    7. imageAlt: Descriptive accessibility & image-SEO alt text (under 125 chars) describing what is shown.
    8. description: Original, useful technical description (minimum 250-300 words) covering overview, marine applications, inspection/testing, and compatibility notes.
    9. brand: Manufacturer name if identifiable, otherwise "".
    10. modelNumber: Model/type visible on nameplate, otherwise "".
    11. sku: Part number visible on nameplate, otherwise "".
    12. specifications: Key-value object of visible or standard technical specifications (e.g., Application, Voltage, Condition).

    Return valid JSON in this exact format:
    {
      "title": "Product Heading",
      "primaryKeyword": "primary search term",
      "metaTitle": "50-60 char SEO title",
      "metaDescription": "140-160 char meta description",
      "imageAlt": "Descriptive product image alt text",
      "slug": "url-friendly-slug",
      "description": "Detailed technical product description",
      "categoryName": "${categoriesPrompt}",
      "brand": "Brand Name or empty string",
      "modelNumber": "Visible model or empty string",
      "sku": "Visible part number or empty string",
      "specifications": { "Key": "Value" },
      "keywords": ["kw1", "kw2"]
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
    throw formatGeminiError(error, modelName);
  }
}

export interface ProductSeoSuggestionInput {
  title: string;
  brandName?: string;
  modelNumber?: string;
  sku?: string;
  categoryName?: string;
  primaryKeyword?: string;
  description?: string;
  specifications?: Record<string, any>;
}

export async function generateProductSeoSuggestions(input: ProductSeoSuggestionInput) {
  const modelName = await getGeminiContext();

  const prompt = `
    You are an SEO specialist for Corona Marine Parts (marine spare parts & ship automation supplier from Alang Shipyard, India).
    Based strictly on the verified product facts below, generate clean, natural, non-spammy SEO metadata.
    Do NOT invent unverified part numbers, ratings, or certifications not present in the facts.

    Verified Product Facts:
    - Product Title: ${input.title}
    - Brand: ${input.brandName || "Not specified"}
    - Model Number: ${input.modelNumber || "Not specified"}
    - SKU: ${input.sku || "Not specified"}
    - Category: ${input.categoryName || "Marine Spare Parts"}
    - Existing Primary Keyword: ${input.primaryKeyword || "Not set"}
    - Specifications: ${JSON.stringify(input.specifications || {})}
    - Current Description: ${input.description || "None"}

    Requirements:
    1. primaryKeyword: 1 clear buyer search phrase (lowercase, 2-5 words). Keep existing if strong.
    2. keywords: 5-7 relevant secondary keywords (brand + product, model + part, vessel application, category).
    3. slug: Clean lowercase hyphenated URL slug (max 65 chars).
    4. metaTitle: 45-60 characters, readable, natural, includes primary keyword + brand/model if available.
    5. metaDescription: 135-160 characters, clear buyer summary + enquiry call-to-action.
    6. imageAlt: Descriptive image alt text (40-120 chars), no keyword stuffing.
    7. description: If current description is under 150 words, write a well-structured 200-300 word original technical product description based ONLY on the facts above; if current description is already 150+ words, return "".

    Return valid JSON:
    {
      "primaryKeyword": "...",
      "keywords": ["..."],
      "slug": "...",
      "metaTitle": "...",
      "metaDescription": "...",
      "imageAlt": "...",
      "description": "..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ text: prompt }],
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
    throw formatGeminiError(error, modelName);
  }
}
