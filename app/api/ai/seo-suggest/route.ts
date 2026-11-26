import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateProductSeoSuggestions } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body?.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "Product title is required to generate SEO suggestions" }, { status: 400 });
    }

    const suggestions = await generateProductSeoSuggestions({
      title: body.title.trim(),
      brandName: body.brandName,
      modelNumber: body.modelNumber,
      sku: body.sku,
      categoryName: body.categoryName,
      primaryKeyword: body.primaryKeyword,
      description: body.description,
      specifications: body.specifications,
    });



    
    return NextResponse.json(suggestions);
  } catch (error: any) {
    console.error("AI SEO Suggest Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate SEO suggestions" },
      { status: 500 }
    );
  }
}
