import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/types";
import AdminContent from "./_components/admin-content";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!hasPermission(user?.rol || "viewer", "admin")) {
    redirect("/dashboard");
  }

  return <AdminContent userRole={user?.rol || "viewer"} />;
}
