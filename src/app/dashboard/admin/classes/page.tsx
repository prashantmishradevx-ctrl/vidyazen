"use client";
import { useEffect, useState } from "react";
import { BookOpen, Edit, Plus, Trash2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Button, Input, DataTable } from "@/components/ui";
import { showToast } from "@/components/ui/toaster";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", teacherId: "", capacity: "120", room: "", academicYear: "2024-25" });
  const [sectionForm, setSectionForm] = useState({ classId: "", sectionName: "A", teacherId: "", capacity: "40", room: "" });

  useEffect(() => {
    loadClasses();
    fetch("/api/teachers").then((r) => r.json()).then((d) => setTeachers(Array.isArray(d) ? d : []));
  }, []);

  const loadClasses = () => {
    setLoading(true);
    fetch("/api/classes")
      .then((r) => r.json())
      .then((d) => { setClasses(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      showToast({ type: "success", title: "Class created!" });
      setShowForm(false);
      setForm({ name: "", grade: "", teacherId: "", capacity: "120", room: "", academicYear: "2024-25" });
      loadClasses();
    } else {
      const err = await res.json();
      showToast({ type: "error", title: err.error });
    }
    setSubmitting(false);
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/sections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sectionForm) });
    if (res.ok) {
      showToast({ type: "success", title: "Section created!" });
      setShowSectionForm(false);
      setSectionForm({ classId: "", sectionName: "A", teacherId: "", capacity: "40", room: "" });
      loadClasses();
    } else {
      const err = await res.json();
      showToast({ type: "error", title: err.error });
    }
    setSubmitting(false);
  };

  const updateClass = async (cls: any) => {
    const name = window.prompt("Class name", cls.className || cls.name);
    if (!name) return;
    const grade = window.prompt("Grade", cls.grade) || cls.grade;
    const res = await fetch("/api/classes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...cls, name, className: name, grade }) });
    if (res.ok) { showToast({ type: "success", title: "Class updated" }); loadClasses(); }
  };

  const deleteClass = async (id: string) => {
    if (!window.confirm("Delete this class and its sections?")) return;
    const res = await fetch(`/api/classes?id=${id}`, { method: "DELETE" });
    if (res.ok) { showToast({ type: "success", title: "Class deleted" }); loadClasses(); }
  };

  const updateSection = async (section: any) => {
    const sectionName = window.prompt("Section name", section.sectionName);
    if (!sectionName) return;
    const res = await fetch("/api/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...section, sectionName }),
    });
    if (res.ok) { showToast({ type: "success", title: "Section updated" }); loadClasses(); }
  };

  const deleteSection = async (id: string) => {
    if (!window.confirm("Delete this section?")) return;
    const res = await fetch(`/api/sections?id=${id}`, { method: "DELETE" });
    if (res.ok) { showToast({ type: "success", title: "Section deleted" }); loadClasses(); }
  };

  const columns = [
    { key: "name", label: "Class Name", render: (r: any) => <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center"><BookOpen size={14} className="text-brand-600" /></div><span className="font-semibold">{r.className || r.name}</span></div> },
    { key: "teacher", label: "Class Teacher", render: (r: any) => r.teacher?.user?.name || "-" },
    { key: "sections", label: "Sections", render: (r: any) => <span>{r.sections?.map((s: any) => s.sectionName).join(", ") || "-"}</span> },
    { key: "students", label: "Students", render: (r: any) => <div className="flex items-center gap-1.5"><Users size={13} className="text-slate-400" /><span>{r._count?.students || 0}/{r.capacity}</span></div> },
    { key: "room", label: "Room", render: (r: any) => r.room || "-" },
    { key: "year", label: "Academic Year", render: (r: any) => <span className="text-slate-500">{r.academicYear}</span> },
    { key: "subjects", label: "Subjects", render: (r: any) => <span>{r.subjects?.length || 0} subjects</span> },
    { key: "actions", label: "Actions", render: (r: any) => <div className="flex gap-2"><button onClick={() => updateClass(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"><Edit size={15} /></button><button onClick={() => deleteClass(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={15} /></button></div> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Classes"
        subtitle={`${classes.length} classes this academic year`}
        action={<div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setShowSectionForm(!showSectionForm)}><Plus size={15} /> Add Section</Button><Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Class</Button></div>}
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Create New Class">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Class Name *" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Class 1" />
              <Input label="Grade *" required value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} placeholder="1" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Class Teacher</label>
                <select className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" value={form.teacherId} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}>
                  <option value="">Select teacher</option>
                  {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.user?.name}</option>)}
                </select>
              </div>
              <Input label="Room" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="Block 1" />
              <Input label="Capacity" type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="120" />
              <Input label="Academic Year" value={form.academicYear} onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))} placeholder="2024-25" />
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
                <Button type="submit" loading={submitting}>Create Class</Button>
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {showSectionForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Create New Section">
            <form onSubmit={handleSectionSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Class *</label>
                <select required className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" value={sectionForm.classId} onChange={(e) => setSectionForm((f) => ({ ...f, classId: e.target.value }))}>
                  <option value="">Select class</option>
                  {classes.map((c: any) => <option key={c.id} value={c.id}>{c.className || c.name}</option>)}
                </select>
              </div>
              <Input label="Section Name *" required value={sectionForm.sectionName} onChange={(e) => setSectionForm((f) => ({ ...f, sectionName: e.target.value.toUpperCase() }))} placeholder="A" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Section Teacher</label>
                <select className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" value={sectionForm.teacherId} onChange={(e) => setSectionForm((f) => ({ ...f, teacherId: e.target.value }))}>
                  <option value="">Select teacher</option>
                  {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.user?.name}</option>)}
                </select>
              </div>
              <Input label="Room" value={sectionForm.room} onChange={(e) => setSectionForm((f) => ({ ...f, room: e.target.value }))} placeholder="Room 1A" />
              <Input label="Capacity" type="number" value={sectionForm.capacity} onChange={(e) => setSectionForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="40" />
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
                <Button type="submit" loading={submitting}>Create Section</Button>
                <Button variant="secondary" type="button" onClick={() => setShowSectionForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <Card>
        {loading ? <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
          : <DataTable columns={columns} data={classes} emptyMessage="No classes yet. Create your first class!" />}
      </Card>

      <Card title="Section Management">
        <div className="space-y-3">
          {classes.flatMap((cls: any) => (cls.sections || []).map((section: any) => (
            <div key={section.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div>
                <div className="font-semibold text-slate-800">{cls.className || cls.name} - Section {section.sectionName}</div>
                <div className="text-xs text-slate-500">{section.teacher?.user?.name || "No teacher assigned"} · {section._count?.students || 0}/{section.capacity} students</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateSection(section)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50"><Edit size={15} /></button>
                <button onClick={() => deleteSection(section.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
              </div>
            </div>
          )))}
        </div>
      </Card>
    </div>
  );
}
