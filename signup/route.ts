import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nombre, rol, pin_code, unidadId } = body ?? {};

    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        rol: rol || "viewer",
        pinCode: pin_code || null,
        unidadId: unidadId ? parseInt(String(unidadId)) : null,
        activo: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en signup:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
