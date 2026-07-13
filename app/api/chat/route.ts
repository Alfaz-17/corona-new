import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { GoogleGenAI, Type } from "@google/genai";
import connectDB from "@/lib/db";
import { Product, Settings, ChatRateLimit } from "@/lib/models";

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
    
    // Rate Limiting (Max 10 per day per IP)
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const today = new Date().toISOString().split("T")[0];
    
    const rateLimit = await ChatRateLimit.findOneAndUpdate(
      { ip, date: today },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    
    if (rateLimit.count > 10) {
      return NextResponse.json({ 
        role: "model",
        content: "I apologize, but you have reached the maximum number of daily messages (10). Please contact us directly at sales@coronamarineparts.com for further assistance, or try again tomorrow!"
      });
    }

    // --- INPUT SANITIZER (SECURITY / PROMPT INJECTION PROTECTION) ---
    const lastMessageRaw = messages[messages.length - 1].content;
    const lastMessage = lastMessageRaw.toLowerCase();
    
    // 1. Basic XSS / HTML sanitization
    if (lastMessage.includes("<script") || lastMessage.includes("</")) {
      return NextResponse.json({ role: "model", content: "Invalid characters detected in your message." });
    }

    // 2. Prompt Injection Detection
    const maliciousPatterns = [
      "ignore all previous",
      "ignore previous",
      "system prompt",
      "forget your instructions",
      "you are now",
      "jailbreak",
      "disregard"
    ];

    if (maliciousPatterns.some(pattern => lastMessage.includes(pattern))) {
      return NextResponse.json({ 
        role: "model", 
        content: "I am Corona Marine's AI Assistant and can only assist you with inquiries related to marine spare parts and our business." 
      });
    }
    // ----------------------------------------------------------------

    // --- INTENT ROUTING (COST OPTIMIZATION) ---
    
    // Words that indicate they are looking for a product (route to Gemini)
    const productKeywords = ["have", "stock", "price", "buy", "product", "part", "plc", "engine", "pump", "motor", "search", "looking", "need", "cost"];
    const isAskingForProduct = productKeywords.some(kw => lastMessage.includes(kw));

    if (!isAskingForProduct) {
      if (lastMessage.includes("email") || lastMessage.includes("contact") || lastMessage.includes("phone")) {
        return NextResponse.json({ role: "model", content: "You can reach our team directly at sales@coronamarineparts.com." });
      }
      if (lastMessage.includes("shipping") || lastMessage.includes("ship") || lastMessage.includes("delivery")) {
        return NextResponse.json({ role: "model", content: "We ship worldwide from Alang Shipyard. All parts are securely packaged, certified, and tested before dispatch." });
      }
      if (lastMessage.includes("location") || lastMessage.includes("where are you") || lastMessage.includes("address")) {
        return NextResponse.json({ role: "model", content: "We are based in Alang Shipyard, India, which allows us to source top-quality refurbished marine parts." });
      }
      if (lastMessage === "hi" || lastMessage === "hello" || lastMessage === "hey") {
        return NextResponse.json({ role: "model", content: "Hello! How can I help you today? You can ask me to search for specific marine spare parts or ask about our business." });
      }
    }
    // ------------------------------------------

    // Check settings for preferred model
    const settings = await Settings.findOne();
    const modelName = settings?.geminiModel || "gemini-2.5-flash";

    // Format history for Gemini. Gemini API requires the first message to be from a 'user'.
    // We remove any leading 'model' messages (like the initial greeting).
    const validMessages = [...messages];
    while (validMessages.length > 0 && validMessages[0].role !== "user") {
      validMessages.shift();
    }

    const contents = validMessages.map((msg: any) => ({
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
