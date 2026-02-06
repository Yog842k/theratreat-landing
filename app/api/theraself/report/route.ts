import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

async function resolveModel(ai: GoogleGenAI, preferred?: string) {
  if (preferred) return preferred;
  const pager = await ai.models.list();
  let first: string | undefined;
  for await (const model of pager) {
    const name = model?.name?.trim();
    if (!name) continue;
    if (!first) first = name;
    if (model?.supportedActions?.includes("generateContent")) {
      return name;
    }
  }
  return first || "";
}

export async function POST(req: Request) {
  let childName: string | undefined;
  try {
    // 1. Parse Request Body
    const body = await req.json();
    const {
      childName: parsedChildName,
      ageYears,
      testTitle,
      displayScores,
      heuristics,
    } = body || {};
    childName = parsedChildName;

    // 2. Construct the Prompt (Plain text instructions enforced)
    const prompt = `
      You are a pediatric neurodevelopment assistant. Generate a non-diagnostic parent-friendly report for an ADHD (ages 2-6) screening.
      
      CONTEXT:
      Child: ${childName || "(unknown)"}, Age: ${ageYears ?? "(unknown)"}
      Test: ${testTitle || "TheraSelf ADHD (2-6)"}
      Scores: Inattention=${displayScores?.inattention}, Hyperactivity=${displayScores?.hyperactivity}, Impulsivity=${displayScores?.impulsivity}, Overall=${displayScores?.overall}.
      Heuristics: frequentCount=${heuristics?.frequentCount}, durationMonths=${heuristics?.durationMonths}, multiSetting=${heuristics?.multiSetting}, functionalImpairment=${heuristics?.functionalImpairment}, impulsivityMax=${heuristics?.impulsivityMax}.

      INSTRUCTIONS:
      Write a response with these 4 sections:
      1) Summary (one paragraph).
      2) Component insights with short tips per flagged domain.
      3) Routing guidance (low/moderate/high thresholds).
      4) Next steps (bullet points).

      FORMATTING RULES:
      - Keep language supportive and clear.
      - Do NOT use bold (**), italics (*), or any markdown symbols.
      - Return strictly plain text.
    `;

    const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const apiVersion = (process.env.GEMINI_API_VERSION || "").trim();

    // 3. Initialize Google Gemini SDK (new @google/genai)
    const ai = new GoogleGenAI({
      apiKey,
      ...(apiVersion ? { apiVersion } : {}),
    });

    const envModel = (process.env.GEMINI_MODEL || "").trim();
    const modelsToTry = [envModel, "gemini-2.0-flash-001", "gemini-2.0-flash", "gemini-1.5-flash"].filter(
      (model, index, self) => !!model && self.indexOf(model) === index
    );

    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        const text =
          (response as any)?.text ??
          (response as any)?.candidates?.[0]?.content?.parts
            ?.map((part: any) => (typeof part?.text === "string" ? part.text : ""))
            .join("") ??
          "";
        if (!text.trim()) {
          throw new Error("Gemini returned empty text.");
        }
        return NextResponse.json({ ok: true, report: text, model });
      } catch (err: any) {
        lastError = err;
      }
    }

    const resolvedModel = await resolveModel(ai);
    if (!resolvedModel) {
      throw lastError || new Error("No available Gemini models found.");
    }

    const response = await ai.models.generateContent({
      model: resolvedModel,
      contents: prompt,
    });
    const text =
      (response as any)?.text ??
      (response as any)?.candidates?.[0]?.content?.parts
        ?.map((part: any) => (typeof part?.text === "string" ? part.text : ""))
        .join("") ??
      "";
    if (!text.trim()) {
      throw new Error("Gemini returned empty text.");
    }
    return NextResponse.json({ ok: true, report: text, model: resolvedModel });
  } catch (error: any) {
    console.error("[theraself/report] AI Generation Error:", error);

    // 6. Error Response (Expose reason for debugging)
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "AI report generation failed.",
      },
      { status: 500 }
    );
  }
}

// Friendly GET handler for browser testing
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "TheraSelf Report API is active. Send a POST request to generate reports.",
  });
}

