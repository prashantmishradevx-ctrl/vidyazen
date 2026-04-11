"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { SectionHeader, Card, Input, Button } from "@/components/ui";
import { User, Lock, Bell, Shield } from "lucide-react";
import { showToast } from "@/components/ui/toaster";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const user = session?.user as any;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    showToast({ type: "success", title: "Settings saved!" });
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionHeader title="Settings" subtitle="Manage your account and preferences" />

      {/* Profile */}
      <Card title="Profile Information" subtitle="Update your personal details">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{user?.name}</h3>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">{user?.role}</span>
            </div>
          </div>
          <Input label="Full Name" defaultValue={user?.name || ""} placeholder="Your full name" />
          <Input label="Email Address" type="email" defaultValue={user?.email || ""} placeholder="your@email.com" />
          <Input label="Phone Number" placeholder="+91 98765 43210" />
          <Button type="submit" loading={saving}><User size={15} /> Save Changes</Button>
        </form>
      </Card>

      {/* Password */}
      <Card title="Change Password" subtitle="Keep your account secure">
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); showToast({ type: "success", title: "Password updated!" }); }}>
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
          <Button type="submit"><Lock size={15} /> Update Password</Button>
        </form>
      </Card>

      {/* Notifications */}
      <Card title="Notification Preferences" subtitle="Choose what you want to be notified about">
        <div className="space-y-4">
          {[
            { label: "Announcements", desc: "Get notified when new announcements are posted" },
            { label: "Attendance Alerts", desc: "Receive alerts for low attendance" },
            { label: "Fee Reminders", desc: "Reminders for upcoming fee due dates" },
            { label: "Exam Results", desc: "Notifications when exam results are published" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <div className="text-sm font-medium text-slate-700">{item.label}</div>
                <div className="text-xs text-slate-400">{item.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500" />
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
