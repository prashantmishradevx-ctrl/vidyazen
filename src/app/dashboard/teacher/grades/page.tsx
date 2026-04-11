"use client";
import { useEffect, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Badge, Button, Input, DataTable } from "@/components/ui";
import { formatDate, getGrade } from "@/lib/utils";
import { showToast } from "@/components/ui/toaster";

const EXAM_TYPES = ["UNIT_TEST", "MID_TERM", "FINAL", "ASSIGNMENT", "PROJECT"];
const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-green-100 text-green-700", A: "bg-green-100 text-green-600",
  "B+": "bg-blue-100 text-blue-700", B: "bg-blue-100 text-blue-600",
  "C": "bg-amber-100 text-amber-700", D: "bg-orange-100 text-orange-700", F: "bg-red-100 text-red-700",
};

export default function TeacherGradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ studentId: "", subjectId: "", examType: "UNIT_TEST", marks: "", maxMarks: "100", examDate: new Date().toISOString().split("T")[0], remarks: "" });

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      setTeacherId(d.teacher?.id || "");
      const subj = d.teacher?.subjects?.map((ts: any) => ts.subject) || [];
      setSubjects(subj);
      const classIds = d.teacher?.classes?.map((c: any) => c.id) || [];
      if (classIds.length > 0) {
        fetch(`/api/students?classId=${classIds[0]}`).then(r => r.json()).then(data => setStudents(Array.isArray(data) ? data : []));
      }
    });
    loadGrades();
  }, []);

  const loadGrades = () => {
    fetch("/api/grades").then(r => r.json()).then(d => setGrades(Array.isArray(d) ? d : []));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, teacherId }),
      });
      if (res.ok) {
        showToast({ type: "success", title: "Grade recorded!" });
        setShowForm(false);
        setForm({ studentId: "", subjectId: "", examType: "UNIT_TEST", marks: "", maxMarks: "100", examDate: new Date().toISOString().split("T")[0], remarks: "" });
        loadGrades();
      }
    } finally { setSubmitting(false); }
  };

  const columns = [
    { key: "student", label: "Student", render: (r: any) => <span className="font-medium">{r.student?.user?.name}</span> },
    { key: "subject", label: "Subject", render: (r: any) => <Badge variant="info">{r.subject?.name}</Badge> },
    { key: "examType", label: "Exam", render: (r: any) => <span className="text-xs text-slate-500">{r.examType?.replace("_", " ")}</span> },
    { key: "marks", label: "Marks", render: (r: any) => <span className="font-bold">{r.marks}/{r.maxMarks}</span> },
    { key: "pct", label: "%", render: (r: any) => <span>{Math.round((r.marks / r.maxMarks) * 100)}%</span> },
    { key: "grade", label: "Grade", render: (r: any) => <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${GRADE_COLORS[r.grade] || "bg-slate-100 text-slate-700"}`}>{r.grade}</span> },
    { key: "date", label: "Date", render: (r: any) => formatDate(r.examDate) },
  ];

  const liveGrade = form.marks && form.maxMarks ? getGrade((Number(form.marks) / Number(form.maxMarks)) * 100) : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Grades & Results"
        subtitle="Record exam scores and track student performance"
        action={<Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Grade</Button>}
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Record New Grade">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Student *</label>
                <select required className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
                  <option value="">Select student</option>
                  {students.map((s: any) => <option key={s.id} value={s.id}>{s.user?.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Subject *</label>
                <select required className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))}>
                  <option value="">Select subject</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Exam Type *</label>
                <select required className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" value={form.examType} onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}>
                  {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Marks Obtained *</label>
                <input required type="number" min={0} max={Number(form.maxMarks)} value={form.marks} onChange={e => setForm(f => ({ ...f, marks: e.target.value }))} placeholder="75"
                  className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" />
              </div>
              <Input label="Max Marks" type="number" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))} />
              <Input label="Exam Date *" type="date" required value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} />
              {liveGrade && (
                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600">Live grade preview:</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${GRADE_COLORS[liveGrade] || ""}`}>{liveGrade}</span>
                  <span className="text-sm text-slate-500">({Math.round((Number(form.marks) / Number(form.maxMarks)) * 100)}%)</span>
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
                <Button type="submit" loading={submitting}>Save Grade</Button>
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      <Card title="Grade Records">
        <DataTable columns={columns} data={grades} emptyMessage="No grades recorded yet. Start by adding a grade above." />
      </Card>
    </div>
  );
}
