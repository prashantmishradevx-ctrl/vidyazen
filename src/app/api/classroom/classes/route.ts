import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function classCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    const classes = await prisma.class.findMany({
      where: { teacherId: teacher?.id },
      include: { sections: { include: { _count: { select: { students: true } } } }, _count: { select: { students: true, enrollments: true, assignments: true } } },
      orderBy: { createdAt: "desc" },
    });
    const assignedSections = await prisma.section.findMany({
      where: { teacherId: teacher?.id },
      include: { class: true, _count: { select: { students: true, assignments: true } } },
      orderBy: { sectionName: "asc" },
    });
    return NextResponse.json(classes.length ? classes : assignedSections.map((section) => ({ ...section.class, sections: [section], _count: section._count })));
  }

  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId } });
    const classes = await prisma.class.findMany({
      where: {
        OR: [
          { id: student?.classId || "" },
          { enrollments: { some: { studentId: student?.id || "" } } },
          { sections: { some: { id: student?.sectionId || "" } } },
        ],
      },
      include: { sections: true, teacher: { include: { user: { select: { name: true } } } }, _count: { select: { assignments: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(classes);
  }

  const classes = await prisma.class.findMany({
    include: { teacher: { include: { user: { select: { name: true } } } }, _count: { select: { students: true, assignments: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["TEACHER", "ADMIN"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "Only teachers or admins can create classes." }, { status: 403 });
    }

    const body = await req.json();
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Class name is required." }, { status: 400 });

    const teacher = (session.user as any).role === "TEACHER"
      ? await prisma.teacher.findUnique({ where: { userId: (session.user as any).id } })
      : null;
    const code = classCode();

    const cls = await prisma.class.create({
      data: {
        name,
        className: name,
        code,
        grade: body.grade || name.replace(/class|grade/gi, "").trim() || "Classroom",
        section: "ALL",
        teacherId: body.teacherId || teacher?.id,
        capacity: Number(body.capacity || 60),
        room: body.room || null,
        academicYear: body.academicYear || "2024-25",
      },
    });
    return NextResponse.json(cls, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") return NextResponse.json({ error: "Class or class code already exists." }, { status: 409 });
    return NextResponse.json({ error: "Could not create class." }, { status: 500 });
  }
}
