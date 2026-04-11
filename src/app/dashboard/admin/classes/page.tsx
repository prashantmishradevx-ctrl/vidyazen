"use client";
import { useEffect, useState } from "react";
import { BookOpen, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Button, Input, DataTable } from "@/components/ui";
import { showToast } from "@/components/ui/toaster";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", section: "", teacherId: "", capacity: "40", room: "", academicYear: "2024-25" });

  useEffect(() => { loadClasses(); fetch("/api/teachers").then(r => r.json()).then(d => setTeachers(Array.isArray(d) ? d : [])); }, []);
  const loadClasses = () => {
    setLoading(true);
    fetch("/api/classes").then(r => r.json()).then(d => { setClasses(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    const res = await fetch("/api/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { showToast({ type: "success", title: "Class created!" }); setShowForm(false); loadClasses(); }
    else { const err = await res.json(); showToast({ type: "error", title: err.error }); }
    setSubmitting(false);
  };

  const columns = [
    { key: "name", label: "Class Name", render: (r: any) => <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center"><BookOpen size={14} className="text-brand-600" /></div><span className="font-semibold">{r.name}</span></div> },
    { key: "teacher", label: "Class Teacher", render: (r: any) => r.teacher?.user?.name || "—" },
    { key: "students", label: "Students", render: (r: any) => <div className="flex items-center gap-1.5"><Users size={13} className="text-slate-400" /><span>{r._count?.students || 0}/{r.capacity}</span></div> },
    { key: "room", label: "Room", render: (r: any) => r.room || "—" },
    { key: "year", label: "Academic Year", render: (r: any) => <span className="text-slate-500">{r.academicYear}</span> },
    { key: "subjects", label: "Subjects", render: (r: any) => <span>{r.subjects?.length || 0} subjects</span> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Classes" subtitle={`${classes.length} classes this academic year`} action={<Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Class</Button>} />
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Create New Class">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Class Name *" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Grade 10A" />
              <Input label="Grade *" required value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="10" />
              <Input label="Section *" required value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} placeholder="A" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Class Teacher</label>
                <select className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}>
                  <option value="">Select teacher</option>
                  {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.user?.name}</option>)}
                </select>
              </div>
              <Input label="Room" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} placeholder="Room 101" />
              <Input label="Capacity" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="40" />
              <Input label="Academic Year" value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} placeholder="2024-25" />
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
                <Button type="submit" loading={submitting}>Create Class</Button>
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}
      <Card>
        {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
          : <DataTable columns={columns} data={classes} emptyMessage="No classes yet. Create your first class!" />}
      </Card>
    </div>
  );
}
