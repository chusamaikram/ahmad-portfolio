// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        // 1. Initialize with the PRIVATE env variable (no NEXT_PUBLIC_)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

        // 2. Use the stable model name
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "You are a professional career coach helping someone build their portfolio. Keep answers concise and encouraging."
        });

        // 3. Start chat with history
        const chat = model.startChat({
            history: history,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;

        return NextResponse.json({ text: response.text() });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// app/api/chat/route.ts
export async function GET() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        // This is a special way to check what you have access to
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: "Failed to list models" });
    }
}