"use client";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { SectionHeader, Card, Badge, DataTable } from "@/components/ui";
import { formatDate, getGrade } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get student's own grades via dashboard
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      setGrades(d?.student?.grades || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const avgBySubject = grades.reduce((acc: Record<string, { total: number; count: number; name: string }>, g: any) => {
    const name = g.subject?.name || "Unknown";
    if (!acc[name]) acc[name] = { total: 0, count: 0, name };
    acc[name].total += (g.marks / g.maxMarks) * 100;
    acc[name].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(avgBySubject).map((s: any) => ({
    subject: s.name.slice(0, 10),
    avg: Math.round(s.total / s.count),
  }));

  const getGradeBadge = (grade: string) => {
    if (!grade) return "default";
    if (["A+", "A"].includes(grade)) return "success";
    if (["B+", "B"].includes(grade)) return "info";
    if (grade === "C") return "warning";
    return "danger";
  };

  const columns = [
    { key: "subject", label: "Subject", render: (r: any) => <span className="font-medium">{r.subject?.name}</span> },
    { key: "exam", label: "Exam", render: (r: any) => <Badge variant="info">{r.examType?.replace("_", " ")}</Badge> },
    { key: "marks", label: "Marks", render: (r: any) => <span className="font-semibold">{r.marks}/{r.maxMarks}</span> },
    { key: "pct", label: "%", render: (r: any) => {
      const p = Math.round((r.marks / r.maxMarks) * 100);
      return <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${p}%` }} />
        </div>
        <span className="text-sm font-medium">{p}%</span>
      </div>;
    }},
    { key: "grade", label: "Grade", render: (r: any) => <Badge variant={getGradeBadge(r.grade) as any}>{r.grade || getGrade((r.marks/r.maxMarks)*100)}</Badge> },
    { key: "date", label: "Date", render: (r: any) => formatDate(r.examDate) },
    { key: "remarks", label: "Remarks", render: (r: any) => <span className="text-slate-500 text-xs">{r.remarks || "—"}</span> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="My Grades" subtitle="Your academic performance across all subjects" />

      {chartData.length > 0 && (
        <Card title="Subject-wise Performance">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip formatter={(v: any) => [`${v}%`, "Average"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="avg" fill="#0f87e8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}</div>
        ) : (
          <DataTable columns={columns} data={grades} emptyMessage="No grades recorded yet. Your results will appear here after exams." />
        )}
      </Card>
    </div>
  );
}
