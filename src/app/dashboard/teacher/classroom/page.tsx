"use client";
import { useEffect, useState } from "react";
import { BookOpen, ClipboardList, FileText, Plus, Upload } from "lucide-react";
import { Button, Card, Input, SectionHeader, Select, StatCard } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function TeacherClassroomPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [classForm, setClassForm] = useState({ name: "", room: "" });
  const [assignmentForm, setAssignmentForm] = useState({ classId: "", sectionId: "", title: "", dueDate: "", maxMarks: "100", description: "" });
  const [materialForm, setMaterialForm] = useState({ classId: "", sectionId: "", title: "", fileUrl: "", description: "" });

  const load = async () => {
    const [classRes, assignmentRes, materialRes] = await Promise.all([
      fetch("/api/classroom/classes"),
      fetch("/api/classroom/assignments"),
      fetch("/api/classroom/materials"),
    ]);
    const nextClasses = await classRes.json();
    setClasses(Array.isArray(nextClasses) ? nextClasses : []);
    setAssignments(await assignmentRes.json().then((d) => Array.isArray(d) ? d : []));
    setMaterials(await materialRes.json().then((d) => Array.isArray(d) ? d : []));
    if (nextClasses?.[0]?.id) {
      setAssignmentForm((f) => ({ ...f, classId: f.classId || nextClasses[0].id, sectionId: f.sectionId || nextClasses[0].sections?.[0]?.id || "" }));
      setMaterialForm((f) => ({ ...f, classId: f.classId || nextClasses[0].id, sectionId: f.sectionId || nextClasses[0].sections?.[0]?.id || "" }));
    }
  };

  useEffect(() => { load(); }, []);

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/classroom/classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(classForm) });
    setClassForm({ name: "", room: "" });
    load();
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/classroom/assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(assignmentForm) });
    setAssignmentForm((f) => ({ ...f, title: "", dueDate: "", description: "" }));
    load();
  };

  const uploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/classroom/materials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(materialForm) });
    setMaterialForm((f) => ({ ...f, title: "", fileUrl: "", description: "" }));
    load();
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Classroom" subtitle="Create classes, assignments, materials, announcements, and grades." />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Created Classes" value={classes.length} icon={BookOpen} iconColor="bg-blue-500" />
        <StatCard title="Assignments" value={assignments.length} icon={ClipboardList} iconColor="bg-violet-500" />
        <StatCard title="Materials" value={materials.length} icon={FileText} iconColor="bg-emerald-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Create Class">
          <form onSubmit={createClass} className="space-y-3">
            <Input label="Class name" required value={classForm.name} onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Room" value={classForm.room} onChange={(e) => setClassForm((f) => ({ ...f, room: e.target.value }))} />
            <Button type="submit"><Plus size={16} /> Create</Button>
          </form>
        </Card>

        <Card title="Create Assignment">
          <form onSubmit={createAssignment} className="space-y-3">
            <Select label="Class" required value={assignmentForm.classId} onChange={(e) => setAssignmentForm((f) => ({ ...f, classId: e.target.value }))}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.className || c.name}</option>)}
            </Select>
            <Select label="Section" value={assignmentForm.sectionId} onChange={(e) => setAssignmentForm((f) => ({ ...f, sectionId: e.target.value }))}>
              <option value="">All sections</option>
              {(classes.find((c) => c.id === assignmentForm.classId)?.sections || []).map((s: any) => <option key={s.id} value={s.id}>Section {s.sectionName}</option>)}
            </Select>
            <Input label="Title" required value={assignmentForm.title} onChange={(e) => setAssignmentForm((f) => ({ ...f, title: e.target.value }))} />
            <Input label="Deadline" type="datetime-local" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm((f) => ({ ...f, dueDate: e.target.value }))} />
            <Button type="submit"><ClipboardList size={16} /> Publish</Button>
          </form>
        </Card>

        <Card title="Upload Material">
          <form onSubmit={uploadMaterial} className="space-y-3">
            <Select label="Class" required value={materialForm.classId} onChange={(e) => setMaterialForm((f) => ({ ...f, classId: e.target.value }))}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.className || c.name}</option>)}
            </Select>
            <Select label="Section" value={materialForm.sectionId} onChange={(e) => setMaterialForm((f) => ({ ...f, sectionId: e.target.value }))}>
              <option value="">All sections</option>
              {(classes.find((c) => c.id === materialForm.classId)?.sections || []).map((s: any) => <option key={s.id} value={s.id}>Section {s.sectionName}</option>)}
            </Select>
            <Input label="Title" required value={materialForm.title} onChange={(e) => setMaterialForm((f) => ({ ...f, title: e.target.value }))} />
            <Input label="File URL" value={materialForm.fileUrl} onChange={(e) => setMaterialForm((f) => ({ ...f, fileUrl: e.target.value }))} />
            <Button type="submit"><Upload size={16} /> Save</Button>
          </form>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Class Dashboard">
          <div className="space-y-3">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div>
                  <div className="font-semibold text-slate-800">{cls.className || cls.name}</div>
                  <div className="text-xs text-slate-500">Join code: {cls.code || "Not set"}</div>
                </div>
                <div className="text-sm text-slate-500">{cls.sections?.length || 0} sections · {cls._count?.assignments || 0} assignments</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Assignment List">
          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-100 p-3">
                <div className="font-semibold text-slate-800">{a.title}</div>
                <div className="text-xs text-slate-500">{a.class?.className || a.class?.name}{a.section ? ` · Section ${a.section.sectionName}` : ""} · Due {a.dueDate ? formatDate(a.dueDate) : "No deadline"} · {a._count?.submissions || 0} submissions</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
