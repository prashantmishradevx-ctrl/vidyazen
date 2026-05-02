import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const allowedRoles = new Set<Role>([Role.STUDENT, Role.TEACHER, Role.ADMIN, Role.PARENT]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const role = (body.role || Role.STUDENT) as Role;

    if (!name || !email || password.length < 6) {
      return NextResponse.json({ error: "Name, valid email, and password of at least 6 characters are required." }, { status: 400 });
    }
    if (!allowedRoles.has(role)) {
      return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        student: role === Role.STUDENT ? { create: { studentId: body.studentId || `STU${Date.now()}` } } : undefined,
        teacher: role === Role.TEACHER ? { create: { employeeId: body.employeeId || `TCH${Date.now()}` } } : undefined,
        admin: role === Role.ADMIN ? { create: { employeeId: body.employeeId || `ADM${Date.now()}` } } : undefined,
        parent: role === Role.PARENT ? { create: {} } : undefined,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "An account with this email or ID already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
