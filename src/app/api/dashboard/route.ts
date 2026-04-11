import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (role === "ADMIN") {
      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        pendingFees,
        paidFees,
        recentAnnouncements,
        upcomingEvents,
        attendanceToday,
      ] = await Promise.all([
        prisma.student.count(),
        prisma.teacher.count(),
        prisma.class.count(),
        prisma.fee.aggregate({ where: { status: "PENDING" }, _sum: { amount: true }, _count: true }),
        prisma.fee.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
        prisma.announcement.findMany({ take: 5, orderBy: { publishedAt: "desc" }, include: { author: { select: { name: true } } } }),
        prisma.event.findMany({ where: { startDate: { gte: new Date() } }, take: 5, orderBy: { startDate: "asc" } }),
        prisma.attendanceRecord.groupBy({
          by: ["status"],
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          _count: true,
        }),
      ]);

      // Monthly fee collection for chart
      const monthlyFees = await prisma.$queryRaw`
        SELECT 
          TO_CHAR(paid_date, 'Mon') as month,
          EXTRACT(MONTH FROM paid_date) as month_num,
          SUM(amount) as total
        FROM fees
        WHERE status = 'PAID' AND paid_date >= NOW() - INTERVAL '6 months'
        GROUP BY month, month_num
        ORDER BY month_num
      `;

      // Attendance trend last 7 days
      const attendanceTrend = await prisma.$queryRaw`
        SELECT 
          DATE(date) as day,
          COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present,
          COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent,
          COUNT(*) as total
        FROM attendance_records
        WHERE date >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(date)
        ORDER BY day
      `;

      return NextResponse.json({
        stats: {
          totalStudents,
          totalTeachers,
          totalClasses,
          pendingFees: { amount: pendingFees._sum.amount || 0, count: pendingFees._count },
          paidFees: { amount: paidFees._sum.amount || 0 },
        },
        recentAnnouncements,
        upcomingEvents,
        attendanceToday,
        monthlyFees,
        attendanceTrend,
      });
    }

    if (role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        include: {
          classes: { include: { _count: { select: { students: true } } } },
          subjects: { include: { subject: true } },
        },
      });

      const myStudentCount = teacher?.classes.reduce((sum, c) => sum + c._count.students, 0) || 0;

      const recentAttendance = await prisma.attendanceRecord.findMany({
        where: { teacherId: teacher?.id },
        take: 10,
        orderBy: { date: "desc" },
        include: { student: { include: { user: { select: { name: true } } } } },
      });

      return NextResponse.json({ teacher, myStudentCount, recentAttendance });
    }

    if (role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          class: { include: { subjects: { include: { subject: true } } } },
          grades: { include: { subject: true }, orderBy: { examDate: "desc" }, take: 10 },
          fees: { orderBy: { dueDate: "asc" }, take: 5 },
          attendance: { orderBy: { date: "desc" }, take: 30 },
        },
      });

      const totalAttendance = await prisma.attendanceRecord.count({ where: { studentId: student?.id } });
      const presentCount = await prisma.attendanceRecord.count({ where: { studentId: student?.id, status: "PRESENT" } });
      const attendancePercent = totalAttendance ? Math.round((presentCount / totalAttendance) * 100) : 0;

      return NextResponse.json({ student, attendancePercent });
    }

    if (role === "PARENT") {
      const parent = await prisma.parent.findUnique({
        where: { userId },
        include: {
          students: {
            include: {
              user: { select: { name: true, email: true, avatar: true } },
              class: true,
              grades: { orderBy: { examDate: "desc" }, take: 5, include: { subject: true } },
              fees: { where: { status: { in: ["PENDING", "OVERDUE"] } } },
              attendance: { orderBy: { date: "desc" }, take: 10 },
            },
          },
        },
      });

      return NextResponse.json({ parent });
    }

    return NextResponse.json({ error: "Unknown role" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
