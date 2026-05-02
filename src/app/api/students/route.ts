import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const sectionId = searchParams.get("sectionId");
    const search = searchParams.get("search");

    const students = await prisma.student.findMany({
      where: {
        ...(classId ? { classId } : {}),
        ...(sectionId ? { sectionId } : {}),
        ...(search
          ? {
              user: {
                name: { contains: search },
              },
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, dateOfBirth: true } },
        class: { select: { id: true, name: true, className: true, grade: true, section: true } },
        section: { select: { id: true, sectionName: true } },
        parent: { include: { user: { select: { name: true, phone: true, email: true } } } },
        _count: { select: { attendance: true, grades: true, fees: true } },
      },
      orderBy: { rollNumber: "asc" },
    });

    return NextResponse.json(students);
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
    const { name, email, password, phone, dateOfBirth, classId, sectionId, rollNumber, parentId } = body;

    const hashedPassword = await bcrypt.hash(password || "student@123", 12);

    // Generate student ID
    const count = await prisma.student.count();
    const studentId = `STU${String(count + 1).padStart(3, "0")}`;

    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.STUDENT,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        student: {
          create: {
            studentId,
            classId,
            sectionId: sectionId || undefined,
            rollNumber,
            parentId,
          },
        },
      },
      include: { student: true },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
