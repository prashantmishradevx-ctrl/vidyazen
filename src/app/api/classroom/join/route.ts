import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can join classes." }, { status: 403 });
  }

  const { code } = await req.json();
  const cls = await prisma.class.findUnique({ where: { code: String(code || "").trim().toUpperCase() } });
  if (!cls) return NextResponse.json({ error: "Invalid class code." }, { status: 404 });

  const student = await prisma.student.findUnique({ where: { userId: (session.user as any).id } });
  if (!student) return NextResponse.json({ error: "Student profile not found." }, { status: 404 });

  const enrollment = await prisma.classEnrollment.upsert({
    where: { classId_studentId: { classId: cls.id, studentId: student.id } },
    update: {},
    create: { classId: cls.id, studentId: student.id },
  });

  return NextResponse.json({ enrollment, class: cls });
}
