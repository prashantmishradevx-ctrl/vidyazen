import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeeStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status") as FeeStatus | null;

    const fees = await prisma.fee.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json(fees);
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
    const { studentId, title, amount, dueDate } = body;

    const fee = await prisma.fee.create({
      data: {
        studentId,
        title,
        amount: Number(amount),
        dueDate: new Date(dueDate),
        status: FeeStatus.PENDING,
      },
    });

    return NextResponse.json(fee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { feeId, status, paymentMode, receiptNo } = body;

    const fee = await prisma.fee.update({
      where: { id: feeId },
      data: {
        status,
        paidDate: status === "PAID" ? new Date() : undefined,
        paymentMode,
        receiptNo,
      },
    });

    return NextResponse.json(fee);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
