"use client";
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, CreditCard } from "lucide-react";
import { SectionHeader, Card, StatCard } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const MOCK_GRADE_DIST = [
  { grade: "A+", count: 45, fill: "#22c55e" },
  { grade: "A", count: 82, fill: "#86efac" },
  { grade: "B+", count: 63, fill: "#3b82f6" },
  { grade: "B", count: 41, fill: "#93c5fd" },
  { grade: "C", count: 28, fill: "#f59e0b" },
  { grade: "D", count: 15, fill: "#fb923c" },
  { grade: "F", count: 8, fill: "#ef4444" },
];

const MOCK_MONTHLY_ATT = [
  { month: "Jun", rate: 92 }, { month: "Jul", rate: 88 }, { month: "Aug", rate: 91 },
  { month: "Sep", rate: 87 }, { month: "Oct", rate: 93 }, { month: "Nov", rate: 89 },
  { month: "Dec", rate: 78 }, { month: "Jan", rate: 90 }, { month: "Feb", rate: 85 },
];

const MOCK_FEE_COLLECTION = [
  { month: "Oct", collected: 180000, pending: 45000 },
  { month: "Nov", collected: 210000, pending: 32000 },
  { month: "Dec", collected: 195000, pending: 38000 },
  { month: "Jan", collected: 245000, pending: 28000 },
  { month: "Feb", collected: 220000, pending: 42000 },
  { month: "Mar", collected: 235000, pending: 35000 },
];

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => setStats(d?.stats));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Reports & Analytics" subtitle="Comprehensive school performance overview" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} iconColor="bg-blue-500" />
        <StatCard title="Total Teachers" value={stats?.totalTeachers || 0} icon={Users} iconColor="bg-violet-500" />
        <StatCard title="Fee Collected" value={formatCurrency(stats?.paidFees?.amount || 0)} icon={CreditCard} iconColor="bg-green-500" />
        <StatCard title="Pending Dues" value={formatCurrency(stats?.pendingFees?.amount || 0)} icon={CreditCard} iconColor="bg-amber-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Grade Distribution" subtitle="All students across all subjects">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_GRADE_DIST} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="grade" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {MOCK_GRADE_DIST.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Monthly Attendance Rate" subtitle="School-wide attendance trend (%)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_MONTHLY_ATT} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: any) => [`${v}%`, "Attendance"]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="rate" stroke="#0f87e8" strokeWidth={2.5} dot={{ fill: "#0f87e8", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Fee Collection vs Pending" subtitle="Monthly comparison (₹)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MOCK_FEE_COLLECTION} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => [formatCurrency(v)]} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
            <Bar dataKey="collected" fill="#22c55e" radius={[4, 4, 0, 0]} name="Collected" />
            <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="w-3 h-3 rounded-full bg-green-500" />Collected</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600"><span className="w-3 h-3 rounded-full bg-amber-500" />Pending</div>
        </div>
      </Card>

      {/* Summary table */}
      <Card title="Academic Performance Summary">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {["Metric", "This Month", "Last Month", "Change"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { metric: "Average Attendance", curr: "89%", prev: "87%", change: "+2%", pos: true },
                { metric: "Average Score", curr: "74%", prev: "71%", change: "+3%", pos: true },
                { metric: "Fee Collection Rate", curr: "86%", prev: "82%", change: "+4%", pos: true },
                { metric: "Absent Students", curr: "42", prev: "51", change: "-18%", pos: true },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.metric}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.curr}</td>
                  <td className="px-4 py-3 text-slate-500">{row.prev}</td>
                  <td className="px-4 py-3"><span className={`font-semibold ${row.pos ? "text-green-600" : "text-red-600"}`}>{row.change}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
