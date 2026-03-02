import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/types";
import ConsumoContent from "./_components/consumo-content";
import SinUnidadMessage from "../_components/sin-unidad-message";

export default async function ConsumoPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!hasPermission(user?.rol || "viewer", "consumo")) {
    redirect("/dashboard");
  }

  if (!user?.unidadId) {
    return <SinUnidadMessage userRole={user?.rol || "viewer"} moduleName="el registro de consumo" />;
  }

  return <ConsumoContent userRole={user?.rol || "viewer"} />;
}
