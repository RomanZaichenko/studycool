import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const getAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MAX_MESSAGE_LENGTH = 1000;
const MAX_CONTEXT_LENGTH = 30000;

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, mapContext } = await req.json();
    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message exceeds the maximum length of 1000 characters." },
        { status: 400 }
      );
    }

    if (typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Message exceeds the maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }
    if (mapContext !== undefined && typeof mapContext !== "string") {
      return NextResponse.json(
        { error: "Invalid map context." },
        { status: 400 }
      );
    }
    if (mapContext && mapContext.length > MAX_CONTEXT_LENGTH) {
      return NextResponse.json(
        { error: "Map context is too large." },
        { status: 400 }
      );
    }

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
