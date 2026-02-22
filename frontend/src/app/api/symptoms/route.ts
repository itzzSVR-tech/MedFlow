import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are an AI Care Assistant for MedFlow, a professional healthcare platform.
  Your goal is to assess symptoms described by patients and provide guidance.

  Guidelines:
  1. Be professional, empathetic, and clinical.
  2. Ask follow-up questions if symptoms are vague.
  3. Categorize the potential urgency (Low, Medium, High).
  4. provide suggestions (e.g., General Practitioner, Specialist, Emergency).
  5. ALWAYS include a disclaimer that this is not a diagnostic service.
  6. If the user mentions extreme symptoms (chest pain, stroke signs, severe bleeding), urge them to CALL EMERGENCY SERVICES IMMEDIATELY.
  7. Keep responses concise and structured.`,
});

export async function POST(req: NextRequest) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
        return NextResponse.json(
            {
                error: "Gemini API key is not configured. Please add GOOGLE_GEMINI_API_KEY to your environment variables.",
            },
            { status: 500 },
        );
    }

    try {
        const { messages } = await req.json();

        // Format history for Gemini
        const contents = messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        const result = await model.generateContentStream({
            contents: contents,
        });

        // Create a streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    controller.enqueue(encoder.encode(text));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Failed to process symptom assessment. " + error.message },
            { status: 500 },
        );
    }
}
