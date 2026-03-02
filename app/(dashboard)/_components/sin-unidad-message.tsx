"use client";

import { useRouter } from "next/navigation";
import { Building2, AlertTriangle, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/types";

interface SinUnidadMessageProps {
  userRole: string;
  moduleName?: string;
}

export default function SinUnidadMessage({ userRole, moduleName = "esta funcionalidad" }: SinUnidadMessageProps) {
  const router = useRouter();
  const canManageUnits = hasPermission(userRole, "admin");

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-amber-800">
            Sin Unidad Asignada
          </h3>
          <p className="text-amber-700 max-w-md">
            Para usar {moduleName}, primero necesitas tener una unidad de negocio asignada.
            {canManageUnits
              ? " Como administrador, puedes crear una unidad desde el panel de administración."
              : " Contacta al administrador para que te asigne una unidad."}
          </p>
          {canManageUnits && (
            <Button
              onClick={() => router.push("/admin")}
              className="mt-4 bg-amber-600 hover:bg-amber-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Ir a Administración
            </Button>
          )}
          <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-100 px-4 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>Admin → Unidades → Crear nueva unidad</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
