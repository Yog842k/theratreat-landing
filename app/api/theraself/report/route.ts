import { NextResponse } from "next/server";

// Prefer official SDK if available; fallback to HTTP fetch.
export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
    if (!key) return NextResponse.json({ error: "Missing GEMINI_API_KEY (or GEMINI_KEY)" }, { status: 500 });

    const body = await req.json();
    const {
      childName,
      ageYears,
      testTitle,
      displayScores, // { inattention, hyperactivity, impulsivity, overall }
      heuristics, // { frequentCount, durationMonths, multiSetting, functionalImpairment, impulsivityMax }
    } = body || {};

    const prompt = `You are a pediatric neurodevelopment assistant. Generate a non-diagnostic parent-friendly report for an ADHD (ages 2–6) screening using TheraScore components (0–10 each) and overall (0–30).\n\nChild: ${childName || "(unknown)"}, Age: ${ageYears ?? "(unknown)"}\nTest: ${testTitle || "TheraSelf ADHD (2–6)"}\nScores: Inattention=${displayScores?.inattention}, Hyperactivity=${displayScores?.hyperactivity}, Impulsivity=${displayScores?.impulsivity}, Overall=${displayScores?.overall}.\nHeuristics: frequent>=2/3 count=${heuristics?.frequentCount}, durationMonths=${heuristics?.durationMonths}, multiSetting=${heuristics?.multiSetting}, functionalImpairment=${heuristics?.functionalImpairment}, impulsivityMax=${heuristics?.impulsivityMax}.\n\nWrite: \n1) Summary (one paragraph).\n2) Component insights with short tips per flagged domain (>=4 elevated, >=7 high).\n3) Routing guidance (low/moderate/high thresholds as provided), note safety if impulsivityMax=3.\n4) Next steps in bullet points (home strategies, OT/psych, formal assessment as relevant).\nKeep language supportive and clear; avoid labeling as diagnosis. give plain text and no * or any other sign symbols for bold or italic or any stylish test, return simple text`;

    // Try SDK first
    try {
      // Dynamic import to avoid bundling issues if not installed
      const { GoogleGenAI } = await import("@google/genai").catch(() => ({ GoogleGenAI: null as any }));
      if (GoogleGenAI) {
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        } as any);
        const text = (response as any)?.text || (response as any)?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return NextResponse.json({ ok: true, report: text });
      }
    } catch {}

    // Fallback to HTTP fetch (v1beta compatible)
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    const res = await fetch(`${url}?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] },
        ],
        generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `Gemini error ${res.status}: ${errText}` }, { status: 500 });
    }
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("\n");
    return NextResponse.json({ ok: true, report: text || "" });
  } catch (err: any) {
    console.error("[theraself/report][POST]", err?.message || err);
    const safeText = "Your screening suggests mild symptoms. Consider home strategies, routine, and consistent positive reinforcement. If concerns persist across settings or impact daily functioning, consult a pediatric therapist for a formal evaluation.";
    return NextResponse.json({ ok: false, report: safeText });
  }
}

// Friendly GET handler so visiting the route in browser doesn't 405
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Use POST with JSON: { childName, ageYears, testTitle, displayScores, heuristics } to generate a report.",
    example: {
      childName: "Ayaan",
      ageYears: 5,
      testTitle: "ADHD Early Childhood",
      displayScores: { inattention: 4.2, hyperactivity: 3.8, impulsivity: 2.5, overall: 10.5 },
      heuristics: { frequentCount: 7, durationMonths: 6, multiSetting: true, functionalImpairment: false, impulsivityMax: 3 }
    }
  });
}