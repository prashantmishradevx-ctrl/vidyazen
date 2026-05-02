import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function meetingCode() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const meetings = await prisma.meeting.findMany({
    include: { class: true, section: true, teacher: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(meetings);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "TEACHER") {
    return NextResponse.json({ error: "Only teachers can create meetings." }, { status: 403 });
  }

  const body = await req.json();
  const teacher = await prisma.teacher.findUnique({ where: { userId: (session.user as any).id } });
  if (!teacher) return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });

  const meeting = await prisma.meeting.create({
    data: {
      title: body.title || "Class meeting",
      classId: body.classId || null,
      sectionId: body.sectionId || null,
      teacherId: teacher.id,
      code: meetingCode(),
      startsAt: body.startsAt ? new Date(body.startsAt) : new Date(),
    },
    include: { class: { include: { students: true, enrollments: { include: { student: true } } } }, section: { include: { students: true } } },
  });

  const userIds = meeting.class ? Array.from(new Set([
    ...(meeting.section ? meeting.section.students.map((student) => student.userId) : meeting.class.students.map((student) => student.userId)),
    ...meeting.class.enrollments.map((enrollment) => enrollment.student.userId),
  ])) : [];
  if (userIds.length) {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: "MEETING",
        title: "Meeting scheduled",
        message: `${meeting.title} is available with code ${meeting.code}.`,
        link: "/dashboard/meetings",
      })),
    });
  }
  return NextResponse.json(meeting, { status: 201 });
}
