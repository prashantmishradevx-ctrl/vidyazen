import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "VidyaZen – Smart Institute Management System",
    template: "%s | VidyaZen",
  },
  description:
    "VidyaZen is a modern, AI-powered school and institute management system — manage students, teachers, attendance, grades, fees and more from one beautiful dashboard.",
  keywords: ["school management", "institute management", "student portal", "teacher portal", "ERP"],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
