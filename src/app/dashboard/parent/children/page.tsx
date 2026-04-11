"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { SectionHeader, Card } from "@/components/ui";
import { getAvatarUrl } from "@/lib/utils";
import Image from "next/image";

export default function ParentChildrenPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const children = data?.parent?.students || [];
  return (
    <div className="space-y-6">
      <SectionHeader title="My Children" subtitle="Overview of your children's profiles" />
      {loading ? <div className="h-64 shimmer rounded-2xl" /> :
        children.length === 0 ? <Card><div className="text-center py-16 text-slate-400"><Users size={40} className="mx-auto mb-3 text-slate-300" /><p>No children linked to your account.</p></div></Card> :
        <div className="grid sm:grid-cols-2 gap-4">
          {children.map((child: any) => {
            const grades = child.grades || [], attendance = child.attendance || [];
            const pct = attendance.length ? Math.round(attendance.filter((a: any) => a.status === "PRESENT").length / attendance.length * 100) : 0;
            const avg = grades.length ? Math.round(grades.reduce((s: number, g: any) => s + (g.marks/g.maxMarks)*100, 0) / grades.length) : 0;
            return (
              <Card key={child.id}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-100">
                    <Image src={getAvatarUrl(child.user?.name || "")} alt="" width={64} height={64} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900">{child.user?.name}</h3>
                    <p className="text-sm text-slate-500">{child.class?.name}</p>
                    <p className="text-xs text-slate-400">ID: {child.studentId} · Roll: {child.rollNumber || "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-green-700">{pct}%</div>
                    <div className="text-xs text-green-600">Attendance</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-blue-700">{avg}%</div>
                    <div className="text-xs text-blue-600">Avg Score</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>}
    </div>
  );
}
