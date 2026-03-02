import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/types";
import PedidosContent from "./_components/pedidos-content";
import SinUnidadMessage from "../_components/sin-unidad-message";

export default async function PedidosPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!hasPermission(user?.rol || "viewer", "pedidos")) {
    redirect("/dashboard");
  }

  if (!user?.unidadId) {
    return <SinUnidadMessage userRole={user?.rol || "viewer"} moduleName="los pedidos" />;
  }

  return <PedidosContent userRole={user?.rol || "viewer"} />;
}
