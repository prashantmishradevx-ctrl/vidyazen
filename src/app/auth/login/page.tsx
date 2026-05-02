"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const DEMO_CREDENTIALS = [
  { label: "Admin", email: "admin@vidyazen.edu", password: "admin@123", role: "ADMIN", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { label: "Teacher", email: "priya.math@vidyazen.edu", password: "teacher@123", role: "TEACHER", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { label: "Student", email: "rahul.mehta@vidyazen.edu", password: "student@123", role: "STUDENT", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  { label: "Parent", email: "suresh.mehta@gmail.com", password: "parent@123", role: "PARENT", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", role: "STUDENT" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        role: form.role,
        redirect: false,
      });
      if (result?.error) {
        setError(result.error.includes("registered as") ? result.error : "Invalid email, password, or role. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred: { email: string; password: string; role: string }) => {
    setForm({ email: cred.email, password: cred.password, role: cred.role });
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#040d1a] flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(15,135,232,0.2),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,135,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,135,232,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <GraduationCap size={16} />
          <span className="font-display font-bold">Vidya<span className="text-brand-400">Zen</span></span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your VidyaZen account</p>
          </div>

          {/* Demo credentials */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map((c) => (
                <button
                  key={c.label}
                  onClick={() => fillDemo(c)}
                  className={`text-xs font-medium px-3 py-2 rounded-lg border transition-all hover:scale-105 ${c.color}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@school.edu"
                className="w-full bg-white/5 border border-white/10 focus:border-brand-500 text-white placeholder-slate-600 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
              <select
                required
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 focus:border-brand-500 text-white rounded-xl px-4 py-3.5 text-sm outline-none transition-colors"
              >
                <option className="bg-slate-900" value="STUDENT">Student</option>
                <option className="bg-slate-900" value="TEACHER">Teacher</option>
                <option className="bg-slate-900" value="ADMIN">Admin</option>
                <option className="bg-slate-900" value="PARENT">Parent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-brand-500 text-white placeholder-slate-600 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-xs mt-6">
            Having trouble? Contact your school administrator.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
