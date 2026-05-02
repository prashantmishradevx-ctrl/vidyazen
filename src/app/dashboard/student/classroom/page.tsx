"use client";
import { useEffect, useState } from "react";
import { BookOpen, ClipboardList, Send } from "lucide-react";
import { Button, Card, Input, SectionHeader, StatCard } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function StudentClassroomPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const load = async () => {
    const [classRes, assignmentRes] = await Promise.all([
      fetch("/api/classroom/classes"),
      fetch("/api/classroom/assignments"),
    ]);
    setClasses(await classRes.json().then((d) => Array.isArray(d) ? d : []));
    setAssignments(await assignmentRes.json().then((d) => Array.isArray(d) ? d : []));
  };

  useEffect(() => { load(); }, []);

  const joinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/classroom/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: joinCode }) });
    const data = await res.json();
    setMessage(res.ok ? `Joined ${data.class.name}` : data.error || "Could not join class.");
    setJoinCode("");
    load();
  };

  const submitAssignment = async (assignmentId: string) => {
    const res = await fetch("/api/classroom/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId, content: answers[assignmentId] || "" }),
    });
    setMessage(res.ok ? "Assignment submitted." : "Submission failed.");
    load();
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Classroom" subtitle="Join classes, submit assignments, and view grades." />
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Joined Classes" value={classes.length} icon={BookOpen} iconColor="bg-blue-500" />
        <StatCard title="Assignments" value={assignments.length} icon={ClipboardList} iconColor="bg-violet-500" />
      </div>

      <Card title="Join Class">
        <form onSubmit={joinClass} className="flex flex-col sm:flex-row gap-3">
          <Input placeholder="Enter class code" required value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
          <Button type="submit"><BookOpen size={16} /> Join</Button>
        </form>
        {message && <p className="text-sm text-slate-500 mt-3">{message}</p>}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Class Dashboard">
          <div className="space-y-3">
            {classes.map((cls) => (
              <div key={cls.id} className="rounded-xl border border-slate-100 p-3">
                <div className="font-semibold text-slate-800">{cls.className || cls.name}</div>
                <div className="text-xs text-slate-500">Teacher: {cls.teacher?.user?.name || "Not assigned"} · Sections: {cls.sections?.map((s: any) => s.sectionName).join(", ") || "-"} · {cls._count?.assignments || 0} assignments</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Assignment List">
          <div className="space-y-4">
            {assignments.map((a) => {
              const submitted = a.submissions?.[0];
              return (
                <div key={a.id} className="rounded-xl border border-slate-100 p-3 space-y-3">
                  <div>
                    <div className="font-semibold text-slate-800">{a.title}</div>
                    <div className="text-xs text-slate-500">{a.class?.className || a.class?.name}{a.section ? ` · Section ${a.section.sectionName}` : ""} · Due {a.dueDate ? formatDate(a.dueDate) : "No deadline"}</div>
                    {submitted?.marks != null && <div className="text-xs text-green-700 mt-1">Grade: {submitted.marks}/{a.maxMarks}</div>}
                  </div>
                  <textarea
                    disabled={!!submitted}
                    rows={2}
                    placeholder={submitted ? "Submitted" : "Write your submission"}
                    value={answers[a.id] || ""}
                    onChange={(e) => setAnswers((v) => ({ ...v, [a.id]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                  <Button size="sm" disabled={!!submitted} onClick={() => submitAssignment(a.id)}><Send size={14} /> Submit</Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
