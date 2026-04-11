"use client";
import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { SectionHeader, Card, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const STATUS_MAP: Record<string, { label: string; variant: string; dot: string }> = {
  PRESENT: { label: "Present", variant: "success", dot: "bg-green-500" },
  ABSENT: { label: "Absent", variant: "danger", dot: "bg-red-500" },
  LATE: { label: "Late", variant: "warning", dot: "bg-amber-500" },
  EXCUSED: { label: "Excused", variant: "info", dot: "bg-blue-500" },
};

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      setRecords(d?.student?.attendance || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const total = records.length;
  const present = records.filter(r => r.status === "PRESENT").length;
  const absent = records.filter(r => r.status === "ABSENT").length;
  const late = records.filter(r => r.status === "LATE").length;
  const pct = total ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <SectionHeader title="My Attendance" subtitle="Track your daily attendance record" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Days", value: total, color: "bg-slate-50 border-slate-200 text-slate-700" },
          { label: "Present", value: present, color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Absent", value: absent, color: "bg-red-50 border-red-200 text-red-700" },
          { label: "Attendance %", value: `${pct}%`, color: pct >= 75 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.color}`}>
            <div className="text-2xl font-bold font-display">{s.value}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <Card title="Attendance History">
        {loading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 shimmer rounded-xl" />)}</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CalendarCheck size={40} className="mx-auto mb-3 text-slate-300" />
            <p>No attendance records yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r: any) => {
              const s = STATUS_MAP[r.status] || STATUS_MAP.PRESENT;
              return (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                    <span className="text-sm font-medium text-slate-700">{formatDate(r.date)}</span>
                  </div>
                  {r.remarks && <span className="text-xs text-slate-400 hidden sm:block">{r.remarks}</span>}
                  <Badge variant={s.variant as any}>{s.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
