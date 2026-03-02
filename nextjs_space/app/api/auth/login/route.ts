import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { unidad: true },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inactivo" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        unidadId: usuario.unidadId,
        unidadNombre: usuario.unidad?.nombre || null,
        hasPin: !!usuario.pinCode,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error de autenticación" },
      { status: 500 }
    );
  }
}
