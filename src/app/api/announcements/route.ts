import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const role = (session.user as any).role as Role;

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ targetRole: null }, { targetRole: role }],
      },
      include: {
        author: { select: { name: true, avatar: true, role: true } },
      },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: 20,
    });

    return NextResponse.json(announcements);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, content, targetRole, isPinned, expiresAt } = body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        authorId: (session.user as any).id,
        targetRole: targetRole || null,
        isPinned: isPinned || false,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      include: { author: { select: { name: true, avatar: true, role: true } } },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
