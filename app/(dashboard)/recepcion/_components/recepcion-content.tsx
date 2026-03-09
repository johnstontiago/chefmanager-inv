"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Truck,
  History,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Eye,
  ArrowRight,
  QrCode,
  MapPin,
  Tag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, formatDecimal, toNumber, generateUniqueCode } from "@/lib/utils";

interface RecepcionContentProps {
  userRole: string;
}

export default function RecepcionContent({ userRole }: RecepcionContentProps) {
  const { toast } = useToast();
  const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
  const [historialRecepciones, setHistorialRecepciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [recepcionData, setRecepcionData] = useState<Record<number, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pedRes, movRes] = await Promise.all([
        fetch("/api/pedidos"),
        fetch("/api/movimientos?tipo=entrada&limit=50"),
      ]);

      if (pedRes.ok) {
        const data = await pedRes.json();
        const pedidos = data?.pedidos || [];
        setPedidosPendientes(pedidos.filter((p: any) => p.estado === "enviado"));
      }

      if (movRes.ok) {
        const data = await movRes.json();
        setHistorialRecepciones(data?.movimientos || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarRecepcion = (pedido: any) => {
    setSelectedPedido(pedido);
    // Initialize reception data for each item
    const initialData: Record<number, any> = {};
    pedido.items?.forEach((item: any) => {
      initialData[item.id] = {
        cantidadRecibida: toNumber(item.cantidad),
        lote: "",
        fechaCaducidad: "",
        ubicacion: "",
        codigoUnico: generateUniqueCode(),
        recibido: false,
      };
    });
    setRecepcionData(initialData);
  };

  const updateItemData = (itemId: number, field: string, value: any) => {
    setRecepcionData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const marcarRecibido = (itemId: number) => {
    setRecepcionData((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        recibido: true,
      },
    }));
  };

  const confirmarRecepcion = async () => {
    if (!selectedPedido) return;

    const itemsParaRecibir = selectedPedido.items?.filter(
      (item: any) => recepcionData[item.id]?.recibido
    );

    if (itemsParaRecibir.length === 0) {
      toast({ title: "Marca al menos un producto como recibido", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);

      // Process each item
      for (const item of itemsParaRecibir) {
        const data = recepcionData[item.id];

        // Create inventory entry
        await fetch("/api/inventario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productoId: item.productoId,
            cantidad: data.cantidadRecibida,
            lote: data.lote || null,
            fechaCaducidad: data.fechaCaducidad || null,
            ubicacion: data.ubicacion || null,
            codigoUnico: data.codigoUnico,
          }),
        });

        // Create movement
        await fetch("/api/movimientos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productoId: item.productoId,
            tipo: "entrada",
            cantidad: data.cantidadRecibida,
            lote: data.lote || null,
            notas: `Recepción pedido #${selectedPedido.id}`,
          }),
        });
      }

      // Mark order as received when confirming reception
      await fetch(`/api/pedidos/${selectedPedido.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "recibido" }),
      });

      toast({
        title: "Recepción completada",
        description: `${itemsParaRecibir.length} producto(s) recibido(s)`,
      });

      setSelectedPedido(null);
      setRecepcionData({});
      fetchData();
    } catch (error) {
      toast({ title: "Error al procesar recepción", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Recepción de Mercancía</h1>
        <p className="text-slate-500">Recibe y registra la mercancía de los pedidos</p>
      </div>

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes" className="flex items-center space-x-2">
            <Truck className="w-4 h-4" />
            <span>Pendientes ({pedidosPendientes.length})</span>
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Historial</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-6">
          {pedidosPendientes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-slate-800">Todo al día</h3>
                <p className="text-slate-500">No hay pedidos pendientes de recibir</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pedidosPendientes.map((pedido) => (
                <Card key={pedido.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-bold text-xl">Pedido #{pedido.id}</span>
                          <Badge className="bg-blue-100 text-blue-700">Enviado</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(pedido.fechaPedido)}
                          </span>
                          <span className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {pedido.items?.length || 0} productos
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(pedido.total)}
                          </span>
                        </div>
                        {pedido.notas && (
                          <p className="text-sm text-slate-500 mt-2">{pedido.notas}</p>
                        )}
                      </div>
                      <Button onClick={() => iniciarRecepcion(pedido)} className="bg-green-600 hover:bg-green-700">
                        Recibir Mercancía
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Recepciones</CardTitle>
            </CardHeader>
            <CardContent>
              {historialRecepciones.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No hay recepciones registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historialRecepciones.map((mov) => (
                    <div key={mov.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{mov.producto?.nombre}</p>
                          <p className="text-sm text-slate-500">
                            {formatDecimal(mov.cantidad)} {mov.producto?.unidadMedida} • Lote: {mov.lote || "-"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">{formatDate(mov.fecha)}</p>
                        <p className="text-xs text-slate-400">{mov.usuario?.nombre}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reception Dialog */}
      <Dialog open={!!selectedPedido} onOpenChange={() => setSelectedPedido(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-green-600" />
              <span>Recepción - Pedido #{selectedPedido?.id}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedPedido && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Instrucciones:</strong> Completa los datos de cada producto recibido y márcalo como recibido.
                  Puedes ajustar la cantidad si difiere de lo pedido.
                </p>
              </div>

              <div className="space-y-4">
                {selectedPedido.items?.map((item: any) => {
                  const data = recepcionData[item.id] || {};
                  const isRecibido = data.recibido;

                  return (
                    <Card key={item.id} className={isRecibido ? "border-green-300 bg-green-50" : ""}>
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          {/* Product Info */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg">{item.producto?.nombre}</h4>
                              {isRecibido && (
                                <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Recibido</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">
                              Pedido: {formatDecimal(item.cantidad)} {item.producto?.unidadMedida} •{" "}
                              {formatCurrency(item.precioUnitario)} c/u
                            </p>
                          </div>

                          {/* Reception Form */}
                          {!isRecibido && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
                              <div>
                                <Label className="text-xs">Cantidad</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={data.cantidadRecibida || ""}
                                  onChange={(e) => updateItemData(item.id, "cantidadRecibida", parseFloat(e.target.value) || 0)}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Lote</Label>
                                <Input
                                  placeholder="LOT-XXX"
                                  value={data.lote || ""}
                                  onChange={(e) => updateItemData(item.id, "lote", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Caducidad</Label>
                                <Input
                                  type="date"
                                  value={data.fechaCaducidad || ""}
                                  onChange={(e) => updateItemData(item.id, "fechaCaducidad", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Ubicación</Label>
                                <Input
                                  placeholder="Cámara 1"
                                  value={data.ubicacion || ""}
                                  onChange={(e) => updateItemData(item.id, "ubicacion", e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  size="sm"
                                  onClick={() => marcarRecibido(item.id)}
                                  className="w-full bg-green-600 hover:bg-green-700 h-9"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Recibir
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Show received data */}
                          {isRecibido && (
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center">
                                <Package className="w-4 h-4 mr-1 text-slate-400" />
                                {formatDecimal(data.cantidadRecibida)} {item.producto?.unidadMedida}
                              </span>
                              {data.lote && (
                                <span className="flex items-center">
                                  <Tag className="w-4 h-4 mr-1 text-slate-400" />
                                  {data.lote}
                                </span>
                              )}
                              {data.ubicacion && (
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                                  {data.ubicacion}
                                </span>
                              )}
                              <span className="flex items-center">
                                <QrCode className="w-4 h-4 mr-1 text-slate-400" />
                                {data.codigoUnico}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">
                      {Object.values(recepcionData).filter((d: any) => d.recibido).length} de{" "}
                      {selectedPedido.items?.length} productos marcados como recibidos
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setSelectedPedido(null)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={confirmarRecepcion}
                      disabled={saving || Object.values(recepcionData).filter((d: any) => d.recibido).length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Confirmar Recepción
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
