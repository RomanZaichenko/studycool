import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const getAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, mapContext } = await req.json();

    const model = getAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstructions = mapContext
      ? `You are an AI assistant for the StudyCool knowledge map app. 
      Here is the current content of the user's map:
      ${mapContext}

      Your tasks:
      1. If the user asks about details already on the map, base your answer on the provided context.
      2. If the user asks for "additional info", explanations, or ideas to expand their map (e.g., about Elephants or Wolves), use your AI knowledge to provide useful, educational facts so they can add new nodes.
      3. Be friendly and concise. Answer in the same language the user uses to write to you.`
      : `You are an AI assistant for the StudyCool app. The user is currently on the main screen. Help them with navigation, learning planning, or give a general answer to their question. Be friendly and answer in the same language the user uses to write to you.`;

    const prompt = `${systemInstructions}\n\nUSER message: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
