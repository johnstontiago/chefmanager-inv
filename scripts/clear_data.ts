import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log('Iniciando limpieza de datos...');
  
  // 1. Movimientos
  const movimientos = await prisma.movimiento.deleteMany({});
  console.log(`Movimientos eliminados: ${movimientos.count}`);
  
  // 2. Inventario
  const inventario = await prisma.inventario.deleteMany({});
  console.log(`Inventario eliminado: ${inventario.count}`);
  
  // 3. PedidoItems
  const pedidoItems = await prisma.pedidoItem.deleteMany({});
  console.log(`Items de pedidos eliminados: ${pedidoItems.count}`);
  
  // 4. Pedidos
  const pedidos = await prisma.pedido.deleteMany({});
  console.log(`Pedidos eliminados: ${pedidos.count}`);
  
  // 5. Productos
  const productos = await prisma.producto.deleteMany({});
  console.log(`Productos eliminados: ${productos.count}`);
  
  // 6. Proveedores
  const proveedores = await prisma.proveedor.deleteMany({});
  console.log(`Proveedores eliminados: ${proveedores.count}`);
  
  // 7. Categorias
  const categorias = await prisma.categoria.deleteMany({});
  console.log(`Categorías eliminadas: ${categorias.count}`);
  
  console.log('\n✅ Limpieza completada. Se mantienen usuarios y unidades.');
  
  const usuariosCount = await prisma.usuario.count();
  const unidadesCount = await prisma.unidad.count();
  console.log(`\nDatos restantes:`);
  console.log(`- Usuarios: ${usuariosCount}`);
  console.log(`- Unidades: ${unidadesCount}`);
}

clearData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
