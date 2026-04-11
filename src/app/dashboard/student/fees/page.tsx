"use client";
import { useEffect, useState } from "react";
import { CreditCard, CheckCircle } from "lucide-react";
import { SectionHeader, Card, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentFeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      setFees(d?.student?.fees || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalDue = fees.filter(f => f.status !== "PAID").reduce((s: number, f: any) => s + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === "PAID").reduce((s: number, f: any) => s + f.amount, 0);

  const STATUS_VARIANT: Record<string, string> = { PAID: "success", PENDING: "warning", OVERDUE: "danger", PARTIAL: "info" };

  return (
    <div className="space-y-6">
      <SectionHeader title="My Fees" subtitle="View and track your fee payment status" />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="text-2xl font-bold text-green-700 font-display">{formatCurrency(totalPaid)}</div>
          <div className="text-sm text-green-600 mt-1 flex items-center gap-1.5"><CheckCircle size={14} /> Total Paid</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="text-2xl font-bold text-amber-700 font-display">{formatCurrency(totalDue)}</div>
          <div className="text-sm text-amber-600 mt-1">Total Due</div>
        </div>
      </div>

      <Card title="Fee Records">
        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
        ) : fees.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CreditCard size={40} className="mx-auto mb-3 text-slate-300" />
            <p>No fee records found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fees.map((fee: any) => (
              <div key={fee.id} className={`flex items-center justify-between p-4 rounded-xl border ${fee.status === "OVERDUE" ? "bg-red-50 border-red-200" : fee.status === "PENDING" ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                <div>
                  <div className="font-semibold text-slate-800">{fee.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Due: {formatDate(fee.dueDate)}
                    {fee.paidDate && ` · Paid: ${formatDate(fee.paidDate)}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-slate-800">{formatCurrency(fee.amount)}</div>
                  <Badge variant={STATUS_VARIANT[fee.status] as any}>{fee.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
