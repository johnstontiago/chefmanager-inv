import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import DashboardContent from "./_components/dashboard-content";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <DashboardContent
      userRole={user?.rol || "viewer"}
      unidadNombre={user?.unidadNombre || "Sin unidad"}
      tieneUnidad={!!user?.unidadId}
    />
  );
}
