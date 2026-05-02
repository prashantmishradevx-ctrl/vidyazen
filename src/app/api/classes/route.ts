import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const classes = await prisma.class.findMany({
      include: {
        teacher: { include: { user: { select: { name: true, email: true, avatar: true } } } },
        sections: { include: { teacher: { include: { user: { select: { name: true, email: true } } } }, _count: { select: { students: true } } }, orderBy: { sectionName: "asc" } },
        subjects: { include: { subject: true } },
        _count: { select: { students: true } },
      },
      orderBy: [{ grade: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, className, grade, teacherId, capacity, room, academicYear } = body;
    const resolvedGrade = String(grade || name || "").replace(/class|grade/gi, "").trim();
    const resolvedClassName = className || name || `Class ${resolvedGrade}`;

    const cls = await prisma.class.create({
      data: {
        name: resolvedClassName,
        className: resolvedClassName,
        grade: resolvedGrade,
        section: "ALL",
        teacherId: teacherId || null,
        capacity: Number(capacity || 40),
        room,
        academicYear,
      },
    });

    return NextResponse.json(cls, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Class already exists for this academic year" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const resolvedClassName = body.className || body.name;
    const cls = await prisma.class.update({
      where: { id: body.id },
      data: {
        name: resolvedClassName,
        className: resolvedClassName,
        grade: String(body.grade || "").trim(),
        teacherId: body.teacherId || null,
        capacity: body.capacity ? Number(body.capacity) : undefined,
        room: body.room || null,
        academicYear: body.academicYear,
      },
    });
    return NextResponse.json(cls);
  } catch {
    return NextResponse.json({ error: "Could not update class" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Class id is required" }, { status: 400 });
    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not delete class" }, { status: 500 });
  }
}
