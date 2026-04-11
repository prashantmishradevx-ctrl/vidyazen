import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const role = (session.user as any).role;

  switch (role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "TEACHER":
      redirect("/dashboard/teacher");
    case "STUDENT":
      redirect("/dashboard/student");
    case "PARENT":
      redirect("/dashboard/parent");
    default:
      redirect("/auth/login");
  }
}
