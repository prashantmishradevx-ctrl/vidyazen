"use client";
import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { SectionHeader, Card, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function ParentAttendancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const children = data?.parent?.students || [];
  const STATUS_VARIANT: Record<string, string> = { PRESENT: "success", ABSENT: "danger", LATE: "warning", EXCUSED: "info" };
  return (
    <div className="space-y-6">
      <SectionHeader title="Attendance Overview" subtitle="Track your children's daily attendance" />
      {loading ? <div className="h-64 shimmer rounded-2xl" /> :
        children.map((child: any) => {
          const records = child.attendance || [];
          const total = records.length, present = records.filter((r: any) => r.status === "PRESENT").length;
          const pct = total ? Math.round((present / total) * 100) : 0;
          return (
            <Card key={child.id} title={child.user?.name} subtitle={`${pct}% attendance · ${child.class?.name}`}>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {records.length === 0 ? <p className="text-slate-400 text-sm text-center py-6">No attendance records.</p> :
                  records.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50">
                      <span className="text-sm text-slate-700">{formatDate(r.date)}</span>
                      <Badge variant={STATUS_VARIANT[r.status] as any}>{r.status}</Badge>
                    </div>
                  ))}
              </div>
            </Card>
          );
        })}
    </div>
  );
}
