"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, UserCheck, BookOpen, CreditCard, TrendingUp,
  AlertTriangle, Bell, Calendar, CheckCircle, ArrowRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { StatCard, Card, Badge, EmptyState } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const ATTENDANCE_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#3b82f6"];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-72 shimmer rounded-2xl" />
          <div className="h-72 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const announcements = data?.recentAnnouncements || [];
  const events = data?.upcomingEvents || [];
  const recentAttendance = data?.recentAttendance || [];

  // Mock chart data if no DB data yet
  const attendanceTrend = data?.attendanceTrend?.length > 0
    ? data.attendanceTrend
    : [
        { day: "Mon", present: 38, absent: 4, total: 42 },
        { day: "Tue", present: 40, absent: 2, total: 42 },
        { day: "Wed", present: 35, absent: 7, total: 42 },
        { day: "Thu", present: 41, absent: 1, total: 42 },
        { day: "Fri", present: 39, absent: 3, total: 42 },
      ];

  const feeData = [
    { name: "Paid", value: stats.paidFees?.amount || 245000, fill: "#22c55e" },
    { name: "Pending", value: stats.pendingFees?.amount || 82000, fill: "#f59e0b" },
  ];

  const monthlyRevenue = [
    { month: "Sep", amount: 180000 },
    { month: "Oct", amount: 210000 },
    { month: "Nov", amount: 195000 },
    { month: "Dec", amount: 220000 },
    { month: "Jan", amount: 245000 },
    { month: "Feb", amount: 235000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          href="/dashboard/admin/announcements"
          className="hidden sm:flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105"
        >
          <Bell size={16} /> New Announcement
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={Users}
          iconColor="bg-blue-500"
          trend={{ value: 12, label: "this month" }}
          delay={0}
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers || 0}
          icon={UserCheck}
          iconColor="bg-violet-500"
          delay={0.05}
        />
        <StatCard
          title="Active Classes"
          value={stats.totalClasses || 0}
          icon={BookOpen}
          iconColor="bg-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Fee Due"
          value={formatCurrency(stats.pendingFees?.amount || 0)}
          subtitle={`${stats.pendingFees?.count || 0} pending`}
          icon={CreditCard}
          iconColor="bg-amber-500"
          delay={0.15}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance chart */}
        <Card title="Weekly Attendance" subtitle="This week's presence rate" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={attendanceTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="present" stroke="#22c55e" strokeWidth={2} fill="url(#presentGrad)" name="Present" />
              <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} fill="url(#absentGrad)" name="Absent" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Fee Status Pie */}
        <Card title="Fee Collection" subtitle="Current period status">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {feeData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ borderRadius: "12px", border: "none" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {feeData.map((f) => (
              <div key={f.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: f.fill }} />
                {f.name}: {formatCurrency(f.value)}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Revenue */}
      <Card title="Monthly Fee Collection" subtitle="Last 6 months revenue trend">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }} />
            <Bar dataKey="amount" fill="#0f87e8" radius={[6, 6, 0, 0]} name="Collection" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Recent Attendance Updates" subtitle="Latest records submitted by teachers">
        <div className="space-y-3">
          {recentAttendance.length === 0 ? (
            <EmptyState icon={Calendar} title="No attendance updates" description="Teacher attendance updates will appear here." />
          ) : (
            recentAttendance.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{record.student?.user?.name}</div>
                  <div className="text-xs text-slate-400">
                    {record.class?.className || record.class?.name}{record.section ? ` · Section ${record.section.sectionName}` : ""} · {formatDate(record.date)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-xs text-slate-400">By {record.teacher?.user?.name || "Teacher"}</span>
                  <Badge variant={record.status === "PRESENT" ? "success" : record.status === "ABSENT" ? "danger" : record.status === "LATE" ? "warning" : "info"}>{record.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card title="Recent Announcements" subtitle="Latest from the school">
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <EmptyState icon={Bell} title="No announcements" description="Post your first announcement to get started" />
            ) : (
              announcements.slice(0, 4).map((ann: any) => (
                <div key={ann.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                    <Bell size={14} className="text-brand-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 truncate">{ann.title}</span>
                      {ann.isPinned && <Badge variant="info">Pinned</Badge>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(ann.publishedAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/dashboard/admin/announcements" className="flex items-center gap-1.5 text-brand-600 text-sm font-medium mt-4 hover:gap-2.5 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </Card>

        {/* Upcoming Events */}
        <Card title="Upcoming Events" subtitle="Next scheduled events">
          <div className="space-y-3">
            {events.length === 0 ? (
              <EmptyState icon={Calendar} title="No upcoming events" description="Add events to the calendar" />
            ) : (
              events.slice(0, 4).map((ev: any) => {
                const typeColors: Record<string, string> = {
                  holiday: "bg-red-100 text-red-700",
                  exam: "bg-amber-100 text-amber-700",
                  sport: "bg-green-100 text-green-700",
                  cultural: "bg-purple-100 text-purple-700",
                  general: "bg-slate-100 text-slate-700",
                };
                return (
                  <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="text-center min-w-[44px]">
                      <div className="text-lg font-bold text-brand-600 font-display leading-none">
                        {new Date(ev.startDate).getDate()}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(ev.startDate).toLocaleDateString("en-IN", { month: "short" })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{ev.title}</div>
                      {ev.location && <div className="text-xs text-slate-400">{ev.location}</div>}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${typeColors[ev.type] || typeColors.general}`}>
                      {ev.type}
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <Link href="/dashboard/admin/events" className="flex items-center gap-1.5 text-brand-600 text-sm font-medium mt-4 hover:gap-2.5 transition-all">
            Manage events <ArrowRight size={14} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
