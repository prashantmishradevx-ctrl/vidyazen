"use client";
import { useEffect, useState } from "react";
import { Megaphone, Plus, Pin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Badge, Button, Input } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { showToast } from "@/components/ui/toaster";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", targetRole: "", isPinned: false });

  useEffect(() => { loadAnnouncements(); }, []);

  const loadAnnouncements = () => {
    fetch("/api/announcements").then(r => r.json())
      .then(d => { setAnnouncements(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        showToast({ type: "success", title: "Announcement posted!" });
        setShowForm(false);
        setForm({ title: "", content: "", targetRole: "", isPinned: false });
        loadAnnouncements();
      }
    } finally { setSubmitting(false); }
  };

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    TEACHER: "bg-blue-100 text-blue-700",
    STUDENT: "bg-green-100 text-green-700",
    PARENT: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Announcements"
        subtitle="Broadcast messages to your school community"
        action={<Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> New Announcement</Button>}
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Create Announcement">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Announcement title" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Content *</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your announcement message..."
                  className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Target Audience</label>
                  <select
                    className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white"
                    value={form.targetRole}
                    onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
                  >
                    <option value="">Everyone</option>
                    <option value="STUDENT">Students Only</option>
                    <option value="TEACHER">Teachers Only</option>
                    <option value="PARENT">Parents Only</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Pin this announcement?</label>
                  <label className="flex items-center gap-3 cursor-pointer mt-2.5">
                    <input
                      type="checkbox"
                      checked={form.isPinned}
                      onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))}
                      className="w-4 h-4 rounded accent-brand-500"
                    />
                    <span className="text-sm text-slate-600">Show at top of announcements</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={submitting}><Megaphone size={15} /> Post Announcement</Button>
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)
        ) : announcements.length === 0 ? (
          <Card><div className="text-center py-12 text-slate-400">No announcements yet. Post your first announcement!</div></Card>
        ) : (
          announcements.map((ann: any, i: number) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border p-6 ${ann.isPinned ? "border-brand-200 bg-brand-50/30" : "border-slate-200"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {ann.isPinned && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-brand-600">
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                    <h3 className="font-display font-semibold text-slate-900">{ann.title}</h3>
                    {ann.targetRole && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ROLE_COLORS[ann.targetRole] || "bg-slate-100 text-slate-600"}`}>
                        {ann.targetRole}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">{ann.content}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={12} />
                    {formatDate(ann.publishedAt)} · By {ann.author?.name}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
