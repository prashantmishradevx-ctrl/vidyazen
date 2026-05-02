"use client";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, LayoutDashboard, Users, BookOpen, CalendarDays,
  BarChart3, Bell, CreditCard, FileText, Settings, LogOut, Menu, X,
  ChevronRight, UserCheck, ClipboardList, Megaphone, CalendarCheck, Video, Palette
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: React.ElementType; roles: string[] };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard, roles: ["ADMIN"] },
  { label: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard, roles: ["TEACHER"] },
  { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard, roles: ["STUDENT"] },
  { label: "Dashboard", href: "/dashboard/parent", icon: LayoutDashboard, roles: ["PARENT"] },

  { label: "Students", href: "/dashboard/admin/students", icon: Users, roles: ["ADMIN"] },
  { label: "Teachers", href: "/dashboard/admin/teachers", icon: UserCheck, roles: ["ADMIN"] },
  { label: "Classes", href: "/dashboard/admin/classes", icon: BookOpen, roles: ["ADMIN"] },
  { label: "Fees", href: "/dashboard/admin/fees", icon: CreditCard, roles: ["ADMIN"] },
  { label: "Events", href: "/dashboard/admin/events", icon: CalendarDays, roles: ["ADMIN"] },
  { label: "Announcements", href: "/dashboard/admin/announcements", icon: Megaphone, roles: ["ADMIN"] },
  { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart3, roles: ["ADMIN"] },

  { label: "My Classes", href: "/dashboard/teacher/classes", icon: BookOpen, roles: ["TEACHER"] },
  { label: "Classroom", href: "/dashboard/teacher/classroom", icon: FileText, roles: ["TEACHER"] },
  { label: "Attendance", href: "/dashboard/teacher/attendance", icon: CalendarCheck, roles: ["TEACHER"] },
  { label: "Grades", href: "/dashboard/teacher/grades", icon: ClipboardList, roles: ["TEACHER"] },
  { label: "Announcements", href: "/dashboard/teacher/announcements", icon: Megaphone, roles: ["TEACHER"] },

  { label: "My Grades", href: "/dashboard/student/grades", icon: ClipboardList, roles: ["STUDENT"] },
  { label: "Classroom", href: "/dashboard/student/classroom", icon: FileText, roles: ["STUDENT"] },
  { label: "Attendance", href: "/dashboard/student/attendance", icon: CalendarCheck, roles: ["STUDENT"] },
  { label: "Timetable", href: "/dashboard/student/timetable", icon: CalendarDays, roles: ["STUDENT"] },
  { label: "Fees", href: "/dashboard/student/fees", icon: CreditCard, roles: ["STUDENT"] },
  { label: "Announcements", href: "/dashboard/student/announcements", icon: Bell, roles: ["STUDENT"] },

  { label: "My Children", href: "/dashboard/parent/children", icon: Users, roles: ["PARENT"] },
  { label: "Attendance", href: "/dashboard/parent/attendance", icon: CalendarCheck, roles: ["PARENT"] },
  { label: "Fees", href: "/dashboard/parent/fees", icon: CreditCard, roles: ["PARENT"] },
  { label: "Announcements", href: "/dashboard/parent/announcements", icon: Bell, roles: ["PARENT"] },

  { label: "Meetings", href: "/dashboard/meetings", icon: Video, roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"] },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"] },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "from-purple-500 to-violet-600",
  TEACHER: "from-blue-500 to-cyan-500",
  STUDENT: "from-green-500 to-emerald-500",
  PARENT: "from-orange-500 to-amber-500",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
};

const DASHBOARD_THEMES = [
  { id: "classic", label: "Classic" },
  { id: "ocean", label: "Ocean" },
  { id: "forest", label: "Forest" },
  { id: "rose", label: "Rose" },
] as const;

type DashboardTheme = (typeof DASHBOARD_THEMES)[number]["id"];

export function DashboardShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<DashboardTheme>("classic");
  const pathname = usePathname();
  const role = (session.user as any).role as string;
  const userName = session.user?.name || "User";

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const roleColor = ROLE_COLORS[role] || "from-brand-500 to-brand-700";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("vidyazen-dashboard-theme") as DashboardTheme | null;
    if (savedTheme && DASHBOARD_THEMES.some((item) => item.id === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  const updateTheme = (nextTheme: DashboardTheme) => {
    setTheme(nextTheme);
    window.localStorage.setItem("vidyazen-dashboard-theme", nextTheme);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center shadow-lg`}>
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-800">
            Vidya<span className="text-brand-500">Zen</span>
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
            {getInitials(userName)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{userName}</div>
            <div className="text-xs text-slate-500">{ROLE_LABELS[role]}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {isActive && (
                <span className="absolute left-0 w-1 h-6 bg-brand-500 rounded-r-full" />
              )}
              <item.icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <Settings size={18} className="text-slate-400" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-shell-root min-h-screen bg-slate-50 flex" data-dashboard-theme={theme}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <button
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 h-16 flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex-1">
            <h2 className="font-display font-semibold text-slate-800 hidden sm:block">
              {navItems.find((i) => i.href === pathname)?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <label className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
              <Palette size={16} className="text-slate-400" />
              <select
                value={theme}
                onChange={(e) => updateTheme(e.target.value as DashboardTheme)}
                className="bg-transparent text-sm outline-none"
                aria-label="Dashboard theme"
              >
                {DASHBOARD_THEMES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <select
              value={theme}
              onChange={(e) => updateTheme(e.target.value as DashboardTheme)}
              className="sm:hidden rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-600 outline-none"
              aria-label="Dashboard theme"
            >
              {DASHBOARD_THEMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <Link href="/dashboard/notifications" className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-sm font-bold`}>
              {getInitials(userName)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
