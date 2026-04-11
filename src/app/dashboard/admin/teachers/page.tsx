"use client";
import { useEffect, useState } from "react";
import { UserCheck, Plus, Search, Mail, Phone, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Badge, Button, Input, DataTable, Skeleton } from "@/components/ui";
import { getAvatarUrl } from "@/lib/utils";
import { showToast } from "@/components/ui/toaster";
import Image from "next/image";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", qualification: "", experience: "", specialization: "", salary: "" });

  useEffect(() => { loadTeachers(); }, []);

  const loadTeachers = () => {
    setLoading(true);
    fetch("/api/teachers").then(r => r.json())
      .then(d => { setTeachers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        showToast({ type: "success", title: "Teacher added successfully!" });
        setShowForm(false);
        setForm({ name: "", email: "", phone: "", qualification: "", experience: "", specialization: "", salary: "" });
        loadTeachers();
      } else {
        const err = await res.json();
        showToast({ type: "error", title: "Error", message: err.error });
      }
    } finally { setSubmitting(false); }
  };

  const columns = [
    {
      key: "teacher",
      label: "Teacher",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-violet-100 shrink-0">
            <Image src={getAvatarUrl(row.user?.name || "")} alt="" width={36} height={36} />
          </div>
          <div>
            <div className="font-semibold text-slate-800">{row.user?.name}</div>
            <div className="text-xs text-slate-400">{row.employeeId}</div>
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email", render: (r: any) => (
      <a href={`mailto:${r.user?.email}`} className="flex items-center gap-1.5 text-brand-600 hover:underline text-sm">
        <Mail size={13} />{r.user?.email}
      </a>
    )},
    { key: "phone", label: "Phone", render: (r: any) => <span className="text-slate-500 text-sm flex items-center gap-1.5"><Phone size={13} />{r.user?.phone || "—"}</span> },
    { key: "spec", label: "Specialization", render: (r: any) => r.specialization ? <Badge variant="info">{r.specialization}</Badge> : "—" },
    { key: "qual", label: "Qualification", render: (r: any) => <span className="text-sm text-slate-600">{r.qualification || "—"}</span> },
    { key: "exp", label: "Exp.", render: (r: any) => <span className="text-sm font-medium">{r.experience || 0} yrs</span> },
    { key: "classes", label: "Classes", render: (r: any) => (
      <div className="flex items-center gap-1 text-sm">
        <BookOpen size={13} className="text-slate-400" />
        <span>{r._count?.classes || 0} classes</span>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Teachers"
        subtitle={`${teachers.length} teachers on staff`}
        action={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={15} /> Add Teacher
          </Button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Add New Teacher">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Full Name *" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Teacher name" />
              <Input label="Email *" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="teacher@vidyazen.edu" />
              <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
              <Input label="Qualification" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} placeholder="M.Sc Mathematics" />
              <Input label="Specialization" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} placeholder="Mathematics" />
              <Input label="Experience (years)" type="number" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} placeholder="5" />
              <Input label="Salary (₹/month)" type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="45000" />
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
                <Button type="submit" loading={submitting}>Add Teacher</Button>
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <Card>
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
        ) : (
          <DataTable columns={columns} data={teachers} emptyMessage="No teachers found. Add your first teacher!" />
        )}
      </Card>
    </div>
  );
}
