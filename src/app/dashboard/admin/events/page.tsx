"use client";
import { useEffect, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Button, Input } from "@/components/ui";
import { showToast } from "@/components/ui/toaster";
import { formatDate } from "@/lib/utils";

const EVENT_TYPES = ["general", "holiday", "exam", "sport", "cultural"];
const TYPE_COLORS: Record<string, string> = {
  holiday: "bg-red-100 text-red-700 border-red-200",
  exam: "bg-amber-100 text-amber-700 border-amber-200",
  sport: "bg-green-100 text-green-700 border-green-200",
  cultural: "bg-purple-100 text-purple-700 border-purple-200",
  general: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", startDate: "", endDate: "", location: "", type: "general" });

  useEffect(() => { loadEvents(); }, []);
  const loadEvents = () => {
    fetch("/api/events").then(r => r.json()).then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { showToast({ type: "success", title: "Event added!" }); setShowForm(false); loadEvents(); }
    setSubmitting(false);
  };

  const upcoming = events.filter(e => new Date(e.startDate) >= new Date());
  const past = events.filter(e => new Date(e.startDate) < new Date());

  return (
    <div className="space-y-6">
      <SectionHeader title="Events Calendar" subtitle="Manage school events, holidays and exams" action={<Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Event</Button>} />
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Add New Event">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <Input label="Event Title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Annual Sports Day" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Event Type</label>
                <select className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <Input label="Start Date *" type="date" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
              <Input label="End Date *" type="date" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
              <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="School Ground" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" />
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button type="submit" loading={submitting}>Add Event</Button>
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Upcoming */}
      <Card title="Upcoming Events">
        {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div> :
          upcoming.length === 0 ? <div className="text-center py-8 text-slate-400">No upcoming events. Add one above!</div> :
          <div className="space-y-3">
            {upcoming.map((ev: any) => (
              <div key={ev.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                <div className="text-center min-w-[52px] bg-brand-50 rounded-xl p-2">
                  <div className="text-xl font-bold text-brand-600 font-display leading-none">{new Date(ev.startDate).getDate()}</div>
                  <div className="text-xs text-brand-400">{new Date(ev.startDate).toLocaleDateString("en", { month: "short" })}</div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{ev.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{ev.location ? `📍 ${ev.location}` : ""}</div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${TYPE_COLORS[ev.type] || TYPE_COLORS.general}`}>{ev.type}</span>
              </div>
            ))}
          </div>}
      </Card>

      {/* Past */}
      {past.length > 0 && (
        <Card title="Past Events" subtitle="Previously held events">
          <div className="space-y-2">
            {past.slice(0, 5).map((ev: any) => (
              <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl opacity-60 hover:opacity-80 transition-opacity">
                <CalendarDays size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600 flex-1">{ev.title}</span>
                <span className="text-xs text-slate-400">{formatDate(ev.startDate)}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${TYPE_COLORS[ev.type] || TYPE_COLORS.general}`}>{ev.type}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
