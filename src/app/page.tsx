"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Users, BookOpen, BarChart3, Calendar, Shield,
  ChevronRight, Star, Check, Menu, X, ArrowRight, Zap, Globe, Award,
  Bell, FileText, CreditCard, Clock, TrendingUp, Layers
} from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Modules", href: "#modules" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
];

const STATS = [
  { value: "50K+", label: "Students Enrolled" },
  { value: "2,000+", label: "Schools Using" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4.9★", label: "Average Rating" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Multi-Role Access",
    desc: "Separate portals for Admin, Teachers, Students & Parents — each with tailored dashboards and permissions.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Real-time charts on attendance trends, grade distributions, fee collection and academic performance.",
    color: "from-violet-500 to-purple-400",
  },
  {
    icon: Calendar,
    title: "Timetable & Events",
    desc: "Visual timetable builder, event calendar, exam scheduling and holiday management in one place.",
    color: "from-orange-500 to-amber-400",
  },
  {
    icon: CreditCard,
    title: "Fee Management",
    desc: "Track pending dues, record payments, generate receipts and send automated reminders to parents.",
    color: "from-green-500 to-emerald-400",
  },
  {
    icon: Bell,
    title: "Announcements",
    desc: "Broadcast notices to specific roles — class-wise, school-wide or targeted to parents only.",
    color: "from-pink-500 to-rose-400",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Role-based auth, encrypted data, GDPR-ready architecture and 99.9% uptime guarantee.",
    color: "from-indigo-500 to-blue-400",
  },
];

const MODULES = [
  { icon: GraduationCap, label: "Student Management" },
  { icon: Users, label: "Teacher Management" },
  { icon: BookOpen, label: "Subjects & Classes" },
  { icon: Clock, label: "Attendance Tracking" },
  { icon: FileText, label: "Grades & Results" },
  { icon: CreditCard, label: "Fee Collection" },
  { icon: Calendar, label: "Timetable" },
  { icon: Bell, label: "Announcements" },
  { icon: Globe, label: "Parent Portal" },
  { icon: Award, label: "Reports & Analytics" },
  { icon: TrendingUp, label: "Performance Trends" },
  { icon: Layers, label: "Multi-Branch Support" },
];

const TESTIMONIALS = [
  {
    name: "Dr. Anita Bose",
    role: "Principal, Delhi Public School",
    text: "VidyaZen transformed how we manage our 3,000+ student school. The parent portal alone saved us countless hours every week.",
    rating: 5,
  },
  {
    name: "Mr. Sanjay Patel",
    role: "Admin, Narayana Academy",
    text: "The fee management system is incredible. Overdue follow-ups are now automatic and our collection rate improved by 40%.",
    rating: 5,
  },
  {
    name: "Ms. Kavya Reddy",
    role: "Teacher, Kendriya Vidyalaya",
    text: "Marking attendance used to take 10 minutes per class. Now it's 30 seconds. The grade entry is smooth and quick too.",
    rating: 5,
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "₹2,999",
    period: "/month",
    desc: "Perfect for small schools up to 200 students",
    features: ["Up to 200 students", "5 teachers", "Basic analytics", "Email support"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Institute",
    price: "₹7,999",
    period: "/month",
    desc: "Ideal for growing schools up to 2,000 students",
    features: ["Up to 2,000 students", "Unlimited teachers", "Advanced analytics", "Fee management", "Parent portal", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Multi-branch institutions with custom needs",
    features: ["Unlimited students", "Multi-branch", "Custom integrations", "Dedicated manager", "SLA guarantee", "On-premise option"],
    cta: "Contact Sales",
    highlight: false,
  },
];

function FloatingOrb({ className }: { className: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-30 animate-float pointer-events-none ${className}`} />
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#040d1a] text-white overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(15,135,232,0.25),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,135,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,135,232,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#040d1a]/80 backdrop-blur-xl border-b border-white/10" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Vidya<span className="text-brand-400">Zen</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                Login
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#040d1a]/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-slate-300 hover:text-white font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
                <hr className="border-white/10" />
                <Link href="/auth/login" className="text-center py-3 rounded-xl border border-white/20 text-slate-300 font-medium">
                  Login
                </Link>
                <Link href="/auth/login" className="text-center py-3 rounded-xl bg-brand-500 text-white font-semibold">
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <FloatingOrb className="w-96 h-96 bg-brand-500 -top-20 -left-20" />
        <FloatingOrb className="w-80 h-80 bg-accent-500 -bottom-10 -right-10" style={{ animationDelay: "1.5s" } as any} />
        <FloatingOrb className="w-64 h-64 bg-violet-500 top-1/3 -right-10" style={{ animationDelay: "3s" } as any} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center max-w-5xl mx-auto relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-8"
          >
            <Zap size={14} className="text-brand-400" />
            India's Smartest Institute Management System
            <ChevronRight size={14} />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
          >
            Manage Your
            <br />
            <span className="gradient-text">School Smarter</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            VidyaZen brings students, teachers, parents and admins together in one beautiful platform — with real-time analytics, automated workflows, and complete transparency.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-base px-8 py-4 rounded-2xl shadow-2xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all hover:scale-105"
            >
              Start Free Trial
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all hover:scale-105"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-white">{s.value}</div>
                <div className="text-slate-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-0.5 h-8 bg-gradient-to-b from-slate-600 to-transparent" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-4">
              Everything You Need
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Powerful Features,<br /><span className="gradient-text">Zero Complexity</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Every tool your school needs, built with modern design and intuitive workflows.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-7 transition-all cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section id="modules" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Complete <span className="gradient-text">Module Suite</span>
            </h2>
            <p className="text-slate-400 text-lg">12 integrated modules for end-to-end school management</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {MODULES.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-500/40 transition-all group cursor-default"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-500/15 flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
                  <m.icon size={20} className="text-brand-400" />
                </div>
                <span className="text-xs text-center text-slate-300 font-medium leading-tight">{m.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">Educators</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-7"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Simple, <span className="gradient-text">Transparent Pricing</span>
            </h2>
            <p className="text-slate-400 text-lg">No hidden fees. Cancel anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 border ${
                  p.highlight
                    ? "bg-brand-500 border-brand-400 shadow-2xl shadow-brand-500/40"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className={`text-sm font-semibold mb-2 ${p.highlight ? "text-blue-100" : "text-slate-400"}`}>
                  {p.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display text-4xl font-bold text-white">{p.price}</span>
                  <span className={`text-sm pb-1 ${p.highlight ? "text-blue-200" : "text-slate-500"}`}>{p.period}</span>
                </div>
                <p className={`text-sm mb-6 ${p.highlight ? "text-blue-100" : "text-slate-400"}`}>{p.desc}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      <Check size={15} className={p.highlight ? "text-blue-200" : "text-brand-400"} />
                      <span className={p.highlight ? "text-blue-50" : "text-slate-300"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/login"
                  className={`block text-center py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 ${
                    p.highlight
                      ? "bg-white text-brand-600 hover:bg-blue-50"
                      : "bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 border border-brand-500/30"
                  }`}
                >
                  {p.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-12 md:p-16 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)]" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to transform your school?
              </h2>
              <p className="text-blue-200 text-lg mb-8 max-w-lg mx-auto">
                Join 2,000+ schools already using VidyaZen. Start your free 30-day trial today — no credit card required.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-base px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Start Free Trial <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-white">Vidya<span className="text-brand-400">Zen</span></span>
            </div>
            <p className="text-slate-600 text-sm text-center">
              © {new Date().getFullYear()} VidyaZen. Built with ❤️ for India's educators.
            </p>
            <div className="flex gap-6 text-slate-500 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
