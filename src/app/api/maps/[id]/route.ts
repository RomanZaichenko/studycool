import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: mapId } = await params;
    const body = await req.json();

    const existingMap = await prisma.mindMap.findFirst({
      where: { id: mapId, userId: session.user.id },
    });

    if (!existingMap) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updatedMap = await prisma.mindMap.update({
      where: { id: mapId },
      data: {
        title: body.title !== undefined ? body.title : existingMap.title,
        nodes: body.nodes !== undefined ? body.nodes : existingMap.nodes,
        edges: body.edges !== undefined ? body.edges : existingMap.edges,
      },
    });

    return NextResponse.json(updatedMap);
  } catch (error) {
    console.error("Помилка оновлення мапи:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
