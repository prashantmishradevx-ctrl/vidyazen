import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const role = (session.user as any).role;

  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({ where: { userId: (session.user as any).id } });
    if (!student) return NextResponse.json({ error: "Student profile not found." }, { status: 404 });

    const submission = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId: body.assignmentId, studentId: student.id } },
      update: { content: body.content || null, fileUrl: body.fileUrl || null, submittedAt: new Date(), status: "SUBMITTED" },
      create: { assignmentId: body.assignmentId, studentId: student.id, content: body.content || null, fileUrl: body.fileUrl || null },
    });
    return NextResponse.json(submission);
  }

  if (role === "TEACHER") {
    const submission = await prisma.assignmentSubmission.update({
      where: { id: body.submissionId },
      data: { marks: Number(body.marks), feedback: body.feedback || null, status: "GRADED", gradedAt: new Date() },
    });
    return NextResponse.json(submission);
  }

  return NextResponse.json({ error: "Unsupported role." }, { status: 403 });
}
