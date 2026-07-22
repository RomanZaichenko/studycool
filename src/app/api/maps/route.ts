import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const maps = await prisma.mindMap.findMany({
      where: { userId: session.user.id },
      orderBy: { lastOpened: "desc" },
    });

    return NextResponse.json(maps);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const targetProjectId =
      body.projectId && body.projectId !== "general-project"
        ? body.projectId
        : "general-project";

    // Використовуємо Unchecked ввід, щоб передати ID напряму без складних connect-об'єктів
    const createData: Prisma.MindMapUncheckedCreateInput = {
      id: body.id,
      title: body.title || "New Map",
      description: body.description || "",
      userId: session.user.id,
      projectId: targetProjectId,
      nodes: [],
      edges: [],
    };

    const newMap = await prisma.mindMap.create({
      data: createData,
    });

    return NextResponse.json(newMap, { status: 201 });
  } catch (error) {
    console.error("Помилка створення мапи:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
