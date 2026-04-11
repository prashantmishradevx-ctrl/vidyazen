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

    const teachers = await prisma.teacher.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        classes: { select: { id: true, name: true, _count: { select: { students: true } } } },
        subjects: { include: { subject: true } },
        _count: { select: { classes: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(teachers);
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
    const { name, email, password, phone, qualification, experience, specialization, salary } = body;

    const hashedPassword = await bcrypt.hash(password || "teacher@123", 12);
    const count = await prisma.teacher.count();
    const employeeId = `TCH${String(count + 1).padStart(3, "0")}`;

    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.TEACHER,
        phone,
        teacher: {
          create: {
            employeeId,
            qualification,
            experience: Number(experience) || 0,
            specialization,
            salary: Number(salary) || 0,
          },
        },
      },
      include: { teacher: true },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
