import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const prompt = messages
      .map(
        (m: { role: string; content: string }) =>
          `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`
      )
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Eres un asistente virtual de Cielo Viajes, una agencia de viajes colombiana.
Responde siempre en español, de forma amable y profesional.

${prompt}
`,
    });

    return NextResponse.json({
      message: response.text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Ocurrió un error al procesar tu solicitud.",
      },
      { status: 500 }
    );
  }
}