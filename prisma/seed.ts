import 'dotenv/config';
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin@123", 10);
  const teacherPassword = await bcrypt.hash("teacher@123", 10);
  const studentPassword = await bcrypt.hash("student@123", 10);
  const parentPassword = await bcrypt.hash("parent@123", 10);         
  console.log("🌱 Seeding VidyaZen database...");

  // Create Admin
  
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@vidyazen.edu" },
    update: {},
    create: {
      name: "Dr. Rajesh Sharma",
      email: "admin@vidyazen.edu",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "+91 98765 43210",
      admin: {
        create: {
          employeeId: "ADM001",
          department: "Administration",
        },
      },
    },
  });

  // Create Teachers
  
  const teacher1User = await prisma.user.upsert({
    where: { email: "priya.math@vidyazen.edu" },
    update: {},
    create: {
      name: "Ms. Priya Patel",
      email: "priya.math@vidyazen.edu",
      password: teacherPassword,
      role: Role.TEACHER,
      phone: "+91 98765 11111",
      teacher: {
        create: {
          employeeId: "TCH001",
          qualification: "M.Sc Mathematics",
          experience: 8,
          specialization: "Mathematics",
          salary: 45000,
        },
      },
    },
  });

  const teacher2User = await prisma.user.upsert({
    where: { email: "amit.science@vidyazen.edu" },
    update: {},
    create: {
      name: "Mr. Amit Kumar",
      email: "amit.science@vidyazen.edu",
      password: teacherPassword,
      role: Role.TEACHER,
      phone: "+91 98765 22222",
      teacher: {
        create: {
          employeeId: "TCH002",
          qualification: "M.Sc Physics",
          experience: 5,
          specialization: "Science",
          salary: 42000,
        },
      },
    },
  });

  // Create Subjects
  const mathSubject = await prisma.subject.upsert({
    where: { code: "MATH10" },
    update: {},
    create: { name: "Mathematics", code: "MATH10", credits: 5 },
  });
  const scienceSubject = await prisma.subject.upsert({
    where: { code: "SCI10" },
    update: {},
    create: { name: "Science", code: "SCI10", credits: 5 },
  });
  const englishSubject = await prisma.subject.upsert({
    where: { code: "ENG10" },
    update: {},
    create: { name: "English", code: "ENG10", credits: 4 },
  });
  const historySubject = await prisma.subject.upsert({
    where: { code: "HIST10" },
    update: {},
    create: { name: "History", code: "HIST10", credits: 3 },
  });
  const computerSubject = await prisma.subject.upsert({
    where: { code: "COMP10" },
    update: {},
    create: { name: "Computer Science", code: "COMP10", credits: 4 },
  });

  // Get teacher records
  const teacher1 = await prisma.teacher.findUnique({ where: { userId: teacher1User.id } });
  const teacher2 = await prisma.teacher.findUnique({ where: { userId: teacher2User.id } });

  // Create Classes 1-12 and structured sections
  const classes = [];
  for (let grade = 1; grade <= 12; grade++) {
    const classRecord = await prisma.class.upsert({
      where: { grade_section_academicYear: { grade: String(grade), section: "ALL", academicYear: "2024-25" } },
      update: { name: `Class ${grade}`, className: `Class ${grade}` },
      create: {
        name: `Class ${grade}`,
        className: `Class ${grade}`,
        code: `CLASS${grade}`,
        grade: String(grade),
        section: "ALL",
        teacherId: grade % 2 === 0 ? teacher1!.id : teacher2!.id,
        capacity: 120,
        room: `Block ${grade}`,
        academicYear: "2024-25",
      },
    });

    classes.push(classRecord);

    const sectionNames = grade >= 9 ? ["A", "B", "C"] : ["A", "B"];
    for (const sectionName of sectionNames) {
      await prisma.section.upsert({
        where: { classId_sectionName: { classId: classRecord.id, sectionName } },
        update: {
          teacherId: sectionName === "A" ? teacher1!.id : teacher2!.id,
          room: `Room ${grade}${sectionName}`,
        },
        create: {
          classId: classRecord.id,
          sectionName,
          teacherId: sectionName === "A" ? teacher1!.id : teacher2!.id,
          room: `Room ${grade}${sectionName}`,
          capacity: 40,
        },
      });
    }
  }

  const class10 = classes[9];
  const class10A = await prisma.section.findUnique({ where: { classId_sectionName: { classId: class10.id, sectionName: "A" } } });

  // Link subjects to class
  const subjectsForClass = [mathSubject.id, scienceSubject.id, englishSubject.id, historySubject.id, computerSubject.id];
  for (const subjectId of subjectsForClass) {
    await prisma.classSubject.upsert({
      where: { classId_subjectId: { classId: class10.id, subjectId } },
      update: {},
      create: { classId: class10.id, subjectId },
    });
  }

  // Create Parents
  
  const parent1User = await prisma.user.upsert({
    where: { email: "suresh.mehta@gmail.com" },
    update: {},
    create: {
      name: "Mr. Suresh Mehta",
      email: "suresh.mehta@gmail.com",
      password: parentPassword,
      role: Role.PARENT,
      phone: "+91 99999 11111",
      parent: {
        create: {
          occupation: "Engineer",
          relation: "Father",
        },
      },
    },
  });

  const parent1 = await prisma.parent.findUnique({ where: { userId: parent1User.id } });

  // Create Students
  
  await prisma.user.upsert({
    where: { email: "rahul.mehta@vidyazen.edu" },
    update: {},
    create: {
      name: "Rahul Mehta",
      email: "rahul.mehta@vidyazen.edu",
      password: studentPassword,
      role: Role.STUDENT,
      dateOfBirth: new Date("2008-05-15"),
      student: {
        create: {
          studentId: "STU001",
          classId: class10.id,
          sectionId: class10A!.id,
          rollNumber: "01",
          parentId: parent1!.id,
          admissionDate: new Date("2022-06-01"),
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "ananya.sharma@vidyazen.edu" },
    update: {},
    create: {
      name: "Ananya Sharma",
      email: "ananya.sharma@vidyazen.edu",
      password: studentPassword,
      role: Role.STUDENT,
      dateOfBirth: new Date("2008-08-22"),
      student: {
        create: {
          studentId: "STU002",
          classId: class10.id,
          sectionId: class10A!.id,
          rollNumber: "02",
          admissionDate: new Date("2022-06-01"),
        },
      },
    },
  });

  // Create Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: "Annual Sports Day 2025",
        content: "We are excited to announce our Annual Sports Day on March 15, 2025. All students are encouraged to participate in various events including athletics, cricket, football, and indoor games.",
        authorId: adminUser.id,
        isPinned: true,
        publishedAt: new Date(),
      },
      {
        title: "Mid-Term Examination Schedule",
        content: "Mid-term examinations will be conducted from February 10-20, 2025. Students must carry their hall tickets and report 30 minutes before the exam.",
        authorId: adminUser.id,
        isPinned: true,
        publishedAt: new Date(),
      },
      {
        title: "Parent-Teacher Meeting",
        content: "Parent-Teacher Meeting is scheduled for January 25, 2025. All parents are requested to attend to discuss their ward's academic progress.",
        authorId: adminUser.id,
        isPinned: false,
        publishedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  // Create Events
  await prisma.event.createMany({
    data: [
      { title: "Republic Day Celebration", startDate: new Date("2025-01-26"), endDate: new Date("2025-01-26"), type: "holiday", location: "School Ground" },
      { title: "Science Exhibition", startDate: new Date("2025-02-05"), endDate: new Date("2025-02-07"), type: "cultural", location: "Main Hall" },
      { title: "Mid-Term Exams", startDate: new Date("2025-02-10"), endDate: new Date("2025-02-20"), type: "exam" },
      { title: "Holi Celebration", startDate: new Date("2025-03-14"), endDate: new Date("2025-03-14"), type: "holiday" },
      { title: "Annual Sports Day", startDate: new Date("2025-03-15"), endDate: new Date("2025-03-15"), type: "sport", location: "Sports Ground" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete!");
  console.log("\n📋 Login Credentials:");
  console.log("Admin: admin@vidyazen.edu / admin@123");
  console.log("Teacher: priya.math@vidyazen.edu / teacher@123");
  console.log("Student: rahul.mehta@vidyazen.edu / student@123");
  console.log("Parent: suresh.mehta@gmail.com / parent@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
