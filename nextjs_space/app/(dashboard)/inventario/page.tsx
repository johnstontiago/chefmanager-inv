import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/types";
import InventarioContent from "./_components/inventario-content";
import SinUnidadMessage from "../_components/sin-unidad-message";

export default async function InventarioPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!hasPermission(user?.rol || "viewer", "inventario")) {
    redirect("/dashboard");
  }

  if (!user?.unidadId) {
    return <SinUnidadMessage userRole={user?.rol || "viewer"} moduleName="el inventario" />;
  }

  return <InventarioContent userRole={user?.rol || "viewer"} />;
}
