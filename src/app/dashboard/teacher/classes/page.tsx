"use client";
import { useEffect, useState } from "react";
import { BookOpen, Users } from "lucide-react";
import { SectionHeader, Card } from "@/components/ui";

export default function TeacherClassesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const classes = data?.teacher?.classes || [];

  return (
    <div className="space-y-6">
      <SectionHeader title="My Classes" subtitle="Classes assigned to you this academic year" />
      {loading ? <div className="grid sm:grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <div key={i} className="h-40 shimmer rounded-2xl" />)}</div> :
        classes.length === 0 ? <Card><div className="text-center py-12 text-slate-400">No classes assigned yet.</div></Card> :
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls: any) => (
            <Card key={cls.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center">
                  <BookOpen size={22} className="text-brand-600" />
                </div>
                <div><h3 className="font-display font-bold text-slate-900">{cls.name}</h3><p className="text-sm text-slate-500">Room: {cls.room || "—"}</p></div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={16} className="text-slate-400" />
                <span>{cls._count?.students || 0} students enrolled</span>
              </div>
            </Card>
          ))}
        </div>}
    </div>
  );
}
