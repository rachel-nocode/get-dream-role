import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/groq";
import { DEMO_RESULT } from "@/lib/demo-data";
import { ATS_OPTIONS } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { atsTarget, jobTitle, jobDescription, resumeText } = body;

    if (!atsTarget || !jobDescription || !resumeText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const targetOption = ATS_OPTIONS.find((o) => o.id === atsTarget);
    const targetName = targetOption?.name || "Generic ATS";

    // If no Groq API key, return demo data with the selected ATS target
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        ...DEMO_RESULT,
        atsTarget,
        targetName,
      });
    }

    const result = await analyzeResume(
      atsTarget,
      targetName,
      jobTitle || "",
      jobDescription,
      resumeText
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
