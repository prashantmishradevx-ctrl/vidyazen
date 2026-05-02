"use client";
import { useEffect, useState } from "react";
import { ClipboardList, CalendarCheck, CreditCard, BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard, Card, Badge, EmptyState } from "@/components/ui";
import { formatCurrency, formatDate, getGrade } from "@/lib/utils";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import Link from "next/link";

export default function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
      </div>
    </div>
  );

  const student = data?.student;
  const attendancePercent = data?.attendancePercent || 0;
  const recentGrades = student?.grades || [];
  const recentAttendance = student?.attendance || [];
  const pendingFees = (student?.fees || []).filter((f: any) => f.status === "PENDING" || f.status === "OVERDUE");
  const avgMarks = recentGrades.length
    ? Math.round(recentGrades.reduce((s: number, g: any) => s + (g.marks / g.maxMarks) * 100, 0) / recentGrades.length)
    : 0;

  const attendanceColor = attendancePercent >= 75 ? "#22c55e" : attendancePercent >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {student?.class?.className || student?.class?.name} {student?.section ? `· Section ${student.section.sectionName}` : ""} · Roll No: {student?.rollNumber || "—"} · ID: {student?.studentId}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={`${attendancePercent}%`} icon={CalendarCheck}
          iconColor={attendancePercent >= 75 ? "bg-green-500" : "bg-red-500"} delay={0} />
        <StatCard title="Avg. Score" value={`${avgMarks}%`} subtitle={getGrade(avgMarks)} icon={TrendingUp} iconColor="bg-blue-500" delay={0.05} />
        <StatCard title="Subjects" value={student?.class?.subjects?.length || 0} icon={BookOpen} iconColor="bg-violet-500" delay={0.1} />
        <StatCard title="Dues Pending" value={pendingFees.length} subtitle={pendingFees.length > 0 ? "Action needed" : "All clear!"} icon={CreditCard} iconColor={pendingFees.length > 0 ? "bg-red-500" : "bg-green-500"} delay={0.15} />
      </div>

      <Card title="Classmates" subtitle={student?.section ? `Section ${student.section.sectionName}` : "Assigned class"}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {(student?.section?.students || []).filter((s: any) => s.id !== student.id).slice(0, 8).map((mate: any) => (
            <div key={mate.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{mate.user?.name}</div>
          ))}
          {(student?.section?.students || []).length <= 1 && <p className="text-sm text-slate-400 py-4">No classmates found yet.</p>}
        </div>
      </Card>

      <Card title="Recent Attendance" subtitle="Latest updates from your teacher">
        <div className="space-y-2">
          {recentAttendance.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No attendance records yet.</p>
          ) : (
            recentAttendance.slice(0, 6).map((record: any) => (
              <div key={record.id} className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50">
                <span className="text-sm font-medium text-slate-700">{formatDate(record.date)}</span>
                <Badge variant={record.status === "PRESENT" ? "success" : record.status === "ABSENT" ? "danger" : record.status === "LATE" ? "warning" : "info"}>{record.status}</Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance gauge */}
        <Card title="Attendance Status" subtitle="Current academic year">
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={[{ value: attendancePercent, fill: attendanceColor }]} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#f1f5f9" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-bold" style={{ color: attendanceColor }}>{attendancePercent}%</span>
                <span className="text-xs text-slate-400 mt-0.5">Attendance</span>
              </div>
            </div>
            <div className={`mt-3 px-3 py-1.5 rounded-full text-xs font-semibold ${attendancePercent >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {attendancePercent >= 75 ? "✓ Good Standing" : "⚠ Below 75% — Action Required"}
            </div>
          </div>
        </Card>

        {/* Recent grades */}
        <Card title="Recent Grades" subtitle="Latest exam results" className="lg:col-span-2">
          <div className="space-y-3">
            {recentGrades.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No grades yet" description="Your grades will appear here after exams" />
            ) : (
              recentGrades.slice(0, 5).map((g: any) => {
                const pct = Math.round((g.marks / g.maxMarks) * 100);
                return (
                  <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="font-medium text-slate-800 text-sm">{g.subject?.name}</div>
                      <div className="text-xs text-slate-400">{g.examType?.replace("_", " ")} · {formatDate(g.examDate)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">{g.marks}/{g.maxMarks}</div>
                      <div className="text-xs text-slate-500">{pct}%</div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      pct >= 80 ? "bg-green-100 text-green-700" : pct >= 60 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                    }`}>
                      {g.grade || getGrade(pct)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Link href="/dashboard/student/grades" className="flex items-center gap-1.5 text-brand-600 text-sm font-medium mt-4 hover:gap-2.5 transition-all">
            View all grades <ArrowRight size={14} />
          </Link>
        </Card>
      </div>

      {/* Pending fees */}
      {pendingFees.length > 0 && (
        <Card title="Pending Fees" subtitle="Please clear these dues">
          <div className="space-y-3">
            {pendingFees.map((fee: any) => (
              <div key={fee.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div>
                  <div className="font-medium text-slate-800">{fee.title}</div>
                  <div className="text-xs text-slate-500">Due: {formatDate(fee.dueDate)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-700">{formatCurrency(fee.amount)}</div>
                  <Badge variant={fee.status === "OVERDUE" ? "danger" : "warning"}>{fee.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/student/fees" className="flex items-center gap-1.5 text-brand-600 text-sm font-medium mt-4 hover:gap-2.5 transition-all">
            View all fees <ArrowRight size={14} />
          </Link>
        </Card>
      )}

      {/* Quick actions */}
      <Card title="Quick Access">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "My Grades", href: "/dashboard/student/grades", icon: ClipboardList, color: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Attendance", href: "/dashboard/student/attendance", icon: CalendarCheck, color: "bg-green-50 text-green-700 border-green-200" },
            { label: "Timetable", href: "/dashboard/student/timetable", icon: BookOpen, color: "bg-purple-50 text-purple-700 border-purple-200" },
            { label: "Fee Details", href: "/dashboard/student/fees", icon: CreditCard, color: "bg-amber-50 text-amber-700 border-amber-200" },
          ].map(a => (
            <Link key={a.label} href={a.href} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-105 ${a.color}`}>
              <a.icon size={22} />
              <span className="text-sm font-medium text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
