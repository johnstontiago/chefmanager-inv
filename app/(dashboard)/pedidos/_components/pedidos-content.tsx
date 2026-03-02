"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  History,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NuevoPedido from "./nuevo-pedido";
import HistorialPedidos from "./historial-pedidos";

interface PedidosContentProps {
  userRole: string;
}

export default function PedidosContent({ userRole }: PedidosContentProps) {
  const [activeTab, setActiveTab] = useState("nuevo");
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePedidoCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab("historial");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Pedidos</h1>
          <p className="text-slate-500">Crea y administra pedidos a proveedores</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="nuevo" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo Pedido</span>
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Historial</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nuevo" className="mt-6">
          <NuevoPedido onPedidoCreated={handlePedidoCreated} />
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <HistorialPedidos key={refreshKey} userRole={userRole} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
