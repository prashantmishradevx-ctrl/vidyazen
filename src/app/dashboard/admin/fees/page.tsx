"use client";
import { useEffect, useState } from "react";
import { CreditCard, Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Badge, Button, Input, DataTable, Skeleton } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { showToast } from "@/components/ui/toaster";

export default function FeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({ studentId: "", title: "", amount: "", dueDate: "" });

  useEffect(() => { loadFees(); fetch("/api/students").then(r => r.json()).then(setStudents); }, []);
  useEffect(() => { loadFees(); }, [filterStatus]);

  const loadFees = () => {
    setLoading(true);
    const params = filterStatus ? `?status=${filterStatus}` : "";
    fetch(`/api/fees${params}`).then(r => r.json())
      .then(d => { setFees(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/fees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        showToast({ type: "success", title: "Fee record created!" });
        setShowForm(false);
        setForm({ studentId: "", title: "", amount: "", dueDate: "" });
        loadFees();
      }
    } finally { setSubmitting(false); }
  };

  const markPaid = async (feeId: string) => {
    await fetch("/api/fees", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feeId, status: "PAID", paymentMode: "Cash" }) });
    showToast({ type: "success", title: "Fee marked as paid!" });
    loadFees();
  };

  const STATUS_BADGE: Record<string, string> = {
    PAID: "success", PENDING: "warning", OVERDUE: "danger", PARTIAL: "info",
  };

  const totalPending = fees.filter(f => f.status === "PENDING" || f.status === "OVERDUE").reduce((s, f) => s + f.amount, 0);
  const totalCollected = fees.filter(f => f.status === "PAID").reduce((s, f) => s + f.amount, 0);

  const columns = [
    { key: "student", label: "Student", render: (r: any) => <div><div className="font-medium text-slate-800">{r.student?.user?.name}</div><div className="text-xs text-slate-400">{r.student?.studentId}</div></div> },
    { key: "title", label: "Fee Type", render: (r: any) => <span className="font-medium">{r.title}</span> },
    { key: "amount", label: "Amount", render: (r: any) => <span className="font-bold text-slate-900">{formatCurrency(r.amount)}</span> },
    { key: "dueDate", label: "Due Date", render: (r: any) => <span className={new Date(r.dueDate) < new Date() && r.status !== "PAID" ? "text-red-600 font-medium" : ""}>{formatDate(r.dueDate)}</span> },
    { key: "status", label: "Status", render: (r: any) => <Badge variant={(STATUS_BADGE[r.status] || "default") as any}>{r.status}</Badge> },
    { key: "paidDate", label: "Paid Date", render: (r: any) => r.paidDate ? formatDate(r.paidDate) : "—" },
    { key: "actions", label: "Actions", render: (r: any) => r.status !== "PAID" ? (
      <Button size="sm" variant="secondary" onClick={() => markPaid(r.id)}><CheckCircle size={13} /> Mark Paid</Button>
    ) : <span className="text-green-600 text-xs font-semibold flex items-center gap-1"><CheckCircle size={13} /> Paid</span> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Fee Management"
        subtitle="Track and collect student fees"
        action={<Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add Fee Record</Button>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="text-2xl font-bold text-green-700 font-display">{formatCurrency(totalCollected)}</div>
          <div className="text-sm text-green-600 mt-1">Total Collected</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="text-2xl font-bold text-amber-700 font-display">{formatCurrency(totalPending)}</div>
          <div className="text-sm text-amber-600 mt-1">Pending Dues</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 col-span-2 md:col-span-1">
          <div className="text-2xl font-bold text-slate-700 font-display">{fees.length}</div>
          <div className="text-sm text-slate-500 mt-1">Total Records</div>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card title="Create Fee Record">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Student *</label>
                <select required className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
                  <option value="">Select student</option>
                  {(Array.isArray(students) ? students : []).map((s: any) => <option key={s.id} value={s.id}>{s.user?.name} ({s.studentId})</option>)}
                </select>
              </div>
              <Input label="Fee Title *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Tuition Fee - Jan 2025" />
              <Input label="Amount (₹) *" type="number" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="5000" />
              <Input label="Due Date *" type="date" required value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button type="submit" loading={submitting}>Create Fee Record</Button>
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "PENDING", "PAID", "OVERDUE"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterStatus === s ? "bg-brand-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <Card>
        {loading ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
          : <DataTable columns={columns} data={fees} emptyMessage="No fee records found." />}
      </Card>
    </div>
  );
}
