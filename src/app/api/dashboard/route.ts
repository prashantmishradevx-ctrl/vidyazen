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
          DATE_FORMAT(paidDate, '%b') as month,
          MONTH(paidDate) as month_num,
          SUM(amount) as total
        FROM fees
        WHERE status = 'PAID' AND paidDate >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
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
        WHERE date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
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
        recentAttendance: await prisma.attendanceRecord.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: {
            student: { include: { user: { select: { name: true } }, class: true, section: true } },
            teacher: { include: { user: { select: { name: true } } } },
            class: true,
            section: true,
          },
        }),
        monthlyFees,
        attendanceTrend,
      });
    }

    if (role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId },
        include: {
          classes: { include: { sections: { include: { _count: { select: { students: true } } }, orderBy: { sectionName: "asc" } }, _count: { select: { students: true } } } },
          sections: { include: { class: true, _count: { select: { students: true } } }, orderBy: { sectionName: "asc" } },
          subjects: { include: { subject: true } },
          assignments: { orderBy: { createdAt: "desc" }, take: 5, include: { class: true, _count: { select: { submissions: true } } } },
        },
      });

      const sectionOnlyClasses = (teacher?.sections || [])
        .filter((section) => !(teacher?.classes || []).some((cls) => cls.id === section.classId))
        .map((section) => ({
          ...section.class,
          sections: [section],
          _count: { students: section._count.students },
        }));
      if (teacher) {
        (teacher as any).classes = [...teacher.classes, ...sectionOnlyClasses];
      }

      const myStudentCount =
        teacher?.sections.reduce((sum, section) => sum + section._count.students, 0) ||
        teacher?.classes.reduce((sum, c) => sum + c._count.students, 0) ||
        0;
      const submissionCount = await prisma.assignmentSubmission.count({
        where: { assignment: { teacherId: teacher?.id } },
      });

      const recentAttendance = await prisma.attendanceRecord.findMany({
        where: { teacherId: teacher?.id },
        take: 10,
        orderBy: { date: "desc" },
        include: { student: { include: { user: { select: { name: true } }, section: true, class: true } }, class: true, section: true },
      });

      return NextResponse.json({ teacher, myStudentCount, submissionCount, recentAttendance });
    }

    if (role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          class: { include: { subjects: { include: { subject: true } } } },
          section: { include: { students: { include: { user: { select: { name: true, avatar: true } } } } } },
          grades: { include: { subject: true }, orderBy: { examDate: "desc" }, take: 10 },
          fees: { orderBy: { dueDate: "asc" }, take: 5 },
          attendance: { orderBy: { date: "desc" }, take: 30 },
          enrollments: { include: { class: true }, orderBy: { joinedAt: "desc" } },
          submissions: { include: { assignment: { include: { class: true } } }, orderBy: { submittedAt: "desc" }, take: 10 },
        },
      });

      const assignments = await prisma.assignment.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { classId: student?.classId || "" },
            { class: { enrollments: { some: { studentId: student?.id || "" } } } },
          ],
        },
        include: { class: true, submissions: { where: { studentId: student?.id || "" } } },
        orderBy: { dueDate: "asc" },
        take: 8,
      });

      const totalAttendance = await prisma.attendanceRecord.count({ where: { studentId: student?.id } });
      const presentCount = await prisma.attendanceRecord.count({ where: { studentId: student?.id, status: "PRESENT" } });
      const attendancePercent = totalAttendance ? Math.round((presentCount / totalAttendance) * 100) : 0;

      return NextResponse.json({ student, attendancePercent, assignments });
    }

    if (role === "PARENT") {
      const parent = await prisma.parent.findUnique({
        where: { userId },
        include: {
          students: {
            include: {
              user: { select: { name: true, email: true, avatar: true } },
              class: true,
              section: true,
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
