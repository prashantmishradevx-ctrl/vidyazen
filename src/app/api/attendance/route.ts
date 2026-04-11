import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");
    const studentId = searchParams.get("studentId");
    const month = searchParams.get("month");

    let where: any = {};
    if (classId) where.classId = classId;
    if (studentId) where.studentId = studentId;
    if (date) {
      const d = new Date(date);
      where.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }
    if (month) {
      const [year, m] = month.split("-");
      where.date = {
        gte: new Date(Number(year), Number(m) - 1, 1),
        lte: new Date(Number(year), Number(m), 0),
      };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, avatar: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { records, classId, teacherId, date } = body;

    // Bulk upsert attendance
    const ops = records.map(
      (r: { studentId: string; status: AttendanceStatus; remarks?: string }) =>
        prisma.attendanceRecord.upsert({
          where: {
            studentId_date_classId: {
              studentId: r.studentId,
              date: new Date(date),
              classId,
            },
          },
          update: { status: r.status, remarks: r.remarks },
          create: {
            studentId: r.studentId,
            classId,
            teacherId,
            date: new Date(date),
            status: r.status,
            remarks: r.remarks,
          },
        })
    );

    await prisma.$transaction(ops);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
