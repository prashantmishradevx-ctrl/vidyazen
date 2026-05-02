"use client";
import { useEffect, useState } from "react";
import { CalendarCheck, Check, X, Clock, Save } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeader, Card, Button, Badge } from "@/components/ui";
import { getAvatarUrl, formatDate } from "@/lib/utils";
import { showToast } from "@/components/ui/toaster";
import { useSession } from "next-auth/react";
import Image from "next/image";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; icon: React.ElementType }> = {
  PRESENT: { label: "Present", color: "bg-green-500 text-white", icon: Check },
  ABSENT: { label: "Absent", color: "bg-red-500 text-white", icon: X },
  LATE: { label: "Late", color: "bg-amber-500 text-white", icon: Clock },
  EXCUSED: { label: "Excused", color: "bg-blue-500 text-white", icon: Check },
};

export default function TeacherAttendancePage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [teacherId, setTeacherId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      const teacherClasses = d.teacher?.classes || [];
      setClasses(teacherClasses);
      setTeacherId(d.teacher?.id || "");
      if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0].id);
        setSelectedSection(teacherClasses[0].sections?.[0]?.id || "");
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoadingStudents(true);
    const sectionQuery = selectedSection ? `&sectionId=${selectedSection}` : "";
    fetch(`/api/students?classId=${selectedClass}${sectionQuery}`).then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : [];
      setStudents(list);
      // Initialize all as PRESENT
      const init: Record<string, AttendanceStatus> = {};
      list.forEach((s: any) => { init[s.id] = "PRESENT"; });
      setAttendance(init);
      setLoadingStudents(false);
    });
  }, [selectedClass, selectedSection]);

  // Load existing attendance for selected date
  useEffect(() => {
    if (!selectedClass || !selectedDate) return;
    const sectionQuery = selectedSection ? `&sectionId=${selectedSection}` : "";
    fetch(`/api/attendance?classId=${selectedClass}&date=${selectedDate}${sectionQuery}`).then(r => r.json()).then(records => {
      if (Array.isArray(records) && records.length > 0) {
        const existing: Record<string, AttendanceStatus> = {};
        records.forEach((r: any) => { existing[r.studentId] = r.status; });
        setAttendance(prev => ({ ...prev, ...existing }));
      }
    });
  }, [selectedClass, selectedSection, selectedDate]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const all: Record<string, AttendanceStatus> = {};
    students.forEach(s => { all[s.id] = status; });
    setAttendance(all);
  };

  const handleSave = async () => {
    if (!selectedClass || !teacherId) return;
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status }));
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, classId: selectedClass, sectionId: selectedSection, teacherId, date: selectedDate }),
      });
      if (res.ok) {
        showToast({ type: "success", title: "Attendance saved!", message: `${records.length} records updated` });
      }
    } catch {
      showToast({ type: "error", title: "Failed to save attendance" });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === "PRESENT").length;
  const absentCount = Object.values(attendance).filter(s => s === "ABSENT").length;
  const lateCount = Object.values(attendance).filter(s => s === "LATE").length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Mark Attendance"
        subtitle="Record daily attendance for your class"
        action={
          <Button onClick={handleSave} loading={saving} disabled={students.length === 0}>
            <Save size={16} /> Save Attendance
          </Button>
        }
      />

      {/* Controls */}
      <Card>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Select Class</label>
            <select
              className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white"
              value={selectedClass}
              onChange={e => {
                const classId = e.target.value;
                const cls = classes.find((c: any) => c.id === classId);
                setSelectedClass(classId);
                setSelectedSection(cls?.sections?.[0]?.id || "");
              }}
            >
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.className || c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Select Section</label>
            <select
              className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white"
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
            >
              <option value="">All sections</option>
              {(classes.find((c: any) => c.id === selectedClass)?.sections || []).map((s: any) => <option key={s.id} value={s.id}>Section {s.sectionName}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Summary strip */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-700 font-display">{presentCount}</div>
            <div className="text-xs text-green-600 font-medium">Present</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-700 font-display">{absentCount}</div>
            <div className="text-xs text-red-600 font-medium">Absent</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-700 font-display">{lateCount}</div>
            <div className="text-xs text-amber-600 font-medium">Late</div>
          </div>
        </div>
      )}

      {/* Mark all buttons */}
      {students.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-slate-500 self-center mr-1">Mark all:</span>
          {(["PRESENT", "ABSENT", "LATE"] as AttendanceStatus[]).map(s => (
            <button
              key={s}
              onClick={() => markAll(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:scale-105 ${
                s === "PRESENT" ? "bg-green-50 text-green-700 border-green-200" :
                s === "ABSENT" ? "bg-red-50 text-red-700 border-red-200" :
                "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Student list */}
      <Card>
        {loadingStudents ? (
          <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
        ) : students.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CalendarCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p>No students in this class or select a class above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student: any, i: number) => {
              const currentStatus = attendance[student.id] || "PRESENT";
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    currentStatus === "PRESENT" ? "bg-green-50/50 border-green-100" :
                    currentStatus === "ABSENT" ? "bg-red-50/50 border-red-100" :
                    currentStatus === "LATE" ? "bg-amber-50/50 border-amber-100" :
                    "bg-blue-50/50 border-blue-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
                      <Image src={getAvatarUrl(student.user?.name || "")} alt="" width={36} height={36} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{student.user?.name}</div>
                      <div className="text-xs text-slate-400">Roll #{student.rollNumber || "—"}</div>
                    </div>
                  </div>

                  {/* Status toggle buttons */}
                  <div className="flex gap-1.5">
                    {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as AttendanceStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setStatus(student.id, s)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                          currentStatus === s
                            ? STATUS_CONFIG[s].color
                            : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {s === "EXCUSED" ? "Ex" : s.slice(0, 1)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
