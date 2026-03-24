import { NextRequest, NextResponse } from "next/server";
import { analyzeProductImage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const categories = formData.get("categories") ? JSON.parse(formData.get("categories") as string) : [];

    const buffer = Buffer.from(await image.arrayBuffer());
    const analysis = await analyzeProductImage(buffer, image.type, categories);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("AI Analysis Error Detail:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to analyze image",
      detail: error.stack || "No stack trace",
      env: process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING"
    }, { status: 500 });
  }
}
