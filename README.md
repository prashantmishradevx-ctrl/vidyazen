# 🎓 VidyaZen – Smart Institute Management System

A modern, full-stack school/institute management system built with Next.js 14, Prisma, and PostgreSQL. Deploy-ready for Vercel in minutes.

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 Multi-Role Auth | Admin, Teacher, Student, Parent portals with JWT sessions |
| 👨‍🎓 Students | Add, view, search students with class/parent linking |
| 👨‍🏫 Teachers | Teacher profiles, subject & class assignments |
| 📚 Classes | Grade/section management with class teacher |
| 📅 Attendance | Daily marking with bulk Present/Absent, visual report |
| 📊 Grades | Subject-wise exam results with auto grade calculation |
| 💰 Fees | Fee records, payment tracking, receipt management |
| 📢 Announcements | Targeted notices to roles (Student/Teacher/Parent/All) |
| 📆 Events | School calendar with holiday/exam/sport/cultural types |
| 📈 Reports | Analytics charts for attendance, fees, performance |
| 📱 Responsive | Fully mobile-first, works on phone + PC |

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1: Set Up Database (Neon - Free)

1. Go to **[neon.tech](https://neon.tech)** → Sign up free
2. Click **"New Project"** → Name it `vidyazen`
3. Copy the **Connection String** (looks like `postgresql://user:pass@ep-xxx.neon.tech/vidyazen?sslmode=require`)

### Step 2: Deploy to Vercel

1. Push this project to **GitHub**
2. Go to **[vercel.com](https://vercel.com)** → New Project → Import from GitHub
3. In **Environment Variables**, add:
   ```
   DATABASE_URL = postgresql://... (your Neon connection string)
   NEXTAUTH_SECRET = (generate: openssl rand -base64 32)
   NEXTAUTH_URL = https://your-app.vercel.app
   ```
4. Set **Build Command** to: `prisma generate && next build`
5. Click **Deploy** 🚀

### Step 3: Initialize Database

After deploy, run in your terminal (with the same DATABASE_URL):
```bash
npm install
npx prisma db push
npm run db:seed
```

---

## 🖥️ Local Development

```bash
# 1. Clone and install
git clone <your-repo>
cd vidyazen
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Set up database
npx prisma db push
npm run db:seed

# 4. Run dev server
npm run dev
# Open http://localhost:3000
```

---

## 🔑 Demo Login Credentials

After seeding, use these to log in:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@vidyazen.edu | admin@123 |
| **Teacher** | priya.math@vidyazen.edu | teacher@123 |
| **Student** | rahul.mehta@vidyazen.edu | student@123 |
| **Parent** | suresh.mehta@gmail.com | parent@123 |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **Auth**: NextAuth.js v4 with JWT
- **UI**: Tailwind CSS + Framer Motion animations
- **Charts**: Recharts
- **Hosting**: Vercel (serverless)
- **Icons**: Lucide React
- **Fonts**: Sora + DM Sans (Google Fonts)

---

## 📁 Project Structure

```
vidyazen/
├── prisma/
│   ├── schema.prisma       # Database models
│   └── seed.ts             # Demo data seeder
├── src/
│   ├── app/
│   │   ├── api/            # Backend API routes
│   │   │   ├── auth/       # NextAuth
│   │   │   ├── students/   # CRUD
│   │   │   ├── teachers/   # CRUD
│   │   │   ├── classes/    # CRUD
│   │   │   ├── attendance/ # Mark & view
│   │   │   ├── grades/     # CRUD
│   │   │   ├── fees/       # CRUD + payment
│   │   │   ├── announcements/
│   │   │   ├── events/
│   │   │   └── dashboard/  # Role-based stats
│   │   ├── auth/login/     # Login page
│   │   ├── dashboard/
│   │   │   ├── admin/      # Admin pages
│   │   │   ├── teacher/    # Teacher pages
│   │   │   ├── student/    # Student pages
│   │   │   └── parent/     # Parent pages
│   │   ├── page.tsx        # Landing page
│   │   └── layout.tsx      # Root layout
│   ├── components/
│   │   ├── layout/         # Sidebar, shell
│   │   └── ui/             # Reusable components
│   ├── lib/
│   │   ├── prisma.ts       # DB client
│   │   ├── auth.ts         # NextAuth config
│   │   └── utils.ts        # Helpers
│   └── middleware.ts        # Route protection
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── vercel.json
└── package.json
```

---

## 🧩 Customization Guide

### Adding a new module
1. Add model to `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Create API route in `src/app/api/your-module/route.ts`
4. Create page in `src/app/dashboard/admin/your-module/page.tsx`
5. Add nav link in `src/components/layout/dashboard-shell.tsx`

### Changing colors
Edit `tailwind.config.ts` → `brand` color palette to match your school's branding.

### Adding school logo
Replace `public/favicon.svg` with your logo SVG.

---

## 📞 Support

Built as a college project. For questions or customization, refer to the code comments throughout the project.

**Default Admin Login**: admin@vidyazen.edu / admin@123
