"use client";
import { useEffect, useState } from "react";
import { Bell, Pin, Clock } from "lucide-react";
import { SectionHeader, Card, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements").then(r => r.json())
      .then(d => { setAnnouncements(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Announcements" subtitle="Stay updated with school news and notices" />
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-28 shimmer rounded-2xl" />)
        ) : announcements.length === 0 ? (
          <Card><div className="text-center py-12 text-slate-400"><Bell size={40} className="mx-auto mb-3 text-slate-300" /><p>No announcements at this time.</p></div></Card>
        ) : (
          announcements.map((ann: any) => (
            <div key={ann.id} className={`bg-white rounded-2xl border p-5 ${ann.isPinned ? "border-brand-200 bg-brand-50/20" : "border-slate-200"}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell size={16} className="text-brand-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {ann.isPinned && <span className="flex items-center gap-1 text-xs font-semibold text-brand-600"><Pin size={11} /> Pinned</span>}
                    <h3 className="font-semibold text-slate-900">{ann.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <Clock size={11} /> {formatDate(ann.publishedAt)} · {ann.author?.name}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
