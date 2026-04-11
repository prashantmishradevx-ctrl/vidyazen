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
        subjects: { include: { subject: true } },
        _count: { select: { students: true } },
      },
      orderBy: [{ grade: "asc" }, { section: "asc" }],
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
    const { name, grade, section, teacherId, capacity, room, academicYear } = body;

    const cls = await prisma.class.create({
      data: { name, grade, section, teacherId, capacity: Number(capacity), room, academicYear },
    });

    return NextResponse.json(cls, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Class already exists for this grade/section/year" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
