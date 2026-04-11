"use client";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { SectionHeader, Card } from "@/components/ui";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = ["09:00 - 10:00", "10:00 - 11:00", "11:15 - 12:15", "12:15 - 13:15", "14:00 - 15:00", "15:00 - 16:00"];

// Demo timetable data
const DEMO_TIMETABLE: Record<string, { subject: string; teacher: string; room: string }[]> = {
  Monday: [
    { subject: "Mathematics", teacher: "Ms. Priya Patel", room: "Room 101" },
    { subject: "English", teacher: "Mr. Ramesh Kumar", room: "Room 102" },
    { subject: "Science", teacher: "Mr. Amit Kumar", room: "Lab 1" },
    { subject: "Lunch Break", teacher: "—", room: "—" },
    { subject: "History", teacher: "Ms. Deepa Nair", room: "Room 103" },
    { subject: "Computer Science", teacher: "Mr. Vivek Sharma", room: "Computer Lab" },
  ],
  Tuesday: [
    { subject: "Science", teacher: "Mr. Amit Kumar", room: "Lab 1" },
    { subject: "Mathematics", teacher: "Ms. Priya Patel", room: "Room 101" },
    { subject: "English", teacher: "Mr. Ramesh Kumar", room: "Room 102" },
    { subject: "Lunch Break", teacher: "—", room: "—" },
    { subject: "Computer Science", teacher: "Mr. Vivek Sharma", room: "Computer Lab" },
    { subject: "Physical Education", teacher: "Coach Rajan", room: "Sports Ground" },
  ],
  Wednesday: [
    { subject: "English", teacher: "Mr. Ramesh Kumar", room: "Room 102" },
    { subject: "History", teacher: "Ms. Deepa Nair", room: "Room 103" },
    { subject: "Mathematics", teacher: "Ms. Priya Patel", room: "Room 101" },
    { subject: "Lunch Break", teacher: "—", room: "—" },
    { subject: "Science", teacher: "Mr. Amit Kumar", room: "Lab 1" },
    { subject: "Art & Craft", teacher: "Ms. Kavya", room: "Art Room" },
  ],
  Thursday: [
    { subject: "Computer Science", teacher: "Mr. Vivek Sharma", room: "Computer Lab" },
    { subject: "Science", teacher: "Mr. Amit Kumar", room: "Lab 1" },
    { subject: "History", teacher: "Ms. Deepa Nair", room: "Room 103" },
    { subject: "Lunch Break", teacher: "—", room: "—" },
    { subject: "Mathematics", teacher: "Ms. Priya Patel", room: "Room 101" },
    { subject: "English", teacher: "Mr. Ramesh Kumar", room: "Room 102" },
  ],
  Friday: [
    { subject: "Mathematics", teacher: "Ms. Priya Patel", room: "Room 101" },
    { subject: "Computer Science", teacher: "Mr. Vivek Sharma", room: "Computer Lab" },
    { subject: "English", teacher: "Mr. Ramesh Kumar", room: "Room 102" },
    { subject: "Lunch Break", teacher: "—", room: "—" },
    { subject: "Science", teacher: "Mr. Amit Kumar", room: "Lab 1" },
    { subject: "History", teacher: "Ms. Deepa Nair", room: "Room 103" },
  ],
  Saturday: [
    { subject: "Physical Education", teacher: "Coach Rajan", room: "Sports Ground" },
    { subject: "Art & Craft", teacher: "Ms. Kavya", room: "Art Room" },
    { subject: "Free Period", teacher: "—", room: "—" },
    { subject: "—", teacher: "—", room: "—" },
    { subject: "—", teacher: "—", room: "—" },
    { subject: "—", teacher: "—", room: "—" },
  ],
};

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "bg-blue-50 border-blue-200 text-blue-800",
  Science: "bg-green-50 border-green-200 text-green-800",
  English: "bg-purple-50 border-purple-200 text-purple-800",
  History: "bg-amber-50 border-amber-200 text-amber-800",
  "Computer Science": "bg-cyan-50 border-cyan-200 text-cyan-800",
  "Physical Education": "bg-red-50 border-red-200 text-red-800",
  "Art & Craft": "bg-pink-50 border-pink-200 text-pink-800",
  "Lunch Break": "bg-slate-50 border-slate-200 text-slate-400",
  "Free Period": "bg-slate-50 border-slate-200 text-slate-400",
  "—": "bg-slate-50 border-slate-100 text-slate-300",
};

export default function StudentTimetablePage() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : "Monday");

  return (
    <div className="space-y-6">
      <SectionHeader title="My Timetable" subtitle="Weekly class schedule" />

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeDay === day
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : day === today
                  ? "bg-brand-50 text-brand-700 border border-brand-200"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {day.slice(0, 3)}
            {day === today && <span className="ml-1 text-xs opacity-70">(Today)</span>}
          </button>
        ))}
      </div>

      {/* Timetable for selected day */}
      <Card title={`${activeDay}'s Schedule`}>
        <div className="space-y-3">
          {PERIODS.map((period, i) => {
            const slot = DEMO_TIMETABLE[activeDay]?.[i];
            const colorClass = SUBJECT_COLORS[slot?.subject || "—"] || "bg-slate-50 border-slate-200";
            const isEmpty = !slot || slot.subject === "—";

            return (
              <div key={period} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isEmpty ? "opacity-40" : ""} ${colorClass}`}>
                <div className="text-xs font-mono text-slate-500 whitespace-nowrap min-w-[110px]">{period}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{slot?.subject || "—"}</div>
                  {slot?.teacher && slot.teacher !== "—" && (
                    <div className="text-xs mt-0.5 opacity-70">{slot.teacher}</div>
                  )}
                </div>
                {slot?.room && slot.room !== "—" && (
                  <div className="text-xs font-medium opacity-60 whitespace-nowrap">{slot.room}</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
