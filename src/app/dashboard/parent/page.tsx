"use client";
import { useEffect, useState } from "react";
import { Users, CalendarCheck, CreditCard, Bell, ArrowRight, TrendingUp } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { formatCurrency, formatDate, getGrade } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function ParentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6"><div className="h-48 shimmer rounded-2xl" /><div className="grid lg:grid-cols-2 gap-6"><div className="h-64 shimmer rounded-2xl" /><div className="h-64 shimmer rounded-2xl" /></div></div>
  );

  const children = data?.parent?.students || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Parent Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor your child&apos;s academic progress</p>
      </div>

      {children.length === 0 ? (
        <Card><div className="text-center py-16 text-slate-400"><Users size={48} className="mx-auto mb-4 text-slate-300" /><h3 className="font-semibold text-slate-600 mb-1">No children linked</h3><p className="text-sm">Contact your school admin to link your children to your account.</p></div></Card>
      ) : (
        children.map((child: any) => {
          const grades = child.grades || [];
          const attendance = child.attendance || [];
          const pendingFees = (child.fees || []).filter((f: any) => ["PENDING", "OVERDUE"].includes(f.status));
          const totalAtt = attendance.length;
          const presentAtt = attendance.filter((a: any) => a.status === "PRESENT").length;
          const attPct = totalAtt ? Math.round((presentAtt / totalAtt) * 100) : 0;
          const avgScore = grades.length ? Math.round(grades.reduce((s: number, g: any) => s + (g.marks / g.maxMarks) * 100, 0) / grades.length) : 0;

          return (
            <div key={child.id} className="space-y-4">
              {/* Child header */}
              <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-6 text-white flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 shrink-0">
                  <Image src={getAvatarUrl(child.user?.name || "")} alt="" width={64} height={64} />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold">{child.user?.name}</h2>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {child.class?.className || child.class?.name} {child.section ? `· Section ${child.section.sectionName}` : ""} · Roll: {child.rollNumber || "—"} · ID: {child.studentId}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-3xl font-bold font-display">{attPct}%</div>
                  <div className="text-blue-200 text-xs">Attendance</div>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Attendance", value: `${attPct}%`, color: attPct >= 75 ? "text-green-700 bg-green-50 border-green-200" : "text-red-700 bg-red-50 border-red-200" },
                  { label: "Avg Score", value: `${avgScore}%`, color: "text-blue-700 bg-blue-50 border-blue-200" },
                  { label: "Exams", value: grades.length, color: "text-purple-700 bg-purple-50 border-purple-200" },
                  { label: "Pending Fees", value: pendingFees.length, color: pendingFees.length > 0 ? "text-red-700 bg-red-50 border-red-200" : "text-green-700 bg-green-50 border-green-200" },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
                    <div className="text-2xl font-bold font-display">{s.value}</div>
                    <div className="text-xs font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent grades + pending fees */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card title="Recent Attendance Updates">
                  <div className="space-y-2">
                    {attendance.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-6">No attendance records yet.</p>
                    ) : attendance.slice(0, 5).map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50">
                        <span className="text-sm text-slate-700">{formatDate(record.date)}</span>
                        <Badge variant={record.status === "PRESENT" ? "success" : record.status === "ABSENT" ? "danger" : record.status === "LATE" ? "warning" : "info"}>{record.status}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Recent Exam Results">
                  <div className="space-y-2">
                    {grades.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-6">No grades yet.</p>
                    ) : grades.slice(0, 4).map((g: any) => {
                      const pct = Math.round((g.marks / g.maxMarks) * 100);
                      return (
                        <div key={g.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50">
                          <div>
                            <div className="text-sm font-medium text-slate-800">{g.subject?.name}</div>
                            <div className="text-xs text-slate-400">{formatDate(g.examDate)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{g.marks}/{g.maxMarks}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${pct >= 80 ? "bg-green-100 text-green-700" : pct >= 60 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                              {getGrade(pct)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card title="Pending Fee Payments">
                  <div className="space-y-2">
                    {pendingFees.length === 0 ? (
                      <p className="text-green-600 text-sm text-center py-6 font-medium">✓ All fees are paid</p>
                    ) : pendingFees.map((fee: any) => (
                      <div key={fee.id} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                        <div>
                          <div className="text-sm font-medium text-slate-800">{fee.title}</div>
                          <div className="text-xs text-slate-500">Due: {formatDate(fee.dueDate)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-700">{formatCurrency(fee.amount)}</div>
                          <Badge variant={fee.status === "OVERDUE" ? "danger" : "warning"}>{fee.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          );
        })
      )}

      {/* Quick links */}
      <Card title="Quick Access">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Children", href: "/dashboard/parent/children", icon: Users, color: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: "Attendance", href: "/dashboard/parent/attendance", icon: CalendarCheck, color: "bg-green-50 text-green-700 border-green-200" },
            { label: "Fee Details", href: "/dashboard/parent/fees", icon: CreditCard, color: "bg-amber-50 text-amber-700 border-amber-200" },
            { label: "Announcements", href: "/dashboard/parent/announcements", icon: Bell, color: "bg-purple-50 text-purple-700 border-purple-200" },
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
