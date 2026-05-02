import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId") || undefined;
  const sectionId = searchParams.get("sectionId") || undefined;

  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    return NextResponse.json(await prisma.assignment.findMany({
      where: { teacherId: teacher?.id, classId, sectionId },
      include: { class: true, section: true, _count: { select: { submissions: true } } },
      orderBy: { createdAt: "desc" },
    }));
  }

  const student = await prisma.student.findUnique({ where: { userId } });
  return NextResponse.json(await prisma.assignment.findMany({
    where: {
      classId,
      status: "PUBLISHED",
      OR: [
        { classId: student?.classId || "", sectionId: null },
        { sectionId: student?.sectionId || "" },
        { class: { enrollments: { some: { studentId: student?.id || "" } } } },
      ],
    },
    include: { class: true, section: true, submissions: { where: { studentId: student?.id || "" } } },
    orderBy: { dueDate: "asc" },
  }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "TEACHER") {
    return NextResponse.json({ error: "Only teachers can create assignments." }, { status: 403 });
  }

  const body = await req.json();
  const teacher = await prisma.teacher.findUnique({ where: { userId: (session.user as any).id } });
  if (!teacher) return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });

  const assignment = await prisma.assignment.create({
    data: {
      classId: body.classId,
      sectionId: body.sectionId || null,
      teacherId: teacher.id,
      title: body.title,
      description: body.description || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      maxMarks: Number(body.maxMarks || 100),
    },
    include: { class: { include: { students: true, enrollments: { include: { student: true } } } }, section: { include: { students: true } } },
  });

  const userIds = Array.from(new Set([
    ...(assignment.section ? assignment.section.students.map((student) => student.userId) : assignment.class.students.map((student) => student.userId)),
    ...assignment.class.enrollments.map((enrollment) => enrollment.student.userId),
  ]));
  if (userIds.length) {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: "ASSIGNMENT",
        title: "New assignment",
        message: `${assignment.title} was posted for ${assignment.class.name}.`,
        link: "/dashboard/student/classroom",
      })),
    });
  }
  return NextResponse.json(assignment, { status: 201 });
}
