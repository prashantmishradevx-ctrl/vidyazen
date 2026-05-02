"use client";
import { useEffect, useState } from "react";
import { Users, Plus, Search, Download, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Badge, Button, Input, DataTable, Skeleton, EmptyState } from "@/components/ui";
import { formatDate, getAvatarUrl } from "@/lib/utils";
import { showToast } from "@/components/ui/toaster";
import Image from "next/image";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", dateOfBirth: "", classId: "", sectionId: "", rollNumber: "" });

  useEffect(() => {
    loadStudents();
    fetch("/api/classes").then(r => r.json()).then(setClasses);
  }, []);

  const loadStudents = () => {
    setLoading(true);
    fetch(`/api/students${search ? `?search=${search}` : ""}`)
      .then(r => r.json())
      .then(d => { setStudents(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(loadStudents, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast({ type: "success", title: "Student added successfully!" });
        setShowForm(false);
        setForm({ name: "", email: "", phone: "", dateOfBirth: "", classId: "", sectionId: "", rollNumber: "" });
        loadStudents();
      } else {
        const err = await res.json();
        showToast({ type: "error", title: "Error", message: err.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "student",
      label: "Student",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-brand-100 shrink-0">
            <Image src={getAvatarUrl(row.user?.name || "")} alt="" width={36} height={36} />
          </div>
          <div>
            <div className="font-semibold text-slate-800">{row.user?.name}</div>
            <div className="text-xs text-slate-400">{row.studentId}</div>
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (row: any) => <span className="text-slate-500">{row.user?.email}</span> },
    {
      key: "class",
      label: "Class",
      render: (row: any) => row.class ? (
        <Badge variant="info">{row.class.className || row.class.name}{row.section ? ` - ${row.section.sectionName}` : ""}</Badge>
      ) : <span className="text-slate-400">—</span>,
    },
    { key: "roll", label: "Roll No", render: (row: any) => <span className="font-mono text-sm">{row.rollNumber || "—"}</span> },
    {
      key: "parent",
      label: "Parent",
      render: (row: any) => row.parent?.user?.name ? (
        <div>
          <div className="text-sm">{row.parent.user.name}</div>
          <div className="text-xs text-slate-400">{row.parent.user.phone || ""}</div>
        </div>
      ) : <span className="text-slate-400">—</span>,
    },
    {
      key: "dob",
      label: "Date of Birth",
      render: (row: any) => row.user?.dateOfBirth ? formatDate(row.user.dateOfBirth) : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: () => (
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Edit size={15} />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Students"
        subtitle={`${students.length} students enrolled`}
        action={
          <div className="flex gap-3">
            <Button variant="secondary" size="sm">
              <Download size={15} /> Export
            </Button>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus size={15} /> Add Student
            </Button>
          </div>
        }
      />

      {/* Add Student Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Add New Student">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Full Name *"
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Student full name"
              />
              <Input
                label="Email *"
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="student@vidyazen.edu"
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
              <Input
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Class</label>
                <select
                  className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-white"
                  value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value, sectionId: "" }))}
                >
                  <option value="">Select class</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.className || c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Section</label>
                <select
                  className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-white"
                  value={form.sectionId}
                  onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))}
                  disabled={!form.classId}
                >
                  <option value="">Select section</option>
                  {(classes.find((c: any) => c.id === form.classId)?.sections || []).map((s: any) => (
                    <option key={s.id} value={s.id}>Section {s.sectionName}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Roll Number"
                value={form.rollNumber}
                onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))}
                placeholder="01"
              />
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
                <Button type="submit" loading={submitting}>Add Student</Button>
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search students by name..."
          className="w-full max-w-sm pl-10 pr-4 py-2.5 border border-slate-200 focus:border-brand-500 rounded-xl text-sm outline-none bg-white"
        />
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <DataTable columns={columns} data={students} emptyMessage="No students found. Add your first student!" />
        )}
      </Card>
    </div>
  );
}
