# VidyaZen

Smart institute management system built with Next.js, React, Prisma, MySQL, NextAuth, and Tailwind CSS.

## Features

- Role-based dashboards for admin, teacher, student, and parent
- Local MySQL database support through XAMPP
- Class 1 to Class 12 management
- Section management with teacher assignment
- Student, teacher, parent, attendance, grades, fees, events, and announcements modules
- Classroom features for classes, assignments, materials, submissions, grades, and notifications
- Basic WebRTC meeting flow with Socket.io signaling and chat
- Dashboard theme selector

## Requirements

- Node.js
- XAMPP MySQL
- npm

## Setup

Create a MySQL database named `vidyazen`, then configure:

```env
DATABASE_URL="mysql://root:@localhost:3306/vidyazen"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Install dependencies:

```bash
npm install
```

Push the Prisma schema and seed demo data:

```bash
npx prisma db push
npm run db:seed
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Demo Accounts

```text
Admin: admin@vidyazen.edu / admin@123
Teacher: priya.math@vidyazen.edu / teacher@123
Student: rahul.mehta@vidyazen.edu / student@123
Parent: suresh.mehta@gmail.com / parent@123
```

## Useful Commands

```bash
npm run dev
npm run build
npx prisma generate
npx prisma db push
npm run db:seed
```
