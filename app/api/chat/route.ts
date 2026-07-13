import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import connectDB from "@/lib/db";
import { Product, Settings } from "@/lib/models";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Define the tool for searching products
const searchProductsTool = {
  functionDeclarations: [
    {
      name: "searchProducts",
      description: "Search the database for products based on a query. Use this when the user asks about availability, details, or asks to find a product.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: {
            type: Type.STRING,
            description: "The search keyword (e.g., 'Siemens S7', 'marine pump', 'engine')",
          },
        },
        required: ["query"],
      },
    },
  ],
};

const SYSTEM_INSTRUCTION = `You are the official AI Customer Support Assistant for Corona Marine Parts.
Your goal is to help customers find marine spare parts, ship automation systems, engine room machinery, and marine electronics.
Always be polite, professional, and helpful. 
When a user asks for a product, ALWAYS use the 'searchProducts' tool to search the database.
When you find products using the tool, provide them to the user using markdown links in the format: [Product Title](/product/slug). Include a brief description and the price if available.
If no products are found in the database, politely inform the user that the item is not currently in our online inventory. As a fallback, ask them to provide their Company Name and Email Address so we can check our extended offline stock or source it for them, and assure them we will definitely get back to them with a quote.
Our business details:
- We are a leading global supplier of marine spare parts from Alang Shipyard.
- We ship worldwide.
- Contact email: sales@coronamarineparts.com
- All parts are certified and thoroughly tested before dispatch.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    await connectDB();
    
    // Check settings for preferred model
    const settings = await Settings.findOne();
    const modelName = settings?.geminiModel || "gemini-2.5-flash";

    // Format history for Gemini
    const contents = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    let response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [searchProductsTool],
        temperature: 0.7,
      }
    });

    // Handle tool call (Function Calling)
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      
      if (call.name === "searchProducts") {
        const args = call.args as any;
        const query = args?.query || "";
        
        console.log(`AI called searchProducts with query: "${query}"`);
        
        // Execute the database search
        let dbResults = [];
        if (query) {
          // Search in title, description, or keywords
          const regex = new RegExp(query, 'i');
          const products = await Product.find({
            $or: [
              { title: { $regex: regex } },
              { description: { $regex: regex } },
              { keywords: { $in: [regex] } }
            ]
          }).select('title slug price availability brandName').limit(5).lean();
          
          dbResults = products.map(p => ({
            title: p.title,
            slug: p.slug,
            price: p.price,
            availability: p.availability,
            brand: p.brandName || "Unknown"
          }));
        }

        // Add the tool call from the model to the contents
        contents.push({
          role: "model",
          parts: [{ functionCall: call }]
        });

        // Add the tool response from the system to the contents
        contents.push({
          role: "user",
          parts: [{
            functionResponse: {
              name: call.name,
              response: { results: dbResults }
            }
          }]
        });

        console.log("Database results returned to AI:", dbResults.length);

        // Call the model again with the tool response
        response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [searchProductsTool],
            temperature: 0.7,
          }
        });
      }
    }

    return NextResponse.json({
      role: "model",
      content: response.text || "I'm sorry, I couldn't generate a response."
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      error: "Failed to process chat message", 
      details: error.message 
    }, { status: 500 });
  }
}
