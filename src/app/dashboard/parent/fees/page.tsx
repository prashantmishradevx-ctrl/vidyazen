"use client";
import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { SectionHeader, Card, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ParentFeesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const children = data?.parent?.students || [];
  const STATUS_VARIANT: Record<string, string> = { PAID: "success", PENDING: "warning", OVERDUE: "danger" };
  return (
    <div className="space-y-6">
      <SectionHeader title="Fee Details" subtitle="View fee payment status for your children" />
      {loading ? <div className="h-64 shimmer rounded-2xl" /> :
        children.map((child: any) => {
          const fees = child.fees || [];
          const due = fees.filter((f: any) => f.status !== "PAID").reduce((s: number, f: any) => s + f.amount, 0);
          return (
            <Card key={child.id} title={child.user?.name} subtitle={`Due: ${formatCurrency(due)}`}>
              <div className="space-y-3">
                {fees.length === 0 ? <p className="text-slate-400 text-sm text-center py-6">No fee records.</p> :
                  fees.map((fee: any) => (
                    <div key={fee.id} className={`flex items-center justify-between p-3 rounded-xl border ${fee.status === "PAID" ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{fee.title}</div>
                        <div className="text-xs text-slate-500">Due: {formatDate(fee.dueDate)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(fee.amount)}</div>
                        <Badge variant={STATUS_VARIANT[fee.status] as any}>{fee.status}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          );
        })}
    </div>
  );
}
