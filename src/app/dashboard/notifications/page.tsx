"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Card, EmptyState, SectionHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(Array.isArray(d) ? d : []));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" subtitle="Assignment alerts, announcements, and meeting reminders." />
      <Card>
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="New assignment, announcement, and meeting alerts will appear here." />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Link key={notification.id} href={notification.link || "#"} className="block rounded-xl border border-slate-100 p-4 hover:bg-slate-50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center shrink-0">
                    <Bell size={16} className="text-brand-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{notification.title}</div>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(notification.createdAt)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
