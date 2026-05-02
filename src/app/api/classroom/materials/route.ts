import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = new URL(req.url).searchParams.get("classId") || undefined;
  const sectionId = new URL(req.url).searchParams.get("sectionId") || undefined;
  const materials = await prisma.classMaterial.findMany({
    where: { classId, sectionId },
    include: { class: true, section: true, teacher: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(materials);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "TEACHER") {
    return NextResponse.json({ error: "Only teachers can upload materials." }, { status: 403 });
  }

  const body = await req.json();
  const teacher = await prisma.teacher.findUnique({ where: { userId: (session.user as any).id } });
  if (!teacher) return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });

  const material = await prisma.classMaterial.create({
    data: {
      classId: body.classId,
      sectionId: body.sectionId || null,
      teacherId: teacher.id,
      title: body.title,
      description: body.description || null,
      fileUrl: body.fileUrl || null,
    },
  });
  return NextResponse.json(material, { status: 201 });
}
