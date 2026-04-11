"use client";
import { useEffect, useState } from "react";
import { BookOpen, Users, CalendarCheck, ClipboardList, ArrowRight } from "lucide-react";
import { StatCard, Card, Badge } from "@/components/ui";
import Link from "next/link";

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const teacher = data?.teacher;
  const myStudentCount = data?.myStudentCount || 0;

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, {teacher?.user?.name?.split(" ")[0] || "Teacher"}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="My Classes" value={teacher?._count?.classes || 0} icon={BookOpen} iconColor="bg-blue-500" />
        <StatCard title="My Students" value={myStudentCount} icon={Users} iconColor="bg-green-500" />
        <StatCard title="Subjects" value={teacher?.subjects?.length || 0} icon={ClipboardList} iconColor="bg-violet-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <Card title="My Classes">
          <div className="space-y-3">
            {(teacher?.classes || []).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No classes assigned yet</div>
            ) : (
              (teacher?.classes || []).map((cls: any) => (
                <div key={cls.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <BookOpen size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{cls.name}</div>
                      <div className="text-xs text-slate-400">{cls._count?.students} students</div>
                    </div>
                  </div>
                  <Link href="/dashboard/teacher/attendance" className="text-brand-600 hover:text-brand-700">
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Subjects */}
        <Card title="My Subjects">
          <div className="space-y-3">
            {(teacher?.subjects || []).length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No subjects assigned yet</div>
            ) : (
              (teacher?.subjects || []).map((ts: any) => (
                <div key={ts.subjectId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <ClipboardList size={18} className="text-violet-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{ts.subject?.name}</div>
                    <div className="text-xs text-slate-400">Code: {ts.subject?.code}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Mark Attendance", href: "/dashboard/teacher/attendance", icon: CalendarCheck, color: "bg-green-50 text-green-700 border-green-200" },
            { label: "Add Grades", href: "/dashboard/teacher/grades", icon: ClipboardList, color: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Announcements", href: "/dashboard/teacher/announcements", icon: BookOpen, color: "bg-purple-50 text-purple-700 border-purple-200" },
          ].map((a) => (
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
