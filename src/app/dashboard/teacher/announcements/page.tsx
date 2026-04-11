"use client";
import { useEffect, useState } from "react";
import { Bell, Plus, Pin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Button, Input } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { showToast } from "@/components/ui/toaster";

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", targetRole: "STUDENT" });

  useEffect(() => { loadAnnouncements(); }, []);
  const loadAnnouncements = () => {
    fetch("/api/announcements").then(r => r.json()).then(d => { setAnnouncements(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const res = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { showToast({ type: "success", title: "Posted!" }); setShowForm(false); loadAnnouncements(); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Announcements" subtitle="Post and view school announcements" action={<Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Post</Button>} />
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="New Announcement">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Content *</label>
                <textarea required rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-2"><Button type="submit" loading={submitting}>Post</Button><Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button></div>
            </form>
          </Card>
        </motion.div>
      )}
      <div className="space-y-3">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="h-24 shimmer rounded-2xl" />) :
          announcements.map((ann: any) => (
            <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center shrink-0"><Bell size={16} className="text-brand-600" /></div>
                <div><div className="flex items-center gap-2 mb-1">{ann.isPinned && <Pin size={12} className="text-brand-600" />}<h3 className="font-semibold text-slate-900">{ann.title}</h3></div><p className="text-sm text-slate-600">{ann.content}</p><div className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Clock size={11} />{formatDate(ann.publishedAt)}</div></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
