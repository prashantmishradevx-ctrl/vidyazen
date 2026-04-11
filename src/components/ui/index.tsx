"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// ─── Stat Card ──────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: { value: number; label: string };
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor = "bg-brand-500", trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${iconColor} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trend.value >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div className="font-display text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-500">{title}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
    </motion.div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant = "default" | "success" | "danger" | "warning" | "info";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-green-100 text-green-700",
  danger: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-blue-100 text-blue-700",
};

export function Badge({ children, variant = "default", className }: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", BADGE_STYLES[variant], className)}>
      {children}
    </span>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className, title, subtitle }: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200 p-6", className)}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h3 className="font-display font-semibold text-slate-900 text-lg">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-xl", className)} />;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description }: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="font-display font-semibold text-slate-700 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{description}</p>
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const BUTTON_VARIANTS = {
  primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700",
  ghost: "hover:bg-slate-100 text-slate-600",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

const BUTTON_SIZES = {
  sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
  md: "text-sm px-4 py-2.5 rounded-xl gap-2",
  lg: "text-base px-6 py-3 rounded-xl gap-2.5",
};

export function Button({ variant = "primary", size = "md", loading, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className
      )}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────
export function DataTable({ columns, data, emptyMessage = "No data found" }: {
  columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  data: any[];
  emptyMessage?: string;
}) {
  return (
    <div className="table-responsive rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-3.5 font-semibold text-slate-600 whitespace-nowrap text-xs uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <input
        {...props}
        className={cn(
          "w-full border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-white",
          error && "border-red-400 focus:border-red-500",
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <select
        {...props}
        className={cn(
          "w-full border border-slate-200 focus:border-brand-500 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-white",
          className
        )}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
