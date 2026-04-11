import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGrade } from "@/lib/utils";
import { ExamType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const subjectId = searchParams.get("subjectId");
    const examType = searchParams.get("examType") as ExamType | null;

    const grades = await prisma.grade.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(subjectId ? { subjectId } : {}),
        ...(examType ? { examType } : {}),
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { name: true } } } },
      },
      orderBy: { examDate: "desc" },
    });

    return NextResponse.json(grades);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { studentId, subjectId, teacherId, examType, marks, maxMarks, examDate, remarks } = body;

    const percentage = (marks / maxMarks) * 100;
    const grade = getGrade(percentage);

    const newGrade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        teacherId,
        examType,
        marks: Number(marks),
        maxMarks: Number(maxMarks),
        grade,
        examDate: new Date(examDate),
        remarks,
      },
    });

    return NextResponse.json(newGrade, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
