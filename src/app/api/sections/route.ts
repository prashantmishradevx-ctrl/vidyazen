import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = new URL(req.url).searchParams.get("classId") || undefined;
  const sections = await prisma.section.findMany({
    where: { classId },
    include: {
      class: true,
      teacher: { include: { user: { select: { name: true, email: true } } } },
      _count: { select: { students: true } },
    },
    orderBy: [{ class: { grade: "asc" } }, { sectionName: "asc" }],
  });
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const section = await prisma.section.create({
      data: {
        classId: body.classId,
        sectionName: String(body.sectionName || "").trim().toUpperCase(),
        teacherId: body.teacherId || null,
        room: body.room || null,
        capacity: Number(body.capacity || 40),
      },
    });
    return NextResponse.json(section, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ error: "Section already exists for this class" }, { status: 400 });
    return NextResponse.json({ error: "Could not create section" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const section = await prisma.section.update({
      where: { id: body.id },
      data: {
        sectionName: body.sectionName ? String(body.sectionName).trim().toUpperCase() : undefined,
        teacherId: body.teacherId || null,
        room: body.room || null,
        capacity: body.capacity ? Number(body.capacity) : undefined,
      },
    });
    return NextResponse.json(section);
  } catch {
    return NextResponse.json({ error: "Could not update section" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Section id is required" }, { status: 400 });
    await prisma.section.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not delete section" }, { status: 500 });
  }
}
