import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/types";
import RecepcionContent from "./_components/recepcion-content";
import SinUnidadMessage from "../_components/sin-unidad-message";

export default async function RecepcionPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!hasPermission(user?.rol || "viewer", "recepcion")) {
    redirect("/dashboard");
  }

  if (!user?.unidadId) {
    return <SinUnidadMessage userRole={user?.rol || "viewer"} moduleName="la recepción de pedidos" />;
  }

  return <RecepcionContent userRole={user?.rol || "viewer"} />;
}
